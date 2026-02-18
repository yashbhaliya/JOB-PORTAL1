# 🚀 Render Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Changes Made:
1. ✓ config.js - Dynamic API URL
2. ✓ auth.controller.js - Dynamic verification links
3. ✓ .gitignore - Exclude sensitive files

## 🔧 Render Setup Steps

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Push Code to GitHub
```bash
cd c:\Users\Admin\Downloads\JOB2-main\JOB2-main
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 3: Create Web Service on Render
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: job-portal
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 4: Add Environment Variables
In Render Dashboard → Environment:

```
MONGO_URI=mongodb+srv://admin:admin@cluster0.6cj2rkn.mongodb.net/jobPortal?retryWrites=true&w=majority
JWT_SECRET=supersecretkey
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=bhaliyayash595@gmail.com
MAIL_PASS=fzjrwhcpdinxzutq
APP_URL=https://YOUR-APP-NAME.onrender.com
```

⚠️ **IMPORTANT**: Replace `YOUR-APP-NAME` with your actual Render app name!

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Your app will be live at: `https://YOUR-APP-NAME.onrender.com`

## 🔒 Security Recommendations

### Before Going Live:
1. **Change MongoDB Password**:
   - Go to MongoDB Atlas
   - Database Access → Edit User
   - Change password from "admin"

2. **Change JWT Secret**:
   ```
   JWT_SECRET=use_a_long_random_string_here_at_least_32_characters
   ```

3. **Gmail App Password**:
   - Get from: https://myaccount.google.com/apppasswords
   - Replace `MAIL_PASS` with 16-digit app password

## 📊 Cost Analysis

### Render Free Tier:
- ✅ 750 hours/month (enough for 1 app)
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start: 30-60 seconds

### MongoDB Atlas Free Tier:
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ Enough for ~1000 users

### Total Cost: **$0/month** 🎉

## 🐛 Common Issues & Fixes

### Issue 1: App not loading
**Fix**: Check Render logs for errors

### Issue 2: Database connection failed
**Fix**: Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access

### Issue 3: Email not sending
**Fix**: Use Gmail App Password, not regular password

### Issue 4: Images not loading
**Fix**: Already fixed with `/JOB2-main/img/` paths

## 📱 After Deployment

### Test These Features:
1. ✓ Homepage loads
2. ✓ Images display
3. ✓ Job listings show
4. ✓ Signup sends email
5. ✓ Email verification works
6. ✓ Login works
7. ✓ Profile page works

## 🔄 Update Deployment

After making changes:
```bash
git add .
git commit -m "Your changes"
git push
```
Render auto-deploys in 2-3 minutes!

## 📞 Support

If deployment fails:
1. Check Render logs
2. Verify environment variables
3. Test MongoDB connection
4. Check Gmail settings

---
**Deployment Time**: ~15 minutes
**Difficulty**: Easy ⭐⭐☆☆☆
