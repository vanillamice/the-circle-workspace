<script>
	// Booking Form Component
	let selectedPlan = 'daily';
	let selectedDate = '';
	let startTime = '';
	let duration = '';
	let totalPrice = 0;

	const plans = {
		daily: {
			price: 100,
			period: '/Day',
			features: ['High-speed wifi', 'Access to coffee corner', 'Terrace access', 'AC']
		},
		monthly: {
			price: 2300,
			period: '/Month',
			features: ['High-speed wifi', 'Access to coffee corner', 'Terrace access', 'AC', 'Priority booking', 'Member events']
		}
	};

	const privateRoom = {
		price: 150,
		period: '/Hour',
		features: ['Complete privacy', 'Up to 6 people', 'Custom setup ready']
	};

	const timeSlots = [
		'09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
		'15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
	];

	const durations = [1, 2, 3, 4, 5, 6, 7, 8];

	function updatePrice() {
		if (selectedPlan === 'daily') {
			totalPrice = plans.daily.price;
		} else if (selectedPlan === 'monthly') {
			totalPrice = plans.monthly.price;
		}
	}

	function updatePrivatePrice() {
		if (duration) {
			totalPrice = privateRoom.price * parseInt(duration);
		}
	}

	function handleSharedSubmit(e) {
		e.preventDefault();
		if (!selectedDate) {
			alert('Please select a date');
			return;
		}
		// Handle booking submission
		console.log('Shared workspace booking:', { selectedPlan, selectedDate, totalPrice });
	}

	function handlePrivateSubmit(e) {
		e.preventDefault();
		if (!selectedDate || !startTime || !duration) {
			alert('Please fill in all fields');
			return;
		}
		// Handle booking submission
		console.log('Private room booking:', { selectedDate, startTime, duration, totalPrice });
	}

	$: updatePrice();
	$: updatePrivatePrice();
</script>

