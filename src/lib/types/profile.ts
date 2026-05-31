/**
 * lib/types/profile.ts
 *
 * [skill: typescript-advanced-types]
 *  - Profile: interface readonly — shape de la fila de Supabase
 *  - ProfileActionResult: discriminated union para el resultado de la Form Action
 *  - ProfileActionError: union de errores específicos con narrowing
 *  - Evita `any` — todos los campos tipados explícitamente
 */

// ── Shape de la tabla `profile` en Supabase ────────────────────────────────
export interface Profile {
	readonly id: string;
	name: string;
	role: string;
	tagline: string;
	about: string;
	photo_url: string | null;
	cv_pdf_url: string | null;
	email: string;
	location: string;
	readonly updated_at: string;
}

// ── Discriminated union: resultado de la action `save` ────────────────────
// El componente hace narrowing sobre `result.type` para mostrar el toast correcto.
export type ProfileActionResult =
	| { readonly type: 'success'; readonly message: string }
	| { readonly type: 'error';   readonly message: string };

// ── Tipo del ActionData retornado por la Form Action ─────────────────────
export interface ProfileActionData {
	readonly result: ProfileActionResult;
}

// ── Tipo del PageData retornado por el load ────────────────────────────────
export interface ProfilePageData {
	readonly profile: Profile | null;
}
