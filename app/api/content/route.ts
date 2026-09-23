import {allItems,authorized,bindings,initialize,sameOrigin} from '@/lib/server';
import {Item,kinds} from '@/lib/content';
import {z} from 'zod';
const strings=['parent','description','objectives','body','examples','activities','bibliography','url','file','filename','resourceType','transcript','authors','date','keywords','area','publicationType','image','name','email','education','interests','projects','social','plan','scholar','orcid','researchgate','researchIntro','researchLines'];
const schema=z.object({id:z.string().max(120).optional(),kind:z.enum(['branch','subbranch','course','period','unit','topic','resource','research','profile']),title:z.string().trim().min(1).max(250),status:z.enum(['draft','published']),position:z.coerce.number().finite().default(0),links:z.array(z.string()).max(500).optional(),featured:z.boolean().optional(),current:z.boolean().optional(),example:z.boolean().optional(),...Object.fromEntries(strings.map(k=>[k,z.string().max(100000).optional()]))});
export async function GET(req:Request){try{const admin=new URL(req.url).searchParams.has('admin');if(admin&&!await authorized())return Response.json({error:'Acceso restringido.'},{status:403});return Response.json({items:await allItems(admin)},{headers:{'Cache-Control':'no-store'}})}catch(e){console.error(e);return Response.json({error:'No se pudo cargar la biblioteca. Intenta de nuevo.'},{status:503})}}
export async function POST(req:Request){try{
 if(!sameOrigin(req)||!await authorized())return Response.json({error:'No autorizado'},{status:403});
 const raw=await req.text();if(raw.length>250000)return Response.json({error:'Contenido demasiado extenso'},{status:413});
 let parsed;try{parsed=schema.safeParse(JSON.parse(raw))}catch{return Response.json({error:'Contenido inválido'},{status:400})}
 if(!parsed.success)return Response.json({error:'Revisa el título, tipo y campos del contenido.'},{status:400});
 const item={...parsed.data,id:parsed.data.id||crypto.randomUUID()} as Item;
 if(['decimo','once'].includes(item.id))delete item.parent;
 await initialize();const all=await allItems(true);
 const parents:Record<string,string[]>={subbranch:['branch','subbranch'],course:['branch','subbranch'],period:['course'],unit:['course','period'],topic:['unit']};
 if(item.parent){const parent=all.find(i=>i.id===item.parent);if(!parent||!parents[item.kind]?.includes(parent.kind))return Response.json({error:'La ubicación no corresponde al tipo de contenido.'},{status:400});let p:string|undefined=item.parent;const seen=new Set([item.id]);while(p){if(seen.has(p))return Response.json({error:'La ubicación crearía un ciclo.'},{status:400});seen.add(p);p=all.find(i=>i.id===p)?.parent}}
 if(item.links?.some(id=>!all.some(i=>i.id===id&&i.kind==='topic')))return Response.json({error:'Uno de los temas vinculados ya no está disponible.'},{status:400});
 for(const key of ['file','image','plan']){const value=item[key];if(typeof value==='string'&&value&&!/^\/api\/files\/[\w-]+$/.test(value)&&!/^https:\/\//.test(value))return Response.json({error:'El enlace del archivo no es válido.'},{status:400})}
 item.updatedAt=new Date().toISOString(); const db=bindings().DB;
 const statements=[];
 if(item.kind==='period'&&item.current){for(const other of all.filter(i=>i.kind==='period'&&i.parent===item.parent&&i.id!==item.id&&i.current)){other.current=false;statements.push(db.prepare('UPDATE records SET data=? WHERE id=?').bind(JSON.stringify(other),other.id))}}
 statements.push(db.prepare('INSERT INTO records(id,kind,status,data,position) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,status=excluded.status,data=excluded.data,position=excluded.position').bind(item.id,item.kind,item.status,JSON.stringify(item),item.position));
 await db.batch(statements);return Response.json({item});
}catch(e){console.error(e);return Response.json({error:'No se guardó. Conserva tus cambios e intenta de nuevo.'},{status:503})}}



