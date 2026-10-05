import assert from 'node:assert/strict';
import {build} from 'esbuild';
const result=await build({entryPoints:['lib/didactic-embeds.ts'],bundle:true,write:false,format:'esm'});
const {didacticEmbed}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
assert.equal(didacticEmbed('https://youtu.be/abcdefghijk').src,'https://www.youtube-nocookie.com/embed/abcdefghijk');
assert.equal(didacticEmbed('https://sketchfab.com/3d-models/cell-0123456789abcdef0123456789abcdef').src,'https://sketchfab.com/models/0123456789abcdef0123456789abcdef/embed');
assert.ok(didacticEmbed('https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_es.html'));
for(const url of ['javascript:alert(1)','https://sketchfab.com.evil.test/models/0123456789abcdef0123456789abcdef','https://user:pass@sketchfab.com/models/0123456789abcdef0123456789abcdef','https://phet.colorado.edu/en/simulations','http://youtu.be/abcdefghijk'])assert.equal(didacticEmbed(url),undefined,url);
console.log('PASS: supported resource URLs normalized; unsupported and unsafe URLs are not embedded.');
