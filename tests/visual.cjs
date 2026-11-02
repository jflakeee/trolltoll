// Run with: node tests/visual.cjs (requires Playwright and Chromium).
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
(async () => {
  const dir = path.resolve('visual-results');
  fs.mkdirSync(dir,{recursive:true});
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:740},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('file://'+path.resolve('index.html'));
    await page.waitForTimeout(350);
    const canvas=page.locator('#game');
    assert.equal(await canvas.count(),1);
    await page.screenshot({path:path.join(dir,'01-mobile-idle.png')});
    const position=()=>page.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));const {x,y}=JSON.parse(localStorage.getItem('trolltoll_web_v2'));return {x,y}});
    const before=await position();
    const togglePixels=()=>page.evaluate(()=>{const c=document.querySelector('#game'),d=c.getContext('2d').getImageData(220,600,120,38).data;let hash=0;for(let i=0;i<d.length;i+=4)hash=(Math.imul(hash,31)+d[i]+d[i+1]*3+d[i+2]*7)>>>0;return hash});
    const offPixels=await togglePixels();
    // The auto-move toggle is located 140 px above the bottom-right edge.
    await page.mouse.click(340,620);
    await page.waitForTimeout(1300);
    const after=await position();
    assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>2,'auto-move must change world position');
    const onPixels=await togglePixels();
    assert.notEqual(onPixels,offPixels,'auto-move ON button must visibly change');
    await page.screenshot({path:path.join(dir,'02-mobile-automove.png')});
    const movement=await page.evaluate(()=>{const c=document.querySelector('#game');return {width:c.width,height:c.height,px:window.PixelFX!==undefined}});
    assert.ok(movement.width>0&&movement.height>0,'canvas must render');
    assert.ok(movement.px,'PixelFX browser runtime must load');
    await page.mouse.click(340,620);
    await page.waitForTimeout(150);
    const stopped=await position();
    await page.waitForTimeout(350);
    const still=await position();
    assert.ok(Math.hypot(still.x-stopped.x,still.y-stopped.y)<0.01,'auto-move OFF must stop movement');
    await page.screenshot({path:path.join(dir,'03-mobile-stopped.png')});
    assert.deepEqual(errors,[],'no browser JavaScript exceptions');
    console.log('Visual verification passed:',JSON.stringify(movement));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
