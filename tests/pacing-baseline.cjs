const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8').trimEnd();
assert.ok(source.endsWith('})();'));
const canvasContext=new Proxy({}, {get:(target,key)=>target[key]||(()=>{}),set:(target,key,value)=>(target[key]=value,true)});
for(const policy of ['auto','combat','gather']){
const store=new Map();
const canvas={getContext:()=>canvasContext,addEventListener:()=>{},setPointerCapture:()=>{}};
const listeners={};
const context={document:{hidden:false,getElementById:()=>canvas,addEventListener:()=>{}},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},performance:{now:()=>0},innerWidth:390,innerHeight:740,devicePixelRatio:1,addEventListener:(key,fn)=>listeners[key]=fn,setInterval:()=>{},requestAnimationFrame:()=>{},console};
const rng=Object.create(Math);let seed=123456; rng.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};context.Math=rng;
const injection=' globalThis.__test={p,buttons,bosses,nodes,gain,zoneLimit,nextGoal,save,update,setAuto:v=>{autoMove=v},setMode:v=>{mode=v}};})();';
vm.runInNewContext(source.slice(0,-5)+injection,context,{filename:'game.js'});
const {p,buttons,zoneLimit,update,setAuto,setMode}=context.__test;

// Fresh save, natural update loop, automatic movement and affordable permanent crafting only.
setAuto(true);setMode(policy);
const milestones=new Set([300,900,1800,3600]);
for(let tick=1;tick<=36000;tick++){
 update(.1);
 if(tick%10===0){
  for(const b of buttons)if(!['enhancementStone','protectionStone'].includes(b.id)&&b.show()&&b.enabled())b.act();
  const time=tick/10;
  if(milestones.has(time)){
   if(policy==='auto'&&time===300){
    assert.ok(p.bossKills.includes('boss1'),'goal-directed auto should unlock the mine within five simulated minutes');
    assert.ok(p.iron>=0,'mine resources remain nonnegative');
   }
   if(policy==='auto'&&time===3600){
    assert.ok(p.bossKills.includes('boss2'),'goal-directed auto should eventually clear the third boss');
    assert.equal(p.relicBlade,true,'goal-directed auto should complete the guardian blade');
   }
   assert.ok([p.x,p.y,p.atk,p.def,p.hp,p.gold].every(Number.isFinite));
   assert.ok([p.wood,p.stone,p.iron,p.gold].every(n=>n>=0));
   console.log('P3 baseline '+JSON.stringify({policy,seconds:time,kills:p.kills,level:p.level,atk:p.atk,def:p.def,maxHp:p.max,gold:p.gold,wood:p.wood,stone:p.stone,iron:p.iron,bosses:p.bossKills.slice(),zone:zoneLimit(),gear:buttons.filter(b=>!['enhancementStone','protectionStone'].includes(b.id)&&p[b.id==='bench'?'workbench':b.id]).map(b=>b.id)}));
  }
 }
}

}
