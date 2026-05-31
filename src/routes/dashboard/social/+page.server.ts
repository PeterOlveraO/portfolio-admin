/**
 * dashboard/social/+page.server.ts
 *
 * [skill: typescript-advanced-types]
 *  - load() devuelve SocialPageData
 *  - actions (add, edit, delete) devuelven SocialActionData con discriminated union
 *  - Casts estructurados para evitar type overlaps
 */
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { SocialLink, SocialActionData } from '$lib/types/social';

// ── load: fetch de redes sociales ──────────────────────────────────────────
export const load: PageServerLoad = async () => {
	const { data, error } = await supabaseAdmin
		.from('social_links')
		.select('*')
		.order('sort_order', { ascending: true });

	if (error) {
		console.error('[social/load]', error.message);
		return { socialLinks: [] };
	}

	return { socialLinks: (data as SocialLink[]) };
};

// ── helpers para extraer datos comunes ─────────────────────────────────────
function extractData(formData: FormData) {
	return {
		platform:   formData.get('platform')   as string,
		url:        formData.get('url')        as string,
		icon_key:   formData.get('icon_key')   as string,
		sort_order: parseInt(formData.get('sort_order') as string, 10) || 0
	};
}

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		const { platform, url, icon_key, sort_order } = extractData(formData);

		const { error } = await supabaseAdmin
			.from('social_links')
			.insert({ platform, url, icon_key, sort_order });

		if (error) {
			console.error('[social/add]', error.message);
			const actionData: SocialActionData = {
				result: { type: 'error', message: 'Error al añadir red social.' }
			};
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: SocialActionData = {
			result: { type: 'success', message: 'Red social añadida correctamente.' }
		};
		return actionData as unknown as Record<string, unknown>;
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const { platform, url, icon_key, sort_order } = extractData(formData);

		const { error } = await supabaseAdmin
			.from('social_links')
			.update({ platform, url, icon_key, sort_order })
			.eq('id', id);

		if (error) {
			console.error('[social/edit]', error.message);
			const actionData: SocialActionData = {
				result: { type: 'error', message: 'Error al actualizar red social.' }
			};
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: SocialActionData = {
			result: { type: 'success', message: 'Red social actualizada.' }
		};
		return actionData as unknown as Record<string, unknown>;
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const { error } = await supabaseAdmin
			.from('social_links')
			.delete()
			.eq('id', id);

		if (error) {
			console.error('[social/delete]', error.message);
			const actionData: SocialActionData = {
				result: { type: 'error', message: 'Error al eliminar red social.' }
			};
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: SocialActionData = {
			result: { type: 'success', message: 'Red social eliminada.' }
		};
		return actionData as unknown as Record<string, unknown>;
	}
};
