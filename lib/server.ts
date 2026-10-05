import {courseContent} from './course-access';
import { env } from 'cloudflare:workers';
import { type Item, ancestry } from './content';
import {seed} from './content-data';
import {managedUser,isTeacherEmail,studentRecord} from './student-auth';
import {mergeContent} from './curriculum';
import {cvResearch,completeCvProfile} from './cv-profile';
import {laboratoryContent} from './laboratories';
import {enrichVisualLessons} from './visual-lessons';
export const bindings=()=>env as unknown as {DB:D1Database;BUCKET:R2Bucket;ADMIN_EMAIL?:string};
export async function authorized(){const user=await managedUser();return !!user&&isTeacherEmail(user.email);}
async function loadItems():Promise<Item[]>{const rows=await bindings().DB.prepare('SELECT data FROM records ORDER BY position').all<{data:string}>();return enrichVisualLessons(mergeContent(rows.results.map(r=>JSON.parse(r.data)),[...seed,...cvResearch,...laboratoryContent])).map(completeCvProfile);}
export async function courseOptions(){const rows=await bindings().DB.prepare("SELECT json_object('id',id,'kind',kind,'status',status,'title',json_extract(data,'$.title'),'parent',json_extract(data,'$.parent')) AS data FROM records").all<{data:string}>();const records=new Map([...seed,...cvResearch,...laboratoryContent].map(i=>[i.id,i]));for(const row of rows.results){const item=JSON.parse(row.data) as Item;records.set(item.id,item);}const items=[...records.values()];const visible=parentVisibility(items);return items.filter(i=>i.kind==='course'&&i.status==='published'&&(!i.parent||visible(i.parent))).map(i=>({id:i.id,title:i.title}));}
export async function allItems(admin=false):Promise<Item[]>{const teacher=await authorized();if(admin&&!teacher)throw new Error('FORBIDDEN');let allowed:string[]=[];if(!teacher){const user=await managedUser();const record=user&&await studentRecord(user);if(!record||record.status!=='approved')return [];allowed=JSON.parse(record.approved);}const items=await loadItems();if(admin)return items;const visible=parentVisibility(items);const published=items.filter(i=>i.status==='published'&&i.kind!=='deleted'&&i.kind!=='asset'&&(!i.parent||visible(i.parent)));if(teacher)return published;return courseContent(published,allowed);}
function parentVisibility(items:Item[]){const byId=new Map(items.map(i=>[i.id,i]));const memo=new Map<string,boolean>();function visible(id:string,seen=new Set<string>()):boolean{if(memo.has(id))return memo.get(id)!;if(seen.has(id))return false;seen.add(id);const p=byId.get(id);const result=!!p&&p.status==='published'&&(!p.parent||visible(p.parent,seen));memo.set(id,result);return result;}return visible;}
export async function initialize(){const db=bindings().DB;const rows=await db.prepare('SELECT id FROM records').all<{id:string}>();const ids=new Set(rows.results.map(r=>r.id));const missing=seed.filter(i=>!ids.has(i.id));for(let offset=0;offset<missing.length;offset+=80)await db.batch(missing.slice(offset,offset+80).map(i=>db.prepare('INSERT OR IGNORE INTO records(id,kind,status,data,position) VALUES(?,?,?,?,?)').bind(i.id,i.kind,i.status,JSON.stringify(i),i.position)));}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}

