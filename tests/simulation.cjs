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
save();
assert.ok(JSON.parse(store.get('trolltoll_web_v2')).kills>0);
console.log('Simulation passed: gathering, combat rewards and boss range');
