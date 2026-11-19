'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('game.js','utf8').replace(/\}\)\(\);\s*$/,'globalThis.__test={p,enemies,nodes,progression,update,autoMoveTarget,keys,choose:id=>{selected=id},setMode:v=>{mode=v},setAuto:v=>{autoMove=v},getState:()=>({selected,work,autoTargetId}),getMode:()=>mode};})();');
function boot(){
 const handlers={},storage=new Map(),ctx2d=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const canvas={getContext:()=>ctx2d,addEventListener:(event,fn)=>handlers[event]=fn,setPointerCapture:()=>{},dataset:{}};
 const math=Object.create(Math);math.random=()=>.999;
 const context={document:{hidden:false,getElementById:()=>canvas,addEventListener:()=>{}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},innerWidth:390,innerHeight:740,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame:()=>{},setInterval:()=>{},addEventListener:()=>{},console:{warn:()=>{}},Math:math};
 vm.runInNewContext(source,context);
 const s=context.__test;
 for(const e of s.enemies)e.dead=1000;
 for(const n of s.nodes)n.respawn=1000;
 s.p.x=0;s.p.y=0;s.p.hp=1000;s.p.max=1000;s.p.atk=10;s.p.def=999;s.p.cd=0;
 return {s,storage,handlers,canvas};
}
function enemy(s,x=40,y=0){const e=s.enemies[0];Object.assign(e,{x,y,dead:0,health:300,hp:300,cd:99});return e}
function node(s,x=45,y=0){const n=s.nodes[0];Object.assign(n,{kind:'tree',x,y,stock:3,respawn:0});return n}
// Auto mode chooses nearest eligible target; combat/gather mode overrides distance.
{
 const {s}=boot(),e=enemy(s,60),n=node(s,30);
 s.setMode('auto');assert.equal(s.autoMoveTarget().id,n.id);
 s.setMode('combat');assert.equal(s.autoMoveTarget().id,e.id);
 s.setMode('gather');assert.equal(s.autoMoveTarget().id,n.id);
 n.respawn=100;s.setMode('gather');assert.equal(s.autoMoveTarget().id,e.id,'gather falls back to enemy');
 e.dead=100;s.setMode('combat');assert.equal(s.autoMoveTarget(),null,'no eligible targets');
}
// Attack and gather priorities in action range, and manual selection override.
{
 const {s}=boot(),e=enemy(s,42),n=node(s,30);
 s.setMode('combat');s.update(.1);assert.equal(e.health,290,'combat mode attacks enemy');assert.equal(n.stock,3);
 s.p.cd=0;s.setMode('gather');s.update(.1);assert.equal(e.health,290,'gather mode does not attack when a node is available');
 assert.equal(s.getState().work.id,n.id,'gather work starts');
 s.choose(e.id);s.p.cd=0;s.update(.1);assert.equal(e.health,280,'explicit selected enemy overrides gather mode');
 assert.equal(s.getState().work,null,'attacking cancels gathering');
 s.choose(null);s.setMode('gather');for(let i=0;i<21;i++)s.update(.1);
 assert.ok(n.stock<3,'gather completes and depletes stock');
 assert.ok(s.p.wood>=3,'gather rewards materials immediately');
}
// Cooldown, immediate kill growth and persisted rewards.
{
 const {s,storage}=boot(),e=enemy(s,45);
 e.health=5;e.stat='atk';e.xp=0;
 const oldAtk=s.p.atk,oldGold=s.p.gold,oldKills=s.p.kills;
 s.setMode('combat');s.update(.1);
 assert.equal(e.dead,4);assert.equal(s.p.atk,oldAtk+1);assert.equal(s.p.gold,oldGold+3);assert.equal(s.p.kills,oldKills+1);
 assert.equal(JSON.parse(storage.get('trolltoll_web_v3')).legacy.atk,s.p.atk,'kill persisted');
 s.update(.1);assert.equal(s.p.kills,oldKills+1,'dead enemy cannot be killed twice');
}
// Manual movement overrides auto-navigation; after release, auto-targeting resumes.
{
 const {s}=boot(),e=enemy(s,180,0);
 s.setAuto(true);s.setMode('combat');s.keys.add('a');
 const before=s.p.x;s.update(.1);assert.ok(s.p.x<before,'manual A movement wins over auto move toward enemy');
 s.keys.delete('a');
 const afterManual=s.p.x;s.update(.1);assert.ok(s.p.x>afterManual,'auto move resumes toward enemy');
 assert.equal(s.getState().autoTargetId,e.id);
}
// Real action-mode button transitions discard stale selection and partial work.
{
 const {s,handlers,canvas}=boot(),e=enemy(s,42),n=node(s,30);
 const tap=(x,y)=>handlers.pointerdown({clientX:x,clientY:y,pointerId:1});
 s.setMode('gather');s.choose(n.id);s.update(.1);
 assert.equal(s.getState().work.id,n.id);
 const wood=s.p.wood;
 tap(340,690); // gather -> auto
 assert.equal(canvas.dataset.actionMode,'auto');
 assert.equal(s.getState().work,null);
 assert.equal(s.getState().selected,null);
 tap(340,690); // auto -> combat
 assert.equal(canvas.dataset.actionMode,'combat');
 s.p.cd=0;s.update(.1);
 assert.equal(e.health,290);
 assert.equal(n.stock,3);
 assert.equal(s.p.wood,wood,'cancelled gather must not grant materials');
 tap(340,620); // automatic movement on
 assert.equal(canvas.dataset.autoMove,'true');
 s.update(.1);
 assert.equal(s.getState().autoTargetId,e.id);
 tap(340,620); // automatic movement off
 assert.equal(canvas.dataset.autoMove,'false');
 assert.equal(s.getState().autoTargetId,null);
 assert.equal(s.getState().selected,null);
}
// Existing target hysteresis must never retain exhausted or defeated targets.
{
 const {s}=boot(),e=enemy(s,60),n=node(s,30);
 s.setMode('gather');s.setAuto(true);
 assert.equal(s.autoMoveTarget().id,n.id);
 n.respawn=12;n.stock=0;
 assert.equal(s.autoMoveTarget().id,e.id,'exhausted node must be abandoned');
 e.dead=4;
 assert.equal(s.autoMoveTarget(),null,'no live targets must clear navigation');
 assert.equal(s.getState().autoTargetId,null);
 e.dead=0;e.health=e.hp;
 assert.equal(s.autoMoveTarget().id,e.id,'respawned enemy must be eligible');
 n.respawn=0;n.stock=3;
 assert.equal(s.autoMoveTarget().id,n.id,'respawned preferred node must override fallback');
 s.setMode('combat');
 assert.equal(s.autoMoveTarget().id,e.id,'combat preference must override cached node');
}
// Simulate elapsed game time across depletion and natural respawn cycles.
{
 const {s,storage}=boot(),n=node(s,20);
 s.setMode('gather');s.setAuto(true);
 const wood=s.p.wood;
 for(let i=0;i<600;i++){
   s.update(.1);
   assert.ok(Number.isFinite(s.p.x)&&Number.isFinite(s.p.y),'position remains finite');
   assert.ok(n.stock>=0&&n.stock<=3,'node stock stays bounded');
 }
 const gained=s.p.wood-wood;
 assert.ok(gained>=18,'60 simulated seconds must harvest multiple respawn cycles');
 assert.equal(gained%3,0,'wood rewards must be whole harvest grants');
 assert.equal(JSON.parse(storage.get('trolltoll_web_v3')).legacy.wood,s.p.wood,'harvest rewards persist');
}
// Natural enemy respawn and repeated kills must award growth exactly once.
{
 const {s,storage}=boot(),e=enemy(s,40);
 Object.assign(e,{hp:5,health:5,stat:'atk',xp:0,boss:false});
 const before={kills:s.p.kills,atk:s.p.atk,gold:s.p.gold};
 s.setMode('combat');s.setAuto(true);
 for(let i=0;i<900;i++){
   s.update(.1);
   assert.ok(Number.isFinite(s.p.x)&&Number.isFinite(s.p.y),'combat position remains finite');
 }
 const kills=s.p.kills-before.kills;
 assert.ok(kills>=3,'90 simulated seconds must allow repeated natural combat respawns');
 assert.equal(s.p.atk-before.atk,kills,'one permanent attack increment per kill');
 assert.equal(s.p.gold-before.gold,kills*3,'one gold reward per kill');
 const saved=JSON.parse(storage.get('trolltoll_web_v3')).legacy;
 assert.equal(saved.atk,s.p.atk);
 assert.equal(saved.gold,s.p.gold);
 assert.equal(saved.kills,s.p.kills);
}
// Locked zone excludes remote targets; selected target beyond range does not teleport or attack.
{
 const {s}=boot(),e=enemy(s,400,0);
 s.setAuto(true);s.setMode('combat');
 assert.equal(s.autoMoveTarget(),null,'zone locked');
 s.choose(e.id);s.update(.1);assert.equal(e.health,300,'distant selection cannot attack');
 s.p.bossKills.push('boss0');assert.equal(s.autoMoveTarget().id,e.id,'boss unlock expands target pool');
}
console.log('Auto combat/gather priority, manual selection, cooldown, drops, movement and zone integration passed');
