'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const rules=JSON.parse(fs.readFileSync('data/enhancement.json','utf8'));
const pure=require('../src/rules/enhancement.cjs');
const source=fs.readFileSync('game.js','utf8').replace(/\}\)\(\);\s*$/,'globalThis.__test={p,progression,enhancePreview,attemptEnhancement,totalAttack,setProtection:v=>{protectEnhancement=v}};})();');
pure.validateRules(rules);
function boot(roll){
 const storage=new Map(),math=Object.create(Math);math.random=()=>roll;
 const ctx2d=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const canvas={getContext:()=>ctx2d,addEventListener:()=>{},setPointerCapture:()=>{},dataset:{}};
 const context={document:{hidden:false,getElementById:()=>canvas,addEventListener:()=>{}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},innerWidth:390,innerHeight:740,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame:()=>{},setInterval:()=>{},addEventListener:()=>{},console:{warn:()=>{}},Math:math};
 vm.runInNewContext(source,context);
 return {state:context.__test,storage};
}
function run(level,protect,roll,failures=0){
 const {state:s,storage}=boot(roll),w=s.progression.equipment.mainWeapon;
 s.p.forge=true;s.p.gold=100000;s.p.iron=100000;s.p.atk=25;
 s.progression.inventory.enhancementStone=10000;s.progression.inventory.protectionStone=100;
 w.enhancementLevel=level;w.highestEnhancementLevel=level;w.failuresByLevel[level]=failures;
 s.setProtection(protect);
 const before={gold:s.p.gold,iron:s.p.iron,enhancementStone:s.progression.inventory.enhancementStone,protectionStone:s.progression.inventory.protectionStone};
 const eq={enhancementLevel:level,highestEnhancementLevel:level,failuresByLevel:{[level]:failures}};
 const purePreview=level===15?pure.getPreview({rules,inventory:before,equipment:eq,useProtection:protect}):pure.getPreview({rules,inventory:before,equipment:eq,useProtection:protect});
 const preview=s.enhancePreview();
 if(level===15){
  assert.equal(preview,null);assert.equal(purePreview.reason,'MAX_LEVEL');assert.equal(s.attemptEnhancement(),false);assert.equal(s.p.gold,before.gold);return;
 }
 assert.equal(preview.chance,rules.chance[level]);assert.equal(preview.gold,rules.gold[level]);assert.equal(preview.iron,rules.iron[level]);assert.equal(preview.stone,rules.enhancementStone[level]);
 assert.equal(preview.guaranteed,purePreview.guaranteed);
 const expected=pure.executeAttempt({rules,inventory:before,equipment:eq,useProtection:protect,rng:()=>roll});
 const actual=s.attemptEnhancement();
 assert.equal(actual,expected.success,'success level '+level);
 assert.equal(w.enhancementLevel,expected.equipment.enhancementLevel,'level '+level);
 assert.equal(w.highestEnhancementLevel,expected.equipment.highestEnhancementLevel);
 assert.equal(w.failuresByLevel[level],expected.equipment.failuresByLevel[level]);
 for(const k of ['gold','iron'])assert.equal(s.p[k],expected.inventory[k],k+' level '+level);
 for(const k of ['enhancementStone','protectionStone'])assert.equal(s.progression.inventory[k],expected.inventory[k],k+' level '+level);
 assert.equal(s.totalAttack(),s.p.atk+pure.attackBonus(w.enhancementLevel));
 const saved=JSON.parse(storage.get('trolltoll_web_v3'));
 assert.equal(saved.progression.equipment.mainWeapon.enhancementLevel,w.enhancementLevel,'save level '+level);
 assert.equal(saved.progression.inventory.protectionStone,s.progression.inventory.protectionStone);
}
for(let level=0;level<15;level++){
 for(const protect of [false,true]){
  run(level,protect,0);
  run(level,protect,.999);
  if(rules.pityCap[level]!==null)run(level,protect,.999,rules.pityCap[level]-1);
 }
}
run(15,false,.1);
run(15,true,.1);
// Forge/resource validation must not spend currency or persist an attempt.
for(const protect of [false,true]){
 const {state:s,storage}=boot(.01),w=s.progression.equipment.mainWeapon;
 w.enhancementLevel=5;w.highestEnhancementLevel=5;s.p.gold=9999;s.p.iron=9999;s.progression.inventory.enhancementStone=9999;s.progression.inventory.protectionStone=0;
 s.setProtection(protect);
 assert.equal(s.attemptEnhancement(),false,'forge missing');
 assert.equal(s.p.gold,9999);
 s.p.forge=true;
 if(protect)assert.equal(s.attemptEnhancement(),false,'protection stone missing');
 else{s.p.gold=0;assert.equal(s.attemptEnhancement(),false,'gold missing')}
 assert.equal(w.enhancementLevel,5);
 assert.equal(storage.has('trolltoll_web_v3'),false,'invalid attempt must not save');
}
console.log('Enhancement browser/pure parity: 15 levels, protection, failure, pity, attack and persistence');
