<script lang="ts">
	/**
	 * dashboard/projects/+page.svelte — Proyectos
	 *
	 * [skill: typescript-advanced-types]
	 *
	 * [skill: frontend-design — VORTEX]
	 *  - Split Layout responsivo
	 *  - Gestión avanzada de tags
	 *  - Previsualización múltiple de imágenes (DB y locales)
	 *  - Toggles interactivos con lógica condicional
	 */
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import type { ProjectActionData, ProjectWithRelations, ProjectImage } from '$lib/types/projects';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// ── Estado del Formulario ────────────────────────────────────────────────
	let loading = $state(false);
	let editingId = $state<string | null>(null);

	let formName        = $state('');
	let formDesc        = $state('');
	let formRepo        = $state('');
	let formLive        = $state('');
	let formFeatured    = $state(false);
	let formTeam        = $state(false);
	let formSort        = $state(0);

	// Tecnologías
	let formTechs       = $state<string[]>([]);
	let techInput       = $state('');

	// Contribución (solo si es Team)
	let formContrib     = $state('');

	// Imágenes
	let existingImages  = $state<ProjectImage[]>([]);
	let deletedImageIds = $state<string[]>([]);
	
	let newImageFiles   = $state<File[]>([]);
	let newImagePreviews= $state<string[]>([]);

	// ── Toast ────────────────────────────────────────────────────────────────
	const typedForm = $derived(form as ProjectActionData | null);
	let toastVisible = $state(false);
	$effect(() => {
		if (typedForm?.result) {
			toastVisible = true;
			if (typedForm.result.type === 'success') resetForm();
			const timer = setTimeout(() => { toastVisible = false; }, 4000);
			return () => clearTimeout(timer);
		}
	});

	// ── Acciones de UI ───────────────────────────────────────────────────────
	function editProject(project: ProjectWithRelations) {
		editingId     = project.id;
		formName      = project.name;
		formDesc      = project.description;
		formRepo      = project.repo_url || '';
		formLive      = project.live_url || '';
		formFeatured  = project.is_featured;
		formTeam      = project.is_team;
		formSort      = project.sort_order;
		formContrib   = project.contributions[0]?.description || '';
		formTechs     = project.technologies.map(t => t.name);
		
		existingImages  = [...project.images];
		deletedImageIds = [];
		clearNewImages();
		
		document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function resetForm() {
		editingId     = null;
		formName      = '';
		formDesc      = '';
		formRepo      = '';
		formLive      = '';
		formFeatured  = false;
		formTeam      = false;
		formContrib   = '';
		formTechs     = [];
		techInput     = '';
		existingImages = [];
		deletedImageIds = [];
		clearNewImages();
		formSort      = data.projects.length * 10 + 10;
	}

	$effect(() => {
		if (!editingId && formSort === 0) {
			formSort = data.projects.length * 10 + 10;
		}
	});

	// ── Lógica de Tags ───────────────────────────────────────────────────────
	function addTech(e: KeyboardEvent | Event) {
		const val = techInput.trim();
		if (val && !formTechs.includes(val)) formTechs = [...formTechs, val];
		techInput = '';
	}

	function handleTechKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTech(e);
		}
	}

	function removeTech(tech: string) {
		formTechs = formTechs.filter(t => t !== tech);
	}

	// ── Lógica de Imágenes ───────────────────────────────────────────────────
	function removeExistingImage(imageId: string) {
		existingImages = existingImages.filter(img => img.id !== imageId);
		deletedImageIds = [...deletedImageIds, imageId];
	}

	function onNewImagesChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			const files = Array.from(input.files);
			newImageFiles = files;
			// Crear previews
			newImagePreviews.forEach(url => URL.revokeObjectURL(url)); // Limpiar memoria
			newImagePreviews = files.map(file => URL.createObjectURL(file));
		}
	}

	function clearNewImages() {
		newImagePreviews.forEach(url => URL.revokeObjectURL(url));
		newImagePreviews = [];
		newImageFiles = [];
		const input = document.getElementById('images_files') as HTMLInputElement;
		if (input) input.value = '';
	}
</script>

<svelte:head>
	<title>Proyectos — Portfolio Admin</title>
