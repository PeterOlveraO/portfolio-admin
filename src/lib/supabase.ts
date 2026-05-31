/**
 * supabase.ts
 * Cliente público de Supabase — usa la anon key.
 * Seguro para importar en componentes del navegador y en rutas +page.ts (load).
 */
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		// Persiste la sesión en localStorage para que sobreviva recargas.
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true
	}
});
