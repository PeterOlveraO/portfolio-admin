/**
 * dashboard/experience/+page.server.ts
 *
 * [skill: typescript-advanced-types]
 *  - Relación uno a muchos: Experiencia -> Tecnologías
 *  - actions (add, edit, delete) devuelven ExperienceActionData
 */
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { ExperienceActionData, WorkExperienceWithTech } from '$lib/types/experience';

export const load: PageServerLoad = async () => {
	// Realizamos un join para traer cada experiencia y sus tecnologías relacionadas
	const { data, error } = await supabaseAdmin
		.from('work_experience')
		.select(`
			*,
			technologies:work_experience_technologies(*)
		`)
		.order('sort_order', { ascending: true });

	if (error) {
		console.error('[experience/load]', error.message);
		return { experiences: [] };
	}

	// Ordenamos las tecnologías internamente (Supabase a veces no permite order() sobre relaciones 1:N sin sintaxis específica)
	const experiences = (data as WorkExperienceWithTech[]).map(exp => ({
		...exp,
		technologies: exp.technologies ? [...exp.technologies].sort((a, b) => a.sort_order - b.sort_order) : []
	}));

	return { experiences };
};

// ── helpers ─────────────────────────────────────────────────────────────
function extractData(formData: FormData) {
	const is_current = formData.get('is_current') === 'on' || formData.get('is_current') === 'true';
	return {
		job_title:   formData.get('job_title')   as string,
		company:     formData.get('company')     as string,
		start_date:  formData.get('start_date')  as string,
		end_date:    is_current ? null : (formData.get('end_date') as string || null),
		is_current,
		description: formData.get('description') as string,
		sort_order:  parseInt(formData.get('sort_order') as string, 10) || 0,
		// Parsear string JSON de las tecnologías ["React", "Typescript"]
		technologies: JSON.parse((formData.get('technologies') as string) || '[]') as string[]
	};
}

// Actualiza las tecnologías asociadas a una experiencia laboral
async function syncTechnologies(experienceId: string, techs: string[]) {
	// 1. Eliminar anteriores
	await supabaseAdmin.from('work_experience_technologies').delete().eq('work_experience_id', experienceId);
	
	// 2. Insertar nuevas si existen
	if (techs.length > 0) {
		const rows = techs.map((name, index) => ({
			work_experience_id: experienceId,
			name,
			sort_order: (index + 1) * 10
		}));
		await supabaseAdmin.from('work_experience_technologies').insert(rows);
	}
}

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		const { job_title, company, start_date, end_date, is_current, description, sort_order, technologies } = extractData(formData);

		const { data, error } = await supabaseAdmin
			.from('work_experience')
			.insert({ job_title, company, start_date, end_date, is_current, description, sort_order })
			.select('id')
			.single();

		if (error || !data) {
			console.error('[experience/add]', error?.message);
			const actionData: ExperienceActionData = { result: { type: 'error', message: 'Error al añadir experiencia.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		await syncTechnologies(data.id, technologies);

		const actionData: ExperienceActionData = { result: { type: 'success', message: 'Experiencia añadida.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const { job_title, company, start_date, end_date, is_current, description, sort_order, technologies } = extractData(formData);

		const { error } = await supabaseAdmin
			.from('work_experience')
			.update({ job_title, company, start_date, end_date, is_current, description, sort_order })
			.eq('id', id);

		if (error) {
			console.error('[experience/edit]', error.message);
			const actionData: ExperienceActionData = { result: { type: 'error', message: 'Error al actualizar experiencia.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		await syncTechnologies(id, technologies);

		const actionData: ExperienceActionData = { result: { type: 'success', message: 'Experiencia actualizada.' } };
		return actionData as unknown as Record<string, unknown>;
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		// La DB asume eliminación en cascada para `work_experience_technologies`
		const { error } = await supabaseAdmin
			.from('work_experience')
			.delete()
			.eq('id', id);

		if (error) {
			console.error('[experience/delete]', error.message);
			const actionData: ExperienceActionData = { result: { type: 'error', message: 'Error al eliminar experiencia.' } };
			return fail(500, actionData as unknown as Record<string, unknown>);
		}

		const actionData: ExperienceActionData = { result: { type: 'success', message: 'Experiencia eliminada.' } };
		return actionData as unknown as Record<string, unknown>;
	}
};
