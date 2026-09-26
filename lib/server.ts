import {courseContent} from './course-access';
import { env } from 'cloudflare:workers';
import { type Item, ancestry } from './content';
import {seed} from './content-data';
import {managedUser,isTeacherEmail,studentRecord} from './student-auth';
import {mergeContent} from './curriculum';
import {cvResearch,completeCvProfile} from './cv-profile';
export const bindings=()=>env as unknown as {DB:D1Database;BUCKET:R2Bucket;ADMIN_EMAIL?:string};
export async function authorized(){const user=await managedUser();return !!user&&isTeacherEmail(user.email);}
async function loadItems():Promise<Item[]>{const rows=await bindings().DB.prepare('SELECT data FROM records ORDER BY position').all<{data:string}>();return mergeContent(rows.results.map(r=>JSON.parse(r.data)),[...seed,...cvResearch]).map(completeCvProfile);}
export async function courseOptions(){const items=await loadItems();return items.filter(i=>i.kind==='course'&&i.status==='published'&&(!i.parent||visibleParent(i.parent,items))).map(i=>({id:i.id,title:i.title}));}
export async function allItems(admin=false):Promise<Item[]>{const teacher=await authorized();if(admin&&!teacher)throw new Error('FORBIDDEN');let allowed:string[]=[];if(!teacher){const user=await managedUser();const record=user&&await studentRecord(user);if(!record||record.status!=='approved')return [];allowed=JSON.parse(record.approved);}const items=await loadItems();if(admin)return items;const published=items.filter(i=>i.status==='published'&&i.kind!=='deleted'&&i.kind!=='asset'&&(!i.parent||visibleParent(i.parent,items)));if(teacher)return published;return courseContent(published,allowed);}
function visibleParent(id:string,items:Item[],seen=new Set<string>()):boolean{if(seen.has(id))return false;seen.add(id);const p=items.find(i=>i.id===id);return !!p&&p.status==='published'&&(!p.parent||visibleParent(p.parent,items,seen));}
export async function initialize(){const db=bindings().DB;const rows=await db.prepare('SELECT id FROM records').all<{id:string}>();const ids=new Set(rows.results.map(r=>r.id));const missing=seed.filter(i=>!ids.has(i.id));for(let offset=0;offset<missing.length;offset+=80)await db.batch(missing.slice(offset,offset+80).map(i=>db.prepare('INSERT OR IGNORE INTO records(id,kind,status,data,position) VALUES(?,?,?,?,?)').bind(i.id,i.kind,i.status,JSON.stringify(i),i.position)));}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}

