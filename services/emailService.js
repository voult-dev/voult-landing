// Follows the same pattern as voult/services/emailService.js
const { transporter } = require('../config/mailer');

const FROM = process.env.MAIL_FROM || '"voult.dev" <olabodeoluwapelumi838@gmail.com>';

/**
 * Send a "You're on the waitlist" confirmation to a developer who just
 * dropped their email on the landing page.
 */
module.exports.sendWaitlistEmail = async (to) => {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: "You're on the voult.dev waitlist 🔐",
    html: `
<div style="font-family: Inter, Arial, sans-serif; padding: 24px; background: #0b0f14;">
  <div style="max-width: 600px; margin: auto; background: #111827; padding: 32px; border-radius: 12px; border: 1px solid #1f2937;">

    <h1 style="color: #e5e7eb; margin: 0 0 8px; font-size: 22px;">
      Welcome to the voult.dev waitlist 👋
    </h1>

    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 24px;">
      Authentication, done properly — for developers, by a developer.
    </p>

    <p style="font-size: 15px; color: #e5e7eb; line-height: 1.6;">
      Thanks for signing up. You're officially on the list to get early access
      to <strong style="color:#6366f1;">voult.dev</strong> — a developer-first
      authentication platform with secure APIs, lightweight SDKs, OAuth,
      magic links, pre-built UI kits, and a rich developer dashboard.
    </p>

    <p style="font-size: 15px; color: #e5e7eb; line-height: 1.6;">
      When we launch, the entire MVP will be <strong>completely free</strong>
      — no credit card, no trial games. You'll be the first to know.
    </p>

    <div style="margin: 28px 0;">
      <a href="https://github.com/DevOlabode/voult"
        style="display:inline-block; background:#6366f1; color:#fff; padding:12px 20px;
               text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">
        Star us on GitHub
      </a>
    </div>

    <hr style="border:none; border-top:1px solid #1f2937; margin:24px 0;" />

    <p style="font-size: 12px; color: #6b7280;">
      You're receiving this because you signed up at voult.dev's pre-launch page.
      If that wasn't you, you can safely ignore this email.
    </p>
    <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">— The voult.dev team</p>
  </div>
</div>
    `,
  });
};
