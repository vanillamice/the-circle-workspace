console.log('Booking script loaded successfully');

// Plan data
const planData = {
    daily: {
        price: 100,
        period: '/Day',
        features: [
            'High-speed wifi',
            'Access to coffee corner',
            'Terrace access',
            'AC',
            'Quiet acoustic glass rooms'
        ],
        dateLabel: 'Select date',
        buttonText: 'Book daily pass',
        maxDays: 7
    },
    monthly: {
        price: 2300,
        period: '/Month',
        features: [
            'High-speed wifi',
            'Access to coffee corner',
            'Terrace access',
            'AC',
            'Quiet acoustic glass rooms',
            'Community events'
        ],
        dateLabel: 'Start date',
        buttonText: 'Book monthly membership',
        maxDays: 15
    }
};

// Set date constraints
function setDateConstraints() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Shared workspace date (will be updated based on plan)
    const sharedInput = document.getElementById('shared-date');
    sharedInput.min = todayStr;
    
    // Private room: today to 7 days from now
    const privateMaxDate = new Date(today);
    privateMaxDate.setDate(today.getDate() + 7);
    const privateMaxStr = privateMaxDate.toISOString().split('T')[0];
    
    const privateInput = document.getElementById('private-date');
    privateInput.min = todayStr;
    privateInput.max = privateMaxStr;
}

// Open date picker function
function openDatePicker(wrapper) {
    const input = wrapper.querySelector('input[type="date"]');
    
    // Focus the input first
    input.focus();
    
    // Trigger click event
    input.click();
    
    // Additional fallback for some browsers
    setTimeout(() => {
        if (input.showPicker) {
            try { 
                input.showPicker(); 
            } catch(e) {
                // showPicker failed, native click should work
                console.log('Using native click behavior');
            }
        }
    }, 100);
}

// Populate time slots for private rooms
function populateTimeSlots() {
    const startTimeSelect = document.getElementById('start-time');
    
    // Clear any existing options except the first placeholder
    while (startTimeSelect.children.length > 1) {
        startTimeSelect.removeChild(startTimeSelect.lastChild);
    }
    
    const hours = [];
    
    // Open from 9 AM to 12 AM (midnight)
    const timeSlots = [
        { display: '9:00 AM', value: 9 },
        { display: '10:00 AM', value: 10 },
        { display: '11:00 AM', value: 11 },
        { display: '12:00 PM', value: 12 },
        { display: '1:00 PM', value: 13 },
        { display: '2:00 PM', value: 14 },
        { display: '3:00 PM', value: 15 },
        { display: '4:00 PM', value: 16 },
        { display: '5:00 PM', value: 17 },
        { display: '6:00 PM', value: 18 },
        { display: '7:00 PM', value: 19 },
        { display: '8:00 PM', value: 20 },
        { display: '9:00 PM', value: 21 },
        { display: '10:00 PM', value: 22 },
        { display: '11:00 PM', value: 23 },
        { display: '12:00 AM', value: 24 }
    ];
    
    timeSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot.value;
        option.textContent = slot.display;
        startTimeSelect.appendChild(option);
    });
}

// Switch between daily and monthly plans
function switchPlan(plan) {
    const data = planData[plan];
    
    // Update price and period
    document.getElementById('shared-price').textContent = data.price.toLocaleString();
    document.getElementById('shared-period').textContent = data.period;
    
    // Update features
    const featuresList = document.getElementById('shared-features');
    featuresList.innerHTML = '';
    data.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });
    
    // Update form labels and button
    document.getElementById('date-label').textContent = data.dateLabel;
    document.getElementById('book-btn-text').textContent = data.buttonText;
    
    // Update date constraints
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + data.maxDays);
    const maxStr = maxDate.toISOString().split('T')[0];
    
    const sharedInput = document.getElementById('shared-date');
    sharedInput.max = maxStr;
    
    // Update form data type
    document.getElementById('shared-form').dataset.type = plan;
}

