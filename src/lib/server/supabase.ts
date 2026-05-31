/**
 * lib/server/supabase.ts
 *
 * Factory que crea un cliente Supabase SSR-aware ligado al ciclo de vida
 * de cada request HTTP. Usa @supabase/ssr para leer y escribir cookies
 * automáticamente, de modo que el token de sesión fluye entre cliente y
 * servidor sin configuración manual.
 *
 * Siguiendo typescript-advanced-types:
 *  - Parámetros tipados con RequestEvent de SvelteKit para no usar `any`.
 *  - CookieOptions importado del tipo de @supabase/ssr para consistencia.
 */
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Cookies } from '@sveltejs/kit';

/**
 * Crea un cliente Supabase que lee/escribe cookies a través del objeto
 * `Cookies` de SvelteKit. Llamar una vez por request en hooks.server.ts.
 *
 * @param cookies - Objeto cookies del request actual (de RequestEvent).
 */
export function createSupabaseServerClient(cookies: Cookies) {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					cookies.set(name, value, {
						...options,
						// Asegurar que las cookies de auth sean siempre HttpOnly y
						// con path raíz para que estén disponibles en todas las rutas.
						path: options?.path ?? '/'
					});
				});
			}
		}
	});
}
