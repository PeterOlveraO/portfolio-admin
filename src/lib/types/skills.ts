/**
 * lib/types/skills.ts
 *
 * [skill: typescript-advanced-types]
 *  - Interfaces readonly para las tablas `skill_categories` y `skills`.
 *  - Discriminated union para los resultados de acciones.
 */

export interface SkillCategory {
	readonly id: string;
	name: string;
	sort_order: number;
}

export interface Skill {
	readonly id: string;
	readonly category_id: string;
	name: string;
	icon_url: string | null;
	sort_order: number;
}

export type SkillsActionResult =
	| { readonly type: 'success'; readonly message: string }
	| { readonly type: 'error';   readonly message: string };

export interface SkillsActionData {
	readonly result: SkillsActionResult;
}

export interface SkillsPageData {
	readonly categories: readonly SkillCategory[];
	readonly skills: readonly Skill[];
}
