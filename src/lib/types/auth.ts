/**
 * auth.ts — Tipos compartidos de autenticación.
 *
 * Siguiendo la skill typescript-advanced-types:
 *  - Discriminated union (AuthResult) para modelar estados de auth sin `any`.
 *  - Type guard (isAuthError) para narrowing expresivo y reutilizable.
 *  - Readonly en propiedades que no deben mutar tras construcción.
 *  - LoginActionError: tipo específico para ActionData del formulario de login,
 *    usando un union discriminado en lugar de campos opcionales sueltos.
 */
import type { AuthError, User } from '@supabase/supabase-js';

// ── Discriminated union: resultado de verificar una sesión ────────────────
export type AuthResult =
	| { readonly status: 'authenticated'; readonly user: User }
	| { readonly status: 'unauthenticated' }
	| { readonly status: 'error'; readonly error: AuthError };

// ── Forma serializable del usuario (segura para pasar al cliente) ─────────
export interface AuthenticatedUser {
	readonly id: string;
	readonly email: string;
}

// ── Error tipado que devuelve la Form Action de login ─────────────────────
// Discriminated union: 'invalid_credentials' | 'server_error' | 'validation'
// Permite al componente mostrar mensajes diferentes según el origen del fallo.
export type LoginActionError =
	| { readonly type: 'invalid_credentials'; readonly message: string }
	| { readonly type: 'validation'; readonly field: 'email' | 'password'; readonly message: string }
	| { readonly type: 'server_error'; readonly message: string };

// ── ActionData del login — lo que el +page.server.ts retorna como `fail` ──
export interface LoginActionData {
	readonly error: LoginActionError;
	/** Preserva el email introducido para no perderlo al refrescar. */
	readonly email?: string;
}

// ── Type guard: true si el resultado NO representa un usuario válido ───────
export function isAuthError(
	result: AuthResult
): result is Extract<AuthResult, { status: 'unauthenticated' | 'error' }> {
	return result.status !== 'authenticated';
}

// ── Helper: convierte la respuesta de Supabase a AuthResult ───────────────
export function toAuthResult(
	data: { user: User | null },
	error: AuthError | null
): AuthResult {
	if (error) return { status: 'error', error };
	if (!data.user) return { status: 'unauthenticated' };
	return { status: 'authenticated', user: data.user };
}

// ── Mensajes de error legibles para el usuario ────────────────────────────
// Centraliza las cadenas para no duplicarlas entre action y componente.
export const AUTH_ERROR_MESSAGES = {
	invalid_credentials: 'Credenciales incorrectas. Verifica tu email y contraseña.',
	server_error: 'Error interno del servidor. Inténtalo de nuevo.',
	email_required: 'El correo electrónico es obligatorio.',
	password_required: 'La contraseña es obligatoria.',
} as const;

// Tipo inferido de las claves del objeto (template literal utility)
export type AuthErrorMessageKey = keyof typeof AUTH_ERROR_MESSAGES;
