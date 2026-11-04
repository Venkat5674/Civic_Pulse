const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

let transporter = null;
let etherealAccount = null;

/**
 * Initializes and returns the active nodemailer transporter.
 * Falls back to an Ethereal test account if SMTP is not configured.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const isSmtpConfigured = Boolean(env.EMAIL.HOST && env.EMAIL.USER);

  if (isSmtpConfigured) {
    transporter = nodemailer.createTransport({
      host: env.EMAIL.HOST,
      port: env.EMAIL.PORT || 587,
      secure: env.EMAIL.SECURE || false,
      auth: {
        user: env.EMAIL.USER,
        pass: env.EMAIL.PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    logger.info(`📧 Email service configured with SMTP: ${env.EMAIL.HOST}:${env.EMAIL.PORT}`);
  } else {
    try {
      if (!etherealAccount) {
        etherealAccount = await Promise.race([
          nodemailer.createTestAccount(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Ethereal setup timed out')), 2500)),
        ]);
      }
      transporter = nodemailer.createTransport({
        host: etherealAccount.smtp.host,
        port: etherealAccount.smtp.port,
        secure: etherealAccount.smtp.secure,
        auth: {
          user: etherealAccount.user,
          pass: etherealAccount.pass,
        },
      });
      logger.info(`📧 SMTP not configured. Using Ethereal test account: ${etherealAccount.user}`);
    } catch (testErr) {
      logger.info(`📧 SMTP not configured. Running in development email logger mode.`);
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
}

/**
 * Common HTML email wrapper template with CivicPulse branding
 */
