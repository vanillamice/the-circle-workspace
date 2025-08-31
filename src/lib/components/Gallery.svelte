<div class="gallery-section">
	<div class="gallery-content">
		<div class="gallery-text">
			<h2 class="gallery-title">
				Work, but also the <em class="after-hours-text">after hours</em>
			</h2>
			<p class="gallery-subtitle">There's more to life, come find out.</p>
		</div>
		<div class="gallery-grid">
			<img
				src="assets/images/circlebannerdark.jpeg"
				alt="Modern shared workspace with comfortable seating and natural lighting"
				class="gallery-image"
				loading="lazy"
			/>
			<img
				src="assets/images/coffee.jpeg"
				alt="Cozy coffee corner with refreshments and social area"
				class="gallery-image"
				loading="lazy"
			/>
			<img
				src="assets/images/plant.jpeg"
				alt="Lush greenery and plants creating a welcoming atmosphere"
				class="gallery-image"
				loading="lazy"
			/>
			<img
				src="assets/images/guitar2.jpeg"
				alt="Relaxed after-hours atmosphere with musical instruments and entertainment"
				class="gallery-image"
				loading="lazy"
			/>
		</div>
	</div>
</div>

<style>
	/* Gallery Section */
	.gallery-section {
		background: rgba(17, 17, 17, 0.96);
		padding: clamp(2rem, 4vw, 4rem) clamp(1rem, 4vw, 2rem);
		color: #fff;
		grid-template-columns: 1fr;
		gap: clamp(1.5rem, 4vw, 2rem);
		text-align: center;
	}

	.gallery-content {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(2rem, 4vw, 4rem);
		align-items: center;
	}

	.gallery-text {
		padding-right: clamp(1rem, 3vw, 2rem);
		padding-right: 0;
		text-align: left;
	}

	.gallery-title {
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 700;
		letter-spacing: clamp(-1.5px, -0.2vw, -3px);
		margin: 0 0 clamp(1rem, 2vw, 1.5rem) 0;
		line-height: 1.1;
	}

	.after-hours-text {
		color: var(--accent);
		opacity: 1;
		transform: translateY(30px);
		transition:
			opacity 1s ease-out,
			transform 1s ease-out;
	}

	.after-hours-text.animate {
		opacity: 1;
		transform: translateY(0);
	}

	.gallery-subtitle {
		font-size: clamp(1.24rem, 2.7vw, 1.6rem);
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.5;
		margin: 0;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(0.3rem, 1.5vw, 0.8rem);
	}

	.gallery-image {
		width: 100%;
		height: clamp(120px, 25vw, 200px);
		object-fit: cover;
		border-radius: clamp(0.4rem, 1vw, 0.8rem);
		transition: transform 0.3s ease;
	}

	.gallery-image:hover {
		transform: scale(1.02);
	}
</style>
