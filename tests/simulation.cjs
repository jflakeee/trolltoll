const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8').trimEnd();
const ctx=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
const store=new Map();
const canvas={getContext:()=>ctx,addEventListener:()=>{},setPointerCapture:()=>{}};
const sandbox={document:{hidden:false,getElementById:()=>canvas,addEventListener:()=>{}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},performance:{now:()=>0},innerWidth:390,innerHeight:740,devicePixelRatio:1,addEventListener:()=>{},setInterval:()=>{},requestAnimationFrame:()=>{},console};
vm.runInNewContext(source.slice(0,-5)+' globalThis.__test={p,nodes,enemies,bosses,update,save};})();',sandbox);
const {p,nodes,enemies,bosses,update,save}=sandbox.__test;
// A resource node at the player's location should yield materials over time.
const tree=nodes.find(n=>n.kind==='tree');
p.x=tree.x;p.y=tree.y;
for(const e of enemies){e.dead=999;e.cd=999;}
const before=p.wood;
for(let i=0;i<50;i++)update(.05);
assert.ok(p.wood>before,'automatic gathering should produce wood');
assert.ok(tree.stock<3,'gathering should consume node stock');
// Exhausted resource nodes should regenerate their full stock after cooldown.
tree.stock=0;tree.respawn=.05;
p.x=0;p.y=0;
update(.05);
assert.equal(tree.stock,3,'trees should regenerate full stock');
assert.ok(tree.respawn<=0,'regenerated trees should be available again');
const stone=nodes.find(n=>n.kind==='stone');
stone.stock=0;stone.respawn=.05;
update(.05);
assert.equal(stone.stock,2,'stone nodes should regenerate full stock');
assert.ok(stone.respawn<=0,'regenerated stone should be available again');
// Respawned enemies must remain within the player's unlocked region, even at the boundary.
p.x=295;p.y=0;
const respawn=enemies.find(e=>!e.boss);
respawn.dead=.01;respawn.health=0;
update(.05);
assert.ok(Math.hypot(respawn.x,respawn.y)<=300,'respawned enemy should be reachable');
assert.ok(respawn.health>0&&respawn.health<=respawn.hp,'respawned enemy should be alive, even if auto-attacked immediately');
p.x=tree.x;p.y=tree.y;
for(const e of enemies)e.dead=999;
// Keep resource nodes out of interaction range so the test isolates combat.
p.x=0;p.y=0;
// A nearby weak enemy should take damage and eventually grant kill rewards.
const enemy=enemies.find(e=>!e.boss);
enemy.dead=0;enemy.health=enemy.hp;enemy.x=p.x+20;enemy.y=p.y;enemy.atk=0;
const kills=p.kills;
for(let i=0;i<100;i++)update(.05);
assert.ok(p.kills>kills,'automatic combat should defeat a nearby enemy');
assert.ok(enemy.dead>0,'defeated enemy should enter respawn cooldown');
// A boss must not damage the player if its windup finishes after moving out of range.
for(const e of enemies)e.dead=999;
const boss=bosses[0];boss.dead=0;boss.health=boss.hp;boss.windup=.05;boss.cd=2;
p.x=boss.x+250;p.y=boss.y;
const hp=p.hp;
update(.05);
assert.equal(p.hp,hp,'out-of-range boss strike should miss');
// Dead enemies must respawn with full health and no stale attack windup.
boss.dead=.05;boss.health=1;boss.windup=.8;boss.cd=-1;
update(.05);
assert.equal(boss.health,boss.hp);
assert.equal(boss.windup,0);
assert.equal(boss.cd,2);
// Healing should remain bounded after sustained idle simulation.
for(const e of enemies)e.dead=999;
p.hp=Math.max(1,p.max-30);
for(let i=0;i<2000;i++)update(.05);
assert.ok(p.hp<=p.max);
assert.ok(p.hp>p.max-30);
save();
assert.ok(JSON.parse(store.get('trolltoll_web_v2')).kills>0);
console.log('Simulation passed: gathering, combat rewards and boss range');
