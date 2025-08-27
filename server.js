const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.ALLOWED_ORIGINS || 'https://your-app-name.railway.app'] 
        : ['http://localhost:3000', 'https://localhost:3443'],
    credentials: true
}));
app.use(express.json());

// Cache-busting middleware for JavaScript files
app.use((req, res, next) => {
    if (req.path.endsWith('.js') || req.path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});

app.use(express.static('.')); // Serve static files from current directory

// Security middleware
app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Only set HSTS in production with HTTPS
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
    
    next();
});

// Security warning for development
if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ SECURITY WARNING: Running in development mode with HTTP!');
    console.warn('⚠️ Login credentials and tokens can be intercepted.');
    console.warn('⚠️ Use HTTPS in production with proper SSL certificates.');
}

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

// Create rate limiters based on request data instead of IP
const createRateLimiter = (windowMs, max, message, keyGenerator) => {
    return rateLimit({
        windowMs: windowMs,
        max: max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: keyGenerator
    });
};

// Rate limiter for booking requests based on email
const bookingLimiter = createRateLimiter(
    60 * 60 * 1000, // 1 hour window
    5, // max 5 attempts
    'Too many booking attempts with this email, please try again later.',
    (req) => {
        // Use email as the key for rate limiting
        return req.body.email || 'unknown';
    }
);

// Database setup
const dbPath = path.join(__dirname, 'circle.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Admin users table
        db.run(`CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Bookings table
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            booking_type TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT,
            duration INTEGER,
            amount INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Orders table with foreign key to bookings
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            order_type TEXT NOT NULL CHECK (order_type IN ('beverage', 'water')),
            quantity INTEGER DEFAULT 1,
            price INTEGER DEFAULT 10,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
        )`);

        // Create index for better performance on foreign key
        db.run(`CREATE INDEX IF NOT EXISTS idx_orders_booking_id ON orders(booking_id)`);

        // Create default admin user if not exists
        const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME;
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
        const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL;
        
        if (!defaultUsername || !defaultPassword || !defaultAdminEmail) {
            console.warn('⚠️ DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD, and DEFAULT_ADMIN_EMAIL must be set in environment variables');
            return;
        }
        
        db.get("SELECT id FROM admin_users WHERE username = ?", [defaultUsername], (err, row) => {
            if (!row) {
                bcrypt.hash(defaultPassword, 10, (err, hash) => {
                    if (!err) {
                        db.run(`INSERT INTO admin_users (username, password_hash, email, role) 
                                VALUES (?, ?, ?, ?)`, 
                                [defaultUsername, hash, defaultAdminEmail, 'admin']);
                        console.log(`Admin user created: ${defaultUsername}`);
                    }
                });
            }
        });
    });
}

// Paymob API configuration (stored securely in environment variables)
const PAYMOB_CONFIG = {
    API_KEY: process.env.PAYMOB_API_KEY,
    INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID,
    HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET
};

// Validate required environment variables
function validateConfig() {
    const required = ['PAYMOB_API_KEY', 'PAYMOB_INTEGRATION_ID'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        console.warn('⚠️ Paymob integration will not work without these variables');
    }
}

// JWT middleware for authentication
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Rate limiting for login attempts
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function checkLoginRateLimit(req, res, next) {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (loginAttempts.has(clientIP)) {
        const attempts = loginAttempts.get(clientIP);
        if (attempts.count >= MAX_LOGIN_ATTEMPTS && (now - attempts.lastAttempt) < LOCKOUT_TIME) {
            return res.status(429).json({ 
                error: 'Too many login attempts. Please try again later.',
                retryAfter: Math.ceil((LOCKOUT_TIME - (now - attempts.lastAttempt)) / 1000)
            });
        }
        if ((now - attempts.lastAttempt) >= LOCKOUT_TIME) {
            loginAttempts.delete(clientIP);
        }
    }
    next();
}

// ===== PUBLIC API ENDPOINTS =====

