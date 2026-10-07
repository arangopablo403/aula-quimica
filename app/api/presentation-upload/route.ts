import {allItems, authorized, bindings, sameOrigin} from '@/lib/server';
import {presentationTopic} from '@/lib/presentations';
type Draft={id:string;topic:string;title:string;pages:number;uploaded:number};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function POST(req:Request){try{
 if(!sameOrigin(req)||!await authorized())return json({error:'Acceso restringido.'},403);
 const text=await req.text();if(text.length>2000)return json({error:'Solicitud demasiado extensa.'},413);
 const {topic,title,pages}=JSON.parse(text);
 if(typeof title!=='string'||!title.trim()||title.length>250||!Number.isSafeInteger(pages)||pages<1||pages>1000||!presentationTopic(await allItems(true),topic))return json({error:'Revisa el destino, título y diapositivas (hasta 1000).'},400);
 const draft:Draft={id:crypto.randomUUID(),topic,title:title.trim(),pages,uploaded:0};
 await bindings().DB.prepare('INSERT INTO records(id,kind,status,data,position) VALUES(?,?,?,?,?)').bind(draft.id,'presentation-upload','draft',JSON.stringify(draft),Date.now()).run();
 return json({id:draft.id});
 }catch{return json({error:'No se pudo iniciar la carga.'},503);}}
export async function PUT(req:Request){try{
 if(!sameOrigin(req)||!await authorized())return json({error:'Acceso restringido.'},403);
 const query=new URL(req.url).searchParams,id=query.get('id'),index=Number(query.get('page'));
 const row=await bindings().DB.prepare("SELECT data FROM records WHERE id=? AND kind='presentation-upload'").bind(id).first<{data:string}>();
 if(!row)return json({error:'Carga no disponible.'},404);
 const draft:Draft=JSON.parse(row.data);
 if(!query.has('page')||!Number.isInteger(index)||index<0||index>=draft.pages||index>draft.uploaded)return json({error:'Diapositiva fuera de secuencia.'},409);
 if(req.headers.get('content-type')!=='image/webp')return json({error:'Imagen inválida.'},400);
 const reader=req.body?.getReader();if(!reader)return json({error:'Imagen vacía.'},400);
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>4*1024*1024){await reader.cancel();return json({error:'Una diapositiva supera 4 MB. Exporta el archivo con imágenes optimizadas.'},413);}chunks.push(part.value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 if(String.fromCharCode(...bytes.slice(0,4))!=='RIFF'||String.fromCharCode(...bytes.slice(8,12))!=='WEBP')return json({error:'Imagen inválida.'},400);
 await bindings().BUCKET.put(`presentations/${draft.id}/${index}.webp`,bytes,{httpMetadata:{contentType:'image/webp'}});
 draft.uploaded=Math.max(draft.uploaded,index+1);
 const saved=await bindings().DB.prepare("UPDATE records SET data=? WHERE id=? AND kind='presentation-upload' AND data=?").bind(JSON.stringify(draft),id,row.data).run();
 if(!saved.meta.changes)return json({error:'La carga cambió. Vuelve a intentar esta diapositiva.'},409);
 return json({uploaded:draft.uploaded});
 }catch{return json({error:'No se pudo enviar la diapositiva. Intenta de nuevo.'},503);}}
export async function PATCH(req:Request){try{
 if(!sameOrigin(req)||!await authorized())return json({error:'Acceso restringido.'},403);
 const id=new URL(req.url).searchParams.get('id');
 const row=await bindings().DB.prepare("SELECT data FROM records WHERE id=? AND kind='presentation-upload'").bind(id).first<{data:string}>();
 if(!row)return json({error:'Carga no disponible.'},404);
 const draft:Draft=JSON.parse(row.data);
 if(draft.uploaded!==draft.pages)return json({error:'Faltan diapositivas por enviar.'},409);
 if(!presentationTopic(await allItems(true),draft.topic))return json({error:'Destino no disponible.'},404);
 const item={id:draft.id,topic:draft.topic,title:draft.title,pageCount:draft.pages};
 const saved=await bindings().DB.prepare("UPDATE records SET kind='presentation',data=? WHERE id=? AND kind='presentation-upload' AND data=?").bind(JSON.stringify(item),id,row.data).run();
 if(!saved.meta.changes)return json({error:'La carga cambió. Actualiza la página para consultar la publicación.'},409);
 return json({presentation:{id:item.id,title:item.title,pages:item.pageCount}});
 }catch{return json({error:'No se pudo finalizar la publicación.'},503);}}
export async function DELETE(req:Request){try{
 if(!sameOrigin(req)||!await authorized())return json({error:'Acceso restringido.'},403);
 const id=new URL(req.url).searchParams.get('id');
 const row=await bindings().DB.prepare("SELECT data FROM records WHERE id=? AND kind='presentation-upload'").bind(id).first<{data:string}>();
 if(!row)return json({ok:true});
 const draft:Draft=JSON.parse(row.data);
 for(let start=0;start<=draft.uploaded;start+=100)await bindings().BUCKET.delete(Array.from({length:Math.min(100,draft.uploaded+1-start)},(_,i)=>`presentations/${draft.id}/${start+i}.webp`));
 await bindings().DB.prepare("DELETE FROM records WHERE id=? AND kind='presentation-upload'").bind(id).run();
 return json({ok:true});
 }catch{return json({error:'No se pudo limpiar la carga incompleta.'},503);}}
