/** Called only by the teacher upload form. PDF files never leave the browser here. */
export async function presentationPdf(file:File,topic:string,status:(text:string)=>void):Promise<ArrayBuffer>{
 const extension=file.name.split('.').pop()?.toLowerCase();
 if(extension==='pdf')return file.arrayBuffer();
 if(!['ppt','pptx','pps','ppsx','odp'].includes(extension||''))throw Error('Formato no compatible. Usa PDF, PPT, PPTX, PPS, PPSX u ODP.');
 let id:string|undefined;
 async function read(response:Response){if(!response.headers.get('content-type')?.includes('application/json'))throw Error('El servicio de conversión no está disponible. Intenta más tarde.');const data=await response.json() as {id:string;form:{url:string;parameters:Record<string,string>};status:string;error?:string};if(!response.ok)throw Error(data.error||'No se pudo convertir la presentación.');return data;}
 try{
  status('Preparando la conversión con CloudConvert…');
  const job=await read(await fetch('/api/presentation-convert',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic,filename:file.name,size:file.size})}));id=job.id;
  const destination=new URL(job.form.url);if(destination.protocol!=='https:'||!destination.hostname.endsWith('.cloudconvert.com'))throw Error('Destino de carga inválido.');
  const form=new FormData();for(const [key,value] of Object.entries(job.form.parameters))form.append(key,value);form.append('file',file);
  status('Enviando la presentación a CloudConvert…');
  const uploaded=await fetch(destination,{method:'POST',body:form});if(!uploaded.ok)throw Error('No se pudo enviar el archivo para convertirlo.');
  const endpoint='/api/presentation-convert?id='+encodeURIComponent(id);
  for(let attempt=0;attempt<120;attempt++){
   const result=await read(await fetch(endpoint,{cache:'no-store'}));
   if(result.status==='error')throw Error('La conversión falló. Comprueba que el archivo abre correctamente o expórtalo a PDF.');
   if(result.status==='finished'){
    const response=await fetch(endpoint+'&pdf=1',{cache:'no-store'});
    if(!response.ok){if(response.headers.get('content-type')?.includes('application/json'))await read(response);throw Error('No se pudo recuperar el PDF convertido. El servidor no está disponible temporalmente.');}
    if(!response.headers.get('content-type')?.includes('application/pdf'))throw Error('El servicio no entregó un PDF válido.');
    const reader=response.body?.getReader();if(!reader)throw Error('El PDF convertido está vacío.');const chunks:Uint8Array[]=[];let size=0;
    while(true){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>200*1024*1024){await reader.cancel();throw Error('El PDF convertido supera 200 MB. Divide la presentación.');}chunks.push(next.value);}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes.buffer;
   }
   status('Convirtiendo la presentación. Mantén esta página abierta…');await new Promise(resolve=>setTimeout(resolve,5000));
  }
  throw Error('La conversión tardó demasiado. Vuelve a intentarlo más tarde.');
 }finally{if(id)await fetch('/api/presentation-convert?id='+encodeURIComponent(id),{method:'DELETE'}).catch(()=>{});}
}
