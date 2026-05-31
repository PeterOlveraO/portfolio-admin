<script lang="ts">
	/**
	 * dashboard/+page.svelte — Resumen / Home del panel admin.
	 */
	import type { PageData } from './$types';

	interface Props { data: PageData; }
	let { data }: Props = $props();

	interface SectionCard {
		readonly title: string;
		readonly description: string;
		readonly href: string;
		readonly icon: string;
		readonly count?: string;
	}

	const sections: readonly SectionCard[] = [
		{ title: 'Perfil',            description: 'Nombre, bio, foto y datos personales.',   href: '/dashboard/profile',    icon: 'user',      count: '' },
		{ title: 'Redes Sociales',    description: 'GitHub, LinkedIn, Twitter y más.',         href: '/dashboard/social',     icon: 'link',      count: '' },
		{ title: 'Experiencia',       description: 'Historial y posiciones laborales.',        href: '/dashboard/experience', icon: 'briefcase', count: '' },
		{ title: 'Educación',         description: 'Instituciones y títulos académicos.',      href: '/dashboard/education',  icon: 'book',      count: '' },
		{ title: 'Habilidades',       description: 'Stack técnico y nivel de competencia.',   href: '/dashboard/skills',     icon: 'zap',       count: '' },
		{ title: 'Proyectos',         description: 'Proyectos destacados del portafolio.',    href: '/dashboard/projects',   icon: 'layers',    count: '' },
		{ title: 'Diplomas',          description: 'Certificaciones y cursos completados.',   href: '/dashboard/diplomas',   icon: 'award',     count: '' },
	] as const;
</script>

<svelte:head>
	<title>Resumen — Portfolio Admin</title>
</svelte:head>

<div class="page">
	<!-- Encabezado de página -->
	<div class="page-header">
		<div>
			<p class="page-eyebrow">Panel de administración</p>
			<h2 class="page-title">Hola, {data.user.email.split('@')[0]} 👋</h2>
			<p class="page-subtitle">Gestiona el contenido de tu portafolio desde aquí.</p>
		</div>
	</div>

	<!-- Grid de secciones -->
	<div class="section-grid">
		{#each sections as card}
			<a href={card.href} class="card">
				<div class="card-header">
					<div class="card-icon">
						{#if card.icon === 'user'}
							<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="5.5" r="2.5"/><path d="M2 13.5c0-2.761 2.686-5 6-5s6 2.239 6 5"/></svg>
						{:else if card.icon === 'link'}
							<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 9.5a3.536 3.536 0 005 0l2-2a3.536 3.536 0 00-5-5L7 4"/><path d="M9.5 6.5a3.536 3.536 0 00-5 0l-2 2a3.536 3.536 0 005 5L9 12"/></svg>
						{:else if card.icon === 'briefcase'}
							<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="14" height="9" rx="1.5"/><path d="M5 5V3.5A1.5 1.5 0 016.5 2h3A1.5 1.5 0 0111 3.5V5"/><path d="M1 9h14"/></svg>
						{:else if card.icon === 'book'}
							<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h8a1 1 0 011 1v10a1 1 0 01-1 1H3"/><path d="M3 2a1 1 0 00-1 1v10a1 1 0 001 1"/><path d="M8 6h2M8 9h2"/></svg>
						{:else if card.icon === 'zap'}
							<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1L3 9h5l-1 6 7-9H9l1-5z"/></svg>
						{:else if card.icon === 'layers'}
							<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6l7-4 7 4-7 4-7-4z"/><path d="M1 10l7 4 7-4"/></svg>
						{:else if card.icon === 'award'}
							<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6.5" r="4"/><path d="M5.5 10l-1.5 4 4-2 4 2-1.5-4"/></svg>
						{/if}
					</div>
					<span class="card-arrow" aria-hidden="true">
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h7M6.5 3l3 3-3 3"/></svg>
					</span>
				</div>
				<h3 class="card-title">{card.title}</h3>
				<p class="card-desc">{card.description}</p>
			</a>
		{/each}
	</div>
</div>

<style>
.page {
	padding: 2rem 1.75rem;
	max-width: 60rem;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.page-header {
	margin-bottom: 2rem;
}

.page-eyebrow {
	font-size: 0.6875rem;
	font-weight: 500;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--color-crimson-400);
	margin: 0 0 0.375rem;
}

.page-title {
	font-family: var(--font-display);
	font-size: clamp(1.5rem, 3vw, 2rem);
	font-weight: 600;
	letter-spacing: -0.03em;
	color: var(--text-primary);
	margin: 0 0 0.375rem;
}

.page-subtitle {
	font-size: 0.875rem;
	color: var(--text-muted);
	margin: 0;
}

/* ── Grid ───────────────────────────────────────────────────────────────── */
.section-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	gap: 0.75rem;
}

/* ── Card — LIQUID GLASS iOS 26 ─────────────────────────────────────────── */
.card {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1.25rem;
	border-radius: 1rem;
	/* Liquid Glass effect */
	background: rgba(255, 255, 255, 0.04);
	backdrop-filter: blur(20px) saturate(180%);
	-webkit-backdrop-filter: blur(20px) saturate(180%);
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 
		inset 0 1px 0 rgba(255, 255, 255, 0.1),
		0 8px 32px rgba(0, 0, 0, 0.4);
	text-decoration: none;
	transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
	transform: translateY(-3px);
	border-color: rgba(225, 29, 72, 0.3);
	box-shadow: 
		inset 0 1px 0 rgba(255, 255, 255, 0.15),
		0 16px 48px rgba(0, 0, 0, 0.5),
		0 0 40px -10px rgba(225, 29, 72, 0.15);
}

.card:hover .card-arrow {
	color: var(--color-crimson-400);
	transform: translateX(3px);
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 0.375rem;
}

.card-icon {
	display: flex;
	width: 2.25rem;
	height: 2.25rem;
	align-items: center;
	justify-content: center;
	border-radius: 0.625rem;
	/* Glass icon container */
	background: rgba(225, 29, 72, 0.12);
	border: 1px solid rgba(225, 29, 72, 0.2);
	color: var(--color-crimson-400);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.card-icon svg {
	width: 1rem;
	height: 1rem;
}

.card-arrow {
	color: var(--color-mist);
	transition: color 0.15s, transform 0.15s;
}

.card-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--text-primary);
	letter-spacing: -0.01em;
	margin: 0;
}

.card-desc {
	font-size: 0.75rem;
	color: var(--text-muted);
	line-height: 1.5;
	margin: 0;
}
</style>
