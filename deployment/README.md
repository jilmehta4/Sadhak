# Deployment Configurations

This folder contains deployment scripts and configuration files for deploying the Sadhak application to production.

## Files

- **[AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)**: Complete guide for deploying to AWS EC2
- **nginx.conf**: Nginx reverse proxy configuration
- **deploy-ec2.sh**: Automated deployment script for EC2

## Deployment Options

### AWS EC2 (Recommended)

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for a complete step-by-step guide.

**Quick Overview:**
1. Launch Ubuntu EC2 instance (t2.micro for free tier)
2. Install Node.js, PM2, and Nginx
3. Clone/upload backend code
4. Configure environment variables
5. Run with PM2 for auto-restart
6. Set up Nginx as reverse proxy

### Other Options

#### Heroku

```bash
cd backend
heroku create sadhak-backend
git push heroku main
```

#### DigitalOcean

Similar to EC2 deployment - use the same steps from AWS_DEPLOYMENT.md.

#### Docker

Create `Dockerfile` in backend:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t sadhak-backend .
docker run -p 3000:3000 sadhak-backend
```

## Nginx Configuration

The `nginx.conf` file configures Nginx as a reverse proxy to:
- Forward requests to the Node.js backend on port 3000
- Handle SSL/TLS termination (when configured)
- Serve static files efficiently
- Enable gzip compression

### Using the Configuration

```bash
sudo cp nginx.conf /etc/nginx/sites-available/sadhak
sudo ln -s /etc/nginx/sites-available/sadhak /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Deployment Script

The `deploy-ec2.sh` script automates the deployment process:

```bash
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

This script will:
1. Update system packages
2. Install Node.js and dependencies
3. Set up the application
4. Configure PM2
5. Set up Nginx

## Environment Variables

Create a `.env` file on your server:

```env
PORT=3000
NODE_ENV=production
SESSION_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Certbot will automatically:
- Obtain SSL certificate
- Configure Nginx
- Set up auto-renewal

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 logs sadhak-backend
pm2 status
```

### Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Resources

```bash
htop
free -h
df -h
```

## Backup Strategy

### Database Backup

```bash
# Create backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p ~/backups
tar -czf ~/backups/sadhak-backup-$DATE.tar.gz ~/sadhak-backend/data/
EOF

chmod +x ~/backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * ~/backup.sh
```

### Code Backup

Use Git for version control and push to a remote repository regularly.

## Scaling

### Vertical Scaling

Upgrade your EC2 instance type:
1. Stop the instance
2. Change instance type (e.g., t2.micro → t2.small)
3. Start the instance

### Horizontal Scaling

Use PM2 cluster mode:

```bash
pm2 start server.js -i max --name sadhak-backend
```

This will spawn one process per CPU core.

### Load Balancing

For multiple servers, use:
- AWS Elastic Load Balancer
- Nginx load balancing
- CloudFlare

## Troubleshooting

### Application Won't Start

```bash
pm2 logs sadhak-backend
# Check for errors
```

### Nginx Issues

```bash
sudo nginx -t
sudo systemctl status nginx
```

### Port Already in Use

```bash
sudo lsof -i :3000
# Kill the process if needed
sudo kill -9 <PID>
```

### Out of Memory

```bash
free -h
# Restart the application
pm2 restart sadhak-backend
```

## Security Best Practices

1. **Firewall**: Only open necessary ports (22, 80, 443)
2. **SSH Keys**: Use SSH keys instead of passwords
3. **Updates**: Keep system and packages updated
4. **Environment Variables**: Never commit `.env` files
5. **HTTPS**: Always use SSL/TLS in production
6. **Rate Limiting**: Implement rate limiting in Express
7. **CORS**: Configure CORS properly

## Cost Optimization

### AWS Free Tier

- t2.micro instance: 750 hours/month free
- 30 GB EBS storage free
- 15 GB data transfer out free

### Tips

1. Stop instances when not in use (development)
2. Use reserved instances for long-term (production)
3. Monitor usage with AWS Cost Explorer
4. Set up billing alerts

## License

ISC
