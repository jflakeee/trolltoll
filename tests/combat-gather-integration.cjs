'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('game.js','utf8').replace(/\}\)\(\);\s*$/,'globalThis.__test={p,enemies,nodes,progression,update,autoMoveTarget,keys,choose:id=>{selected=id},setMode:v=>{mode=v},setAuto:v=>{autoMove=v},getState:()=>({selected,work,autoTargetId}),getMode:()=>mode};})();');
function boot(){
 const storage=new Map(),ctx2d=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const canvas={getContext:()=>ctx2d,addEventListener:()=>{},setPointerCapture:()=>{},dataset:{}};
 const math=Object.create(Math);math.random=()=>.999;
 const context={document:{hidden:false,getElementById:()=>canvas,addEventListener:()=>{}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},innerWidth:390,innerHeight:740,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame:()=>{},setInterval:()=>{},addEventListener:()=>{},console:{warn:()=>{}},Math:math};
 vm.runInNewContext(source,context);
 const s=context.__test;
 for(const e of s.enemies)e.dead=1000;
 for(const n of s.nodes)n.respawn=1000;
 s.p.x=0;s.p.y=0;s.p.hp=1000;s.p.max=1000;s.p.atk=10;s.p.def=999;s.p.cd=0;
 return {s,storage};
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
// Locked zone excludes remote targets; selected target beyond range does not teleport or attack.
{
 const {s}=boot(),e=enemy(s,400,0);
 s.setAuto(true);s.setMode('combat');
 assert.equal(s.autoMoveTarget(),null,'zone locked');
 s.choose(e.id);s.update(.1);assert.equal(e.health,300,'distant selection cannot attack');
 s.p.bossKills.push('boss0');assert.equal(s.autoMoveTarget().id,e.id,'boss unlock expands target pool');
}
console.log('Auto combat/gather priority, manual selection, cooldown, drops, movement and zone integration passed');
