import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parse } from 'dotenv';

const envPath = new URL('../.env', import.meta.url);
const existing = existsSync(envPath) ? parse(readFileSync(envPath)) : {};
const config = {
  NODE_ENV: 'production', HOST: '127.0.0.1', PORT: '3000',
  PUBLIC_URL: 'https://dbms.sld.parswanadh.dev',
  ORACLE_USER: 'PLACEMENTS_PORTAL', ORACLE_PASSWORD: `Cp7_${randomBytes(24).toString('hex')}`,
  ORACLE_CONNECT_STRING: '127.0.0.1:1521/FREEPDB1',
  SESSION_SECRET: randomBytes(48).toString('hex'), AADHAAR_ENCRYPTION_KEY: randomBytes(32).toString('hex'),
  SESSION_COOKIE_NAME: 'campusbridge_session', COOKIE_SECURE: 'auto',
  MAIL_TRANSPORT: 'smtp', SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '465', SMTP_SECURE: 'true',
  SMTP_USER: '', SMTP_PASS: '', SMTP_FROM: '', BOOTSTRAP_ADMIN_EMAIL: '',
  UPLOAD_DIR: 'storage/uploads', ORIGIN_AUTH_TOKEN: randomBytes(32).toString('hex'),
  ...existing,
};
if (!/^[A-Z][A-Z0-9_]{0,29}$/.test(config.ORACLE_USER)) throw new Error('Invalid Oracle schema name.');
if (!/^[A-Za-z0-9_!#-]{20,128}$/.test(config.ORACLE_PASSWORD)) throw new Error('Schema password must use generated safe characters.');
const sql = `set echo off feedback off heading off verify off
whenever sqlerror exit failure rollback
alter session set container = FREEPDB1;
DECLARE n NUMBER;
BEGIN
 SELECT COUNT(*) INTO n FROM dba_users WHERE username='${config.ORACLE_USER}';
 IF n = 0 THEN
  EXECUTE IMMEDIATE 'CREATE USER ${config.ORACLE_USER} IDENTIFIED BY "${config.ORACLE_PASSWORD}" DEFAULT TABLESPACE USERS QUOTA 100M ON USERS';
  EXECUTE IMMEDIATE 'GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE TO ${config.ORACLE_USER}';
 END IF;
END;
/
exit
`;
const result = spawnSync('docker', ['exec', '-i', 'oracle-free', 'sqlplus', '-s', '/', 'as', 'sysdba'], { input: sql, encoding: 'utf8', timeout: 60000 });
if (result.error || result.status !== 0) {
  const safe = `${result.stdout || ''}${result.stderr || ''}`.replaceAll(config.ORACLE_PASSWORD, '[redacted]');
  throw new Error(`Dedicated Oracle schema provisioning failed: ${safe || result.error?.message}`);
}
writeFileSync(envPath, Object.entries(config).map(([k,v])=>`${k}=${JSON.stringify(v)}`).join('\n')+'\n', { mode: 0o600 });
chmodSync(envPath, 0o600);
console.log(`Dedicated schema ${config.ORACLE_USER} is available in FREEPDB1. Local .env saved with mode 600. No existing schemas changed.`);
