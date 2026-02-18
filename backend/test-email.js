require('dotenv').config();
const transporter = require('./config/mail');

async function testEmail() {
  try {
    console.log('\n📧 Testing Email Configuration...\n');
    console.log('Host:', process.env.MAIL_HOST);
    console.log('Port:', process.env.MAIL_PORT);
    console.log('User:', process.env.MAIL_USER);
    console.log('Pass:', process.env.MAIL_PASS ? '***' + process.env.MAIL_PASS.slice(-4) : 'NOT SET');
    console.log('\n🔵 Sending test email...\n');
    
    const testToken = 'test-verification-token-12345';
    const verifyLink = `${process.env.APP_URL}/api/auth/verify-email/${testToken}`;
    
    const info = await transporter.sendMail({
      from: `"Job Portal" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: 'Verify Your Email - Job Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Welcome to Job Portal!</h2>
          <p>Hi there,</p>
          <p>Please verify your email by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
          </div>
          <p>Or copy this link:</p>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">${verifyLink}</p>
          <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
      `
    });
    
    console.log('✅✅✅ EMAIL SENT SUCCESSFULLY!\n');
    console.log('Message ID:', info.messageId);
    console.log('Email sent to:', process.env.MAIL_USER);
    console.log('\n🎉 Your email configuration is working!\n');
    console.log('📋 NEXT STEPS:');
    console.log('1. Update Render.com with password: hnbaycdawqqopjow');
    console.log('2. Go to: https://dashboard.render.com');
    console.log('3. Click: job-portal1-rcvc → Environment');
    console.log('4. Edit MAIL_PASS → Paste: hnbaycdawqqopjow');
    console.log('5. Save Changes → Wait 2-3 minutes');
    console.log('6. Test: https://job-portal1-rcvc.onrender.com\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌❌❌ EMAIL FAILED!\n');
    console.error('Error:', error.message);
    console.error('\n🔴 The password is still invalid.');
    console.error('Generate a NEW App Password at:');
    console.error('https://myaccount.google.com/apppasswords\n');
    process.exit(1);
  }
}

testEmail();
