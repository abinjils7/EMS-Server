import nodemailer from 'nodemailer'
import { SendEmailOptions } from '../types/index.js'

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // false for port 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  console.log('📧 Sending email to:', to)

  try {
    const info = await transporter.sendMail({
      from: `"EMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log('✅ Email sent:', info.messageId)
  } catch (err) {
    console.error('❌ Email send failed:', err)
    throw err
  }
}
