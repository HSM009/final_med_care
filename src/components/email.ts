import { generateAdminSignature } from '@/lib/crypto'
import nodemailer from 'nodemailer'

export async function emailTemplate(email: string, url: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return await transporter.sendMail({
    from: `"Med Care" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Med Care- Verify your account',
    text: `Welcome! Click this link to verify your account: ${url}`,
    html: `<p>Welcome!</p><p>Click <a href="${url}">here</a> to verify your account.</p>`,
  })
}

export async function adminNotification(name: string, email: string) {
  const ADMIN_EMAIL = 'hoseinsirat@gmail.com'
  const signature = generateAdminSignature(email)

  const baseUrl = process.env.BETTER_AUTH_URL || 'https://yourdomain.com'
  const approveLink = `${baseUrl}/api/admin/approve-user?email=${encodeURIComponent(email)}&action=approve&sig=${signature}`
  const denyLink = `${baseUrl}/api/admin/approve-user?email=${encodeURIComponent(email)}&action=deny&sig=${signature}`

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return await transporter.sendMail({
    from: `"Med Care" <${process.env.SMTP_FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: 'Med Care- Verify new account',
    text: `Welcome! Click this link to verify your account: ${baseUrl}`,
    html: `<h3>New Account Registration</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <div style="margin-top: 20px;">
          <a href="${approveLink}" style="background-color: #22c55e; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; margin-right: 12px; font-weight: bold;">Approve Access</a>
          <a href="${denyLink}" style="background-color: #ef4444; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-weight: bold;">Deny & Ban</a>
        </div>`,
  })
}

export async function emailChangeNotification(
  user: string,
  email: string,
  currentEmail: string,
) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return await transporter.sendMail({
    from: `"Med Care" <${process.env.SMTP_FROM_EMAIL}>`,
    to: [email, currentEmail],
    subject: 'Med Care- Admin Notice of Email Change.',
    text: `Welcome! Your account email has been updated by the administrator (${user}). Your new email is ${email}.`,
    html: `<p>Welcome! Your account email has been updated by the administrator (<strong>${user}</strong>).</p>
           <p>Your new login email is now: <code>${email}</code></p>`,
  })
}
