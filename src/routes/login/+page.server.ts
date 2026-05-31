/**
 * login/+page.server.ts
 *
 * Guard de login + Form Actions para autenticación.
 *
 * Siguiendo typescript-advanced-types:
 *  - `Actions` tipado explícitamente con el generic de SvelteKit.
 *  - `LoginActionData` (discriminated union) como tipo de retorno del `fail()`.
 *  - Validación con narrowing de tipo antes de llamar a Supabase.
 *  - Sin `any` — `formData.get()` retorna `FormDataEntryValue | null`,
 *    se valida con type guard explícito antes de usarlo como `string`.
 */
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AUTH_ERROR_MESSAGES } from '$lib/types/auth';

// ── Guard: si ya tiene sesión, redirigir al dashboard ────────────────────
export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		redirect(303, '/dashboard');
	}
	return {};
};

// ── Form Actions ──────────────────────────────────────────────────────────
export const actions: Actions = {
	/**
	 * Action `login` — procesada al enviar el formulario.
	 * SvelteKit inyecta `request` y `locals` (con el cliente Supabase SSR).
	 */
	login: async ({ request, locals }) => {
		const formData = await request.formData();

		const rawEmail    = formData.get('email');
		const rawPassword = formData.get('password');

		// ── Validación: type guard antes de asumir que son strings ──────────
		// FormDataEntryValue es `string | File`; descartamos File con typeof.
		if (typeof rawEmail !== 'string' || rawEmail.trim() === '') {
			return fail(422, {
				error: {
					type: 'validation' as const,
					field: 'email' as const,
					message: AUTH_ERROR_MESSAGES.email_required
				},
				email: ''
			});
		}

		if (typeof rawPassword !== 'string' || rawPassword === '') {
			return fail(422, {
				error: {
					type: 'validation' as const,
					field: 'password' as const,
					message: AUTH_ERROR_MESSAGES.password_required
				},
				email: rawEmail
			});
		}

		// Tipos narrowed: email y password son `string` garantizados desde aquí.
		const email    = rawEmail.trim();
		const password = rawPassword;

		// ── Llamada a Supabase Auth ──────────────────────────────────────────
		// locals.supabase tiene las cookies del request → escribe la sesión automáticamente.
		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

		if (error) {
			// 400 de Supabase = credenciales inválidas.
			const isInvalidCreds = error.status === 400 || error.message.toLowerCase().includes('invalid');

			return fail(isInvalidCreds ? 401 : 500, {
				error: {
					type: isInvalidCreds ? ('invalid_credentials' as const) : ('server_error' as const),
					message: isInvalidCreds
						? AUTH_ERROR_MESSAGES.invalid_credentials
						: AUTH_ERROR_MESSAGES.server_error
				},
				email
			});
		}

		// ── Éxito: las cookies ya fueron escritas por el cliente SSR ─────────
		// redirect() lanza una excepción interna de SvelteKit → no retornar nada después.
		redirect(303, '/dashboard');
	}
} satisfies Actions;
