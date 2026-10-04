import assert from 'node:assert/strict';
import {build} from 'esbuild';
const make=(id,kind,parent)=>({id,kind,parent,title:id,status:'published',position:0});
let teacher=false, visible=[], reads=0;
const content=[make('branch','branch'),make('course','course','branch'),make('unit','unit','course'),make('topic','topic','unit')];
const stored={id:'deck',topic:'topic',title:'Deck',keys:['presentations/deck/0.webp']};
globalThis.presentationTest={
 authorized:async()=>teacher,
 allItems:async()=>visible,
 sameOrigin:req=>req.headers.get('origin')===new URL(req.url).origin,
 bindings:()=>({DB:{prepare:()=>({all:async()=>({results:[{data:JSON.stringify(stored)}]})})},BUCKET:{get:async()=>{reads++;return {body:new Uint8Array([1,2,3])}}}})
};
const result=await build({entryPoints:['app/api/presentations/route.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'mock-server',setup(build){build.onResolve({filter:/lib\/server$/},()=>({path:'server',namespace:'mock'}));build.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const {authorized,allItems,sameOrigin,bindings}=globalThis.presentationTest;'}));}}]});
const api=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const req=(q='',options)=>new Request('https://school.test/api/presentations?topic=topic'+q,options);
assert.equal((await api.GET(req())).status,404,'Anonymous cannot list');
assert.equal((await api.GET(req('&presentation=deck&page=0'))).status,404);
visible=content;
const list=await api.GET(req());assert.equal(list.status,200);
assert.deepEqual((await list.json()).presentations,[{id:'deck',title:'Deck',pages:1}]);
assert.equal((await api.GET(req('&presentation=deck&page=0'))).status,200);
assert.equal((await api.GET(req('&presentation=deck&page=1'))).status,404);
assert.equal((await api.GET(req('&presentation=other&page=0'))).status,404);
visible=content.filter(item=>item.id!=='topic');
assert.equal((await api.GET(req('&presentation=deck&page=0'))).status,404,'Other course cannot read slide');
assert.equal(reads,1,'Unauthorized requests must never read R2');
assert.equal((await api.POST(req('',{method:'POST',headers:{Origin:'https://school.test'}}))).status,403);
assert.equal((await api.DELETE(req('&presentation=deck',{method:'DELETE',headers:{Origin:'https://school.test'}}))).status,403);
teacher=true;
assert.equal((await api.POST(req('',{method:'POST',headers:{Origin:'https://other.test'}}))).status,403);
assert.equal((await api.DELETE(req('&presentation=deck',{method:'DELETE',headers:{Origin:'https://other.test'}}))).status,403);
console.log('PASS: presentation metadata and slides require topic access; other courses and anonymous readers denied; upload/delete teacher-only and same-origin.');
