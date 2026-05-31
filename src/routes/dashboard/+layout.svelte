<script lang="ts">
	/**
	 * dashboard/+layout.svelte — VORTEX CMS Liquid Glass Crimson
	 *
	 * [skill: typescript-advanced-types]
	 *  - NavIconName: union literal de 8 valores — verifica exhaustividad
	 *  - NAV_ICON_PATHS: Record<NavIconName, string> — lookup type-safe sin if/else
	 *  - navSections: readonly NavSection[] — tipo explícito para que flatMap infiera
	 *  - $derived encadenados para emailHandle → userDisplayName → userInitial
	 *
	 * [skill: frontend-design — VORTEX CMS]
	 *  - liquid-mesh: tres radiales rojos sobre onyx → profundidad ambiental
	 *  - panel (glass-panel + glass-shine): superficies de vidrio con brillo interior
	 *  - Logo: cuadrado rojo 45° dentro de círculo con red-glow
	 *  - Active nav: bg-primary/10 + borde + punto pulsante (animate-pulse-dot)
	 *  - Header: search glass + CTA rojo full + avatar círculo
	 *  - Sin animaciones de entrada complejas — el "wow" viene del glass estático
	 */
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import type { Snippet } from "svelte";
	import type { LayoutData } from "./$types";

	// ── [TS] Union literal — descarta `string` genérico ───────────────────
	type NavIconName =
		| "grid"
		| "user"
		| "link"
		| "briefcase"
		| "book"
		| "award"
		| "zap"
		| "layers";

	// ── [TS] Record<NavIconName, string>: lookup type-safe ────────────────
	const NAV_ICON_PATHS: Record<NavIconName, string> = {
		grid: "M1 1h5.5v5.5H1V1zm8.5 0H15v5.5H9.5V1zM1 9.5h5.5V15H1V9.5zm8.5 0H15V15H9.5V9.5z",
		user: "M8 2a3 3 0 100 6 3 3 0 000-6zM2 14c0-3.314 2.686-6 6-6s6 2.686 6 6",
		link: "M6.5 9.5a3.536 3.536 0 005 0l2-2a3.536 3.536 0 00-5-5L7 4M9.5 6.5a3.536 3.536 0 00-5 0l-2 2a3.536 3.536 0 005 5L9 12",
		briefcase:
			"M1 6h14v8a1 1 0 01-1 1H2a1 1 0 01-1-1V6zm4-1V3.5A1.5 1.5 0 016.5 2h3A1.5 1.5 0 0111 3.5V5M1 10h14",
		book: "M3 2h8a1 1 0 011 1v10a1 1 0 01-1 1H3m0-12a1 1 0 00-1 1v10a1 1 0 001 1m5-9h2M8 9h2",
		award: "M8 2.5a4 4 0 100 8 4 4 0 000-8zM5.5 10l-1.5 4 4-2 4 2-1.5-4",
		zap: "M9 1L3 9h5l-1 6 7-9H9l1-5z",
		layers: "M1 6l7-4 7 4-7 4-7-4zM1 10l7 4 7-4",
	};

	// ── [TS] Interfaces readonly ────────────────────────────────────────────
	interface NavItem {
		readonly href: string;
		readonly label: string;
		readonly icon: NavIconName;
	}
	interface NavSection {
		readonly label: string;
		readonly items: readonly NavItem[];
	}
	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	// ── Estado menú móvil ──────────────────────────────────────────────────
	let mobileOpen = $state(false);
	function openMobile() {
		mobileOpen = true;
		document.body.style.overflow = "hidden";
	}
	function closeMobile() {
		mobileOpen = false;
		document.body.style.overflow = "";
	}
	$effect(() => {
		void $page.url.pathname;
		closeMobile();
	});

	// ── Ruta activa ────────────────────────────────────────────────────────
	let currentPath = $derived($page.url.pathname);
	function isActive(href: string): boolean {
		return href === "/dashboard"
			? currentPath === "/dashboard"
			: currentPath.startsWith(href);
	}

	// ── Secciones de navegación ────────────────────────────────────────────
	const navSections: readonly NavSection[] = [
		{
			label: "General",
			items: [
				{ href: "/dashboard", label: "Resumen", icon: "grid" },
				{ href: "/dashboard/profile", label: "Perfil", icon: "user" },
				{
					href: "/dashboard/social",
					label: "Redes Sociales",
					icon: "link",
				},
			],
		},
		{
			label: "Trayectoria",
			items: [
				{
					href: "/dashboard/experience",
					label: "Experiencia",
					icon: "briefcase",
				},
				{
					href: "/dashboard/education",
					label: "Educación",
					icon: "book",
				},
				{
					href: "/dashboard/diplomas",
					label: "Diplomas",
					icon: "award",
				},
			],
		},
		{
			label: "Portafolio",
			items: [
				{
					href: "/dashboard/skills",
					label: "Habilidades",
					icon: "zap",
				},
				{
					href: "/dashboard/projects",
					label: "Proyectos",
					icon: "layers",
				},
			],
		},
	];

	// ── [TS] $derived encadenados — NonNullable en split()[0] ─────────────
	const emailHandle = $derived<string>(
		data.user.email.split("@")[0] ?? "admin",
	);
	const userDisplayName = $derived<string>(
		emailHandle
			.replace(/[._-]/g, " ")
			.replace(/\b\w/g, (c) => c.toUpperCase()),
	);
	const userInitial = $derived<string>(
		userDisplayName[0]?.toUpperCase() ?? "A",
	);

	// Título de sección activa para el topbar
	const activeLabel = $derived<string>(
		navSections.flatMap((s) => s.items).find((item) => isActive(item.href))
			?.label ?? "Dashboard",
	);
