require('dotenv').config();
const readline = require('readline');
const transporter = require('./config/mail');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function testEmail() {
  try {
    console.log('\n📧 Testing Email Configuration...\n');
    console.log('Host:', process.env.MAIL_HOST);
    console.log('Port:', process.env.MAIL_PORT);
    console.log('User:', process.env.MAIL_USER);
    console.log('Pass:', process.env.MAIL_PASS ? '***' + process.env.MAIL_PASS.slice(-4) : 'NOT SET');
    
    const toEmail = await askQuestion('\n📧 Enter email address to send to: ');
    console.log('\n🔵 Sending test email to:', toEmail, '\n');
    
    const testToken = 'test-verification-token-12345';
    const verifyLink = `${process.env.APP_URL}/api/auth/verify-email/${testToken}`;
    
    const info = await transporter.sendMail({
      from: `"Job Portal" <${process.env.MAIL_USER}>`,
      to: toEmail,
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
    
    console.log('\n✅✅✅ EMAIL SENT SUCCESSFULLY!\n');
    console.log('Message ID:', info.messageId);
    console.log('Email sent to:', toEmail);
    console.log('\n🎉 Your email configuration is working!\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌❌❌ EMAIL FAILED!\n');
    console.error('Error:', error.message);
    console.error('\n🔴 Check your email configuration.\n');
    rl.close();
    process.exit(1);
  }
}

testEmail();