// Create Paymob payment endpoint
app.post('/api/create-payment', async (req, res) => {
    try {
        console.log('Payment request received:', { 
            hasApiKey: !!PAYMOB_CONFIG.API_KEY,
            hasIntegrationId: !!PAYMOB_CONFIG.INTEGRATION_ID,
            integrationId: PAYMOB_CONFIG.INTEGRATION_ID
        });
        
        const { name, email, phone, booking_type, amount_cents, currency, start_date, end_date, start_time, end_time, booking_description } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !booking_type || !amount_cents) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                message: 'Name, email, phone, booking type, and amount are required' 
            });
        }
        
        // Validate phone number using comprehensive validation
        const phoneValidation = validatePhoneNumber(phone);
        if (!phoneValidation.isValid) {
            return res.status(400).json({ error: phoneValidation.error });
        }
        
        // Use normalized phone number if available
        const normalizedPhone = phoneValidation.normalized || phone;
        
        // Log warning if phone validation has warnings
        if (phoneValidation.warning) {
            console.warn(`Phone validation warning for ${email}: ${phoneValidation.warning}`);
        }
        
        // Step 1: Create authentication token
        console.log('Attempting Paymob authentication...');
        const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: PAYMOB_CONFIG.API_KEY
            })
        });
        
        console.log('Auth response status:', authResponse.status);
        if (!authResponse.ok) {
            const authError = await authResponse.text();
            console.error('Auth error response:', authError);
            throw new Error(`Failed to authenticate with Paymob: ${authResponse.status} - ${authError}`);
        }
        
        const authData = await authResponse.json();
        const authToken = authData.token;
        console.log('Auth successful, token received');
        
        // Step 2: Create order
        console.log('Creating Paymob order...');
        const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                auth_token: authToken,
                delivery_needed: false,
                amount_cents: amount_cents,
                currency: currency || 'EGP',
                items: [{
                    name: getBookingTypeName(booking_type),
                    amount_cents: amount_cents,
                    description: booking_description,
                    quantity: 1
                }]
            })
        });
        
        console.log('Order response status:', orderResponse.status);
        if (!orderResponse.ok) {
            const orderError = await orderResponse.text();
            console.error('Order error response:', orderError);
            throw new Error(`Failed to create Paymob order: ${orderResponse.status} - ${orderError}`);
        }
        
        const orderData = await orderResponse.json();
        const orderId = orderData.id;
        console.log('Order created successfully, ID:', orderId);
        
        // Step 3: Create payment key
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const successUrl = `${baseUrl}/pages/payment-result.html?success=true`;
        const failureUrl = `${baseUrl}/pages/payment-result.html?success=false`;
        
        console.log('Creating payment key with URLs:', { successUrl, failureUrl });
        const paymentKeyPayload = {
            auth_token: authToken,
            amount_cents: amount_cents,
            expiration: 3600,
            order_id: orderId,
            billing_data: {
                first_name: name.split(' ')[0] || name,
                last_name: name.split(' ').slice(1).join(' ') || '',
                email: email,
                phone_number: normalizedPhone,
                country: 'EG',
                apartment: 'NA',
                floor: 'NA',
                street: 'NA',
                building: 'NA',
                shipping_method: 'NA',
                postal_code: 'NA',
                city: 'NA',
                state: 'NA'
            },
            currency: currency || 'EGP',
            integration_id: parseInt(PAYMOB_CONFIG.INTEGRATION_ID),
            lock_order_when_paid: false,
            success_url: successUrl,
            failure_url: failureUrl
        };
        
        console.log('Payment key request payload:', JSON.stringify(paymentKeyPayload, null, 2));
        
        const paymentKeyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentKeyPayload)
        });
        
        console.log('Payment key response status:', paymentKeyResponse.status);
        if (!paymentKeyResponse.ok) {
            const paymentKeyError = await paymentKeyResponse.text();
            console.error('Payment key error response:', paymentKeyError);
            throw new Error(`Failed to create payment key: ${paymentKeyResponse.status} - ${paymentKeyError}`);
        }
        
        const paymentKeyData = await paymentKeyResponse.json();
        const paymentKey = paymentKeyData.token;
        
        // Step 4: Generate hosted payment URL
        const hostedUrl = `https://accept.paymob.com/api/acceptance/payments/pay?token=${paymentKey}`;
        
        await storeBookingData({ name, email, phone: normalizedPhone, booking_type, amount_cents, orderId, paymentKey, start_date, end_date, start_time, end_time });
        
        res.json({
            success: true,
            payment_url: hostedUrl,
            order_id: orderId,
            payment_key: paymentKey
        });
        
    } catch (error) {
        console.error('Payment creation error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            config: {
                hasApiKey: !!PAYMOB_CONFIG.API_KEY,
                hasIntegrationId: !!PAYMOB_CONFIG.INTEGRATION_ID,
                hasHmac: !!PAYMOB_CONFIG.HMAC_SECRET
            }
        });
        res.status(500).json({
            error: 'Payment creation failed',
            message: error.message
        });
    }
});

