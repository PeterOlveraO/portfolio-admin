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
	<!-- Playfair Display (display) + DM Sans (body) -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div style="min-height: 100vh;">
	{@render children()}
</div>
