const nodemailer = require('nodemailer');
const env = require('../src/config/env');

async function testEmailConnection() {
  console.log('\n=========================================');
  console.log(' CivicPulse Email Connection Diagnostics');
  console.log('=========================================\n');
  console.log(`Host:    ${env.EMAIL.HOST}`);
  console.log(`Port:    ${env.EMAIL.PORT}`);
  console.log(`Secure:  ${env.EMAIL.SECURE}`);
  console.log(`User:    ${env.EMAIL.USER}`);
  console.log(`From:    ${env.EMAIL.FROM}`);
  console.log(`Pass:    ${env.EMAIL.PASS ? env.EMAIL.PASS.substring(0, 10) + '...' : '(Not configured)'}\n`);

  if (!env.EMAIL.HOST || !env.EMAIL.USER || !env.EMAIL.PASS) {
    console.error('❌ Error: Missing SMTP credentials in .env.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: env.EMAIL.HOST,
    port: env.EMAIL.PORT,
    secure: env.EMAIL.SECURE,
    auth: {
      user: env.EMAIL.USER,
      pass: env.EMAIL.PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔄 Attempting to authenticate with SMTP server...');
    await transporter.verify();
    console.log('✅ Success! SMTP authentication passed.\n');

    console.log(`📤 Sending a test email to ${env.EMAIL.USER}...`);
    const info = await transporter.sendMail({
      from: env.EMAIL.FROM,
      to: env.EMAIL.USER,
      subject: '🧪 CivicPulse Email Test',
      text: 'Congratulations! Your CivicPulse email notifications are working correctly.',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5;">CivicPulse Email Verification</h2>
          <p>Your SMTP configuration is active and working properly!</p>
          <p style="color: #64748b; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log(`✅ Test email delivered successfully!`);
    console.log(`Message ID: ${info.messageId}\n`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ SMTP Verification Failed:');
    console.error(`Code:    ${error.code || 'N/A'}`);
    console.error(`Message: ${error.message}\n`);

    if (error.responseCode === 535 || error.message.includes('535 5.7.8')) {
      console.log('💡 Troubleshooting for Brevo (535 5.7.8 Authentication failed):');
      console.log('1. Brevo SMTP Login: Check https://app.brevo.com -> Settings -> SMTP & API -> SMTP tab.');
      console.log('   Ensure SMTP_USER matches the exact "Login" shown on that page.');
      console.log('2. Brevo Master SMTP Key: In the SMTP tab, click "Generate a new SMTP key" and paste it into SMTP_PASS.');
      console.log('   (Note: Do not use the API v3 key or your personal account login password).');
      console.log('3. Account Activation: Free accounts may need transactional email activation in Brevo.');
      console.log('4. Sender Verification: In Brevo -> Senders & IP, ensure the email address in EMAIL_FROM is verified.\n');
    }

    process.exit(1);
  }
}

testEmailConnection();
