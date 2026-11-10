import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SendMailOptions } from 'nodemailer';

type Attachment = NonNullable<SendMailOptions['attachments']>[number];

export interface OtpEmailOptions {
  code: string;
  portalUrl: string;
}

export interface OtpEmail {
  subject: string;
  text: string;
  html: string;
  attachments: Attachment[];
}

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const logoPath = resolve(moduleDirectory, '../../client/public/brand/amrita-logo-trimmed.png');
const optionalAccentPath = resolve(moduleDirectory, '../../client/public/brand/email-accent.gif');
const logoCid = 'amrita-placement-portal-logo';
const accentCid = 'amrita-placement-portal-accent';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[character];
  });
}

function validatePortalUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Portal URL must be an absolute HTTP or HTTPS URL');
  }
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) {
    throw new Error('Portal URL must be an absolute HTTP or HTTPS URL without credentials');
  }
  return url;
}

function emailAccent(): { markup: string; attachment?: Attachment } {
  if (existsSync(optionalAccentPath)) {
    return {
      markup: `<img src="cid:${accentCid}" width="72" height="8" alt="" style="display:block;width:72px;height:8px;border:0;outline:none;text-decoration:none;">`,
      attachment: {
        filename: 'amrita-email-accent.gif',
        path: optionalAccentPath,
        cid: accentCid,
        contentType: 'image/gif',
        contentDisposition: 'inline'
      }
    };
  }

  return {
    markup: '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="72" style="width:72px;border-collapse:collapse;"><tr><td width="48" height="4" bgcolor="#c79a63" style="width:48px;height:4px;background-color:#c79a63;font-size:0;line-height:0;">&nbsp;</td><td width="24" height="4" bgcolor="#ead9c6" style="width:24px;height:4px;background-color:#ead9c6;font-size:0;line-height:0;">&nbsp;</td></tr></table>'
  };
}

export function buildOtpEmail(options: OtpEmailOptions): OtpEmail {
  if (!/^\d{6}$/.test(options.code)) throw new Error('OTP code must contain exactly six digits');
  if (!existsSync(logoPath)) throw new Error('Amrita Placement Portal logo asset is missing');

  const portal = validatePortalUrl(options.portalUrl);
  const safeCode = escapeHtml(options.code);
  const safePortalUrl = escapeHtml(portal.href);
  const accent = emailAccent();
  const attachments: Attachment[] = [{
    filename: 'amrita-bengaluru-campus-logo.png',
    path: logoPath,
    cid: logoCid,
    contentType: 'image/png',
    contentDisposition: 'inline'
  }];
  if (accent.attachment) attachments.push(accent.attachment);

  const subject = 'Your Amrita Placement Portal sign-in code';
  const text = [
    'Amrita Placement Portal',
    '',
    `Your sign-in code is: ${options.code}`,
    '',
    'Enter this six-digit code to continue. It expires in 5 minutes.',
    'If you did not request this code, you can ignore this email.',
    '',
    `Open the portal: ${portal.href}`,
    '',
    'Amrita Placement Portal · Bengaluru Campus'
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(subject)}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-shell { width: 100% !important; }
      .email-gutter { padding-left: 22px !important; padding-right: 22px !important; }
      .email-title { font-size: 25px !important; line-height: 32px !important; }
      .email-code { font-size: 34px !important; letter-spacing: 7px !important; }
      .email-button { display: block !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8f6f2;font-family:Arial,Helvetica,sans-serif;color:#252634;-webkit-text-size-adjust:100%;">
  <div style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">Your six-digit Amrita Placement Portal sign-in code. It expires in 5 minutes.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f8f6f2" style="width:100%;border-collapse:collapse;background-color:#f8f6f2;">
    <tr><td align="center" style="padding:34px 12px 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-shell" bgcolor="#ffffff" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border:1px solid #e9e3dd;">
        <tr><td bgcolor="#761731" style="height:7px;background-color:#761731;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td class="email-gutter" bgcolor="#431626" style="padding:25px 44px 23px;background-color:#431626;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
            <tr><td align="left" valign="middle"><img src="cid:${logoCid}" width="210" alt="Amrita Vishwa Vidyapeetham, Bengaluru Campus" style="display:block;width:210px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;"></td>
              <td align="right" valign="middle" style="padding-left:12px;color:#e8cda8;font-size:10px;line-height:15px;letter-spacing:1.4px;text-transform:uppercase;">Placement Portal</td></tr>
          </table>
        </td></tr>
        <tr><td class="email-gutter" style="padding:39px 48px 12px;">${accent.markup}</td></tr>
        <tr><td class="email-gutter" style="padding:15px 48px 0;">
          <p style="margin:0 0 10px;color:#761731;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;">Sign-in verification</p>
          <h1 class="email-title" style="margin:0;color:#252634;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:38px;font-weight:normal;">Your code is ready</h1>
          <p style="margin:16px 0 0;color:#6b6470;font-size:15px;line-height:24px;">Use this one-time code to continue to the Amrita Placement Portal.</p>
        </td></tr>
        <tr><td class="email-gutter" style="padding:25px 48px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f8f6f2" style="width:100%;border-collapse:collapse;background-color:#f8f6f2;border:1px solid #eee6dc;">
            <tr><td align="center" style="padding:19px 14px 18px;">
              <p style="margin:0 0 8px;color:#6b6470;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Your six-digit sign-in code</p>
              <p class="email-code" style="margin:0;color:#431626;font-family:Arial,Helvetica,sans-serif;font-size:38px;line-height:48px;font-weight:bold;letter-spacing:9px;">${safeCode}</p>
              <p style="margin:9px 0 0;color:#6b6470;font-size:13px;line-height:19px;">Enter the digits together, in order.</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td class="email-gutter" style="padding:20px 48px 0;">
          <p style="margin:0;color:#6b6470;font-size:14px;line-height:22px;"><strong style="color:#252634;font-weight:bold;">This code expires in 5 minutes.</strong> If you did not request it, you can ignore this email.</p>
        </td></tr>
        <tr><td class="email-gutter" style="padding:26px 48px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td align="center" bgcolor="#761731" style="background-color:#761731;border-radius:3px;">
            <a class="email-button" href="${safePortalUrl}" target="_blank" style="display:inline-block;padding:13px 23px;color:#ffffff;font-size:14px;line-height:19px;font-weight:bold;text-decoration:none;border:1px solid #761731;border-radius:3px;">Open the portal</a>
          </td></tr></table>
        </td></tr>
        <tr><td class="email-gutter" style="padding:30px 48px 34px;">
          <p style="margin:0;color:#8a838a;font-size:12px;line-height:19px;">You can also open the portal using this address:<br><a href="${safePortalUrl}" style="color:#761731;text-decoration:underline;word-break:break-all;">${safePortalUrl}</a></p>
        </td></tr>
        <tr><td bgcolor="#f5f1ec" style="padding:21px 28px;background-color:#f5f1ec;border-top:1px solid #e9e3dd;">
          <p style="margin:0;color:#6b6470;text-align:center;font-size:12px;line-height:19px;">Amrita Placement Portal<br><span style="color:#8a838a;">Bengaluru Campus</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html, attachments };
}
