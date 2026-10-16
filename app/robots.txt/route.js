export const dynamic='force-dynamic';
export function GET(){const origin=process.env.APP_URL;return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /appointments\n${origin?'Sitemap: '+new URL('/sitemap.xml',origin).href+'\n':''}`,{headers:{'Content-Type':'text/plain'}})}
