const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter;

function isMailConfigured() {
  return Boolean(env.smtpUser && env.smtpPass);
}

function getTransporter() {
  if (!isMailConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }

  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  if (!to) {
    console.warn("[mail] Skipped: missing recipient");
    return { skipped: true, reason: "missing_recipient" };
  }

  const transport = getTransporter();
  if (!transport) {
    console.warn(
      "[mail] Skipped: SMTP not configured. Set SMTP_USER and SMTP_PASS in .env",
    );
    return { skipped: true, reason: "not_configured" };
  }

  const info = await transport.sendMail({
    from: env.mailFrom,
    to,
    subject,
    text,
    html,
  });

  return { skipped: false, messageId: info.messageId };
}

async function sendWelcomeEmail(user) {
  const name = user.name || "there";
  const subject = "Welcome to CARPE DIEM";
  const text = `Hi ${name},\n\nYour account has been created successfully. Welcome to CARPE DIEM!\n\nPhone: ${user.phone || "-"}\nEmail: ${user.email || "-"}\n\nThanks for joining us.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
      <h2 style="margin-bottom: 8px;">Welcome to CARPE DIEM</h2>
      <p>Hi ${name},</p>
      <p>Your account has been created successfully. We're glad to have you with us.</p>
      <p><strong>Phone:</strong> ${user.phone || "-"}<br/>
      <strong>Email:</strong> ${user.email || "-"}</p>
      <p>Start exploring products and events on our store.</p>
      <p style="margin-top: 24px;">— Team CARPE DIEM</p>
    </div>
  `;

  return sendMail({ to: user.email, subject, html, text });
}

module.exports = {
  isMailConfigured,
  sendMail,
  sendWelcomeEmail,
};
