import {createHmac,randomBytes,timingSafeEqual,createHash} from 'node:crypto';
export const SERVICES=['Pregnancy & antenatal care','Postnatal care & recovery','Pelvic health physiotherapy','Back, joint & orthopaedic care','Post-surgical rehabilitation','Classes, movement & education'];
export function validSlot(date,time,now=Date.now()){
 if(typeof date!=='string'||typeof time!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:(00|30)$/.test(time))return false;
 const at=Date.parse(`${date}T${time}:00+05:30`),day=new Date(date+'T12:00:00Z');
 return Number.isFinite(at)&&day.toISOString().slice(0,10)===date&&day.getUTCDay()!==0&&time>='09:00'&&time<='20:00'&&at>now&&at<now+60*86400000;
}
export function validBooking(b){return b&&/^AR-[A-F0-9]{24}$/.test(b.id)&&typeof b.name==='string'&&b.name.trim().length>=2&&b.name.trim().length<=80&&!/[\x00-\x1F\x7F]/.test(b.name)&&typeof b.phone==='string'&&/^\+91[6-9]\d{9}$/.test(b.phone)&&SERVICES.includes(b.service)&&validSlot(b.date,b.time)&&b.consent===true}
function secret(){const s=process.env.SESSION_SECRET;if(!s||s.length<32)throw Error('Session configuration missing');return s}
const sign=s=>createHmac('sha256',secret()).update(s).digest('base64url');
export function tokenFor(id,role='patient',now=Date.now()){const body=Buffer.from(JSON.stringify({id,role,exp:now+(role==='admin'?8*3600000:30*86400000)})).toString('base64url');return body+'.'+sign(body)}
export function verifyToken(token,now=Date.now()){try{const [body,sig,...extra]=token.split('.');if(extra.length||!body||!sig)return null;const a=Buffer.from(sig),b=Buffer.from(sign(body));if(a.length!==b.length||!timingSafeEqual(a,b))return null;const s=JSON.parse(Buffer.from(body,'base64url').toString());if(!/^[a-f0-9]{48}$/.test(s.id)||!['admin','patient'].includes(s.role)||!Number.isFinite(s.exp)||s.exp<=now)return null;return s}catch{return null}}
export const cookieName=()=>process.env.NODE_ENV==='production'?'__Host-arogyam':'arogyam';
export function session(r){const entry=(r.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName()+'='));return entry?verifyToken(entry.slice(cookieName().length+1)):null}
export function newSession(role='patient'){const id=randomBytes(24).toString('hex');return {id,role,token:tokenFor(id,role)}}
export function cookie(token,maxAge=30*86400){return `${cookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV==='production'?'; Secure':''}`}
export function sameOrigin(r){try{const expected=process.env.APP_URL?new URL(process.env.APP_URL).origin:new URL(r.url).origin;return r.headers.get('origin')===expected}catch{return false}}
export const hashKey=v=>createHmac('sha256',secret()).update(v).digest('hex');
export function passwordMatches(value){const p=process.env.ADMIN_PASSWORD;if(!p||p.length<16||typeof value!=='string')return false;return timingSafeEqual(createHash('sha256').update(value).digest(),createHash('sha256').update(p).digest())}
export async function readBody(r){if(!r.headers.get('content-type')?.startsWith('application/json'))throw Error('JSON required');const reader=r.body?.getReader();if(!reader)throw Error('Missing body');let size=0,parts=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw Error('Body too large')}parts.push(value)}return JSON.parse(Buffer.concat(parts).toString())}
