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

    const verifyLink = `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/verify-email/${token}`;
    console.log('🔵 [SIGNUP] Step 7: Verification link created:', verifyLink);

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
      subject: 'Verify Your Email - Job Portal',
      html: `
        <h2>Welcome to Job Portal!</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyLink}" style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Verify Email</a>
        <p>Or copy this link: ${verifyLink}</p>
        <p>This link expires in 24 hours.</p>
      `
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 10000)
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
    console.log('🔵 [VERIFY] Current time:', new Date().toISOString());

    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      console.log('❌ [VERIFY] No user found with this token');
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1 class="error">Verification Failed</h1>
          <p>Invalid token</p>
          <a href="${process.env.APP_URL || 'http://localhost:5000'}">Go to Home</a>
        </body>
        </html>
      `);
    }

    console.log('✅ [VERIFY] User found:', user.email);
    console.log('🔵 [VERIFY] Token expiry:', new Date(user.verificationTokenExpiry).toISOString());
    console.log('🔵 [VERIFY] Time remaining:', Math.floor((user.verificationTokenExpiry - Date.now()) / 1000 / 60), 'minutes');

    if (user.verificationTokenExpiry && user.verificationTokenExpiry < Date.now()) {
      console.log('❌ [VERIFY] Token expired');
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1 class="error">Verification Failed</h1>
          <p>Token expired. Please signup again.</p>
          <a href="${process.env.APP_URL || 'http://localhost:5000'}">Go to Home</a>
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
      <html>
      <head>
        <title>Email Verified</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; }
          .success { color: green; }
          .btn { background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1 class="success">✅ Email Verified Successfully!</h1>
        <p>Your account has been verified. You can now login.</p>
        <a href="${process.env.APP_URL || 'http://localhost:5000'}" class="btn">Go to Login</a>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('❌ [VERIFY] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const token = crypto.randomBytes(32).toString("hex");

//     const user = new User({
//       name,
//       email,
//       password,
//       verificationToken: token,
//       verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000
//     });

//     await user.save();

//     const verifyURL = `${process.env.BASE_URL}/api/auth/verify-email/${token}`;

//     await transporter.sendMail({
//       to: email,
//       subject: "Verify Your Email",
//       html: `
//         <h2>Email Verification</h2>
//         <a href="${verifyURL}">Click here to verify</a>
//       `
//     });

//     res.status(201).json({ message: "Verification email sent" });

//   } catch (error) {
//     res.status(400).json({ message: "Signup failed" });
//   }
// };


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
      return res.status(401).json({ error: 'Please verify your email first' });
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
