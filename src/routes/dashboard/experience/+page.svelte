<script lang="ts">
	/**
	 * dashboard/experience/+page.svelte — Experiencia Laboral
	 *
	 * [skill: typescript-advanced-types]
	 *  - type narrowing para Form Data
	 *
	 * [skill: frontend-design — VORTEX]
	 *  - Split Layout: Formulario a la izquierda, Timeline/Cards a la derecha
	 *  - Tags Input interactivo para tecnologías
	 *  - Checkbox personalizado
	 */
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import type { ExperienceActionData, WorkExperienceWithTech } from '$lib/types/experience';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// ── Estado del Formulario ────────────────────────────────────────────────
	let loading = $state(false);
	let editingId = $state<string | null>(null);

	let formTitle   = $state('');
	let formCompany = $state('');
	let formStart   = $state('');
	let formEnd     = $state('');
	let formCurrent = $state(false);
	let formDesc    = $state('');
	let formSort    = $state(0);

	// Estado para los tags de tecnologías
	let formTechs   = $state<string[]>([]);
	let techInput   = $state('');

	// ── Toast ────────────────────────────────────────────────────────────────
	const typedForm = $derived(form as ExperienceActionData | null);
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
	function editExperience(exp: WorkExperienceWithTech) {
		editingId   = exp.id;
		formTitle   = exp.job_title;
		formCompany = exp.company;
		formStart   = exp.start_date;
		formEnd     = exp.end_date || '';
		formCurrent = exp.is_current;
		formDesc    = exp.description;
		formSort    = exp.sort_order;
		formTechs   = exp.technologies.map(t => t.name);
		
		document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function resetForm() {
		editingId   = null;
		formTitle   = '';
		formCompany = '';
		formStart   = '';
		formEnd     = '';
		formCurrent = false;
		formDesc    = '';
		formTechs   = [];
		techInput   = '';
		formSort    = data.experiences.length * 10 + 10;
	}

	$effect(() => {
		if (!editingId && formSort === 0) {
			formSort = data.experiences.length * 10 + 10;
		}
	});

	// ── Lógica de Tags ───────────────────────────────────────────────────────
	function addTech(e: KeyboardEvent | Event) {
		const val = techInput.trim();
		if (val && !formTechs.includes(val)) {
			formTechs = [...formTechs, val];
		}
		techInput = '';
	}

	function handleTechKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault(); // Evita el submit del formulario general
			addTech(e);
		}
	}

	function removeTech(tech: string) {
		formTechs = formTechs.filter(t => t !== tech);
	}
</script>

