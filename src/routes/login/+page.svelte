<script lang="ts">
	/**
	 * login/+page.svelte — VORTEX CMS Liquid Glass Crimson
	 *
	 * [skill: typescript-advanced-types]
	 *  - ActionData inferido de $types — discriminated union LoginActionError
	 *  - getFieldError/getGlobalError: narrowing explícito por rama del union
	 *  - $derived para emailError, passwordError, globalError
	 */
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	interface Props { form: ActionData; }
	let { form }: Props = $props();

	let loading = $state(false);

	function getGlobalError(): string | null {
		if (!form?.error) return null;
		if (form.error.type === 'invalid_credentials') return form.error.message;
		if (form.error.type === 'server_error')        return form.error.message;
		return null;
	}

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

<div class="login-root liquid-mesh">
	<div class="form-col">
		<div class="login-card panel">

			<!-- Logo mark centrado -->
			<div class="logo-wrap">
				<div class="logo-circle red-glow" aria-hidden="true">
					<div class="logo-square"></div>
				</div>
			</div>

			<form
				method="POST"
				action="?/login"
				class="login-form"
				novalidate
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				<!-- Email -->
				<div class="field-group">
					<label for="email" class="field-label">Correo electrónico</label>
					<input
						id="email"
						name="email"
						type="email"
						value={form?.email ?? ''}
						required
						autocomplete="email"
						placeholder="tu@email.com"
						class="field-input"
						class:field-input--error={emailError}
						disabled={loading}
						aria-describedby={emailError ? 'email-error' : undefined}
						aria-invalid={emailError ? true : undefined}
					/>
					{#if emailError}
						<p id="email-error" role="alert" class="field-error-msg">{emailError}</p>
					{/if}
				</div>

				<!-- Contraseña -->
				<div class="field-group">
					<label for="password" class="field-label">Contraseña</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						autocomplete="current-password"
						placeholder="••••••••"
						class="field-input"
						class:field-input--error={passwordError}
						disabled={loading}
						aria-describedby={passwordError ? 'password-error' : undefined}
						aria-invalid={passwordError ? true : undefined}
					/>
					{#if passwordError}
						<p id="password-error" role="alert" class="field-error-msg">{passwordError}</p>
					{/if}
				</div>

				<!-- Error global -->
				{#if globalError}
					<div role="alert" class="error-global">
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
							<circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11h.01"/>
						</svg>
						{globalError}
					</div>
				{/if}

				<!-- Submit -->
				<button id="login-submit" type="submit" disabled={loading} class="submit-btn">
					{#if loading}
						<span class="spinner" aria-hidden="true"></span>
						Verificando…
					{:else}
						Acceder
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>

<style>
.login-root {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1.5rem;
}

/* Card centrada */
.form-col {
	width: 100%;
	max-width: 22rem;
}

.login-card {
	border-radius: 2rem;
	padding: 2rem;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

/* Logo mark */
.logo-wrap {
	display: flex;
	justify-content: center;
}

.logo-circle {
	width: 3rem;
	height: 3rem;
	border-radius: 50%;
	background: var(--color-primary);
	display: flex;
	align-items: center;
	justify-content: center;
}

.logo-square {
	width: 1.125rem;
	height: 1.125rem;
	background: rgba(255, 255, 255, 0.92);
	border-radius: 0.25rem;
	transform: rotate(45deg);
}

/* Formulario */
.login-form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

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
	color: rgba(255, 255, 255, 0.40);
}

.field-input {
	width: 100%;
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.10);
	border-radius: 0.875rem;
	padding: 0.75rem 1rem;
	font-size: 0.9375rem;
	font-family: var(--font-sans);
	color: rgba(255, 255, 255, 0.90);
	outline: none;
	transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
	caret-color: var(--color-primary);
}

.field-input::placeholder { color: rgba(255, 255, 255, 0.25); }

.field-input:focus {
	border-color: rgba(255, 59, 48, 0.50);
	background: rgba(255, 255, 255, 0.06);
	box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.12);
}

.field-input--error {
	border-color: rgba(255, 59, 48, 0.55);
	box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.10);
}

.field-input:disabled { opacity: 0.45; cursor: not-allowed; }

.field-error-msg {
	font-size: 0.6875rem;
	color: var(--color-primary);
	margin: 0;
	padding-left: 0.25rem;
	opacity: 0.85;
}

.error-global {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	border-radius: 0.875rem;
	font-size: 0.8125rem;
	background: rgba(255, 59, 48, 0.08);
	border: 1px solid rgba(255, 59, 48, 0.25);
	color: var(--color-primary);
}

.submit-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	width: 100%;
	padding: 0.875rem 1.25rem;
	border-radius: 9999px;
	font-size: 0.75rem;
	font-weight: 700;
	font-family: var(--font-sans);
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: #fff;
	border: none;
	cursor: pointer;
	background: var(--color-primary);
	box-shadow: 0 0 24px rgba(255, 59, 48, 0.40);
	transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s;
	margin-top: 0.25rem;
}

.submit-btn:hover:not(:disabled) {
	transform: scale(1.04);
	box-shadow: 0 0 32px rgba(255, 59, 48, 0.55);
}

.submit-btn:active:not(:disabled) { transform: scale(0.98); }
.submit-btn:disabled { opacity: 0.50; cursor: not-allowed; }

.spinner {
	display: inline-block;
	width: 0.875rem;
	height: 0.875rem;
	border: 2px solid rgba(255, 255, 255, 0.30);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 0.65s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