<div class="booking-container">
	<h1 class="page-title">Book your space</h1>
	<p class="page-subtitle">Choose the perfect workspace solution for your needs</p>

	<!-- Shared Space Section -->
	<section class="booking-section">
		<h2 class="section-title">Shared Workspace</h2>
		<p class="section-description">Access to our open workspace with all amenities included</p>
		
		<div class="plan-selector">
			<button 
				class="plan-btn" 
				class:active={selectedPlan === 'daily'}
				on:click={() => selectedPlan = 'daily'}
			>
				Daily Pass
			</button>
			<button 
				class="plan-btn" 
				class:active={selectedPlan === 'monthly'}
				on:click={() => selectedPlan = 'monthly'}
			>
				Monthly Membership
			</button>
		</div>

		<div class="plan-details">
			<div class="plan-info">
				<div class="price-display">
					<span class="currency">L.E</span>
					<span>{plans[selectedPlan].price}</span>
					<span class="period">{plans[selectedPlan].period}</span>
				</div>
				<ul class="features-list">
					{#each plans[selectedPlan].features as feature}
						<li>{feature}</li>
					{/each}
				</ul>
			</div>

			<form class="booking-form" on:submit={handleSharedSubmit}>
				<div class="form-group">
					<label class="form-label">Select date</label>
					<div class="date-wrapper">
						<svg class="calendar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
							<line x1="16" y1="2" x2="16" y2="6"/>
							<line x1="8" y1="2" x2="8" y2="6"/>
							<line x1="3" y1="10" x2="21" y2="10"/>
						</svg>
						<input 
							type="date" 
							bind:value={selectedDate}
							required 
							autocomplete="off"
						>
					</div>
				</div>
				<button type="submit" class="book-btn">
					<span>Book {selectedPlan === 'daily' ? 'daily pass' : 'monthly membership'}</span>
				</button>
			</form>
		</div>
	</section>

	<!-- Private Room Section -->
	<section class="booking-section">
		<h2 class="section-title">Private Room</h2>
		<p class="section-description">Exclusive private space for focused work and meetings</p>
		
		<div class="plan-details">
			<div class="plan-info">
				<div class="price-display">
					<span class="currency">L.E</span>
					<span>{privateRoom.price}</span>
					<span class="period">{privateRoom.period}</span>
				</div>
				<ul class="features-list">
					{#each privateRoom.features as feature}
						<li>{feature}</li>
					{/each}
				</ul>
			</div>

			<form class="booking-form" on:submit={handlePrivateSubmit}>
				<div class="form-group">
					<label class="form-label">Select date</label>
					<div class="date-wrapper">
						<svg class="calendar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
							<line x1="16" y1="2" x2="16" y2="6"/>
							<line x1="8" y1="2" x2="8" y2="6"/>
							<line x1="3" y1="10" x2="21" y2="10"/>
						</svg>
						<input 
							type="date" 
							bind:value={selectedDate}
							required 
							autocomplete="off"
						>
					</div>
				</div>
				<div class="time-grid">
					<div class="form-group">
						<label class="form-label">Start time</label>
						<select class="form-select" bind:value={startTime} required autocomplete="off">
							<option value="">Select time</option>
							{#each timeSlots as time}
								<option value={time}>{time}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label class="form-label">Duration (hours)</label>
						<select class="form-select" bind:value={duration} required autocomplete="off">
							<option value="">Select duration</option>
							{#each durations as hours}
								<option value={hours}>{hours} hour{hours > 1 ? 's' : ''}</option>
							{/each}
						</select>
					</div>
				</div>
				{#if totalPrice > 0}
					<div class="total-price">Total: L.E {totalPrice}</div>
				{/if}
				<button type="submit" class="book-btn">
					<span>Book private room</span>
				</button>
			</form>
		</div>
	</section>
</div>

<style>
	:root {
		--bg: #f4f3f1;
		--text-main: #111;
		--divider: #1112;
		--green: #00674F;
		--light-green: #3CB371;
	}

	.booking-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: clamp(2rem, 4vw, 4rem) clamp(1rem, 4vw, 2rem);
	}

	.page-title {
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 700;
		color: var(--text-main);
		margin-bottom: clamp(1rem, 2vw, 1.5rem);
		letter-spacing: clamp(-1.5px, -0.2vw, -3px);
		line-height: 1.1;
		text-align: center;
	}

	.page-subtitle {
		font-size: clamp(1.24rem, 2.7vw, 1.6rem);
		font-weight: 400;
		color: var(--green);
		line-height: 1.5;
		margin: 0 auto clamp(3rem, 6vw, 4rem) auto;
		text-align: center;
		max-width: 600px;
	}

	.booking-section {
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(17, 17, 17, 0.08);
		border-radius: 20px;
		padding: clamp(2rem, 4vw, 3rem);
		margin-bottom: clamp(2rem, 4vw, 3rem);
		transition: all 0.3s ease;
	}

	.booking-section:hover {
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
		border-color: rgba(17, 17, 17, 0.12);
	}

	.section-title {
		font-size: clamp(1.8rem, 4vw, 2.5rem);
		font-weight: 700;
		color: var(--text-main);
		margin-bottom: 0.5rem;
		text-align: center;
		letter-spacing: clamp(-1px, -0.1vw, -2px);
	}

	.section-description {
		font-size: clamp(1rem, 2vw, 1.2rem);
		color: var(--green);
		font-weight: 600;
		text-align: center;
		margin-bottom: clamp(2rem, 4vw, 3rem);
	}

	.plan-selector {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: clamp(2rem, 4vw, 3rem);
	}

	.plan-btn {
		background: rgba(255, 255, 255, 0.9);
		border: 2px solid rgba(17, 17, 17, 0.15);
		border-radius: 99rem;
		padding: 12px 24px;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-main);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.plan-btn:hover {
		background: var(--green);
		color: white;
		border-color: var(--green);
	}

	.plan-btn.active {
		background: var(--green);
		color: white;
		border-color: var(--green);
	}

	.plan-details {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(2rem, 4vw, 3rem);
		align-items: start;
	}

	.plan-info {
		background: rgba(255, 255, 255, 0.9);
		padding: 2rem;
		border-radius: 16px;
		border: 1px solid rgba(17, 17, 17, 0.08);
	}

	.price-display {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 700;
		color: var(--green);
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.currency {
		font-size: 0.6em;
		vertical-align: top;
	}

	.period {
		font-size: 0.4em;
		font-weight: 400;
		color: var(--text-main);
	}

	.features-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.features-list li {
		padding: 8px 0;
		font-size: 1rem;
		color: var(--text-main);
		position: relative;
		padding-left: 24px;
	}

	.features-list li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: var(--green);
		font-weight: bold;
	}

	.booking-form {
		background: rgba(255, 255, 255, 0.9);
		padding: 2rem;
		border-radius: 16px;
		border: 1px solid rgba(17, 17, 17, 0.08);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-label {
		display: block;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-main);
		margin-bottom: 0.5rem;
	}

	.date-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		background: white;
		border: 1px solid rgba(17, 17, 17, 0.15);
		border-radius: 8px;
		padding: 12px 16px;
		cursor: pointer;
		transition: border-color 0.3s ease;
	}

	.date-wrapper:hover {
		border-color: var(--green);
	}

	.calendar-icon {
		margin-right: 12px;
		color: var(--green);
	}

	.date-wrapper input {
		border: none;
		outline: none;
		background: transparent;
		font-size: 1rem;
		color: var(--text-main);
		width: 100%;
		cursor: pointer;
	}

	.time-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-select {
		width: 100%;
		padding: 12px 16px;
		border: 1px solid rgba(17, 17, 17, 0.15);
		border-radius: 8px;
		font-size: 1rem;
		color: var(--text-main);
		background: white;
		cursor: pointer;
		transition: border-color 0.3s ease;
	}

	.form-select:hover {
		border-color: var(--green);
	}

	.total-price {
		background: var(--green);
		color: white;
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.book-btn {
		width: 100%;
		background: var(--green);
		color: white;
		border: none;
		border-radius: 8px;
		padding: 16px 24px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.book-btn:hover {
		background: var(--light-green);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.plan-details {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.plan-selector {
			flex-direction: column;
			align-items: center;
		}

		.time-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
