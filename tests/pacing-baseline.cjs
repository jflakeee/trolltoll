const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8').trimEnd();
assert.ok(source.endsWith('})();'));
assert.match(source,/범위 밖으로 회피!/,'boss slam must show dodge instructions');
assert.match(source,/bossWindupProgress\(e\)/,'boss warning must render remaining windup progress');
const duration=vm.runInNewContext(source.slice(source.indexOf('function bossWindupDuration('),source.indexOf('function dragMovement('))+';bossWindupDuration');
assert.strictEqual(duration({i:31}),1.1);
assert.strictEqual(duration({i:32}),0.9);
assert.strictEqual(duration({i:33}),0.7);
assert.match(source,/회피 성공!/,'successful boss slam evasion must give feedback');
assert.match(source,/const heal=Math\.min\(4,Math\.max\(0,p\.max-p\.hp\)\)/,'boss dodge healing must be capped by missing HP');
assert.match(source,/p\.gold\+=2;burst\(p\.x,p\.y/,'boss dodge reward should include gold and a visible burst');
assert.match(source,/e\.warningStartX=p\.x;e\.warningStartY=p\.y/,'boss dodge must remember warning start position');
assert.match(source,/moved>=20&&\(e\.dodgeRewardCooldown\|\|0\)<=0/,'boss reward requires actual movement and expired cooldown');
assert.match(source,/e\.dodgeRewardCooldown=12/,'boss reward cooldown must limit farming');
assert.match(source,/강타 범위 밖 · 안전/,'standing safely outside should not grant rewards');
const warningLabel=vm.runInNewContext(source.slice(source.indexOf('function bossWarningLabel('),source.indexOf('function dist('))+';bossWarningLabel');
const edgeLabel=warningLabel(-50,30,360,640,null);
assert.ok(edgeLabel.x>=116&&edgeLabel.y>=78,'boss warning text should stay inside narrow viewport');
const stick={sx:180,sy:470};
const dodgeLabel=warningLabel(180,538,360,640,stick);
assert.ok(Math.hypot(dodgeLabel.x-stick.sx,dodgeLabel.y-stick.sy)>=110,'warning text should not overlap active joystick');
const dragMovement=vm.runInNewContext(source.slice(source.indexOf('function dragMovement('),source.indexOf('function dist('))+';dragMovement');
assert.strictEqual(dragMovement(8,0).x,0,'small touches should remain within the drag deadzone');
assert.ok(dragMovement(24,0).x>.7,'short mobile drags should respond quickly');
assert.strictEqual(dragMovement(32,0).x,1,'moderate drags should reach full speed');
assert.ok(Math.abs(Math.hypot(...Object.values(dragMovement(120,120)))-1)<1e-9,'large diagonal drags should remain speed capped');
assert.match(source,/ctx\.ellipse\(q\.x,q\.y,warning\.x,warning\.y/,'boss warning must use projected radii');
const warningRadii=vm.runInNewContext(source.match(/function bossWarningRadii\(radius\)\{[^}]+\}\}/)[0]+';bossWarningRadii');
for(const radius of [85,105,125]){
 const projected=warningRadii(radius);
 assert.ok(Math.abs(projected.x-radius*.7*Math.SQRT2)<1e-9);
 assert.ok(Math.abs(projected.y-radius*.35*Math.SQRT2)<1e-9);
}

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
const bossFirstClear={};
for(let tick=1;tick<=36000;tick++){
 update(.1);
 if(policy==='auto')for(const id of p.bossKills)if(bossFirstClear[id]===undefined)bossFirstClear[id]=tick/10;
 if(tick%10===0){
  for(const b of buttons)if(!['enhancementStone','protectionStone'].includes(b.id)&&b.show()&&b.enabled())b.act();
  const time=tick/10;
  if(milestones.has(time)){
   if(policy==='auto'&&time===300){
    assert.ok(p.bossKills.includes('boss0'),'goal-directed auto should clear the first boss within five simulated minutes');
    assert.ok(p.iron>=0,'mine resources remain nonnegative');
   }
   if(policy==='auto'&&time===3600){
    assert.ok(p.bossKills.includes('boss2'),'goal-directed auto should eventually clear the third boss');
    assert.equal(p.relicBlade,true,'goal-directed auto should complete the guardian blade');
    assert.ok(p.wood<500&&p.stone<500&&p.iron<100,'completed goals should stop unneeded resource accumulation');
    assert.ok(p.kills<500,'completed goals should not cause endless automatic kill farming');
    assert.ok(bossFirstClear.boss0>=30,'first boss should require preparation');
    assert.ok(bossFirstClear.boss1>bossFirstClear.boss0,'second boss must follow the first');
    assert.ok(bossFirstClear.boss2>bossFirstClear.boss1,'third boss must follow the second');
    assert.ok(bossFirstClear.boss2>=300,'final boss should not fall in the first five minutes');
    assert.ok(bossFirstClear.boss2<=1800,'automatic progression should not stall for over thirty minutes');
    console.log('P3 boss first clears '+JSON.stringify(bossFirstClear));
   }
   assert.ok([p.x,p.y,p.atk,p.def,p.hp,p.gold].every(Number.isFinite));
   assert.ok([p.wood,p.stone,p.iron,p.gold].every(n=>n>=0));
   console.log('P3 baseline '+JSON.stringify({policy,seconds:time,kills:p.kills,level:p.level,atk:p.atk,def:p.def,maxHp:p.max,gold:p.gold,wood:p.wood,stone:p.stone,iron:p.iron,bosses:p.bossKills.slice(),zone:zoneLimit(),gear:buttons.filter(b=>!['enhancementStone','protectionStone'].includes(b.id)&&p[b.id==='bench'?'workbench':b.id]).map(b=>b.id)}));
  }
 }
}

}
