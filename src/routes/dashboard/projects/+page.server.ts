/**
 * dashboard/projects/+page.server.ts
 *
 * [skill: typescript-advanced-types]
 */
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { ProjectActionData, ProjectWithRelations } from '$lib/types/projects';

const IMG_BUCKET = 'portfolio-images';

// ── Utilidades de Storage ──────────────────────────────────────────────────
async function uploadFile(bucket: string, path: string, file: File): Promise<{ url: string } | { error: string }> {
	const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
	if (error) return { error: error.message };
	const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
	return { url: data.publicUrl };
}

async function deleteFileFromUrl(bucket: string, url: string) {
	try {
		const filename = url.split('/').pop();
		if (filename) {
			await supabaseAdmin.storage.from(bucket).remove([filename]);
		}
	} catch (err) {
		console.error('[projects/deleteFile]', err);
	}
}

// ── Load ───────────────────────────────────────────────────────────────────
export const load: PageServerLoad = async () => {
	const { data, error } = await supabaseAdmin
		.from('projects')
		.select(`
			*,
			images:project_images(*),
			technologies:project_technologies(*),
			contributions:project_contributions(*)
		`)
		.order('sort_order', { ascending: true });

	if (error) {
		console.error('[projects/load]', error.message);
		return { projects: [] };
	}

	const projects = (data as ProjectWithRelations[]).map(p => ({
		...p,
		images: p.images ? [...p.images].sort((a, b) => a.sort_order - b.sort_order) : [],
		technologies: p.technologies ? [...p.technologies].sort((a, b) => a.sort_order - b.sort_order) : [],
		contributions: p.contributions ? [...p.contributions].sort((a, b) => a.sort_order - b.sort_order) : []
	}));

	return { projects };
};

// ── Helpers de Sincronización ──────────────────────────────────────────────
async function syncTechnologies(projectId: string, techs: string[]) {
	await supabaseAdmin.from('project_technologies').delete().eq('project_id', projectId);
	if (techs.length > 0) {
		const rows = techs.map((name, index) => ({ project_id: projectId, name, sort_order: (index + 1) * 10 }));
		await supabaseAdmin.from('project_technologies').insert(rows);
	}
}

async function syncContribution(projectId: string, is_team: boolean, contribution: string) {
	await supabaseAdmin.from('project_contributions').delete().eq('project_id', projectId);
	if (is_team && contribution.trim()) {
		await supabaseAdmin.from('project_contributions').insert({
			project_id: projectId,
			description: contribution.trim(),
			sort_order: 10
		});
	}
}

async function handleImagesUpload(projectId: string, files: File[], currentMaxSort: number = 0) {
	const validFiles = files.filter(f => f.size > 0);
	if (validFiles.length === 0) return;

	for (let i = 0; i < validFiles.length; i++) {
		const file = validFiles[i];
		const timestamp = Date.now();
		// Evitar colisiones si se procesan muy rápido
		const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
		const result = await uploadFile(IMG_BUCKET, `proj_${projectId}_${timestamp}_${safeName}`, file);
		
		if (!('error' in result)) {
			await supabaseAdmin.from('project_images').insert({
				project_id: projectId,
				url: result.url,
				sort_order: currentMaxSort + ((i + 1) * 10)
			});
		} else {
			console.error('[projects/uploadImage]', result.error);
		}
	}
}

// ── Actions ────────────────────────────────────────────────────────────────
export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const repo_url = (formData.get('repo_url') as string) || null;
		const live_url = (formData.get('live_url') as string) || null;
		const is_featured = formData.get('is_featured') === 'on' || formData.get('is_featured') === 'true';
		const is_team = formData.get('is_team') === 'on' || formData.get('is_team') === 'true';
		const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0;
		
		const technologies = JSON.parse((formData.get('technologies') as string) || '[]') as string[];
		const contribution_desc = formData.get('contribution_desc') as string;
		const imageFiles = formData.getAll('images_files') as File[];

		// 1. Insertar Proyecto
		const { data: projData, error: projError } = await supabaseAdmin
			.from('projects')
			.insert({ name, description, repo_url, live_url, is_featured, is_team, sort_order })
			.select('id')
			.single();

		if (projError || !projData) {
			console.error('[projects/add]', projError?.message);
			const actionData: ProjectActionData = { result: { type: 'error', message: 'Error al añadir proyecto.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		// 2. Sincronizar relaciones y archivos
		await syncTechnologies(projData.id, technologies);
		await syncContribution(projData.id, is_team, contribution_desc);
		await handleImagesUpload(projData.id, imageFiles);

		const actionData: ProjectActionData = { result: { type: 'success', message: 'Proyecto añadido correctamente.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const repo_url = (formData.get('repo_url') as string) || null;
		const live_url = (formData.get('live_url') as string) || null;
		const is_featured = formData.get('is_featured') === 'on' || formData.get('is_featured') === 'true';
		const is_team = formData.get('is_team') === 'on' || formData.get('is_team') === 'true';
		const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0;
		
		const technologies = JSON.parse((formData.get('technologies') as string) || '[]') as string[];
		const contribution_desc = formData.get('contribution_desc') as string;
		const deleted_images_ids = JSON.parse((formData.get('deleted_images_ids') as string) || '[]') as string[];
		const imageFiles = formData.getAll('images_files') as File[];

		// 1. Actualizar Proyecto base
		const { error } = await supabaseAdmin
			.from('projects')
			.update({ name, description, repo_url, live_url, is_featured, is_team, sort_order })
			.eq('id', id);

		if (error) {
			console.error('[projects/edit]', error.message);
			const actionData: ProjectActionData = { result: { type: 'error', message: 'Error al actualizar proyecto.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		// 2. Eliminar imágenes marcadas (DB + Storage)
		if (deleted_images_ids.length > 0) {
			// Obtener URLs para borrar de Storage
			const { data: imagesToDelete } = await supabaseAdmin.from('project_images').select('url').in('id', deleted_images_ids);
			if (imagesToDelete) {
				for (const img of imagesToDelete) {
					await deleteFileFromUrl(IMG_BUCKET, img.url);
				}
			}
			await supabaseAdmin.from('project_images').delete().in('id', deleted_images_ids);
		}

		// 3. Sincronizar relaciones
		await syncTechnologies(id, technologies);
		await syncContribution(id, is_team, contribution_desc);

		// 4. Subir nuevas imágenes (calcular max sort_order actual para apendarlas)
		const { data: existingImages } = await supabaseAdmin.from('project_images').select('sort_order').eq('project_id', id).order('sort_order', { ascending: false }).limit(1);
		const currentMaxSort = existingImages && existingImages.length > 0 ? existingImages[0].sort_order : 0;
		await handleImagesUpload(id, imageFiles, currentMaxSort);

		const actionData: ProjectActionData = { result: { type: 'success', message: 'Proyecto actualizado.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		// 1. Obtener todas las imágenes para borrarlas de Storage
		const { data: images } = await supabaseAdmin.from('project_images').select('url').eq('project_id', id);

		// 2. Eliminar de DB (asumiendo cascade delete configurado en Supabase para relaciones)
		const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);

		if (error) {
			console.error('[projects/delete]', error.message);
			const actionData: ProjectActionData = { result: { type: 'error', message: 'Error al eliminar proyecto.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		// 3. Borrar de Storage
		if (images && images.length > 0) {
			for (const img of images) {
				await deleteFileFromUrl(IMG_BUCKET, img.url);
			}
		}

		const actionData: ProjectActionData = { result: { type: 'success', message: 'Proyecto eliminado.' } };
		return actionData as unknown as Record<string, unknown>;
	}
};
