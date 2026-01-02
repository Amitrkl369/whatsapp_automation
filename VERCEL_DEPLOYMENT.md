# 🚀 Vercel Frontend Deployment Guide

## Deploy Frontend to Vercel

### Prerequisites
- Vercel account (https://vercel.com)
- Backend already deployed on Render

### Step 1: Deploy Backend to Render First
1. Go to https://dashboard.render.com/
2. Create **New Web Service**
3. Connect your GitHub repo: `Amitrkl369/whatsapp_automation`
4. Configure:
   - **Name**: `whatsapp-automation-api` (or your choice)
   - **Root Directory**: Leave empty
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
5. Add environment variables (from your .env file):
   ```
   ADMIN_EMAIL=amit@rkldigital.com
   ADMIN_PASSWORD=Amit@2026
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   WHATSAPP_API_TOKEN=EAAVRRSnvULoBOQbNVVuZCBZCsFo63IScKiJ8wpx8k11rAZB7ZCkhAZCED6Yt2FZAnrW3WbeBtNnfzzPgpMZBBtEj0PIE1aWXpkjM2xTJpYfZCl9HwyfGj1Icdu1omAPLVIIJsFR6LSzCuejA7uSVK5O9U9l2FVktPb39BCrUw79DBFkOYlUqUHJUgfF4SxogTwycvVTZAXoZBjZC3ftmopAcsxRnrvkZA5AD5nsC5ZBXdmBLJz3ZCGoQRB2I5ZBJvDKgk3lZC1SIear7twEK6oyyBSCZCh9JJih4z
   WHATSAPP_PHONE_NUMBER_ID=800271879828025
   WHATSAPP_BUSINESS_ACCOUNT_ID=1020052020002272
   NODE_ENV=production
   PORT=5000
   ```
6. **IMPORTANT**: After deployment, add one more variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
   (You'll get this URL after deploying to Vercel in Step 2)

7. Copy your backend URL (e.g., `https://whatsapp-automation-api.onrender.com`)

### Step 2: Deploy Frontend to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `Amitrkl369/whatsapp_automation`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-name.onrender.com/api`
   
   (Replace with your actual Render backend URL from Step 1)

6. Click **"Deploy"**
7. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

8. **Go back to Render** and update the `FRONTEND_URL` variable with your Vercel URL

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow the prompts:
# - Set root directory: ./
# - Build command: npm run build
# - Output directory: dist

# Add environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend-name.onrender.com/api
```

### Step 3: Update CORS (Already Done)

The backend is already configured to accept requests from your Vercel frontend via the `FRONTEND_URL` environment variable.

### 🎉 Done!

Your app is now live:
- **Backend (Render)**: `https://your-backend-name.onrender.com`
- **Frontend (Vercel)**: `https://your-app.vercel.app`

### Benefits of This Setup:
✅ Vercel has excellent frontend performance and CDN
✅ Render is great for Node.js backends with persistent storage
✅ Both have free tiers
✅ Automatic deployments on git push
✅ Free SSL certificates

### Important Notes:
- Vercel deployments are instant (~30 seconds)
- Render free tier sleeps after 15 minutes of inactivity
- Make sure both `VITE_API_URL` (Vercel) and `FRONTEND_URL` (Render) are correctly set
