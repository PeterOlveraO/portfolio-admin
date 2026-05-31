/**
 * lib/types/education.ts
 *
 * [skill: typescript-advanced-types]
 */

export interface Education {
	readonly id: string;
	degree: string;
	institution: string;
	start_date: string;
	end_date: string | null;
	is_current: boolean;
	description: string;
	certificate_url: string | null;
	sort_order: number;
	readonly created_at: string;
}

export type EducationActionResult =
	| { readonly type: 'success'; readonly message: string }
	| { readonly type: 'error';   readonly message: string };

export interface EducationActionData {
	readonly result: EducationActionResult;
}

export interface EducationPageData {
	readonly education: readonly Education[];
}
