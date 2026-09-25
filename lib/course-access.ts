import {ancestry,type Item} from './content';
/** Input must already exclude drafts and unpublished ancestors. */
export function courseContent(items:Item[],allowed:string[]):Item[]{
 const valid=new Set(items.filter(i=>i.kind==='course'&&allowed.includes(i.id)).map(i=>i.id));
 const permitted=new Set(items.filter(i=>valid.has(i.id)||ancestry(i,items).some(p=>valid.has(p.id))).map(i=>i.id));
 for(const c of items.filter(i=>valid.has(i.id)))for(const p of ancestry(c,items))permitted.add(p.id);
 return items.filter(i=>permitted.has(i.id)||['profile','research'].includes(i.kind)||(i.kind==='resource'&&i.links?.some(id=>permitted.has(id)))).map(i=>i.kind==='resource'?{...i,links:i.links?.filter(id=>permitted.has(id))}:i);
}
