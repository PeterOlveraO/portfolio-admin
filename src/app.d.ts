// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Session, SupabaseClient } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			/**
			 * Cliente Supabase SSR ligado a las cookies del request actual.
			 * Disponible en todos los load functions y actions del servidor.
			 */
			supabase: SupabaseClient;

			/**
			 * Sesión activa del usuario, o null si no está autenticado.
			 * Poblado por hooks.server.ts en cada request.
			 */
			session: Session | null;
		}

		interface PageData {
			/** Sesión propagada opcionalmente a páginas que la necesitan. */
			session?: Session | null;
		}

		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
