<div class="nomad-section">
	<div class="nomad-content">
		<div class="nomad-icons">
			<img
				src="assets/icons/tagtag.png"
				alt="Computer and technology icon for digital workers"
				class="nomad-icon"
			/>
			<img
				src="assets/icons/remote-work.png"
				alt="Remote work icon representing flexible work arrangements"
				class="nomad-icon"
			/>
			<img
				src="assets/icons/digitalnomad.png"
				alt="Digital nomad icon for location-independent professionals"
				class="nomad-icon"
			/>
		</div>
		<p class="nomad-text">
			Whether you're a digital nomad, a remote worker, or a free spirited artist, you'll fit right
			in.
		</p>
	</div>
</div>

<style>
	.nomad-section {
		background: #fff;
		padding: clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem);
		text-align: center;
	}

	.nomad-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.nomad-icons {
		display: flex;
		justify-content: center;
		gap: clamp(1.5rem, 3vw, 2.5rem);
		margin-bottom: clamp(1.5rem, 3vw, 2rem);
	}

	.nomad-icon {
		width: clamp(3rem, 6vw, 4.5rem);
		height: clamp(3rem, 6vw, 4.5rem);
		object-fit: contain;
	}

	.nomad-text {
		font-size: clamp(1.5rem, 3.5vw, 2.2rem);
		font-weight: 600;
		color: #111;
		line-height: 1.4;
		margin: 0;
		opacity: 1;
		transform: translateY(30px);
		transition:
			opacity 1s ease-out,
			transform 1s ease-out;
	}

	.nomad-text.animate {
		opacity: 1;
		transform: translateY(0);
	}
	@supports not (animation: fadeInUp) {
		.nomad-text {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes fadeInUp {
		0% {
			opacity: 0;
			transform: translateY(30px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
