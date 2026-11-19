const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8').trimEnd();
assert.ok(source.endsWith('})();'));
const canvasContext=new Proxy({}, {get:(target,key)=>target[key]||(()=>{}),set:(target,key,value)=>(target[key]=value,true)});
const store=new Map();
const canvas={getContext:()=>canvasContext,addEventListener:()=>{},setPointerCapture:()=>{}};
const listeners={};
const context={document:{hidden:false,getElementById:()=>canvas,addEventListener:()=>{}},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},performance:{now:()=>0},innerWidth:390,innerHeight:740,devicePixelRatio:1,addEventListener:(key,fn)=>listeners[key]=fn,setInterval:()=>{},requestAnimationFrame:()=>{},console};
const rng=Object.create(Math);let seed=123456; rng.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};context.Math=rng;
const injection=' globalThis.__test={p,buttons,bosses,nodes,gain,zoneLimit,nextGoal,save,update,setAuto:v=>{autoMove=v}};})();';
vm.runInNewContext(source.slice(0,-5)+injection,context,{filename:'game.js'});
const {p,buttons,zoneLimit,update,setAuto}=context.__test;

// Fresh save, natural update loop, automatic movement and affordable permanent crafting only.
setAuto(true);
const milestones=new Set([300,900,1800,3600]);
for(let tick=1;tick<=36000;tick++){
 update(.1);
 if(tick%10===0){
  for(const b of buttons)if(!['enhancementStone','protectionStone'].includes(b.id)&&b.show()&&b.enabled())b.act();
  const time=tick/10;
  if(milestones.has(time)){
   assert.ok([p.x,p.y,p.atk,p.def,p.hp,p.gold].every(Number.isFinite));
   assert.ok([p.wood,p.stone,p.iron,p.gold].every(n=>n>=0));
   console.log('P3 baseline '+JSON.stringify({seconds:time,kills:p.kills,level:p.level,atk:p.atk,def:p.def,maxHp:p.max,gold:p.gold,wood:p.wood,stone:p.stone,iron:p.iron,bosses:p.bossKills.slice(),zone:zoneLimit(),gear:buttons.filter(b=>!['enhancementStone','protectionStone'].includes(b.id)&&p[b.id]).map(b=>b.id)}));
  }
 }
}
