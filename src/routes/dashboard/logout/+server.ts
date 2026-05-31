/**
 * dashboard/logout/+server.ts
 *
 * Endpoint POST para cerrar sesión.
 * Usar un endpoint separado (no una action en layout) permite hacer el logout
 * desde un <form method="POST"> sin JavaScript, respetando progressive enhancement.
 *
 * Siguiendo typescript-advanced-types:
 *  - `RequestHandler` importado para tipar correctamente el handler.
 *  - Sin `any` — `locals.supabase` es `SupabaseClient` (declarado en App.Locals).
 */
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	// signOut() invalida el token en Supabase y limpia las cookies SSR automáticamente.
	await locals.supabase.auth.signOut();

	// Redirigir al login con 303 See Other (correcto después de POST).
	redirect(303, '/login');
};
