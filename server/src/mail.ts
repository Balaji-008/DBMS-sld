import nodemailer from 'nodemailer';
import { config, smtpConfigured } from './config.js';
import { buildOtpEmail } from './email-template.js';

const captured: Array<{ to: string; code: string }> = [];

export function getCapturedMail() {
  return captured.map((message) => ({ ...message }));
}

export function clearCapturedMail() {
  captured.length = 0;
}

export async function sendOtp(to: string, code: string): Promise<void> {
  if (config.mailTransport === 'json' && config.nodeEnv === 'test') {
    captured.push({ to, code });
    return;
  }
  if (!smtpConfigured) throw new Error('SMTP credentials are not configured');

  const email = buildOtpEmail({
    code,
    portalUrl: config.publicUrl || 'https://dbms.sld.parswanadh.dev'
  });
  const transport = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPass },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000
  });
  await transport.sendMail({
    from: config.smtpFrom,
    to,
    ...email
  });
}
