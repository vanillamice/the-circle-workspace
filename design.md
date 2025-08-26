# The Circle - System Design Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Booking Flow](#booking-flow)
5. [Admin Dashboard](#admin-dashboard)
6. [Security & Authentication](#security--authentication)
7. [Data Flow Diagrams](#data-flow-diagrams)

---

## System Overview

The Circle is a workspace booking system with integrated payment processing and admin management capabilities. The system supports three types of bookings (daily passes, monthly memberships, private rooms) and includes beverage/water ordering functionality.

### Key Components:
- **Frontend**: HTML/CSS/JavaScript for user booking and admin dashboard
- **Backend**: Node.js/Express server with SQLite database
- **Payment**: Paymob payment gateway integration
- **Admin**: JWT-secured admin dashboard for booking management

---

## Database Schema

### Table 1: `admin_users`
**Purpose**: Stores admin user accounts for dashboard access

```sql
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Unique identifier (auto-increment)
- `username` - Admin login username (unique)
- `password_hash` - Bcrypt-hashed password
- `email` - Admin email address
- `role` - User role (default: 'admin')
- `created_at` - Account creation timestamp

**Default Admin User:**
- Username: `admin`
- Password: `admin123`
- Email: `admin@thecircle.com`

### Table 2: `bookings`
**Purpose**: Stores all booking information from customers

```sql
CREATE TABLE bookings (
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
);
```

**Fields:**
- `id` - Unique booking identifier (auto-increment)
- `customer_name` - Customer's full name
- `email` - Customer's email address
- `phone` - Customer's phone number (optional)
- `booking_type` - Type of booking:
  - `shared_daily` - Daily Pass (100 L.E)
  - `shared_monthly` - Monthly Membership (2300 L.E)
  - `private_hourly` - Private Room (150 L.E/hour)
- `date` - Booking date (YYYY-MM-DD format)
- `time` - Booking time (HH:MM format, optional for daily/monthly)
- `duration` - Duration in hours (required for private rooms)
- `amount` - Payment amount in L.E
- `status` - Booking status:
  - `pending` - Awaiting confirmation
  - `confirmed` - Booking confirmed
  - `cancelled` - Booking cancelled
- `notes` - Additional notes (optional)
- `created_at` - Booking creation timestamp
- `updated_at` - Last update timestamp

### Table 3: `orders`
**Purpose**: Stores beverage and water orders linked to bookings

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    order_type TEXT NOT NULL CHECK (order_type IN ('beverage', 'water')),
    quantity INTEGER DEFAULT 1,
    price INTEGER DEFAULT 10,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
```

**Fields:**
- `id` - Unique order identifier (auto-increment)
- `booking_id` - Foreign key to bookings table
- `order_type` - Type of order:
  - `beverage` - Coffee, tea, etc.
  - `water` - Bottled water
- `quantity` - Number of items ordered
- `price` - Fixed price per item (10 L.E)
- `notes` - Additional notes (optional)
- `created_at` - Order creation timestamp

**Pricing:**
- **Beverage**: 10 L.E per item
- **Water**: 10 L.E per item
- **Total Calculation**: `quantity × price` (calculated dynamically)
- **Fixed pricing**: No variable pricing

---

## API Endpoints

### Public API Endpoints

#### 1. Create Payment Order
**Endpoint**: `POST /api/create-payment`
**Purpose**: Creates a Paymob payment order for booking

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "booking_type": "shared_daily",
  "amount_cents": 10000,
  "currency": "EGP",
  "start_date": "2024-12-15",
  "end_date": "2024-12-15",
  "start_time": "2024-12-15T14:00:00.000Z",
  "end_time": "2024-12-15T16:00:00.000Z",
  "booking_description": "Daily workspace access"
}
```

**Response:**
```json
{
  "payment_url": "https://accept.paymob.com/api/acceptance/iframes/12345?payment_token=abc123"
}
```

**Process:**
1. Validates booking data
2. Creates Paymob authentication token
3. Creates Paymob order
4. Creates Paymob payment key
5. Stores booking data in database
6. Returns hosted payment URL

#### 2. Paymob Webhook
**Endpoint**: `POST /api/paymob-webhook`
**Purpose**: Receives payment status updates from Paymob

**Request Body:**
```json
{
  "type": "TRANSACTION",
  "obj": {
    "id": 123456,
    "amount_cents": 10000,
    "success": true,
    "order": {
      "id": 789
    }
  }
}
```

**Process:**
1. Validates HMAC signature
2. Updates booking status based on payment result
3. Sends confirmation email (if implemented)

### Admin API Endpoints (JWT Protected)

#### Authentication

##### 1. Admin Login
**Endpoint**: `POST /api/admin/login`
**Purpose**: Authenticates admin user and returns JWT token

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@thecircle.com",
    "role": "admin"
  }
}
```

**Security Features:**
- Rate limiting (5 attempts, 15-minute lockout)
- Bcrypt password hashing
- JWT token with 24-hour expiration

##### 2. Verify Token
**Endpoint**: `GET /api/admin/verify`
**Purpose**: Verifies JWT token validity

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

#### Booking Management

##### 3. Get All Bookings
**Endpoint**: `GET /api/admin/bookings`
**Purpose**: Retrieves paginated booking list with filtering

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name, email, or phone
- `status` - Filter by status (pending/confirmed/cancelled)
- `type` - Filter by booking type
- `date` - Filter by specific date
- `year` - Filter by year
- `month` - Filter by month

**Response:**
```json
{
  "bookings": [
    {
      "id": 1001,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "booking_type": "shared_daily",
      "date": "2024-12-15",
      "time": null,
      "duration": null,
      "amount": 100,
      "status": "confirmed",
      "notes": "First time customer",
      "created_at": "2024-12-14 10:30:00"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 25,
    "pages": 3
  }
}
```

##### 4. Get Recent Bookings
**Endpoint**: `GET /api/admin/bookings/recent`
**Purpose**: Gets recent bookings for dashboard

**Response:**
```json
{
  "bookings": [
    {
      "id": 1001,
      "customer_name": "John Doe",
      "booking_type": "shared_daily",
      "date": "2024-12-15",
      "status": "confirmed",
      "amount": 100
    }
  ]
}
```

##### 5. Create Booking
**Endpoint**: `POST /api/admin/bookings`
**Purpose**: Creates a new booking manually

**Request Body:**
```json
{
  "customer_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "booking_type": "private_hourly",
  "date": "2024-12-16",
  "time": "14:00",
  "duration": 2,
  "amount": 300,
  "status": "confirmed",
  "notes": "Client meeting"
}
```

**Response:**
```json
{
  "booking": {
    "id": 1002,
    "customer_name": "Jane Smith",
    "email": "jane@example.com",
    "booking_type": "private_hourly",
    "date": "2024-12-16",
    "time": "14:00",
    "duration": 2,
    "amount": 300,
    "status": "confirmed",
    "created_at": "2024-12-15 11:30:00"
  }
}
```

##### 6. Update Booking
**Endpoint**: `PUT /api/admin/bookings/:bookingId`
**Purpose**: Updates an existing booking

**Request Body:**
```json
{
  "customer_name": "Jane Smith",
  "email": "jane@example.com",
  "booking_type": "private_hourly",
  "date": "2024-12-16",
  "time": "15:00",
  "duration": 3,
  "amount": 450,
  "status": "confirmed",
  "notes": "Extended meeting"
}
```

**Response:**
```json
{
  "booking": {
    "id": 1002,
    "customer_name": "Jane Smith",
    "booking_type": "private_hourly",
    "date": "2024-12-16",
    "time": "15:00",
    "duration": 3,
    "amount": 450,
    "status": "confirmed",
    "updated_at": "2024-12-15 12:00:00"
  }
}
```

##### 7. Delete Booking
**Endpoint**: `DELETE /api/admin/bookings/:bookingId`
**Purpose**: Deletes a booking

**Response:**
```json
{
  "message": "Booking deleted successfully"
}
```

#### Order Management

##### 8. Get All Orders
**Endpoint**: `GET /api/admin/orders`
**Purpose**: Retrieves paginated order list with filtering

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by customer name, email, or booking ID
- `type` - Filter by order type (beverage/water)
- `booking_id` - Filter by specific booking

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "booking_id": 1001,
      "order_type": "beverage",
      "quantity": 2,
      "price": 10,
      "notes": "Coffee and tea",
      "created_at": "2024-12-15 10:30:00",
      "customer_name": "John Doe",
      "email": "john@example.com",
      "booking_type": "shared_daily",
      "date": "2024-12-15",
      "booking_status": "confirmed"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 15,
    "pages": 2
  }
}
```

##### 9. Get Orders for Booking
**Endpoint**: `GET /api/admin/bookings/:bookingId/orders`
**Purpose**: Gets all orders for a specific booking

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "booking_id": 1001,
      "order_type": "beverage",
      "quantity": 2,
      "price": 10,
      "notes": "Coffee and tea",
      "created_at": "2024-12-15 10:30:00",
      "customer_name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

##### 10. Create Order
**Endpoint**: `POST /api/admin/orders`
**Purpose**: Creates a new order

**Request Body:**
```json
{
  "booking_id": 1001,
  "order_type": "beverage",
  "quantity": 2,
  "notes": "Coffee and tea"
}
```

**Response:**
```json
{
  "order": {
    "id": 1,
    "booking_id": 1001,
    "order_type": "beverage",
    "quantity": 2,
    "price": 10,
    "notes": "Coffee and tea",
    "created_at": "2024-12-15 10:30:00",
    "customer_name": "John Doe",
    "email": "john@example.com",
    "booking_type": "shared_daily",
    "date": "2024-12-15",
    "booking_status": "confirmed"
  }
}
```

##### 11. Update Order
**Endpoint**: `PUT /api/admin/orders/:orderId`
**Purpose**: Updates an existing order

**Request Body:**
```json
{
  "order_type": "water",
  "quantity": 3,
  "notes": "Bottled water for team"
}
```

**Response:**
```json
{
  "order": {
    "id": 1,
    "booking_id": 1001,
    "order_type": "water",
    "quantity": 3,
    "price": 10,
    "notes": "Bottled water for team",
    "created_at": "2024-12-15 10:30:00",
    "customer_name": "John Doe",
    "email": "john@example.com",
    "booking_type": "shared_daily",
    "date": "2024-12-15",
    "booking_status": "confirmed"
  }
}
```

##### 12. Delete Order
**Endpoint**: `DELETE /api/admin/orders/:orderId`
**Purpose**: Deletes an order

**Response:**
```json
{
  "message": "Order deleted successfully"
}
```

#### Dashboard Statistics

##### 13. Get Dashboard Stats
**Endpoint**: `GET /api/admin/stats`
**Purpose**: Gets dashboard statistics

**Response:**
```json
{
  "total_bookings": 25,
  "pending_bookings": 5,
  "confirmed_bookings": 18,
  "cancelled_bookings": 2,
  "total_revenue": 4500,
  "today_bookings": 3,
  "today_revenue": 600
}
```

##### 14. Get Reports
**Endpoint**: `GET /api/admin/reports`
**Purpose**: Gets detailed reports

**Query Parameters:**
- `start_date` - Report start date
- `end_date` - Report end date
- `type` - Report type (revenue/bookings/orders)

**Response:**
```json
{
  "period": "2024-12-01 to 2024-12-31",
  "total_revenue": 4500,
  "total_bookings": 25,
  "booking_breakdown": {
    "shared_daily": 15,
    "shared_monthly": 5,
    "private_hourly": 5
  },
  "revenue_breakdown": {
    "shared_daily": 1500,
    "shared_monthly": 11500,
    "private_hourly": 1500
  }
}
```

---

## Booking Flow

### 1. User Booking Process

#### Step 1: Plan Selection
**User Action**: Selects booking type (Daily Pass, Monthly Membership, or Private Room)
**Data Collected**:
```javascript
{
  booking_type: "shared_daily" | "shared_monthly" | "private_hourly",
  price: 100 | 2300 | 150 // L.E per hour for private rooms
}
```

#### Step 2: Date/Time Selection
**User Action**: Selects date and time (if applicable)
**Data Collected**:
```javascript
{
  date: "2024-12-15", // YYYY-MM-DD format
  time: "14:00", // HH:MM format (private rooms only)
  duration: 2 // hours (private rooms only)
}
```

#### Step 3: User Information
**User Action**: Enters personal details
**Data Collected**:
```javascript
{
  name: "John Doe",
  email: "john@example.com"
}
```

#### Step 4: Payment Processing
**System Action**: Creates Paymob payment order
**Data Sent to Backend**:
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  booking_type: "shared_daily",
  amount_cents: 10000, // 100 L.E in cents
  currency: "EGP",
  start_date: "2024-12-15",
  end_date: "2024-12-15",
  start_time: "2024-12-15T14:00:00.000Z", // ISO string
  end_time: "2024-12-15T16:00:00.000Z", // ISO string
  booking_description: "Daily workspace access"
}
```