// Webhook endpoint for Paymob payment status updates
app.post('/api/paymob-webhook', (req, res) => {
    try {
        const { hmac, ...data } = req.body;
        
        // Verify HMAC signature (optional but recommended)
        if (PAYMOB_CONFIG.HMAC_SECRET) {
            const calculatedHmac = calculateHmac(data, PAYMOB_CONFIG.HMAC_SECRET);
            if (calculatedHmac !== hmac) {
                return res.status(400).json({ error: 'Invalid HMAC signature' });
            }
        }
        
        // Handle payment status update
        const { success, order_id, transaction_id, amount_cents } = data;
        
        if (success) {
            // Payment successful - update booking status in database
            console.log(`Payment successful for order ${order_id}, transaction ${transaction_id}`);
            updateBookingStatus(order_id, 'confirmed', transaction_id);
        } else {
            // Payment failed - update booking status in database
            console.log(`Payment failed for order ${order_id}`);
            updateBookingStatus(order_id, 'cancelled');
        }
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ===== PUBLIC BOOKING API ENDPOINT =====

// Public booking endpoint for "Pay at Reception" option
app.post('/api/bookings', bookingLimiter, async (req, res) => {
    try {
        const { customer_name, email, phone, booking_type, date, time, duration, amount, notes } = req.body;
        
        // Validate required fields
        if (!customer_name || !email || !booking_type || !date || !amount) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                message: 'Customer name, email, booking type, date, and amount are required' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Validate phone number using comprehensive validation
        const phoneValidation = validatePhoneNumber(phone);
        if (!phoneValidation.isValid) {
            return res.status(400).json({ error: phoneValidation.error });
        }
        
        // Use normalized phone number if available
        const normalizedPhone = phoneValidation.normalized || phone;
        
        // Log warning if phone validation has warnings
        if (phoneValidation.warning) {
            console.warn(`Phone validation warning for ${email}: ${phoneValidation.warning}`);
        }
        
        // Validate date (cannot be in the past)
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (bookingDate < today) {
            return res.status(400).json({ error: 'Cannot book for past dates' });
        }
        
        // Validate booking type
        const validBookingTypes = ['shared_daily', 'shared_monthly', 'private_hourly'];
        if (!validBookingTypes.includes(booking_type)) {
            return res.status(400).json({ error: 'Invalid booking type' });
        }
        
        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }
        
        // Check for duplicate bookings (same email, date, and booking type)
        const duplicateQuery = `
            SELECT id FROM bookings 
            WHERE email = ? AND date = ? AND booking_type = ? AND status != 'cancelled'
        `;
        
        db.get(duplicateQuery, [email, date, booking_type], (err, existingBooking) => {
            if (err) {
                console.error('Error checking for duplicate booking:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (existingBooking) {
                return res.status(409).json({ error: 'A booking already exists for this email, date, and type' });
            }
            
            // All validations passed, create the booking
            createPublicBooking();
        });
        
        function createPublicBooking() {
            let formattedTime = null;
            let formattedDuration = null;
            
            // Handle private room specific validation
            if (booking_type === 'private_hourly') {
                if (!time || !duration) {
                    return res.status(400).json({ error: 'Time and duration are required for private room bookings' });
                }
                
                // Validate time format (HH:MM) - 24-hour format
                const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!timeRegex.test(time)) {
                    return res.status(400).json({ error: 'Invalid time format. Use HH:MM format (24-hour)' });
                }
                
                // Ensure time is in proper HH:MM format with leading zeros
                const [hours, minutes] = time.split(':');
                formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
                formattedDuration = parseInt(duration);
                
                // Validate duration (1-10 hours for private room)
                if (formattedDuration < 1 || formattedDuration > 10) {
                    return res.status(400).json({ error: 'Duration must be between 1 and 10 hours for private room bookings' });
                }
                
                // Calculate end time and validate it's not between 2 AM and 9 AM
                const startTime = new Date(`2000-01-01T${formattedTime}:00`);
                const endTime = new Date(startTime.getTime() + (formattedDuration * 60 * 60 * 1000));
                const endHour = endTime.getHours();
                
                if (endHour >= 2 && endHour < 9) {
                    return res.status(400).json({ error: 'Private room bookings cannot end between 2 AM and 9 AM' });
                }
                
                // Calculate price for private room (150 * duration)
                const calculatedAmount = 150 * formattedDuration;
                if (amount !== calculatedAmount) {
                    return res.status(400).json({ error: `Amount for private room should be ${calculatedAmount} L.E. (150 * ${formattedDuration} hours)` });
                }
            }
            
            // Insert booking with pending status
            const query = `
                INSERT INTO bookings (
                    customer_name, email, phone, booking_type, date, time, 
                    duration, amount, status, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                customer_name,
                email,
                normalizedPhone || null,
                booking_type,
                date,
                formattedTime,
                formattedDuration,
                amount,
                'pending', // Always pending for public bookings
                notes || `Public booking - Pay at Reception`
            ];
            
            db.run(query, params, function(err) {
                if (err) {
                    console.error('Error creating public booking:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                res.status(201).json({
                    success: true,
                    message: 'Booking created successfully. Please pay at reception.',
                    booking: {
                        id: this.lastID,
                        customer_name,
                        email,
                        phone: normalizedPhone,
                        booking_type,
                        date,
                        time: formattedTime,
                        duration: formattedDuration,
                        amount,
                        status: 'pending',
                        notes: notes || `Public booking - Pay at Reception`
                    }
                });
            });
        }
        
    } catch (error) {
        console.error('Public booking error:', error);
        res.status(500).json({
            error: 'Booking creation failed',
            message: error.message
        });
    }
});

// ===== ADMIN API ENDPOINTS =====

// Admin Authentication
app.post('/api/admin/login', checkLoginRateLimit, (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    db.get("SELECT * FROM admin_users WHERE username = ?", [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        });
    });
});

// Verify token
app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});



// Reports Data (protected)
app.get('/api/admin/reports', authenticateToken, (req, res) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const queries = {
        monthlyRevenue: `
            SELECT SUM(amount) as total 
            FROM bookings 
            WHERE status = 'confirmed' 
            AND strftime('%m', date) = ? 
            AND strftime('%Y', date) = ?
        `,
        lastMonthRevenue: `
            SELECT SUM(amount) as total 
            FROM bookings 
            WHERE status = 'confirmed' 
            AND strftime('%m', date) = ? 
            AND strftime('%Y', date) = ?
        `,
        bookingTypes: `
            SELECT booking_type, COUNT(*) as count 
            FROM bookings 
            GROUP BY booking_type
        `
    };

    const reports = {};

    // Get monthly revenue
    db.get(queries.monthlyRevenue, [currentMonth.toString().padStart(2, '0'), currentYear.toString()], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        reports.monthlyRevenue = result.total || 0;

        // Get last month revenue
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        
        db.get(queries.lastMonthRevenue, [lastMonth.toString().padStart(2, '0'), lastMonthYear.toString()], (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            reports.lastMonthRevenue = result.total || 0;

            // Get booking types
            db.all(queries.bookingTypes, (err, results) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                reports.bookingTypes = results;

                res.json({ reports });
            });
        });
    });
});

// ===== HELPER FUNCTIONS =====

// Comprehensive phone number validation function
function validatePhoneNumber(phone) {
    if (!phone) {
        return { isValid: false, error: 'Phone number is required' };
    }
    
    // Remove all whitespace and normalize
    const cleanPhone = phone.replace(/\s+/g, '').trim();
    
    if (cleanPhone.length === 0) {
        return { isValid: false, error: 'Phone number cannot be empty' };
    }
    
    // Check for minimum length (7 digits minimum for any country)
    if (cleanPhone.replace(/\D/g, '').length < 7) {
        return { isValid: false, error: 'Phone number must contain at least 7 digits' };
    }
    
    // Check for maximum length (15 digits maximum for international numbers)
    if (cleanPhone.replace(/\D/g, '').length > 15) {
        return { isValid: false, error: 'Phone number cannot exceed 15 digits' };
    }
    
    // Validate international format (starts with +)
    if (cleanPhone.startsWith('+')) {
        // International format validation
        const internationalRegex = /^\+[1-9]\d{1,14}$/;
        if (!internationalRegex.test(cleanPhone)) {
            return { isValid: false, error: 'Invalid international phone number format. Use format: +[country code][number]' };
        }
        
        // Validate country code length (1-3 digits)
        const countryCode = cleanPhone.substring(1).match(/^\d{1,3}/)[0];
        if (countryCode.length < 1 || countryCode.length > 3) {
            return { isValid: false, error: 'Invalid country code length' };
        }
        
        // Validate specific country codes if needed
        const validCountryCodes = [
            '1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49',
            '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98', '971', '972', '973', '974', '975', '976', '977', '994', '995', '996', '998'
        ];
        
        if (!validCountryCodes.includes(countryCode)) {
            return { isValid: true, warning: `Unrecognized country code +${countryCode}, but format appears valid` };
        }
        
        return { isValid: true, normalized: cleanPhone };
    }
    
    // Validate local format (no + prefix)
    // For Egyptian numbers (common case)
    if (cleanPhone.startsWith('0')) {
        // Egyptian mobile format: 01xxxxxxxxx
        const egyptianMobileRegex = /^01[0-2,5]\d{8}$/;
        if (egyptianMobileRegex.test(cleanPhone)) {
            return { isValid: true, normalized: '+20' + cleanPhone.substring(1) };
        }
        
        // Egyptian landline format: 02xxxxxxxxx
        const egyptianLandlineRegex = /^02\d{8}$/;
        if (egyptianLandlineRegex.test(cleanPhone)) {
            return { isValid: true, normalized: '+20' + cleanPhone.substring(1) };
        }
    }
    
    // For numbers without leading 0, assume Egyptian if 10-11 digits
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
        const digitsOnly = cleanPhone.replace(/\D/g, '');
        if (digitsOnly.length === 10) {
            // 10 digits - assume Egyptian mobile without leading 0
            const egyptianMobileRegex = /^1[0-2,5]\d{8}$/;
            if (egyptianMobileRegex.test(digitsOnly)) {
                return { isValid: true, normalized: '+20' + digitsOnly };
            }
        } else if (digitsOnly.length === 11) {
            // 11 digits - assume Egyptian mobile with leading 0
            const egyptianMobileRegex = /^01[0-2,5]\d{8}$/;
            if (egyptianMobileRegex.test(digitsOnly)) {
                return { isValid: true, normalized: '+20' + digitsOnly.substring(1) };
            }
        }
    }
    
    // Generic validation for other formats
    const genericRegex = /^[\+]?[0-9\s\-\(\)\.]{7,15}$/;
    if (!genericRegex.test(cleanPhone)) {
        return { isValid: false, error: 'Invalid phone number format. Please use international format (+[country code][number]) or local format' };
    }
    
    // If we get here, the format is acceptable but we can't normalize it
    return { isValid: true, normalized: cleanPhone, warning: 'Phone number format accepted but could not be normalized. Consider using international format (+[country code][number])' };
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

// Helper function to calculate HMAC
function calculateHmac(data, secret) {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(JSON.stringify(data)).digest('hex');
}

// Store booking data in database
async function storeBookingData(bookingData) {
    return new Promise((resolve, reject) => {
        // Format time for storage (convert ISO string to HH:MM format)
        let formattedTime = null;
        if (bookingData.start_time) {
            try {
                const date = new Date(bookingData.start_time);
                formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            } catch (e) {
                // If parsing fails, try to use as is
                formattedTime = bookingData.start_time;
            }
        }

        const query = `
            INSERT INTO bookings (
                customer_name, email, phone, booking_type, date, time, 
                duration, amount, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            bookingData.name,
            bookingData.email,
            bookingData.phone,
            bookingData.booking_type,
            bookingData.start_date,
            formattedTime,
            bookingData.duration || null,
            bookingData.amount_cents / 100, // Convert from cents
            'pending',
            `Paymob Order ID: ${bookingData.orderId}`
        ];

        db.run(query, params, function(err) {
            if (err) {
                console.error('Error storing booking:', err);
                reject(err);
            } else {
                console.log(`Booking stored with ID: ${this.lastID}`);
                resolve(this.lastID);
            }
        });
    });
}

// Update booking status
async function updateBookingStatus(orderId, status, transactionId = null) {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE bookings 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE notes LIKE ?
        `;

        const params = [status, `%Paymob Order ID: ${orderId}%`];

        db.run(query, params, function(err) {
            if (err) {
                console.error('Error updating booking status:', err);
                reject(err);
            } else {
                console.log(`Booking status updated to ${status} for order ${orderId}`);
                resolve(this.changes);
            }
        });
    });
}

// ===== ADMIN DASHBOARD API ENDPOINTS =====

// Authentication middleware for admin endpoints
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ error: 'Invalid access token' });
    }
}

// Get all bookings for admin dashboard
app.get('/api/admin/bookings', authenticateAdmin, (req, res) => {
    const { status, day, month, year, search } = req.query;
    
    let query = `
        SELECT 
            id, customer_name, email, phone, booking_type, date, time, 
            duration, amount, status, notes, created_at
        FROM bookings 
        WHERE 1=1
    `;
    
    let params = [];
    
    if (status) {
        query += ` AND status = ?`;
        params.push(status);
    }
    
    // Combine day, month, and year into a date filter
    if (day && month && year) {
        // All three filters provided - exact date match
        const dateString = `${year}-${month}-${day}`;
        query += ` AND date = ?`;
        params.push(dateString);
    } else if (month && year) {
        // Month and year provided - filter by month and year
        query += ` AND strftime('%m', date) = ? AND strftime('%Y', date) = ?`;
        params.push(month, year);
    } else if (year) {
        // Only year provided - filter by year
        query += ` AND strftime('%Y', date) = ?`;
        params.push(year);
    } else if (month) {
        // Only month provided - filter by month
        query += ` AND strftime('%m', date) = ?`;
        params.push(month);
    } else if (day) {
        // Only day provided - filter by day of month
        query += ` AND strftime('%d', date) = ?`;
        params.push(day);
    }
    
    // Add search functionality
    if (search) {
        query += ` AND (customer_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(rows);
        }
    });
});



