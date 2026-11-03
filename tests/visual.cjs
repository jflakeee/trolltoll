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
    const canvasState=()=>page.locator('#game').getAttribute('data-auto-move');
    const verifyViewport=async (label)=>{const v=await page.evaluate(()=>({w:document.querySelector('#game').width,h:document.querySelector('#game').height,innerW:innerWidth,innerH:innerHeight}));assert.equal(v.w,v.innerW,label+' canvas width');assert.equal(v.h,v.innerH,label+' canvas height')};
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
    // Manual input takes precedence over auto-navigation, then auto-navigation resumes.
    await page.mouse.click(340,620); // Enable auto-move again.
    await page.keyboard.down('d');
    const manualBefore=await position();
    await page.waitForTimeout(450);
    const manualAfter=await position();
    await page.keyboard.up('d');
    assert.ok(manualAfter.x>manualBefore.x+10,'manual D input must override auto-move and increase world x');
    const resumeBefore=await position();
    await page.waitForTimeout(500);
    const resumeAfter=await position();
    assert.ok(Math.hypot(resumeAfter.x-resumeBefore.x,resumeAfter.y-resumeBefore.y)>1,'auto-move must resume after manual input');
    await page.screenshot({path:path.join(dir,'04-manual-override-resume.png')});
    // Mobile touch joystick must override auto-move, then release back to auto-move.
    const touchBefore=await position();
    await page.mouse.move(70,520);
    await page.mouse.down();
    await page.mouse.move(125,520,{steps:5});
    await page.waitForTimeout(450);
    const touchAfter=await position();
    assert.ok(touchAfter.x>touchBefore.x+10,'touch joystick must move in the manually requested direction');
    await page.mouse.up();
    const touchRelease=await position();
    await page.waitForTimeout(500);
    const touchResumed=await position();
    assert.ok(Math.hypot(touchResumed.x-touchRelease.x,touchResumed.y-touchRelease.y)>1,'auto-move must resume after touch release');
    await page.screenshot({path:path.join(dir,'05-touch-override-resume.png')});
    // Sustained auto-navigation must remain finite and keep rendering.
    await page.waitForTimeout(12000);
    const sustained=await position();
    assert.ok(Number.isFinite(sustained.x)&&Number.isFinite(sustained.y),'long-running auto-move must keep finite coordinates');
    assert.ok(Math.abs(sustained.x)<=950&&Math.abs(sustained.y)<=950,'long-running movement must remain within world bounds');
    await page.screenshot({path:path.join(dir,'06-automove-soak.png')});
    // Verify a narrower phone layout without browser exceptions or a clipped canvas.
    await page.setViewportSize({width:360,height:800});
    await page.waitForTimeout(300);
    await verifyViewport('narrow');
    await page.screenshot({path:path.join(dir,'07-narrow-mobile.png')});
    // Exercise real touchscreen taps (not mouse events) on the resized phone.
    await page.touchscreen.tap(310,680); // Auto-move OFF: h - 120.
    assert.equal(await canvasState(),'false','touchscreen tap must turn auto-move OFF');
    await page.waitForTimeout(120);
    const tapOff=await position();
    await page.waitForTimeout(350);
    const tapStill=await position();
    assert.ok(Math.hypot(tapStill.x-tapOff.x,tapStill.y-tapOff.y)<0.01,'touchscreen tap must disable auto-move');
    await page.touchscreen.tap(310,680); // Auto-move ON.
    assert.equal(await canvasState(),'true','touchscreen tap must turn auto-move ON');
    const tapOn=await position();
    await page.waitForTimeout(700);
    const tapMoved=await position();
    assert.ok(Number.isFinite(tapMoved.x)&&Number.isFinite(tapMoved.y),'touchscreen re-enable must retain valid coordinates');
    await page.screenshot({path:path.join(dir,'08-touchscreen-toggle.png')});
    // Cycle the bottom-right action mode button with real touchscreen taps.
    for(const expected of ['combat','gather','auto']){
      await page.touchscreen.tap(310,750); // Mode button: h - 50.
      assert.equal(await page.locator('#game').getAttribute('data-action-mode'),expected,'touchscreen mode must cycle to '+expected);
      assert.equal(await canvasState(),'true','changing action mode must preserve auto-move');
    }
    await page.screenshot({path:path.join(dir,'08b-touchscreen-modes.png')});
    // Real touch drag via Chromium input events, independent of mouse emulation.
    const cdp=await page.context().newCDPSession(page);
    const dragStart=await position();
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:65,y:520,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:125,y:520,id:1}]});
    await page.waitForTimeout(450);
    const dragEnd=await position();
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.ok(dragEnd.x>dragStart.x+10,'real touchscreen drag must move player to the right');
    assert.equal(await canvasState(),'true','touch drag must not disable auto-move');
    await page.screenshot({path:path.join(dir,'08c-touchscreen-drag.png')});
    // Rotate the emulated viewport and ensure the canvas and gameplay survive.
    await page.setViewportSize({width:800,height:360});
    await page.waitForTimeout(350);
    await verifyViewport('landscape');
    const rotateBefore=await position();
    await page.waitForTimeout(500);
    const rotateAfter=await position();
    assert.equal(await canvasState(),'true','auto-move must remain enabled after landscape rotation');
    assert.ok(Number.isFinite(rotateAfter.x)&&Number.isFinite(rotateAfter.y),'landscape rotation must preserve finite player coordinates');
    await page.screenshot({path:path.join(dir,'09-landscape-mobile.png')});
    await page.setViewportSize({width:390,height:740});
    await page.waitForTimeout(250);
    await verifyViewport('portrait');
    await page.screenshot({path:path.join(dir,'10-restored-portrait.png')});
    assert.deepEqual(errors,[],'no browser JavaScript exceptions');
    console.log('Visual verification passed:',JSON.stringify(movement));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
