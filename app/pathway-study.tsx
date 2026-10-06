'use client';
import {useState} from 'react';
import type {ReactomeRecord} from '@/lib/reactome-display';
import './pathway-study.css';

const prompts=[
 {title:'1. Define qué quieres comprender',question:'¿Qué transformación o función de esta ruta quieres explicar?',help:'Escribe una pregunta concreta. Puedes estudiar la ruta sin disponer de un experimento.',example:'¿En qué reacciones de la glucólisis se utiliza ATP y en cuáles se forma?',placeholder:'Quiero comprender…'},
 {title:'2. Describe lo que observas',question:'¿Qué reactivos, productos y enzimas responden a tu pregunta?',help:'Revisa las reacciones del visor. Anota sus nombres o identificadores y distingue la información de la base de tus propios resultados.',example:'En el paso de la hexoquinasa aparecen ATP y glucosa entre los reactivos, y ADP y glucosa-6-fosfato entre los productos.',placeholder:'En la reacción… observo…'},
 {title:'3. Explica y delimita tu conclusión',question:'¿Cómo interpretas lo observado y qué te falta comprobar?',help:'Relaciona la transformación con tu pregunta. Si tienes datos experimentales, indica muestra, método y controles; una ficha de Reactome por sí sola no demuestra lo que ocurre en tu muestra.',example:'La reacción muestra una transferencia de fosfato desde ATP. Para determinar su actividad en mi muestra necesitaría mediciones adicionales.',placeholder:'Esto permite explicar… Todavía falta comprobar…'},
];
export default function PathwayStudy({record}:{record:ReactomeRecord}){
 const [step,setStep]=useState(0),[drafts,setDrafts]=useState<Record<string,string[]>>({});
 const id=record.stId||String(record.dbId),answers=drafts[id]||['','',''];
 const count=answers.filter(a=>a.trim()).length;
 const name=id==='R-HSA-70171'?'Glucólisis humana':record.displayName;
 const source=`https://reactome.org/content/detail/${id}`;
 function update(value:string){setDrafts(old=>({...old,[id]:answers.map((a,i)=>i===step?value:a)}))}
 function download(){
  const report=['GUÍA DE ESTUDIO DE UNA RUTA BIOQUÍMICA',name,`Identificador: ${record.stIdVersion||id}`,`Organismo: ${record.speciesName||'No indicado'}`,`Fuente: ${source}`,`Informe generado: ${new Date().toLocaleString('es-CO')}`,'',...prompts.flatMap((p,i)=>[p.title,p.question,answers[i].trim()||'[Pendiente de completar]','']),'Respuestas redactadas por el usuario. Esta guía organiza el razonamiento; no realiza análisis experimental ni valida conclusiones.'].join('\n');
  const url=URL.createObjectURL(new Blob([report],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`guia-estudio-${id}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <details className="pathway-study"><summary>Actividad opcional · Comprender y explicar esta ruta</summary>
 <p className="study-purpose">Úsala para preparar una explicación de clase o un informe de estudio: formula una pregunta, revisa las reacciones y redacta tu interpretación. Si solo quieres explorar la ruta, no necesitas completar esta actividad.</p>
 <div className="study-context"><strong>Ruta de trabajo: {name}</strong><span>{record.speciesName||'Organismo no indicado'} · {id}</span></div>
 <nav className="study-steps" aria-label="Pasos de la guía de estudio">{prompts.map((p,i)=><button type="button" key={p.title} aria-current={step===i?'step':undefined} onClick={()=>setStep(i)}>{p.title}{answers[i]?.trim()?' ✓':''}</button>)}</nav>
 <section className="study-question"><h4>{prompts[step].question}</h4><p id="study-help">{prompts[step].help}</p><details><summary>Ver un ejemplo orientativo de glucólisis</summary><p>{prompts[step].example}</p><small>Ejemplo didáctico; no corresponde a resultados de tu muestra.</small></details><label htmlFor="study-answer">Tu respuesta</label><textarea id="study-answer" aria-describedby="study-help" rows={5} value={answers[step]} placeholder={prompts[step].placeholder} onChange={e=>update(e.target.value)}/><div className="study-controls"><button type="button" disabled={step===0} onClick={()=>setStep(step-1)}>← Anterior</button><span>{step+1} de 3</span><button type="button" disabled={step===2} onClick={()=>setStep(step+1)}>Siguiente →</button></div></section>
 <details className="study-report"><summary>Revisar mi informe · {count} de 3 respuestas redactadas</summary><h4>{name}</h4><a href={source} target="_blank" rel="noopener noreferrer">Fuente de la ruta en Reactome ↗</a>{prompts.map((p,i)=><section key={p.title}><h5>{p.title}</h5><p style={{whiteSpace:'pre-wrap'}}>{answers[i].trim()||'Pendiente de completar.'}</p></section>)}</details>
 <button type="button" disabled={!count} onClick={download}>Descargar mi informe de estudio (.txt)</button><p className="pathway-help">Las respuestas se mantienen al cambiar de ruta dentro de este explorador. Descarga el informe antes de recargar o salir: no se guardan en tu cuenta ni se envían a Reactome.</p>
 </details>;
}
