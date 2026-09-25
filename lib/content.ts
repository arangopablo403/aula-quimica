export type Item = {id:string; kind:string; title:string; status:string; position:number; parent?:string; links?:string[]; description?:string; objectives?:string; body?:string; examples?:string; activities?:string; bibliography?:string; url?:string; file?:string; filename?:string; resourceType?:string; transcript?:string; authors?:string; date?:string; keywords?:string; area?:string; publicationType?:string; image?:string; featured?:boolean; current?:boolean; example?:boolean; name?:string; email?:string; education?:string; interests?:string; projects?:string; social?:string; plan?:string; scholar?:string; orcid?:string; researchgate?:string; researchIntro?:string; researchLines?:string; [key:string]:unknown};
export const kinds:Record<string,string>={branch:'Rama',subbranch:'Subrama',course:'Asignatura',period:'Período',unit:'Unidad',topic:'Tema',resource:'Recurso',research:'Investigación',profile:'Perfil'};
export function ancestry(item:Item, all:Item[]):Item[]{const out:Item[]=[];const visited=new Set([item.id]);let p=item.parent||(item.kind==='resource'?item.links?.[0]:undefined);while(p&&!visited.has(p)){visited.add(p);const x=all.find(i=>i.id===p);if(!x)break;out.unshift(x);p=x.parent;}return out;}
export function descendants(id:string,all:Item[]):Item[]{return all.filter(i=>ancestry(i,all).some(p=>p.id===id));}
export function safeUrl(url:unknown){if(typeof url!=='string')return '';try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}




export function educationLabel(item:Item,all:Item[]):string {const path=[...ancestry(item,all),item];if(path.some(i=>['octavo','noveno'].includes(i.id)))return 'Educación básica secundaria';if(path.some(i=>['decimo','once'].includes(i.id)))return 'Educación media';if(path.some(i=>['sub-metabolomica','sub-volatilomica'].includes(i.id)))return 'Posgrado';if(path.some(i=>i.kind==='branch'))return 'Pregrado';return '';}

