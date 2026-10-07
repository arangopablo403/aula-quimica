import {allItems, authorized, bindings, sameOrigin} from '@/lib/server';
import {presentationTopic} from '@/lib/presentations';
type Stored = {id: string; topic: string; title: string; keys?: string[]; pageCount?: number};
const headers = {'Cache-Control': 'private, no-store'};
const error = (message: string, status = 400) => Response.json({error: message}, {status, headers});
export async function GET(req: Request) {
  try {
    const query = new URL(req.url).searchParams;
    const teacher = await authorized();
    const topic = presentationTopic(await allItems(teacher), query.get('topic') || '');
    if (!topic) return error('Tema no disponible.', 404);
    const rows = await bindings().DB.prepare("SELECT data FROM records WHERE kind='presentation'").all<{data: string}>();
    const presentations: Stored[] = rows.results.map(row => JSON.parse(row.data)).filter(item => item.topic === topic.id);
    if (query.has('page')) {
      const item = presentations.find(item => item.id === query.get('presentation'));
      const page = Number(query.get('page'));
      if (!item || !Number.isInteger(page) || page < 0 || page >= (item.pageCount ?? item.keys!.length)) return error('Diapositiva no disponible.', 404);
      const slide = await bindings().BUCKET.get(item.keys?.[page] ?? `presentations/${item.id}/${page}.webp`);
      if (!slide) return error('Diapositiva no disponible.', 404);
      return new Response(slide.body, {headers: {...headers, 'Content-Type': 'image/webp', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline', 'Cross-Origin-Resource-Policy': 'same-origin'}});
    }
    return Response.json({teacher, presentations: presentations.map(({id, title, keys, pageCount}) => ({id, title, pages: pageCount ?? keys!.length}))}, {headers});
  } catch { return error('No se pudieron consultar las presentaciones.', 503); }
}
export async function POST(req: Request) {
  const written: string[] = [];
  try {
    if (!sameOrigin(req) || !await authorized()) return error('Acceso restringido.', 403);
    if (Number(req.headers.get('content-length')) > 45 * 1024 * 1024) return error('Presentación demasiado grande.', 413);
    const form = await req.formData();
    const topic = presentationTopic(await allItems(true), String(form.get('topic') || ''));
    const title = String(form.get('title') || '').trim();
    const pages = form.getAll('pages');
    if (!topic || !title || title.length > 250 || !pages.length || pages.length > 80) return error('Revisa el tema, título y diapositivas (máximo 80).');
    let total = 0;
    for (const page of pages) {
      if (!(page instanceof File) || page.type !== 'image/webp' || page.size > 4 * 1024 * 1024) return error('Formato de diapositiva inválido.');
      total += page.size;
      const signature = new Uint8Array(await page.slice(0, 12).arrayBuffer());
      if (String.fromCharCode(...signature.slice(0, 4)) !== 'RIFF' || String.fromCharCode(...signature.slice(8, 12)) !== 'WEBP') return error('Imagen inválida.');
    }
    if (total > 40 * 1024 * 1024) return error('La presentación supera 40 MB.', 413);
    const id = crypto.randomUUID();
    for (const [index, page] of (pages as File[]).entries()) {
      const key = `presentations/${id}/${index}.webp`;
      await bindings().BUCKET.put(key, await page.arrayBuffer(), {httpMetadata: {contentType: 'image/webp'}});
      written.push(key);
    }
    const item: Stored = {id, topic: topic.id, title, keys: written};
    // Private metadata: the regular content API never publishes this record.
    await bindings().DB.prepare('INSERT INTO records(id,kind,status,data,position) VALUES(?,?,?,?,?)').bind(id, 'presentation', 'draft', JSON.stringify(item), Date.now()).run();
    return Response.json({presentation: {id, title, pages: written.length}}, {headers});
  } catch {
    if (written.length) await bindings().BUCKET.delete(written).catch(() => {});
    return error('No se publicó la presentación. Intenta de nuevo.', 503);
  }
}
export async function DELETE(req: Request) {
  try {
    if (!sameOrigin(req) || !await authorized()) return error('Acceso restringido.', 403);
    const id = new URL(req.url).searchParams.get('presentation');
    const row = await bindings().DB.prepare("SELECT data FROM records WHERE id=? AND kind='presentation'").bind(id).first<{data: string}>();
    if (!row) return error('Presentación no disponible.', 404);
    const item: Stored = JSON.parse(row.data);
    await bindings().DB.prepare("DELETE FROM records WHERE id=? AND kind='presentation'").bind(id).run();
    if(item.keys) await bindings().BUCKET.delete(item.keys);
    else for(let start=0;start<(item.pageCount||0);start+=100) await bindings().BUCKET.delete(Array.from({length:Math.min(100,item.pageCount!-start)},(_,i)=>`presentations/${item.id}/${start+i}.webp`));
    return Response.json({ok: true}, {headers});
  } catch { return error('No se pudo completar la eliminación.', 503); }
}
