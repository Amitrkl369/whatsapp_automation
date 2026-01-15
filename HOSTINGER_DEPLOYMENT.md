# 🚀 Hostinger Deployment Guide

## Prerequisites

Your WhatsApp automation requires:
- **VPS Hosting** or **Cloud Hosting** (Shared hosting won't work due to Node.js requirements)
- SSH access
- Node.js 18+ support
- Domain name (optional but recommended)

## Deployment Options

### Option 1: Hostinger VPS (Recommended)

#### Step 1: Setup VPS

1. **Purchase Hostinger VPS**:
   - Go to https://www.hostinger.com/vps-hosting
   - Choose a plan (VPS 1 or higher recommended)
   - Complete purchase and note your VPS credentials

2. **Access VPS via SSH**:
   ```bash
   ssh root@your-vps-ip
   ```

#### Step 2: Install Required Software

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx (Web Server)
apt install -y nginx

# Install Git
apt install -y git

# Install build essentials (for better-sqlite3)
apt install -y build-essential python3
```

#### Step 3: Clone and Setup Application

```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone https://github.com/Amitrkl369/whatsapp_automation.git
cd whatsapp_automation

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Build frontend
npm run build
```

#### Step 4: Configure Environment Variables

```bash
# Create .env file in backend directory
cd /var/www/whatsapp_automation/backend
nano .env
```

Add the following (replace with your actual values):
```env
# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Admin Credentials
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password

# JWT Configuration
JWT_SECRET=your-very-long-random-secret-key-here

# WhatsApp API Configuration
WHATSAPP_API_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-id

# Optional: Google Sheets Integration
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-sheet-id
```

Save with `Ctrl+X`, then `Y`, then `Enter`

#### Step 5: Start Backend with PM2

```bash
cd /var/www/whatsapp_automation/backend

# Start application
pm2 start server.js --name whatsapp-backend

# Save PM2 configuration
pm2 save

# Enable PM2 to start on system boot
pm2 startup
# Follow the command it outputs
```

#### Step 6: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/whatsapp-automation
```

Add this configuration (replace `your-domain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend - Serve React build files
    root /var/www/whatsapp_automation/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Proxy to Node.js
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

    # Webhook endpoint
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

    # Increase max upload size for CSV files
    client_max_body_size 10M;
}
```

Save and enable the site:

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/whatsapp-automation /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### Step 7: Setup SSL Certificate (Free with Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts to complete SSL setup
```

#### Step 8: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

#### Step 9: Point Domain to VPS

1. Go to your domain registrar (Hostinger, Namecheap, etc.)
2. Update DNS records:
   - **A Record**: `@` → `your-vps-ip`
   - **A Record**: `www` → `your-vps-ip`
3. Wait 5-30 minutes for DNS propagation

---

### Option 2: Hostinger Cloud Hosting

If you have Hostinger Cloud Hosting with Node.js support:

#### Step 1: Access via SSH

```bash
ssh u123456789@your-domain.com
```

#### Step 2: Setup Node.js

```bash
# Check if Node.js is available
node --version

# If not available, contact Hostinger support to enable Node.js
```

#### Step 3: Upload Files

You can use:
- **FTP/SFTP**: Upload files to `public_html` or `domains/your-domain.com`
- **Git**: Clone your repository

```bash
cd ~/domains/your-domain.com
git clone https://github.com/Amitrkl369/whatsapp_automation.git
cd whatsapp_automation
```

#### Step 4: Install Dependencies and Build

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
npm run build
```

#### Step 5: Configure and Start

Follow steps 4-5 from Option 1 for environment variables and PM2 setup.

---

## Post-Deployment

### Verify Deployment

1. **Check Backend**:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check PM2 Status**:
   ```bash
   pm2 status
   pm2 logs whatsapp-backend
   ```

3. **Access Your Application**:
   - Visit `https://your-domain.com`
   - Login with your admin credentials

### Useful Commands

```bash
# View application logs
pm2 logs whatsapp-backend

# Restart application
pm2 restart whatsapp-backend

# Stop application
pm2 stop whatsapp-backend

# Monitor resources
pm2 monit

# Update application (after git push)
cd /var/www/whatsapp_automation
git pull
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart whatsapp-backend
systemctl restart nginx
```

### Database Location

Your SQLite database will be at:
```
/var/www/whatsapp_automation/backend/data/whatsapp.db
```

Make sure to backup this file regularly:
```bash
# Create backup script
nano /root/backup-db.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/whatsapp_automation/backend/data/whatsapp.db /root/backups/whatsapp_${DATE}.db
```

Make executable and schedule:
```bash
chmod +x /root/backup-db.sh
crontab -e
# Add: 0 2 * * * /root/backup-db.sh
```

---

## Troubleshooting

### Issue: Application not starting

```bash
# Check logs
pm2 logs whatsapp-backend

# Check if port is in use
netstat -tulpn | grep 3000

# Restart application
pm2 restart whatsapp-backend
```

### Issue: Cannot connect to backend

```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test Nginx configuration
nginx -t
```

### Issue: WhatsApp messages not sending

1. Check environment variables in `.env`
2. Verify WhatsApp API token is valid
3. Check application logs: `pm2 logs whatsapp-backend`

### Issue: Frontend not loading

```bash
# Rebuild frontend
cd /var/www/whatsapp_automation/frontend
npm run build

# Check Nginx is serving correct directory
ls -la /var/www/whatsapp_automation/frontend/dist
```

---

## Security Best Practices

1. **Keep system updated**:
   ```bash
   apt update && apt upgrade -y
   ```

2. **Use strong passwords** for admin account

3. **Enable firewall** (UFW)

4. **Regular backups** of database

5. **Monitor logs** regularly:
   ```bash
   pm2 logs
   tail -f /var/log/nginx/access.log
   ```

6. **Keep Node.js updated**:
   ```bash
   npm install -g npm@latest
   ```

---

## Cost Estimate

- **Hostinger VPS 1**: ~$4-8/month
- **Domain**: ~$10/year (often free first year with hosting)
- **SSL Certificate**: Free (Let's Encrypt)

**Total**: ~$5-10/month

---

## Support

If you encounter issues:
1. Check application logs: `pm2 logs`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Contact Hostinger support for VPS-specific issues
4. Review this guide's troubleshooting section

---

## 🎉 Deployment Complete!

Your WhatsApp automation system should now be:
- ✅ Running on Hostinger VPS
- ✅ Accessible via your domain
- ✅ Secured with SSL
- ✅ Auto-starting on server reboot
- ✅ Monitored by PM2

Access your application at: `https://your-domain.com`
