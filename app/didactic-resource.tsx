'use client';
import {useState} from 'react';
import {type Item,safeUrl} from '@/lib/content';
import {didacticEmbed} from '@/lib/didactic-embeds';
export default function DidacticResource({item}:{item:Item}){
 const [loaded,setLoaded]=useState(false),embed=didacticEmbed(item.url);
 const image=item.file&&/\.(png|jpe?g|webp)$/i.test(item.filename||'');
 return <article className="resource-detail"><span className="tag">{item.resourceType||'Material'}</span>
 {item.body&&<section className="text-section"><h2>Guía de uso</h2><p className="prose">{item.body}</p></section>}
 {image&&<img src={item.file} alt={item.description||item.title} style={{maxWidth:'100%',height:'auto'}}/>}
 {embed&&(loaded?<iframe title={item.title} src={embed.src} allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation" style={{width:'100%',height:'min(70vh,650px)',minHeight:320,border:0}}/>:<button className="video-placeholder" onClick={()=>setLoaded(true)}>Cargar {embed.label}<small>Se conectará con la plataforma externa. Su disponibilidad depende del proveedor.</small></button>)}
 {safeUrl(item.url)&&<p><a className="button secondary" href={safeUrl(item.url)} target="_blank" rel="noreferrer">Abrir recurso en su plataforma</a></p>}
 {item.file&&<div className="download-panel"><div><h2>{item.filename||'Material de apoyo'}</h2><p>Archivo publicado por el docente.</p></div><a className="button secondary" href={item.file} target="_blank" rel="noreferrer">Consultar archivo</a><a className="button" href={item.file+'?download=1'}>Descargar</a></div>}
 {!item.file&&!safeUrl(item.url)&&!item.body?.trim()&&<p className="notice">El docente aún no ha añadido el material.</p>}
 {item.activities&&<section className="text-section"><h2>Actividad de aprendizaje</h2><p className="prose">{item.activities}</p></section>}
 {item.resourceType==='Video'&&<section className="text-section"><h2>Transcripción del video</h2><p className="prose">{item.transcript||'La transcripción se añadirá cuando esté disponible.'}</p></section>}
 {item.bibliography&&<section className="text-section"><h2>Fuentes y créditos</h2><p className="prose">{item.bibliography}</p></section>}
 </article>;
}
