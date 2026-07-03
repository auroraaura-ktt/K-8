import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

function createTransporterOptions() {
  const baseOptions = {
    auth: { user: env.emailUser, pass: env.emailPass },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  }

  if (env.emailHost) {
    return {
      ...baseOptions,
      host: env.emailHost,
      port: env.emailPort || 465,
      secure: typeof env.emailSecure === 'boolean' ? env.emailSecure : env.emailPort === 465,
      tls: { rejectUnauthorized: false },
    }
  }

  const shouldUseGmail = env.emailService?.toLowerCase() === 'gmail' || !env.emailService

  if (shouldUseGmail) {
    const secure = typeof env.emailSecure === 'boolean' ? env.emailSecure : true
    const port = env.emailPort || (secure ? 465 : 587)
    return {
      ...baseOptions,
      host: 'smtp.gmail.com',
      port,
      secure,
      requireTLS: true,
      tls: { rejectUnauthorized: false },
    }
  }

  return {
    ...baseOptions,
    service: env.emailService || 'gmail',
  }
}

function createTransporter() {
  return nodemailer.createTransport(createTransporterOptions())
}

let transporter = createTransporter()

/**
 * Send verification email with 8-digit code
 * @param {string} email - Recipient email
 * @param {string} code - 8-digit verification code
 * @returns {Promise<boolean>} - True if sent successfully
 */
const retryableEmailErrorCodes = new Set([
  'ECONNECTION',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ESOCKET',
  'ECONNRESET',
  'ENOTFOUND',
])

export async function sendVerificationEmail(email, code) {
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

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Verification email sent successfully:', info.messageId, info)
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    if (retryableEmailErrorCodes.has(error.code)) {
      console.warn('Retrying email send after transient SMTP error:', error.code)
      transporter = createTransporter()

      try {
        const retryInfo = await transporter.sendMail(mailOptions)
        console.log('Verification email sent successfully on retry:', retryInfo.messageId, retryInfo)
        return true
      } catch (retryError) {
        console.error('Retry failed for verification email:', retryError)
        throw new Error(`Email sending failed after retry: ${retryError?.message || String(retryError)}`)
      }
    }

    throw new Error(`Email sending failed: ${error?.message || String(error)}`)
  }
}

/**
 * Verify transporter connection to Gmail
 * @returns {Promise<boolean>}
 */
export async function verifyEmailConnection() {
  try {
    transporter = createTransporter() // ensure a fresh connection for verification
    const res = await transporter.verify()
    console.log('Email transporter verified successfully', res)
    return true
  } catch (error) {
    console.error('Email transporter verification failed:', error)
    return false
  }
}
