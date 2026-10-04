import assert from 'node:assert/strict';
import {build} from 'esbuild';
const bundle = await build({stdin: {contents: `export {seed} from './lib/content-data'; export {mergeContent} from './lib/curriculum'; export {courseNotes,lessonId} from './lib/university-lessons'; export {presentationTopic} from './lib/presentations'; export {ancestry} from './lib/content';`, resolveDir: process.cwd()}, bundle:true, platform:'node', format:'esm', write:false, plugins:[{name:'server-only-test',setup(build){build.onResolve({filter:/^server-only$/},()=>({path:'empty',namespace:'test'}));build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:''}));}}]});
const {seed,mergeContent,courseNotes,lessonId,presentationTopic,ancestry}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const items=mergeContent([],seed);
let expected=0;
for(const [slug,course] of Object.entries(courseNotes)) {
 assert.equal(course.lessons.length,['metabolomica','volatilomica'].includes(slug)?42:18,slug+' lesson count');
 course.lessons.forEach((lesson,n)=>{
  const id=lessonId(slug,n),topic=items.find(item=>item.id===id);
  assert.ok(topic,'Missing topic '+id);
  assert.equal(topic.kind,'topic');
  assert.ok(topic.body.includes(lesson[0]),'Missing summary '+id);
  assert.ok(topic.examples.includes(lesson[1]),'Missing application '+id);
  assert.ok(topic.bibliography.includes('https://'),'Missing reading '+id);
  assert.ok(presentationTopic(items,id),'Presentations disabled '+id);
  expected++;
 });
}
const university=items.filter(item=>item.kind==='topic'&&ancestry(item,items).some(parent=>parent.kind==='branch'));
for(const topic of university){
 assert.ok(presentationTopic(items,topic.id),'Missing presentation slot '+topic.id);
 assert.ok(topic.body.length>150,'Undeveloped topic '+topic.id);
 assert.ok(!/pendientes de publicaci|explicación.*pendiente|Espacio preparado para desarrollar/.test(topic.body),'Placeholder '+topic.id);
}
const original=items.find(item=>item.id===lessonId('general-i',0));
const edited={...original,updatedAt:'2026-10-04T12:00:00Z',body:'Texto propio del docente',examples:'',bibliography:'Fuente propia'};
const preserved=mergeContent([edited],seed).find(item=>item.id===edited.id);
assert.equal(preserved.body,edited.body);assert.equal(preserved.examples,'');assert.equal(preserved.bibliography,edited.bibliography);
const legacy={...seed.find(item=>item.id===original.id),body:'Tema pendiente',example:true};
assert.ok(mergeContent([legacy],seed).find(item=>item.id===original.id).body.includes('Resumen del tema'));
assert.equal(presentationTopic(items,'materia'),undefined,'School topic incorrectly reclassified');
console.log(`PASS: ${expected} new topic summaries; ${university.length} university topics with presentation slots and developed text; teacher edits preserved.`);
console.log(Object.entries(courseNotes).map(([slug,c])=>slug+': '+c.lessons.length).join('\n'));
