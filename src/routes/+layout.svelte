<script lang="ts">
	/**
	 * +layout.svelte — Root layout
	 * Carga fuentes (Playfair Display + DM Sans) y envuelve toda la app.
	 */
	import '../app.css';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Portfolio Admin</title>
	<meta name="description" content="Panel de administración del portafolio personal." />
	<!-- Inter — VORTEX CMS design system font -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div style="min-height: 100vh;">
	{@render children()}
</div>
