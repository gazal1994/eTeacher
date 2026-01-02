# PowerShell Deployment Script for EC2
# This script deploys the eTeacher application to EC2

param(
    [string]$EC2_IP = "16.16.65.170",
    [string]$SSH_KEY = "C:\Users\windows11\Desktop\keys\KEY.pem",
    [string]$EC2_USER = "ec2-user"
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  eTeacher EC2 Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EC2 IP: $EC2_IP" -ForegroundColor Yellow
Write-Host "User: $EC2_USER" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Build Frontend
Write-Host "[1/6] Building Frontend..." -ForegroundColor Green
Set-Location "$PSScriptRoot\..\frontEnd"

# Create production environment file
$envContent = "VITE_API_BASE_URL=http://$EC2_IP/api"
Set-Content -Path ".env.production" -Value $envContent
Write-Host "  Created .env.production with API URL: http://$EC2_IP/api" -ForegroundColor Gray

# Install dependencies and build
Write-Host "  Installing dependencies..." -ForegroundColor Gray
npm install --silent

Write-Host "  Building production bundle..." -ForegroundColor Gray
npx vite build --mode production

if (-not (Test-Path "dist")) {
    Write-Host "  ERROR: Frontend build failed - dist folder not found" -ForegroundColor Red
    exit 1
}

Write-Host "  Frontend build successful!" -ForegroundColor Green

# Step 2: Test SSH Connection
Write-Host "`n[2/6] Testing SSH Connection..." -ForegroundColor Green
$sshTest = ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=10 "${EC2_USER}@${EC2_IP}" "echo 'Connection successful'" 2>&1 | Out-String

if ($sshTest -notmatch "Connection successful") {
    Write-Host "  ERROR: Cannot connect to EC2 instance" -ForegroundColor Red
    Write-Host "  Output: $sshTest" -ForegroundColor Yellow
    Write-Host "  Make sure:" -ForegroundColor Yellow
    Write-Host "    1. EC2 instance is running" -ForegroundColor Yellow
    Write-Host "    2. Security group allows SSH (port 22) from your IP" -ForegroundColor Yellow
    Write-Host "    3. SSH key has correct permissions" -ForegroundColor Yellow
    exit 1
}

Write-Host "  SSH connection successful!" -ForegroundColor Green

# Step 3: Setup EC2 (if needed)
Write-Host "`n[3/6] Checking EC2 Setup..." -ForegroundColor Green

$setupCheck = ssh -i $SSH_KEY "${EC2_USER}@${EC2_IP}" "test -d /var/www/eteacher && echo 'exists' || echo 'missing'" 2>&1

if ($setupCheck -match "missing") {
    Write-Host "  Running initial EC2 setup..." -ForegroundColor Yellow
    
    # Copy setup script to EC2
    scp -i $SSH_KEY "$PSScriptRoot\quick-setup.sh" "${EC2_USER}@${EC2_IP}:~/quick-setup.sh"
    
    # Run setup script
    ssh -i $SSH_KEY "${EC2_USER}@${EC2_IP}" "chmod +x ~/quick-setup.sh && sudo ~/quick-setup.sh"
    
    Write-Host "  EC2 setup completed!" -ForegroundColor Green
} else {
    Write-Host "  EC2 already configured" -ForegroundColor Gray
}

# Step 4: Create deployment package
Write-Host "`n[4/6] Creating Deployment Package..." -ForegroundColor Green
Set-Location "$PSScriptRoot\.."

$tempDir = "$env:TEMP\eteacher-deploy"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy frontend build
Write-Host "  Packaging frontend..." -ForegroundColor Gray
Copy-Item -Recurse "frontEnd\dist" "$tempDir\frontend"

# Copy deployment scripts
Write-Host "  Packaging deployment scripts..." -ForegroundColor Gray
Copy-Item "deploy-scripts\deploy.sh" "$tempDir\"
Copy-Item "deploy-scripts\nginx.conf" "$tempDir\"

# Create environment file for EC2
$ec2EnvContent = "EC2_PUBLIC_IP=$EC2_IP"
Set-Content -Path "$tempDir\.env" -Value $ec2EnvContent

Write-Host "  Package created successfully!" -ForegroundColor Green

# Step 5: Transfer files to EC2
Write-Host "`n[5/6] Transferring Files to EC2..." -ForegroundColor Green

Write-Host "  Creating remote directories..." -ForegroundColor Gray
ssh -i $SSH_KEY "${EC2_USER}@${EC2_IP}" "sudo mkdir -p /var/www/eteacher && sudo chown -R ${EC2_USER}:${EC2_USER} /var/www/eteacher"

Write-Host "  Uploading frontend..." -ForegroundColor Gray
scp -i $SSH_KEY -r "$tempDir\frontend" "${EC2_USER}@${EC2_IP}:/var/www/eteacher/"

Write-Host "  Uploading configuration..." -ForegroundColor Gray
scp -i $SSH_KEY "$tempDir\.env" "${EC2_USER}@${EC2_IP}:/var/www/eteacher/"
scp -i $SSH_KEY "$tempDir\nginx.conf" "${EC2_USER}@${EC2_IP}:~/nginx.conf"

Write-Host "  Files transferred successfully!" -ForegroundColor Green

# Step 6: Deploy on EC2
Write-Host "`n[6/6] Deploying Application..." -ForegroundColor Green

# Create a temporary script file with proper Unix line endings
$deployScript = @"
#!/bin/bash
# Configure Nginx
sudo cp ~/nginx.conf /etc/nginx/conf.d/eteacher.conf

# Update nginx configuration with EC2 IP
sudo sed -i 's/YOUR_EC2_IP/$EC2_IP/g' /etc/nginx/conf.d/eteacher.conf

# Set proper permissions
sudo chown -R nginx:nginx /var/www/eteacher/frontend
sudo chmod -R 755 /var/www/eteacher

# Test nginx configuration
if ! sudo nginx -t; then
    echo 'Nginx configuration test failed!'
    exit 1
fi

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx --no-pager

echo 'Deployment completed successfully!'
"@

# Write script to temp file and convert to Unix line endings
$tempScript = "$env:TEMP\deploy-temp.sh"
$deployScript | Set-Content -Path $tempScript -NoNewline
(Get-Content $tempScript -Raw) -replace "`r`n","`n" | Set-Content -Path $tempScript -NoNewline

Write-Host "  Uploading deployment script..." -ForegroundColor Gray
scp -i $SSH_KEY $tempScript "${EC2_USER}@${EC2_IP}:~/deploy-temp.sh"

Write-Host "  Configuring and starting services..." -ForegroundColor Gray
ssh -i $SSH_KEY "${EC2_USER}@${EC2_IP}" "chmod +x ~/deploy-temp.sh && ~/deploy-temp.sh"

Remove-Item $tempScript -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nYour application is now live at:" -ForegroundColor Cyan
    Write-Host "  http://$EC2_IP" -ForegroundColor Yellow
    Write-Host "`nAPI endpoint:" -ForegroundColor Cyan
    Write-Host "  http://$EC2_IP/api" -ForegroundColor Yellow
    Write-Host "`n========================================`n" -ForegroundColor Green
} else {
    Write-Host "`nERROR: Deployment failed on EC2" -ForegroundColor Red
    exit 1
}

# Cleanup
Write-Host "Cleaning up temporary files..." -ForegroundColor Gray
Remove-Item -Recurse -Force $tempDir

Write-Host "Done!`n" -ForegroundColor Green
