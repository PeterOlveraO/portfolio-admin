/**
 * +page.server.ts (ruta raíz /)
 *
 * Redirect inmediato según sesión disponible en locals (ya evaluada por hooks.server.ts).
 * No vuelve a llamar a Supabase — lee el resultado cacheado en locals.session.
 */
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// locals.session fue poblado por hooks.server.ts — sin llamadas extra.
	if (locals.session) {
		redirect(303, '/dashboard');
	}
	redirect(303, '/login');
};
