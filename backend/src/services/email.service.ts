import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: (env.SMTP_PORT || 587) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS || "",
      },
    });
    return transporter;
  }

  return null;
}

export class EmailService {
  private from: string;

  constructor() {
    this.from = env.SMTP_FROM || "noreply@veteran.dev";
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    const transport = getTransporter();
    if (!transport) {
      logger.info("Email not sent: no SMTP configured", { to, subject });
      return false;
    }

    try {
      await transport.sendMail({
        from: this.from,
        to,
        subject,
        html,
        text,
      });
      logger.info("Email sent", { to, subject });
      return true;
    } catch (error) {
      logger.error("Failed to send email", { to, subject, error });
      return false;
    }
  }

  async sendVerificationEmail(to: string, token: string, username: string): Promise<boolean> {
    const verificationUrl = `${env.NODE_ENV === "development" ? "http" : "https"}://${env.HOST}:${env.PORT}/verify-email?token=${token}`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Verify your email</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Welcome to VETERAN!</h1>
  <p>Hi ${username},</p>
  <p>Please verify your email address by clicking the link below:</p>
  <p><a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #238636; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
  <p>Or copy and paste this URL: ${verificationUrl}</p>
  <p>This link expires in 24 hours.</p>
</body></html>`;

    return this.sendEmail(to, "Verify your VETERAN email", html);
  }

  async sendPasswordResetEmail(to: string, token: string, username: string): Promise<boolean> {
    const resetUrl = `${env.NODE_ENV === "development" ? "http" : "https"}://${env.HOST}:${env.PORT}/reset-password?token=${token}`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Reset your password</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Password Reset</h1>
  <p>Hi ${username},</p>
  <p>We received a request to reset your password. Click the link below to set a new password:</p>
  <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #238636; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
  <p>Or copy and paste: ${resetUrl}</p>
  <p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>
</body></html>`;

    return this.sendEmail(to, "Reset your VETERAN password", html);
  }

  async sendNotificationEmail(to: string, title: string, body: string, link: string): Promise<boolean> {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>${title}</h2>
  <p>${body}</p>
  <p><a href="${link}" style="color: #238636;">View on VETERAN</a></p>
</body></html>`;

    return this.sendEmail(to, `[VETERAN] ${title}`, html);
  }

  async sendWelcomeEmail(to: string, username: string): Promise<boolean> {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Welcome to VETERAN</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Welcome to VETERAN!</h1>
  <p>Hi ${username},</p>
  <p>Your account has been created successfully. You can now:</p>
  <ul>
    <li>Create repositories</li>
    <li>Collaborate with others</li>
    <li>Explore open source projects</li>
  </ul>
  <p><a href="${env.NODE_ENV === "development" ? "http" : "https"}://${env.HOST}:${env.PORT}" style="display: inline-block; padding: 12px 24px; background: #238636; color: white; text-decoration: none; border-radius: 6px;">Get Started</a></p>
</body></html>`;

    return this.sendEmail(to, "Welcome to VETERAN!", html);
  }

  async sendSecurityAlert(to: string, alertType: string, description: string): Promise<boolean> {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Security Alert</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Security Alert</h1>
  <p><strong>Type:</strong> ${alertType}</p>
  <p>${description}</p>
  <p>If you did not perform this action, please secure your account immediately.</p>
</body></html>`;

    return this.sendEmail(to, `[VETERAN] Security Alert: ${alertType}`, html);
  }

  async sendEmailVerificationSuccess(to: string, username: string): Promise<boolean> {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Email Verified</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Email Verified</h1>
  <p>Hi ${username},</p>
  <p>Your email has been successfully verified.</p>
</body></html>`;

    return this.sendEmail(to, "Email verified successfully", html);
  }
}

export const emailService = new EmailService();
