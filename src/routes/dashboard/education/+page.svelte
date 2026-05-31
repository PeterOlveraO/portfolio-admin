<script lang="ts">
	/**
	 * dashboard/education/+page.svelte — Educación
	 *
	 * [skill: typescript-advanced-types]
	 *
	 * [skill: frontend-design — VORTEX]
	 *  - Split Layout: Formulario a la izquierda, Timeline a la derecha
	 *  - Gestión de archivo de certificado (PDF) con UI integrada
	 *  - Checkbox personalizado
	 */
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import type { EducationActionData, Education } from '$lib/types/education';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// ── Estado del Formulario ────────────────────────────────────────────────
	let loading = $state(false);
	let editingId = $state<string | null>(null);

	let formDegree      = $state('');
	let formInstitution = $state('');
	let formStart       = $state('');
	let formEnd         = $state('');
	let formCurrent     = $state(false);
	let formDesc        = $state('');
	let formSort        = $state(0);

	// Estado del certificado
	let currentCertUrl  = $state<string | null>(null);
	let certFileName    = $state<string | null>(null);
	let removeCert      = $state(false); // Flag para borrar el certificado actual

	// ── Toast ────────────────────────────────────────────────────────────────
	const typedForm = $derived(form as EducationActionData | null);
	let toastVisible = $state(false);
	$effect(() => {
		if (typedForm?.result) {
			toastVisible = true;
			if (typedForm.result.type === 'success') {
				resetForm();
			}
			const timer = setTimeout(() => { toastVisible = false; }, 4000);
			return () => clearTimeout(timer);
		}
	});

	// ── Acciones de UI ───────────────────────────────────────────────────────
	function editEducation(edu: Education) {
		editingId       = edu.id;
		formDegree      = edu.degree;
		formInstitution = edu.institution;
		formStart       = edu.start_date;
		formEnd         = edu.end_date || '';
		formCurrent     = edu.is_current;
		formDesc        = edu.description;
		formSort        = edu.sort_order;
		currentCertUrl  = edu.certificate_url;
		certFileName    = null;
		removeCert      = false;
		
		document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function resetForm() {
		editingId       = null;
		formDegree      = '';
		formInstitution = '';
		formStart       = '';
		formEnd         = '';
		formCurrent     = false;
		formDesc        = '';
		currentCertUrl  = null;
		certFileName    = null;
		removeCert      = false;
		formSort        = data.education.length * 10 + 10;
	}

	$effect(() => {
		if (!editingId && formSort === 0) {
			formSort = data.education.length * 10 + 10;
		}
	});

	// Manejador del input de archivo
	function onCertChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			certFileName = file.name;
			removeCert = false; // Si elige un archivo nuevo, cancela la intención de borrar
		} else {
			certFileName = null;
		}
	}

	function handleRemoveCert() {
		removeCert = true;
		certFileName = null;
		// Reset file input value if possible (requires ref, but for now visual state is enough)
		const fileInput = document.getElementById('cert_file') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
	}
</script>

<svelte:head>
	<title>Educación — Portfolio Admin</title>
</svelte:head>

