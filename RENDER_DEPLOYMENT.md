# 🚀 Render Deployment Guide

## Quick Deploy to Render

### Step 1: Push to GitHub

Your code is already on GitHub at: `https://github.com/Amitrkl369/whatsapp_automation`

### Step 2: Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +"** → Select **"Blueprint"**
3. **Connect your GitHub repository**: `Amitrkl369/whatsapp_automation`
4. Render will automatically detect the `render.yaml` file

### Step 3: Configure Environment Variables

In the Render Dashboard, add these environment variables for the **backend service**:

#### Required Variables:
```
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
WHATSAPP_API_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-id
```

#### Optional (Google Sheets):
```
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=your-private-key
GOOGLE_SHEET_ID=your-sheet-id
```

For the **frontend service**, add:
```
VITE_API_URL=https://your-backend-name.onrender.com/api
```

### Step 4: Deploy

Click **"Apply"** and Render will:
- Build and deploy your backend API
- Build and deploy your frontend
- Automatically handle SSL certificates

### Alternative: Manual Deployment

#### Deploy Backend:
1. New Web Service → Connect GitHub
2. **Build Command**: `cd backend && npm install`
3. **Start Command**: `cd backend && npm start`
4. Add environment variables

#### Deploy Frontend:
1. New Static Site → Connect GitHub
2. **Build Command**: `cd frontend && npm install && npm run build`
3. **Publish Directory**: `frontend/dist`
4. Add `VITE_API_URL` environment variable

### 🎉 Done!

Your app will be live at:
- Frontend: `https://your-frontend.onrender.com`
- Backend: `https://your-backend.onrender.com`

### Important Notes:
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~1 minute to wake up
- Consider upgrading to paid tier for production use
