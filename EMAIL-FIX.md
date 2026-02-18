# 🔧 URGENT: Fix Email Sending

## Current Issue:
Signup takes 10+ seconds because Gmail is blocking emails.

## ✅ Quick Fix (5 minutes):

### Step 1: Get Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with: bhaliyayash595@gmail.com
3. Click "Create" → Name it "Job Portal"
4. Copy the 16-digit code (example: abcd efgh ijkl mnop)

### Step 2: Update Render
1. Go to: https://dashboard.render.com/web/srv-YOUR-SERVICE-ID
2. Click "Environment" tab
3. Find `MAIL_PASS` variable
4. Replace with: your_16_digit_code (NO SPACES!)
5. Click "Save Changes"

### Step 3: Wait & Test
- Render will auto-redeploy (2-3 min)
- Test signup → Email will send in 2 seconds! ⚡

## 🎯 What Changed:
- Added 10-second timeout (was infinite)
- User account stays even if email fails
- Faster response to user

## ⚠️ Important:
The current password `fzjrwhcpdinxzutq` is NOT an App Password.
You MUST get a new one from the link above!

---
After fix: Signup = 2-3 seconds ⚡
