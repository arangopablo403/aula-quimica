import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtempSync,writeFileSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const bundle=await build({stdin:{contents:`export {seed} from './lib/content-data';export {mergeContent} from './lib/curriculum';export {volatileWeeks,volatileReadings,volatileCourseId,volatileLabId,topicId} from './lib/volatilomics-course';export {gcmsReader} from './lib/gcms-python-course';export {presentationTopic} from './lib/presentations';export {courseContent} from './lib/course-access';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'server-only',setup(b){b.onResolve({filter:/^server-only$/},()=>({path:'empty',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:''}));}}]});
const m=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const items=m.mergeContent([],m.seed);
assert.equal(m.volatileWeeks.length,6);
assert.equal(new Set(items.map(i=>i.id)).size,items.length);
for(const w of m.volatileWeeks){assert.equal(w.topics.length,5);w.topics.forEach((t,n)=>{const id=m.topicId(w.id,n);const item=items.find(i=>i.id===id);assert.ok(item.bibliography.includes('https://'));assert.ok(m.presentationTopic(items,id));for(const r of t.refs)assert.ok(m.volatileReadings[r],r);});}
assert.ok(items.find(i=>i.id===m.volatileLabId));
assert.equal(items.filter(i=>i.kind==='topic'&&i.id.startsWith('pregrado-volatilomica-')).length,42,'Existing topics and links retained');
const original=items.find(i=>i.id===m.topicId(m.volatileWeeks[0].id,0));
const edited={...original,body:'Texto del docente',updatedAt:'2026-10-06'};
assert.equal(m.mergeContent([edited],m.seed).find(i=>i.id===edited.id).body,'Texto del docente');
assert.ok(m.courseContent(items,[m.volatileCourseId]).some(i=>i.id===m.volatileLabId));
assert.ok(!m.courseContent(items,['noveno']).some(i=>i.id===m.volatileLabId));
console.log('PASS: six weeks, 30 topics, references, presentation slots, legacy content, teacher edits and course isolation.');
if(process.env.AULA_TEST_PYTHON){
 const dir=mkdtempSync(join(tmpdir(),'aula-gcms-'));const file=join(dir,'gcms_taller.py');writeFileSync(file,m.gcmsReader);
 const tests=`from gcms_taller import chromatograms,minutes\nclass Time(float):\n    unit_info='second'\ndef scan(t):\n    return {'ms level':1,'centroid spectrum':True,'scanList':{'scan':[{'scan start time':Time(t)}]},'m/z array':[92,93,94],'intensity array':[1,5,2]}\nrows=chromatograms([scan(60),scan(120),scan(180)],93,.5)\nassert rows==[(1.,8.,5.),(2.,8.,5.),(3.,8.,5.)]\ntry:\n    minutes(1)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError('Unknown units accepted')\ntry:\n    chromatograms([scan(60),scan(60),scan(180)],93,.5)\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError('Duplicate times accepted')\nprint('PASS: time units, TIC/EIC and invalid time rejection')\n`;
 writeFileSync(join(dir,'check.py'),tests);
 for(const args of [[join(dir,'check.py')],[file,'--demo','--out',join(dir,'demo')]]){const r=spawnSync(process.env.AULA_TEST_PYTHON,args,{encoding:'utf8'});assert.equal(r.status,0,r.stderr);console.log(r.stdout.trim());}
 assert.equal(readFileSync(join(dir,'demo','cromatogramas.csv'),'utf8').trim().split('\n').length,122);
 assert.equal(JSON.parse(readFileSync(join(dir,'demo','parametros.json'),'utf8')).demo,true);
 console.log('PASS: reproducible synthetic demo and output files. Real instrument mzML requires laboratory validation.');
}
