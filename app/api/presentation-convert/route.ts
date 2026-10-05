import {env} from 'cloudflare:workers';
import {authorized,allItems,sameOrigin} from '@/lib/server';
import {presentationTopic} from '@/lib/presentations';
const headers={'Cache-Control':'private, no-store'};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers});
type Job={id:string;tag:string;status:string;tasks:{name:string;result?:{form?:{url:string;parameters:Record<string,string>};files?:{url:string}[]}}[]};
async function api(path:string,options:RequestInit={}){
 const key=(env as unknown as {CLOUDCONVERT_API_KEY?:string}).CLOUDCONVERT_API_KEY;
 if(!key)throw Error('Falta configurar CLOUDCONVERT_API_KEY como secreto en Cloudflare. Mientras tanto puedes subir PDF.');
 const response=await fetch('https://api.cloudconvert.com/v2/jobs'+path,{...options,headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('CloudConvert no pudo procesar la solicitud. Revisa la clave, los permisos y los créditos de conversión.');
 if(response.status===204)return undefined;
 return (await response.json() as {data:Job}).data;
}
export async function POST(req:Request){try{
 if(!sameOrigin(req)||!await authorized())return json({error:'Acceso restringido.'},403);
 const raw=await req.text();if(raw.length>2000)return json({error:'Solicitud demasiado extensa.'},413);
 const {topic,filename,size}=JSON.parse(raw);const extension=String(filename).split('.').pop()?.toLowerCase();
 if(!['ppt','pptx','pps','ppsx','odp'].includes(extension||'')||!Number.isFinite(size)||size<=0||size>40*1024*1024)return json({error:'Usa PPT, PPTX, PPS, PPSX u ODP de hasta 40 MB.'},400);
 if(!presentationTopic(await allItems(true),topic))return json({error:'Tema no disponible.'},404);
 const job=await api('',{method:'POST',body:JSON.stringify({tag:'aula-presentation:'+topic,tasks:{upload:{operation:'import/upload'},convert:{operation:'convert',input:'upload',input_format:extension,output_format:'pdf',timeout:300},output:{operation:'export/url',input:'convert'}}})});
 const form=job?.tasks.find(t=>t.name==='upload')?.result?.form;
 if(!form)throw Error('No se pudo preparar la conversión.');
 return json({id:job!.id,form});
 }catch(e){return json({error:e instanceof Error?e.message:'No se pudo iniciar la conversión.'},503);}}
export async function GET(req:Request){try{
 if(!await authorized())return json({error:'Acceso restringido.'},403);
 const query=new URL(req.url).searchParams,id=query.get('id');if(!id||!/^[a-zA-Z0-9-]{10,80}$/.test(id))return json({error:'Conversión inválida.'},400);
 const job=await api('/'+id);if(!job?.tag?.startsWith('aula-presentation:'))return json({error:'Conversión no disponible.'},404);
 if(!query.has('pdf'))return json({status:job.status});
 if(job.status!=='finished')return json({error:'La conversión aún no terminó.'},409);
 const address=job.tasks.find(t=>t.name==='output')?.result?.files?.[0]?.url;
 if(!address)throw Error('No se recibió el PDF convertido.');
 let url=new URL(address);let result:Response|undefined;
 const signal=AbortSignal.timeout(30000);
 for(let hop=0;hop<4;hop++){
  if(url.protocol!=='https:'||url.username||url.password||!url.hostname.endsWith('.cloudconvert.com'))throw Error('Destino de conversión no autorizado.');
  result=await fetch(url,{redirect:'manual',signal});
  if(![301,302,303,307,308].includes(result.status))break;
  const location=result.headers.get('location');await result.body?.cancel();
  if(!location||hop===3)throw Error('La descarga del PDF contiene demasiadas redirecciones.');
  url=new URL(location,url);
 }
 if(!result)throw Error('No se pudo iniciar la descarga del PDF.');
 if(!result.ok||Number(result.headers.get('content-length'))>40*1024*1024)throw Error('El PDF convertido no está disponible o supera 40 MB.');
 return new Response(result.body,{headers:{...headers,'Content-Type':'application/pdf','X-Content-Type-Options':'nosniff'}});
 }catch(e){return json({error:e instanceof Error?e.message:'No se pudo consultar la conversión.'},503);}}
export async function DELETE(req:Request){try{
 if(!sameOrigin(req)||!await authorized())return json({error:'Acceso restringido.'},403);
 const id=new URL(req.url).searchParams.get('id');if(!id||!/^[a-zA-Z0-9-]{10,80}$/.test(id))return json({error:'Conversión inválida.'},400);
 const job=await api('/'+id);if(!job?.tag?.startsWith('aula-presentation:'))return json({error:'Conversión no disponible.'},404);
 await api('/'+id,{method:'DELETE'});return json({ok:true});
 }catch{return json({error:'No se pudo eliminar la conversión temporal.'},503);}}
