// Payment Result Page Handler
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const transactionId = urlParams.get('transaction_id');
    const orderId = urlParams.get('order_id');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency');
    
    const resultCard = document.getElementById('result-card');
    
    if (success === 'true') {
        // Payment successful
        resultCard.className = 'result-card success';
        resultCard.innerHTML = `
            <div class="payment-icon">✓</div>
            <h1 class="payment-title">Payment Successful!</h1>
            <p class="payment-message">
                Your booking has been confirmed and payment processed successfully. 
                You will receive a confirmation email shortly with your booking details.
            </p>
            ${(transactionId || orderId || amount) ? `
                <div class="payment-details">
                    <h3>Payment Details</h3>
                    ${transactionId ? `
                        <div class="detail-item">
                            <span class="detail-label">Transaction ID:</span>
                            <span class="detail-value">${transactionId}</span>
                        </div>
                    ` : ''}
                    ${orderId ? `
                        <div class="detail-item">
                            <span class="detail-label">Order ID:</span>
                            <span class="detail-value">${orderId}</span>
                        </div>
                    ` : ''}
                    ${amount ? `
                        <div class="detail-item">
                            <span class="detail-label">Amount:</span>
                            <span class="detail-value">${amount} ${currency || 'EGP'}</span>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
            <div class="payment-actions">
                <a href="../index.html" class="btn btn-primary">Return to Home</a>
                <a href="booking.html" class="btn btn-secondary">Book Another Space</a>
            </div>
        `;
    } else {
        // Payment failed or cancelled
        resultCard.className = 'result-card error';
        resultCard.innerHTML = `
            <div class="payment-icon">✗</div>
            <h1 class="payment-title">Payment Failed</h1>
            <p class="payment-message">
                Your payment was not completed. This could be due to insufficient funds, 
                card issues, or the payment was cancelled. Please try again or contact 
                support if you continue to have issues.
            </p>
            ${(transactionId || orderId) ? `
                <div class="payment-details">
                    <h3>Transaction Details</h3>
                    ${transactionId ? `
                        <div class="detail-item">
                            <span class="detail-label">Transaction ID:</span>
                            <span class="detail-value">${transactionId}</span>
                        </div>
                    ` : ''}
                    ${orderId ? `
                        <div class="detail-item">
                            <span class="detail-label">Order ID:</span>
                            <span class="detail-value">${orderId}</span>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
            <div class="payment-actions">
                <a href="booking.html" class="btn btn-primary">Try Again</a>
                <a href="../index.html" class="btn btn-secondary">Return to Home</a>
            </div>
        `;
    }
    
    // Log payment result for debugging
    console.log('Payment Result:', {
        success: success,
        transactionId: transactionId,
        orderId: orderId,
        amount: amount,
        currency: currency,
        urlParams: Object.fromEntries(urlParams.entries())
    });
});
