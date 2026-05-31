/**
 * dashboard/diplomas/+page.server.ts
 *
 * [skill: typescript-advanced-types]
 */
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { DiplomaActionData, Diploma } from '$lib/types/diploma';

const CV_BUCKET = 'documents';

// ── Utilidades de Storage ──────────────────────────────────────────────────
async function uploadFile(bucket: string, path: string, file: File): Promise<{ url: string } | { error: string }> {
	const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
	if (error) return { error: error.message };
	const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
	return { url: data.publicUrl };
}

async function deleteFileFromUrl(bucket: string, url: string) {
	try {
		// La URL tiene formato: https://[...]/storage/v1/object/public/documents/filename.webp
		const filename = url.split('/').pop();
		if (filename) {
			await supabaseAdmin.storage.from(bucket).remove([filename]);
		}
	} catch (err) {
		console.error('[diplomas/deleteFile]', err);
	}
}

export const load: PageServerLoad = async () => {
	const { data, error } = await supabaseAdmin
		.from('diplomas')
		.select('*')
		.order('sort_order', { ascending: true });

	if (error) {
		console.error('[diplomas/load]', error.message);
		return { diplomas: [] };
	}

	return { diplomas: (data as Diploma[]) };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		
		const name = formData.get('name') as string;
		const issuer = formData.get('issuer') as string;
		const issue_date = formData.get('issue_date') as string;
		const description = (formData.get('description') as string) || null;
		const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0;

		const certFile = formData.get('pdf_file') as File | null;
		if (!certFile || certFile.size === 0) {
			const actionData: DiplomaActionData = { result: { type: 'error', message: 'La imagen .webp es obligatoria para un nuevo diploma.' } };
			return fail(400, actionData as unknown as Record<string, unknown>);
		}

		const timestamp = Date.now();
		const result = await uploadFile(CV_BUCKET, `diploma_${timestamp}.webp`, certFile);
		if ('error' in result) {
			const actionData: DiplomaActionData = { result: { type: 'error', message: `Error subiendo imagen: ${result.error}` } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}
		
		const pdf_url = result.url;

		const { error } = await supabaseAdmin
			.from('diplomas')
			.insert({ name, issuer, issue_date, description, pdf_url, sort_order });

		if (error) {
			console.error('[diplomas/add]', error.message);
			const actionData: DiplomaActionData = { result: { type: 'error', message: 'Error al añadir diploma.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: DiplomaActionData = { result: { type: 'success', message: 'Diploma añadido.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		
		const name = formData.get('name') as string;
		const issuer = formData.get('issuer') as string;
		const issue_date = formData.get('issue_date') as string;
		const description = (formData.get('description') as string) || null;
		const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0;

		let pdf_url = formData.get('pdf_url_current') as string;

		const certFile = formData.get('pdf_file') as File | null;
		if (certFile && certFile.size > 0) {
			// Subir el nuevo archivo
			const timestamp = Date.now();
			const result = await uploadFile(CV_BUCKET, `diploma_${timestamp}.webp`, certFile);
			if ('error' in result) {
				const actionData: DiplomaActionData = { result: { type: 'error', message: `Error subiendo nueva imagen: ${result.error}` } };
				return fail(500, actionData as unknown as Record<string, unknown>);
			}
			
			// Eliminar el archivo viejo de storage si existe
			if (pdf_url) {
				await deleteFileFromUrl(CV_BUCKET, pdf_url);
			}

			pdf_url = result.url;
		}

		const { error } = await supabaseAdmin
			.from('diplomas')
			.update({ name, issuer, issue_date, description, pdf_url, sort_order })
			.eq('id', id);

		if (error) {
			console.error('[diplomas/edit]', error.message);
			const actionData: DiplomaActionData = { result: { type: 'error', message: 'Error al actualizar diploma.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: DiplomaActionData = { result: { type: 'success', message: 'Diploma actualizado.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		// Obtener la URL antes de eliminar para borrar el archivo del storage
		const { data: diploma } = await supabaseAdmin.from('diplomas').select('pdf_url').eq('id', id).single();

		const { error } = await supabaseAdmin.from('diplomas').delete().eq('id', id);

		if (error) {
			console.error('[diplomas/delete]', error.message);
			const actionData: DiplomaActionData = { result: { type: 'error', message: 'Error al eliminar diploma.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		// Eliminar del bucket
		if (diploma?.pdf_url) {
			await deleteFileFromUrl(CV_BUCKET, diploma.pdf_url);
		}

		const actionData: DiplomaActionData = { result: { type: 'success', message: 'Diploma eliminado.' } };
		return actionData as unknown as Record<string, unknown>;
	}
};
