#!/bin/bash

# EC2 Initial Setup Script
# Run this script once on your EC2 instance to prepare it for deployments

set -e

echo "Setting up EC2 instance for eTeacher deployment..."

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt-get install -y \
    nginx \
    wget \
    curl \
    git \
    unzip

# Install .NET 8 Runtime
echo "Installing .NET 8 Runtime..."
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0 --runtime aspnetcore
rm dotnet-install.sh

# Add .NET to PATH
echo 'export DOTNET_ROOT=$HOME/.dotnet' >> ~/.bashrc
echo 'export PATH=$PATH:$HOME/.dotnet' >> ~/.bashrc
source ~/.bashrc

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /var/www/eteacher/{backend,frontend,logs}
sudo chown -R $USER:$USER /var/www/eteacher

# Create systemd service for backend
echo "Creating systemd service for backend..."
sudo tee /etc/systemd/system/eteacher-backend.service > /dev/null <<EOF
[Unit]
Description=eTeacher Backend API
After=network.target

[Service]
Type=notify
User=$USER
WorkingDirectory=/var/www/eteacher/backend
ExecStart=$HOME/.dotnet/dotnet /var/www/eteacher/backend/MiniLmsApi.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=eteacher-backend
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_ROOT=$HOME/.dotnet

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload
sudo systemctl enable eteacher-backend

# Configure nginx
echo "Configuring nginx..."
sudo rm -f /etc/nginx/sites-enabled/default

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (for future SSL)
sudo ufw --force enable

# Create environment file template
cat > /var/www/eteacher/.env <<EOF
EC2_PUBLIC_IP=YOUR_EC2_PUBLIC_IP
ENVIRONMENT=Production
EOF

echo ""
echo "=========================================="
echo "EC2 Setup completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update /var/www/eteacher/.env with your EC2 public IP"
echo "2. Add the following secrets to your GitHub repository:"
echo "   - EC2_SSH_PRIVATE_KEY: Your private SSH key"
echo "   - EC2_HOST: Your EC2 public IP or domain"
echo "   - EC2_USER: Your EC2 username (usually 'ubuntu')"
echo ""
echo "3. Push code to GitHub to trigger automatic deployment"
echo "=========================================="
