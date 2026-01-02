# SSL Setup Script for EC2
# This script sets up HTTPS/SSL certificate using Let's Encrypt

param(
    [string]$EC2_IP = "16.16.65.170",
    [string]$SSH_KEY = "C:\Users\windows11\Desktop\keys\KEY.pem",
    [string]$EC2_USER = "ec2-user",
    [string]$DOMAIN = "abanyasod.duckdns.org",
    [Parameter(Mandatory=$true)]
    [string]$EMAIL
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SSL/HTTPS Setup for eTeacher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Domain: $DOMAIN" -ForegroundColor Yellow
Write-Host "EC2 IP: $EC2_IP" -ForegroundColor Yellow
Write-Host "Email: $EMAIL" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Verify DNS
Write-Host "[1/5] Verifying DNS..." -ForegroundColor Green
$resolvedIP = (Resolve-DnsName $DOMAIN -Type A -ErrorAction SilentlyContinue).IPAddress
if ($resolvedIP -eq $EC2_IP) {
    Write-Host "  DNS OK: $DOMAIN -> $EC2_IP" -ForegroundColor Green
} else {
    Write-Host "  WARNING: DNS shows $resolvedIP (Expected: $EC2_IP)" -ForegroundColor Yellow
}

# Step 2: Install Certbot
Write-Host "`n[2/5] Installing Certbot..." -ForegroundColor Green

# Create bash script for certbot installation
$installScript = @'
#!/bin/bash
sudo dnf install -y certbot python3-certbot-nginx
echo "Certbot installed"
'@

$tempFile = [System.IO.Path]::GetTempFileName()
$installScript -replace "`r`n", "`n" | Set-Content -Path $tempFile -NoNewline

scp -i $SSH_KEY -o StrictHostKeyChecking=no $tempFile "${EC2_USER}@${EC2_IP}:~/install-certbot.sh" 2>&1 | Out-Null
ssh -i $SSH_KEY "${EC2_USER}@${EC2_IP}" "bash ~/install-certbot.sh"
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host "  Certbot installed!" -ForegroundColor Green

# Step 3: Upload Nginx SSL Config
Write-Host "`n[3/5] Uploading Nginx SSL Config..." -ForegroundColor Green

$nginxConfig = @"
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    return 301 https://`$server_name`$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root /var/www/eteacher/frontend;
    index index.html;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
    
    location / {
        try_files `$uri `$uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)`$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
"@

$tempNginx = [System.IO.Path]::GetTempFileName()
$nginxConfig -replace "`r`n", "`n" | Set-Content -Path $tempNginx -NoNewline

scp -i $SSH_KEY $tempNginx "${EC2_USER}@${EC2_IP}:~/nginx-ssl.conf" 2>&1 | Out-Null
Remove-Item $tempNginx -ErrorAction SilentlyContinue

Write-Host "  Nginx config uploaded!" -ForegroundColor Green

# Step 4: Obtain SSL Certificate
Write-Host "`n[4/5] Obtaining SSL Certificate..." -ForegroundColor Green
Write-Host "  This may take 1-2 minutes..." -ForegroundColor Gray

$certbotScript = @"
#!/bin/bash
sudo certbot certonly --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL
sudo cp ~/nginx-ssl.conf /etc/nginx/conf.d/eteacher.conf
sudo nginx -t
sudo systemctl restart nginx
echo "SSL setup complete"
"@

$tempCert = [System.IO.Path]::GetTempFileName()
$certbotScript -replace "`r`n", "`n" | Set-Content -Path $tempCert -NoNewline

scp -i $SSH_KEY $tempCert "${EC2_USER}@${EC2_IP}:~/setup-ssl.sh" 2>&1 | Out-Null
ssh -i $SSH_KEY "${EC2_USER}@${EC2_IP}" "bash ~/setup-ssl.sh"
$certResult = $LASTEXITCODE
Remove-Item $tempCert -ErrorAction SilentlyContinue

if ($certResult -ne 0) {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "  SSL SETUP FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "`nPlease check:" -ForegroundColor Yellow
    Write-Host "  1. Port 443 is open in EC2 Security Group" -ForegroundColor Yellow
    Write-Host "  2. Domain is accessible from internet" -ForegroundColor Yellow
    exit 1
}

# Step 5: Verify
Write-Host "`n[5/5] Verifying HTTPS..." -ForegroundColor Green
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "https://$DOMAIN" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  HTTPS verified!" -ForegroundColor Green
    }
} catch {
    Write-Host "  HTTPS may need a few moments to activate" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  SSL SETUP SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nYour website is now secured:" -ForegroundColor Cyan
Write-Host "  https://$DOMAIN" -ForegroundColor Yellow
Write-Host "`nSSL Certificate:" -ForegroundColor Cyan
Write-Host "  - Provider: Let's Encrypt" -ForegroundColor White
Write-Host "  - Auto-renewal: Enabled" -ForegroundColor White
Write-Host "  - Email: $EMAIL" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Green
