import {session,newSession,cookie,sameOrigin,readBody,passwordMatches,hashKey} from '../../../../lib/booking-core.js';
import {rateLimit} from '../../../../lib/database.js';
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(body,status=200,c)=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...(c?{'Set-Cookie':c}:{})}});
export async function GET(r){return json({admin:session(r)?.role==='admin'})}
export async function POST(r){if(!sameOrigin(r))return json({error:'Invalid request origin.'},403);try{const b=await readBody(r);const ip=r.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';if(!await rateLimit('login:'+hashKey(ip),8,900))return json({error:'Too many attempts. Try again in 15 minutes.'},429);if(!passwordMatches(b.password))return json({error:'Incorrect password.'},401);const s=newSession('admin');return json({ok:true},200,cookie(s.token,8*3600))}catch{return json({error:'Admin sign-in is unavailable. Check server configuration.'},503)}}
export async function DELETE(r){if(!sameOrigin(r))return json({error:'Invalid request origin.'},403);return json({ok:true},200,cookie('',0))}
