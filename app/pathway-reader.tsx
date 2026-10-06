'use client';
import './pathway-reader.css';
import {useEffect,useRef,useState} from 'react';
import {entityLabel,equationName,glycolysisSteps,stepInfo,type ReactomeEntity,type ReactomeRecord} from '@/lib/reactome-display';

export default function PathwayReader({record,onPathway}:{record:ReactomeRecord;onPathway:(id:string)=>void}){
 const events=record.hasEvent||[];
 const isGlycolysis=record.stId==='R-HSA-70171';
 const ordered=isGlycolysis?glycolysisSteps.flatMap(s=>events.filter(e=>e.stId===s[0])):events.filter(e=>e.schemaClass!=='Pathway');
 const extra=events.filter(e=>!ordered.some(o=>o.stId===e.stId));
 const [selected,setSelected]=useState<ReactomeRecord|null>(record.schemaClass==='Pathway'?null:record),[active,setActive]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[filter,setFilter]=useState('');
 const sequence=useRef(0),cache=useRef(new Map<string,ReactomeRecord>()),detailTitle=useRef<HTMLHeadingElement>(null),focusAfterLoad=useRef(false);
 async function select(id:string,focus=true){
  focusAfterLoad.current=focus;
  const seq=++sequence.current;setActive(id);setError('');setSelected(null);setBusy(true);
  try{
   let data=cache.current.get(id);
   if(!data){const res=await fetch(`https://reactome.org/ContentService/data/query/${id}`,{credentials:'omit',signal:AbortSignal.timeout(20000)});if(!res.ok)throw new Error('No se pudo recuperar la reacción.');data=await res.json() as ReactomeRecord;if(data?.stId!==id||typeof data.displayName!=='string')throw new Error('Reactome devolvió una ficha incompleta.');cache.current.set(id,data)}
   if(seq===sequence.current)setSelected(data);
  }catch{if(seq===sequence.current)setError('No se pudo cargar esta reacción. Reintenta o consulta su ficha en Reactome.');}
  finally{if(seq===sequence.current)setBusy(false)}
 }
 useEffect(()=>{if(record.schemaClass==='Pathway'&&ordered[0]?.stId)void select(ordered[0].stId,false);return()=>{sequence.current++}},[record.stId]); // Component is keyed by the parent record.
 useEffect(()=>{if(selected&&focusAfterLoad.current){detailTitle.current?.focus({preventScroll:true});detailTitle.current?.scrollIntoView({block:'nearest'});focusAfterLoad.current=false}},[selected]);
 const current=ordered.findIndex(e=>e.stId===active);
 function option(e:ReactomeEntity,i:number){const info=stepInfo(e.stId);return <button type="button" key={e.stId||e.dbId} aria-pressed={active===e.stId} onClick={()=>e.stId&&(e.schemaClass==='Pathway'?onPathway(e.stId):void select(e.stId))}><span className="reaction-number">{e.schemaClass==='Pathway'?'↳':i+1}</span><span><strong>{info?.[1]||e.displayName}</strong><small>{info?.[2]||(e.schemaClass==='Pathway'?'Abrir subruta':'Ver reactivos y productos')}</small></span></button>}
 function side(values:ReactomeEntity[]|undefined,title:string,kind:string){return <div className={`reaction-side ${kind}`}><h5>{title}</h5>{values?.length?values.map((entity,i)=>{const label=entityLabel(entity);return <div key={`${entity.dbId}-${i}`}>{i>0&&<span className="reaction-plus" aria-label="más">+</span>}<div className="molecule-card"><strong>{label.label}</strong>{label.original!==label.label&&<small>{label.original}</small>}{label.compartment&&<small>{label.compartment}</small>}</div></div>}):<p>Sin participantes indicados por la base.</p>}</div>}
 const info=stepInfo(selected?.stId);
 return <div className="reaction-workspace">
 {record.schemaClass==='Pathway'&&<aside className="reaction-menu"><h5>{isGlycolysis?'Glucólisis · recorrido principal':'Reacciones de la ruta'}</h5><p>{isGlycolysis?'Selecciona un paso para ver qué se transforma. Este recorrido didáctico separa las reacciones principales de las ramas reguladoras.':'Selecciona una reacción. El orden de la lista no representa una secuencia metabólica.'}</p><label>Buscar reacción<input type="search" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Enzima, nombre o identificador"/></label><div className="reaction-options">{ordered.map((e,i)=>({e,i})).filter(({e})=>`${e.displayName} ${e.stId} ${stepInfo(e.stId)?.join(' ')||''}`.toLowerCase().includes(filter.toLowerCase())).map(({e,i})=>option(e,i))}{!ordered.some(e=>`${e.displayName} ${e.stId} ${stepInfo(e.stId)?.join(' ')||''}`.toLowerCase().includes(filter.toLowerCase()))&&<p>No hay reacciones que coincidan.</p>}</div>{extra.length>0&&<details><summary>Subrutas y reacciones complementarias ({extra.length})</summary><div className="reaction-options">{extra.map((e,i)=>option(e,i))}</div></details>}</aside>}
 <section className="reaction-detail" aria-label="Reacción seleccionada" aria-busy={busy}>
 {busy&&<p role="status">Cargando reactivos, productos y enzimas…</p>}
 {error&&<div role="alert"><p>{error}</p><button type="button" onClick={()=>void select(active)}>Reintentar reacción</button> <a href={`https://reactome.org/content/detail/${active}`} target="_blank" rel="noopener noreferrer">Abrir ficha original ↗</a></div>}
 {selected&&<><span className="eyebrow">{isGlycolysis&&current>=0?`PASO ${current+1} DE ${ordered.length}`:'REACCIÓN SELECCIONADA'}</span><h4 ref={detailTitle} tabIndex={-1}>{info?.[1]||selected.displayName}</h4>{info&&<p className="reaction-explanation">{info[3]}</p>}<div className="reaction-enzyme"><span>Enzima / actividad catalítica</span><strong>{info?.[2]||selected.catalystActivity?.map(e=>e.displayName).join('; ')||'No especificada en esta ficha'}</strong></div><div className="reaction-scheme">{side(selected.input,'Reactivos · lo que entra','substrates')}<span className="reaction-arrow" aria-label="se transforma en">⟶</span>{side(selected.output,'Productos · lo que se forma','products')}</div><p className="pathway-help">La flecha muestra las entradas y salidas registradas, no afirma irreversibilidad. Este esquema de participantes no es una ecuación balanceada.</p>{equationName(selected)&&<details><summary>Ecuación registrada por Reactome</summary><p className="reaction-equation">{equationName(selected)}</p><p>Se conserva la notación original de la base.</p></details>}<details><summary>Datos originales y fuente científica</summary><p>{selected.displayName}</p><p>{selected.stIdVersion||selected.stId} · {selected.speciesName||'Organismo no indicado'}</p><ul>{selected.catalystActivity?.map((e,i)=><li key={i}>{e.displayName}</li>)}</ul><a href={`https://reactome.org/content/detail/${selected.stId}`} target="_blank" rel="noopener noreferrer">Consultar referencias y ficha de esta reacción ↗</a></details>{current>=0&&<nav className="reaction-pagination" aria-label="Cambiar de reacción"><button disabled={current===0} type="button" onClick={()=>void select(ordered[current-1].stId!)}>← Anterior</button><span>{current+1} / {ordered.length}</span><button disabled={current===ordered.length-1} type="button" onClick={()=>void select(ordered[current+1].stId!)}>Siguiente →</button></nav>}</>}
 {!selected&&!busy&&!error&&<p>Abre una subruta para encontrar sus reacciones.</p>}
 </section></div>;
}