// Update booking status
app.put('/api/admin/bookings/:id/status', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    const query = `
        UPDATE bookings 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(query, [status, id], function(err) {
        if (err) {
            console.error('Error updating booking status:', err);
            res.status(500).json({ error: 'Database error' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Booking not found' });
        } else {
            res.json({ message: 'Booking status updated successfully' });
        }
    });
});

// Delete booking
app.delete('/api/admin/bookings/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    
    const query = `DELETE FROM bookings WHERE id = ?`;
    
    db.run(query, [id], function(err) {
        if (err) {
            console.error('Error deleting booking:', err);
            res.status(500).json({ error: 'Database error' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Booking not found' });
        } else {
            res.json({ message: 'Booking deleted successfully' });
        }
    });
});

// Add new booking
app.post('/api/admin/bookings', authenticateAdmin, (req, res) => {
    const { customer_name, email, phone, booking_type, date, time, duration, amount, status, notes } = req.body;
    
    // Validate required fields
    if (!customer_name || !email || !booking_type || !date || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate phone number if provided
    let normalizedPhone = phone;
    if (phone) {
        const phoneValidation = validatePhoneNumber(phone);
        if (!phoneValidation.isValid) {
            return res.status(400).json({ error: phoneValidation.error });
        }
        normalizedPhone = phoneValidation.normalized || phone;
        
        // Log warning if phone validation has warnings
        if (phoneValidation.warning) {
            console.warn(`Phone validation warning for admin booking ${email}: ${phoneValidation.warning}`);
        }
    }
    
    let formattedTime = null;
    let formattedDuration = null;
    
    // Validate time format for private room bookings (should be HH:MM format)
    if (booking_type === 'private_hourly') {
        if (!time || !duration) {
            return res.status(400).json({ error: 'Time and duration are required for private room bookings' });
        }
        
        // Validate time format (HH:MM) - 24-hour format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            return res.status(400).json({ error: 'Invalid time format. Use HH:MM format (24-hour)' });
        }
        
        // Ensure time is in proper HH:MM format with leading zeros
        const [hours, minutes] = time.split(':');
        formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        formattedDuration = parseInt(duration);
        
        console.log(`Time validation: Original: ${time}, Formatted: ${formattedTime}`);
    }
    
    const query = `
        INSERT INTO bookings (
            customer_name, email, phone, booking_type, date, time, 
            duration, amount, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [customer_name, email, normalizedPhone, booking_type, date, formattedTime, formattedDuration, amount, status || 'pending', notes];
    
    db.run(query, params, function(err) {
        if (err) {
            console.error('Error adding booking:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json({ 
                message: 'Booking added successfully',
                booking: {
                    id: this.lastID,
                    customer_name,
                    email,
                    phone: normalizedPhone,
                    booking_type,
                    date,
                    time: formattedTime,
                    duration: formattedDuration,
                    amount,
                    status: status || 'pending',
                    notes,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            });
        }
    });
});

