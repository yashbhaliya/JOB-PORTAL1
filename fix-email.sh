#!/bin/bash
# Email Fix Script for Job Portal

echo "🔧 Job Portal - Email Fix Script"
echo "=================================="
echo ""

# Check if new password is provided
if [ -z "$1" ]; then
    echo "❌ ERROR: Gmail App Password not provided"
    echo ""
    echo "📋 INSTRUCTIONS:"
    echo ""
    echo "1. Generate Gmail App Password:"
    echo "   → Open: https://myaccount.google.com/apppasswords"
    echo "   → Login: bhaliyayash595@gmail.com"
    echo "   → App: Mail | Device: Other → 'JobPortal2024'"
    echo "   → Click Generate"
    echo "   → Copy 16-digit code (remove spaces)"
    echo ""
    echo "2. Run this script with your new password:"
    echo "   bash fix-email.sh YOUR_16_DIGIT_PASSWORD"
    echo ""
    echo "Example:"
    echo "   bash fix-email.sh abcdefghijklmnop"
    echo ""
    exit 1
fi

NEW_PASSWORD=$1

echo "✅ New password received: ***${NEW_PASSWORD: -4}"
echo ""

# Update .env file
echo "📝 Updating backend/.env file..."
cd backend
sed -i "s/MAIL_PASS=.*/MAIL_PASS=$NEW_PASSWORD/" .env
echo "✅ Local .env updated"
echo ""

# Test email
echo "🧪 Testing email configuration..."
node test-email.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅✅✅ SUCCESS! Email is working!"
    echo ""
    echo "📋 NEXT STEPS:"
    echo ""
    echo "1. Update Render.com:"
    echo "   → Go to: https://dashboard.render.com"
    echo "   → Click: job-portal1-rcvc"
    echo "   → Click: Environment tab"
    echo "   → Edit MAIL_PASS"
    echo "   → Paste: $NEW_PASSWORD"
    echo "   → Click: Save Changes"
    echo ""
    echo "2. Wait 2-3 minutes for Render to redeploy"
    echo ""
    echo "3. Test your live site:"
    echo "   → https://job-portal1-rcvc.onrender.com"
    echo ""
    echo "🎉 Your authentication system is now fully working!"
else
    echo ""
    echo "❌ Email test failed. Please check:"
    echo "   1. Password is correct (16 digits, no spaces)"
    echo "   2. 2-Step Verification is enabled on Gmail"
    echo "   3. App Password was just generated"
    echo ""
fi
