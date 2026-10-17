const {chromium}=require('/Users/abdul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 console.log(await page.evaluate(()=>({title:document.title,sections:[...document.querySelectorAll('main section')].map(x=>[x.className,Math.round(x.getBoundingClientRect().height)]),fonts:document.fonts.check('700 20px Oswald','ШТАТ'),overflow:document.documentElement.scrollWidth>innerWidth})));
 await page.screenshot({path:'screenshots/desktop-1440.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'screenshots/mobile-390.png',fullPage:true});
 console.log({errors});await browser.close();
})();
