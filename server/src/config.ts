import 'dotenv/config';
import { resolve } from 'node:path';

const bool = (v: string | undefined, fallback = false) => v == null ? fallback : v.toLowerCase() === 'true';
export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development', host: process.env.HOST ?? '127.0.0.1', port: Number(process.env.PORT ?? 3000),
  publicUrl: process.env.PUBLIC_URL ?? '', oracleUser: process.env.ORACLE_USER ?? '', oraclePassword: process.env.ORACLE_PASSWORD ?? '', oracleConnectString: process.env.ORACLE_CONNECT_STRING ?? '',
  sessionSecret: process.env.SESSION_SECRET ?? '', aadhaarKey: process.env.AADHAAR_ENCRYPTION_KEY ?? '', cookieName: process.env.SESSION_COOKIE_NAME ?? 'campusbridge_session', cookieSecure: process.env.COOKIE_SECURE ?? 'auto',
  mailTransport: process.env.MAIL_TRANSPORT ?? 'smtp', smtpHost: process.env.SMTP_HOST ?? 'smtp.gmail.com', smtpPort: Number(process.env.SMTP_PORT ?? 465), smtpSecure: bool(process.env.SMTP_SECURE, true), smtpUser: process.env.SMTP_USER ?? '', smtpPass: process.env.SMTP_PASS ?? '', smtpFrom: process.env.SMTP_FROM ?? '',
  bootstrapAdminEmail: (process.env.BOOTSTRAP_ADMIN_EMAIL ?? '').trim().toLowerCase(), uploadDir: resolve(process.env.UPLOAD_DIR ?? 'storage/uploads'), originAuthToken: process.env.ORIGIN_AUTH_TOKEN ?? ''
};
export const smtpConfigured = Boolean(config.smtpUser && config.smtpPass && config.smtpFrom);
export const secureCookie = (secure: boolean) => config.cookieSecure === 'auto' ? secure : config.cookieSecure === 'true';
