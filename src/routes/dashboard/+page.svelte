<script lang="ts">
	/**
	 * dashboard/+page.svelte — Home con stat cards VORTEX CMS
	 *
	 * [skill: frontend-design — VORTEX]
	 *  - Stat cards: glow ambiental absoluto (blur-3xl) + número grande font-light
	 *  - Grid de secciones: glass-panel + hover:border-primary/40 + group
	 *  - Jerarquía de texto: white/90 → white/60 → white/40
	 *  - Labels: 10px uppercase tracking-widest white/40
	 *  - Sin animaciones de entrada complejas
	 *
	 * [skill: typescript-advanced-types]
	 *  - StatCard con union discriminada opcional para trend
	 *  - SectionCard con NavIconName para consistencia de tipos
	 */
	import type { PageData } from './$types';

	interface Props { data: PageData; }
	let { data }: Props = $props();

	// ── [TS] Discriminated union para el campo trend de cada métrica ──────
	type Trend =
		| { readonly direction: 'up';   readonly value: string }
		| { readonly direction: 'down'; readonly value: string }
		| { readonly direction: 'neutral' };

	interface StatCard {
		readonly label: string;
		readonly value: string;
		readonly description: string;
		readonly trend: Trend;
	}

	// Datos placeholder — se reemplazarán con datos reales de Supabase
	const stats: readonly StatCard[] = [
		{ label: 'Proyectos',   value: '12',   description: 'Proyectos publicados', trend: { direction: 'up',      value: '+3 este mes' } },
		{ label: 'Habilidades', value: '24',   description: 'Tecnologías listadas', trend: { direction: 'neutral'                       } },
		{ label: 'Experiencia', value: '5 yr', description: 'Años de trayectoria',  trend: { direction: 'up',      value: '+1 este año' } },
	] as const satisfies readonly StatCard[];

	// ── Secciones de acceso rápido ─────────────────────────────────────────
	interface SectionCard {
		readonly title: string;
		readonly description: string;
		readonly href: string;
		readonly iconPath: string;
	}

	const sections: readonly SectionCard[] = [
		{ title: 'Perfil',      description: 'Nombre, bio y foto.',          href: '/dashboard/profile',    iconPath: 'M8 2a3 3 0 100 6 3 3 0 000-6zM2 14c0-3.314 2.686-6 6-6s6 2.686 6 6' },
		{ title: 'Redes',       description: 'GitHub, LinkedIn y más.',      href: '/dashboard/social',     iconPath: 'M6.5 9.5a3.536 3.536 0 005 0l2-2a3.536 3.536 0 00-5-5L7 4M9.5 6.5a3.536 3.536 0 00-5 0l-2 2a3.536 3.536 0 005 5L9 12' },
		{ title: 'Experiencia', description: 'Historial laboral.',            href: '/dashboard/experience', iconPath: 'M1 6h14v8a1 1 0 01-1 1H2a1 1 0 01-1-1V6zm4-1V3.5A1.5 1.5 0 016.5 2h3A1.5 1.5 0 0111 3.5V5M1 10h14' },
		{ title: 'Educación',   description: 'Instituciones y títulos.',      href: '/dashboard/education',  iconPath: 'M3 2h8a1 1 0 011 1v10a1 1 0 01-1 1H3m0-12a1 1 0 00-1 1v10a1 1 0 001 1m5-9h2M8 9h2' },
		{ title: 'Diplomas',    description: 'Certificaciones y cursos.',     href: '/dashboard/diplomas',   iconPath: 'M8 2.5a4 4 0 100 8 4 4 0 000-8zM5.5 10l-1.5 4 4-2 4 2-1.5-4' },
		{ title: 'Habilidades', description: 'Stack técnico y niveles.',      href: '/dashboard/skills',     iconPath: 'M9 1L3 9h5l-1 6 7-9H9l1-5z' },
		{ title: 'Proyectos',   description: 'Portafolio de trabajos.',       href: '/dashboard/projects',   iconPath: 'M1 6l7-4 7 4-7 4-7-4zM1 10l7 4 7-4' },
	];

	// ── [TS] Type guard para mostrar el trend de forma correcta ───────────
	function hasTrendValue(trend: Trend): trend is Extract<Trend, { value: string }> {
		return trend.direction !== 'neutral';
	}
</script>

<svelte:head>
	<title>Resumen — Portfolio Admin</title>
</svelte:head>