// Get dashboard stats
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
    console.log('Stats endpoint called');
    
    // Get booking stats
    const bookingStatsQuery = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
            COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) as booking_revenue
        FROM bookings
    `;
    
    // Get orders revenue
    const ordersRevenueQuery = `
        SELECT COALESCE(SUM(quantity * price), 0) as orders_revenue
        FROM orders
    `;
    
    console.log('Executing booking stats query:', bookingStatsQuery);
    console.log('Executing orders revenue query:', ordersRevenueQuery);
    
    // Get booking stats first
    db.get(bookingStatsQuery, [], (err, bookingResult) => {
        if (err) {
            console.error('Error fetching booking stats:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        console.log('Raw booking stats result:', bookingResult);
        
        // Get orders revenue
        db.get(ordersRevenueQuery, [], (err, ordersResult) => {
            if (err) {
                console.error('Error fetching orders revenue:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            console.log('Raw orders revenue result:', ordersResult);
            
            // Calculate total revenue (bookings + orders)
            const bookingRevenue = parseInt(bookingResult?.booking_revenue) || 0;
            const ordersRevenue = parseInt(ordersResult?.orders_revenue) || 0;
            const totalRevenue = bookingRevenue + ordersRevenue;
            
            const stats = {
                total: parseInt(bookingResult?.total) || 0,
                pending: parseInt(bookingResult?.pending) || 0,
                confirmed: parseInt(bookingResult?.confirmed) || 0,
                revenue: totalRevenue
            };
            
            console.log('Processed stats:', stats);
            console.log('Revenue breakdown: Bookings =', bookingRevenue, 'Orders =', ordersRevenue, 'Total =', totalRevenue);
            
            const response = {
                bookings: stats
            };
            
            console.log('Final response:', response);
            
            res.json(response);
        });
    });
});

// ===== ORDERS MANAGEMENT API ENDPOINTS =====

// Get orders (all orders or by booking ID)
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
    const { booking_id, day, month, year } = req.query;
    
    let query = `
        SELECT o.*, b.customer_name 
        FROM orders o
        LEFT JOIN bookings b ON o.booking_id = b.id
        WHERE 1=1
    `;
    
    let params = [];
    
    if (booking_id) {
        // Get orders for specific booking
        query += ` AND o.booking_id = ?`;
        params.push(booking_id);
    }
    
    // Combine day, month, and year into a date filter for orders
    if (day && month && year) {
        // All three filters provided - exact date match
        const dateString = `${year}-${month}-${day}`;
        query += ` AND DATE(o.created_at) = ?`;
        params.push(dateString);
    } else if (month && year) {
        // Month and year provided - filter by month and year
        query += ` AND strftime('%m', o.created_at) = ? AND strftime('%Y', o.created_at) = ?`;
        params.push(month, year);
    } else if (year) {
        // Only year provided - filter by year
        query += ` AND strftime('%Y', o.created_at) = ?`;
        params.push(year);
    } else if (month) {
        // Only month provided - filter by month
        query += ` AND strftime('%m', o.created_at) = ?`;
        params.push(month);
    } else if (day) {
        // Only day provided - filter by day of month
        query += ` AND strftime('%d', o.created_at) = ?`;
        params.push(day);
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    db.all(query, params, (err, orders) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // If booking_id was provided, return in the expected format
        if (booking_id) {
            res.json({ orders: orders || [] });
        } else {
            // If no booking_id, return all orders directly
            res.json(orders || []);
        }
    });
});

// Add new order
app.post('/api/admin/orders', authenticateAdmin, (req, res) => {
    const { booking_id, order_type, quantity, price, notes } = req.body;
    
    // Validate required fields
    if (!booking_id || !order_type || !quantity) {
        return res.status(400).json({ error: 'Booking ID, order type, and quantity are required' });
    }
    
    // Validate order type
    if (!['beverage', 'water'].includes(order_type)) {
        return res.status(400).json({ error: 'Order type must be either "beverage" or "water"' });
    }
    
    // Validate quantity
    if (quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
    }
    
    // Check if booking exists
    db.get('SELECT id FROM bookings WHERE id = ?', [booking_id], (err, booking) => {
        if (err) {
            console.error('Error checking booking:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        // Insert order
        const query = `
            INSERT INTO orders (
                booking_id, order_type, quantity, price, notes
            ) VALUES (?, ?, ?, ?, ?)
        `;
        
        const params = [booking_id, order_type, quantity, price || 10, notes || null];
        
        db.run(query, params, function(err) {
            if (err) {
                console.error('Error adding order:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ 
                message: 'Order added successfully',
                order: {
                    id: this.lastID,
                    booking_id,
                    order_type,
                    quantity,
                    price: price || 10,
                    notes,
                    created_at: new Date().toISOString()
                }
            });
        });
    });
});

// Delete order
app.delete('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    
    // Check if order exists
    db.get('SELECT id FROM orders WHERE id = ?', [id], (err, order) => {
        if (err) {
            console.error('Error checking order:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Delete order
        db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
            if (err) {
                console.error('Error deleting order:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ message: 'Order deleted successfully' });
        });
    });
});

// Get valid memberships (monthly memberships confirmed within last 30 days)
app.get('/api/admin/memberships', authenticateAdmin, (req, res) => {
    const { search } = req.query;
    
    let query = `
        SELECT 
            id, customer_name, email, phone, booking_type, date, time, 
            duration, amount, status, notes, created_at
        FROM bookings 
        WHERE booking_type = 'shared_monthly' 
        AND status = 'confirmed'
        AND date >= date('now', '-30 days')
    `;
    
    let params = [];
    
    // Add search functionality
    if (search) {
        query += ` AND (customer_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ` ORDER BY date DESC`;
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching valid memberships:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(rows);
        }
    });
});