// Calculate total price for private room
function calculatePrice() {
    const duration = document.getElementById('duration').value;
    const startTime = document.getElementById('start-time').value;
    const totalPriceDiv = document.getElementById('total-price');
    const durationSelect = document.getElementById('duration');
    
    if (duration && startTime) {
        // Validate booking time constraint
        const isValidBooking = validateBookingTime(parseInt(startTime), parseInt(duration));
        
        if (!isValidBooking) {
            totalPriceDiv.textContent = 'Booking extends beyond closing time (1 AM)';
            totalPriceDiv.style.color = '#ff4444';
            return;
        }
        
        const total = parseInt(duration) * 150;
        totalPriceDiv.textContent = `Total: L.E ${total}`;
        totalPriceDiv.style.color = '';
    } else {
        totalPriceDiv.textContent = '';
        totalPriceDiv.style.color = '';
    }
}

// Validate that booking doesn't extend beyond 1 AM
function validateBookingTime(startHour, durationHours) {
    const endHour = startHour + durationHours;
    
    // Convert to actual hour values for clarity
    // 24 represents midnight (12 AM), so 25 represents 1 AM
    // Workspace closes at 1 AM, so maximum valid end time is 25 (1 AM)
    // The booking can end at exactly 1 AM (hour 25), but not after
    console.log(`Validating: Start ${startHour}, Duration ${durationHours}, End ${endHour}, Valid: ${endHour <= 25}`);
    return endHour <= 25;
}

// Convert 24-hour format to 12-hour format for display
function convertTo12HourFormat(hour24) {
    if (hour24 === 24) return '12:00 AM';
    if (hour24 === 12) return '12:00 PM';
    if (hour24 > 12) return `${hour24 - 12}:00 PM`;
    return `${hour24}:00 AM`;
}

// Handle form submissions
function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const type = form.dataset.type;
    
    // Store booking data for checkout
    let bookingData = {
        booking_type: '',
        amount_cents: 0,
        start_date: null,
        end_date: null,
        start_time: null,
        end_time: null
    };
    
    if (type === 'daily') {
        const date = document.getElementById('shared-date').value;
        bookingData = {
            booking_type: 'shared_daily',
            amount_cents: 10000, // 100 L.E in cents
            start_date: date,
            end_date: date
        };
    } else if (type === 'monthly') {
        const date = document.getElementById('shared-date').value;
        const endDate = new Date(date);
        endDate.setMonth(endDate.getMonth() + 1);
        const endDateStr = endDate.toISOString().split('T')[0];
        
        bookingData = {
            booking_type: 'shared_monthly',
            amount_cents: 230000, // 2,300 L.E in cents
            start_date: date,
            end_date: endDateStr
        };
    } else if (type === 'private') {
        const date = document.getElementById('private-date').value;
        const startTime = document.getElementById('start-time').value;
        const duration = document.getElementById('duration').value;
        
        // Validate booking time constraint
        if (!validateBookingTime(parseInt(startTime), parseInt(duration))) {
            alert('Cannot book: This would extend beyond our closing time of 1 AM. Please select an earlier start time or shorter duration.');
            return;
        }
        
        // Calculate end time
        const startDateTime = new Date(`${date}T${startTime.toString().padStart(2, '0')}:00:00`);
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + parseInt(duration));
        
        bookingData = {
            booking_type: 'private_hourly',
            amount_cents: parseInt(duration) * 15000, // 150 L.E per hour in cents
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString()
        };
    }
    
    // Store booking data globally for checkout
    window.currentBookingData = bookingData;
    
    // Show user info form
    showUserInfoForm(bookingData);
}

