# AWS EC2 Deployment - Quick Start

## Quick Deployment Steps

### 1. Create EC2 Instance
- Go to AWS Console → EC2 → Launch Instance
- Choose: Ubuntu 22.04 LTS, t2.micro (free tier)
- Create and download key pair: `sadhak-key.pem`
- Configure security group: Allow ports 22, 80, 443, 3000
- Launch instance and note the **Public IP**

### 2. Connect to Instance

```powershell
# Windows PowerShell
ssh -i sadhak-key.pem ubuntu@YOUR_PUBLIC_IP
```

### 3. Upload Your Code

**Option A: From GitHub**
```bash
git clone https://github.com/YOUR_USERNAME/sadhak-backend.git
cd sadhak-backend
```

**Option B: Upload directly**
```powershell
# On your local machine
scp -i sadhak-key.pem -r "c:\Gurutattva\Gurutattva integration of AI for chat\Sadhak" ubuntu@YOUR_PUBLIC_IP:~/sadhak-backend
```

### 4. Run Deployment Script

```bash
cd ~/sadhak-backend
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

### 5. Configure Environment

```bash
nano .env
# Add your Google OAuth credentials
# Save and exit (Ctrl+X, Y, Enter)

pm2 restart sadhak-backend
```

### 6. Test

Visit: `http://YOUR_PUBLIC_IP/health`

### 7. Update Your Apps

**Mobile App:** Edit `lib/config/api_config.dart`
```dart
static const String prodBaseUrl = 'http://YOUR_PUBLIC_IP';
static const bool isProduction = true;
```

**Web App:** Update API base URL to `http://YOUR_PUBLIC_IP`

---

## Full Documentation

See [AWS EC2 Deployment Guide](file:///C:/Users/Pc/.gemini/antigravity/brain/e23b5449-67bd-4ebf-88cd-88d25b6c2361/aws_ec2_deployment_guide.md) for detailed instructions.

## Estimated Time

- AWS account setup: 10 minutes
- EC2 instance creation: 5 minutes
- Deployment: 10 minutes
- **Total: ~25 minutes**

## Costs

- **Free for 12 months** (750 hours/month of t2.micro)
- After 12 months: ~$8-10/month
