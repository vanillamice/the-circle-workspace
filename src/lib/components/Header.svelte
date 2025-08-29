<script>
	import { goto } from '$app/navigation';
	import '$lib/styles/header.css';
	import { onMount, onDestroy } from 'svelte';
	// Reactive variable to track the header's opacity
	let scrollY = 0;
	let innerHeight = 0;
	// Calculate opacity based on scroll position
	$: opacity = Math.min(scrollY / 500, 0.95); // Max opacity of 95%, transitions over 200px
	$: backgroundColor = `rgba(var(--bg), ${opacity})`;
	$: backdropBlur = scrollY > 50 ? 'blur(12px)' : 'blur(0px)';
</script>

<svelte:window bind:scrollY bind:innerHeight />
<header
	class="site-header"
	style="
    background-color: {backgroundColor};
    backdrop-filter: {backdropBlur};
    -webkit-backdrop-filter: {backdropBlur};
    border-bottom: 1px solid rgba(0, 0, 0, {opacity * 0.1});
  "
>
	<img src="/assets/logos/thecircletransparent.svg" alt="The Circle workspace logo" />
	<div class="btn-row">
		<button class="btn-34" on:click={() => goto('/booking')}><span>booking</span></button>
		<button class="btn-34" on:click={() => goto('/faq')}><span>faq</span></button>
	</div>
</header>