// Show user info form modal
function showUserInfoForm(bookingData) {
    const modal = document.getElementById('user-info-modal');
    const bookingSummary = document.getElementById('booking-summary');
    
    // Create booking summary
    let summaryText = '';
    if (bookingData.booking_type === 'shared_daily') {
        summaryText = `Daily Pass - ${new Date(bookingData.start_date).toLocaleDateString()}`;
    } else if (bookingData.booking_type === 'shared_monthly') {
        summaryText = `Monthly Membership - ${new Date(bookingData.start_date).toLocaleDateString()} to ${new Date(bookingData.end_date).toLocaleDateString()}`;
    } else if (bookingData.booking_type === 'private_hourly') {
        const startTime = new Date(bookingData.start_time);
        const endTime = new Date(bookingData.end_time);
        summaryText = `Private Room - ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    bookingSummary.textContent = summaryText;
    document.getElementById('booking-amount').textContent = `L.E ${(bookingData.amount_cents / 100).toLocaleString()}`;
    
    modal.classList.add('show');
}

// Fixed checkout function with improved payment method detection
async function handleCheckout() {
    console.log('handleCheckout function called');
    
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    
    console.log('Form values:', { name, email, phone });
    
    // Get payment method from the new button system
    let paymentMethod = document.getElementById('selected-payment-method').value;
    console.log('Payment method from hidden input:', paymentMethod);
    
    // If no payment method is selected, default to paymob
    if (!paymentMethod) {
        paymentMethod = 'paymob';
        document.getElementById('selected-payment-method').value = 'paymob';
        // Set the first button as selected
        const firstBtn = document.querySelector('.payment-option-btn[data-method="paymob"]');
        if (firstBtn) {
            firstBtn.classList.add('selected');
        }
        console.log('No payment method selected, defaulting to paymob');
    }
    
    console.log('Final selected payment method:', paymentMethod);
    
    // Check if we found a payment method
    if (!paymentMethod) {
        console.log('No payment method selected - showing detailed debug info');
        
        // Debug: Check if radio buttons exist and their states
        const radios = document.querySelectorAll('input[name="payment-method"]');
        console.log('Debug - Total radio buttons found:', radios.length);
        
        radios.forEach((radio, index) => {
            console.log(`Debug Radio ${index}:`, {
                value: radio.value,
                checked: radio.checked,
                name: radio.name,
                type: radio.type,
                id: radio.id,
                className: radio.className
            });
        });
        
        alert('Please select a payment method. If you have selected one, please try clicking it again.');
        return;
    }
    
    // Validate other inputs
    if (!name || !email || !phone) {
        alert('Please fill in all required fields: name, email, and phone number.');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Enhanced phone validation
    const cleanPhone = phone.replace(/\s+/g, '').trim();
    
    // Check if phone is empty
    if (!cleanPhone) {
        alert('Please enter a valid phone number.');
        return;
    }
    
    // Check minimum length (7 digits minimum)
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
        alert('Phone number must contain at least 7 digits.');
        return;
    }
    
    // Check maximum length (15 digits maximum)
    if (digitsOnly.length > 15) {
        alert('Phone number cannot exceed 15 digits.');
        return;
    }
    
    // Validate international format (starts with +)
    if (cleanPhone.startsWith('+')) {
        const internationalRegex = /^\+[1-9]\d{1,14}$/;
        if (!internationalRegex.test(cleanPhone)) {
            alert('Invalid international phone number format. Use format: +[country code][number]');
            return;
        }
    } else {
        // For local formats, provide guidance
        if (cleanPhone.length < 10) {
            alert('Please enter a valid phone number. For international numbers, start with + and country code.');
            return;
        }
    }
    
    const bookingData = window.currentBookingData;
    if (!bookingData) {
        alert('No booking data found. Please try again.');
        return;
    }
    
    try {
        // Show loading state
        const checkoutBtn = document.getElementById('checkout-btn');
        const originalText = checkoutBtn.textContent;
        checkoutBtn.textContent = 'Processing...';
        checkoutBtn.disabled = true;
        
        if (paymentMethod === 'paymob') {
            // Create Paymob order and get payment URL
            const paymentUrl = await createPaymobOrder(name, email, phone, bookingData);
            
            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                alert('Failed to create payment order. Please try again.');
                // Reset button
                checkoutBtn.textContent = originalText;
                checkoutBtn.disabled = false;
            }
        } else if (paymentMethod === 'reception') {
            // Create booking with "pay at reception" status
            try {
                await createReceptionBooking(name, email, phone, bookingData);
            } catch (error) {
                console.error('Error in reception booking:', error);
                alert('Error creating booking: ' + error.message);
                // Reset button
                checkoutBtn.textContent = originalText;
                checkoutBtn.disabled = false;
            }
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert('An error occurred during checkout. Please try again.');
        
        // Reset button
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.textContent = 'Proceed to Payment';
        checkoutBtn.disabled = false;
    }
}

// Create Paymob order and get payment URL
async function createPaymobOrder(name, email, phone, bookingData) {
    // Prepare booking data for backend
    const bookingPayload = {
        name: name,
        email: email,
        phone: phone,
        booking_type: bookingData.booking_type,
        amount_cents: bookingData.amount_cents,
        currency: 'EGP',
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        booking_description: getBookingDescription(bookingData)
    };
    
    // Send to secure backend API
    const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.payment_url) {
        throw new Error('Payment URL not received from server');
    }
    
    return result.payment_url;
}

// Create booking for payment at reception
async function createReceptionBooking(name, email, phone, bookingData) {
    console.log('Creating reception booking with data:', bookingData);
    
    // Prepare booking data for backend
    const bookingPayload = {
        customer_name: name,
        email: email,
        phone: phone,
        booking_type: bookingData.booking_type,
        date: bookingData.start_date || new Date(bookingData.start_time).toISOString().split('T')[0],
        time: bookingData.start_time ? new Date(bookingData.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : null,
        duration: bookingData.duration || (bookingData.booking_type === 'private_hourly' ? Math.ceil((new Date(bookingData.end_time) - new Date(bookingData.start_time)) / (1000 * 60 * 60)) : null),
        amount: bookingData.amount_cents / 100, // Convert from cents to L.E
        status: 'pending',
        notes: 'Payment at reception'
    };
    
    console.log('Sending payload to API:', bookingPayload);
    
    // Send to backend API
    const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API response:', result);
    
    try {
        // Show success message
        const details = `Your booking has been created successfully! We will contact you for further details.\n\nBooking: ${getBookingDescription(bookingData)}`;
        showModal(details);
        
        // Track Google Ads conversion
        gtag_report_conversion();
        
        // Reset button
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.textContent = 'Confirm Booking';
        checkoutBtn.disabled = false;
        
        // Close the user info modal
        closeUserInfoModal();
    } catch (error) {
        console.error('Error in createReceptionBooking:', error);
        alert('Error creating booking: ' + error.message);
        
        // Reset button
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.textContent = 'Confirm Booking';
        checkoutBtn.disabled = false;
    }
}

// Helper function to get booking type name
function getBookingTypeName(bookingType) {
    switch (bookingType) {
        case 'shared_daily':
            return 'Daily Pass';
        case 'shared_monthly':
            return 'Monthly Membership';
        case 'private_hourly':
            return 'Private Room';
        default:
            return 'Workspace Booking';
    }
}

// Helper function to get booking description
function getBookingDescription(bookingData) {
    switch (bookingData.booking_type) {
        case 'shared_daily':
            return `Daily workspace access for ${new Date(bookingData.start_date).toLocaleDateString()}`;
        case 'shared_monthly':
            return `Monthly workspace membership from ${new Date(bookingData.start_date).toLocaleDateString()} to ${new Date(bookingData.end_date).toLocaleDateString()}`;
        case 'private_hourly':
            const startTime = new Date(bookingData.start_time);
            const endTime = new Date(bookingData.end_time);
            return `Private room booking on ${startTime.toLocaleDateString()} from ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        default:
            return 'Workspace booking';
    }
}