<div class="page">

	<!-- Encabezado de página -->
	<div class="page-header">
		<p class="eyebrow">Panel de administración</p>
		<h2 class="page-title">Hola, {data.user.email.split('@')[0]} 👋</h2>
		<p class="page-subtitle">Gestiona el contenido de tu portafolio desde aquí.</p>
	</div>

	<!--
		Stat cards — [design VORTEX]
		Cada card es panel glass + glow ambiental absoluto (div blur-3xl rojo)
		+ número grande font-light tracking-tight (text-4xl equivalent)
	-->
	<div class="stats-grid">
		{#each stats as stat}
			<div class="stat-card panel">
				<!-- Glow ambiental — div absoluto bg-primary/10 blur-3xl -->
				<div class="stat-glow" aria-hidden="true"></div>

				<div class="stat-body">
					<p class="stat-label">{stat.label}</p>
					<p class="stat-value">{stat.value}</p>
					<p class="stat-description">{stat.description}</p>
					{#if hasTrendValue(stat.trend)}
						<span class="stat-trend stat-trend--{stat.trend.direction}">
							{stat.trend.direction === 'up' ? '↑' : '↓'} {stat.trend.value}
						</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Grid de acceso rápido a secciones -->
	<div class="section-header">
		<p class="eyebrow">Acceso rápido</p>
	</div>

	<div class="sections-grid">
		{#each sections as card}
			<!--
				[design] group hover:border-primary/40 + acciones con opacity-60 group-hover:opacity-100
				panel glass + rounded-2xl (rounded-[1rem])
			-->
			<a href={card.href} class="section-card panel group">
				<div class="section-card-header">
					<div class="section-icon">
						<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d={card.iconPath}/>
						</svg>
					</div>
					<span class="section-arrow">
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M2.5 6h7M6.5 3l3 3-3 3"/>
						</svg>
					</span>
				</div>
				<p class="section-title">{card.title}</p>
				<p class="section-description">{card.description}</p>
			</a>
		{/each}
	</div>

</div>

<style>
/* [design] max-w-1400 mx-auto + p-6 = padding interno de la zona de contenido */
.page {
	padding: 1.75rem 2rem;
	max-width: 64rem;
	display: flex;
	flex-direction: column;
	gap: 1.75rem;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.page-header { display: flex; flex-direction: column; gap: 0.25rem; }

/* [design] Labels uppercase 10px tracking-widest white/40 */
.eyebrow {
	font-size: 0.625rem;
	font-weight: 500;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--color-primary);
	margin: 0;
}

/* [design] Métricas grandes: font-light tracking-tight */
.page-title {
	font-size: clamp(1.5rem, 3vw, 2rem);
	font-weight: 300;
	letter-spacing: -0.03em;
	color: rgba(255, 255, 255, 0.90);
	margin: 0;
}

.page-subtitle {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.50);
	margin: 0;
}

/* ── Stat cards ──────────────────────────────────────────────────────────── */
.stats-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1rem;
}
@media (max-width: 767px) { .stats-grid { grid-template-columns: 1fr; } }

.stat-card {
	position: relative;
	border-radius: 1.5rem;
	padding: 1.5rem;
	overflow: hidden;
}

/* [design] Glow ambiental: div absoluto -top-12 -right-12 size-32 bg-primary/10 blur-3xl */
.stat-glow {
	position: absolute;
	top: -3rem;
	right: -3rem;
	width: 8rem;
	height: 8rem;
	background: rgba(255, 59, 48, 0.10);
	border-radius: 50%;
	filter: blur(2.5rem);
	pointer-events: none;
}

.stat-body {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

.stat-label {
	font-size: 0.625rem;
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: rgba(255, 255, 255, 0.40);
	margin: 0;
}

/* [design] Número grande: text-4xl font-light tracking-tight */
.stat-value {
	font-size: 2.25rem;
	font-weight: 300;
	letter-spacing: -0.04em;
	color: rgba(255, 255, 255, 0.90);
	margin: 0;
	line-height: 1;
}

.stat-description {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.50);
	margin: 0;
}

.stat-trend {
	font-size: 0.6875rem;
	font-weight: 500;
	padding: 0.1875rem 0.5rem;
	border-radius: 9999px;
	width: fit-content;
}
.stat-trend--up   { background: rgba(52, 211, 153, 0.10); color: oklch(0.79 0.17 155); }
.stat-trend--down { background: rgba(255, 59, 48, 0.10);  color: var(--color-primary); }

/* ── Section header ──────────────────────────────────────────────────────── */
.section-header { margin-top: 0.25rem; }

/* ── Sections grid ───────────────────────────────────────────────────────── */
/* [design] grid-cols-4 equivalent con auto-fill */
.sections-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
	gap: 0.875rem;
}

/* [design] Cards: panel glass + rounded-2xl + group hover:border-primary/40 */
.section-card {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1.125rem;
	border-radius: 1.25rem;
	text-decoration: none;
	transition: border-color 0.15s ease, background 0.15s ease;
}

.section-card:hover {
	border-color: rgba(255, 59, 48, 0.35);
	background-color: rgba(255, 255, 255, 0.06);
}

.section-card:hover .section-arrow {
	color: var(--color-primary);
	transform: translateX(2px);
}

.section-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 0.25rem;
}

/* [design] Icono circular tintado rojo */
.section-icon {
	width: 2rem;
	height: 2rem;
	border-radius: 0.5rem;
	background: rgba(255, 59, 48, 0.10);
	color: var(--color-primary);
	display: flex;
	align-items: center;
	justify-content: center;
}
.section-icon svg { width: 1rem; height: 1rem; }

/* [design] Acciones con opacity-60 group-hover:opacity-100 */
.section-arrow {
	color: rgba(255, 255, 255, 0.35);
	opacity: 0.60;
	transition: color 0.15s, transform 0.15s, opacity 0.15s;
}
.section-card:hover .section-arrow { opacity: 1; }

.section-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.85);
	letter-spacing: -0.01em;
	margin: 0;
}

.section-description {
	font-size: 0.71875rem;
	color: rgba(255, 255, 255, 0.45);
	line-height: 1.5;
	margin: 0;
}
</style>
