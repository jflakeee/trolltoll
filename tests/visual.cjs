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
    // The auto-move toggle is located 140 px above the bottom-right edge.
    await page.mouse.click(340,620);
    await page.waitForTimeout(1300);
    await page.screenshot({path:path.join(dir,'02-mobile-automove.png')});
    const movement=await page.evaluate(()=>{const c=document.querySelector('#game');return {width:c.width,height:c.height,px:window.PixelFX!==undefined}});
    assert.ok(movement.width>0&&movement.height>0,'canvas must render');
    assert.ok(movement.px,'PixelFX browser runtime must load');
    await page.mouse.click(340,620);
    await page.screenshot({path:path.join(dir,'03-mobile-stopped.png')});
    assert.deepEqual(errors,[],'no browser JavaScript exceptions');
    console.log('Visual verification passed:',JSON.stringify(movement));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
