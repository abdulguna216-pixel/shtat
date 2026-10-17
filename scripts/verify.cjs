const {chromium}=require('/Users/abdul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'); const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const report={widths:[],interactions:[],errors:[],failedRequests:[]};
 page.on('pageerror',e=>report.errors.push(e.message));page.on('requestfailed',r=>report.failedRequests.push(r.url()));
 let posts=0;page.on('request',r=>{if(r.method()==='POST')posts++});
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 for(const width of [320,375,390,428,768,1024,1440,1920]){
  await page.setViewportSize({width,height:1000});
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),headings:[...document.querySelectorAll('h1,h2')].filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1}).map(e=>e.textContent)}));
  // Heading wrapper boxes are deliberately widened before scaleX; validate visible line content.
  const lines=await page.evaluate(()=>[...document.querySelectorAll('.display>span')].flatMap(e=>{const range=document.createRange();range.selectNodeContents(e);const r=range.getBoundingClientRect();return r.left < -1||r.right>innerWidth+1?[{text:e.textContent,left:r.left,right:r.right}]:[]}));
  layout.overflowingLines=lines;report.widths.push(layout);
  assert.equal(layout.scrollWidth,width,`Page overflow at ${width}`);assert.equal(layout.brokenImages.length,0);assert.equal(lines.length,0,`Heading overflow at ${width}`);
 }
 const faq=page.locator('.faq-question').first();await faq.focus();await page.keyboard.press('Enter');await assert.equal(await faq.getAttribute('aria-expanded'),'true');assert.equal(await page.locator('.faq-answer').first().isVisible(),true);await page.keyboard.press('Space');assert.equal(await faq.getAttribute('aria-expanded'),'false');report.interactions.push('FAQ opens and closes with keyboard');
 await page.locator('[data-service=production]').click();assert.equal(await page.locator('#service').inputValue(),'production');report.interactions.push('Service CTA selects production in form');
 await page.locator('.submit-button').click();assert.equal(await page.locator('#name').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#phone').getAttribute('aria-invalid'),'true');report.interactions.push('Required fields and consent validated');
 await page.locator('#name').fill('Тест');await page.locator('#phone').fill('abcdefghij');await page.locator('#consent').check();await page.locator('.submit-button').click();assert.equal(await page.locator('#phone').getAttribute('aria-invalid'),'true');report.interactions.push('Invalid telephone rejected');
 await page.locator('#phone').fill('+7 (900) 000-00-00');await page.locator('.submit-button').click();assert.match(await page.locator('#form-status').innerText(),/Заявка не отправлена/);assert.equal(posts,0);report.interactions.push('Missing integration honestly reported; zero requests and no data stored');
 await page.locator('[data-open-policy]').click();assert.equal(await page.locator('dialog').isVisible(),true);await page.keyboard.press('Escape');report.interactions.push('Privacy document opens in accessible dialog');
 await page.locator('[data-open-about]').click();assert.equal(await page.locator('dialog').isVisible(),true);await page.locator('.dialog-close').click();report.interactions.push('About button opens company description');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.locator('.menu-button').click();assert.equal(await page.locator('#mobile-menu').isVisible(),true);await page.locator('#mobile-menu a[href="#faq"]').click();assert.equal(await page.locator('#mobile-menu').isVisible(),false);assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'false');report.interactions.push('Mobile menu opens and closes after navigation');
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');report.interactions.push('Reduced-motion preference respected');
 await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'screenshots/mobile-390.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'screenshots/desktop-1440.png',fullPage:true});
 fs.writeFileSync('screenshots/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert.equal(report.errors.length,0);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
