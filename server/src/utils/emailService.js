import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

// Build transporter options: prefer explicit SMTP host if provided, otherwise use service.
// For Gmail, use explicit smtp.gmail.com to avoid service-specific DNS/timeout issues on Render.
const transporterOptions = env.emailHost
  ? {
      host: env.emailHost,
      port: env.emailPort || 465,
      secure: typeof env.emailSecure === 'boolean' ? env.emailSecure : true,
      auth: { user: env.emailUser, pass: env.emailPass },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: true },
    }
  : env.emailService?.toLowerCase() === 'gmail'
  ? {
      host: 'smtp.gmail.com',
      port: env.emailPort || 587,
      secure: typeof env.emailSecure === 'boolean' ? env.emailSecure : false,
      requireTLS: true,
      auth: { user: env.emailUser, pass: env.emailPass },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: true },
    }
  : {
      service: env.emailService || 'gmail',
      auth: { user: env.emailUser, pass: env.emailPass },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    }

// Create transporter
const transporter = nodemailer.createTransport(transporterOptions)

/**
 * Send verification email with 8-digit code
 * @param {string} email - Recipient email
 * @param {string} code - 8-digit verification code
 * @returns {Promise<boolean>} - True if sent successfully
 */
export async function sendVerificationEmail(email, code) {
  try {
    const mailOptions = {
      from: '"MiitVerse Account Service" <miitverse.verify@gmail.com>',
      replyTo: 'miitverse.verify@gmail.com',
      to: email,
      subject: 'Your MiitVerse Email Verification Code',
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'MiitVerse Mailer',
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification Required</h2>
          <p style="color: #666; font-size: 16px;">Welcome to MiitVerse!</p>
          <p style="color: #666; font-size: 16px;">Your verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 36px; letter-spacing: 2px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in <strong>15 minutes</strong>.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2026 MiitVerse. All rights reserved.</p>
        </div>
      `,
      text: `Your MiitVerse verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Verification email sent successfully:', info.messageId, info)
    return true
  } catch (error) {
    // Log full error to help diagnose Render / SMTP issues
    console.error('Failed to send verification email:', error)
    // Re-throw with message preserved to keep existing controller behavior
    throw new Error(`Email sending failed: ${error && error.message ? error.message : String(error)}`)
  }
}

/**
 * Verify transporter connection to Gmail
 * @returns {Promise<boolean>}
 */
export async function verifyEmailConnection() {
  try {
    const res = await transporter.verify()
    console.log('Email transporter verified successfully', res)
    return true
  } catch (error) {
    console.error('Email transporter verification failed:', error)
    return false
  }
}
