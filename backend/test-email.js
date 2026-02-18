require('dotenv').config();
const transporter = require('./config/mail');

async function testEmail() {
  try {
    console.log('Testing email with:');
    console.log('Host:', process.env.MAIL_HOST);
    console.log('Port:', process.env.MAIL_PORT);
    console.log('User:', process.env.MAIL_USER);
    console.log('Pass:', process.env.MAIL_PASS ? '***' + process.env.MAIL_PASS.slice(-4) : 'NOT SET');
    
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
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    process.exit(0);
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    process.exit(1);
  }
}

testEmail();

