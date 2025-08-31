<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let adminUser = null;
	let bookings = [];
	let isLoading = true;

	onMount(() => {
		// Check if user is logged in
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('adminToken');
			const user = localStorage.getItem('adminUser');
			
			if (!token || !user) {
				goto('/admin');
				return;
			}

			try {
				adminUser = JSON.parse(user);
				loadBookings();
			} catch (error) {
				console.error('Error parsing admin user:', error);
				goto('/admin');
			}
		}
	});

	async function loadBookings() {
		try {
			const response = await fetch('/api/admin/bookings', {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
				}
			});

			if (response.ok) {
				bookings = await response.json();
			} else {
				console.error('Failed to load bookings');
			}
		} catch (error) {
			console.error('Error loading bookings:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleLogout() {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('adminToken');
			localStorage.removeItem('adminUser');
		}
		goto('/admin');
	}

	async function updateBookingStatus(bookingId, status) {
		try {
			const response = await fetch(`/api/admin/bookings/${bookingId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
				},
				body: JSON.stringify({ status })
			});

			if (response.ok) {
				// Reload bookings
				await loadBookings();
			} else {
				console.error('Failed to update booking status');
			}
		} catch (error) {
			console.error('Error updating booking status:', error);
		}
	}
</script>

<div class="admin-dashboard">
	<header class="header">
		<h1>Admin Dashboard - The Circle</h1>
		<div class="header-actions">
			<span class="admin-name">Welcome, {adminUser?.username || 'Admin'}</span>
			<button class="logout-btn" on:click={handleLogout}>Logout</button>
		</div>
	</header>

	<div class="container">
		{#if isLoading}
			<div class="loading">Loading...</div>
		{:else}
			<!-- Bookings Section -->
			<section class="section">
				<h2>Recent Bookings</h2>
				{#if bookings.length > 0}
					<div class="bookings-table">
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Customer</th>
									<th>Type</th>
									<th>Date</th>
									<th>Amount</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each bookings as booking}
									<tr>
										<td>{booking.id}</td>
										<td>{booking.customerName}</td>
										<td>{booking.type}</td>
										<td>{new Date(booking.date).toLocaleDateString()}</td>
										<td>L.E {booking.amount}</td>
										<td>
											<span class="status" class:confirmed={booking.status === 'confirmed'} class:pending={booking.status === 'pending'} class:cancelled={booking.status === 'cancelled'}>
												{booking.status}
											</span>
										</td>
										<td>
											<div class="actions">
												{#if booking.status === 'pending'}
													<button class="btn btn-success" on:click={() => updateBookingStatus(booking.id, 'confirmed')}>
														Confirm
													</button>
													<button class="btn btn-danger" on:click={() => updateBookingStatus(booking.id, 'cancelled')}>
														Cancel
													</button>
												{/if}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p>No bookings found.</p>
				{/if}
			</section>

			<!-- Statistics Section -->
			<section class="section">
				<h2>Statistics</h2>
				<div class="stats-grid">
					<div class="stat-card">
						<h3>Total Bookings</h3>
						<p class="stat-number">{bookings.length}</p>
					</div>
					<div class="stat-card">
						<h3>Pending</h3>
						<p class="stat-number">{bookings.filter(b => b.status === 'pending').length}</p>
					</div>
					<div class="stat-card">
						<h3>Confirmed</h3>
						<p class="stat-number">{bookings.filter(b => b.status === 'confirmed').length}</p>
					</div>
					<div class="stat-card">
						<h3>Total Revenue</h3>
						<p class="stat-number">L.E {bookings.reduce((sum, b) => sum + b.amount, 0)}</p>
					</div>
				</div>
			</section>
		{/if}
	</div>
</div>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.admin-dashboard {
		min-height: 100vh;
		background: #f5f5f5;
	}

	.header {
		background: #333;
		color: white;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header h1 {
		font-size: 1.5rem;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.admin-name {
		font-size: 0.9rem;
		opacity: 0.9;
	}

	.logout-btn {
		background: #dc3545;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background-color 0.3s ease;
	}

	.logout-btn:hover {
		background: #c82333;
	}

	.container {
		max-width: 1200px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	.section {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
	}

	.section h2 {
		margin-bottom: 1rem;
		color: #333;
		font-size: 1.3rem;
	}

	.loading {
		text-align: center;
		padding: 2rem;
		font-size: 1.1rem;
		color: #666;
	}

	.bookings-table {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	th, td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #eee;
	}

	th {
		background: #f8f9fa;
		font-weight: 600;
		color: #333;
	}

	.status {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.status.pending {
		background: #fff3cd;
		color: #856404;
	}

	.status.confirmed {
		background: #d4edda;
		color: #155724;
	}

	.status.cancelled {
		background: #f8d7da;
		color: #721c24;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.25rem 0.5rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.8rem;
		transition: background-color 0.3s ease;
	}

	.btn-success {
		background: #28a745;
		color: white;
	}

	.btn-success:hover {
		background: #218838;
	}

	.btn-danger {
		background: #dc3545;
		color: white;
	}

	.btn-danger:hover {
		background: #c82333;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.stat-card {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 8px;
		text-align: center;
		border: 1px solid #e9ecef;
	}

	.stat-card h3 {
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-number {
		font-size: 2rem;
		font-weight: 700;
		color: #333;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.header-actions {
			flex-direction: column;
			gap: 0.5rem;
		}

		.container {
			margin: 1rem auto;
			padding: 0 0.5rem;
		}

		.section {
			padding: 1rem;
		}

		.bookings-table {
			font-size: 0.9rem;
		}

		th, td {
			padding: 0.5rem;
		}

		.actions {
			flex-direction: column;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.stat-number {
			font-size: 1.5rem;
		}
	}
</style>
