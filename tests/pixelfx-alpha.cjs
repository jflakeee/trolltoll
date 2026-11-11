'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('game.js','utf8');
const start=source.indexOf('function drawPixelEffects(){');
const end=source.indexOf('\n',start);
assert.ok(start>=0&&end>start,'PixelFX renderer exists');
const render=source.slice(start,end);
let bg='unset',drawn=false;
const frame={w:2,h:2};
const imageData={data:new Uint8ClampedArray(16)};
const canvas={width:0,height:0,getContext:()=>({putImageData:(image)=>{assert.equal(image,imageData);}})};
const api={
 clearFrame:()=>{},
 composite:(f,data,background)=>{
  bg=background;
  assert.equal(f,frame);
  // Reproduce the library's background contract: 0 is opaque black; null is transparent.
  data.fill(0);
  for(let i=0;i<4;i++)data[i*4+3]=background===null?0:255;
  data[0]=255;data[3]=255; // one red effect pixel
 }
};
const effect={frame,instance:{draw:()=>{}},canvas:null,image:null,x:0,y:0};
const ctx={drawImage:()=>{drawn=true;assert.equal(imageData.data[3],255);for(let i=1;i<4;i++)assert.equal(imageData.data[i*4+3],0,'background pixels must stay transparent')}};
vm.runInNewContext(render+'\ndrawPixelEffects();',{globalThis:{PixelFX:api},pixelEffects:[effect],ImageData:function(){return imageData},document:{createElement:()=>canvas},screen:()=>({x:0,y:0}),ctx,console});
assert.equal(bg,null,'PixelFX composite must request a transparent background');
assert.equal(drawn,true);
console.log('PixelFX transparent-background overlay regression passed');
