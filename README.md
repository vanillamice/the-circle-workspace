# The Circle Workspace - Booking System

A modern workspace booking system with payment integration, built with Node.js, Express, and SQLite.

## Features

- **Shared Workspace Booking**: Daily passes and monthly memberships
- **Private Room Booking**: Hourly bookings with time selection
- **Payment Integration**: Paymob payment gateway integration
- **Admin Dashboard**: Booking management and analytics
- **Phone Validation**: Comprehensive international phone number validation
- **Responsive Design**: Modern UI with mobile-first approach

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Payment**: Paymob API
- **Authentication**: JWT tokens
- **Deployment**: Railway

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd circlesite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```bash
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # JWT Secret for Admin Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Paymob Payment Gateway Configuration
   PAYMOB_API_KEY=your-paymob-api-key
   PAYMOB_INTEGRATION_ID=your-paymob-integration-id
   PAYMOB_IFRAME_ID=your-paymob-iframe-id
   PAYMOB_HMAC_SECRET=your-paymob-hmac-secret

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,https://localhost:3443
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Main site: http://localhost:3000
   - Admin login: http://localhost:3000/pages/admin-login.html
   - Default admin credentials: admin / admin123

## Railway Deployment

### 1. Prepare Your Repository

Ensure your repository is ready for deployment:
- All code is committed and pushed to GitHub
- `.env` file is in `.gitignore` (already configured)
- `package.json` has the correct start script

### 2. Deploy to Railway

1. **Connect to Railway**
   - Go to [Railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Environment Variables**
   In Railway dashboard, go to your project → Variables tab and add:

   ```bash
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBM01EY3pNQ3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS42SnY4SjM1N2VrTTlVTTBxUEVsc3RNdG4yUDdUMnZjTGFYVVdlaEpDVXhpSDF5R09Yc2lqbGc2MHRkZXp1SWlxU2VQQVBMeE13SEFVWUZaWWdzOGNlZw==
   PAYMOB_INTEGRATION_ID=your-paymob-integration-id
   PAYMOB_IFRAME_ID=your-paymob-iframe-id
   PAYMOB_HMAC_SECRET=756BFB064CB3E5BD9FEC8A5606AAD2FE
   ALLOWED_ORIGINS=https://your-app-name.railway.app
   ```

3. **Update Paymob Callback URLs**
   In your Paymob dashboard, set the callback URLs to:
   ```
   https://your-app-name.railway.app/api/paymob-webhook
   ```

4. **Deploy**
   - Railway will automatically deploy your app
   - Get your production URL from the Railway dashboard

### 3. Post-Deployment

1. **Update CORS Origins**
   - Replace `your-app-name.railway.app` with your actual Railway app URL
   - Add your custom domain if you have one

2. **Test the Application**
   - Test booking flow
   - Test payment integration
   - Test admin dashboard

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port | No | `3000` |
| `JWT_SECRET` | Secret for JWT tokens | Yes | `your-secret-key` |
| `PAYMOB_API_KEY` | Paymob API key | Yes | `ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5...` |
| `PAYMOB_INTEGRATION_ID` | Paymob integration ID | Yes | `123456` |
| `PAYMOB_IFRAME_ID` | Paymob iFrame ID | Yes | `789012` |
| `PAYMOB_HMAC_SECRET` | Paymob HMAC secret | Yes | `756BFB064CB3E5BD9FEC8A5606AAD2FE` |
| `ALLOWED_ORIGINS` | CORS allowed origins | Yes | `https://your-app.railway.app` |

## Security Notes

- **Never commit `.env` files** to version control
- **Use strong JWT secrets** in production
- **Rotate admin passwords** after first login
- **Use HTTPS** in production (Railway handles this automatically)
- **Set proper CORS origins** for production

## API Endpoints

### Public Endpoints
- `POST /api/bookings` - Create a booking (pay at reception)
- `POST /api/create-payment` - Create Paymob payment
- `POST /api/paymob-webhook` - Paymob payment webhook

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/:id/status` - Update booking status
- `GET /api/admin/stats` - Get dashboard statistics

## Database Schema

The application uses SQLite with the following main tables:
- `admin_users` - Admin user accounts
- `bookings` - Customer bookings
- `orders` - Additional orders (beverages, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for The Circle Workspace.

## Support

For support, contact: contact@circleworkspace.com
