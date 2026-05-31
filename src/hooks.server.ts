/**
 * hooks.server.ts
 *
 * Handle global de SvelteKit: intercepta cada request HTTP, crea el cliente
 * Supabase SSR ligado a las cookies de ese request y obtiene la sesión.
 * El resultado se inyecta en `locals` para que cualquier load o action
 * del servidor pueda acceder sin volver a llamar a Supabase.
 *
 * Siguiendo typescript-advanced-types:
 *  - `Handle` importado para tipar correctamente la función.
 *  - `locals` accedido con los tipos declarados en App.Locals (app.d.ts).
 *  - Sin `any` en ningún punto del pipeline.
 */
import type { Handle } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/server/supabase';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Crear cliente SSR para este request concreto.
	//    El cliente gestiona automáticamente la lectura y escritura de cookies.
	event.locals.supabase = createSupabaseServerClient(event.cookies);

	// 2. Obtener la sesión del usuario.
	//    getSession() valida el JWT sin hacer llamadas de red adicionales.
	//    Retorna null si no hay sesión o si el token expiró.
	const {
		data: { session }
	} = await event.locals.supabase.auth.getSession();

	event.locals.session = session;

	// 3. Resolver el request normalmente.
	//    No bloqueamos aquí — los guards viven en los layout.server.ts.
	return resolve(event, {
		// Filtramos cabeceras internas de Supabase para que no lleguen al cliente.
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
