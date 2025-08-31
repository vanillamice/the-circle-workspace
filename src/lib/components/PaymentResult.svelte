<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Get URL parameters
	$: urlParams = new URLSearchParams($page.url.search);
	$: success = urlParams.get('success');
	$: transactionId = urlParams.get('transaction_id');
	$: orderId = urlParams.get('order_id');
	$: amount = urlParams.get('amount');
	$: currency = urlParams.get('currency');

	// Log payment result for debugging
	$: {
		console.log('Payment Result:', {
			success: success,
			transactionId: transactionId,
			orderId: orderId,
			amount: amount,
			currency: currency,
			urlParams: Object.fromEntries(urlParams.entries())
		});
	}
</script>

<div class="payment-result-container">
	<div class="result-card" class:success={success === 'true'} class:error={success !== 'true'}>
		{#if success === 'true'}
			<!-- Payment successful -->
			<div class="payment-icon">✓</div>
			<h1 class="payment-title">Payment Successful!</h1>
			<p class="payment-message">
				Your booking has been confirmed and payment processed successfully. 
				You will receive a confirmation email shortly with your booking details.
			</p>
			{#if transactionId || orderId || amount}
				<div class="payment-details">
					<h3>Payment Details</h3>
					{#if transactionId}
						<div class="detail-item">
							<span class="detail-label">Transaction ID:</span>
							<span class="detail-value">{transactionId}</span>
						</div>
					{/if}
					{#if orderId}
						<div class="detail-item">
							<span class="detail-label">Order ID:</span>
							<span class="detail-value">{orderId}</span>
						</div>
					{/if}
					{#if amount}
						<div class="detail-item">
							<span class="detail-label">Amount:</span>
							<span class="detail-value">{amount} {currency || 'EGP'}</span>
						</div>
					{/if}
				</div>
			{/if}
			<div class="payment-actions">
				<a href="/" class="btn btn-primary">Return to Home</a>
				<a href="/booking" class="btn btn-secondary">Book Another Space</a>
			</div>
		{:else}
			<!-- Payment failed or cancelled -->
			<div class="payment-icon">✗</div>
			<h1 class="payment-title">Payment Failed</h1>
			<p class="payment-message">
				Your payment was not completed. This could be due to insufficient funds, 
				card issues, or the payment was cancelled. Please try again or contact 
				support if you continue to have issues.
			</p>
			{#if transactionId || orderId}
				<div class="payment-details">
					<h3>Transaction Details</h3>
					{#if transactionId}
						<div class="detail-item">
							<span class="detail-label">Transaction ID:</span>
							<span class="detail-value">{transactionId}</span>
						</div>
					{/if}
					{#if orderId}
						<div class="detail-item">
							<span class="detail-label">Order ID:</span>
							<span class="detail-value">{orderId}</span>
						</div>
					{/if}
				</div>
			{/if}
			<div class="payment-actions">
				<a href="/booking" class="btn btn-primary">Try Again</a>
				<a href="/" class="btn btn-secondary">Return to Home</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.payment-result-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: #f4f3f1;
	}

	.result-card {
		background: white;
		border-radius: 20px;
		padding: 3rem;
		max-width: 600px;
		width: 100%;
		text-align: center;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		border: 1px solid #e9ecef;
	}

	.result-card.success {
		border-left: 6px solid #28a745;
	}

	.result-card.error {
		border-left: 6px solid #dc3545;
	}

	.payment-icon {
		font-size: 4rem;
		font-weight: bold;
		margin-bottom: 1.5rem;
	}

	.result-card.success .payment-icon {
		color: #28a745;
	}

	.result-card.error .payment-icon {
		color: #dc3545;
	}

	.payment-title {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: #333;
	}

	.payment-message {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #666;
		margin-bottom: 2rem;
	}

	.payment-details {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		text-align: left;
	}

	.payment-details h3 {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #333;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e9ecef;
	}

	.detail-item:last-child {
		border-bottom: none;
	}

	.detail-label {
		font-weight: 600;
		color: #666;
	}

	.detail-value {
		font-weight: 500;
		color: #333;
		font-family: monospace;
	}

	.payment-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		padding: 12px 24px;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s ease;
		border: 2px solid transparent;
	}

	.btn-primary {
		background: #00674F;
		color: white;
	}

	.btn-primary:hover {
		background: #005a43;
		transform: translateY(-2px);
	}

	.btn-secondary {
		background: transparent;
		color: #00674F;
		border-color: #00674F;
	}

	.btn-secondary:hover {
		background: #00674F;
		color: white;
		transform: translateY(-2px);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.payment-result-container {
			padding: 1rem;
		}

		.result-card {
			padding: 2rem;
		}

		.payment-title {
			font-size: 1.5rem;
		}

		.payment-message {
			font-size: 1rem;
		}

		.payment-actions {
			flex-direction: column;
		}

		.btn {
			width: 100%;
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		.result-card {
			padding: 1.5rem;
		}

		.payment-icon {
			font-size: 3rem;
		}

		.payment-title {
			font-size: 1.3rem;
		}
	}
</style>
