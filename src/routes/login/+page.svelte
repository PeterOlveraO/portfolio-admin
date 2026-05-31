<script lang="ts">
	/**
	 * login/+page.svelte
	 * Pantalla de inicio de sesión — usa Form Actions de SvelteKit.
	 * Sin fetch manual, sin goto() — el formulario es un <form> nativo con enhance.
	 *
	 * Siguiendo typescript-advanced-types:
	 *  - `ActionData` inferido del +page.server.ts vía $types.
	 *  - `form` (ActionData) contiene LoginActionData discriminado — switch tipado.
	 *  - `enhance` de SvelteKit para progressive enhancement sin perder validación.
	 */
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	// Estado local solo para el spinner de carga durante el submit.
	let loading = $state(false);

	// ── Helpers para extraer mensajes del union discriminado ──────────────
	// Usar funciones con narrowing en lugar de acceso directo a `form?.error.message`
	// garantiza que el compilador verifique cada rama del discriminated union.

	/** Retorna el mensaje de error global (no de campo) si existe. */
	function getGlobalError(): string | null {
		if (!form?.error) return null;
		if (form.error.type === 'invalid_credentials') return form.error.message;
		if (form.error.type === 'server_error') return form.error.message;
		return null;
	}

	/** Retorna el mensaje de error de un campo específico si existe. */
	function getFieldError(field: 'email' | 'password'): string | null {
		if (!form?.error) return null;
		if (form.error.type === 'validation' && form.error.field === field) {
			return form.error.message;
		}
		return null;
	}

	const emailError    = $derived(getFieldError('email'));
	const passwordError = $derived(getFieldError('password'));
	const globalError   = $derived(getGlobalError());
</script>

<svelte:head>
	<title>Acceso — Portfolio Admin</title>
	<meta name="description" content="Accede al panel de administración de tu portafolio." />
</svelte:head>

