/**
 * lib/types/projects.ts
 *
 * [skill: typescript-advanced-types]
 */

export interface ProjectImage {
	readonly id: string;
	readonly project_id: string;
	url: string;
	alt_text: string | null;
	sort_order: number;
}

export interface ProjectTech {
	readonly id: string;
	readonly project_id: string;
	name: string;
	sort_order: number;
}

export interface ProjectContribution {
	readonly id: string;
	readonly project_id: string;
	description: string;
	sort_order: number;
}

export interface Project {
	readonly id: string;
	name: string;
	description: string;
	repo_url: string | null;
	live_url: string | null;
	is_featured: boolean;
	is_team: boolean;
	sort_order: number;
	readonly created_at: string;
}

export interface ProjectWithRelations extends Project {
	images: readonly ProjectImage[];
	technologies: readonly ProjectTech[];
	contributions: readonly ProjectContribution[];
}

export type ProjectActionResult =
	| { readonly type: 'success'; readonly message: string }
	| { readonly type: 'error';   readonly message: string };

export interface ProjectActionData {
	readonly result: ProjectActionResult;
}

export interface ProjectPageData {
	readonly projects: readonly ProjectWithRelations[];
}