<svelte:head>
	<title>Experiencia — Portfolio Admin</title>
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
		<h2 class="page-title">Experiencia Laboral</h2>
		<p class="page-subtitle">Añade o edita tu trayectoria profesional y roles desempeñados.</p>
	</div>

	<div class="layout-grid">
		<!-- ══ COLUMNA IZQUIERDA: Formulario ═══════════════════════════════ -->
		<div class="form-wrapper">
			<div class="panel form-panel">
				<div class="section-header">
					<p class="section-label">{editingId ? 'Editar experiencia' : 'Añadir experiencia'}</p>
					{#if editingId}
						<button type="button" class="cancel-btn" onclick={resetForm}>Cancelar</button>
					{/if}
				</div>

				<form
					method="POST"
					action={editingId ? "?/edit" : "?/add"}
					class="experience-form"
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
					
					<!-- Hidden input para enviar el array de tecnologías como JSON -->
					<input type="hidden" name="technologies" value={JSON.stringify(formTechs)} />

					<div class="field-group">
						<label for="job_title" class="field-label">Cargo / Puesto</label>
						<input id="job_title" name="job_title" type="text" class="field-input"
							bind:value={formTitle} placeholder="Ej: Senior Frontend Developer" required />
					</div>

					<div class="field-group">
						<label for="company" class="field-label">Empresa</label>
						<input id="company" name="company" type="text" class="field-input"
							bind:value={formCompany} placeholder="Ej: Acme Corp" required />
					</div>

					<div class="field-row">
						<div class="field-group flex-1">
							<label for="start_date" class="field-label">Fecha de inicio</label>
							<!-- Usamos texto/month para el formato que prefiera el usuario (ej: "Enero 2022") -->
							<input id="start_date" name="start_date" type="text" class="field-input"
								bind:value={formStart} placeholder="Ej: Ene 2020" required />
						</div>
						<div class="field-group flex-1" class:opacity-50={formCurrent}>
							<label for="end_date" class="field-label">Fecha de fin</label>
							<input id="end_date" name="end_date" type="text" class="field-input"
								bind:value={formEnd} placeholder="Ej: Dic 2022" disabled={formCurrent} required={!formCurrent} />
						</div>
					</div>

					<div class="checkbox-wrap">
						<input id="is_current" name="is_current" type="checkbox" bind:checked={formCurrent} />
						<label for="is_current">Trabajo aquí actualmente</label>
					</div>

					<div class="field-group">
						<label for="description" class="field-label">Descripción</label>
						<textarea id="description" name="description" class="field-input field-textarea"
							bind:value={formDesc} placeholder="Logros y responsabilidades..." required></textarea>
					</div>

					<div class="field-group">
						<label for="tech_input" class="field-label">Tecnologías (Enter o Coma para añadir)</label>
						<div class="tags-input-wrap field-input">
							{#each formTechs as tech}
								<span class="tag">
									{tech}
									<button type="button" class="tag-remove" aria-label="Eliminar {tech}" onclick={() => removeTech(tech)}>
										<svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
									</button>
								</span>
							{/each}
							<input id="tech_input" type="text" class="tag-input-field" 
								bind:value={techInput} 
								onkeydown={handleTechKeydown}
								onblur={addTech}
								placeholder={formTechs.length === 0 ? "Ej: React, TypeScript" : ""} 
							/>
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
							{editingId ? 'Guardar cambios' : 'Añadir experiencia'}
						{/if}
					</button>
				</form>
			</div>
		</div>

		<!-- ══ COLUMNA DERECHA: Lista de Experiencias ══════════════════════ -->
		<div class="list-wrapper">
			{#if data.experiences.length === 0}
				<div class="empty-state panel">
					<svg class="empty-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
					<p class="empty-text">No hay experiencia laboral registrada.</p>
				</div>
			{:else}
				<div class="timeline">
					{#each data.experiences as exp (exp.id)}
						<div class="timeline-item panel group">
							<div class="exp-header">
								<div class="exp-title-row">
									<h3 class="exp-title">{exp.job_title}</h3>
									<span class="sort-badge">#{exp.sort_order}</span>
								</div>
								<p class="exp-company">{exp.company}</p>
								<p class="exp-dates">
									{exp.start_date} — {exp.is_current ? 'Presente' : exp.end_date}
								</p>
							</div>

							<div class="exp-body">
								<p class="exp-desc">{exp.description}</p>
								
								{#if exp.technologies.length > 0}
									<div class="tech-list">
										{#each exp.technologies as tech}
											<span class="tech-chip">{tech.name}</span>
										{/each}
									</div>
								{/if}
							</div>

							<div class="card-actions">
								<button type="button" class="action-btn" onclick={() => editExperience(exp)}>Editar</button>
								<form method="POST" action="?/delete" class="inline-form" use:enhance={() => { loading = true; return async ({ update }) => { await update(); loading = false; }; }}>
									<input type="hidden" name="id" value={exp.id} />
									<button type="submit" class="action-btn action-btn--delete" onclick={(e) => { if(!confirm(`¿Eliminar ${exp.job_title} en ${exp.company}?`)) e.preventDefault(); }}>Eliminar</button>
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

.layout-grid {
	display: grid;
	grid-template-columns: 24rem 1fr;
	gap: 1.5rem;
	align-items: start;
}
@media (max-width: 1024px) {
	.layout-grid { grid-template-columns: 1fr; }
}

/* ── Formulario ─────────────────────────────────────────────────────────── */
.form-panel { border-radius: 1.5rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; position: sticky; top: 1.5rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-label { font-size: 0.625rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.40); margin: 0; }
.cancel-btn { background: none; border: none; font-size: 0.6875rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: color 0.15s; }
.cancel-btn:hover { color: var(--color-primary); }

.experience-form { display: flex; flex-direction: column; gap: 1rem; }
.field-row { display: flex; gap: 0.75rem; }
.flex-1 { flex: 1; }
.w-24 { width: 6rem; }
.text-center { text-align: center; }
.opacity-50 { opacity: 0.5; transition: opacity 0.2s; }

.field-group { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.625rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.40); }
.field-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); border-radius: 0.875rem; padding: 0.6875rem 0.875rem; font-size: 0.875rem; font-family: var(--font-sans); color: rgba(255,255,255,0.88); outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; caret-color: var(--color-primary); resize: none; }
.field-input::placeholder { color: rgba(255,255,255,0.22); }
.field-input:focus, .tags-input-wrap:focus-within { border-color: rgba(255,59,48,0.45); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(255,59,48,0.10); }
.field-textarea { min-height: 5rem; }

.checkbox-wrap { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: rgba(255,255,255,0.7); cursor: pointer; }

/* ── Tags Input ─────────────────────────────────────────────────────────── */
.tags-input-wrap {
	display: flex; flex-wrap: wrap; gap: 0.375rem; align-items: center;
	padding: 0.375rem 0.5rem; min-height: 2.75rem;
}
.tag {
	display: inline-flex; align-items: center; gap: 0.375rem;
	background: rgba(255,255,255,0.1); border-radius: 0.375rem;
	padding: 0.125rem 0.375rem 0.125rem 0.5rem; font-size: 0.75rem;
	color: #fff;
}
.tag-remove { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; padding: 0.125rem; display: flex; transition: color 0.15s; }
.tag-remove:hover { color: var(--color-primary); }
.tag-input-field { background: none; border: none; outline: none; color: inherit; font-size: 0.875rem; font-family: inherit; flex: 1; min-width: 6rem; padding: 0.25rem; }

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

.tech-list { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.tech-chip { font-size: 0.6875rem; font-weight: 500; color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.06); padding: 0.125rem 0.5rem; border-radius: 9999px; }

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
