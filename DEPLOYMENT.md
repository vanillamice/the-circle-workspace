# Railway Deployment Guide

## Pre-Deployment Checklist

### ✅ Repository Preparation
- [ ] All code is committed and pushed to GitHub
- [ ] `.env` file is in `.gitignore` (already configured)
- [ ] `package.json` has correct start script: `"start": "node server.js"`
- [ ] `railway.json` configuration is present
- [ ] No sensitive data in code (API keys, secrets, etc.)

### ✅ Environment Variables Ready
- [ ] Paymob API credentials obtained
- [ ] JWT secret generated
- [ ] CORS origins determined

## Railway Deployment Steps

### 1. Connect to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will automatically detect the Node.js project

### 2. Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```bash
# Required Variables
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBM01EY3pNQ3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS42SnY4SjM1N2VrTTlVTTBxUEVsc3RNdG4yUDdUMnZjTGFYVVdlaEpDVXhpSDF5R09Yc2lqbGc2MHRkZXp1SWlxU2VQQVBMeE13SEFVWUZaWWdzOGNlZw==
PAYMOB_INTEGRATION_ID=your-paymob-integration-id
PAYMOB_IFRAME_ID=your-paymob-iframe-id
PAYMOB_HMAC_SECRET=756BFB064CB3E5BD9FEC8A5606AAD2FE

# CORS Configuration (IMPORTANT!)
# Replace 'your-app-name' with your actual Railway app name
ALLOWED_ORIGINS=https://your-app-name.railway.app

# Optional Variables
PORT=3000
```

### 3. Update Paymob Configuration

1. **Get your Railway app URL** from the Railway dashboard
2. **Update Paymob callback URLs** in your Paymob dashboard:
   ```
   Integration Callback URL: https://your-app-name.railway.app/api/paymob-webhook
   Integration Response Callback URL: https://your-app-name.railway.app/api/paymob-webhook
   ```
3. **Update CORS origins** in Railway variables with your actual app URL

### 4. CORS Origins Setup (IMPORTANT!)

**Step 1: Get your Railway app URL**
- After deploying, Railway will give you a URL like: `https://your-app-name.railway.app`
- Copy this exact URL

**Step 2: Update ALLOWED_ORIGINS**
- In Railway dashboard → Variables tab
- Find `ALLOWED_ORIGINS`
- Replace the value with your actual Railway URL
- Example: `https://my-circle-workspace.railway.app`

**Step 3: If you have a custom domain**
- Add your custom domain to ALLOWED_ORIGINS
- Separate multiple domains with commas
- Example: `https://my-circle-workspace.railway.app,https://thecircle.com`

### 5. Deploy and Test

1. **Railway will automatically deploy** your app
2. **Get your production URL** from Railway dashboard
3. **Test the application**:
   - [ ] Main site loads correctly
   - [ ] Booking flow works
   - [ ] Payment integration works
   - [ ] Admin dashboard accessible
   - [ ] Phone validation works

## Environment Variables Security

### ✅ What's Safe to Commit
- `env.example` (template file)
- `package.json`
- `railway.json`
- All source code
- Documentation

### ❌ What's NEVER Committed
- `.env` files
- API keys
- JWT secrets
- Database files
- Log files

### 🔒 Railway Environment Variables
Railway provides a secure way to handle environment variables:
- Variables are encrypted at rest
- Only accessible through Railway dashboard
- Automatically injected into your app
- Can be updated without redeployment

## Post-Deployment Tasks

### 1. Security Hardening
- [ ] Change default admin password (`admin` / `admin123`)
- [ ] Generate a strong JWT secret
- [ ] Verify HTTPS is working
- [ ] Test admin authentication

### 2. Paymob Integration
- [ ] Test payment flow end-to-end
- [ ] Verify webhook receives payment updates
- [ ] Check booking status updates
- [ ] Test payment failure scenarios

### 3. Monitoring
- [ ] Set up Railway monitoring
- [ ] Check application logs
- [ ] Monitor database size
- [ ] Set up alerts for errors

## Troubleshooting

### Common Issues

**App won't start:**
- Check environment variables are set correctly
- Verify `package.json` has correct start script
- Check Railway logs for errors

**Payment integration not working:**
- Verify Paymob callback URLs are correct
- Check API keys in Railway variables
- Test webhook endpoint manually

**Database issues:**
- SQLite file is created automatically
- Check file permissions
- Verify database path is writable

### Railway Logs
- Access logs in Railway dashboard
- Check for error messages
- Monitor application performance

## Custom Domain Setup

1. **Add custom domain** in Railway dashboard
2. **Update CORS origins** to include your domain
3. **Update Paymob callback URLs** to use your domain
4. **Test all functionality** with custom domain

## Backup Strategy

### Database Backups
- Railway provides automatic backups
- Manual backups available through Railway dashboard
- Consider setting up automated backup scripts

### Code Backups
- GitHub repository serves as primary backup
- Regular commits ensure code safety
- Consider setting up automated testing

## Maintenance

### Regular Tasks
- [ ] Monitor application logs
- [ ] Check database performance
- [ ] Update dependencies
- [ ] Review security settings
- [ ] Backup important data

### Updates
- [ ] Test updates in development first
- [ ] Deploy during low-traffic periods
- [ ] Monitor after deployment
- [ ] Rollback if issues arise

---

**Remember**: Never commit sensitive information to your repository. Always use Railway's environment variables for secrets and API keys.
