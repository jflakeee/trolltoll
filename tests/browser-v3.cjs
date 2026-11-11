'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('game.js','utf8');
const storage=new Map();
const context2d=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
const canvas={getContext:()=>context2d,addEventListener:()=>{},setPointerCapture:()=>{},dataset:{}};
let frame;
const listeners={};
const context={
  document:{hidden:false,getElementById:()=>canvas,addEventListener:()=>{}},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  innerWidth:390,innerHeight:740,devicePixelRatio:1,
  performance:{now:()=>0},requestAnimationFrame:cb=>{frame=cb},
  setInterval:()=>{},addEventListener:(name,fn)=>listeners[name]=fn,console,Math
};
storage.set('trolltoll_web_v2',JSON.stringify({level:12,atk:44,gold:125,wood:17,bossKills:['boss0']}));
vm.runInNewContext(source,context);
listeners.pagehide();
let v3=JSON.parse(storage.get('trolltoll_web_v3'));
assert.equal(v3.schemaVersion,3);
assert.equal(v3.legacy.level,12);
assert.equal(v3.legacy.atk,44);
assert.equal(v3.legacy.gold,125);
assert.equal(v3.legacy.wood,17);
assert.deepEqual(Array.from(v3.legacy.bossKills),['boss0']);
assert.equal(v3.progression.equipment.mainWeapon.enhancementLevel,0);
assert.equal(JSON.parse(storage.get('trolltoll_web_v2')).atk,44);
v3.progression.inventory.enhancementStone=19;
v3.progression.inventory.protectionStone=2;
v3.progression.equipment.mainWeapon={enhancementLevel:8,highestEnhancementLevel:9,failuresByLevel:{'8':3}};
storage.set('trolltoll_web_v3',JSON.stringify(v3));
vm.runInNewContext(source,context);
listeners.pagehide();
v3=JSON.parse(storage.get('trolltoll_web_v3'));
assert.equal(v3.progression.inventory.enhancementStone,19);
assert.equal(v3.progression.inventory.protectionStone,2);
assert.equal(v3.progression.equipment.mainWeapon.enhancementLevel,8);
assert.equal(v3.progression.equipment.mainWeapon.failuresByLevel['8'],3);
assert.equal(v3.legacy.atk,44,'enhancement must not inflate legacy attack');
storage.set('trolltoll_web_v3','{broken');
vm.runInNewContext(source,context);
listeners.pagehide();
v3=JSON.parse(storage.get('trolltoll_web_v3'));
assert.equal(v3.legacy.level,12,'broken v3 falls back to v2');
assert.equal(v3.progression.equipment.mainWeapon.enhancementLevel,8,'valid backup must restore enhancement instead of losing it');
assert.equal(typeof frame,'function');
console.log('browser v3 persistence tests passed');
