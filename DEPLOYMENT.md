# Deployment Guide - Multilingual Search Engine

This guide covers deploying your multilingual search engine to the cloud for 24/7 availability.

## 📋 Prerequisites

- GitHub account (for code deployment)
- Your project files ready
- Resource files (JPG/PDF) to upload after deployment

---

## 🚀 Option 1: Deploy to Railway (Recommended - Easiest)

Railway offers the simplest deployment process with a generous free tier.

### Step 1: Prepare Your Code

1. **Initialize Git** (if not already done):
   ```bash
   cd "c:\Gurutattva\Gurutattva integration of AI for chat\Sadhak\search-engine"
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```

2. **Push to GitHub**:
   - Create a new repository on GitHub
   - Follow GitHub's instructions to push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Railway

1. **Sign up/Login**: Visit [railway.app](https://railway.app) and sign in with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Deployment**:
   - Railway will auto-detect the Dockerfile
   - No additional configuration needed (railway.json handles it)
   - Click "Deploy"

4. **Add Persistent Storage**:
   - Go to your service settings
   - Click "Variables" → "New Variable"
   - Add volume mount: `/data` (Railway will create a persistent volume)
   - Alternatively, in the "Storage" tab, add a volume mounted at `/app/data`

5. **Get Your URL**:
   - Go to "Settings" → "Domains"
   - Railway provides a free subdomain: `your-app.railway.app`
   - Click "Generate Domain" if not auto-generated

### Step 3: Upload Your Resources

**Option A - Using Railway CLI** (Recommended):
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Upload resources folder
railway run bash
cd /app
# Now use railway shell to upload files or use SFTP
```

**Option B - Via Git** (if resources folder is small < 100MB):
```bash
# Add resources to git
git add resources/
git commit -m "Add resource files"
git push
```

### Step 4: Run Ingestion

1. In Railway dashboard, go to your service
2. Click "Settings" → "Deploy"
3. Add a one-time deploy command to run ingestion:
   - Or use Railway CLI: `railway run npm run ingest`

Alternatively, access the shell:
```bash
railway run bash
npm run ingest
```

### Step 5: Access Your App

Visit your Railway domain (e.g., `https://your-app.railway.app`)

---

## 🔧 Option 2: Deploy to Render

Render is another excellent platform with similar ease of use.

### Step 1: Prepare Code

Follow the same Git/GitHub steps as Railway above.

### Step 2: Deploy on Render

1. **Sign up**: Visit [render.com](https://render.com) and sign up

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will detect the Dockerfile automatically

3. **Configure**:
   - Name: `multilingual-search-engine`
   - Instance Type: Free (or paid for better performance)
   - The `render.yaml` file will auto-configure settings

4. **Add Disk**:
   - In the service settings, go to "Disks"
   - Add a disk:
     - Name: `search-data`
     - Mount Path: `/app/data`
     - Size: 1GB (or more based on your needs)

5. **Deploy**: Click "Create Web Service"

### Step 3: Upload Resources & Run Ingestion

Similar to Railway, use Render's shell access or upload via Git.

---

## 💻 Option 3: Deploy to DigitalOcean/AWS (Production-Grade)

For better performance and control (costs ~$5-12/month).

### DigitalOcean App Platform

1. **Create Account**: Sign up at [digitalocean.com](https://digitalocean.com)

2. **Create App**:
   - Go to "Apps" → "Create App"
   - Connect GitHub repository
   - Select your repo and branch

3. **Configure**:
   - Detected as Docker app (uses Dockerfile)
   - Set HTTP port: 3000
   - Choose plan: Basic ($5/month)

4. **Add Volume**:
   - Add a managed database or volume for persistent storage
   - Mount at `/app/data`

5. **Deploy**: Review and create

6. **Upload Resources**: Use SSH/SFTP or DigitalOcean's console access

---

## 🆓 Option 4: Oracle Cloud Free Tier (Advanced - VPS)

Completely free but requires manual setup.

### Step 1: Create Free Tier Instance

1. Sign up at [oracle.com/cloud](https://oracle.com/cloud/free/)
2. Create a VM instance (Ampere A1 - always free)
3. Choose Ubuntu 22.04
4. Save your SSH key

### Step 2: Setup Server

```bash
# SSH into your server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker (optional)
sudo apt install -y docker.io
sudo systemctl enable docker

# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
npm install

# Create directories
mkdir -p data resources

# Upload your resource files (from local machine)
# scp -i your-key.pem -r resources/* ubuntu@YOUR_SERVER_IP:/home/ubuntu/YOUR_REPO/resources/
```

### Step 3: Setup PM2 for Process Management

```bash
# Install PM2
sudo npm install -g pm2

# Run ingestion
npm run ingest

# Start server with PM2
pm2 start server.js --name search-engine
pm2 save
pm2 startup
```

### Step 4: Setup Nginx Reverse Proxy

```bash
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/search-engine

# Add configuration:
# server {
#     listen 80;
#     server_name YOUR_DOMAIN_OR_IP;
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }

# Enable site
sudo ln -s /etc/nginx/sites-available/search-engine /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Configure Firewall

```bash
# In Oracle Cloud Console, add ingress rules for ports 80 and 443
# On the server:
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

---

## 📊 Post-Deployment Checklist

After deploying to any platform:

- [ ] Application URL is accessible
- [ ] Health endpoint works: `https://your-url/health`
- [ ] Resources folder contains your files
- [ ] Ingestion has been run successfully
- [ ] Search functionality works (test with English and Hindi queries)
- [ ] Image previews load correctly
- [ ] Data persists after service restart

---

## 🔍 Troubleshooting

### Server won't start
- Check logs in your platform dashboard
- Verify all dependencies are installed
- Ensure ports are correctly configured

### No search results
- Run ingestion: `npm run ingest`
- Check if resources folder has files
- Verify vector store was created in `/app/data/vectors`

### Images not loading
- Check resource paths in database
- Verify resources folder is mounted correctly
- Check file permissions

### Out of memory
- Upgrade to a paid tier with more RAM
- Reduce the number of resources processed at once
- Consider using external storage for images

---

## 🌐 Custom Domain (Optional)

### Railway
- Go to Settings → Domains
- Add custom domain
- Update DNS records as instructed

### Render
- Settings → Custom Domains
- Follow DNS configuration steps

### Other Platforms
- Configure DNS A record pointing to your server IP
- Setup SSL with Let's Encrypt

---

## 🔒 Security Recommendations

While you mentioned security isn't a priority now, consider these basic steps:

1. **HTTPS**: Most platforms provide this automatically
2. **Environment Variables**: Store sensitive configs as env vars
3. **Regular Backups**: Export your database periodically
4. **Update Dependencies**: Run `npm audit fix` regularly

---

## 💡 Recommended Platform Summary

| Platform | Best For | Cost | Difficulty | Features |
|----------|----------|------|------------|----------|
| **Railway** | Quick start | Free tier available | ⭐ Easiest | Auto HTTPS, simple UI |
| **Render** | Reliable hosting | Free tier available | ⭐⭐ Easy | Great docs, persistent disks |
| **DigitalOcean** | Production apps | $5-12/month | ⭐⭐⭐ Medium | High performance |
| **Oracle Cloud** | Budget conscious | Free forever | ⭐⭐⭐⭐ Advanced | Full VPS control |

**Start with Railway for the fastest deployment!**
