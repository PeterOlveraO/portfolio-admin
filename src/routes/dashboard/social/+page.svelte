<script lang="ts">
	/**
	 * dashboard/social/+page.svelte — Redes Sociales
	 *
	 * [skill: typescript-advanced-types]
	 *  - typedForm hace narrowing del ActionData
	 *  - SocialLink para el tipado de los elementos
	 *
	 * [skill: frontend-design — VORTEX]
	 *  - Layout 2 columnas en desktop: Formulario fijo (sticky) + Grid de cards
	 *  - Cards glass con hover effects sutiles y acciones integradas
	 *  - Formularios translúcidos
	 *  - Toast reutilizado para feedback visual
	 */
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import type { SocialActionData, SocialLink } from '$lib/types/social';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// ── Estado del formulario ────────────────────────────────────────────────
	let loading = $state(false);
	let editingId = $state<string | null>(null);

	// Valores del formulario en vivo (para pre-llenar o limpiar)
	let formPlatform = $state('');
	let formUrl      = $state('');
	let formIconKey  = $state('');
	let formSort     = $state(0);

	// ── Toast ────────────────────────────────────────────────────────────────
	const typedForm = $derived(form as SocialActionData | null);
	let toastVisible = $state(false);
	$effect(() => {
		if (typedForm?.result) {
			toastVisible = true;
			// Si fue éxito, limpiar formulario
			if (typedForm.result.type === 'success') {
				resetForm();
			}
			const timer = setTimeout(() => { toastVisible = false; }, 4000);
			return () => clearTimeout(timer);
		}
	});

	// ── Acciones de UI ───────────────────────────────────────────────────────
	function editNetwork(link: SocialLink) {
		editingId    = link.id;
		formPlatform = link.platform;
		formUrl      = link.url;
		formIconKey  = link.icon_key;
		formSort     = link.sort_order;
		// Scroll to top smoothly so user sees the form
		document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function resetForm() {
		editingId    = null;
		formPlatform = '';
		formUrl      = '';
		formIconKey  = '';
		formSort     = data.socialLinks.length * 10 + 10; // auto-increment sort suggestion
	}

	// Actualizar sort_order default si cambia la data y no estamos editando
	$effect(() => {
		if (!editingId && formSort === 0) {
			formSort = data.socialLinks.length * 10 + 10;
		}
	});
</script>

<svelte:head>
	<title>Redes Sociales — Portfolio Admin</title>
</svelte:head>

<!-- Toast de resultado -->
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

<div class="page">
	<div class="page-header">
		<p class="eyebrow">Panel de administración</p>
		<h2 class="page-title">Redes Sociales</h2>
		<p class="page-subtitle">Gestiona tus enlaces y presencia en otras plataformas.</p>
	</div>

	<div class="layout-grid">
		<!-- ══ COLUMNA IZQUIERDA: Formulario ═══════════════════════════════ -->
		<div class="form-wrapper">
			<div class="panel form-panel">
				<div class="section-header">
					<p class="section-label">{editingId ? 'Editar red social' : 'Añadir nueva red'}</p>
					{#if editingId}
						<button type="button" class="cancel-btn" onclick={resetForm}>Cancelar</button>
					{/if}
				</div>

				<form
					method="POST"
					action={editingId ? "?/edit" : "?/add"}
					class="social-form"
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
						<label for="platform" class="field-label">Plataforma</label>
						<input id="platform" name="platform" type="text" class="field-input"
							bind:value={formPlatform} placeholder="Ej: GitHub, LinkedIn" required />
					</div>

					<div class="field-group">
						<label for="url" class="field-label">URL del perfil</label>
						<input id="url" name="url" type="url" class="field-input"
							bind:value={formUrl} placeholder="https://..." required />
					</div>

					<div class="field-row">
						<div class="field-group flex-1">
							<label for="icon_key" class="field-label">Clave del icono</label>
							<input id="icon_key" name="icon_key" type="text" class="field-input"
								bind:value={formIconKey} placeholder="ej: github, twitter" required />
						</div>
						<div class="field-group w-24">
							<label for="sort_order" class="field-label">Orden</label>
							<input id="sort_order" name="sort_order" type="number" class="field-input text-center"
								bind:value={formSort} required />
						</div>
					</div>

					<button type="submit" disabled={loading} class="save-btn">
						{#if loading}
							<span class="spinner" aria-hidden="true"></span>
							{editingId ? 'Guardando...' : 'Añadiendo...'}
						{:else}
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M3 8l3.5 3.5L13 4"/>
							</svg>
							{editingId ? 'Guardar cambios' : 'Añadir red social'}
						{/if}
					</button>
				</form>
			</div>
		</div>

		<!-- ══ COLUMNA DERECHA: Lista de redes ═════════════════════════════ -->
		<div class="list-wrapper">
			{#if data.socialLinks.length === 0}
				<div class="empty-state panel">
					<svg class="empty-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
						<path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
					</svg>
					<p class="empty-text">No hay redes sociales configuradas.</p>
				</div>
			{:else}
				<div class="cards-grid">
					{#each data.socialLinks as link (link.id)}
						<div class="social-card panel group">
							<div class="card-header">
								<div class="icon-badge">
									<!-- Icon preview genérico basado en la primera letra de icon_key -->
									{link.icon_key.charAt(0).toUpperCase()}
								</div>
								<div class="card-meta">
									<h3 class="platform-name">{link.platform}</h3>
									<span class="sort-badge">#{link.sort_order}</span>
								</div>
							</div>
							
							<a href={link.url} target="_blank" rel="noopener noreferrer" class="link-url">
								{link.url.replace(/^https?:\/\//, '')}
							</a>

							<div class="card-actions">
								<button type="button" class="action-btn action-btn--edit" onclick={() => editNetwork(link)} aria-label="Editar {link.platform}">
									Editar
								</button>
								<form method="POST" action="?/delete" use:enhance={() => { loading = true; return async ({ update }) => { await update(); loading = false; }; }}>
									<input type="hidden" name="id" value={link.id} />
									<button type="submit" class="action-btn action-btn--delete" onclick={(e) => { if(!confirm(`¿Eliminar ${link.platform}?`)) e.preventDefault(); }} aria-label="Eliminar {link.platform}">
										Eliminar
									</button>
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
/* ── Página ───────────────────────────────────────────────────────────────── */
.page {
	padding: 1.75rem 2rem;
	max-width: 68rem;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

/* Header */
.page-header { display: flex; flex-direction: column; gap: 0.25rem; }
.eyebrow {
	font-size: 0.625rem;
	font-weight: 500;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--color-primary);
	margin: 0;
}
.page-title {
	font-size: clamp(1.25rem, 2.5vw, 1.75rem);
	font-weight: 300;
	letter-spacing: -0.03em;
	color: rgba(255,255,255,0.90);
	margin: 0;
}
.page-subtitle {
	font-size: 0.8125rem;
	color: rgba(255,255,255,0.45);
	margin: 0;
}

/* ── Layout Grid ────────────────────────────────────────────────────────── */
.layout-grid {
	display: grid;
	grid-template-columns: 24rem 1fr;
	gap: 1.5rem;
	align-items: start;
}
@media (max-width: 1024px) {
	.layout-grid { grid-template-columns: 1fr; }
}

/* ── Form Panel ─────────────────────────────────────────────────────────── */
.form-panel {
	border-radius: 1.5rem;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
	position: sticky;
	top: 1.5rem;
}

.section-header { 
	display: flex; 
	align-items: center; 
	justify-content: space-between;
}
.section-label {
	font-size: 0.625rem;
	font-weight: 600;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: rgba(255,255,255,0.40);
	margin: 0;
}

.cancel-btn {
	background: none; border: none;
	font-size: 0.6875rem;
	color: rgba(255,255,255,0.4);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	cursor: pointer;
	transition: color 0.15s;
}
.cancel-btn:hover { color: var(--color-primary); }

.social-form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.field-row {
	display: flex;
	gap: 0.75rem;
}
.flex-1 { flex: 1; }
.w-24 { width: 6rem; }
.text-center { text-align: center; }

.field-group {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

.field-label {
	font-size: 0.625rem;
	font-weight: 600;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: rgba(255,255,255,0.40);
}

.field-input {
	width: 100%;
	background: rgba(255,255,255,0.04);
	border: 1px solid rgba(255,255,255,0.10);
	border-radius: 0.875rem;
	padding: 0.6875rem 0.875rem;
	font-size: 0.875rem;
	font-family: var(--font-sans);
	color: rgba(255,255,255,0.88);
	outline: none;
	transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
	caret-color: var(--color-primary);
}
.field-input::placeholder { color: rgba(255,255,255,0.22); }
.field-input:focus {
	border-color: rgba(255,59,48,0.45);
	background: rgba(255,255,255,0.06);
	box-shadow: 0 0 0 3px rgba(255,59,48,0.10);
}

.save-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1.25rem;
	border-radius: 9999px;
	font-size: 0.75rem;
	font-weight: 700;
	font-family: var(--font-sans);
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: #fff;
	border: none;
	cursor: pointer;
	background: var(--color-primary);
	box-shadow: 0 0 24px rgba(255,59,48,0.40);
	transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
	margin-top: 0.5rem;
}
.save-btn:hover:not(:disabled) {
	transform: scale(1.04);
	box-shadow: 0 0 32px rgba(255,59,48,0.55);
}
.save-btn:disabled { opacity: 0.50; cursor: not-allowed; }

/* ── Lista de Cards ─────────────────────────────────────────────────────── */
.cards-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
	gap: 1rem;
}

.social-card {
	border-radius: 1.25rem;
	padding: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	transition: border-color 0.15s, background 0.15s;
}
.social-card:hover {
	border-color: rgba(255,59,48,0.25);
	background: rgba(255,255,255,0.06);
}

.card-header {
	display: flex;
	align-items: center;
	gap: 0.875rem;
}

.icon-badge {
	width: 2.25rem;
	height: 2.25rem;
	border-radius: 0.625rem;
	background: rgba(255,59,48,0.10);
	color: var(--color-primary);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.125rem;
	font-weight: 700;
	flex-shrink: 0;
}

.card-meta {
	flex: 1;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.platform-name {
	font-size: 0.9375rem;
	font-weight: 600;
	color: rgba(255,255,255,0.9);
	margin: 0;
}

.sort-badge {
	font-size: 0.625rem;
	font-weight: 600;
	padding: 0.125rem 0.375rem;
	border-radius: 0.25rem;
	background: rgba(255,255,255,0.06);
	color: rgba(255,255,255,0.4);
}

.link-url {
	font-size: 0.8125rem;
	color: rgba(255,255,255,0.5);
	text-decoration: none;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	transition: color 0.15s;
}
.link-url:hover { color: var(--color-primary); text-decoration: underline; }

.card-actions {
	display: flex;
	gap: 0.5rem;
	margin-top: 0.25rem;
	padding-top: 1rem;
	border-top: 1px solid rgba(255,255,255,0.06);
}

.action-btn {
	background: rgba(255,255,255,0.04);
	border: 1px solid rgba(255,255,255,0.08);
	padding: 0.375rem 0.75rem;
	border-radius: 9999px;
	font-size: 0.6875rem;
	font-weight: 600;
	color: rgba(255,255,255,0.6);
	cursor: pointer;
	transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.action-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

.action-btn--delete:hover {
	background: rgba(255,59,48,0.15);
	border-color: rgba(255,59,48,0.3);
	color: var(--color-primary);
}

/* ── Empty State ────────────────────────────────────────────────────────── */
.empty-state {
	border-radius: 1.5rem;
	padding: 3rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	text-align: center;
}
.empty-icon { color: rgba(255,255,255,0.2); }
.empty-text { font-size: 0.875rem; color: rgba(255,255,255,0.4); margin: 0; }

/* ── Reusable utilities ─────────────────────────────────────────────────── */
.spinner {
	width: 0.875rem; height: 0.875rem;
	border: 2px solid rgba(255,255,255,0.30);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 0.65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Toast */
.toast {
	position: fixed;
	bottom: 1.75rem;
	right: 1.75rem;
	z-index: 50;
	display: flex;
	align-items: center;
	gap: 0.625rem;
	padding: 0.75rem 1.125rem;
	border-radius: 9999px;
	font-size: 0.8125rem;
	font-weight: 500;
	backdrop-filter: blur(20px) saturate(150%);
	-webkit-backdrop-filter: blur(20px) saturate(150%);
	box-shadow: 0 4px 24px rgba(0,0,0,0.4);
	animation: toast-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.toast--success { background: rgba(52, 211, 153, 0.12); border: 1px solid rgba(52, 211, 153, 0.30); color: oklch(0.79 0.17 155); }
.toast--error { background: rgba(255, 59, 48, 0.12); border: 1px solid rgba(255, 59, 48, 0.30); color: var(--color-primary); }
.toast-icon { display: flex; flex-shrink: 0; }

@keyframes toast-in {
	from { opacity: 0; transform: translateY(8px) scale(0.96); }
	to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
