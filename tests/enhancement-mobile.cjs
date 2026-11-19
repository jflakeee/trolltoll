'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('game.js','utf8').replace(/\}\)\(\);\s*$/, 'globalThis.__probe={p,progression,attemptEnhancement,enhanceTop,enhanceLeft,enhancePanelHeight,compactHUD};})();');
const storage=new Map(),handlers={},windowHandlers={};
const context2d=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
const canvas={getContext:()=>context2d,addEventListener:(event,fn)=>handlers[event]=fn,setPointerCapture:()=>{},dataset:{}};
const rng=Object.create(Math);rng.random=()=>.99;
const ctx={document:{hidden:false,getElementById:()=>canvas,addEventListener:()=>{}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},innerWidth:390,innerHeight:740,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame:()=>{},setInterval:()=>{},addEventListener:(event,fn)=>windowHandlers[event]=fn,console,Math:rng};
vm.runInNewContext(source,ctx);
const {p,progression,attemptEnhancement,enhanceTop,enhancePanelHeight}=ctx.__probe;
p.forge=true;p.gold=100000;p.iron=10000;
progression.inventory.enhancementStone=1000;
progression.inventory.protectionStone=2;
const weapon=progression.equipment.mainWeapon;
weapon.enhancementLevel=8;weapon.highestEnhancementLevel=8;
assert.equal(enhancePanelHeight(),134);
const y=enhanceTop()+100;
const x=ctx.__probe.enhanceLeft();
handlers.pointerdown({clientX:x+44,clientY:y,pointerId:1});
assert.equal(progression.inventory.protectionStone,2,'toggle does not consume stone');
handlers.pointerdown({clientX:x+124,clientY:y,pointerId:2});
assert.equal(weapon.enhancementLevel,8,'protected failure must not downgrade');
assert.equal(progression.inventory.protectionStone,1,'protected attempt consumes stone');
assert.equal(weapon.failuresByLevel[8],1,'protected failure counts toward pity');
handlers.pointerdown({clientX:x+44,clientY:y,pointerId:3});
handlers.pointerdown({clientX:x+124,clientY:y,pointerId:4});
assert.equal(weapon.enhancementLevel,7,'unprotected failure downgrades');
assert.equal(progression.inventory.protectionStone,1,'unprotected attempt preserves stone');
assert.equal(JSON.parse(storage.get('trolltoll_web_v3')).progression.equipment.mainWeapon.enhancementLevel,7);
// Portrait enhancement panel must not intercept either bottom-right control.
for(const [width,height] of [[320,640],[360,800],[390,740]]){
  ctx.innerWidth=width;ctx.innerHeight=height;
  windowHandlers.resize();
  assert.ok(enhanceTop()+enhancePanelHeight()<=height-145,
    'enhancement panel must stay above auto-move hit area at '+width+'x'+height);
  assert.ok(ctx.__probe.enhanceLeft()>=0&&ctx.__probe.enhanceLeft()+164<=width,
    'enhancement panel must stay within viewport');
}
// Re-run the same touch path in short landscape dimensions.
ctx.innerWidth=640;ctx.innerHeight=320;
windowHandlers.resize();
const shortX=ctx.__probe.enhanceLeft(),shortY=enhanceTop()+100;
assert.equal(shortX,10,'short landscape moves panel to left');
assert.equal(enhanceTop(),100,'short landscape places panel above bottom controls');
handlers.pointerdown({clientX:shortX+124,clientY:shortY,pointerId:5});
assert.equal(weapon.enhancementLevel,6,'landscape enhancement touch must work');
// Rotating to a short landscape must clear the HUD without losing portrait preference.
ctx.innerWidth=320;ctx.innerHeight=480;windowHandlers.resize();
assert.equal(ctx.__probe.compactHUD(),true,'short portrait forces compact HUD');
assert.ok(enhanceTop()>=76,'short portrait enhancement clears HUD');
ctx.innerWidth=640;ctx.innerHeight=320;windowHandlers.resize();
const tapHUD=()=>handlers.pointerdown({clientX:40,clientY:25,pointerId:6});
const compact=ctx.__probe.compactHUD;
assert.equal(compact(),true,'short landscape forces compact HUD');
assert.ok(enhanceTop()>=76,'enhancement must start below compact HUD');
tapHUD();
ctx.innerWidth=390;ctx.innerHeight=740;windowHandlers.resize();
assert.equal(compact(),false,'landscape tap must not alter expanded portrait preference');
tapHUD();
assert.equal(compact(),true,'portrait HUD can still collapse');
ctx.innerWidth=800;ctx.innerHeight=360;windowHandlers.resize();
assert.equal(compact(),true,'rotated compact HUD remains compact');
ctx.innerWidth=390;ctx.innerHeight=740;windowHandlers.resize();
assert.equal(compact(),true,'rotation preserves collapsed portrait preference');
tapHUD();
assert.equal(compact(),false,'portrait HUD can expand again');
console.log('mobile enhancement controls and protection tests passed');
