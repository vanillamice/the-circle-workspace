<div class="workspace-section">
	<div class="workspace-content">
		<div class="workspace-text-container">
			<img
				src="assets/icons/desk.png"
				alt="Modern desk icon representing workspace"
				class="workspace-icon"
			/>
			<p class="workspace-text">A new type of workspace.</p>
		</div>
	</div>
</div>

<style>
	.workspace-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #fff;
		padding: clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem);
		text-align: center;
		border-radius: 12px;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	.workspace-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.workspace-text-container {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(1rem, 2vw, 1.5rem);
	}

	.workspace-icon {
		width: clamp(2rem, 4vw, 3rem);
		height: clamp(2rem, 4vw, 3rem);
		object-fit: fill;
	}

	.workspace-text {
		font-size: clamp(1.5rem, 3.5vw, 2.2rem);
		font-weight: 600;
		color: #111;
		line-height: 1.4;
		margin: 0;
		/* The following properties are for a potential animation, but do not affect the layout */
		opacity: 1;
		transform: translateY(0); /* Changed to 0 to make it visible */
		transition:
			opacity 1s ease-out,
			transform 1s ease-out;
	}
</style>