// Close user info modal
function closeUserInfoModal() {
    document.getElementById('user-info-modal').classList.remove('show');
    // Clear form
    document.getElementById('user-name').value = '';
    document.getElementById('user-email').value = '';
}

// Show success modal (for after payment)
function showModal(details) {
    try {
        console.log('Showing modal with details:', details);
        const detailsElement = document.getElementById('booking-details');
        const modalElement = document.getElementById('success-modal');
        
        if (!detailsElement) {
            console.error('booking-details element not found');
            alert('Error: Could not display booking details');
            return;
        }
        
        if (!modalElement) {
            console.error('success-modal element not found');
            alert('Error: Could not display success modal');
            return;
        }
        
        detailsElement.textContent = details;
        modalElement.classList.add('show');
        console.log('Modal shown successfully');
    } catch (error) {
        console.error('Error showing modal:', error);
        alert('Error displaying booking confirmation: ' + error.message);
    }
}

// Close modal
function closeModal() {
    document.getElementById('success-modal').classList.remove('show');
}


// Update button text based on payment method (OLD VERSION - KEPT FOR REFERENCE)
// function updateButtonText() {
//     const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
//     const checkoutBtn = document.getElementById('checkout-btn');
//     
//     if (paymentMethod && checkoutBtn) {
//         if (paymentMethod.value === 'paymob') {
//             checkoutBtn.textContent = 'Proceed to Payment';
//         } else {
//             checkoutBtn.textContent = 'Create Booking';
//         }
//     }
// }

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Reset page state on load
    resetPageState();
    
    setDateConstraints();
    populateTimeSlots();
    
    // Add plan switching event listeners
    document.querySelectorAll('.plan-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.plan-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Switch plan
            switchPlan(this.dataset.plan);
        });
    });
    
    // Add event listeners for private room
    document.getElementById('duration').addEventListener('change', calculatePrice);
    document.getElementById('start-time').addEventListener('change', calculatePrice);
    
    // Add form submit listeners
    document.querySelectorAll('.booking-form').forEach(form => {
        form.addEventListener('submit', handleSubmit);
    });
    
    // Initialize payment method selection
    const defaultPaymentMethod = 'reception';
    selectPaymentMethod(defaultPaymentMethod);
    
    // Close modal when clicking outside
    document.getElementById('success-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});

// Reset page state to ensure clean start
function resetPageState() {
    // Clear any stored form data
    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('bookingFormData');
        sessionStorage.removeItem('selectedPlan');
    }
    
    // Reset all form inputs
    document.querySelectorAll('input, select').forEach(input => {
        input.value = '';
    });
    
    // Reset plan buttons to default state (daily active)
    document.querySelectorAll('.plan-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Set daily plan as active by default
    const dailyBtn = document.querySelector('.plan-btn[data-plan="daily"]');
    if (dailyBtn) {
        dailyBtn.classList.add('active');
    }
    
    // Reset to daily plan display
    switchPlan('daily');
    
    // Clear any error states
    document.querySelectorAll('.error').forEach(error => {
        error.remove();
    });
    
    // Reset any highlighted elements
    document.querySelectorAll('.highlighted, .selected').forEach(el => {
        el.classList.remove('highlighted', 'selected');
    });
    
    // Force browser to not remember form state
    document.querySelectorAll('form').forEach(form => {
        form.reset();
    });
}

// Handle page visibility changes (when user returns to tab)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible again, reset state
        resetPageState();
    }
});

// Handle beforeunload to clear any stored state
window.addEventListener('beforeunload', function() {
    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('bookingFormData');
        sessionStorage.removeItem('selectedPlan');
    }
});

// Function to select payment method using the new button system
function selectPaymentMethod(method) {
    console.log('Selecting payment method:', method);
    
    // Remove selected class from all buttons
    document.querySelectorAll('.payment-option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selected class to clicked button
    const selectedBtn = document.querySelector(`[data-method="${method}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Update hidden input
    document.getElementById('selected-payment-method').value = method;
    
    // Update button text
    updateButtonText();
    
    console.log('Payment method set to:', method);
}

// Update button text based on payment method
function updateButtonText() {
    const paymentMethod = document.getElementById('selected-payment-method').value;
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (checkoutBtn) {
        if (paymentMethod === 'paymob') {
            checkoutBtn.textContent = 'Proceed to Payment';
        } else {
            checkoutBtn.textContent = 'Create Booking';
        }
    }
}
