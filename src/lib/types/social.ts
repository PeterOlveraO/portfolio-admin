/**
 * lib/types/social.ts
 *
 * [skill: typescript-advanced-types]
 *  - SocialLink: interface readonly — shape de la fila de Supabase
 *  - SocialActionResult: discriminated union para el resultado de las Form Actions
 */

// ── Shape de la tabla `social_links` en Supabase ───────────────────────────
export interface SocialLink {
	readonly id: string;
	platform: string;
	url: string;
	icon_key: string;
	sort_order: number;
}

// ── Discriminated union: resultado de las actions (add, edit, delete) ──────
export type SocialActionResult =
	| { readonly type: 'success'; readonly message: string }
	| { readonly type: 'error';   readonly message: string };

export interface SocialActionData {
	readonly result: SocialActionResult;
}

export interface SocialPageData {
	readonly socialLinks: readonly SocialLink[];
}
