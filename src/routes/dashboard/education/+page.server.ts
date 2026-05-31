/**
 * dashboard/education/+page.server.ts
 *
 * [skill: typescript-advanced-types]
 */
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { EducationActionData, Education } from '$lib/types/education';

const CV_BUCKET = 'documents';

// ── Utilidad para subir archivos a Supabase Storage ───────────────────────
async function uploadFile(
	bucket: string,
	path: string,
	file: File
): Promise<{ url: string } | { error: string }> {
	const { error } = await supabaseAdmin.storage
		.from(bucket)
		.upload(path, file, { upsert: true, contentType: file.type });

	if (error) return { error: error.message };

	const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
	return { url: data.publicUrl };
}

export const load: PageServerLoad = async () => {
	const { data, error } = await supabaseAdmin
		.from('education')
		.select('*')
		.order('sort_order', { ascending: true });

	if (error) {
		console.error('[education/load]', error.message);
		return { education: [] };
	}

	return { education: (data as Education[]) };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		
		const is_current = formData.get('is_current') === 'on' || formData.get('is_current') === 'true';
		const degree = formData.get('degree') as string;
		const institution = formData.get('institution') as string;
		const start_date = formData.get('start_date') as string;
		const end_date = is_current ? null : (formData.get('end_date') as string || null);
		const description = formData.get('description') as string;
		const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0;

		let certificate_url: string | null = null;
		
		const certFile = formData.get('certificate_file') as File | null;
		if (certFile && certFile.size > 0) {
			const timestamp = Date.now();
			const result = await uploadFile(CV_BUCKET, `cert_${timestamp}.pdf`, certFile);
			if ('error' in result) {
				const actionData: EducationActionData = { result: { type: 'error', message: `Error subiendo certificado: ${result.error}` } };
				return fail(500, actionData as unknown as Record<string, unknown>);
			}
			certificate_url = result.url;
		}

		const { error } = await supabaseAdmin
			.from('education')
			.insert({ degree, institution, start_date, end_date, is_current, description, certificate_url, sort_order });

		if (error) {
			console.error('[education/add]', error.message);
			const actionData: EducationActionData = { result: { type: 'error', message: 'Error al añadir educación.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: EducationActionData = { result: { type: 'success', message: 'Educación añadida.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		
		const is_current = formData.get('is_current') === 'on' || formData.get('is_current') === 'true';
		const degree = formData.get('degree') as string;
		const institution = formData.get('institution') as string;
		const start_date = formData.get('start_date') as string;
		const end_date = is_current ? null : (formData.get('end_date') as string || null);
		const description = formData.get('description') as string;
		const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0;
		const remove_certificate = formData.get('remove_certificate') === 'true';

		let certificate_url = formData.get('certificate_url_current') as string | null;
		if (remove_certificate) {
			certificate_url = null;
		}

		const certFile = formData.get('certificate_file') as File | null;
		if (certFile && certFile.size > 0) {
			const timestamp = Date.now();
			const result = await uploadFile(CV_BUCKET, `cert_${timestamp}.pdf`, certFile);
			if ('error' in result) {
				const actionData: EducationActionData = { result: { type: 'error', message: `Error subiendo certificado: ${result.error}` } };
				return fail(500, actionData as unknown as Record<string, unknown>);
			}
			certificate_url = result.url;
		}

		const { error } = await supabaseAdmin
			.from('education')
			.update({ degree, institution, start_date, end_date, is_current, description, certificate_url, sort_order })
			.eq('id', id);

		if (error) {
			console.error('[education/edit]', error.message);
			const actionData: EducationActionData = { result: { type: 'error', message: 'Error al actualizar educación.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: EducationActionData = { result: { type: 'success', message: 'Educación actualizada.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const { error } = await supabaseAdmin
			.from('education')
			.delete()
			.eq('id', id);

		if (error) {
			console.error('[education/delete]', error.message);
			const actionData: EducationActionData = { result: { type: 'error', message: 'Error al eliminar educación.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: EducationActionData = { result: { type: 'success', message: 'Educación eliminada.' } };
		return actionData as unknown as Record<string, unknown>;
	}
};
