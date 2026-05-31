<script lang="ts">
	/**
	 * dashboard/+layout.svelte — revisado con skills aplicadas.
	 *
	 * [skill: typescript-advanced-types]
	 *  - NavIconName: union literal (no `string`) → el compilador verifica exhaustividad
	 *  - NAV_ICON_PATHS: Record<NavIconName, string> elimina el if/else cascade del template
	 *  - userDisplayName: NonNullable para el split()[0] + fallback explícito
	 *  - `satisfies` en navSections para validación structural sin perder narrowing
	 *
	 * [skill: frontend-design]
	 *  - Tone: industrial/utilitarian refinado (Linear + Raycast)
	 *  - Differentiation: línea roja vertical continua en sidebar + Playfair italic en marca
	 *  - Motion: nav items con stagger de entrada via animation-delay en CSS
	 *  - Background: sidebar con ruido SVG + gradiente lateral sutil (no color plano)
	 *  - Typography: Playfair Display para la marca, DM Sans para navegación
	 */
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	// ── [TS skill] Union literal — reemplaza `icon: string` genérico ─────────
	type NavIconName =
		| 'grid' | 'user' | 'link'
		| 'briefcase' | 'book' | 'award'
		| 'zap' | 'layers';

	// ── [TS skill] Record<K,V>: mapeo type-safe nombre → path SVG ─────────────
	// Elimina el {#if}/{:else if} cascade del template — un solo lookup.
	const NAV_ICON_PATHS = {
		grid:      'M1 1h5.5v5.5H1V1zm8.5 0H15v5.5H9.5V1zM1 9.5h5.5V15H1V9.5zm8.5 0H15V15H9.5V9.5z',
		user:      'M8 2a3 3 0 100 6 3 3 0 000-6zM2 14c0-3.314 2.686-6 6-6s6 2.686 6 6',
		link:      'M6.5 9.5a3.536 3.536 0 005 0l2-2a3.536 3.536 0 00-5-5L7 4M9.5 6.5a3.536 3.536 0 00-5 0l-2 2a3.536 3.536 0 005 5L9 12',
		briefcase: 'M1 6h14v8a1 1 0 01-1 1H2a1 1 0 01-1-1V6zm4-1V3.5A1.5 1.5 0 016.5 2h3A1.5 1.5 0 0111 3.5V5M1 10h14',
		book:      'M3 2h8a1 1 0 011 1v10a1 1 0 01-1 1H3m0-12a1 1 0 00-1 1v10a1 1 0 001 1m5-9h2M8 9h2',
		award:     'M8 2.5a4 4 0 100 8 4 4 0 000-8zM5.5 10l-1.5 4 4-2 4 2-1.5-4',
		zap:       'M9 1L3 9h5l-1 6 7-9H9l1-5z',
		layers:    'M1 6l7-4 7 4-7 4-7-4zM1 10l7 4 7-4',
	} as const satisfies Record<NavIconName, string>;

	// ── [TS skill] Interfaces con readonly — shapes de objeto inmutables ───────
	interface NavItem {
		readonly href: string;
		readonly label: string;
		readonly icon: NavIconName; // ← union literal, no string
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

	// ── Estado menú móvil ─────────────────────────────────────────────────────
	let mobileOpen = $state(false);
	function openMobile()  { mobileOpen = true;  document.body.style.overflow = 'hidden'; }
	function closeMobile() { mobileOpen = false; document.body.style.overflow = ''; }

	$effect(() => { void $page.url.pathname; closeMobile(); });

	// ── Ruta activa ───────────────────────────────────────────────────────────
	let currentPath = $derived($page.url.pathname);
	function isActive(href: string): boolean {
		return href === '/dashboard'
			? currentPath === '/dashboard'
			: currentPath.startsWith(href);
	}

	// ── Navegación — tipo explícito en la variable para que flatMap infiera bien ──
	// `as const satisfies` en arrays heterogéneos restringe demasiado el tipo de
	// cada elemento; declarar el tipo explícito en la variable es más correcto.
	const navSections: readonly NavSection[] = [
		{
			label: 'General',
			items: [
				{ href: '/dashboard',         label: 'Resumen',          icon: 'grid'      },
				{ href: '/dashboard/profile', label: 'Perfil',           icon: 'user'      },
				{ href: '/dashboard/social',  label: 'Redes Sociales',   icon: 'link'      },
			]
		},
		{
			label: 'Trayectoria',
			items: [
				{ href: '/dashboard/experience', label: 'Experiencia Laboral', icon: 'briefcase' },
				{ href: '/dashboard/education',  label: 'Educación',           icon: 'book'      },
				{ href: '/dashboard/diplomas',   label: 'Diplomas',            icon: 'award'     },
			]
		},
		{
			label: 'Portafolio',
			items: [
				{ href: '/dashboard/skills',   label: 'Habilidades', icon: 'zap'    },
				{ href: '/dashboard/projects', label: 'Proyectos',   icon: 'layers' },
			]
		}
	];

	// ── [TS skill] NonNullable: email.split()[0] puede ser undefined ──────────
	// Dentro de $derived para capturar el valor reactivo de `data`.
	const emailHandle = $derived<string>(data.user.email.split('@')[0] ?? 'admin');
	const userDisplayName = $derived<string>(
		emailHandle.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
	);
	const userInitial = $derived<string>(userDisplayName[0]?.toUpperCase() ?? 'A');

	// ── Título de la sección activa para el topbar ────────────────────────────
	const activeLabel = $derived<string>(
		navSections
			.flatMap((s) => s.items)
			.find((item) => isActive(item.href))
			?.label ?? 'Dashboard'
	);
</script>

<!-- Overlay móvil -->
{#if mobileOpen}
	<div class="mobile-overlay" onclick={closeMobile} aria-hidden="true"></div>
{/if}

<div class="shell">

	<!-- ══ SIDEBAR ══════════════════════════════════════════════════════════ -->
	<aside class="sidebar" class:sidebar--open={mobileOpen} aria-label="Navegación principal">

		<!-- Marca — [design] Playfair italic como elemento diferenciador -->
		<div class="sidebar-brand">
			<a href="/dashboard" class="brand-link">
				<span class="brand-wordmark">Portfolio<em>Admin</em></span>
			</a>
			<button class="sidebar-close" onclick={closeMobile} aria-label="Cerrar menú">
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
					<path d="M2 2l10 10M12 2L2 12"/>
				</svg>
			</button>
		</div>

		<!-- [design] Línea roja vertical: el elemento diferenciador del sidebar -->
		<div class="sidebar-accent-line" aria-hidden="true"></div>

		<!-- Navegación -->
		<nav class="sidebar-nav">
			{#each navSections as section, si}
				<div class="nav-section">
					<p class="nav-section-label">{section.label}</p>
					<ul class="nav-list" role="list">
						{#each section.items as item, ii}
							{@const active = isActive(item.href)}
							<!-- [design] stagger via CSS custom property --delay -->
							<li style="--delay: {(si * 3 + ii) * 0.04}s">
								<a
									href={item.href}
									class="nav-item"
									class:nav-item--active={active}
									aria-current={active ? 'page' : undefined}
								>
									{#if active}
										<span class="nav-active-bar" aria-hidden="true"></span>
									{/if}
									<!-- [TS] lookup en Record — sin if/else cascade -->
									<span class="nav-icon" aria-hidden="true">
										<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
											<path d={NAV_ICON_PATHS[item.icon]}/>
										</svg>
									</span>
									<span class="nav-label">{item.label}</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</nav>

		<!-- Footer sidebar -->
		<div class="sidebar-footer">
			<div class="user-chip">
				<div class="user-avatar" aria-hidden="true">{userInitial}</div>
				<div class="user-meta">
					<span class="user-name">{userDisplayName}</span>
					<span class="user-email" title={data.user.email}>{data.user.email}</span>
				</div>
			</div>
		</div>
	</aside>

	<!-- ══ COLUMNA DERECHA ══════════════════════════════════════════════════ -->
	<div class="main-col">

		<!-- Topbar / Header -->
		<header class="topbar">
			<button class="hamburger" onclick={openMobile} aria-label="Abrir menú" aria-expanded={mobileOpen}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
					<path d="M2 4h12M2 8h12M2 12h12"/>
				</svg>
			</button>

			<!-- Título de sección activa — derivado del Record de navegación -->
			<h1 class="topbar-title">{activeLabel}</h1>

			<div class="topbar-user">
				<div class="topbar-user-info">
					<span class="topbar-user-name">{userDisplayName}</span>
					<span class="topbar-user-email">{data.user.email}</span>
				</div>
				<div class="topbar-avatar" aria-hidden="true">{userInitial}</div>
				<form method="POST" action="/dashboard/logout" use:enhance>
					<button id="logout-btn" type="submit" class="logout-btn" aria-label="Cerrar sesión" title="Cerrar sesión">
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M5 12H3a1 1 0 01-1-1V3a1 1 0 011-1h2"/>
							<path d="M9 9.5l3-2.5L9 4.5M12 7H5.5"/>
						</svg>
						<span class="logout-label">Salir</span>
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
/* ── Shell ──────────────────────────────────────────────────────────────── */
.shell {
	display: flex;
	height: 100vh;
	overflow: hidden;
	background-color: var(--bg-base);
}

/* ── Sidebar ────────────────────────────────────────────────────────────── */
.sidebar {
	position: relative;
	width: 15rem;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	height: 100vh;
	overflow: hidden;
	/*
	 * [design skill] LIQUID GLASS — MÁS TRANSPARENTE
	 * Vidrio translúcido flotando sobre el fondo texturizado.
	 */
	background: rgba(255, 255, 255, 0.015);
	backdrop-filter: blur(28px) saturate(200%);
	-webkit-backdrop-filter: blur(28px) saturate(200%);
	border-right: 1px solid rgba(255, 255, 255, 0.05);
	box-shadow: 
		inset -1px 0 0 rgba(255, 255, 255, 0.03),
		inset 0 0 30px rgba(255, 255, 255, 0.01),
		4px 0 32px rgba(0, 0, 0, 0.4);
	transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 1023px) {
	.sidebar {
		position: fixed;
		top: 0; left: 0;
		z-index: 40;
		transform: translateX(-100%);
		width: 16rem;
		box-shadow: 
			inset -1px 0 0 rgba(255, 255, 255, 0.05),
			8px 0 48px rgba(0, 0, 0, 0.7);
	}
	.sidebar--open { transform: translateX(0); }
}

/* ── Marca — [design] Playfair italic: diferenciador tipográfico ─────────── */
.sidebar-brand {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 1rem;
	height: 3.25rem;
	border-bottom: 1px solid rgba(255,255,255,0.06);
	flex-shrink: 0;
}

.brand-link {
	text-decoration: none;
	display: flex;
	align-items: center;
}

.brand-wordmark {
	font-family: var(--font-display);      /* Playfair Display */
	font-size: 0.9375rem;
	font-weight: 400;
	letter-spacing: -0.01em;
	color: var(--text-primary);
	line-height: 1;
}

/* [design] La palabra "Admin" en itálica — asimetría tipográfica intencional */
.brand-wordmark em {
	font-style: italic;
	color: var(--color-crimson-400);
	margin-left: 0.2em;
}

.sidebar-close {
	display: none;
	padding: 0.25rem;
	color: var(--text-muted);
	background: none;
	border: none;
	cursor: pointer;
	border-radius: 0.25rem;
	transition: color 0.15s;
}
.sidebar-close:hover { color: var(--text-primary); }
@media (max-width: 1023px) { .sidebar-close { display: flex; } }

/*
 * [design] Línea roja vertical continua — el elemento UNFORGETTABLE.
 * Corre de arriba a abajo del sidebar como una arteria de tensión.
 */
.sidebar-accent-line {
	position: absolute;
	left: 0;
	top: 3.25rem; /* debajo del brand */
	bottom: 0;
	width: 2px;
	background: linear-gradient(
		to bottom,
		var(--color-crimson-600) 0%,
		var(--color-crimson-400) 40%,
		rgba(180,20,41,0.15) 85%,
		transparent 100%
	);
	box-shadow: 0 0 12px rgba(180,20,41,0.3);
	pointer-events: none;
}

/* ── Navegación ─────────────────────────────────────────────────────────── */
.sidebar-nav {
	flex: 1;
	overflow-y: auto;
	padding: 0.875rem 0;
	scrollbar-width: thin;
	scrollbar-color: var(--color-ash) transparent;
}

.nav-section {
	padding: 0 0.625rem;
	margin-bottom: 0.25rem;
}

.nav-section-label {
	font-size: 0.625rem;
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--text-muted);
	padding: 0.5rem 0.625rem 0.375rem 0.875rem; /* izquierda alineada con items */
	margin: 0;
	opacity: 0.6;
}

.nav-list {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 1px;
}

/*
 * [design] Stagger de entrada: cada li tiene --delay inyectado desde el script.
 * Un solo momento de animación orquestada al cargar — no scattered micro-interactions.
 */
.nav-list li {
	animation: nav-slide-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
	animation-delay: var(--delay, 0s);
}

@keyframes nav-slide-in {
	from { opacity: 0; transform: translateX(-8px); }
	to   { opacity: 1; transform: translateX(0); }
}

/* ── Nav item ────────────────────────────────────────────────────────────── */
.nav-item {
	position: relative;
	display: flex;
	align-items: center;
	gap: 0.625rem;
	padding: 0.5rem 0.75rem 0.5rem 0.875rem;
	border-radius: 0.5rem;
	font-size: 0.8125rem;
	font-weight: 400;
	color: var(--text-muted);
	text-decoration: none;
	transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
	overflow: hidden;
	border: 1px solid transparent;
}

.nav-item:hover:not(.nav-item--active) {
	background: rgba(255, 255, 255, 0.05);
	border-color: rgba(255, 255, 255, 0.06);
	color: var(--color-vapor);
}

/* [LIQUID GLASS] Item activo con glass crimson */
.nav-item--active {
	background: rgba(225, 29, 72, 0.15);
	border: 1px solid rgba(225, 29, 72, 0.3);
	color: var(--color-crimson-200);
	font-weight: 500;
	box-shadow: 
		inset 0 1px 0 rgba(255, 255, 255, 0.08),
		0 2px 8px rgba(225, 29, 72, 0.1);
}

/* Barra izquierda sobre la accent line — indicador activo preciso */
.nav-active-bar {
	position: absolute;
	left: 0;
	top: 50%;
	transform: translateY(-50%);
	width: 2px;
	height: 1.25rem;
	border-radius: 0 2px 2px 0;
	background: var(--color-crimson-400);
	box-shadow: 0 0 6px var(--accent-glow);
}

.nav-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1rem;
	height: 1rem;
	flex-shrink: 0;
	opacity: 0.65;
	transition: opacity 0.12s;
}
.nav-item--active .nav-icon,
.nav-item:hover .nav-icon { opacity: 1; }
.nav-icon svg { width: 100%; height: 100%; }

.nav-label {
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* ── Footer sidebar ─────────────────────────────────────────────────────── */
.sidebar-footer {
	flex-shrink: 0;
	padding: 0.75rem 0.875rem;
	border-top: 1px solid rgba(255,255,255,0.06);
}

.user-chip {
	display: flex;
	align-items: center;
	gap: 0.625rem;
	padding: 0.25rem;
}

.user-avatar {
	flex-shrink: 0;
	width: 1.875rem;
	height: 1.875rem;
	border-radius: 50%;
	background: linear-gradient(135deg, var(--color-crimson-700), var(--color-crimson-900));
	border: 1px solid rgba(180,20,41,0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.6875rem;
	font-weight: 700;
	color: var(--color-crimson-100);
}

.user-meta {
	display: flex;
	flex-direction: column;
	gap: 0.0625rem;
	min-width: 0;
}

.user-name {
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--text-primary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.user-email {
	font-size: 0.625rem;
	color: var(--text-muted);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* ── Columna derecha ─────────────────────────────────────────────────────── */
.main-col {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	overflow: hidden;
}

/* ── Topbar ──────────────────────────────────────────────────────────────── */
.topbar {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	height: 3.25rem;
	padding: 0 1.5rem;
	/*
	 * [LIQUID GLASS] Navbar — MÁS TRANSPARENTE
	 */
	background: rgba(255, 255, 255, 0.015);
	backdrop-filter: blur(28px) saturate(200%);
	-webkit-backdrop-filter: blur(28px) saturate(200%);
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	box-shadow: 
		inset 0 -1px 0 rgba(255, 255, 255, 0.02),
		0 4px 24px rgba(0, 0, 0, 0.3);
	flex-shrink: 0;
}

.hamburger {
	display: none;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	border-radius: 0.375rem;
	color: var(--text-muted);
	background: none;
	border: none;
	cursor: pointer;
	flex-shrink: 0;
	transition: background 0.12s, color 0.12s;
}
.hamburger:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
@media (max-width: 1023px) { .hamburger { display: flex; } }

.topbar-title {
	flex: 1;
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--text-primary);
	letter-spacing: -0.01em;
	margin: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.topbar-user {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	flex-shrink: 0;
}

.topbar-user-info {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 0.0625rem;
}
@media (max-width: 639px) { .topbar-user-info { display: none; } }

.topbar-user-name {
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--text-primary);
	white-space: nowrap;
}

.topbar-user-email {
	font-size: 0.625rem;
	color: var(--text-muted);
	white-space: nowrap;
}

.topbar-avatar {
	width: 1.875rem;
	height: 1.875rem;
	border-radius: 50%;
	background: linear-gradient(135deg, var(--color-crimson-700), var(--color-crimson-900));
	border: 1px solid rgba(180,20,41,0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.6875rem;
	font-weight: 700;
	color: var(--color-crimson-100);
	flex-shrink: 0;
}

.logout-btn {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.375rem 0.75rem;
	border-radius: 0.5rem;
	font-size: 0.75rem;
	font-weight: 500;
	font-family: var(--font-sans);
	color: var(--text-muted);
	/* [LIQUID GLASS] Botón — MÁS TRANSPARENTE */
	background: rgba(255, 255, 255, 0.02);
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	border: 1px solid rgba(255, 255, 255, 0.06);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
	cursor: pointer;
	transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
	white-space: nowrap;
}
.logout-btn:hover {
	background: rgba(225, 29, 72, 0.08);
	color: var(--color-crimson-200);
	border-color: rgba(225, 29, 72, 0.25);
}

@media (max-width: 479px) { .logout-label { display: none; } }

/* ── Contenido ───────────────────────────────────────────────────────────── */
.content {
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	background-color: var(--bg-base);
	overscroll-behavior: contain;
}
.content:focus { outline: none; }
.content:focus-visible {
	outline: 2px solid var(--color-crimson-400);
	outline-offset: -2px;
}
</style>
