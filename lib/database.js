import {neon} from '@neondatabase/serverless';
let sql;
export function database(){if(!process.env.DATABASE_URL)throw Error('Database configuration missing');sql??=neon(process.env.DATABASE_URL);return sql}
export async function rateLimit(key,max,seconds){const rows=await database().query(`INSERT INTO rate_limits(key,count,reset_at) VALUES($1,1,now()+($2::int*interval '1 second')) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.reset_at<=now() THEN 1 ELSE rate_limits.count+1 END, reset_at=CASE WHEN rate_limits.reset_at<=now() THEN now()+($2::int*interval '1 second') ELSE rate_limits.reset_at END RETURNING count`,[key,seconds]);return rows[0].count<=max}
