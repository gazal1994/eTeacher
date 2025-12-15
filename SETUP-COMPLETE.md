# Quick Setup Guide for Your EC2 Deployment

## ✅ EC2 Instance Setup - COMPLETE!

Your EC2 instance is now configured and ready for deployment.

## 📋 GitHub Secrets Configuration

To enable automatic deployment, you need to add three secrets to your GitHub repository:

### Step 1: Go to GitHub Secrets
Open this URL in your browser:
```
https://github.com/gazal1994/eTeacher/settings/secrets/actions
```

### Step 2: Add the Following Secrets

Click "New repository secret" and add each of these:

#### Secret 1: EC2_SSH_PRIVATE_KEY
**Name:** `EC2_SSH_PRIVATE_KEY`
**Value:** Copy the entire content of your KEY.pem file from:
```
C:\Users\windows11\Desktop\keys\KEY.pem
```

To get the content in PowerShell:
```powershell
Get-Content "C:\Users\windows11\Desktop\keys\KEY.pem" | clip
```
(This copies it to your clipboard)

Or use Notepad:
```powershell
notepad "C:\Users\windows11\Desktop\keys\KEY.pem"
```

**Important:** Copy the ENTIRE file including:
```
-----BEGIN RSA PRIVATE KEY-----
...all the lines...
-----END RSA PRIVATE KEY-----
```

#### Secret 2: EC2_HOST
**Name:** `EC2_HOST`
**Value:** `16.16.185.220`

#### Secret 3: EC2_USER
**Name:** `EC2_USER`
**Value:** `ec2-user`

## 🔐 EC2 Security Group Configuration

Make sure your EC2 Security Group allows these ports:

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH access |
| 80 | TCP | 0.0.0.0/0 | HTTP (Frontend & API) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (optional) |
| 5000 | TCP | 0.0.0.0/0 | Backend API (direct access) |

To configure:
1. Go to AWS EC2 Console
2. Select your instance
3. Click "Security" tab
4. Click the security group link
5. Edit "Inbound rules"
6. Add/verify the above rules

## 🚀 Deploy Your Application

Once GitHub secrets are configured, simply push to GitHub:

```powershell
git add .
git commit -m "Trigger deployment"
git push origin master
```

The GitHub Actions workflow will:
1. Build your backend (.NET)
2. Build your frontend (React)
3. Deploy to EC2
4. Start the services
5. Verify deployment

## 📊 Monitor Deployment

1. Watch the deployment progress:
   ```
   https://github.com/gazal1994/eTeacher/actions
   ```

2. View backend logs on EC2:
   ```bash
   ssh -i "C:\Users\windows11\Desktop\keys\KEY.pem" ec2-user@16.16.185.220
   sudo journalctl -u eteacher-backend -f
   ```

3. View nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   ```

## 🌐 Access Your Application

After successful deployment:

- **Frontend:** http://16.16.185.220
- **Backend API:** http://16.16.185.220/api/courses
- **Direct Backend:** http://16.16.185.220:5000/api/courses

## 🔧 Troubleshooting

### Deployment fails?
- Check GitHub Actions logs
- Verify all secrets are correctly configured
- Ensure EC2 security group allows required ports

### Services not starting?
SSH into EC2 and check:
```bash
sudo systemctl status eteacher-backend
sudo systemctl status nginx
sudo journalctl -u eteacher-backend -n 50
```

### Can't access the application?
- Verify EC2 security group settings
- Check if services are running: `sudo systemctl status nginx`
- Try accessing backend directly: http://16.16.185.220:5000/api/courses

## 📝 Next Steps

1. ✅ EC2 is configured
2. ⏳ Add GitHub secrets (instructions above)
3. ⏳ Configure EC2 security group
4. ⏳ Push to GitHub to trigger deployment
5. ⏳ Access your application!

---

**Your EC2 Instance Details:**
- **IP:** 16.16.185.220
- **User:** ec2-user
- **Key:** C:\Users\windows11\Desktop\keys\KEY.pem
- **Region:** eu-north-1 (Stockholm)
