import 'dotenv/config';
import nodemailer from 'nodemailer';

// Force SMTP config to false to run exclusively in Console Fallback mode
const hasSmtpConfig = false;

let transporter;

if (hasSmtpConfig) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  console.log('SMTP Mail Transporter initialized.');
} else {
  console.log('No SMTP config found. Running in Console Mail Fallback mode.');
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('\n--- [MOCK MAIL SENT] ---');
      console.log(`To:      ${mailOptions.to}`);
      console.log(`From:    ${mailOptions.from || 'noreply@interviewportal.com'}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`HTML:\n${mailOptions.html}`);
      console.log('------------------------\n');
      return { messageId: `mock_${Date.now()}` };
    }
  };
}

export const sendVerificationEmail = async (email, token, name) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Interview Experience Portal" <noreply@interviewportal.com>',
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to Interview Experience Portal</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering. Please verify your email by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #64748b; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you did not create an account, please ignore this email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (email, token, name) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Interview Experience Portal" <noreply@interviewportal.com>',
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Reset Your Password</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #64748b; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        <p>This link is valid for 1 hour.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};
