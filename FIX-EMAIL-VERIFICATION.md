# 🔧 Fix Verification Email Not Sending

## Problem:
Gmail is blocking emails because you're using regular password instead of App Password.

## ✅ Solution (Follow Exactly):

### Step 1: Enable 2-Step Verification (If not enabled)
1. Go to: https://myaccount.google.com/security
2. Find "2-Step Verification"
3. Click "Get Started" and follow steps
4. **This is REQUIRED for App Passwords**

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with: bhaliyayash595@gmail.com
3. You'll see "App passwords" page
4. Select app: **Mail**
5. Select device: **Other (Custom name)**
6. Type: **Job Portal**
7. Click **Generate**
8. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)
9. **Remove all spaces**: `abcdefghijklmnop`

### Step 3: Update Render Environment
1. Go to: https://dashboard.render.com
2. Find your service: **job-portal1-rcvc**
3. Click on it
4. Go to **Environment** tab (left sidebar)
5. Find `MAIL_PASS` variable
6. Click **Edit**
7. Replace `fzjrwhcpdinxzutq` with your new 16-digit code
8. Click **Save Changes**

### Step 4: Verify Other Variables
Make sure these are correct:
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=bhaliyayash595@gmail.com
MAIL_PASS=your_new_16_digit_app_password
APP_URL=https://job-portal1-rcvc.onrender.com
```

⚠️ Remove trailing slash from APP_URL if present!

### Step 5: Redeploy
1. Render will auto-redeploy (takes 2-3 minutes)
2. Watch the logs for "Verification email sent"

### Step 6: Test
1. Go to: https://job-portal1-rcvc.onrender.com
2. Click "Sign Up"
3. Fill form and submit
4. Check email inbox (including spam folder)
5. Click verification link
6. See success message
7. Login!

## 🐛 Troubleshooting:

### Still not receiving email?
1. **Check spam folder**
2. **Verify App Password** has no spaces
3. **Check Render logs** for errors:
   - Go to Render Dashboard
   - Click "Logs" tab
   - Look for "Email sending failed" message

### Email timeout error?
- App Password is wrong
- 2-Step Verification not enabled
- Gmail account locked

### Alternative: Use Different Email Service
If Gmail doesn't work, use SendGrid (free tier):
1. Sign up: https://sendgrid.com
2. Get API key
3. Update mail config to use SendGrid

## ✅ Success Indicators:
- Signup completes in 2-3 seconds
- Message: "Verification email sent"
- Email arrives within 1 minute
- Verification link works
- Can login after verification

---
**Time to fix**: 5 minutes
**Difficulty**: Easy ⭐⭐☆☆☆
