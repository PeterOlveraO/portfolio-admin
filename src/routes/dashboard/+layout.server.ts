/**
 * dashboard/+layout.server.ts
 *
 * Guard de autenticación para todas las rutas bajo /dashboard/*.
 * Lee locals.session (ya evaluado en hooks.server.ts) — sin llamadas extra.
 *
 * Retorna AuthenticatedUser con tipos explícitos para que las páginas hijas
 * tengan acceso tipado al email del usuario sin depender de `Session` de
 * Supabase directamente (evitamos filtrar propiedades internas).
 */
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { AuthenticatedUser } from '$lib/types/auth';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Si no hay sesión, redirigir a login inmediatamente.
	if (!locals.session) {
		redirect(303, '/login');
	}

	// locals.session no es null aquí — narrowing garantizado por el `if` anterior.
	// Extraemos solo las propiedades que el cliente necesita (no exponemos tokens).
	const user: AuthenticatedUser = {
		id:    locals.session.user.id,
		email: locals.session.user.email ?? ''
	};

	return { user };
};
