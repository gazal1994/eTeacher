# eTeacher Deployment Guide

This guide explains how to deploy the eTeacher application to AWS EC2 with automatic deployments via GitHub Actions.

## Prerequisites

1. AWS EC2 instance (Ubuntu 20.04 or later recommended)
2. GitHub repository
3. SSH access to your EC2 instance

## Initial EC2 Setup

### 1. Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Run Setup Script

Copy the setup script to your EC2 instance and run it:

```bash
# Copy setup script to EC2
scp -i your-key.pem deploy-scripts/setup-ec2.sh ubuntu@your-ec2-ip:~/

# Connect to EC2 and run setup
ssh -i your-key.pem ubuntu@your-ec2-ip
chmod +x setup-ec2.sh
./setup-ec2.sh
```

### 3. Configure Environment

Edit the environment file with your EC2 public IP:

```bash
nano /var/www/eteacher/.env
```

Update:
```
EC2_PUBLIC_IP=your-ec2-public-ip
```

## GitHub Configuration

### 1. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

- **EC2_SSH_PRIVATE_KEY**: Your EC2 private SSH key content (entire .pem file)
- **EC2_HOST**: Your EC2 public IP address or domain name
- **EC2_USER**: Your EC2 username (usually `ubuntu`)

### 2. Get Your Private Key Content

```bash
cat your-key.pem
```

Copy the entire output including:
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

## Automatic Deployment

Once configured, deployments happen automatically:

1. **Push to GitHub**: Every push to the `master` branch triggers deployment
2. **Build**: Backend and frontend are built
3. **Deploy**: Code is deployed to EC2
4. **Verify**: Health checks ensure services are running

### Manual Deployment

You can also trigger deployment manually:

1. Go to Actions tab in your GitHub repository
2. Select "Deploy to AWS EC2" workflow
3. Click "Run workflow"

## Alternative: Docker Deployment

For Docker-based deployment on EC2:

### 1. Install Docker on EC2

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

### 2. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/gazal1994/eTeacher.git eteacher
cd eteacher
```

### 3. Deploy with Docker Compose

```bash
docker-compose up -d
```

### 4. Update GitHub Actions for Docker

Modify `.github/workflows/deploy.yml` to use Docker deployment instead.

## Accessing Your Application

After successful deployment:

- **Frontend**: http://your-ec2-ip
- **Backend API**: http://your-ec2-ip/api/courses
- **API Documentation**: http://your-ec2-ip:5000/swagger (if enabled)

## Monitoring and Logs

### View Backend Logs

```bash
# Via systemd
sudo journalctl -u eteacher-backend -f

# Via Docker (if using Docker)
docker logs -f eteacher-backend
```

### View Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check Service Status

```bash
# Backend service
sudo systemctl status eteacher-backend

# Nginx
sudo systemctl status nginx

# Docker services (if using Docker)
docker-compose ps
```

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo journalctl -u eteacher-backend -n 50

# Restart service
sudo systemctl restart eteacher-backend
```

### Frontend Not Loading

```bash
# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Port Already in Use

```bash
# Check what's using port 5000
sudo lsof -i :5000

# Kill process if needed
sudo kill -9 <PID>
```

## Security Considerations

1. **Firewall**: Ensure only necessary ports are open (22, 80, 443)
2. **SSH Keys**: Keep your private keys secure, never commit them
3. **Environment Variables**: Store sensitive data in environment files
4. **SSL/HTTPS**: Consider adding SSL certificate (Let's Encrypt recommended)

### Adding SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

## Rollback

If deployment fails, rollback to previous version:

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
cd /var/www/eteacher

# List available backups
ls -lt backup-*

# Restore from backup
sudo rm -rf current
sudo cp -r backup-YYYYMMDD-HHMMSS current
sudo systemctl restart eteacher-backend
sudo systemctl restart nginx
```

## Maintenance

### Update Application

Just push to GitHub - automatic deployment will handle it!

### Manual Update on EC2

```bash
cd /var/www/eteacher
git pull origin master
./deploy-scripts/deploy.sh
```

### Cleanup Old Backups

Backups are automatically kept (last 3 versions). To manually clean:

```bash
cd /var/www/eteacher
ls -dt backup-* | tail -n +4 | xargs rm -rf
```

## Support

For issues or questions:
1. Check logs for error messages
2. Review GitHub Actions workflow results
3. Verify EC2 security group settings allow required ports
4. Ensure GitHub secrets are correctly configured