function getEmailWrapper({ title, badgeText, badgeColor = '#6366f1', contentHtml }) {
  const clientUrl = env.CLIENT_URL || 'http://localhost:3000';
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(255,255,255,0.2); margin-top: 10px; color: #ffffff; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .info-box { background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); }
    .footer { background: #f8fafc; padding: 24px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #6366f1; text-decoration: none; font-weight: 600; }
    .meta-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .meta-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .meta-table td.label { font-weight: 600; color: #475569; width: 35%; }
    .meta-table td.val { color: #0f172a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CivicPulse</h1>
      <p>Role-Based Civic Issue Reporting & Resolution</p>
      ${badgeText ? `<div class="badge" style="background:${badgeColor}">${badgeText}</div>` : ''}
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">CivicPulse Municipal Platform &copy; ${new Date().getFullYear()}</p>
      <p style="margin: 0;">Empowering citizens and municipal authorities to build better communities together.</p>
      <p style="margin: 10px 0 0 0;"><a href="${clientUrl}" target="_blank">Visit CivicPulse Web Portal</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Sends a generic email with error resilience
 */
async function sendMail({ to, subject, html, text }) {
  try {
    const mailer = await getTransporter();
    const fromAddress = env.EMAIL.FROM || '"CivicPulse" <notifications@civicpulse.org>';

    const info = await mailer.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || subject,
      html,
    });

    logger.info(`📨 Email sent to ${to} | Subject: "${subject}" | MessageID: ${info.messageId}`);

    // If using Ethereal test account, log the web preview link for easy testing!
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`🔗 Ethereal Email Preview URL: ${previewUrl}`);
      console.log(`\n======================================================`);
      console.log(`📧 [EMAIL PREVIEW LINK]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Preview: ${previewUrl}`);
      console.log(`======================================================\n`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    logger.error({ error, to, subject }, 'Failed to dispatch email notification');
    // Non-blocking: we return false so caller does not crash
    return { success: false, error: error.message };
  }
}

/**
 * 1. Welcome Email
 * Dispatched when a citizen or user registers an account.
 */
async function sendWelcomeEmail({ to, name, role = 'CITIZEN' }) {
  const clientUrl = env.CLIENT_URL || 'http://localhost:3000';
  const subject = `Welcome to CivicPulse, ${name || 'Citizen'}! 🎉`;

  const contentHtml = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Welcome to CivicPulse! 👋</h2>
    <p>Hello <strong>${name || 'Citizen'}</strong>,</p>
    <p>Thank you for joining <strong>CivicPulse</strong>. Your account has been registered with role <strong>${role}</strong>.</p>
    
    <div class="info-box">
      <strong>Here is what you can do on CivicPulse:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>📍 <strong>Report civic issues</strong> in your neighborhood (potholes, streetlights, garbage, water leaks).</li>
        <li>📸 <strong>Upload evidence & location</strong> with automatic priority scoring and duplicate detection.</li>
        <li>🔔 <strong>Track live status</strong> as municipal teams investigate and resolve your reports.</li>
        <li>👍 <strong>Confirm community issues</strong> to increase visibility and speed up municipal action.</li>
      </ul>
    </div>

    <div class="button-container">
      <a href="${clientUrl}/dashboard" class="button" target="_blank">Access Your Dashboard &rarr;</a>
    </div>

    <p style="font-size: 13px; color: #64748b;">If you have any questions or need assistance, simply reply to this email or visit our help center.</p>
  `;

  const html = getEmailWrapper({
    title: subject,
    badgeText: 'New Account Created',
    badgeColor: '#10b981',
    contentHtml,
  });

  return sendMail({ to, subject, html });
}

/**
 * 2. Password Reset / Change Password Link Email
 * Dispatched when a user requests to change or reset their password.
 */
async function sendPasswordResetEmail({ to, name, token }) {
  const clientUrl = env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = `Password Reset Request - CivicPulse 🔐`;

  const contentHtml = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Reset Your Password 🔐</h2>
    <p>Hello <strong>${name || 'Citizen'}</strong>,</p>
    <p>We received a request to change or reset the password for your CivicPulse account linked to <strong>${to}</strong>.</p>
    
    <p>Click the button below to choose a secure new password. This recovery link is valid for <strong>1 hour</strong>.</p>

    <div class="button-container">
      <a href="${resetUrl}" class="button" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);">
        Change / Reset Password &rarr;
      </a>
    </div>

    <div class="info-box" style="border-left-color: #f59e0b; background: #fffbeb;">
      <strong>Security Notice:</strong>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #92400e;">
        If you did not request this password change, you can safely ignore this email. Your current password remains secure and will not change.
      </p>
    </div>

    <p style="font-size: 12px; color: #64748b; word-break: break-all;">
      Or copy and paste this link in your browser:<br/>
      <a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a>
    </p>
  `;

  const html = getEmailWrapper({
    title: subject,
    badgeText: 'Password Recovery',
    badgeColor: '#f59e0b',
    contentHtml,
  });

  return sendMail({ to, subject, html });
}

/**
 * 3. Issue Resolved (Solved) Email
 * Dispatched when an administrator or municipal department resolves a citizen's issue.
 */
async function sendIssueResolvedEmail({ to, userName, issue, note }) {
  const clientUrl = env.CLIENT_URL || 'http://localhost:3000';
  const issueUrl = `${clientUrl}/issues/${issue.id}`;
  const subject = `✅ Issue Resolved: "${issue.title}"`;

  const categoryName = issue.category?.name || 'General Civic Issue';
  const resolvedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const contentHtml = `
    <h2 style="font-size: 20px; font-weight: 700; color: #047857; margin-top: 0;">Good News! Your Reported Issue Has Been Resolved 🎉</h2>
    <p>Hello <strong>${userName || 'Citizen'}</strong>,</p>
    <p>The municipal authority has reviewed and <strong>successfully resolved</strong> the civic issue you reported.</p>

    <table class="meta-table">
      <tr>
        <td class="label">Issue Title:</td>
        <td class="val"><strong>${issue.title}</strong></td>
      </tr>
      <tr>
        <td class="label">Category:</td>
        <td class="val">${categoryName}</td>
      </tr>
      <tr>
        <td class="label">Location:</td>
        <td class="val">${issue.address || 'Reported Location'}</td>
      </tr>
      <tr>
        <td class="label">Resolved On:</td>
        <td class="val">${resolvedDate}</td>
      </tr>
      ${note ? `
      <tr>
        <td class="label">Municipal Note:</td>
        <td class="val" style="color: #047857; font-weight: 600;">${note}</td>
      </tr>
      ` : ''}
    </table>

    <div class="button-container">
      <a href="${issueUrl}" class="button" target="_blank" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%);">
        View Resolved Issue Details &rarr;
      </a>
    </div>

    <p style="font-size: 13px; color: #475569;">
      Thank you for being an active citizen and helping keep our city clean, safe, and functional.
    </p>
  `;

  const html = getEmailWrapper({
    title: subject,
    badgeText: 'Issue Resolved',
    badgeColor: '#10b981',
    contentHtml,
  });

  return sendMail({ to, subject, html });
}

/**
 * 4. Issue Rejected Email
 * Dispatched when an administrator rejects or marks an issue as invalid / duplicate.
 */
async function sendIssueRejectedEmail({ to, userName, issue, note }) {
  const clientUrl = env.CLIENT_URL || 'http://localhost:3000';
  const issueUrl = `${clientUrl}/issues/${issue.id}`;
  const subject = `⚠️ Issue Update: "${issue.title}"`;

  const categoryName = issue.category?.name || 'General Civic Issue';

  const contentHtml = `
    <h2 style="font-size: 20px; font-weight: 700; color: #b91c1c; margin-top: 0;">Status Update: Issue Report Rejected</h2>
    <p>Hello <strong>${userName || 'Citizen'}</strong>,</p>
    <p>Your reported civic issue <strong>"${issue.title}"</strong> has been reviewed by municipal administration and marked as <strong>REJECTED</strong>.</p>

    <table class="meta-table">
      <tr>
        <td class="label">Issue Title:</td>
        <td class="val"><strong>${issue.title}</strong></td>
      </tr>
      <tr>
        <td class="label">Category:</td>
        <td class="val">${categoryName}</td>
      </tr>
      <tr>
        <td class="label">Location:</td>
        <td class="val">${issue.address || 'Reported Location'}</td>
      </tr>
      <tr>
        <td class="label">Reason / Notes:</td>
        <td class="val" style="color: #b91c1c; font-weight: 600;">
          ${note || 'Issue does not meet municipal criteria or was identified as duplicate/out of jurisdiction.'}
        </td>
      </tr>
    </table>

    <div class="info-box" style="border-left-color: #ef4444; background: #fef2f2;">
      <strong>Why was this rejected?</strong>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #991b1b;">
        Common reasons include: duplicate report already being handled, private property outside municipal jurisdiction, or insufficient evidence/location details.
      </p>
    </div>

    <div class="button-container">
      <a href="${issueUrl}" class="button" target="_blank" style="background: linear-gradient(135deg, #475569 0%, #334155 100%);">
        Review Issue Record &rarr;
      </a>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      If you believe this was an error, you may file an updated report with additional photos and details through the CivicPulse portal.
    </p>
  `;

  const html = getEmailWrapper({
    title: subject,
    badgeText: 'Issue Rejected',
    badgeColor: '#ef4444',
    contentHtml,
  });

  return sendMail({ to, subject, html });
}

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendIssueResolvedEmail,
  sendIssueRejectedEmail,
};
