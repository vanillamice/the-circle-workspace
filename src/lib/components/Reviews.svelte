<script>
	import { onMount, onDestroy } from 'svelte';
	import { createReviewsCarousel } from '$lib/js/reviewSlider.js';

	let carouselElement;
	let carouselInstance;
	let reviewIndex = 0; // Initialize with default value

	const reviews = [
		{
			name: 'Mehreen',
			text: 'As a visiting language student in Alexandria, Egypt I tried several study spaces before discovering The Circle. This place instantly felt like the ideal environment to support my learning journey as well as opportunity to connect with locals - including other students, entrepreneurs and many other skilled professionals. The staff and space is welcoming, safe - you can leave your belongings in the closed study space if you want to pop out for fresh air.',
			rating: 5
		},
		{
			name: 'Katherine',
			text: 'Staff was super friendly and the atmosphere helped me get tasks done very quickly! ❤️ Will definitely come again more than often.',
			rating: 5
		},
		{
			name: 'Hatem',
			text: 'This place is one of the best, most professional working spaces i have ever been to. Highly recommend.',
			rating: 4
		}
	];

	onMount(() => {
		if (carouselElement) {
			carouselInstance = createReviewsCarousel(carouselElement, {
				autoPlayInterval: 5000,
				swipeThreshold: 50,
				onIndexChange: (newIndex) => {
					reviewIndex = newIndex;
				}
			});
		}
	});

	onDestroy(() => {
		carouselInstance?.destroy();
	});

	// Optional: Expose methods to template
	function nextReview() {
		carouselInstance?.nextReview();
	}

	function previousReview() {
		carouselInstance?.previousReview();
	}

	function goToReview(index) {
		carouselInstance?.goToReview(index);
	}
</script>

<section class="reviews-section">
	<div class="reviews-container">
		<div class="section-header">
			<h1 class="section-title">What our members say</h1>
			<p class="section-subtitle">Real experiences from our community</p>
			<a
				href="https://www.google.com/maps/place/the+circle/@31.22951,29.95039,14z/data=!4m8!3m7!1s0x14f5c5a567116a2d:0xad356d5804f1093a!8m2!3d31.22951!4d29.95039!9m1!1b1!16s%2Fg%2F11xlck2d8l?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D"
				class="maps-button"
				target="_blank"
				rel="noopener noreferrer"
			>
				<svg class="maps-icon" viewBox="0 0 24 24">
					<path
						d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
					/>
				</svg>
				Find us on Google Maps
			</a>
		</div>
		<div class="reviews-carousel" bind:this={carouselElement}>
			{#each reviews as review, index}
				<div class="review-item" class:active={index === reviewIndex}>
					<div class="review-text">{review.text}</div>
					<div class="review-author">- {review.name}</div>
				</div>
			{/each}

			<button class="carousel-nav prev" on:click={previousReview}>‹</button>
			<button class="carousel-nav next" on:click={nextReview}>›</button>
		</div>
		<div class="carousel-dots">
			{#each reviews as _, index}
				<button
					type="button"
					class="dot"
					class:active={index === reviewIndex}
					on:click={() => goToReview(index)}
					on:keydown={(e) => e.key === 'Enter' && goToReview(index)}
					aria-label="Go to review {index + 1}"
				></button>
			{/each}
		</div>
	</div>
</section>

<style>
	/* Reviews Section Styles */
	.reviews-section {
		background: #f4f3f1;
		padding: 60px 20px;
		margin: 40px 20px;
		border-radius: 30px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.reviews-container {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.maps-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: #000000;
		color: white;
		text-decoration: none;
		padding: 12px 24px;
		border-radius: 25px;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
		font-size: 14px;
	}

	.maps-button:hover {
		background: #333333;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
	}

	.maps-icon {
		width: 18px;
		height: 18px;
		fill: currentColor;
	}

	/* Carousel Styles */
	.reviews-carousel {
		position: relative;
		margin-top: 40px;
		background: white;
		border-radius: 20px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		overflow: hidden;
		min-height: 300px;
	}

	.review-item {
		display: none;
		padding: 40px;
		text-align: center;
		min-height: 300px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.review-item.active {
		display: flex;
	}

	.review-text {
		font-size: 16px;
		line-height: 1.6;
		color: #444;
		font-style: italic;
		margin-bottom: 30px;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.review-author {
		font-weight: 600;
		font-size: 14px;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	/* Navigation */
	.carousel-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		width: 45px;
		height: 45px;
		border-radius: 50%;
		font-size: 18px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.carousel-nav:hover {
		background: rgba(0, 0, 0, 0.9);
		transform: translateY(-50%) scale(1.1);
	}

	.carousel-nav.prev {
		left: 15px;
	}

	.carousel-nav.next {
		right: 15px;
	}

	/* Dots Indicator */
	.carousel-dots {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin-top: 20px;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.3);
		border: none;
		padding: 0;
		outline: none;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.dot.active {
		background: rgba(0, 0, 0, 0.8);
		transform: scale(1.3);
	}

	.dot:hover {
		background: rgba(0, 0, 0, 0.5);
	}

	/* Mobile Styles */
	@media (max-width: 768px) {
		.reviews-section {
			padding: 40px 15px;
			margin: 20px 10px;
			border-radius: 20px;
		}

		.review-item {
			padding: 30px 20px;
			min-height: 250px;
		}

		.review-text {
			font-size: 14px;
			line-height: 1.5;
			margin-bottom: 20px;
		}

		.review-author {
			font-size: 12px;
		}

		.carousel-nav {
			width: 35px;
			height: 35px;
			font-size: 14px;
		}

		.carousel-nav.prev {
			left: 10px;
		}

		.carousel-nav.next {
			right: 10px;
		}

		.maps-button {
			padding: 10px 20px;
			font-size: 13px;
		}

		.maps-icon {
			width: 16px;
			height: 16px;
		}
	}

	@media (max-width: 480px) {
		.review-item {
			padding: 25px 15px;
			min-height: 220px;
		}

		.review-text {
			font-size: 13px;
			line-height: 1.4;
		}

		.carousel-nav {
			width: 30px;
			height: 30px;
			font-size: 12px;
		}
	}
</style>
