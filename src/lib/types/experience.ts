/**
 * lib/types/experience.ts
 *
 * [skill: typescript-advanced-types]
 */

export interface WorkExperienceTech {
	readonly id: string;
	readonly work_experience_id: string;
	name: string;
	sort_order: number;
}

export interface WorkExperience {
	readonly id: string;
	job_title: string;
	company: string;
	start_date: string;
	end_date: string | null;
	is_current: boolean;
	description: string;
	sort_order: number;
	readonly created_at: string;
}

// Interfaz compuesta para representar la experiencia con sus tecnologías adjuntas
export interface WorkExperienceWithTech extends WorkExperience {
	technologies: readonly WorkExperienceTech[];
}

export type ExperienceActionResult =
	| { readonly type: 'success'; readonly message: string }
	| { readonly type: 'error';   readonly message: string };

export interface ExperienceActionData {
	readonly result: ExperienceActionResult;
}

export interface ExperiencePageData {
	readonly experiences: readonly WorkExperienceWithTech[];
}
