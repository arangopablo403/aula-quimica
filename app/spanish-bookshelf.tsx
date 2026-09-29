import {Item,ancestry} from '@/lib/content';
import {spanishReadingPlans,spanishReferences} from '@/lib/spanish-bibliography';
export default function SpanishBookshelf({item,all}:{item:Item;all:Item[]}) {
 const path=[item,...ancestry(item,all).reverse()];
 const plan=path.map(i=>spanishReadingPlans[i.id]).find(Boolean);
 if(!plan)return null;
 return <section className="bookshelf"><h2>Bibliografía y recursos en español</h2><p><strong>Ruta de estudio:</strong> {plan.focus}</p>{(['Libro','Guía y apuntes','Recurso interactivo'] as const).map(type=>{const refs=plan.refs.map(id=>spanishReferences[id]).filter(r=>r.type===type);return refs.length?<details key={type} open={type==='Libro'}><summary>{type==='Libro'?'Libros de estudio':type==='Guía y apuntes'?'Guías, apuntes y bibliografía complementaria':'Simulaciones y recursos interactivos'} · {refs.length}</summary>{refs.map(r=><article key={r.url}><h3>{r.title}</h3><p>{r.author}</p><span className="tag">Español</span><p><strong>Acceso:</strong> {r.access}</p><p><strong>Cómo estudiarlo:</strong> {r.study}</p><a className="text-link" href={r.url} target="_blank" rel="noreferrer">Consultar fuente original ↗</a></article>)}</details>:null})}<p className="muted">Selección complementaria al programa del curso. Las fichas editoriales no equivalen a descargas gratuitas. En materias avanzadas, estas lecturas en español se complementan con las referencias especializadas de la biblioteca.</p></section>;
}
