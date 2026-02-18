require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const readline = require('readline');
const transporter = require('./config/mail');
const User = require('./models/user');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function testFullSignupFlow() {
  try {
    console.log('\n👋 Welcome to Job Portal Signup Test!');
    console.log('This will create a real user in MongoDB and send verification email.\n');

    // Get user input
    const name = await askQuestion('👤 Enter your name: ');
    const email = await askQuestion('📧 Enter your email: ');
    const password = await askQuestion('🔒 Enter your password: ');

    console.log('\n🔵 [TEST] Step 1: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ [TEST] Step 1: MongoDB connected');

    console.log('\n🔵 [TEST] Step 2: Validating input...');
    if (!name || !email || !password) {
      console.log('❌ [TEST] Step 2: All fields are required');
      rl.close();
      process.exit(1);
    }
    console.log('✅ [TEST] Step 2: Input validated:', { name, email, passwordLength: password.length });

    console.log('\n🔵 [TEST] Step 3: Checking if email exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ [TEST] Step 3: Email already registered:', email);
      console.log('   User ID:', existingUser._id);
      console.log('   Verified:', existingUser.isVerified);
      rl.close();
      await mongoose.connection.close();
      process.exit(1);
    }
    console.log('✅ [TEST] Step 3: Email is unique');

    console.log('\n🔵 [TEST] Step 4: Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ [TEST] Step 4: Password hashed successfully');

    console.log('\n🔵 [TEST] Step 5: Generating verification token...');
    const token = crypto.randomBytes(32).toString('hex');
    console.log('✅ [TEST] Step 5: Token generated:', token.substring(0, 20) + '...');

    console.log('\n🔵 [TEST] Step 6: Creating user in database...');
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: token,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
      isVerified: false
    });
    console.log('✅ [TEST] Step 6: User created successfully!');
    console.log('   User ID:', user._id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Verified:', user.isVerified);

    console.log('\n🔵 [TEST] Step 7: Creating verification link...');
    const verifyLink = `${process.env.APP_URL}/api/auth/verify-email/${token}`;
    console.log('✅ [TEST] Step 7: Verification link created');
    console.log('   Link:', verifyLink);

    console.log('\n📧 [EMAIL] Step 8: Email configuration:');
    console.log('   Host:', process.env.MAIL_HOST);
    console.log('   Port:', process.env.MAIL_PORT);
    console.log('   From:', process.env.MAIL_USER);
    console.log('   Pass:', process.env.MAIL_PASS ? '***' + process.env.MAIL_PASS.slice(-4) : 'NOT SET');
    console.log('   To:', email);

    console.log('\n📧 [EMAIL] Step 9: Sending verification email...');
    const info = await transporter.sendMail({
      from: `"Job Portal" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Job Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Welcome to Job Portal!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for signing up! Please verify your email by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">${verifyLink}</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This link expires in 24 hours.</p>
          <p style="color: #666; font-size: 12px;">If you didn't sign up for Job Portal, please ignore this email.</p>
        </div>
      `
    });
    console.log('✅ [EMAIL] Step 9: Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);

    console.log('\n🔵 [TEST] Step 10: Verifying user record in database...');
    const dbUser = await User.findById(user._id);
    console.log('✅ [TEST] Step 10: User record verified');
    console.log('   Database Record:');
    console.log('   - ID:', dbUser._id);
    console.log('   - Name:', dbUser.name);
    console.log('   - Email:', dbUser.email);
    console.log('   - Verified:', dbUser.isVerified);
    console.log('   - Has Token:', !!dbUser.verificationToken);
    console.log('   - Token Expiry:', new Date(dbUser.verificationTokenExpiry).toLocaleString());

    console.log('\n✅✅✅ [SUCCESS] Full signup flow completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ User "' + name + '" created in MongoDB');
    console.log('  ✅ Email: ' + email);
    console.log('  ✅ Password hashed and stored securely');
    console.log('  ✅ Verification token generated and saved');
    console.log('  ✅ Verification email sent successfully');
    console.log('\n🎯 Next Steps:');
    console.log('  1. Check your email inbox: ' + email);
    console.log('  2. Look for email from: ' + process.env.MAIL_USER);
    console.log('  3. Click the "Verify Email" button');
    console.log('  4. You will see "Email Verified Successfully!"');
    console.log('  5. Then you can login at: ' + process.env.APP_URL);
    console.log('\n📧 Note: Check spam folder if email not in inbox!');
    
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌❌❌ [ERROR] Test failed!');
    console.error('Error message:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    
    if (error.message.includes('Invalid login') || error.message.includes('535')) {
      console.error('\n🔴 EMAIL ERROR: Gmail App Password is invalid!');
      console.error('Solution:');
      console.error('1. Go to: https://myaccount.google.com/apppasswords');
      console.error('2. Generate new App Password');
      console.error('3. Update MAIL_PASS in .env file');
      console.error('4. Update MAIL_PASS on Render.com');
    }
    
    rl.close();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

console.log('🚀 Starting Job Portal Signup Test...\n');
testFullSignupFlow();

