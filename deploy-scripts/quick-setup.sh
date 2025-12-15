#!/bin/bash
set -e

# Install packages
sudo dnf install -y nginx wget git tar gzip libicu --skip-broken

# Install .NET
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0 --runtime aspnetcore --install-dir /home/ec2-user/.dotnet
rm dotnet-install.sh

# Update PATH
echo 'export DOTNET_ROOT=$HOME/.dotnet' >> ~/.bashrc
echo 'export PATH=$PATH:$HOME/.dotnet' >> ~/.bashrc

# Create directories
sudo mkdir -p /var/www/eteacher/{backend,frontend,logs}
sudo chown -R ec2-user:ec2-user /var/www/eteacher

# Create systemd service
sudo tee /etc/systemd/system/eteacher-backend.service > /dev/null <<'EOF'
[Unit]
Description=eTeacher Backend API
After=network.target

[Service]
Type=simple
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

sudo systemctl daemon-reload
sudo systemctl enable eteacher-backend
sudo systemctl enable nginx
sudo systemctl start nginx

echo "Setup complete!"
echo "EC2 IP: 16.16.185.220"
echo "User: ec2-user"
echo "Add GitHub secrets and push to deploy"