#### Step 5: Database Storage
**Backend Action**: Stores booking data
**Database Insert**:
```sql
INSERT INTO bookings (
  customer_name, email, booking_type, date, time, 
  duration, amount, status, notes
) VALUES (
  'John Doe', 'john@example.com', 'shared_daily', 
  '2024-12-15', NULL, NULL, 100, 'pending', 
  'Paymob Order ID: 12345'
);
```

#### Step 6: Payment Confirmation
**Paymob Action**: Processes payment and sends webhook
**Webhook Data**:
```javascript
{
  type: "TRANSACTION",
  obj: {
    id: 123456,
    amount_cents: 10000,
    success: true,
    order: { id: 789 }
  }
}
```

#### Step 7: Status Update
**Backend Action**: Updates booking status
**Database Update**:
```sql
UPDATE bookings 
SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
WHERE notes LIKE '%Paymob Order ID: 12345%';
```

### 2. Admin Order Management

#### Step 1: Order Creation
**Admin Action**: Creates order for existing booking
**Data Sent**:
```javascript
{
  booking_id: 1001,
  order_type: "beverage",
  quantity: 2,
  notes: "Coffee and tea"
}
```

#### Step 2: Database Storage
**Backend Action**: Stores order data
**Database Insert**:
```sql
INSERT INTO orders (booking_id, order_type, quantity, price, notes)
VALUES (1001, 'beverage', 2, 10, 'Coffee and tea');
```