<!-- Toast de resultado -->
{#if toastVisible && typedForm?.result}
	<div class="toast" class:toast--success={typedForm.result.type === 'success'} class:toast--error={typedForm.result.type === 'error'} role="status" aria-live="polite">
		<span class="toast-icon" aria-hidden="true">
			{#if typedForm.result.type === 'success'}
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l3.5 3.5L13 4"/></svg>
			{:else}
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11h.01"/></svg>
			{/if}
		</span>
		{typedForm.result.message}
	</div>
{/if}

<div class="page">
	<div class="page-header">
		<p class="eyebrow">Panel de administración</p>
		<h2 class="page-title">Educación</h2>
		<p class="page-subtitle">Añade tu formación académica y certificaciones.</p>
	</div>

	<div class="layout-grid">
		<!-- ══ COLUMNA IZQUIERDA: Formulario ═══════════════════════════════ -->
		<div class="form-wrapper">
			<div class="panel form-panel">
				<div class="section-header">
					<p class="section-label">{editingId ? 'Editar educación' : 'Añadir educación'}</p>
					{#if editingId}
						<button type="button" class="cancel-btn" onclick={resetForm}>Cancelar</button>
					{/if}
				</div>

				<form
					method="POST"
					action={editingId ? "?/edit" : "?/add"}
					enctype="multipart/form-data"
					class="education-form"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							await update({ reset: false });
							loading = false;
						};
					}}
				>
					{#if editingId}
						<input type="hidden" name="id" value={editingId} />
					{/if}

					<div class="field-group">
						<label for="degree" class="field-label">Título / Grado</label>
						<input id="degree" name="degree" type="text" class="field-input"
							bind:value={formDegree} placeholder="Ej: Ingeniería en Software" required />
					</div>

					<div class="field-group">
						<label for="institution" class="field-label">Institución</label>
						<input id="institution" name="institution" type="text" class="field-input"
							bind:value={formInstitution} placeholder="Ej: Universidad Autónoma" required />
					</div>

					<div class="field-row">
						<div class="field-group flex-1">
							<label for="start_date" class="field-label">Fecha de inicio</label>
							<input id="start_date" name="start_date" type="text" class="field-input"
								bind:value={formStart} placeholder="Ej: Ago 2018" required />
						</div>
						<div class="field-group flex-1" class:opacity-50={formCurrent}>
							<label for="end_date" class="field-label">Fecha de fin</label>
							<input id="end_date" name="end_date" type="text" class="field-input"
								bind:value={formEnd} placeholder="Ej: Jul 2022" disabled={formCurrent} required={!formCurrent} />
						</div>
					</div>

					<div class="checkbox-wrap">
						<input id="is_current" name="is_current" type="checkbox" bind:checked={formCurrent} />
						<label for="is_current">Estudio aquí actualmente</label>
					</div>

					<div class="field-group">
						<label for="description" class="field-label">Descripción o Logros</label>
						<textarea id="description" name="description" class="field-input field-textarea"
							bind:value={formDesc} placeholder="Mención honorífica, materias destacadas..."></textarea>
					</div>

					<!-- Gestión del Certificado -->
					<div class="field-group">
						<p class="field-label">Certificado (PDF)</p>
						<div class="cert-area">
							{#if currentCertUrl && !removeCert}
								<div class="current-cert">
									<a href={currentCertUrl} target="_blank" rel="noopener noreferrer" class="cv-link">
										<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M10 2v4h4"/></svg>
										Ver certificado actual
									</a>
									<button type="button" class="action-btn action-btn--delete" onclick={handleRemoveCert} title="Eliminar certificado actual">Eliminar</button>
								</div>
								<input type="hidden" name="certificate_url_current" value={currentCertUrl} />
							{:else}
								{#if currentCertUrl && removeCert}
									<input type="hidden" name="remove_certificate" value="true" />
									<p class="remove-notice">El certificado actual se eliminará al guardar.</p>
								{/if}
								<label for="cert_file" class="cv-upload-btn">
									<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v9M4 7l4-5 4 5M2 14h12"/></svg>
									{certFileName ? certFileName : 'Subir nuevo PDF'}
								</label>
								<input id="cert_file" name="certificate_file" type="file" accept="application/pdf" class="file-hidden" onchange={onCertChange} />
							{/if}
						</div>
					</div>

					<div class="field-group w-24">
						<label for="sort_order" class="field-label">Orden</label>
						<input id="sort_order" name="sort_order" type="number" class="field-input text-center"
							bind:value={formSort} required />
					</div>

					<button type="submit" disabled={loading} class="save-btn">
						{#if loading}
							<span class="spinner" aria-hidden="true"></span>
							{editingId ? 'Guardando...' : 'Añadiendo...'}
						{:else}
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8l3.5 3.5L13 4"/></svg>
							{editingId ? 'Guardar cambios' : 'Añadir educación'}
						{/if}
					</button>
				</form>
			</div>
		</div>

		<!-- ══ COLUMNA DERECHA: Lista de Educación ═════════════════════════ -->
		<div class="list-wrapper">
			{#if data.education.length === 0}
				<div class="empty-state panel">
					<svg class="empty-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
					<p class="empty-text">No hay formación educativa registrada.</p>
				</div>
			{:else}
				<div class="timeline">
					{#each data.education as edu (edu.id)}
						<div class="timeline-item panel group">
							<div class="exp-header">
								<div class="exp-title-row">
									<h3 class="exp-title">{edu.degree}</h3>
									<span class="sort-badge">#{edu.sort_order}</span>
								</div>
								<p class="exp-company">{edu.institution}</p>
								<p class="exp-dates">
									{edu.start_date} — {edu.is_current ? 'Presente' : edu.end_date}
								</p>
							</div>

							{#if edu.description || edu.certificate_url}
								<div class="exp-body">
									{#if edu.description}
										<p class="exp-desc">{edu.description}</p>
									{/if}
									{#if edu.certificate_url}
										<a href={edu.certificate_url} target="_blank" rel="noopener noreferrer" class="cv-link inline-link">
											<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M10 2v4h4"/></svg>
											Certificado adjunto
										</a>
									{/if}
								</div>
							{/if}

							<div class="card-actions">
								<button type="button" class="action-btn" onclick={() => editEducation(edu)}>Editar</button>
								<form method="POST" action="?/delete" class="inline-form" use:enhance={() => { loading = true; return async ({ update }) => { await update(); loading = false; }; }}>
									<input type="hidden" name="id" value={edu.id} />
									<button type="submit" class="action-btn action-btn--delete" onclick={(e) => { if(!confirm(`¿Eliminar ${edu.degree}?`)) e.preventDefault(); }}>Eliminar</button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
/* ── Layout & Variables ─────────────────────────────────────────────────── */
.page { padding: 1.75rem 2rem; max-width: 72rem; display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { display: flex; flex-direction: column; gap: 0.25rem; }
.eyebrow { font-size: 0.625rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-primary); margin: 0; }
.page-title { font-size: clamp(1.25rem, 2.5vw, 1.75rem); font-weight: 300; letter-spacing: -0.03em; color: rgba(255,255,255,0.90); margin: 0; }
.page-subtitle { font-size: 0.8125rem; color: rgba(255,255,255,0.45); margin: 0; }

.layout-grid { display: grid; grid-template-columns: 24rem 1fr; gap: 1.5rem; align-items: start; }
@media (max-width: 1024px) { .layout-grid { grid-template-columns: 1fr; } }

/* ── Formulario ─────────────────────────────────────────────────────────── */
.form-panel { border-radius: 1.5rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; position: sticky; top: 1.5rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-label { font-size: 0.625rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.40); margin: 0; }
.cancel-btn { background: none; border: none; font-size: 0.6875rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: color 0.15s; }
.cancel-btn:hover { color: var(--color-primary); }

.education-form { display: flex; flex-direction: column; gap: 1rem; }
.field-row { display: flex; gap: 0.75rem; }
.flex-1 { flex: 1; }
.w-24 { width: 6rem; }
.text-center { text-align: center; }
.opacity-50 { opacity: 0.5; transition: opacity 0.2s; }

.field-group { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.625rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.40); margin: 0; }
.field-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); border-radius: 0.875rem; padding: 0.6875rem 0.875rem; font-size: 0.875rem; font-family: var(--font-sans); color: rgba(255,255,255,0.88); outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; caret-color: var(--color-primary); resize: none; }
.field-input::placeholder { color: rgba(255,255,255,0.22); }
.field-input:focus { border-color: rgba(255,59,48,0.45); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(255,59,48,0.10); }
.field-textarea { min-height: 5rem; }

.checkbox-wrap { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: rgba(255,255,255,0.7); cursor: pointer; }

/* ── Certificado ────────────────────────────────────────────────────────── */
.cert-area { display: flex; flex-direction: column; gap: 0.5rem; }
.current-cert { display: flex; align-items: center; gap: 0.75rem; }
.remove-notice { font-size: 0.75rem; color: var(--color-primary); margin: 0; font-style: italic; }

.cv-link { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--color-primary); text-decoration: none; padding: 0.5rem 0.875rem; border-radius: 9999px; background: rgba(255,59,48,0.08); border: 1px solid rgba(255,59,48,0.20); width: fit-content; transition: background 0.15s, border-color 0.15s; }
.cv-link:hover { background: rgba(255,59,48,0.14); border-color: rgba(255,59,48,0.35); }
.inline-link { padding: 0.25rem 0.625rem; font-size: 0.75rem; }

.cv-upload-btn { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 500; color: rgba(255,255,255,0.60); padding: 0.5rem 0.875rem; border-radius: 9999px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); width: fit-content; cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; }
.cv-upload-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.88); border-color: rgba(255,255,255,0.18); }
.file-hidden { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

/* ── Botón Submit ───────────────────────────────────────────────────────── */
.save-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; font-family: var(--font-sans); letter-spacing: 0.05em; text-transform: uppercase; color: #fff; border: none; cursor: pointer; background: var(--color-primary); box-shadow: 0 0 24px rgba(255,59,48,0.40); transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s; margin-top: 0.5rem; }
.save-btn:hover:not(:disabled) { transform: scale(1.04); box-shadow: 0 0 32px rgba(255,59,48,0.55); }
.save-btn:disabled { opacity: 0.50; cursor: not-allowed; }
.spinner { width: 0.875rem; height: 0.875rem; border: 2px solid rgba(255,255,255,0.30); border-top-color: #fff; border-radius: 50%; animation: spin 0.65s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Timeline (Derecha) ─────────────────────────────────────────────────── */
.timeline { display: flex; flex-direction: column; gap: 1rem; }
.timeline-item { padding: 1.5rem; border-radius: 1.25rem; display: flex; flex-direction: column; gap: 1rem; border: 1px solid rgba(255,255,255,0.06); transition: border-color 0.15s, background 0.15s; }
.timeline-item:hover { border-color: rgba(255,59,48,0.25); background: rgba(255,255,255,0.03); }

.exp-header { display: flex; flex-direction: column; gap: 0.125rem; }
.exp-title-row { display: flex; justify-content: space-between; align-items: flex-start; }
.exp-title { font-size: 1.0625rem; font-weight: 600; color: #fff; margin: 0; }
.sort-badge { font-size: 0.625rem; font-weight: 600; padding: 0.125rem 0.375rem; border-radius: 0.25rem; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); }
.exp-company { font-size: 0.875rem; font-weight: 500; color: var(--color-primary); margin: 0; }
.exp-dates { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin: 0; margin-top: 0.25rem; }

.exp-body { display: flex; flex-direction: column; gap: 0.75rem; }
.exp-desc { font-size: 0.875rem; color: rgba(255,255,255,0.7); line-height: 1.5; margin: 0; white-space: pre-wrap; }

.card-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; opacity: 0; transition: opacity 0.15s; }
.timeline-item:hover .card-actions { opacity: 1; }
.action-btn { background: rgba(255,255,255,0.06); border: none; padding: 0.25rem 0.625rem; border-radius: 0.375rem; font-size: 0.6875rem; font-weight: 500; color: rgba(255,255,255,0.6); cursor: pointer; transition: background 0.15s, color 0.15s; }
.action-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
.action-btn--delete:hover { background: rgba(255,59,48,0.15); color: var(--color-primary); }

.inline-form { display: contents; }

.empty-state { padding: 3rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; border-radius: 1.5rem; text-align: center; }
.empty-icon { color: rgba(255,255,255,0.2); }
.empty-text { font-size: 0.875rem; color: rgba(255,255,255,0.4); margin: 0; }

/* ── Toast ──────────────────────────────────────────────────────────────── */
.toast { position: fixed; bottom: 1.75rem; right: 1.75rem; z-index: 50; display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem 1.125rem; border-radius: 9999px; font-size: 0.8125rem; font-weight: 500; backdrop-filter: blur(20px) saturate(150%); -webkit-backdrop-filter: blur(20px) saturate(150%); box-shadow: 0 4px 24px rgba(0,0,0,0.4); animation: toast-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both; }
.toast--success { background: rgba(52, 211, 153, 0.12); border: 1px solid rgba(52, 211, 153, 0.30); color: oklch(0.79 0.17 155); }
.toast--error { background: rgba(255, 59, 48, 0.12); border: 1px solid rgba(255, 59, 48, 0.30); color: var(--color-primary); }
.toast-icon { display: flex; flex-shrink: 0; }
@keyframes toast-in { from { opacity: 0; transform: translateY(8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
</style>
