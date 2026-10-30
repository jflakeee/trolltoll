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
// Once a depleted tree respawns, auto-gathering should resume without user input.
for(const e of enemies)e.dead=999;
for(const n of nodes)if(n!==tree)n.respawn=999;
tree.stock=0;tree.respawn=.05;
p.x=tree.x;p.y=tree.y;
const woodBeforeResume=p.wood;
for(let i=0;i<50;i++)update(.05);
assert.ok(p.wood>woodBeforeResume,'auto-gather should resume after tree respawn');
for(const n of nodes)if(n!==tree)n.respawn=0;
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
// Auto-combat should resume when a defeated enemy respawns nearby.
for(const e of enemies)e.dead=999;
for(const n of nodes)n.respawn=999;
p.x=295;p.y=0;
enemy.i=0;enemy.dead=.05;enemy.health=0;enemy.atk=0;
const killsBeforeRespawn=p.kills;
for(let i=0;i<180;i++)update(.05);
assert.ok(p.kills>killsBeforeRespawn,'auto-combat should defeat a respawned enemy');
for(const n of nodes)n.respawn=0;
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
// A boss defeated through the real auto-attack loop must unlock the next region.
for(const e of enemies)e.dead=999;
for(const n of nodes)n.respawn=999;
const guardian=bosses[0];
guardian.dead=0;guardian.health=guardian.hp;guardian.cd=999;guardian.windup=0;
p.x=guardian.x+20;p.y=guardian.y;
const priorAttack=p.atk,priorDefense=p.def;
p.atk=120;p.def=100;
for(let i=0;i<120&&!p.bossKills.includes('boss0');i++)update(.05);
assert.ok(p.bossKills.includes('boss0'),'real auto-combat must unlock quarry');
assert.ok(p.relics>=1,'first guardian kill should grant a relic');
assert.ok(guardian.dead>0,'guardian should enter defeat cooldown');
p.atk=priorAttack+5;p.def=priorDefense+3;
// Continue through the remaining bosses using the actual combat update loop.
for(const [boss,id] of [[bosses[1],'boss1'],[bosses[2],'boss2']]){
  for(const e of enemies)e.dead=999;
  boss.dead=0;boss.health=boss.hp;boss.cd=999;boss.windup=0;
  p.x=boss.x+20;p.y=boss.y;
  p.atk=250;p.def=150;
  for(let i=0;i<150&&!p.bossKills.includes(id);i++)update(.05);
  assert.ok(p.bossKills.includes(id),id+' must be defeated by auto-combat');
  assert.ok(boss.dead>0,id+' must enter defeat cooldown');
}
assert.equal(p.bossKills.length,3,'all three regions must be unlocked');
assert.ok(p.relics>=3,'first clears should award three relics');
// Long-running idle updates must not create invalid or unbounded game state.
for(const e of enemies)e.dead=999;
for(const n of nodes)n.respawn=999;
p.x=0;p.y=0;
for(let i=0;i<12000;i++)update(.05);
for(const key of ['x','y','hp','max','atk','def','wood','stone','iron','gold','xp']){
  assert.ok(Number.isFinite(p[key]),key+' should remain finite during long idle simulation');
}
assert.ok(p.hp>0&&p.hp<=p.max,'health remains within valid bounds');
assert.ok(Math.hypot(p.x,p.y)<=300,'player remains in unlocked area');
for(const e of enemies){assert.ok(Number.isFinite(e.dead),'enemy respawn timers stay finite')}
save();
assert.ok(JSON.parse(store.get('trolltoll_web_v2')).kills>0);
console.log('Simulation passed: gathering, combat rewards and boss range');
