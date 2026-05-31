<script lang="ts">
	/**
	 * dashboard/profile/+page.svelte — Sección Perfil
	 *
	 * [skill: typescript-advanced-types]
	 *  - PageData/ActionData inferidos de $types
	 *  - ProfileActionResult: narrowing via `form?.result.type` en el toast
	 *  - photoPreview: string | null — no `any`
	 *  - hasProfile: type guard implícito con `data.profile !== null`
	 *
	 * [skill: frontend-design — VORTEX]
	 *  - Secciones en paneles glass (panel) con radius generoso
	 *  - Foto de perfil: círculo con red-glow, overlay de cámara en hover
	 *  - Toast: glass tintado rojo/verde con backdrop-filter
	 *  - Inputs: misma estética que el login (glass transparente, focus rojo)
	 *  - Botón: btn-primary rojo + hover:scale
	 *  - Jerarquía de texto: eyebrow 10px uppercase + títulos font-weight 300
	 */
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import type { ProfileActionData } from '$lib/types/profile';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// ── Preview local de la foto antes de subir ───────────────────────────
	let photoPreview = $state<string | null>(null);
	let photoFile    = $state<File | null>(null);
	let cvFileName   = $state<string | null>(null);
	let loading      = $state(false);

	// Inicializar photoPreview de forma reactiva cuando lleguen los datos
	$effect(() => {
		if (data.profile?.photo_url && !photoFile) {
			photoPreview = data.profile.photo_url;
		}
	});

	// ── Toast: se muestra cuando form tiene resultado ─────────────────────
	// Castear ActionData al tipo concreto para poder hacer narrowing.
	const typedForm = $derived(form as ProfileActionData | null);
	let toastVisible = $state(false);
	$effect(() => {
		if (typedForm?.result) {
			toastVisible = true;
			const timer = setTimeout(() => { toastVisible = false; }, 4000);
			return () => clearTimeout(timer);
		}
	});

	// ── Manejar selección de foto con preview local ───────────────────────
	function onPhotoChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file  = input.files?.[0];
		if (!file) return;
		photoFile   = file;
		photoPreview = URL.createObjectURL(file);
	}

	// ── Manejar selección de PDF ──────────────────────────────────────────
	function onCvChange(e: Event) {
		const input  = e.target as HTMLInputElement;
		const file   = input.files?.[0];
		cvFileName   = file?.name ?? null;
	}

	// ── Alias para legibilidad ────────────────────────────────────────────
	const profile = $derived(data.profile);
</script>

<svelte:head>
	<title>Perfil — Portfolio Admin</title>
</svelte:head>

