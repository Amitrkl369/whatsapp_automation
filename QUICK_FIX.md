# 🔧 Quick Fix for CSV Upload on Vercel

## Problem
The CSV upload is failing because your **frontend on Vercel** is trying to connect to `localhost:5000`, which doesn't exist in production.

## Solution
You need to deploy your **backend** and configure the frontend to connect to it.

## Step-by-Step Fix:

### 1️⃣ Deploy Backend to Render (5 minutes)

1. Go to https://dashboard.render.com/ and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo: `Amitrkl369/whatsapp_automation`
4. Configure:
   - **Name**: `whatsapp-automation-api`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
   - **Plan**: Free

5. Add these Environment Variables:
   ```
   ADMIN_EMAIL=amit@rkldigital.com
   ADMIN_PASSWORD=Amit@2026
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   WHATSAPP_API_TOKEN=EAAVRRSnvULoBOQbNVVuZCBZCsFo63IScKiJ8wpx8k11rAZB7ZCkhAZCED6Yt2FZAnrW3WbeBtNnfzzPgpMZBBtEj0PIE1aWXpkjM2xTJpYfZCl9HwyfGj1Icdu1omAPLVIIJsFR6LSzCuejA7uSVK5O9U9l2FVktPb39BCrUw79DBFkOYlUqUHJUgfF4SxogTwycvVTZAXoZBjZC3ftmopAcsxRnrvkZA5AD5nsC5ZBXdmBLJz3ZCGoQRB2I5ZBJvDKgk3lZC1SIear7twEK6oyyBSCZCh9JJih4z
   WHATSAPP_PHONE_NUMBER_ID=800271879828025
   WHATSAPP_BUSINESS_ACCOUNT_ID=1020052020002272
   NODE_ENV=production
   PORT=10000
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (2-3 minutes)
8. **Copy your backend URL** (e.g., `https://whatsapp-automation-api.onrender.com`)

### 2️⃣ Configure Vercel Frontend (2 minutes)

1. Go to https://vercel.com/dashboard
2. Select your project (whatsapp_automation)
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://YOUR-BACKEND-URL.onrender.com/api`
     (Replace with the URL from Step 1)
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"Redeploy"** on the latest deployment

### 3️⃣ Update Backend CORS (1 minute)

1. Go back to Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add one more variable:
   - **Name**: `FRONTEND_URL`
   - **Value**: `https://YOUR-APP.vercel.app`
     (Your Vercel frontend URL)
5. Click **"Save Changes"**
6. Service will auto-redeploy

### ✅ Done!

Wait 2-3 minutes for both services to redeploy, then test the CSV upload again.

## Alternative: Deploy Backend to Railway

If you prefer Railway over Render:

1. Go to https://railway.app/
2. **New Project** → **Deploy from GitHub repo**
3. Select `Amitrkl369/whatsapp_automation`
4. Add a service with root directory: `backend`
5. Add the same environment variables
6. Copy the public URL and use it in Vercel

---

**Need Help?** Check the full guides:
- [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
