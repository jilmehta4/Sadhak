#!/bin/bash

# Sadhak Backend Deployment Script for EC2
# Run this script on your EC2 instance after initial setup

set -e  # Exit on error

echo "=================================="
echo "Sadhak Backend Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as ubuntu user
if [ "$USER" != "ubuntu" ]; then
    echo -e "${YELLOW}Warning: This script should be run as ubuntu user${NC}"
fi

# Update system
echo -e "${GREEN}[1/8] Updating system...${NC}"
sudo apt update
sudo apt upgrade -y

# Install Node.js
echo -e "${GREEN}[2/8] Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install PM2
echo -e "${GREEN}[3/8] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo "PM2 version: $(pm2 --version)"

# Install Nginx
echo -e "${GREEN}[4/8] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi

# Navigate to app directory
echo -e "${GREEN}[5/8] Setting up application...${NC}"
cd ~/sadhak-backend

# Install dependencies
echo -e "${GREEN}[6/8] Installing npm dependencies...${NC}"
npm install --production

# Create necessary directories
mkdir -p data
mkdir -p logs

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating template...${NC}"
    cat > .env << EOF
PORT=3000
NODE_ENV=production
SESSION_SECRET=$(openssl rand -base64 32)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000/auth/google/callback
EOF
    echo -e "${YELLOW}Please edit .env file with your actual credentials${NC}"
fi

# Start application with PM2
echo -e "${GREEN}[7/8] Starting application with PM2...${NC}"
pm2 delete sadhak-backend 2>/dev/null || true
pm2 start server.js --name sadhak-backend
pm2 save

# Setup PM2 startup
echo -e "${GREEN}[8/8] Configuring PM2 startup...${NC}"
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Configure Nginx
echo -e "${GREEN}Configuring Nginx...${NC}"
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

sudo tee /etc/nginx/sites-available/sadhak > /dev/null << EOF
server {
    listen 80;
    server_name $PUBLIC_IP;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/sadhak /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo -e "${GREEN}=================================="
echo "Deployment Complete!"
echo "==================================${NC}"
echo ""
echo "Your API is now running at:"
echo -e "${GREEN}http://$PUBLIC_IP${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check app status"
echo "  pm2 logs sadhak-backend - View logs"
echo "  pm2 restart sadhak-backend - Restart app"
echo "  pm2 monit               - Monitor resources"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Google OAuth credentials"
echo "2. Restart the app: pm2 restart sadhak-backend"
echo "3. Test the API: curl http://$PUBLIC_IP/health"
echo "4. Update your mobile and web apps with this URL"
echo ""