<!-- Toast de resultado — posición fija, aparece al guardar -->
{#if toastVisible && typedForm?.result}
	<div
		class="toast"
		class:toast--success={typedForm.result.type === 'success'}
		class:toast--error={typedForm.result.type === 'error'}
		role="status"
		aria-live="polite"
	>
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
		<h2 class="page-title">Perfil</h2>
		<p class="page-subtitle">Información pública de tu portafolio personal.</p>
	</div>

	<form
		method="POST"
		action="?/save"
		enctype="multipart/form-data"
		class="profile-form"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update({ reset: false });
				loading = false;
				// Refrescar preview con URL del servidor si photo_url cambió
				if (data.profile?.photo_url) {
					photoPreview = data.profile.photo_url;
				}
			};
		}}
	>
		<!-- ID oculto para diferenciar INSERT vs UPDATE -->
		{#if profile?.id}
			<input type="hidden" name="id" value={profile.id} />
		{/if}

		<!-- ══ SECCIÓN: Foto de perfil ══════════════════════════════════════ -->
		<div class="section panel">
			<div class="section-header">
				<p class="section-label">Foto de perfil</p>
			</div>
			<div class="photo-area">
				<!-- Círculo de avatar — overlay de cámara en hover -->
				<label for="photo-input" class="photo-wrap" title="Cambiar foto">
					{#if photoPreview}
						<img src={photoPreview} alt="Foto de perfil actual" class="photo-img" />
					{:else}
						<div class="photo-placeholder" aria-hidden="true">
							<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
								<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"/>
							</svg>
						</div>
					{/if}
					<div class="photo-overlay" aria-hidden="true">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
							<circle cx="12" cy="13" r="4"/>
						</svg>
					</div>
				</label>
				<input
					id="photo-input"
					name="photo_file"
					type="file"
					accept="image/webp"
					class="file-hidden"
					onchange={onPhotoChange}
				/>
				<!-- URL actual como campo oculto para no perderla si no se cambia -->
				<input type="hidden" name="photo_url_current" value={profile?.photo_url ?? ''} />
				<div class="photo-meta">
					<p class="photo-hint">JPG, PNG, WebP · máx. 5 MB</p>
					<p class="photo-hint">Haz clic en la imagen para cambiarla</p>
				</div>
			</div>
		</div>

		<!-- ══ SECCIÓN: Información general ════════════════════════════════ -->
		<div class="section panel">
			<div class="section-header">
				<p class="section-label">Información general</p>
			</div>
			<div class="fields-grid">
				<div class="field-group field-group--full">
					<label for="name" class="field-label">Nombre completo</label>
					<input id="name" name="name" type="text" class="field-input"
						value={profile?.name ?? ''} placeholder="Tu nombre completo" required />
				</div>
				<div class="field-group">
					<label for="role" class="field-label">Rol / Cargo</label>
					<input id="role" name="role" type="text" class="field-input"
						value={profile?.role ?? ''} placeholder="Frontend Developer" />
				</div>
				<div class="field-group">
					<label for="location" class="field-label">Ubicación</label>
					<input id="location" name="location" type="text" class="field-input"
						value={profile?.location ?? ''} placeholder="Ciudad, País" />
				</div>
				<div class="field-group">
					<label for="email" class="field-label">Email de contacto</label>
					<input id="email" name="email" type="email" class="field-input"
						value={profile?.email ?? ''} placeholder="tu@email.com" />
				</div>
				<div class="field-group field-group--full">
					<label for="tagline" class="field-label">Tagline</label>
					<input id="tagline" name="tagline" type="text" class="field-input"
						value={profile?.tagline ?? ''} placeholder="Una frase breve que te describe" />
				</div>
			</div>
		</div>

		<!-- ══ SECCIÓN: Bio / About ═════════════════════════════════════════ -->
		<div class="section panel">
			<div class="section-header">
				<p class="section-label">Sobre mí</p>
			</div>
			<div class="field-group">
				<label for="about" class="field-label">Descripción larga</label>
				<textarea id="about" name="about" class="field-input field-textarea"
					placeholder="Cuéntale al mundo quién eres, qué haces y qué te apasiona..."
					rows="6">{profile?.about ?? ''}</textarea>
			</div>
		</div>

		<!-- ══ SECCIÓN: CV / Documento ══════════════════════════════════════ -->
		<div class="section panel">
			<div class="section-header">
				<p class="section-label">Currículum Vitae</p>
			</div>
			<div class="cv-area">
				<!-- Mostrar link al PDF actual si existe -->
				{#if profile?.cv_pdf_url}
					<a href={profile.cv_pdf_url} target="_blank" rel="noopener noreferrer" class="cv-link">
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M10 2v4h4"/>
						</svg>
						Ver CV actual
					</a>
				{/if}

				<label for="cv-input" class="cv-upload-btn">
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M8 2v9M4 7l4-5 4 5M2 14h12"/>
					</svg>
					{cvFileName ? cvFileName : 'Subir nuevo CV (PDF)'}
				</label>
				<input
					id="cv-input"
					name="cv_file"
					type="file"
					accept="application/pdf"
					class="file-hidden"
					onchange={onCvChange}
				/>
				<input type="hidden" name="cv_pdf_url_current" value={profile?.cv_pdf_url ?? ''} />
				<p class="photo-hint">Solo PDF · máx. 10 MB</p>
			</div>
		</div>

		<!-- ══ Footer: botón guardar ════════════════════════════════════════ -->
		<div class="form-footer">
			<button id="profile-save-btn" type="submit" disabled={loading} class="save-btn">
				{#if loading}
					<span class="spinner" aria-hidden="true"></span>
					Guardando…
				{:else}
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M3 8l3.5 3.5L13 4"/>
					</svg>
					Guardar cambios
				{/if}
			</button>
		</div>
	</form>
</div>

<style>
/* ── Página ───────────────────────────────────────────────────────────────── */
.page {
	padding: 1.75rem 2rem;
	max-width: 52rem;
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
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

/* ── Formulario ─────────────────────────────────────────────────────────── */
.profile-form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

/* ── Secciones glass ────────────────────────────────────────────────────── */
.section {
	border-radius: 1.5rem;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1.125rem;
}

.section-header { display: flex; align-items: center; gap: 0.5rem; }
.section-label {
	font-size: 0.625rem;
	font-weight: 600;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: rgba(255,255,255,0.40);
	margin: 0;
}

/* ── Foto de perfil ─────────────────────────────────────────────────────── */
.photo-area {
	display: flex;
	align-items: center;
	gap: 1.25rem;
}

/* [design] Círculo de avatar con overlay de cámara en hover */
.photo-wrap {
	position: relative;
	width: 5rem;
	height: 5rem;
	border-radius: 50%;
	cursor: pointer;
	flex-shrink: 0;
	overflow: hidden;
	background: rgba(255,255,255,0.06);
	border: 2px solid rgba(255,255,255,0.10);
	box-shadow: 0 0 20px rgba(255, 59, 48, 0.25);
	transition: border-color 0.15s, box-shadow 0.15s;
}
.photo-wrap:hover { border-color: rgba(255,59,48,0.40); }

.photo-img {
	width: 100%; height: 100%;
	object-fit: cover;
	border-radius: 50%;
	display: block;
}

.photo-placeholder {
	width: 100%; height: 100%;
	display: flex; align-items: center; justify-content: center;
	color: rgba(255,255,255,0.25);
}

/* Overlay semitransparente de cámara que aparece en hover */
.photo-overlay {
	position: absolute; inset: 0;
	border-radius: 50%;
	background: rgba(255,59,48,0.55);
	display: flex; align-items: center; justify-content: center;
	color: #fff;
	opacity: 0;
	transition: opacity 0.15s;
}
.photo-wrap:hover .photo-overlay { opacity: 1; }

.photo-meta { display: flex; flex-direction: column; gap: 0.25rem; }
.photo-hint {
	font-size: 0.6875rem;
	color: rgba(255,255,255,0.30);
	margin: 0;
}

/* ── Grid de campos ────────────────────────────────────────────────────── */
.fields-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.875rem;
}
@media (max-width: 600px) { .fields-grid { grid-template-columns: 1fr; } }
.field-group--full { grid-column: 1 / -1; }

.field-group {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

/* [design] Labels: 10px uppercase white/40 */
.field-label {
	font-size: 0.625rem;
	font-weight: 600;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: rgba(255,255,255,0.40);
}

/* [design] Inputs: glass transparente, focus ring rojo */
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
	resize: none;
}
.field-input::placeholder { color: rgba(255,255,255,0.22); }
.field-input:focus {
	border-color: rgba(255,59,48,0.45);
	background: rgba(255,255,255,0.06);
	box-shadow: 0 0 0 3px rgba(255,59,48,0.10);
}

.field-textarea { min-height: 8rem; }

/* ── CV ────────────────────────────────────────────────────────────────── */
.cv-area {
	display: flex;
	flex-direction: column;
	gap: 0.625rem;
}

.cv-link {
	display: inline-flex;
	align-items: center;
	gap: 0.375rem;
	font-size: 0.8125rem;
	color: var(--color-primary);
	text-decoration: none;
	padding: 0.5rem 0.875rem;
	border-radius: 9999px;
	background: rgba(255,59,48,0.08);
	border: 1px solid rgba(255,59,48,0.20);
	width: fit-content;
	transition: background 0.15s, border-color 0.15s;
}
.cv-link:hover { background: rgba(255,59,48,0.14); border-color: rgba(255,59,48,0.35); }

.cv-upload-btn {
	display: inline-flex;
	align-items: center;
	gap: 0.375rem;
	font-size: 0.75rem;
	font-weight: 500;
	color: rgba(255,255,255,0.60);
	padding: 0.5rem 0.875rem;
	border-radius: 9999px;
	background: rgba(255,255,255,0.04);
	border: 1px solid rgba(255,255,255,0.10);
	width: fit-content;
	cursor: pointer;
	transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.cv-upload-btn:hover {
	background: rgba(255,255,255,0.08);
	color: rgba(255,255,255,0.88);
	border-color: rgba(255,255,255,0.18);
}

/* Inputs de archivo — visualmente ocultos, activados por label */
.file-hidden {
	position: absolute;
	width: 1px; height: 1px;
	opacity: 0; pointer-events: none;
}

/* ── Footer del formulario ─────────────────────────────────────────────── */
.form-footer {
	display: flex;
	justify-content: flex-end;
	padding-top: 0.25rem;
}

/* [design] Botón guardar: rojo + red-glow + hover:scale */
.save-btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1.5rem;
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
}
.save-btn:hover:not(:disabled) {
	transform: scale(1.04);
	box-shadow: 0 0 32px rgba(255,59,48,0.55);
}
.save-btn:disabled { opacity: 0.50; cursor: not-allowed; }

.spinner {
	width: 0.875rem; height: 0.875rem;
	border: 2px solid rgba(255,255,255,0.30);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 0.65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Toast de resultado ────────────────────────────────────────────────── */
/* [design] Glass tintado verde/rojo — aparece fijo en esquina inferior derecha */
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

.toast--success {
	background: rgba(52, 211, 153, 0.12);
	border: 1px solid rgba(52, 211, 153, 0.30);
	color: oklch(0.79 0.17 155);
}

.toast--error {
	background: rgba(255, 59, 48, 0.12);
	border: 1px solid rgba(255, 59, 48, 0.30);
	color: var(--color-primary);
}

.toast-icon { display: flex; flex-shrink: 0; }

@keyframes toast-in {
	from { opacity: 0; transform: translateY(8px) scale(0.96); }
	to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
