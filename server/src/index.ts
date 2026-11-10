import { createServer } from 'node:http';
import { createApp } from './app.js';
import { config } from './config.js';
import { closeDb, initDb } from './db.js';
import { bootstrapAdmin } from './auth-routes.js';

async function main(){if(!['127.0.0.1','localhost','::1'].includes(config.host)||!Number.isInteger(config.port)||config.port<1||config.port>65535)throw new Error('HOST must be localhost and PORT must be between 1 and 65535');await initDb();await bootstrapAdmin();const server=createServer(createApp());server.listen(config.port,config.host,()=>console.log(`CampusBridge listening on http://${config.host}:${config.port}`));const shutdown=()=>{server.close(()=>{void closeDb().finally(()=>process.exit(0));});setTimeout(()=>process.exit(1),10000).unref();};process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);}
main().catch(e=>{console.error('Server startup failed:',e instanceof Error?e.message:'unknown error');void closeDb().finally(()=>process.exit(1));});
