<script lang="ts">
	/**
	 * dashboard/skills/+page.svelte — Habilidades y Categorías
	 *
	 * [skill: typescript-advanced-types]
	 *  - typedForm hace narrowing de SkillsActionData
	 *
	 * [skill: frontend-design — VORTEX]
	 *  - Layout 2 columnas: Sidebar de categorías (izquierda) + Grid de skills (derecha)
	 *  - Modal glass unificado para todos los formularios CRUD
	 *  - Categoría activa resaltada con red-glow sutil
	 */
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import type { SkillsActionData, SkillCategory, Skill } from '$lib/types/skills';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// ── Estado de selección ──────────────────────────────────────────────────
	// Autoseleccionar la primera categoría por defecto si existe
	let selectedCategoryId = $state<string | null>(null);
	$effect(() => {
		if (!selectedCategoryId && data.categories.length > 0) {
			selectedCategoryId = data.categories[0].id;
		}
	});

	let activeCategory = $derived(
		data.categories.find(c => c.id === selectedCategoryId) || null
	);
	
	let visibleSkills = $derived(
		data.skills.filter(s => s.category_id === selectedCategoryId)
	);

	// ── Estado del Modal & Formulario ────────────────────────────────────────
	type ModalMode = 'closed' | 'add_category' | 'edit_category' | 'add_skill' | 'edit_skill';
	let modalMode = $state<ModalMode>('closed');
	let loading   = $state(false);

	let formId       = $state('');
	let formName     = $state('');
	let formIconUrl  = $state('');
	let formSort     = $state(0);

	function openModal(mode: ModalMode, item?: SkillCategory | Skill) {
		modalMode = mode;
		if (item) {
			formId   = item.id;
			formName = item.name;
			formSort = item.sort_order;
			if ('icon_url' in item) {
				formIconUrl = item.icon_url || '';
			}
		} else {
			formId   = '';
			formName = '';
			formIconUrl = '';
			// Sugerir sort_order
			if (mode === 'add_category') {
				formSort = data.categories.length * 10 + 10;
			} else if (mode === 'add_skill') {
				formSort = visibleSkills.length * 10 + 10;
			}
		}
	}

	function closeModal() {
		modalMode = 'closed';
	}

	// ── Toast ────────────────────────────────────────────────────────────────
	const typedForm = $derived(form as SkillsActionData | null);
	let toastVisible = $state(false);
	$effect(() => {
		if (typedForm?.result) {
			toastVisible = true;
			if (typedForm.result.type === 'success') closeModal();
			const timer = setTimeout(() => { toastVisible = false; }, 4000);
			return () => clearTimeout(timer);
		}
	});

	// Alias para helpers en template
	const isCatForm = $derived(modalMode === 'add_category' || modalMode === 'edit_category');
	const isSkillForm = $derived(modalMode === 'add_skill' || modalMode === 'edit_skill');
	const isEdit = $derived(modalMode.startsWith('edit_'));
</script>

<svelte:head>
	<title>Habilidades — Portfolio Admin</title>
</svelte:head>

