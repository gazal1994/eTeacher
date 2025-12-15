#!/bin/bash

# Exit on error
set -e

echo "Starting deployment..."

# Load environment variables
if [ -f /var/www/eteacher/.env ]; then
    source /var/www/eteacher/.env
fi

# Stop existing services
echo "Stopping existing services..."
sudo systemctl stop eteacher-backend || true
sudo systemctl stop nginx || true

# Deploy Backend
echo "Deploying backend..."
sudo rm -rf /var/www/eteacher/backend
sudo cp -r backEnd/MiniLmsApi/publish /var/www/eteacher/backend

# Update backend configuration
sudo tee /var/www/eteacher/backend/appsettings.Production.json > /dev/null <<EOF
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Urls": "http://0.0.0.0:5000",
  "Cors": {
    "AllowedOrigins": ["http://${EC2_PUBLIC_IP}", "http://localhost:5173"]
  }
}
EOF

# Deploy Frontend
echo "Deploying frontend..."
sudo rm -rf /var/www/eteacher/frontend
sudo cp -r frontEnd/dist /var/www/eteacher/frontend

# Update nginx configuration
sudo tee /etc/nginx/conf.d/eteacher.conf > /dev/null <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Frontend
    location / {
        root /var/www/eteacher/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Test nginx configuration
sudo nginx -t

# Set permissions - backend runs as ec2-user, frontend served by nginx
sudo chown -R ec2-user:ec2-user /var/www/eteacher/backend
sudo chown -R nginx:nginx /var/www/eteacher/frontend
sudo chmod -R 755 /var/www/eteacher

# Start services
echo "Starting services..."
sudo systemctl restart eteacher-backend
sudo systemctl restart nginx

# Check service status
echo "Checking service status..."
sudo systemctl status eteacher-backend --no-pager || true
sudo systemctl status nginx --no-pager || true

echo "Deployment completed successfully!"