<main class="login-root">
	<div class="login-bg" aria-hidden="true"></div>

	<div class="login-card glass-shimmer glass-crimson animate-fade-up">
		<!-- Encabezado -->
		<header class="login-header">
			<div class="login-logo animate-pulse-red" aria-hidden="true">
				<span class="logo-mark">P</span>
			</div>
			<h1 class="login-title font-display">Portfolio<br /><em>Admin</em></h1>
			<p class="login-subtitle">Acceso al panel de control.</p>
		</header>

		<div class="login-divider" aria-hidden="true"></div>

		<!--
			Formulario nativo con enhance para progressive enhancement.
			method="POST" + action="?/login" → invoca la Form Action `login`.
			Si JS no está disponible, funciona igualmente (full-page POST).
		-->
		<form
			method="POST"
			action="?/login"
			class="login-form"
			novalidate
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					// update() aplica el ActionData al prop `form` sin recargar la página.
					await update();
					loading = false;
				};
			}}
		>
			<!-- Email -->
			<div class="field-group delay-1 animate-fade-up">
				<label for="email" class="field-label">Correo electrónico</label>
				<input
					id="email"
					name="email"
					type="email"
					value={form?.email ?? ''}
					required
					autocomplete="email"
					placeholder="tu@email.com"
					class="field-input {emailError ? 'field-input--error' : ''}"
					disabled={loading}
					aria-describedby={emailError ? 'email-error' : undefined}
					aria-invalid={emailError ? true : undefined}
				/>
				{#if emailError}
					<p id="email-error" role="alert" class="field-error-inline">{emailError}</p>
				{/if}
			</div>

			<!-- Contraseña -->
			<div class="field-group delay-2 animate-fade-up">
				<label for="password" class="field-label">Contraseña</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					autocomplete="current-password"
					placeholder="••••••••"
					class="field-input {passwordError ? 'field-input--error' : ''}"
					disabled={loading}
					aria-describedby={passwordError ? 'password-error' : undefined}
					aria-invalid={passwordError ? true : undefined}
				/>
				{#if passwordError}
					<p id="password-error" role="alert" class="field-error-inline">{passwordError}</p>
				{/if}
			</div>

			<!-- Error global (credenciales inválidas / error de servidor) -->
			{#if globalError}
				<div role="alert" class="field-error-global delay-3 animate-fade-up">
					<span class="error-icon" aria-hidden="true">⚠</span>
					{globalError}
				</div>
			{/if}

			<!-- Submit -->
			<button
				id="login-submit"
				type="submit"
				disabled={loading}
				class="btn-primary delay-3 animate-fade-up"
			>
				{#if loading}
					<span class="spinner" aria-hidden="true"></span>
					Verificando…
				{:else}
					Iniciar sesión
				{/if}
			</button>
		</form>
	</div>
</main>

<style>
	.login-root {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		background-color: var(--bg-base);
		overflow: hidden;
	}

	.login-bg {
		position: absolute;
		inset: 0;
		/* Textura de ruido + gradientes para profundidad */
		background:
			url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"),
			radial-gradient(ellipse 70% 60% at 15% 85%, rgba(26, 0, 5, 0.9) 0%, transparent 60%),
			radial-gradient(ellipse 50% 50% at 90% 15%, rgba(26, 0, 5, 0.5) 0%, transparent 50%),
			radial-gradient(ellipse 40% 30% at 50% 50%, rgba(225, 29, 72, 0.03) 0%, transparent 70%);
		background-blend-mode: overlay, normal, normal, normal;
		pointer-events: none;
	}

	.login-card {
		position: relative;
		width: 100%;
		max-width: 420px;
		border-radius: 1.25rem;
		padding: 2.75rem 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		/* LIQUID GLASS — MÁS TRANSPARENTE */
		background: rgba(255, 255, 255, 0.025);
		backdrop-filter: blur(32px) saturate(200%);
		-webkit-backdrop-filter: blur(32px) saturate(200%);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			inset 0 -1px 0 rgba(255, 255, 255, 0.03),
			inset 0 0 40px rgba(255, 255, 255, 0.02),
			0 32px 64px -16px rgba(0, 0, 0, 0.9),
			0 0 80px -20px rgba(225, 29, 72, 0.08);
	}

	.login-header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.login-logo {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 0.75rem;
		background: linear-gradient(135deg, var(--color-crimson-400) 0%, var(--color-crimson-600) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 4px 16px rgba(225, 29, 72, 0.4);
	}

	.logo-mark {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: #fff;
		line-height: 1;
	}

	.login-title {
		font-size: 2rem;
		font-weight: 600;
		line-height: 1.15;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		margin: 0;
	}

	.login-title em {
		font-style: italic;
		color: var(--color-crimson-300);
	}

	.login-subtitle {
		font-size: 0.8125rem;
		color: var(--text-muted);
		margin: 0;
		letter-spacing: 0.01em;
	}

	.login-divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--border-subtle) 30%, var(--color-glass-border-crimson) 60%, transparent);
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-label {
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.field-input {
		width: 100%;
		/* LIQUID GLASS input — MÁS TRANSPARENTE */
		background: rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.75rem;
		padding: 0.75rem 1rem;
		font-size: 0.9375rem;
		font-family: var(--font-sans);
		color: var(--text-primary);
		outline: none;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
		caret-color: var(--accent);
	}

	.field-input::placeholder { color: var(--color-mist); }

	.field-input:focus {
		border-color: rgba(225, 29, 72, 0.4);
		background: rgba(0, 0, 0, 0.3);
		box-shadow: 
			0 0 0 3px rgba(225, 29, 72, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.03);
	}

	.field-input--error {
		border-color: rgba(225, 29, 72, 0.6);
		box-shadow: 0 0 0 2px rgba(225, 29, 72, 0.15);
	}

	.field-input:disabled { opacity: 0.45; cursor: not-allowed; }

	/* Error inline (validación de campo) */
	.field-error-inline {
		font-size: 0.75rem;
		color: var(--color-crimson-200);
		margin: 0;
		padding-left: 0.25rem;
	}

	/* Error global (credenciales / servidor) */
	.field-error-global {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		font-size: 0.8125rem;
		/* Glass error container */
		background: rgba(225, 29, 72, 0.1);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(225, 29, 72, 0.3);
		color: var(--color-crimson-200);
	}

	.error-icon {
		font-size: 0.875rem;
		flex-shrink: 0;
		color: var(--color-crimson-400);
	}

	.btn-primary {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.875rem 1.25rem;
		border-radius: 0.75rem;
		font-size: 0.9375rem;
		font-weight: 600;
		font-family: var(--font-sans);
		letter-spacing: 0.01em;
		color: #fff;
		border: none;
		cursor: pointer;
		/* Botón primario rojo sólido con brillo */
		background: linear-gradient(135deg, var(--color-crimson-400) 0%, var(--color-crimson-500) 100%);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 4px 16px rgba(225, 29, 72, 0.35);
		transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
		margin-top: 0.25rem;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			0 8px 24px rgba(225, 29, 72, 0.45);
	}

	.btn-primary:active:not(:disabled) { transform: translateY(0); }
	.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

	.spinner {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin { to { transform: rotate(360deg); } }
</style>
