import {neon} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw Error('Set DATABASE_URL in .env.local first.');
const sql=neon(process.env.DATABASE_URL),source=await readFile(new URL('../database/schema.sql',import.meta.url),'utf8');
await sql.transaction(source.split(';').map(s=>s.trim()).filter(Boolean).map(s=>sql.query(s)));
console.log('Database schema ready. Existing appointment data preserved.');
