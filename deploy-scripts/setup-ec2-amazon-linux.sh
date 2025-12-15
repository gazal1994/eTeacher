#!/bin/bash

# EC2 Initial Setup Script for Amazon Linux
# Run this script once on your EC2 instance to prepare it for deployments

set -e

echo "Setting up EC2 instance for eTeacher deployment on Amazon Linux..."

# Update system
echo "Updating system packages..."
sudo dnf update -y

# Install required packages
echo "Installing required packages..."
sudo dnf install -y \
    nginx \
    wget \
    curl \
    git \
    tar \
    gzip

# Install .NET 8 Runtime
echo "Installing .NET 8 Runtime..."
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0 --runtime aspnetcore --install-dir /home/ec2-user/.dotnet
rm dotnet-install.sh

# Add .NET to PATH
echo 'export DOTNET_ROOT=$HOME/.dotnet' >> ~/.bashrc
echo 'export PATH=$PATH:$HOME/.dotnet' >> ~/.bashrc
source ~/.bashrc

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /var/www/eteacher/{backend,frontend,logs}
sudo chown -R ec2-user:ec2-user /var/www/eteacher

# Create systemd service for backend
echo "Creating systemd service for backend..."
sudo tee /etc/systemd/system/eteacher-backend.service > /dev/null <<EOF
[Unit]
Description=eTeacher Backend API
After=network.target

[Service]
Type=notify
User=ec2-user
WorkingDirectory=/var/www/eteacher/backend
ExecStart=/home/ec2-user/.dotnet/dotnet /var/www/eteacher/backend/MiniLmsApi.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=eteacher-backend
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_ROOT=/home/ec2-user/.dotnet

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload
sudo systemctl enable eteacher-backend

# Configure nginx
echo "Configuring nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx

# Remove default nginx config
sudo rm -f /etc/nginx/conf.d/default.conf

# Create environment file template
cat > /var/www/eteacher/.env <<EOF
EC2_PUBLIC_IP=16.16.185.220
ENVIRONMENT=Production
EOF

echo ""
echo "=========================================="
echo "EC2 Setup completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Add the following secrets to your GitHub repository:"
echo "   Go to: https://github.com/gazal1994/eTeacher/settings/secrets/actions"
echo ""
echo "   Add these secrets:"
echo "   - EC2_SSH_PRIVATE_KEY: Content of your KEY.pem file"
echo "   - EC2_HOST: 16.16.185.220"
echo "   - EC2_USER: ec2-user"
echo ""
echo "2. Make sure your EC2 Security Group allows:"
echo "   - Port 22 (SSH) from your IP"
echo "   - Port 80 (HTTP) from anywhere"
echo "   - Port 443 (HTTPS) from anywhere (optional)"
echo "   - Port 5000 (Backend API) from anywhere"
echo ""
echo "3. Push code to GitHub to trigger automatic deployment"
echo "=========================================="
