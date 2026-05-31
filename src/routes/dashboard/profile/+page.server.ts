/**
 * dashboard/profile/+page.server.ts
 *
 * [skill: typescript-advanced-types]
 *  - Retorna ProfilePageData tipado desde load()
 *  - ProfileActionResult: discriminated union → el componente hace narrowing
 *  - Uso de `fail()` con tipo explícito para errores de Form Action
 *  - Sin `any` — todos los tipos derivados de Profile
 *
 * Comportamiento:
 *  - load(): fetch del único registro `profile`. null si no existe.
 *  - action `save`: 
 *      1. Sube foto a bucket "portfolio-images" si se adjunta archivo
 *      2. Sube PDF a bucket "documents" si se adjunta archivo
 *      3. Upsert del registro (INSERT si no existe, UPDATE si existe)
 *  - Usa supabaseAdmin (service_role) para todas las escrituras.
 */
import { fail }         from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { Profile, ProfileActionData } from '$lib/types/profile';

// ── Nombre del bucket y carpeta de imágenes ───────────────────────────────
const PHOTO_BUCKET = 'portfolio-images';
const CV_BUCKET    = 'documents';

// ── Utilidad: sube un File a Supabase Storage y devuelve la URL pública ────
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

// ── load: fetch del único registro de perfil ─────────────────────────────
export const load: PageServerLoad = async () => {
	const { data, error } = await supabaseAdmin
		.from('profile')
		.select('*')
		.limit(1)
		.maybeSingle();

	if (error) {
		console.error('[profile/load]', error.message);
		return { profile: null };
	}

	return { profile: (data as Profile | null) };
};

// ── actions ────────────────────────────────────────────────────────────────
export const actions: Actions = {
	/**
	 * action `save`: upsert del perfil + uploads opcionales de foto y CV.
	 * Retorna ProfileActionData con discriminated union para el toast del cliente.
	 */
	save: async ({ request }) => {
		const formData = await request.formData();

		// ── Leer campos de texto ────────────────────────────────────────────
		const id        = formData.get('id')        as string | null;
		const name      = formData.get('name')      as string;
		const role      = formData.get('role')      as string;
		const tagline   = formData.get('tagline')   as string;
		const about     = formData.get('about')     as string;
		const email     = formData.get('email')     as string;
		const location  = formData.get('location')  as string;
		let photo_url   = formData.get('photo_url_current')  as string | null;
		let cv_pdf_url  = formData.get('cv_pdf_url_current') as string | null;

		// Limpiar strings vacíos → null
		photo_url  = photo_url  || null;
		cv_pdf_url = cv_pdf_url || null;

		// ── Subir foto si se adjuntó ────────────────────────────────────────
		const photoFile = formData.get('photo_file') as File | null;
		if (photoFile && photoFile.size > 0) {
			const ext    = photoFile.name.split('.').pop() ?? 'webp';
			const result = await uploadFile(PHOTO_BUCKET, `avatar.${ext}`, photoFile);
			if ('error' in result) {
				const actionData: ProfileActionData = {
					result: { type: 'error', message: `Error subiendo foto: ${result.error}` }
				};
		return fail(500, actionData as unknown as Record<string, unknown>);
			}
			photo_url = result.url;
		}

		// ── Subir PDF si se adjuntó ─────────────────────────────────────────
		const cvFile = formData.get('cv_file') as File | null;
		if (cvFile && cvFile.size > 0) {
			const result = await uploadFile(CV_BUCKET, 'cv.pdf', cvFile);
			if ('error' in result) {
				const actionData: ProfileActionData = {
					result: { type: 'error', message: `Error subiendo CV: ${result.error}` }
				};
		return fail(500, actionData as unknown as Record<string, unknown>);
			}
			cv_pdf_url = result.url;
		}

		// ── Upsert del registro ─────────────────────────────────────────────
		// Si `id` existe → UPDATE; si no → INSERT (Supabase upsert con onConflict).
		const payload: Omit<Partial<Profile>, 'id' | 'updated_at'> & { id?: string; updated_at: string } = {
			name, role, tagline, about, email, location,
			photo_url, cv_pdf_url,
			updated_at: new Date().toISOString(),
			...(id ? { id } : {}),
		};

		const { error: upsertError } = await supabaseAdmin
			.from('profile')
			.upsert(payload, { onConflict: 'id' });

		if (upsertError) {
			console.error('[profile/save]', upsertError.message);
			const actionData: ProfileActionData = {
				result: { type: 'error', message: 'No se pudo guardar el perfil. Inténtalo de nuevo.' }
			};
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: ProfileActionData = {
			result: { type: 'success', message: 'Perfil actualizado correctamente.' }
		};
		return actionData as unknown as Record<string, unknown>;
	}
};
