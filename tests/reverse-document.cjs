'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const game=fs.readFileSync('game.js','utf8');
const index=fs.readFileSync('design/gdd/systems-index.md','utf8');
const specs=[
 ['enhancement-system.md','Enhancement & protection',['function attemptEnhancement()','function enhancePreview()','function enhancementBonus()']],
 ['save-load-system.md','Save/load & migration',['function save()',"const KEY_V3='trolltoll_web_v3'"]],
 ['auto-combat-system.md','Auto combat & damage',['function gain(e)','function update(dt)','const bosses=']]
];
for(const [file,name,markers] of specs){
 const path='design/gdd/'+file;
 const doc=fs.readFileSync(path,'utf8');
 assert.match(doc,/Reverse-documented from implementation/);
 assert.match(doc,/INTENT UNKNOWN/);
 for(const heading of ['## 1. Overview','## 2. Detailed Design','## 3. Formulas Discovered','## 4. Edge Cases and Dependencies','## 5. Acceptance Criteria'])assert.ok(doc.includes(heading),path+' missing '+heading);
 assert.match(doc,/Review:\*\* pending/);
 for(const marker of markers)assert.ok(game.includes(marker),path+' source marker absent: '+marker);
 const row=index.split('\n').find(x=>x.startsWith('| ')&&x.includes('| '+name+' |'));
 assert.ok(row&&row.includes('`'+path+'`'),name+' missing index link');
}
const chance=JSON.parse(fs.readFileSync('data/enhancement.json','utf8')).chance;
assert.equal(chance.length,15);
assert.equal(chance[0],1);
assert.equal(chance[14],.03);
assert.ok(fs.readFileSync('src/rules/save-v3.cjs','utf8').includes('function migrateSave'));
assert.ok(fs.readFileSync('src/rules/enhancement.cjs','utf8').includes('function executeAttempt'));
console.log('Three reverse-documented GDDs linked, source markers and formulas verified');
