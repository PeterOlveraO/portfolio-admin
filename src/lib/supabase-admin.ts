/**
 * supabase-admin.ts
 * Cliente de Supabase con service_role key — SOLO para uso en el servidor.
 * Importar únicamente en +page.server.ts, +server.ts o hooks.server.ts.
 * NUNCA importar en componentes .svelte ni en archivos +page.ts del cliente.
 */
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		// El cliente admin no debe persistir sesión; opera en nombre del servidor.
		persistSession: false,
		autoRefreshToken: false
	}
});