</script>

<!-- Overlay móvil -->
{#if mobileOpen}
	<div class="mobile-overlay" onclick={closeMobile} aria-hidden="true"></div>
{/if}

<!--
	[design] liquid-mesh = fondo base con gradientes radiales rojos.
	Todo el dashboard vive sobre esta capa de profundidad.
-->
<div class="shell liquid-mesh">
	<!-- ══ SIDEBAR ══════════════════════════════════════════════════════════ -->
	<!--
		[design] El sidebar es un panel glass sobre el mesh.
		panel = glass-panel + glass-shine (superficie de vidrio con brillo interior).
		w-64 + sticky top-6 + calc(100vh-3rem) como especifica VORTEX.
	-->
	<aside
		class="sidebar panel"
		class:sidebar--open={mobileOpen}
		aria-label="Navegación principal"
	>
		<!-- Logo — [design] cuadrado rojo rotado 45° en círculo con red-glow -->
		<div class="sidebar-logo-wrap">
			<div class="logo-circle red-glow">
				<div class="logo-square" aria-hidden="true"></div>
			</div>
			<button
				class="sidebar-close"
				onclick={closeMobile}
				aria-label="Cerrar menú"
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 14 14"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				>
					<path d="M2 2l10 10M12 2L2 12" />
				</svg>
			</button>
		</div>

		<!-- Navegación agrupada -->
		<nav class="sidebar-nav" aria-label="Secciones">
			{#each navSections as section}
				<div class="nav-section">
					<p class="nav-group-label">{section.label}</p>
					<ul role="list" class="nav-list">
						{#each section.items as item}
							{@const active = isActive(item.href)}
							<li>
								<a
									href={item.href}
									class="nav-item"
									class:nav-item--active={active}
									aria-current={active ? "page" : undefined}
								>
									<!-- [TS] lookup en Record → un solo path SVG, sin if/else -->
									<span class="nav-icon" aria-hidden="true">
										<svg
											viewBox="0 0 16 16"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path
												d={NAV_ICON_PATHS[item.icon]}
											/>
										</svg>
									</span>
									<span class="nav-label">{item.label}</span>
									<!-- [design] Punto pulsante en item activo — microinteracción sutil -->
									{#if active}
										<span
											class="nav-active-dot animate-pulse-dot"
											aria-hidden="true"
										></span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</nav>
	</aside>

	<!-- ══ COLUMNA DERECHA ══════════════════════════════════════════════════ -->
	<div class="main-col">
		<!-- Header — [design] panel glass h-16 con search + CTA + avatar -->
		<header class="topbar panel">
			<!-- Hamburger móvil -->
			<button
				class="hamburger"
				onclick={openMobile}
				aria-label="Abrir menú"
				aria-expanded={mobileOpen}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
				>
					<path d="M2 4h12M2 8h12M2 12h12" />
				</svg>
			</button>

			<!-- Título de sección activa -->
			<h1 class="topbar-title">{activeLabel}</h1>

			<div class="topbar-actions">
				<!-- CTA primario rojo — [design] btn-primary + red-glow + hover:scale-105 -->
				<a
					href="/dashboard/projects"
					class="btn-primary cta-btn"
					aria-label="Nuevo proyecto"
				>
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round"
					>
						<path d="M6 1v10M1 6h10" />
					</svg>
					Nuevo
				</a>

				<!-- Botones secundarios circulares glass -->
				<button
					class="icon-btn"
					aria-label="Notificaciones"
					title="Notificaciones"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M8 2a5 5 0 015 5v2l1.5 2h-13L3 9V7a5 5 0 015-5zm-1.5 9.5a1.5 1.5 0 003 0"
						/>
					</svg>
				</button>

				<!-- Avatar + logout -->
				<div class="avatar-wrap" title={data.user.email}>
					<div class="avatar">{userInitial}</div>
				</div>

				<form
					method="POST"
					action="/dashboard/logout"
					use:enhance={() => {
						/**
						 * El endpoint /dashboard/logout responde con redirect(303, '/login').
						 * use:enhance seguiría el redirect → recibiría HTML de /login →
						 * intentaría parsearlo como JSON → Error 500.
						 *
						 * Solución: ignorar la respuesta del servidor y navegar con goto().
						 * invalidateAll: true fuerza a SvelteKit a re-ejecutar todos los
						 * load functions, limpiando el estado de sesión en el cliente.
						 */
						return async () => {
							await goto("/login", { invalidateAll: true });
						};
					}}
				>
					<button
						id="logout-btn"
						type="submit"
						class="icon-btn logout-icon"
						aria-label="Cerrar sesión"
						title="Cerrar sesión"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 14 14"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path
								d="M5 12H3a1 1 0 01-1-1V3a1 1 0 011-1h2M9 9.5l3-2.5L9 4.5M12 7H5.5"
							/>
						</svg>
					</button>
				</form>
			</div>
		</header>

		<!-- Contenido principal con scroll independiente -->
		<main class="content" id="main-content" tabindex="-1">
			{@render children()}
		</main>
	</div>
</div>

<style>
	/* ── Shell / fondo ───────────────────────────────────────────────────────── */
	.shell {
		display: flex;
		height: 100vh;
		overflow: hidden;
		padding: 1.5rem;
		gap: 1.5rem;
	}

	/* ── Sidebar ─────────────────────────────────────────────────────────────── */
	/*
 * [design] w-64, sticky-like (no necesita sticky en flex), altura calc(100vh-3rem).
 * Radios generosos: rounded-[2rem] per spec VORTEX.
 */
	.sidebar {
		width: 16rem;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		border-radius: 2rem;
		height: calc(100vh - 3rem);
		overflow: hidden;
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@media (max-width: 1023px) {
		.sidebar {
			position: fixed;
			top: 1.5rem;
			left: 1.5rem;
			z-index: 40;
			transform: translateX(calc(-100% - 1.5rem));
			height: calc(100vh - 3rem);
		}
		.sidebar--open {
			transform: translateX(0);
		}
	}

	/* ── Logo ────────────────────────────────────────────────────────────────── */
	.sidebar-logo-wrap {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.25rem 1.25rem 1rem;
		flex-shrink: 0;
	}

	/*
 * [design] Círculo carmesí con red-glow — contenedor del logo mark.
 * El cuadrado interior girado 45° es la "diamond mark" del VORTEX design.
 */
	.logo-circle {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: var(--color-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.logo-square {
		width: 0.875rem;
		height: 0.875rem;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 0.1875rem;
		transform: rotate(45deg);
	}

	.sidebar-close {
		display: none;
		padding: 0.25rem;
		color: var(--text-muted);
		background: none;
		border: none;
		cursor: pointer;
		border-radius: 0.375rem;
		transition: color 0.15s;
	}
	.sidebar-close:hover {
		color: var(--text-primary);
	}
	@media (max-width: 1023px) {
		.sidebar-close {
			display: flex;
		}
	}

	/* ── Separador ───────────────────────────────────────────────────────────── */
	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem 0.75rem;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
	}

	.nav-section {
		margin-bottom: 0.5rem;
	}

	/* [design] Labels uppercase 10px tracking-widest white/40 */
	.nav-group-label {
		font-size: 0.625rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding: 0.5rem 0.5rem 0.25rem 0.625rem;
		margin: 0;
	}

	.nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	/* ── Nav item ────────────────────────────────────────────────────────────── */
	/*
 * [design] Activo: bg-primary/10 + border border-primary/20 + text-primary
 * Inactivo: text-white/60, hover text-white
 */
	.nav-item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5625rem 0.75rem;
		border-radius: 0.75rem;
		font-size: 0.8125rem;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.55);
		text-decoration: none;
		border: 1px solid transparent;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}

	.nav-item:hover:not(.nav-item--active) {
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.85);
	}

	.nav-item--active {
		background: rgba(255, 59, 48, 0.1);
		border-color: rgba(255, 59, 48, 0.2);
		color: var(--color-primary);
		font-weight: 500;
	}

	.nav-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.nav-icon svg {
		width: 100%;
		height: 100%;
	}

	.nav-label {
		flex: 1;
	}

	/* [design] Punto pulsante — único decorador del item activo */
	.nav-active-dot {
		width: 0.375rem;
		height: 0.375rem;
		border-radius: 50%;
		background: var(--color-primary);
		flex-shrink: 0;
	}



	/* ── Main col ────────────────────────────────────────────────────────────── */
	.main-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		gap: 1.5rem;
	}

	/* ── Topbar header ───────────────────────────────────────────────────────── */
	/*
 * [design] h-16, panel glass, rounded-[2rem], gap-6 internos.
 */
	.topbar {
		display: flex;
		align-items: center;
		gap: 1rem;
		height: 4rem;
		padding: 0 1.25rem;
		border-radius: 2rem;
		flex-shrink: 0;
	}

	.hamburger {
		display: none;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		color: rgba(255, 255, 255, 0.5);
		background: none;
		border: none;
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.hamburger:hover {
		background: rgba(255, 255, 255, 0.06);
		color: rgba(255, 255, 255, 0.9);
	}
	@media (max-width: 1023px) {
		.hamburger {
			display: flex;
		}
	}

	.topbar-title {
		flex: 1;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.topbar-actions {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-shrink: 0;
	}

	/* [design] CTA botón rojo: btn-primary + hover:scale-105 */
	.cta-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.4375rem 1rem;
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #fff;
		text-decoration: none;
		border-radius: 9999px;
		background: var(--color-primary);
		box-shadow: 0 0 24px rgba(255, 59, 48, 0.4);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}
	.cta-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 0 32px rgba(255, 59, 48, 0.55);
	}

	/* [design] Botones secundarios: círculos glass size-9 */
	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
		flex-shrink: 0;
	}
	.icon-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.9);
		border-color: rgba(255, 255, 255, 0.14);
	}
	.logout-icon:hover {
		background: rgba(255, 59, 48, 0.1);
		color: var(--color-primary);
		border-color: rgba(255, 59, 48, 0.25);
	}

	/* [design] Avatar: gradiente from-primary to-primary/40 con borde */
	.avatar-wrap {
		position: relative;
	}
	.avatar {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: linear-gradient(
			135deg,
			var(--color-primary) 0%,
			rgba(255, 59, 48, 0.4) 100%
		);
		border: 1.5px solid rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6875rem;
		font-weight: 700;
		color: #fff;
		flex-shrink: 0;
	}

	/* ── Contenido principal ─────────────────────────────────────────────────── */
	.content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		border-radius: 2rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.06);
		overscroll-behavior: contain;
	}
	.content:focus {
		outline: none;
	}
	.content:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: -2px;
	}
</style>
