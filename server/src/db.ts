import oracledb from 'oracledb';
import { config } from './config.js';

let pool: oracledb.Pool | undefined;
export async function initDb(): Promise<void> {
  if (pool) return;
  if (!config.oracleUser || !config.oraclePassword || !config.oracleConnectString) throw new Error('Oracle connection settings are required');
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  oracledb.fetchAsString = [oracledb.CLOB];
  pool = await oracledb.createPool({ user: config.oracleUser, password: config.oraclePassword, connectString: config.oracleConnectString, poolMin: 1, poolMax: 4, poolIncrement: 1, poolTimeout: 60 });
}
export async function closeDb(): Promise<void> { if (pool) { const p = pool; pool = undefined; await p.close(10); } }
export async function withConnection<T>(fn: (connection: oracledb.Connection) => Promise<T>): Promise<T> {
  if (!pool) throw new Error('Oracle database is not initialized');
  const connection = await pool.getConnection();
  try { return await fn(connection); } finally { await connection.close(); }
}
export async function query<T = any>(sql: string, binds: oracledb.BindParameters = {}): Promise<T[]> {
  return withConnection(async c => {
    const result = await c.execute<Record<string, unknown>>(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true });
    return (result.rows ?? []).map(row => Object.fromEntries(Object.entries(row).map(([k,v]) => [k.toLowerCase(), v]))) as T[];
  });
}
export async function transaction<T>(fn: (connection: oracledb.Connection) => Promise<T>): Promise<T> {
  return withConnection(async c => { try { const value = await fn(c); await c.commit(); return value; } catch (e) { await c.rollback(); throw e; } });
}
