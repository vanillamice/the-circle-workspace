<script>
	import { onMount, onDestroy } from 'svelte';
	import { createSlider } from '$lib/js/hero.js';
	import { goto } from '$app/navigation';
	import '$lib/styles/hero.css';

	// slide data lives here 👇
	let slides = [
		{ src: '/assets/images/people2.jpeg', alt: 'Coworking' },
		{ src: '/assets/images/guitar.jpeg', alt: 'Chill vibes' },
		{ src: '/assets/images/location.jpeg', alt: 'The Circle location' }
	];

	let track;
	let slider;
	let interval = 3000; // autoplay speed

	onMount(() => {
		slider = createSlider(track, { interval });
	});

	onDestroy(() => {
		slider?.destroy();
	});
</script>

<div
	class="hero"
	role="region"
	on:mouseenter={() => slider.pause()}
	on:mouseleave={() => slider.resume()}
>
	<div class="slider slider-hero">
		<div class="slides" bind:this={track}>
			{#each slides as { src, alt }}
				<img class="slide" {src} {alt} />
			{/each}
		</div>
		<div class="hero-overlay">
			<div class="hero-overlay-inner">
				<div class="hero-text">
					<h1 class="hero-title">Remote work happens <em>here</em>.</h1>
					<p class="hero-subtitle">A focused space to build, learn, and connect.</p>
				</div>
				<button class="book-btn" on:click={() => goto('/booking')}>
					<span>Book Now</span>
				</button>
			</div>
		</div>
		<button class="slider-btn prev" on:click={() => slider.prev()} aria-label="Previous">‹</button>
		<button class="slider-btn next" on:click={() => slider.next()} aria-label="Next">›</button>
	</div>
</div>
