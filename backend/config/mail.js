const nodemailer = require('nodemailer');

console.log('📧 [MAIL CONFIG] Initializing email transporter...');
console.log('📧 [MAIL CONFIG] Host:', process.env.MAIL_HOST || 'smtp.gmail.com');
console.log('📧 [MAIL CONFIG] Port:', process.env.MAIL_PORT || 587);
console.log('📧 [MAIL CONFIG] User:', process.env.MAIL_USER);
console.log('📧 [MAIL CONFIG] Pass:', process.env.MAIL_PASS ? '***' + process.env.MAIL_PASS.slice(-4) : 'NOT SET');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('✅ [MAIL CONFIG] Transporter created successfully');

module.exports = transporter;
