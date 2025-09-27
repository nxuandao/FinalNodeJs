const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:8080"}/auth/verify-email?token=${token}`;
  const html = `
    <p>Xin chào,</p>
    <p>Vui lòng bấm vào link dưới đây để xác thực email của bạn:</p>
    <a href="${verifyUrl}">Xác thực email</a>
    <p>Link sẽ hết hạn trong 1 giờ.</p>
  `;

  await transporter.sendMail({
    from: `"Our Store" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your email",
    html,
  });
}

async function sendEmail(toEmail, subject, html) {
  await transporter.sendMail({
    from: `"Our Store" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
}

async function sendResetPasswordEmail(toEmail, token) {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  const html = `
    <p>Xin chào,</p>
    <p>Bấm vào link để đặt lại mật khẩu:</p>
    <a href="${resetUrl}">Reset mật khẩu</a>
    <p>Link sẽ hết hạn trong 1 giờ.</p>
  `;

  await transporter.sendMail({
    from: `"Our Store" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your password",
    html,
  });
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail, sendEmail };