<!-- Toast -->
{#if toastVisible && typedForm?.result}
	<div class="toast" class:toast--success={typedForm.result.type === 'success'} class:toast--error={typedForm.result.type === 'error'} role="status" aria-live="polite">
		<span class="toast-icon" aria-hidden="true">
			{#if typedForm.result.type === 'success'}
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 8l3.5 3.5L13 4"/>
				</svg>
			{:else}
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
					<circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11h.01"/>
				</svg>
			{/if}
		</span>
		{typedForm.result.message}
	</div>
{/if}

<!-- ══ Modal Formulario ═══════════════════════════════════════════════════ -->
{#if modalMode !== 'closed'}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={closeModal}>
		<div class="modal-content panel" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3 class="modal-title">
					{#if modalMode === 'add_category'}Añadir categoría
					{:else if modalMode === 'edit_category'}Editar categoría
					{:else if modalMode === 'add_skill'}Añadir habilidad
					{:else if modalMode === 'edit_skill'}Editar habilidad{/if}
				</h3>
				<button class="icon-btn" onclick={closeModal} aria-label="Cerrar modal">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<path d="M18 6L6 18M6 6l12 12"/>
					</svg>
				</button>
			</div>

			<form
				method="POST"
				action="?/{modalMode}"
				class="modal-form"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update({ reset: false });
						loading = false;
					};
				}}
			>
				{#if isEdit}
					<input type="hidden" name="id" value={formId} />
				{/if}
				
				{#if isSkillForm}
					<input type="hidden" name="category_id" value={selectedCategoryId} />
				{/if}

				<div class="field-group">
					<label for="name" class="field-label">Nombre</label>
					<input id="name" name="name" type="text" class="field-input" bind:value={formName} placeholder={isCatForm ? 'Ej: Frontend, Backend' : 'Ej: React, Node.js'} required />
				</div>

				{#if isSkillForm}
					<div class="field-group">
						<label for="icon_url" class="field-label">URL del icono (opcional)</label>
						<input id="icon_url" name="icon_url" type="url" class="field-input" bind:value={formIconUrl} placeholder="https://.../icon.svg" />
					</div>
				{/if}

				<div class="field-group w-32">
					<label for="sort_order" class="field-label">Orden</label>
					<input id="sort_order" name="sort_order" type="number" class="field-input" bind:value={formSort} required />
				</div>

				<div class="modal-footer">
					<button type="button" class="cancel-btn" onclick={closeModal} disabled={loading}>Cancelar</button>
					<button type="submit" class="save-btn" disabled={loading}>
						{#if loading}<span class="spinner"></span>{:else}Guardar{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<div class="page">
	<div class="page-header">
		<p class="eyebrow">Panel de administración</p>
		<h2 class="page-title">Habilidades</h2>
		<p class="page-subtitle">Organiza tus herramientas y lenguajes por categorías.</p>
	</div>

	<div class="split-layout">
		<!-- ══ COLUMNA IZQUIERDA: Categorías ══════════════════════════════ -->
		<aside class="categories-panel panel">
			<div class="panel-header">
				<h3 class="panel-title">Categorías</h3>
				<button type="button" class="action-link" onclick={() => openModal('add_category')}>
					+ Añadir
				</button>
			</div>

			{#if data.categories.length === 0}
				<p class="empty-hint">No hay categorías. Crea una para empezar.</p>
			{:else}
				<ul class="cat-list">
					{#each data.categories as cat (cat.id)}
						<li>
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div 
								class="cat-item {selectedCategoryId === cat.id ? 'cat-item--active' : ''}"
								onclick={() => selectedCategoryId = cat.id}
								role="button"
								tabindex="0"
							>
								<span class="cat-name">{cat.name}</span>
								<div class="cat-actions" class:opacity-100={selectedCategoryId === cat.id}>
									<button type="button" class="mini-icon-btn" onclick={(e) => { e.stopPropagation(); openModal('edit_category', cat); }} title="Editar">
										<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 11.5V14h2.5l7.5-7.5-2.5-2.5z"/></svg>
									</button>
									<form method="POST" action="?/delete_category" class="inline-form" use:enhance={() => { loading = true; return async ({ update }) => { await update(); loading = false; }; }}>
										<input type="hidden" name="id" value={cat.id} />
										<button type="submit" class="mini-icon-btn hover-red" onclick={(e) => { e.stopPropagation(); if(!confirm(`¿Eliminar categoría "${cat.name}" y todas sus skills?`)) e.preventDefault(); }} title="Eliminar">
											<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
										</button>
									</form>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</aside>

		<!-- ══ COLUMNA DERECHA: Skills ════════════════════════════════════ -->
		<div class="skills-panel panel">
			{#if !activeCategory}
				<div class="empty-state">
					<p class="empty-text">Selecciona una categoría para ver sus habilidades.</p>
				</div>
			{:else}
				<div class="panel-header border-bottom">
					<h3 class="panel-title">
						Habilidades en <span class="highlight-text">{activeCategory.name}</span>
					</h3>
					<button type="button" class="btn-primary mini-btn" onclick={() => openModal('add_skill')}>
						+ Añadir Habilidad
					</button>
				</div>

				{#if visibleSkills.length === 0}
					<div class="empty-state">
						<p class="empty-text">No hay habilidades en esta categoría.</p>
					</div>
				{:else}
					<div class="skills-grid">
						{#each visibleSkills as skill (skill.id)}
							<div class="skill-card group">
								<div class="skill-info">
									{#if skill.icon_url}
										<img src={skill.icon_url} alt="" class="skill-icon" />
									{:else}
										<div class="skill-icon-placeholder">{skill.name.charAt(0).toUpperCase()}</div>
									{/if}
									<div class="skill-text">
										<span class="skill-name">{skill.name}</span>
										<span class="sort-badge">#{skill.sort_order}</span>
									</div>
								</div>

								<div class="skill-actions">
									<button type="button" class="action-btn" onclick={() => openModal('edit_skill', skill)}>Editar</button>
									<form method="POST" action="?/delete_skill" class="inline-form" use:enhance={() => { loading = true; return async ({ update }) => { await update(); loading = false; }; }}>
										<input type="hidden" name="id" value={skill.id} />
										<button type="submit" class="action-btn action-btn--delete" onclick={(e) => { if(!confirm(`¿Eliminar ${skill.name}?`)) e.preventDefault(); }}>Borrar</button>
									</form>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
/* ── Página ───────────────────────────────────────────────────────────────── */
.page {
	padding: 1.75rem 2rem;
	max-width: 68rem;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.page-header { display: flex; flex-direction: column; gap: 0.25rem; }
.eyebrow { font-size: 0.625rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-primary); margin: 0; }
.page-title { font-size: clamp(1.25rem, 2.5vw, 1.75rem); font-weight: 300; letter-spacing: -0.03em; color: rgba(255,255,255,0.90); margin: 0; }
.page-subtitle { font-size: 0.8125rem; color: rgba(255,255,255,0.45); margin: 0; }

/* ── Split Layout ───────────────────────────────────────────────────────── */
.split-layout {
	display: grid;
	grid-template-columns: 18rem 1fr;
	gap: 1.5rem;
	align-items: start;
}
@media (max-width: 800px) {
	.split-layout { grid-template-columns: 1fr; }
}

/* ── Categorías (Izquierda) ─────────────────────────────────────────────── */
.categories-panel {
	border-radius: 1.5rem;
	padding: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	position: sticky;
	top: 1.5rem;
}

.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.border-bottom {
	padding-bottom: 1rem;
	border-bottom: 1px solid rgba(255,255,255,0.06);
	margin-bottom: 1rem;
}
.panel-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255,255,255,0.85);
	margin: 0;
}
.highlight-text { color: var(--color-primary); }

.action-link {
	background: none; border: none;
	font-size: 0.6875rem; font-weight: 600;
	color: var(--color-primary);
	cursor: pointer; padding: 0;
}
.action-link:hover { text-decoration: underline; }

.empty-hint { font-size: 0.8125rem; color: rgba(255,255,255,0.4); margin: 0; }

.cat-list {
	list-style: none; margin: 0; padding: 0;
	display: flex; flex-direction: column; gap: 0.25rem;
}

.cat-item {
	width: 100%; text-align: left;
	display: flex; justify-content: space-between; align-items: center;
	padding: 0.625rem 0.875rem;
	border-radius: 0.75rem;
	background: transparent;
	border: 1px solid transparent;
	color: rgba(255,255,255,0.6);
	font-size: 0.8125rem;
	cursor: pointer;
	transition: all 0.15s;
}
.cat-item:hover {
	background: rgba(255,255,255,0.04);
	color: rgba(255,255,255,0.9);
}
.cat-item--active {
	background: rgba(255,59,48,0.1);
	border-color: rgba(255,59,48,0.25);
	color: var(--color-primary);
	font-weight: 500;
}

.cat-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.cat-actions {
	display: flex; gap: 0.25rem;
	opacity: 0; transition: opacity 0.15s;
}
.cat-item:hover .cat-actions { opacity: 1; }
.opacity-100 { opacity: 1; }

.mini-icon-btn {
	background: none; border: none; padding: 0.25rem;
	color: inherit; cursor: pointer; border-radius: 0.25rem;
	display: flex; align-items: center; justify-content: center;
	opacity: 0.6; transition: opacity 0.15s, color 0.15s, background 0.15s;
}
.mini-icon-btn:hover { opacity: 1; background: rgba(255,255,255,0.1); }
.hover-red:hover { color: var(--color-primary); background: rgba(255,59,48,0.15); }

.inline-form { display: contents; }

/* ── Skills (Derecha) ───────────────────────────────────────────────────── */
.skills-panel {
	border-radius: 1.5rem;
	padding: 1.5rem;
}

.mini-btn {
	padding: 0.375rem 0.75rem;
	border-radius: 9999px;
	font-size: 0.6875rem; font-weight: 600;
	background: var(--color-primary); color: #fff;
	border: none; cursor: pointer;
	transition: transform 0.15s;
}
.mini-btn:hover { transform: scale(1.05); }

.empty-state { padding: 3rem 0; text-align: center; }
.empty-text { font-size: 0.875rem; color: rgba(255,255,255,0.4); margin: 0; }

.skills-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	gap: 1rem;
}

.skill-card {
	display: flex; flex-direction: column; gap: 1rem;
	padding: 1rem;
	border-radius: 1rem;
	background: rgba(255,255,255,0.03);
	border: 1px solid rgba(255,255,255,0.06);
	transition: background 0.15s, border-color 0.15s;
}
.skill-card:hover {
	background: rgba(255,255,255,0.05);
	border-color: rgba(255,255,255,0.15);
}

.skill-info { display: flex; align-items: center; gap: 0.75rem; }
.skill-icon { width: 2rem; height: 2rem; object-fit: contain; }
.skill-icon-placeholder {
	width: 2rem; height: 2rem; border-radius: 0.5rem;
	background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6);
	display: flex; align-items: center; justify-content: center;
	font-weight: 700; font-size: 0.875rem;
}
.skill-text { display: flex; flex-direction: column; gap: 0.125rem; }
.skill-name { font-size: 0.875rem; font-weight: 500; color: rgba(255,255,255,0.9); }

.sort-badge {
	font-size: 0.625rem; font-weight: 600; padding: 0.125rem 0.25rem; border-radius: 0.25rem;
	background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); width: fit-content;
}

.skill-actions {
	display: flex; gap: 0.375rem;
	opacity: 0; transition: opacity 0.15s;
}
.skill-card:hover .skill-actions { opacity: 1; }

.action-btn {
	background: rgba(255,255,255,0.06); border: none;
	padding: 0.25rem 0.5rem; border-radius: 0.375rem;
	font-size: 0.6875rem; font-weight: 500; color: rgba(255,255,255,0.6);
	cursor: pointer; transition: background 0.15s, color 0.15s;
}
.action-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
.action-btn--delete:hover { background: rgba(255,59,48,0.2); color: var(--color-primary); }

/* ── Modal ──────────────────────────────────────────────────────────────── */
.modal-backdrop {
	position: fixed; inset: 0; z-index: 100;
	background: rgba(0,0,0,0.6);
	backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
	display: flex; align-items: center; justify-content: center;
	padding: 1.5rem;
}

.modal-content {
	width: 100%; max-width: 24rem;
	border-radius: 1.5rem; padding: 1.5rem;
	display: flex; flex-direction: column; gap: 1.25rem;
	box-shadow: 0 20px 40px rgba(0,0,0,0.5);
	animation: modal-in 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
}
@keyframes modal-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-header { display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-size: 1rem; font-weight: 600; color: #fff; margin: 0; }

.icon-btn {
	background: none; border: none; color: rgba(255,255,255,0.5);
	cursor: pointer; padding: 0.25rem; border-radius: 50%;
	display: flex; align-items: center; justify-content: center;
	transition: background 0.15s, color 0.15s;
}
.icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

.modal-form { display: flex; flex-direction: column; gap: 1rem; }

.field-group { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.625rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.40); }
.field-input {
	width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10);
	border-radius: 0.75rem; padding: 0.625rem 0.875rem; font-size: 0.875rem; font-family: var(--font-sans);
	color: rgba(255,255,255,0.88); outline: none; transition: border-color 0.15s, box-shadow 0.15s;
}
.field-input:focus { border-color: rgba(255,59,48,0.45); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(255,59,48,0.10); }

.w-32 { width: 8rem; }

.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
.cancel-btn {
	background: transparent; border: 1px solid rgba(255,255,255,0.1);
	color: rgba(255,255,255,0.6); padding: 0.625rem 1rem; border-radius: 9999px;
	font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: background 0.15s, color 0.15s;
}
.cancel-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }

.save-btn {
	background: var(--color-primary); border: none; color: #fff;
	padding: 0.625rem 1.25rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;
	cursor: pointer; box-shadow: 0 0 16px rgba(255,59,48,0.4); transition: transform 0.15s, box-shadow 0.15s;
	display: flex; align-items: center; justify-content: center; min-width: 6rem;
}
.save-btn:hover:not(:disabled) { transform: scale(1.04); box-shadow: 0 0 24px rgba(255,59,48,0.55); }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Toast ──────────────────────────────────────────────────────────────── */
.toast { position: fixed; bottom: 1.75rem; right: 1.75rem; z-index: 200; display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem 1.125rem; border-radius: 9999px; font-size: 0.8125rem; font-weight: 500; backdrop-filter: blur(20px) saturate(150%); -webkit-backdrop-filter: blur(20px) saturate(150%); box-shadow: 0 4px 24px rgba(0,0,0,0.4); animation: toast-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both; }
.toast--success { background: rgba(52, 211, 153, 0.12); border: 1px solid rgba(52, 211, 153, 0.30); color: oklch(0.79 0.17 155); }
.toast--error { background: rgba(255, 59, 48, 0.12); border: 1px solid rgba(255, 59, 48, 0.30); color: var(--color-primary); }
.toast-icon { display: flex; flex-shrink: 0; }
@keyframes toast-in { from { opacity: 0; transform: translateY(8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
</style>