// ===== SERVER INITIALIZATION =====

// Initialize database
initializeDatabase();

// Validate configuration
validateConfig();

// HTTPS Configuration
let httpsServer = null;

if (process.env.NODE_ENV === 'production') {
    // Production: Use real SSL certificates
    try {
        const httpsOptions = {
            key: fs.readFileSync(process.env.SSL_KEY_PATH || '/path/to/private-key.pem'),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/path/to/certificate.pem')
        };
        
        httpsServer = https.createServer(httpsOptions, app);
        httpsServer.listen(HTTPS_PORT, () => {
            console.log(`🔒 HTTPS Server running on port ${HTTPS_PORT}`);
            console.log(`🔒 Admin login: https://localhost:${HTTPS_PORT}/pages/admin-login.html`);
            console.log(`🔒 Admin dashboard: https://localhost:${HTTPS_PORT}/pages/admin-dashboard.html`);
        });
    } catch (error) {
        console.warn('⚠️ SSL certificates not found. Running HTTP only.');
        console.warn('For production, set SSL_KEY_PATH and SSL_CERT_PATH environment variables.');
    }
} else {
    // Development: Use self-signed certificates or HTTP
    console.log('🔄 Development mode: HTTP server only');
    console.log('For HTTPS in development, run: npm run dev:https');
}

// HTTP Server (fallback and development)
app.listen(PORT, () => {
    console.log(`🌐 HTTP Server running on port ${PORT}`);
    console.log(`🌐 Admin login: http://localhost:${PORT}/pages/admin-login.html`);
    console.log(`🌐 Admin dashboard: http://localhost:${PORT}/pages/admin-dashboard.html`);
    console.log(`🌐 API endpoints: http://localhost:${PORT}/api/`);
    console.log(`🌐 Payment endpoint: http://localhost:${PORT}/api/create-payment`);
    console.log(`🌐 Webhook endpoint: http://localhost:${PORT}/api/paymob-webhook`);
    
    if (process.env.NODE_ENV === 'production' && !httpsServer) {
        console.warn('⚠️ WARNING: Running in production without HTTPS!');
        console.warn('Set up SSL certificates for production deployment.');
    }
});