#### Step 3: Display Calculation
**Frontend Action**: Calculates total dynamically
**Calculation**:
```javascript
const total = order.quantity * order.price; // 2 × 10 = 20 L.E
```

---

## Admin Dashboard

### Features

#### 1. Dashboard Overview
- Total bookings count
- Pending/confirmed/cancelled bookings
- Total revenue
- Recent bookings list

#### 2. Booking Management
- View all bookings with pagination
- Search by customer name, email, phone
- Filter by status, type, date, year, month
- Add new bookings manually
- Edit existing bookings
- Delete bookings
- Change booking status

#### 3. Order Management
- View all orders with pagination
- Search by customer name, email, booking ID
- Filter by order type, booking
- Add new orders
- Edit existing orders
- Delete orders
- Dynamic total calculation

#### 4. Valid Memberships
- View monthly memberships within 30 days
- Filter by status and time range
- Track expiring memberships
- Membership statistics

#### 5. Reports
- Revenue reports by period
- Booking type breakdown
- Customer analytics

### Security Features

#### 1. Authentication
- JWT token-based authentication
- 24-hour token expiration
- Secure password hashing with bcrypt

#### 2. Rate Limiting
- Login attempt limiting (5 attempts, 15-minute lockout)
- IP-based rate limiting

#### 3. Authorization
- All admin endpoints require valid JWT token
- Role-based access control (admin role)

