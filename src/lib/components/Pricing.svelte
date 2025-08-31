<script>
	import { goto } from '$app/navigation';
	import '$lib/styles/pricing.css';
</script>

<section class="pricing-section">
	<div class="pricing-container">
		<!-- Section Header -->
		<div class="header">
			<div class="section-header">
				<h1 class="section-title">Membership plans</h1>
				<p class="section-subtitle">Simple pricing for focused work and genuine community</p>
			</div>

			<!-- Rotating Features Section -->
			<div class="orbit-container">
				<!-- Center element -->
				<div class="center">
					<div class="center-text">What's<br />included</div>
				</div>

				<!-- Rotating features -->
				<div class="feature-item rotating-feature" style="--angle: 0deg;">
					<img
						src="assets/icons/wi-fi-icon.png"
						alt="High-speed WiFi icon for internet connectivity"
						class="feature-icon"
					/>
					<span class="feature-text">fast wifi</span>
				</div>

				<div class="feature-item rotating-feature" style="--angle: 72deg;">
					<svg
						class="feature-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M18 8h1a4 4 0 0 1 0 8h-1" />
						<path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
						<line x1="6" y1="1" x2="6" y2="4" />
						<line x1="10" y1="1" x2="10" y2="4" />
						<line x1="14" y1="1" x2="14" y2="4" />
					</svg>
					<span class="feature-text">Beverages</span>
				</div>

				<div class="feature-item rotating-feature" style="--angle: 144deg;">
					<img
						src="assets/icons/air-conditioner.png"
						alt="Air conditioning icon for climate control"
						class="feature-icon"
					/>
					<span class="feature-text">AC</span>
				</div>

				<div class="feature-item rotating-feature" style="--angle: 216deg;">
					<img
						src="assets/icons/office-chair.png"
						alt="Ergonomic office chair icon for comfortable seating"
						class="feature-icon"
					/>
					<span class="feature-text">Cozy chairs</span>
				</div>

				<div class="feature-item rotating-feature" style="--angle: 288deg;">
					<img
						src="assets/icons/balcony.png"
						alt="Terrace balcony icon for outdoor workspace access"
						class="feature-icon"
					/>
					<span class="feature-text">Terrace</span>
				</div>
			</div>
		</div>

		<!-- Shared Space Section -->
		<div class="pricing-sections">
			<section class="card shared-section">
				<h2 class="section-title-small">Shared Workspace</h2>

				<div class="shared-grid">
					<!-- Daily Pass -->
					<div class="pricing-card">
						<div class="plan-name">Daily</div>
						<div class="plan-description">Perfect for trying us out</div>
						<div class="price-container">
							<div class="price">
								100
								<span class="currency">L.E</span>
								<span class="period">/Day</span>
							</div>
						</div>
						<button class="cta-button" on:click={() => goto('/booking')}
							><span>book day pass</span></button
						>
					</div>

					<!-- Monthly Pass -->
					<div class="pricing-card">
						<div class="plan-name">Monthly</div>
						<div class="plan-description">Unlimited access & community</div>
						<div class="price-container">
							<div class="price">
								2300
								<span class="currency">L.E</span>
								<span class="period">/ Month</span>
							</div>
						</div>
						<button class="cta-button" on:click={() => goto('/booking')}
							><span>Become a member</span></button
						>
					</div>
				</div>
			</section>

			<!-- Private Room Section -->
			<section class="card private-section">
				<h2 class="section-title-small">Private Room</h2>

				<div class="shared-grid">
					<div class="pricing-card">
						<div class="plan-name">Hourly</div>
						<div class="plan-description">Dedicated space for focused work</div>
						<div class="price-container">
							<div class="price">
								150
								<span class="currency">L.E</span>
								<span class="period">/ Hour</span>
							</div>
						</div>

						<div class="private-features">
							<div class="private-feature">
								<img
									src="assets/icons/padlock.png"
									alt="Padlock icon for secure lockable private offices"
									class="private-feature-icon"
								/>
								<span class="private-feature-text">Lockable office</span>
							</div>
							<div class="private-feature">
								<svg
									class="private-feature-icon"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
									<circle cx="12" cy="7" r="4" />
								</svg>
								<span class="private-feature-text">Up to 6 people</span>
							</div>
							<div class="private-feature">
								<img
									src="assets/icons/desk.png"
									alt="Presentation desk icon for meeting setup"
									class="private-feature-icon"
								/>
								<span class="private-feature-text">Presentation setup</span>
							</div>
							<div class="private-feature">
								<svg
									class="private-feature-icon"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<polygon points="23 7 16 12 23 17 23 7" />
									<rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
								</svg>
								<span class="private-feature-text">Video conferencing</span>
							</div>
						</div>

						<button class="cta-button" on:click={() => goto('/booking')}
							><span>Book private room</span></button
						>
					</div>
				</div>
			</section>
		</div>
	</div>
</section>
