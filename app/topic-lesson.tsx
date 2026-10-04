import type {Item} from '@/lib/content';

function TextWithLinks({text}: {text: string}) {
  return <div className="prose">{text.split('\n').map((line, n) => /^https:\/\/\S+$/.test(line.trim())
    ? <p key={n}><a href={line.trim()} target="_blank" rel="noreferrer">Consultar la fuente académica ↗</a></p>
    : line.trim() ? <p key={n}>{line}</p> : null)}</div>;
}

export default function TopicLesson({item}: {item: Item}) {
  return <>{[
    ['Resumen y explicación', item.body],
    ['Ejemplos y aplicación', item.examples],
    ['Actividades de estudio', item.activities],
    ['Bibliografía y lecturas', item.bibliography],
  ].map(([title, value]) => <section className="text-section" key={title}><h2>{title}</h2><TextWithLinks text={value || 'El docente puede añadir contenido a esta sección.'}/></section>)}</>;
}