---

## Security & Authentication

### JWT Token Structure
```javascript
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "iat": 1703123456,
  "exp": 1703209856
}
```

### Password Security
- Bcrypt hashing with salt rounds: 10
- Secure password storage
- No plain text passwords

### API Security
- CORS configuration for allowed origins
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Input validation and sanitization
- SQL injection prevention with parameterized queries

### HTTPS Support
- SSL/TLS encryption in production
- Self-signed certificates for development
- Secure cookie handling

---

## Data Flow Diagrams

### 1. User Booking Flow
```
User → Frontend → Backend API → Paymob → Database
  ↓
User ← Frontend ← Backend API ← Paymob Webhook ← Database
```

### 2. Admin Authentication Flow
```
Admin → Login Form → Backend API → Database
  ↓
Admin ← JWT Token ← Backend API ← Database
```

### 3. Order Management Flow
```
Admin → Order Form → Backend API → Database
  ↓
Admin ← Order List ← Backend API ← Database
```

### 4. Payment Processing Flow
```
User → Booking Form → Backend → Paymob → Payment Gateway
  ↓
User ← Payment URL ← Backend ← Paymob ← Payment Gateway
  ↓
Paymob → Webhook → Backend → Database Update
```

This design documentation provides a comprehensive overview of the system architecture, data flow, and implementation details for The Circle workspace booking system.
