'use client';
import {useEffect,useState} from 'react';
import {Item,ancestry} from '@/lib/content';

export function isSchoolPeriod(period:Item,all:Item[]) {
 return period.kind==='period'&&ancestry(period,all).some(i=>['octavo','noveno','decimo','once'].includes(i.id));
}
export default function PeriodWorkshops({period,all}:{period:Item;all:Item[]}) {
 const [teacher,setTeacher]=useState(false);
 useEffect(()=>{const controller=new AbortController();fetch('/api/auth',{cache:'no-store',signal:controller.signal}).then(r=>r.ok?r.json():null).then((d:any)=>setTeacher(d?.teacher===true)).catch(()=>{});return()=>controller.abort();},[]);
 if(!isSchoolPeriod(period,all))return null;
 const workshops=all.filter(i=>i.kind==='resource'&&i.resourceType==='Taller'&&i.status==='published'&&(i.links?.includes(period.id)||i.parent===period.id)).sort((a,b)=>a.position-b.position);
 return <section className="text-section" aria-label={'Talleres de '+period.title}><h2>Talleres · {period.title}</h2><p>Consulta los talleres que tu docente publica para este período.</p>{workshops.length?<div className="resource-list">{workshops.map(w=><article className="resource-row" key={w.id}><span><strong>{w.title}</strong>{w.description&&<p>{w.description}</p>}<small>{w.filename||'Consultar taller'}</small></span><span><a href={'#'+w.id}>Ver taller →</a>{w.file&&<a className="button secondary" href={w.file+'?download=1'}>Descargar taller</a>}</span></article>)}</div>:<p className="notice">Todavía no hay talleres publicados para este período.</p>}{teacher&&<a className="button secondary" href={'/admin?taller='+encodeURIComponent(period.id)}>Subir taller a este período</a>}</section>;
}
