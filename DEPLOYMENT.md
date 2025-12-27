# 🚀 WhatsApp Automation - Production Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Railway Account** (Sign up at https://railway.app)
2. **WhatsApp Business API Access** from Meta
3. **GitHub Account** (to connect your repository)

---

## 🔧 Step 1: Prepare Your Repository

### Push to GitHub

```bash
cd d:\whatsapp_automation
git init
git add .
git commit -m "Initial commit - WhatsApp automation system"
git branch -M main
git remote add origin https://github.com/Amitrkl369/whatsapp_automation.git
git push -u origin main
```

---

## 🚂 Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `whatsapp_automation` repository
5. Railway will automatically detect and deploy

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd d:\whatsapp_automation
railway init

# Deploy
railway up
```

---

## ⚙️ Step 3: Configure Environment Variables

In Railway Dashboard, add these environment variables:

### Required Variables

```bash
# Backend Server
PORT=5000
NODE_ENV=production

# Admin Authentication
ADMIN_EMAIL=your-client-email@example.com
ADMIN_PASSWORD=create-secure-password-here
JWT_SECRET=generate-long-random-string-here

# WhatsApp Cloud API
WHATSAPP_API_TOKEN=your-whatsapp-api-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id

# Google Sheets (if using)
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id

# Scheduler Configuration
SYNC_INTERVAL_MINUTES=5
CHECK_INTERVAL_MINUTES=1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### How to Add Variables in Railway:

1. Open your project in Railway
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add each variable from above
5. Click **"Deploy"** after adding all variables

---

## 🌐 Step 4: Setup Frontend on Railway

Railway will deploy backend automatically. For the frontend:

### Update Frontend API URL

The frontend needs to point to your Railway backend URL:

1. After backend deploys, copy the Railway URL (e.g., `https://your-app.railway.app`)
2. Update `frontend/src/api/axios.js`:

```javascript
const api = axios.create({
  baseURL: 'https://your-app.railway.app/api', // Replace with your Railway URL
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Deploy Frontend

**Option 1: Deploy on Vercel (Recommended for frontend)**

```bash
cd frontend
npm install -g vercel
vercel --prod
```

**Option 2: Deploy frontend on Railway too**

Create a separate Railway service for frontend with custom start command:
```bash
cd frontend && npm install && npm run build && npx serve -s dist -p $PORT
```

---

## 📱 Step 5: WhatsApp Business API Setup

### Your client needs to:

1. **Go to Meta for Developers** (https://developers.facebook.com/)
2. **Create/Select App** with WhatsApp product
3. **Get API Credentials**:
   - Access Token (24-hour temporary or permanent)
   - Phone Number ID
   - Business Account ID
4. **Add Test Recipients** (for testing)
5. **Create Template Messages** (for first contact):
   - Go to WhatsApp Manager
   - Create template messages
   - Wait for approval (24-48 hours)

### Important Notes:
- WhatsApp requires **template messages** for initial contact
- After user replies, you have **24-hour window** for free-form messages
- Your reminder messages will work within this window

---

## ✅ Step 6: Test Your Deployment

1. **Access the app** at your Railway URL
2. **Login** with admin credentials
3. **Upload CSV** file with teacher/student data
4. **Schedule a meeting** (set time 3-5 minutes ahead for testing)
5. **Verify reminders** are sent 2 minutes before

---

## 📊 Monitoring & Logs

### View Logs in Railway:

1. Go to your Railway project
2. Click on **"Deployments"** tab
3. Click **"View Logs"** to see real-time console output

### What to monitor:
- ✅ Scheduler started
- ✅ Database initialized
- ✅ Reminders restored from database
- ✅ Messages sent successfully

---

## 💾 Database Backup (Important!)

Your SQLite database is stored in Railway's persistent volume. To backup:

1. **Auto-backup**: Railway keeps snapshots
2. **Manual backup**: Download database file via Railway CLI:
   ```bash
   railway run cat backend/data/whatsapp_automation.db > backup.db
   ```

---

## 💰 Cost Estimate

### Railway Pricing:
- **Starter Plan**: $5/month
  - Always-on service (no sleep)
  - 500 hours execution time
  - Perfect for scheduler tasks

### Total Monthly Cost:
- **Railway**: $5/month
- **Vercel (Frontend)**: Free
- **WhatsApp API**: Free (Cloud API)
- **Total**: ~$5/month

---

## 🔒 Security Checklist

Before giving to client:

- ✅ Change `ADMIN_PASSWORD` to strong password
- ✅ Generate new `JWT_SECRET` (32+ random characters)
- ✅ Set `NODE_ENV=production`
- ✅ Keep WhatsApp API tokens secure
- ✅ Enable HTTPS (Railway does this automatically)

---

## 📞 Client Handover

Provide your client with:

1. **App URL** (Railway + Vercel URLs)
2. **Admin Login Credentials**
3. **CSV Template** (from your repo)
4. **Quick Start Guide**:
   - How to upload CSV
   - How to schedule meetings
   - How to view logs
5. **WhatsApp API Setup Instructions** (if they manage it)

---

## 🆘 Troubleshooting

### Scheduler not running?
- Check Railway logs for errors
- Verify environment variables are set
- Ensure database initialized successfully

### Messages not sending?
- Verify WhatsApp API token is valid
- Check phone numbers have country codes
- Ensure test recipients are added in Meta dashboard

### Frontend can't connect to backend?
- Verify backend URL in `axios.js`
- Check CORS settings allow frontend domain
- Ensure Railway backend is running

---

## 🎉 You're Ready!

Your WhatsApp automation system is now production-ready with:
- ✅ Persistent database (survives restarts)
- ✅ Automatic reminder restoration
- ✅ 24/7 uptime on Railway
- ✅ Professional hosting
- ✅ Ready for client delivery

Need help? Check Railway logs or contact support!
