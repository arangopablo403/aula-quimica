'use client';
import {useEffect,useRef,useState} from 'react';
import './pathway-explorer.css';
import PathwayReader from './pathway-reader';
import PathwayStudy from './pathway-study';

type Entity={dbId?:number;stId?:string;displayName:string;schemaClass?:string};
type RecordData=Entity&{speciesName?:string;stIdVersion?:string;isInferred?:boolean;hasEvent?:Entity[];input?:Entity[];output?:Entity[];catalystActivity?:Entity[];compartment?:Entity[]};
const sources=[['Reactome','https://reactome.org/','Rutas y reacciones curadas; comprueba especie e inferencias.'],['KEGG Pathway','https://www.kegg.jp/kegg/pathway.html','Mapas de metabolismo y referencias por organismo.'],['Rhea','https://www.rhea-db.org/','Reacciones bioquímicas y participantes químicos.'],['WikiPathways','https://www.wikipathways.org/','Mapas comunitarios de rutas biológicas.'],['UniProt','https://www.uniprot.org/','Proteínas, enzimas y funciones.'],['ChEBI','https://www.ebi.ac.uk/chebi/','Identificadores y estructuras de entidades químicas.']];
const validId=(id:string)=>/^R-[A-Z]{3}-\d+$/.test(id);

export default function PathwayExplorer(){
 const [query,setQuery]=useState('R-HSA-70171'),[data,setData]=useState<RecordData|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[trail,setTrail]=useState<Entity[]>([]),[retrieved,setRetrieved]=useState('');
 const request=useRef(0);
 async function load(id:string,parents:Entity[]=[]){
  id=id.trim().toUpperCase();if(!validId(id)){setError('Escribe un identificador Reactome, por ejemplo R-HSA-70171.');return;}
  const seq=++request.current;setBusy(true);setError('');
  try{
   const response=await fetch(`https://reactome.org/ContentService/data/query/${id}`,{signal:AbortSignal.timeout(20000),credentials:'omit'});
   if(!response.ok)throw new Error(response.status===404?'No se encontró ese identificador.':'Reactome no pudo responder. Intenta nuevamente.');
   const result=await response.json() as RecordData;
   if(!result||typeof result.displayName!=='string'||result.stId!==id||!['Pathway','Reaction','BlackBoxEvent','Polymerisation','Depolymerisation','FailedReaction','ReactionLikeEvent'].includes(result.schemaClass||''))throw new Error('El identificador debe corresponder a una ruta o reacción de Reactome.');
   if(seq!==request.current)return;
   setData(result);setQuery(id);setTrail(parents);setRetrieved(new Date().toISOString());
  }catch(e){if(seq===request.current)setError(e instanceof Error&&e.name!=='TimeoutError'?e.message:'La consulta tardó demasiado. Puedes reintentar o abrir la base original.');}
  finally{if(seq===request.current)setBusy(false);}
 }
 useEffect(()=>{void load('R-HSA-70171');return()=>{request.current++}},[]);
 function download(){
  if(!data)return;
  const output={source:`https://reactome.org/ContentService/data/query/${data.stId}`,retrievedAt:retrieved,scope:'Ficha actual, referencias a eventos inmediatos; no es la descarga completa de la ruta.',record:data};
  const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`bioquimica-${data.stId}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <section className="pathway-explorer" aria-labelledby="pathway-title">
  <span className="eyebrow">BASES DE DATOS · EXPLORACIÓN INTERACTIVA</span><h3 id="pathway-title">Explorador de rutas bioquímicas</h3>
  <p>Empieza por la glucólisis: selecciona una reacción a la izquierda y observa sus reactivos, productos y enzimas a la derecha.</p>
  <details><summary>Bases de datos para tu estudio</summary><div className="pathway-sources">{sources.map(([name,url,description])=><article key={name}><a href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a><p>{description}</p></article>)}</div><p>La consulta integrada usa Reactome. Las demás bases se abren en su sitio oficial.</p></details>
  <details><summary>Consultar otra ruta por identificador</summary><form className="pathway-search" onSubmit={e=>{e.preventDefault();void load(query)}}><label>Identificador de ruta o reacción<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="R-HSA-70171" required/></label><button type="submit" disabled={busy}>{busy?'Consultando…':'Consultar Reactome'}</button><button type="button" disabled={busy} onClick={()=>void load('R-HSA-70171')}>Ejemplo: glucólisis humana</button></form>
  <p className="pathway-help">Busca por nombre en <a href="https://reactome.org/" target="_blank" rel="noopener noreferrer">Reactome</a> y copia el identificador de la ruta. La vista consulta la API pública de Reactome.</p></details>
  <div role="status" aria-live="polite">{busy&&'Recuperando ficha…'}</div>{error&&<p role="alert" className="notice">{error} {data&&'La ficha anterior permanece visible.'}</p>}
  {data&&<div className="pathway-result" aria-busy={busy}>
   <nav aria-label="Recorrido de la ruta">{trail.map((p,i)=><button key={`${p.stId}-${i}`} type="button" disabled={busy} onClick={()=>p.stId&&void load(p.stId,trail.slice(0,i))}>{p.displayName} ↩</button>)}</nav>
   <h4>{data.stId==='R-HSA-70171'?'Glucólisis humana':data.displayName}</h4><p><strong>{data.stIdVersion||data.stId}</strong> · {data.speciesName||'Organismo no indicado'} · {data.schemaClass==='Pathway'?'Ruta':'Reacción'}{data.isInferred?' · Inferida por la base':''}</p>
   <p>Compartimentos: {data.compartment?.map(p=>p.displayName).join(', ')||'No indicados'}</p>
   <a href={`https://reactome.org/content/detail/${data.stId}`} target="_blank" rel="noopener noreferrer">Ver ficha, referencias y diagrama en Reactome ↗</a>
   <PathwayReader key={data.stId} record={data} onPathway={id=>void load(id,[...trail,data])}/>
   {data.schemaClass==='Pathway'&&!data.hasEvent?.length&&<p>Esta ficha no contiene eventos inmediatos. Consulta el diagrama original.</p>}
   <p className="pathway-help">Fuente: Reactome ContentService · Consulta: {new Date(retrieved).toLocaleString('es-CO')}. Esta exploración no calcula flujos ni demuestra actividad de una ruta en tu muestra.</p>
  </div>}
  {data&&<PathwayStudy record={data}/>}
  <details><summary>Datos técnicos de Reactome</summary><p>Descarga la ficha original en JSON para trabajar con programas de análisis. El informe de estudio se descarga desde la actividad anterior.</p><button type="button" disabled={!data||busy} onClick={download}>Descargar ficha de Reactome (JSON)</button></details>
 </section>;
}
