#!/bin/bash

# WhatsApp Automation - Hostinger VPS Deployment Script
# Run this script on your VPS after connecting via SSH

set -e  # Exit on error

echo "=========================================="
echo "WhatsApp Automation - Hostinger Deployment"
echo "=========================================="

# Step 1: Update system
echo ""
echo "Step 1: Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install Node.js 18.x
echo ""
echo "Step 2: Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Step 3: Install required tools
echo ""
echo "Step 3: Installing PM2, Nginx, Git, and build tools..."
npm install -g pm2
apt install -y nginx git build-essential python3

# Step 4: Clone repository
echo ""
echo "Step 4: Cloning repository..."
cd /var/www
if [ -d "whatsapp_automation" ]; then
    echo "Directory exists, pulling latest changes..."
    cd whatsapp_automation
    git pull
else
    git clone https://github.com/Amitrkl369/whatsapp_automation.git
    cd whatsapp_automation
fi

# Step 5: Install dependencies
echo ""
echo "Step 5: Installing backend dependencies..."
cd backend
npm install

echo ""
echo "Step 6: Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "Step 7: Building frontend..."
npm run build

# Step 8: Create .env file
echo ""
echo "Step 8: Creating environment file..."
cd /var/www/whatsapp_automation/backend

cat > .env << 'EOL'
# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://31.97.14.15

# Admin Credentials (CHANGE THESE!)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisPassword123!

# JWT Configuration (GENERATE A RANDOM STRING!)
JWT_SECRET=change-this-to-a-very-long-random-secret-key

# WhatsApp API Configuration (ADD YOUR CREDENTIALS!)
WHATSAPP_API_TOKEN=your-token-here
WHATSAPP_PHONE_NUMBER_ID=your-phone-id-here
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-id-here

# Optional: Google Sheets Integration
# GOOGLE_SHEETS_CLIENT_EMAIL=
# GOOGLE_SHEETS_PRIVATE_KEY=
# GOOGLE_SHEET_ID=
EOL

echo ""
echo "⚠️  IMPORTANT: Edit the .env file with your actual credentials:"
echo "   nano /var/www/whatsapp_automation/backend/.env"
echo ""
read -p "Press Enter after you've updated the .env file..."

# Step 9: Create data directory
echo ""
echo "Step 9: Creating data directory..."
mkdir -p /var/www/whatsapp_automation/backend/data
mkdir -p /var/www/whatsapp_automation/backend/uploads

# Step 10: Start application with PM2
echo ""
echo "Step 10: Starting application with PM2..."
cd /var/www/whatsapp_automation/backend
pm2 delete whatsapp-backend 2>/dev/null || true
pm2 start server.js --name whatsapp-backend
pm2 save
pm2 startup

echo ""
echo "⚠️  Run the command shown above if PM2 asks you to!"
read -p "Press Enter to continue..."

# Step 11: Configure Nginx
echo ""
echo "Step 11: Configuring Nginx..."
cat > /etc/nginx/sites-available/whatsapp-automation << 'EOL'
server {
    listen 80;
    server_name 31.97.14.15;

    # Frontend
    root /var/www/whatsapp_automation/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhook
    location /webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
EOL

# Enable the site
ln -sf /etc/nginx/sites-available/whatsapp-automation /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx

# Step 12: Configure firewall
echo ""
echo "Step 12: Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "y" | ufw enable

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Your application is now running at:"
echo "👉 http://31.97.14.15"
echo ""
echo "Useful commands:"
echo "  - View logs:    pm2 logs whatsapp-backend"
echo "  - Restart app:  pm2 restart whatsapp-backend"
echo "  - Stop app:     pm2 stop whatsapp-backend"
echo "  - App status:   pm2 status"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Update .env with your WhatsApp API credentials"
echo "  2. Restart the app: pm2 restart whatsapp-backend"
echo ""
