const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const WaitlistEmail = require('../models/WaitlistEmail');
const { sendWaitlistEmail } = require('../services/emailService');

const router = express.Router();

const waitlistLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/waitlist',
  waitlistLimiter,
  body('email').trim().isEmail().normalizeEmail().isLength({ max: 255 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ ok: false, error: 'Please enter a valid email address.' });
    }

    const { email } = req.body;

    try {
      const existing = await WaitlistEmail.findOne({ email });
      if (existing) {
        return res.status(200).json({
          ok: true,
          alreadyOnList: true,
          message: "You're already on the list — we'll be in touch.",
        });
      }

      await WaitlistEmail.create({
        email,
        userAgent: req.get('user-agent'),
        ip: req.ip,
      });

      // Fire-and-forget — don't block the response on SMTP latency,
      // but log failures so we can debug.
      sendWaitlistEmail(email).catch((err) =>
        console.error('[waitlist] email send failed:', err.message)
      );

      return res.status(201).json({
        ok: true,
        message: "You're in. Check your inbox for confirmation.",
      });
    } catch (err) {
      console.error('[waitlist] error:', err);
      return res
        .status(500)
        .json({ ok: false, error: 'Something went wrong. Try again shortly.' });
    }
  }
);

module.exports = router;
