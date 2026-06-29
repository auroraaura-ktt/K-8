#!/usr/bin/env python3
import asyncio
import sys
import argparse
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

# Gmail configuration
GMAIL_ADDRESS = "miitverse.verify@gmail.com"
GMAIL_APP_PASSWORD = "mfbw mbxh furh qwjh"  # Gmail App Password
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def send_verification_email_smtp(recipient_email: str, verification_code: str) -> bool:
    """Send verification email using smtplib (most reliable method)"""
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your MiitVerse Email Verification Code"
        msg["From"] = f"MiitVerse Account Service <{GMAIL_ADDRESS}>"
        msg["To"] = recipient_email

        # HTML content
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #333;">Email Verification Required</h2>
                <p style="color: #666; font-size: 16px;">Welcome to MiitVerse!</p>
                <p style="color: #666; font-size: 16px;">Your verification code is:</p>
                <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #007bff; font-size: 36px; letter-spacing: 2px; margin: 0;">{verification_code}</h1>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in <strong>15 minutes</strong>.</p>
                <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">© 2026 MiitVerse. All rights reserved.</p>
            </body>
        </html>
        """

        # Plain text content
        text_content = f"""Your MiitVerse verification code is: {verification_code}

This code will expire in 15 minutes.

If you didn't request this code, please ignore this email.
© 2026 MiitVerse. All rights reserved."""

        # Attach parts
        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # Send email via SMTP
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(msg)

        print(f"✓ Verification email sent successfully to {recipient_email}")
        return True

    except Exception as e:
        print(f"✗ Failed to send verification email: {str(e)}", file=sys.stderr)
        return False


async def send_verification_email_async(recipient_email: str, verification_code: str) -> bool:
    """Send verification email using fastapi-mail (async method)"""
    try:
        from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

        conf = ConnectionConfig(
            MAIL_USERNAME=GMAIL_ADDRESS,
            MAIL_PASSWORD=GMAIL_APP_PASSWORD,
            MAIL_FROM=GMAIL_ADDRESS,
            MAIL_FROM_NAME="MiitVerse Account Service",
            MAIL_PORT=SMTP_PORT,
            MAIL_SERVER=SMTP_SERVER,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
        )

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #333;">Email Verification Required</h2>
                <p style="color: #666; font-size: 16px;">Welcome to MiitVerse!</p>
                <p style="color: #666; font-size: 16px;">Your verification code is:</p>
                <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #007bff; font-size: 36px; letter-spacing: 2px; margin: 0;">{verification_code}</h1>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in <strong>15 minutes</strong>.</p>
                <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">© 2026 MiitVerse. All rights reserved.</p>
            </body>
        </html>
        """

        message = MessageSchema(
            subject="Your MiitVerse Email Verification Code",
            recipients=[recipient_email],
            body=html_content,
            subtype="html",
        )

        fm = FastMail(conf)
        await fm.send_message(message)

        print(f"✓ Verification email sent successfully to {recipient_email}")
        return True

    except ImportError:
        print("fastapi-mail not installed, falling back to SMTP", file=sys.stderr)
        return send_verification_email_smtp(recipient_email, verification_code)
    except Exception as e:
        print(f"✗ Failed to send verification email: {str(e)}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description="Send MiitVerse verification email")
    parser.add_argument("--email", required=True, help="Recipient email address")
    parser.add_argument("--code", required=True, help="8-digit verification code")

    args = parser.parse_args()

    if not args.email or not args.code:
        print("Error: Both --email and --code arguments are required", file=sys.stderr)
        sys.exit(1)

    # Validate verification code format
    if not args.code.isdigit() or len(args.code) != 8:
        print(f"Error: Verification code must be 8 digits, got '{args.code}'", file=sys.stderr)
        sys.exit(1)

    # Try to send using async method first, fall back to sync if needed
    try:
        success = asyncio.run(send_verification_email_async(args.email, args.code))
        sys.exit(0 if success else 1)
    except RuntimeError:
        # If event loop issue, use sync method
        success = send_verification_email_smtp(args.email, args.code)
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()



if __name__ == '__main__':
    import argparse
    import asyncio

    parser = argparse.ArgumentParser()
    parser.add_argument('--email', required=True, help='Recipient email')
    parser.add_argument('--code', required=True, help='Verification code')
    args = parser.parse_args()

    async def _main():
        await send_verification_email(args.email, args.code)

    asyncio.run(_main())