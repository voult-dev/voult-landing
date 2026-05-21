// Same transport setup as the main voult.dev repo (config/mailer.js).
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
  ...(process.env.NODE_ENV === 'production' && {
    tls: { rejectUnauthorized: true },
  }),
});

module.exports = { transporter };
