<script>
	// About Hero Component
</script>

<section class="about-hero">
	<img 
		src="/assets/images/circlebannerdark.jpeg" 
		alt="The Circle coworking space interior with modern workspace design and comfortable seating" 
		class="hero-background-image" 
		aria-hidden="true"
	/>
	<div class="about-hero-content">
		<h1 class="about-title">About The Circle</h1>
		<p class="about-subtitle">Your space, your community, your place to grow</p>
	</div>
</section>

<style>
	/* Hero Background Image for Accessibility */
	.hero-background-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 0;
		opacity: 0;
		pointer-events: none;
	}

	/* About Hero Section */
	.about-hero {
		background: url('/assets/images/circlebannerdark.jpeg') center/cover;
		padding: 120px 20px 80px;
		text-align: center;
		color: white;
		position: relative;
		overflow: hidden;
	}

	.about-hero::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 1;
	}

	.about-hero-content {
		position: relative;
		z-index: 2;
		max-width: 800px;
		margin: 0 auto;
	}

	.about-title {
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 700;
		margin-bottom: 20px;
		letter-spacing: clamp(-1.5px, -0.2vw, -3px);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.about-subtitle {
		font-size: clamp(1.1rem, 2.5vw, 1.4rem);
		font-weight: 400;
		opacity: 0.9;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.about-hero {
			padding: 100px 15px 60px;
		}
	}

	@media (max-width: 480px) {
		.about-hero {
			padding: 80px 10px 50px;
		}
	}
</style>