</svelte:head>

<!-- Toast -->
{#if toastVisible && typedForm?.result}
	<div class="toast" class:toast--success={typedForm.result.type === 'success'} class:toast--error={typedForm.result.type === 'error'} role="status" aria-live="polite">
		<span class="toast-icon" aria-hidden="true">
			{#if typedForm.result.type === 'success'}
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8l3.5 3.5L13 4"/></svg>
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
		<h2 class="page-title">Portafolio de Proyectos</h2>
		<p class="page-subtitle">Gestiona tus proyectos destacados, tecnologías usadas y galería de imágenes.</p>
	</div>

	<div class="layout-grid">
		<!-- ══ COLUMNA IZQUIERDA: Formulario ═══════════════════════════════ -->
		<div class="form-wrapper">
			<div class="panel form-panel">
				<div class="section-header">
					<p class="section-label">{editingId ? 'Editar proyecto' : 'Añadir proyecto'}</p>
					{#if editingId}
						<button type="button" class="cancel-btn" onclick={resetForm}>Cancelar</button>
					{/if}
				</div>

				<form
					method="POST"
					action={editingId ? "?/edit" : "?/add"}
					enctype="multipart/form-data"
					class="project-form"
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

					<!-- Arrays ocultos -->
					<input type="hidden" name="technologies" value={JSON.stringify(formTechs)} />
					<input type="hidden" name="deleted_images_ids" value={JSON.stringify(deletedImageIds)} />

					<div class="field-group">
						<label for="name" class="field-label">Nombre del proyecto</label>
						<input id="name" name="name" type="text" class="field-input"
							bind:value={formName} placeholder="Ej: VORTEX CMS" required />
					</div>

					<div class="field-group">
						<label for="description" class="field-label">Descripción</label>
						<textarea id="description" name="description" class="field-input field-textarea"
							bind:value={formDesc} placeholder="De qué trata el proyecto, objetivo principal..." required></textarea>
					</div>

					<div class="field-row">
						<div class="field-group flex-1">
							<label for="repo_url" class="field-label">Repositorio (URL)</label>
							<input id="repo_url" name="repo_url" type="url" class="field-input"
								bind:value={formRepo} placeholder="https://github.com/..." />
						</div>
						<div class="field-group flex-1">
							<label for="live_url" class="field-label">Sitio en vivo (URL)</label>
							<input id="live_url" name="live_url" type="url" class="field-input"
								bind:value={formLive} placeholder="https://..." />
						</div>
					</div>

					<div class="toggles-row">
						<div class="checkbox-wrap">
							<input id="is_featured" name="is_featured" type="checkbox" bind:checked={formFeatured} />
							<label for="is_featured">Proyecto Destacado</label>
						</div>
						<div class="checkbox-wrap">
							<input id="is_team" name="is_team" type="checkbox" bind:checked={formTeam} />
							<label for="is_team">Trabajo en Equipo</label>
						</div>
					</div>

					{#if formTeam}
						<div class="field-group fade-in">
							<label for="contribution_desc" class="field-label">Tu Contribución en el Equipo</label>
							<textarea id="contribution_desc" name="contribution_desc" class="field-input field-textarea-small"
								bind:value={formContrib} placeholder="Ej: Lideré el desarrollo del Frontend usando SvelteKit..."></textarea>
						</div>
					{/if}

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
								bind:value={techInput} onkeydown={handleTechKeydown} onblur={addTech}
								placeholder={formTechs.length === 0 ? "Ej: SvelteKit, Supabase" : ""} 
							/>
						</div>
					</div>

					<div class="field-group">
						<div class="images-header">
							<p class="field-label">Galería de Imágenes</p>
							<label for="images_files" class="mini-upload-btn">
								+ Seleccionar
							</label>
						</div>
						<input id="images_files" name="images_files" type="file" multiple accept="image/webp" class="file-hidden" onchange={onNewImagesChange} />
						
						<!-- Previsualización de imágenes -->
						{#if existingImages.length > 0 || newImagePreviews.length > 0}
							<div class="image-previews-grid">
								<!-- Imágenes de DB -->
								{#each existingImages as img (img.id)}
									<div class="img-preview-card">
										<img src={img.url} alt="Preview" class="preview-img" />
										<button type="button" class="remove-img-btn" onclick={() => removeExistingImage(img.id)} title="Eliminar de la base de datos">
											<svg width="12" height="12" viewBox="0 0 14 14" stroke="currentColor" stroke-width="2"><path d="M2 2l10 10M12 2L2 12"/></svg>
										</button>
									</div>
								{/each}
								<!-- Imágenes Nuevas -->
								{#each newImagePreviews as url, i}
									<div class="img-preview-card new-img-badge">
										<img src={url} alt="New Preview" class="preview-img" />
										<span class="new-badge">Nuevo</span>
									</div>
								{/each}
							</div>
							{#if newImagePreviews.length > 0}
								<button type="button" class="clear-selection-btn" onclick={clearNewImages}>Limpiar selección actual</button>
							{/if}
						{:else}
							<div class="empty-images-box">
								Sin imágenes
							</div>
						{/if}
					</div>

					<div class="field-group w-24">
						<label for="sort_order" class="field-label">Orden</label>
						<input id="sort_order" name="sort_order" type="number" class="field-input text-center" bind:value={formSort} required />
					</div>

					<button type="submit" disabled={loading} class="save-btn">
						{#if loading}
							<span class="spinner" aria-hidden="true"></span>
							{editingId ? 'Guardando...' : 'Añadiendo...'}
						{:else}
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8l3.5 3.5L13 4"/></svg>
							{editingId ? 'Guardar cambios' : 'Añadir proyecto'}
						{/if}
					</button>
				</form>
			</div>
		</div>

		<!-- ══ COLUMNA DERECHA: Lista de Proyectos ═════════════════════════ -->
		<div class="list-wrapper">
			{#if data.projects.length === 0}
				<div class="empty-state panel">
					<svg class="empty-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 21V9"/></svg>
					<p class="empty-text">No hay proyectos en el portafolio.</p>
				</div>
			{:else}
				<div class="cards-grid">
					{#each data.projects as proj (proj.id)}
						<div class="project-card panel group">
							{#if proj.images.length > 0}
								<div class="project-cover" style="background-image: url({proj.images[0].url});">
									<!-- Overlay degradado para mejorar legibilidad del texto superior si se superpone -->
								</div>
							{:else}
								<div class="project-cover empty-cover">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
								</div>
							{/if}

							<div class="project-content">
								<div class="card-header">
									<h3 class="project-title">{proj.name}</h3>
									<div class="badges">
										{#if proj.is_featured}<span class="badge badge-featured">Destacado</span>{/if}
										{#if proj.is_team}<span class="badge badge-team">Equipo</span>{/if}
										<span class="sort-badge">#{proj.sort_order}</span>
									</div>
								</div>

								<p class="project-desc">{proj.description}</p>
								
								{#if proj.technologies.length > 0}
									<div class="tech-list">
										{#each proj.technologies as tech}
											<span class="tech-chip">{tech.name}</span>
										{/each}
									</div>
								{/if}

								<div class="card-footer">
									<div class="links-row">
										{#if proj.repo_url}
											<a href={proj.repo_url} target="_blank" rel="noopener noreferrer" class="ext-link" title="Repositorio">
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
											</a>
										{/if}
										{#if proj.live_url}
											<a href={proj.live_url} target="_blank" rel="noopener noreferrer" class="ext-link" title="Ver en vivo">
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
											</a>
										{/if}
									</div>

									<div class="card-actions">
										<button type="button" class="action-btn" onclick={() => editProject(proj)}>Editar</button>
										<form method="POST" action="?/delete" class="inline-form" use:enhance={() => { loading = true; return async ({ update }) => { await update(); loading = false; }; }}>
											<input type="hidden" name="id" value={proj.id} />
											<button type="submit" class="action-btn action-btn--delete" onclick={(e) => { if(!confirm(`¿Eliminar el proyecto "${proj.name}" y todas sus imágenes?`)) e.preventDefault(); }}>Borrar</button>
										</form>
									</div>
								</div>
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
.page { padding: 1.75rem 2rem; max-width: 80rem; display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { display: flex; flex-direction: column; gap: 0.25rem; }
.eyebrow { font-size: 0.625rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-primary); margin: 0; }
.page-title { font-size: clamp(1.25rem, 2.5vw, 1.75rem); font-weight: 300; letter-spacing: -0.03em; color: rgba(255,255,255,0.90); margin: 0; }
.page-subtitle { font-size: 0.8125rem; color: rgba(255,255,255,0.45); margin: 0; }

.layout-grid { display: grid; grid-template-columns: 26rem 1fr; gap: 1.5rem; align-items: start; }
@media (max-width: 1024px) { .layout-grid { grid-template-columns: 1fr; } }

/* ── Formulario ─────────────────────────────────────────────────────────── */
.form-panel { border-radius: 1.5rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; position: sticky; top: 1.5rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-label { font-size: 0.625rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.40); margin: 0; }
.cancel-btn { background: none; border: none; font-size: 0.6875rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: color 0.15s; }
.cancel-btn:hover { color: var(--color-primary); }

.project-form { display: flex; flex-direction: column; gap: 1rem; }
.field-row { display: flex; gap: 0.75rem; }
.flex-1 { flex: 1; }
.w-24 { width: 6rem; }
.text-center { text-align: center; }
.fade-in { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

.field-group { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.625rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.40); margin: 0; }
.field-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); border-radius: 0.875rem; padding: 0.6875rem 0.875rem; font-size: 0.875rem; font-family: var(--font-sans); color: rgba(255,255,255,0.88); outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; caret-color: var(--color-primary); resize: none; }
.field-input::placeholder { color: rgba(255,255,255,0.22); }
.field-input:focus, .tags-input-wrap:focus-within { border-color: rgba(255,59,48,0.45); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(255,59,48,0.10); }
.field-textarea { min-height: 5rem; }
.field-textarea-small { min-height: 3.5rem; }

/* Toggles */
.toggles-row { display: flex; gap: 1.5rem; padding: 0.5rem 0; }
.checkbox-wrap { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: rgba(255,255,255,0.8); cursor: pointer; font-weight: 500; }
.checkbox-wrap input[type="checkbox"] { accent-color: var(--color-primary); width: 1.125rem; height: 1.125rem; cursor: pointer; }

/* Tags Input */
.tags-input-wrap { display: flex; flex-wrap: wrap; gap: 0.375rem; align-items: center; padding: 0.375rem 0.5rem; min-height: 2.75rem; }
.tag { display: inline-flex; align-items: center; gap: 0.375rem; background: rgba(255,255,255,0.1); border-radius: 0.375rem; padding: 0.125rem 0.375rem 0.125rem 0.5rem; font-size: 0.75rem; color: #fff; }
.tag-remove { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; padding: 0.125rem; display: flex; transition: color 0.15s; }
.tag-remove:hover { color: var(--color-primary); }
.tag-input-field { background: none; border: none; outline: none; color: inherit; font-size: 0.875rem; font-family: inherit; flex: 1; min-width: 6rem; padding: 0.25rem; }

/* Imágenes Upload & Previews */
.images-header { display: flex; justify-content: space-between; align-items: center; }
.mini-upload-btn { font-size: 0.6875rem; font-weight: 600; color: var(--color-primary); cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 9999px; background: rgba(255,59,48,0.08); transition: background 0.15s; }
.mini-upload-btn:hover { background: rgba(255,59,48,0.15); }
.file-hidden { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

.empty-images-box { background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 1.5rem; text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.3); }

.image-previews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr)); gap: 0.5rem; }
.img-preview-card { position: relative; width: 100%; aspect-ratio: 1; border-radius: 0.5rem; overflow: hidden; background: #000; border: 1px solid rgba(255,255,255,0.1); }
.preview-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; }
.remove-img-btn { position: absolute; top: 0.25rem; right: 0.25rem; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 1.25rem; height: 1.25rem; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(4px); transition: background 0.15s, transform 0.15s; }
.remove-img-btn:hover { background: var(--color-primary); transform: scale(1.1); }
.new-img-badge::after { content: ''; position: absolute; inset: 0; border: 2px solid var(--color-primary); border-radius: 0.5rem; pointer-events: none; }
.new-badge { position: absolute; bottom: 0.25rem; left: 0.25rem; background: var(--color-primary); color: #fff; font-size: 0.5rem; font-weight: 700; padding: 0.125rem 0.25rem; border-radius: 0.25rem; text-transform: uppercase; }

.clear-selection-btn { background: none; border: none; font-size: 0.6875rem; color: rgba(255,255,255,0.4); cursor: pointer; text-align: left; margin-top: 0.25rem; }
.clear-selection-btn:hover { color: #fff; text-decoration: underline; }

/* Botón Submit */
.save-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; font-family: var(--font-sans); letter-spacing: 0.05em; text-transform: uppercase; color: #fff; border: none; cursor: pointer; background: var(--color-primary); box-shadow: 0 0 24px rgba(255,59,48,0.40); transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s; margin-top: 0.5rem; }
.save-btn:hover:not(:disabled) { transform: scale(1.04); box-shadow: 0 0 32px rgba(255,59,48,0.55); }
.save-btn:disabled { opacity: 0.50; cursor: not-allowed; }
.spinner { width: 0.875rem; height: 0.875rem; border: 2px solid rgba(255,255,255,0.30); border-top-color: #fff; border-radius: 50%; animation: spin 0.65s linear infinite; }

/* ── Grid de Proyectos (Derecha) ────────────────────────────────────────── */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr)); gap: 1.5rem; align-items: start; }

.project-card { padding: 0; border-radius: 1.25rem; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.06); transition: border-color 0.15s, box-shadow 0.15s; overflow: hidden; }
.project-card:hover { border-color: rgba(255,59,48,0.25); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }

.project-cover { height: 12rem; background-size: cover; background-position: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
.empty-cover { background: rgba(255,255,255,0.02); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.1); }

.project-content { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; flex: 1; }

.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.project-title { font-size: 1.125rem; font-weight: 600; color: #fff; margin: 0; line-height: 1.3; }
.badges { display: flex; flex-wrap: wrap; gap: 0.375rem; align-items: center; }
.badge { font-size: 0.625rem; font-weight: 600; padding: 0.125rem 0.375rem; border-radius: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
.badge-featured { background: rgba(255,59,48,0.15); color: var(--color-primary); border: 1px solid rgba(255,59,48,0.3); }
.badge-team { background: rgba(52, 211, 153, 0.15); color: oklch(0.79 0.17 155); border: 1px solid rgba(52, 211, 153, 0.3); }
.sort-badge { font-size: 0.625rem; font-weight: 600; padding: 0.125rem 0.375rem; border-radius: 0.25rem; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); }

.project-desc { font-size: 0.8125rem; color: rgba(255,255,255,0.7); line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.tech-list { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.tech-chip { font-size: 0.6875rem; font-weight: 500; color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.06); padding: 0.125rem 0.5rem; border-radius: 9999px; }

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); }
.links-row { display: flex; gap: 0.5rem; }
.ext-link { display: flex; align-items: center; justify-content: center; width: 1.75rem; height: 1.75rem; border-radius: 50%; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); transition: background 0.15s, color 0.15s; }
.ext-link:hover { background: rgba(255,255,255,0.15); color: #fff; }

.card-actions { display: flex; gap: 0.375rem; opacity: 0; transition: opacity 0.15s; }
.project-card:hover .card-actions { opacity: 1; }
.action-btn { background: rgba(255,255,255,0.06); border: none; padding: 0.25rem 0.625rem; border-radius: 0.375rem; font-size: 0.6875rem; font-weight: 500; color: rgba(255,255,255,0.6); cursor: pointer; transition: background 0.15s, color 0.15s; }
.action-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
.action-btn--delete:hover { background: rgba(255,59,48,0.15); color: var(--color-primary); }

.inline-form { display: contents; }

.empty-state { padding: 4rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; border-radius: 1.5rem; text-align: center; }
.empty-icon { color: rgba(255,255,255,0.2); }
.empty-text { font-size: 0.875rem; color: rgba(255,255,255,0.4); margin: 0; }
</style>
