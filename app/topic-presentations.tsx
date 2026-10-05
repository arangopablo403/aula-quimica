'use client';
import {useEffect, useRef, useState} from 'react';
import type {Presentation} from '@/lib/presentations';
import {presentationPdf} from '@/lib/convert-presentation';

export default function TopicPresentations({topic, title}: {topic: string; title: string}) {
  const [items, setItems] = useState<Presentation[]>([]);
  const [teacher, setTeacher] = useState(false);
  const [message, setMessage] = useState('Cargando presentaciones…');
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const endpoint = '/api/presentations?topic=' + encodeURIComponent(topic);
  useEffect(() => {
    const abort = new AbortController();
    fetch(endpoint, {signal: abort.signal, cache: 'no-store'}).then(async response => {
      const data = await response.json() as {error?: string; presentations: Presentation[]; teacher: boolean};
      if (!response.ok) throw new Error(data.error);
      setItems(data.presentations); setTeacher(data.teacher); setMessage('');
    }).catch(error => {if (!abort.signal.aborted) setMessage(error.message);});
    return () => abort.abort();
  }, [endpoint]);
  async function upload(event: React.FormEvent) {
    event.preventDefault();
    const file = input.current?.files?.[0];
    if (!file || !name.trim()) return;
    if (file.size > 40 * 1024 * 1024) {setMessage('La presentación debe pesar menos de 40 MB.'); return;}
    setBusy(true);
    let loading: import('pdfjs-dist').PDFDocumentLoadingTask | undefined;
    try {
      setMessage('Preparando las diapositivas. Mantén esta página abierta.');
      const pdf = await import('pdfjs-dist');
      const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      pdf.GlobalWorkerOptions.workerSrc = worker.default;
      loading = pdf.getDocument({data: await presentationPdf(file,topic,setMessage)});
      const document = await loading.promise;
      if (document.numPages > 80) throw new Error('Divide la presentación en archivos de máximo 80 diapositivas.');
      const form = new FormData(); form.set('topic', topic); form.set('title', name.trim());
      let bytes = 0;
      for (let n = 1; n <= document.numPages; n++) {
        setMessage(`Preparando diapositiva ${n} de ${document.numPages}…`);
        const page = await document.getPage(n);
        const original = page.getViewport({scale: 1});
        const viewport = page.getViewport({scale: 1800 / Math.max(original.width, original.height)});
        const canvas = window.document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        await page.render({canvas, viewport}).promise;
        const context = canvas.getContext('2d')!;
        context.save(); context.fillStyle = 'rgba(20,65,80,0.16)';
        context.font = `${Math.max(18, canvas.width / 45)}px sans-serif`;
        context.translate(canvas.width / 2, canvas.height / 2); context.rotate(-0.3); context.textAlign = 'center';
        for (const y of [-canvas.height / 3, 0, canvas.height / 3]) context.fillText('AulaQuímica · Uso académico · No distribuir', 0, y);
        context.restore();
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('No se pudo convertir la diapositiva.')), 'image/webp', 0.88));
        bytes += blob.size;
        if (bytes > 40 * 1024 * 1024) throw new Error('Divide esta presentación en archivos más pequeños.');
        form.append('pages', blob, n + '.webp'); page.cleanup(); canvas.width = 0;
      }
      setMessage('Publicando las diapositivas en este tema…');
      const response = await fetch('/api/presentations', {method: 'POST', body: form});
      const data = await response.json() as {error?: string; presentation: Presentation}; if (!response.ok) throw new Error(data.error);
      setItems(current => [...current, data.presentation]); setName(''); if (input.current) input.current.value = '';
      setMessage('Presentación publicada en este tema. Los estudiantes verán las diapositivas con marca de agua, sin acceso al archivo original.');
    } catch (error) {setMessage(error instanceof Error ? error.message : 'No se pudo publicar.');}
    finally {await loading?.destroy(); setBusy(false);}
  }
  return <section className="text-section topic-presentations" aria-label={'Presentaciones de ' + title}>
    <h2>Presentaciones del tema</h2><p>{title}</p>
    {teacher&&<p><a className="button secondary" href={'/admin?recurso='+encodeURIComponent(topic)}>Añadir video, modelo 3D u otro recurso</a></p>}
    {!items.length && <p className="notice">Este tema tiene su propio espacio de presentaciones. El docente publicará aquí sus diapositivas.</p>}
    {items.map(item => <div key={item.id}><SlideViewer item={item} endpoint={endpoint}/>{teacher && <button className="button secondary" disabled={busy} onClick={async () => {
      if (!confirm('¿Eliminar «' + item.title + '» de este tema?')) return;
      setBusy(true);
      try {const response = await fetch(endpoint + '&presentation=' + item.id, {method: 'DELETE'}); const data = await response.json() as {error?: string}; if (!response.ok) throw new Error(data.error); setItems(current => current.filter(value => value.id !== item.id)); setMessage('Presentación eliminada.');}
      catch (error) {setMessage(error instanceof Error ? error.message : 'No se pudo eliminar.');} finally {setBusy(false);}
    }}>Eliminar presentación</button>}</div>)}
    {teacher && <form onSubmit={upload}><h3>Subir presentación a este tema</h3><p>PDF, PPT, PPTX, PPS, PPSX u ODP, hasta 80 diapositivas y 40 MB. Se muestran diapositivas estáticas, sin animaciones ni audio. Para Keynote, Canva o Google Slides, exporta a PDF o PPTX.</p>
      <label>Título de la presentación<input value={name} onChange={event => setName(event.target.value)} maxLength={250} required disabled={busy}/></label>
      <label>Archivo de presentación<input ref={input} type="file" accept=".pdf,.ppt,.pptx,.pps,.ppsx,.odp" required disabled={busy}/></label>
      <p>PowerPoint y ODP se envían a CloudConvert para convertirlos. Requiere que el administrador configure el servicio y tenga créditos disponibles. Los PDF se preparan en tu navegador.</p>
      <p>Se publicarán imágenes con marca de agua, sin el archivo original. Las capturas de pantalla no pueden bloquearse completamente.</p>
      <button className="button" disabled={busy}>{busy ? 'Preparando…' : 'Publicar presentación en este tema'}</button>
    </form>}
    <p role="status">{message}</p>
    <style>{`@media print {.topic-presentations {display:none!important}} .topic-presentations form{padding:20px;background:#edf5f5;border-radius:12px;margin-top:24px}.topic-presentations label{display:block;margin:14px 0}.topic-presentations canvas{display:block;width:100%;height:auto;user-select:none}.slide-controls{display:flex;gap:12px;align-items:center;justify-content:center;margin:12px 0}`}</style>
  </section>;
}
function SlideViewer({item, endpoint}: {item: Presentation; endpoint: string}) {
  const [page, setPage] = useState(0), [status, setStatus] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const abort = new AbortController();
    canvas.current?.getContext('2d')?.clearRect(0, 0, canvas.current.width, canvas.current.height);
    setStatus('Cargando diapositiva…');
    (async () => {
      try {
        const response = await fetch(endpoint + '&presentation=' + item.id + '&page=' + page, {signal: abort.signal, cache: 'no-store'});
        if (!response.ok) throw new Error('No se pudo cargar la diapositiva. Comprueba tu acceso al curso.');
        const image = await createImageBitmap(await response.blob());
        if (!abort.signal.aborted && canvas.current) {canvas.current.width = image.width; canvas.current.height = image.height; canvas.current.getContext('2d')!.drawImage(image, 0, 0); setStatus('');} image.close();
      } catch (error) {if (!abort.signal.aborted) setStatus(error instanceof Error ? error.message : 'No se pudo cargar.');}
    })();
    return () => abort.abort();
  }, [endpoint, item.id, page]);
  return <article><h3>{item.title}</h3><div onContextMenu={event => event.preventDefault()} onDragStart={event => event.preventDefault()}><canvas ref={canvas} role="img" aria-label={`${item.title}, diapositiva ${page + 1}`}/></div><p role="status">{status}</p><div className="slide-controls"><button className="button secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button><span>{page + 1} / {item.pages}</span><button className="button secondary" disabled={page + 1 === item.pages} onClick={() => setPage(page + 1)}>Siguiente</button></div></article>;
}
