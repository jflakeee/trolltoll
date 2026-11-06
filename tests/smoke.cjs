const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const listeners = {};
const canvasListeners = {};
const storage = new Map();
const context2d = new Proxy({}, {get(target, key) {return target[key] || (() => {});}, set(target, key, value) {target[key] = value; return true;}});
const canvas = {width:0,height:0,getContext:()=>context2d,addEventListener:(name,cb)=>canvasListeners[name]=cb,setPointerCapture:()=>{}};
const document = {hidden:false,getElementById:(id)=>id==='game'?canvas:null,addEventListener:(name,cb)=>listeners[name]=cb};
const localStorage = {getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
let frame;
const context = {document,localStorage,innerWidth:390,innerHeight:740,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame:cb=>{frame=cb},setInterval:()=>{},addEventListener:(name,cb)=>listeners[name]=cb,console,Math};
vm.runInNewContext(fs.readFileSync('game.js','utf8'),context,{filename:'game.js'});
assert.equal(typeof frame,'function');
frame(16);
frame(-1000); // A clock reset must not reverse game simulation.
assert.ok(canvas.width>0&&canvas.height>0);
assert.equal(typeof canvasListeners.pointerdown,'function');
canvasListeners.pointerdown({clientX:35,clientY:25,pointerId:1});
frame(32);
listeners.pagehide();
const save=JSON.parse(storage.get('trolltoll_web_v2'));
assert.equal(save.level,1);
assert.equal(save.x,0);
assert.ok(Array.isArray(save.bossKills));
// Rehydrate a late-game save and ensure the restored position is preserved.
storage.delete('trolltoll_web_v3');storage.set('trolltoll_web_v2',JSON.stringify({...save,x:500,y:0,bossKills:['boss0'],club:true,armor:true,atk:45,def:20}));
vm.runInNewContext(fs.readFileSync('game.js','utf8'),context,{filename:'game.js'});
frame(48);
listeners.pagehide();
const restored=JSON.parse(storage.get('trolltoll_web_v2'));
assert.equal(restored.x,500);
assert.equal(restored.y,0);
assert.deepEqual(restored.bossKills,['boss0']);
assert.equal(restored.club,true);
assert.equal(restored.armor,true);
// Saves outside the currently unlocked zone must be clamped on load.
storage.delete('trolltoll_web_v3');storage.set('trolltoll_web_v2',JSON.stringify({...save,x:900,y:0,bossKills:[]}));
vm.runInNewContext(fs.readFileSync('game.js','utf8'),context,{filename:'game.js'});
frame(64);
listeners.pagehide();
const clamped=JSON.parse(storage.get('trolltoll_web_v2'));
assert.ok(Math.hypot(clamped.x,clamped.y)<=300);
// Malformed but parseable saves must be normalized on a fresh launch.
storage.delete('trolltoll_web_v3');storage.set('trolltoll_web_v2',JSON.stringify({...save,x:'not-a-number',y:null,level:-9,wood:-40,stone:-2,iron:-1,hp:-10,currentHp:999,bossKills:['boss0','boss0','invalid',null]}));
vm.runInNewContext(fs.readFileSync('game.js','utf8'),context,{filename:'game.js'});
frame(72);
listeners.pagehide();
const normalized=JSON.parse(storage.get('trolltoll_web_v2'));
assert.equal(normalized.x,0);
assert.equal(normalized.y,0);
assert.equal(normalized.level,1);
assert.equal(normalized.wood,0);
assert.equal(normalized.stone,0);
assert.equal(normalized.iron,0);
assert.ok(normalized.currentHp>0&&normalized.currentHp<=normalized.hp);
assert.deepEqual(normalized.bossKills,['boss0']);
// Restore a healthy baseline so the 1-HP malformed-save case cannot interfere with movement assertions.
storage.delete('trolltoll_web_v3');storage.set('trolltoll_web_v2',JSON.stringify(save));
vm.runInNewContext(fs.readFileSync('game.js','utf8'),context,{filename:'game.js'});
// Exercise a short mobile viewport and an expanded crafting menu.
context.innerWidth=320;
context.innerHeight=480;
listeners.resize();
canvasListeners.pointerdown({clientX:300,clientY:190,pointerId:2});
frame(80);
// Close the crafting overlay before testing movement gestures on its dismiss area.
canvasListeners.pointerdown({clientX:300,clientY:190,pointerId:3});
// Secondary fingers must not replace or release the active movement pointer.
canvasListeners.pointerdown({clientX:100,clientY:300,pointerId:10});
canvasListeners.pointermove({clientX:140,clientY:300,pointerId:10});
canvasListeners.pointermove({clientX:310,clientY:300,pointerId:11});
canvasListeners.pointerup({pointerId:11});
frame(96);
listeners.pagehide();
const moving=JSON.parse(storage.get('trolltoll_web_v2'));
assert.ok(moving.x>0,'active pointer still moves after secondary pointer release');
canvasListeners.lostpointercapture({pointerId:11});
canvasListeners.lostpointercapture({pointerId:10});
canvasListeners.pointermove({clientX:310,clientY:300,pointerId:10});
frame(112);
listeners.pagehide();
const released=JSON.parse(storage.get('trolltoll_web_v2'));
assert.equal(released.x,moving.x,'lost pointer capture stops movement');
assert.equal(canvas.width,320);
assert.equal(canvas.height,480);
// Large diagonal drags must clamp the joystick thumb to a circle, not a square.
const joystickArcs=[];
context2d.arc=(x,y,r)=>joystickArcs.push({x,y,r});
canvasListeners.pointerdown({clientX:100,clientY:300,pointerId:20});
canvasListeners.pointermove({clientX:300,clientY:500,pointerId:20});
frame(116);
const thumb=joystickArcs.at(-1),base=joystickArcs.at(-2);
assert.equal(base.r,40,'joystick base must be circular');
assert.equal(thumb.r,14,'joystick thumb must be circular');
assert.ok(Math.abs(Math.hypot(thumb.x-base.x,thumb.y-base.y)-35)<0.01,'diagonal drag thumb must stay on circular radius');
canvasListeners.pointerup({pointerId:20});
listeners.pagehide();
assert.ok(storage.has('trolltoll_web_v2'));
// Corrupt saves must not produce negative resources, invalid boss IDs or impossible HP.
storage.delete('trolltoll_web_v3');storage.set('trolltoll_web_v2',JSON.stringify({...save,level:-10,wood:-5,stone:-1,iron:-9,hp:0,currentHp:9999,bossKills:['boss0','boss0','unknown']}));
vm.runInNewContext(fs.readFileSync('game.js','utf8'),context,{filename:'game.js'});
frame(128);
listeners.pagehide();
const sanitized=JSON.parse(storage.get('trolltoll_web_v2'));
assert.equal(sanitized.level,1);
assert.equal(sanitized.wood,0);
assert.equal(sanitized.stone,0);
assert.equal(sanitized.iron,0);
assert.equal(sanitized.hp,1);
assert.equal(sanitized.currentHp,1);
assert.deepEqual(sanitized.bossKills,['boss0']);
// Rendering and resizing should tolerate common portrait and landscape viewports.
for(const [width,height,dpr] of [[320,568,1],[375,667,2],[390,844,3],[430,932,2],[844,390,2],[1024,768,1]]){
  context.innerWidth=width;context.innerHeight=height;context.devicePixelRatio=dpr;
  listeners.resize();
  assert.equal(canvas.width,width*Math.min(dpr,2));
  assert.equal(canvas.height,height*Math.min(dpr,2));
  assert.doesNotThrow(()=>frame(120),'viewport '+width+'x'+height+' must render');
}
// Tapping the crafting header must not start joystick movement.
context.innerWidth=390;context.innerHeight=740;listeners.resize();
listeners.pagehide();
const beforeMenuTap=JSON.parse(storage.get('trolltoll_web_v2'));
canvasListeners.pointerdown({clientX:350,clientY:205,pointerId:50});
canvasListeners.pointermove({clientX:380,clientY:500,pointerId:50});
frame(124);
listeners.pagehide();
const afterMenuTap=JSON.parse(storage.get('trolltoll_web_v2'));
assert.equal(afterMenuTap.x,beforeMenuTap.x,'craft menu tap must not move player horizontally');
assert.equal(afterMenuTap.y,beforeMenuTap.y,'craft menu tap must not move player vertically');
// A crafting item tap must also be consumed, even if materials are insufficient.
canvasListeners.pointerdown({clientX:350,clientY:255,pointerId:51});
canvasListeners.pointermove({clientX:380,clientY:500,pointerId:51});
frame(128);
listeners.pagehide();
const afterItemTap=JSON.parse(storage.get('trolltoll_web_v2'));
assert.equal(afterItemTap.x,afterMenuTap.x,'craft item tap must not start movement');
assert.equal(afterItemTap.y,afterMenuTap.y,'craft item tap must not start movement');
// Keyboard movement must stop after the browser loses focus.
context.innerWidth=390;context.innerHeight=740;listeners.resize();
listeners.keydown({key:'d',preventDefault:()=>{}});
frame(136);
listeners.pagehide();
const beforeBlur=JSON.parse(storage.get('trolltoll_web_v2')).x;
listeners.blur();
frame(152);
listeners.pagehide();
assert.equal(JSON.parse(storage.get('trolltoll_web_v2')).x,beforeBlur,'blur releases held keyboard input');
// Invalid top-level save shapes must never crash game initialization.
for(const invalid of ['null','[]','42','\"broken\"','{not-json']){
  storage.delete('trolltoll_web_v3');storage.set('trolltoll_web_v2',invalid);
  assert.doesNotThrow(()=>vm.runInNewContext(fs.readFileSync('game.js','utf8'),context,{filename:'game.js'}));
  frame(144);
  listeners.pagehide();
  const recovered=JSON.parse(storage.get('trolltoll_web_v2'));
  assert.equal(recovered.level,1);
}
// Legacy v1 saves must load when v2 is absent, then migrate on save.
storage.delete('trolltoll_web_v3');storage.delete('trolltoll_web_v2');
storage.set('trolltoll_web_v1',JSON.stringify({level:7,wood:31,stone:12,bossKills:['boss0'],x:400,y:0}));
vm.runInNewContext(fs.readFileSync('game.js','utf8'),context,{filename:'game.js'});
frame(160);
listeners.pagehide();
const migrated=JSON.parse(storage.get('trolltoll_web_v2'));
assert.equal(migrated.level,7);
assert.equal(migrated.wood,31);
assert.equal(migrated.stone,12);
assert.deepEqual(migrated.bossKills,['boss0']);
assert.equal(migrated.x,400);
// Auto-move should seek a target, stop when disabled, and yield to manual input.
storage.delete('trolltoll_web_v3');storage.set('trolltoll_web_v2',JSON.stringify({...save,x:0,y:0}));
context.innerWidth=390;context.innerHeight=740;
vm.runInNewContext(fs.readFileSync('game.js','utf8'),context,{filename:'game.js'});
listeners.resize();
canvasListeners.pointerdown({clientX:340,clientY:620,pointerId:70}); // Auto-move button.
for(let t=200;t<=1000;t+=50)frame(t);
listeners.pagehide();
const autoMoved=JSON.parse(storage.get('trolltoll_web_v2'));
assert.ok(Math.hypot(autoMoved.x,autoMoved.y)>0.1,'auto-move must move toward a target');
canvasListeners.pointerdown({clientX:340,clientY:620,pointerId:71}); // Disable.
const stoppedAt={x:autoMoved.x,y:autoMoved.y};
frame(1050);listeners.pagehide();
const stopped=JSON.parse(storage.get('trolltoll_web_v2'));
assert.equal(stopped.x,stoppedAt.x,'auto-move off must stop horizontal movement');
assert.equal(stopped.y,stoppedAt.y,'auto-move off must stop vertical movement');
// Storage may throw SecurityError in restricted/private browser contexts.
const warningText=[];
const warningPositions=[];
const warningCanvasContext=new Proxy({}, {get(target,key){if(key==='fillText')return (text,x,y)=>{warningText.push(String(text));if(String(text).includes('저장 불가'))warningPositions.push({x,y});};return target[key]||(()=>{});},set(target,key,value){target[key]=value;return true;}});
const blockedCanvas={...canvas,getContext:()=>warningCanvasContext};
const blockedContext={...context,document:{...document,getElementById:()=>blockedCanvas},localStorage:{getItem(){const e=Error('blocked');e.name='SecurityError';throw e},setItem(){const e=Error('full');e.name='QuotaExceededError';throw e}}};
assert.doesNotThrow(()=>vm.runInNewContext(fs.readFileSync('game.js','utf8'),blockedContext,{filename:'game.js'}));
assert.doesNotThrow(()=>frame(176));
assert.ok(warningText.some(text=>text.includes('저장 불가')),'storage warning must be rendered');
for(const [width,height] of [[320,480],[390,740],[844,390]]){
  blockedContext.innerWidth=width;blockedContext.innerHeight=height;
  listeners.resize();
  frame(180);
  const pos=warningPositions.at(-1);
  assert.ok(pos&&pos.y>=0&&pos.y<height-90,'storage warning must remain above bottom controls at '+width+'x'+height);
}
assert.doesNotThrow(()=>listeners.pagehide());
console.log('Smoke test passed: boot, draw, touch, save, restore, short viewport and corrupted save recovery');
