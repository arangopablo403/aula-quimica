import {ancestry,type Item} from './content';
/** Input must already exclude drafts and unpublished ancestors. */
export function courseContent(items:Item[],allowed:string[]):Item[]{
 const valid=new Set(items.filter(i=>i.kind==='course'&&allowed.includes(i.id)).map(i=>i.id));
 const permitted=new Set(items.filter(i=>{const course=i.kind==='course'?i:ancestry(i,items).reverse().find(p=>p.kind==='course');return !!course&&valid.has(course.id);}).map(i=>i.id));
 const contentIds=new Set(permitted);
 for(const c of items.filter(i=>valid.has(i.id)))for(const p of ancestry(c,items))permitted.add(p.id);
 return items.filter(i=>permitted.has(i.id)||['profile','research'].includes(i.kind)||(i.kind==='resource'&&i.links?.some(id=>contentIds.has(id)))).map(i=>i.kind==='resource'?{...i,links:i.links?.filter(id=>contentIds.has(id))}:permitted.has(i.id)&&!contentIds.has(i.id)?{id:i.id,kind:i.kind,title:i.title,status:i.status,position:i.position,parent:i.parent}:i);
}
