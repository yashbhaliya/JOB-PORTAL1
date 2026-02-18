const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mail');

exports.signup = async (req, res) => {
  console.log('🔵 [SIGNUP] Step 1: Request received');
  try {
    const { name, email, password } = req.body;
    console.log('🔵 [SIGNUP] Step 2: Data extracted:', { name, email, passwordLength: password?.length });

    if (!name || !email || !password) {
      console.log('❌ [SIGNUP] Step 3: Validation failed - missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }
    console.log('✅ [SIGNUP] Step 3: Validation passed');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ [SIGNUP] Step 4: Email already exists:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.log('✅ [SIGNUP] Step 4: Email is unique');

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');
    console.log('✅ [SIGNUP] Step 5: Password hashed, token generated:', token.substring(0, 10) + '...');

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: token,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
      isVerified: false
    });
    console.log('✅ [SIGNUP] Step 6: User created in DB:', user._id);

    const verificationLink = `${process.env.APP_URL}/verify/${token}`;
    console.log('🔵 [SIGNUP] Step 7: Verification link created:', verificationLink);

    console.log('📧 [EMAIL] Step 8: Attempting to send email...');
    console.log('📧 [EMAIL] Config:', {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS ? '***' + process.env.MAIL_PASS.slice(-4) : 'NOT SET'
    });

    const emailPromise = transporter.sendMail({
      from: `"Job Portal" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your account:</p>
        <a href="${verificationLink}" 
           style="padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;">
           Verify Account
        </a>
      `
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 30000)
    );

    try {
      console.log('📧 [EMAIL] Step 9: Sending email to:', email);
      await Promise.race([emailPromise, timeoutPromise]);
      console.log('✅ [EMAIL] Step 10: Email sent successfully to:', email);
      res.json({ message: 'Verification email sent. Please check your inbox.' });
    } catch (mailError) {
      console.error('❌ [EMAIL] Step 10: Email sending failed:', mailError.message);
      console.error('❌ [EMAIL] Full error:', mailError);
      res.json({ 
        message: 'Account created! Email verification failed. Please contact support to verify your account.',
        warning: 'Email service unavailable'
      });
    }
  } catch (err) {
    console.error('❌ [SIGNUP] Fatal error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;
    console.log('🔵 [VERIFY] Token received:', token.substring(0, 10) + '...');

    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      console.log('❌ [VERIFY] No user found with this token');
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
            .error { color: red; font-size: 24px; margin: 20px 0; }
            .btn { background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <h1 class="error">❌ Verification Failed</h1>
          <p>Invalid verification token</p>
          <a href="/home.html" class="btn">Go to Home</a>
        </body>
        </html>
      `);
    }

    if (user.verificationTokenExpiry && user.verificationTokenExpiry < Date.now()) {
      console.log('❌ [VERIFY] Token expired');
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
            .error { color: red; font-size: 24px; margin: 20px 0; }
            .btn { background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <h1 class="error">❌ Verification Failed</h1>
          <p>Token expired. Please signup again.</p>
          <a href="/home.html" class="btn">Go to Home</a>
        </body>
        </html>
      `);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    console.log('✅ [VERIFY] User verified successfully');

    res.send(`
     <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verified - Job Portal</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Segoe UI", Tahoma, sans-serif;
    }
    body {
      overflow: hidden;
    }
    /* Hero Section */
    .hero {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 60px 22px;
      gap: 60px;
      min-height: 100vh;
      overflow: hidden;
    }
    .hero .img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    .hero .img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(3px);
    }
    .hero-left {
      flex: 1;
      position: relative;
      z-index: 2;
    }
    .hero-left h1 {
      font-size: 48px;
      font-weight: 700;
      color: white;
      line-height: 1.2;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .hero-left p {
      font-size: 18px;
      color: #FFFFFF;
      line-height: 1.6;
      max-width: 500px;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    }
    .hero-right {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      z-index: 2;
    }
    .orbit {
      width: 300px;
      height: 300px;
      border: 2px dashed black;
      border-radius: 50%;
      position: relative;
      animation: rotate 20s linear infinite;
    }
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .job-tag {
      position: absolute;
      background: black;
      color: white;
      padding: 12px 16px;
      border-radius: 50px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 160px;
      animation: float 3s ease-in-out infinite;
    }
    .job-tag .icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .job-tag .purple { background: #8b5cf6; }
    .job-tag .yellow { background: #fbbf24; }
    .job-tag .violet { background: #a855f7; }
    .job-tag .blue { background: #3b82f6; }
    .job-tag strong {
      font-size: 14px;
      color: white;
      display: block;
    }
    .job-tag small {
      font-size: 12px;
      color: #d1d5db;
    }
    .tag1 { top: 40px; right:150px; animation-delay: 0s; }
    .tag2 { top: 100px; left:100px; animation-delay: 0.5s; }
    .tag3 { bottom: 100px; right: 80px; animation-delay: 1s; }
    .tag4 { bottom: 40px; left: 150px; animation-delay: 1.5s; }
    
    /* Verify Overlay */
    .verify-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .verify-container {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 500px;
      width: 90%;
      animation: slideIn 0.5s ease;
    }
    @keyframes slideIn {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .success-icon {
      width: 80px;
      height: 80px;
      background: #4CAF50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 50px;
      color: white;
    }
    .verify-container h1 {
      color: #4CAF50;
      margin-bottom: 15px;
      font-size: 28px;
    }
    .verify-container p {
      color: #666;
      margin-bottom: 30px;
      font-size: 16px;
      line-height: 1.6;
    }
    .verify-btn {
      background: #4CAF50;
      color: white;
      padding: 15px 40px;
      border: none;
      border-radius: 5px;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
    }
    .verify-btn:hover {
      background: #45a049;
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero {
        flex-direction: column;
        padding: 30px 15px;
      }
      .hero-left {
        text-align: center;
      }
      .hero-left h1 {
        font-size: 32px;
      }
      .hero-left p {
        font-size: 16px;
        margin: 0 auto;
      }
      .hero-right {
        display: none;
      }
    }
  </style>
</head>
<body>
  <section class="hero">
    <div class="img">
      <img src="/JOB2-main/img/job-search.jpg" alt="">
    </div>
    <div class="hero-left">
      <h1>Smarter Careers<br>Start in Tech</h1>
      <p>
        Smarter careers start in tech where innovation
        meets opportunity. Find roles that grow with your
        skills and ambition.
      </p>
    </div>

    <div class="hero-right">
      <div class="orbit"></div>

      <div class="job-tag tag1">
        <span class="icon purple">💉</span>
        <div>
          <strong>Data Analyst</strong>
          <small>Nairobi</small>
        </div>
      </div>

      <div class="job-tag tag2">
        <span class="icon yellow">🛡️</span>
        <div>
          <strong>QA Engineer</strong>
          <small>Basel</small>
        </div>
      </div>

      <div class="job-tag tag3">
        <span class="icon violet">✔</span>
        <div>
          <strong>Cyber Security</strong>
          <small>Aiken</small>
        </div>
      </div>

      <div class="job-tag tag4">
        <span class="icon blue">🎓</span>
        <div>
          <strong>UI / UX Designer</strong>
          <small>Vertigo</small>
        </div>
      </div>
    </div>
  </section>

  <div class="verify-overlay" id="verifyOverlay">
    <div class="verify-container">
      <div class="success-icon">✓</div>
      <h1>Email Verified Successfully!</h1>
      <p>Your account has been verified. You can now login and start exploring job opportunities.</p>
      <button class="verify-btn" onclick="closeVerifyModal()">Go to Home</button>
    </div>
  </div>

  <script>
    function closeVerifyModal() {
      window.location.href = '/home.html';
    }
  </script>
</body>
</html>
    `);
  } catch (err) {
    console.error('❌ [VERIFY] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email first',
        needsVerification: true 
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login success',
      token: token,
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.APP_URL || 'https://job-portal-8aak.onrender.com'}/reset-password.html?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`
    });

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: err.message });
  }
};
