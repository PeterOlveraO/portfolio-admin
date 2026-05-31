/**
 * dashboard/skills/+page.server.ts
 *
 * [skill: typescript-advanced-types]
 *  - load() devuelve SkillsPageData (categorías y skills)
 *  - actions (add/edit/delete para ambos) devuelven SkillsActionData
 */
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { SkillCategory, Skill, SkillsActionData } from '$lib/types/skills';

// ── load: fetch de categorías y skills ────────────────────────────────────
export const load: PageServerLoad = async () => {
	const [catRes, skillRes] = await Promise.all([
		supabaseAdmin.from('skill_categories').select('*').order('sort_order', { ascending: true }),
		supabaseAdmin.from('skills').select('*').order('sort_order', { ascending: true })
	]);

	if (catRes.error) console.error('[skills/load categories]', catRes.error.message);
	if (skillRes.error) console.error('[skills/load skills]', skillRes.error.message);

	return {
		categories: (catRes.data || []) as SkillCategory[],
		skills: (skillRes.data || []) as Skill[]
	};
};

export const actions: Actions = {
	// ── CATEGORÍAS ─────────────────────────────────────────────────────────
	add_category: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0;

		const { error } = await supabaseAdmin.from('skill_categories').insert({ name, sort_order });

		if (error) {
			console.error('[skills/add_category]', error.message);
			const actionData: SkillsActionData = { result: { type: 'error', message: 'Error al añadir categoría.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: SkillsActionData = { result: { type: 'success', message: 'Categoría añadida.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	edit_category: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0;

		const { error } = await supabaseAdmin.from('skill_categories').update({ name, sort_order }).eq('id', id);

		if (error) {
			console.error('[skills/edit_category]', error.message);
			const actionData: SkillsActionData = { result: { type: 'error', message: 'Error al actualizar categoría.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: SkillsActionData = { result: { type: 'success', message: 'Categoría actualizada.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	delete_category: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const { error } = await supabaseAdmin.from('skill_categories').delete().eq('id', id);

		if (error) {
			console.error('[skills/delete_category]', error.message);
			const actionData: SkillsActionData = { result: { type: 'error', message: 'Error al eliminar categoría.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: SkillsActionData = { result: { type: 'success', message: 'Categoría eliminada.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	// ── SKILLS ──────────────────────────────────────────────────────────────
	add_skill: async ({ request }) => {
		const formData = await request.formData();
		const category_id = formData.get('category_id') as string;
		const name = formData.get('name') as string;
		const icon_url = (formData.get('icon_url') as string) || null;
		const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0;

		const { error } = await supabaseAdmin.from('skills').insert({ category_id, name, icon_url, sort_order });

		if (error) {
			console.error('[skills/add_skill]', error.message);
			const actionData: SkillsActionData = { result: { type: 'error', message: 'Error al añadir habilidad.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: SkillsActionData = { result: { type: 'success', message: 'Habilidad añadida.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	edit_skill: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const icon_url = (formData.get('icon_url') as string) || null;
		const sort_order = parseInt(formData.get('sort_order') as string, 10) || 0;

		const { error } = await supabaseAdmin.from('skills').update({ name, icon_url, sort_order }).eq('id', id);

		if (error) {
			console.error('[skills/edit_skill]', error.message);
			const actionData: SkillsActionData = { result: { type: 'error', message: 'Error al actualizar habilidad.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: SkillsActionData = { result: { type: 'success', message: 'Habilidad actualizada.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	delete_skill: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const { error } = await supabaseAdmin.from('skills').delete().eq('id', id);

		if (error) {
			console.error('[skills/delete_skill]', error.message);
			const actionData: SkillsActionData = { result: { type: 'error', message: 'Error al eliminar habilidad.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: SkillsActionData = { result: { type: 'success', message: 'Habilidad eliminada.' } };
		return actionData as unknown as Record<string, unknown>;
	}
};
