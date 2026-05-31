/**
 * lib/types/diploma.ts
 *
 * [skill: typescript-advanced-types]
 */

export interface Diploma {
	readonly id: string;
	name: string;
	issuer: string;
	issue_date: string;
	description: string | null;
	pdf_url: string;
	sort_order: number;
	readonly created_at: string;
}

export type DiplomaActionResult =
	| { readonly type: 'success'; readonly message: string }
	| { readonly type: 'error';   readonly message: string };

export interface DiplomaActionData {
	readonly result: DiplomaActionResult;
}

export interface DiplomaPageData {
	readonly diplomas: readonly Diploma[];
}
