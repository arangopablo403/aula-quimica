import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { seed, type Item } from './content';
export const bindings=()=>env as unknown as {DB:D1Database;BUCKET:R2Bucket;ADMIN_EMAIL?:string};
export async function authorized(){const user=await getChatGPTUser(); const email=bindings().ADMIN_EMAIL; return !!(email&&user&&user.email.toLowerCase()===email.toLowerCase());}
export async function allItems(admin=false):Promise<Item[]>{const rows=await bindings().DB.prepare('SELECT data FROM records ORDER BY position').all<{data:string}>();const items=rows.results.length?rows.results.map(r=>JSON.parse(r.data)):seed;return admin?items:items.filter(i=>i.status==='published'&&i.kind!=='deleted'&&i.kind!=='asset'&&(!i.parent||visibleParent(i.parent,items)));}
function visibleParent(id:string,items:Item[],seen=new Set<string>()):boolean{if(seen.has(id))return false;seen.add(id);const p=items.find(i=>i.id===id);return !!p&&p.status==='published'&&(!p.parent||visibleParent(p.parent,items,seen));}
export async function initialize(){const db=bindings().DB;const row=await db.prepare('SELECT id FROM records LIMIT 1').first();if(!row)await db.batch(seed.map(i=>db.prepare('INSERT OR IGNORE INTO records(id,kind,status,data,position) VALUES(?,?,?,?,?)').bind(i.id,i.kind,i.status,JSON.stringify(i),i.position)));}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
