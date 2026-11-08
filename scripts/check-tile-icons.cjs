/* Browser checks for the two catalogues and a visual contact sheet. */
const fs=require('fs');
const path=require('path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {icons,css}=require('./build-tile-icons.cjs');
const out=path.resolve(__dirname,'../outputs/tile-icons');
const root=path.resolve(__dirname,'..');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];
 try{
  for(const filename of ['index.html','unreviewed.html']){
   const page=await browser.newPage({viewport:{width:1440,height:1100}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('file:///'+root.replaceAll('\\','/')+'/'+filename);
   await page.waitForFunction(()=>document.querySelector('.icon-playing'));
   const counts=await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('.tile')];
    return {cards:cards.length,icons:document.querySelectorAll('.tile > .tile-icon').length,empty:cards.filter(c=>!c.querySelector('.wi-motion')).map(c=>c.getAttribute('href')),active:document.querySelectorAll('.icon-playing').length,offscreen:cards.filter(c=>c.getBoundingClientRect().top>innerHeight&&!c.classList.contains('icon-playing')).length};
   });
   assert.equal(counts.icons,counts.cards);assert.deepEqual(counts.empty,[]);assert.ok(counts.active>0);assert.ok(counts.offscreen>0);
   if(filename==='index.html'){
    assert.equal(await page.locator('a[href="visualizations/atlas-play.html"]').count(),1,'Atlas has one distinct entry');
    assert.equal(await page.locator('.atlas-spotlight > .tile-icon').count(),1);
    assert.equal(await page.locator('.featured [href="visualizations/atlas-play.html"], #catalogueGrid [href="visualizations/atlas-play.html"]').count(),0);
   }
   // Each motion type and path must produce finite, nonempty SVG bounds.
   assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('.tile-icon')].filter(s=>{const b=s.getBBox();return !Number.isFinite(b.width)||b.width<=0||b.height<=0;}).map(s=>s.parentNode.getAttribute('href'))),[]);
   const playingBefore=await page.evaluate(()=>document.querySelector('.icon-playing .wi-motion').getAnimations()[0]?.currentTime);
   await pause(130);
   const playingAfter=await page.evaluate(()=>document.querySelector('.icon-playing .wi-motion').getAnimations()[0]?.currentTime);
   assert.ok(playingAfter>playingBefore,'visible icons advance');
   // Pause persists across a reload, including where storage is available for local files.
   await page.locator('#iconMotionToggle').click();
   assert.equal(await page.locator('.icon-playing').count(),0);
   assert.equal(await page.locator('.tile-icon').evaluateAll(ss=>ss.reduce((n,s)=>n+s.getAnimations({subtree:true}).length,0)),0);
   await page.reload();await page.waitForTimeout(80);
   assert.equal(await page.locator('#iconMotionToggle').textContent(),'Play icons');
   await page.locator('#iconMotionToggle').click();
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.locator('#iconMotionToggle').waitFor({state:'hidden'});
   assert.equal(await page.locator('.tile-icon').evaluateAll(ss=>ss.reduce((n,s)=>n+s.getAnimations({subtree:true}).length,0)),0);
   assert.equal(await page.locator('#iconMotionToggle').isHidden(),true);
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.locator('#iconMotionToggle').waitFor({state:'visible'});
   // Existing search and category controls continue to work.
   await page.locator('#vizSearch').fill('zzzz-no-concept');
   assert.equal(await page.locator('.tile:not(.is-hidden)').filter({has:page.locator('h3')}).count(),filename==='index.html'?4:0);
   await page.locator('#vizSearch').fill('');
   await page.locator('#vizCategory').selectOption({label:'Discoveries'});
   assert.equal(await page.locator('.tile:not(.is-hidden)').evaluateAll(cards=>cards.some(c=>c.closest('#catalogueGrid, .group')&&c.dataset.cat!=='Discoveries')),false);
   await page.locator('#vizCategory').selectOption('all');
   for(const theme of ['light','dark']){
    await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
    for(const width of [320,760,1440]){
     await page.setViewportSize({width,height:1000});
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${filename} ${theme} ${width}: overflow`);
     if(filename==='index.html') assert.equal(await page.locator('.atlas-spotlight').evaluate(a=>{
      const box=a.getBoundingClientRect();return [...a.children].every(c=>{const r=c.getBoundingClientRect();return r.left>=box.left-1&&r.right<=box.right+1&&r.top>=box.top-1&&r.bottom<=box.bottom+1;});
     }),true,'Atlas icon, copy and action fit');
    }
    await page.screenshot({path:path.join(out,filename.replace('.html','')+'-'+theme+'.png'),fullPage:true});
   }
   assert.deepEqual(errors,[]);results.push({filename,...counts,errors});await page.close();
  }
  const page=await browser.newPage({viewport:{width:1000,height:1500},deviceScaleFactor:1});
  const slugs=Object.keys(icons);
  for(let part=0;part<2;part++){
   const group=slugs.slice(part*32,(part+1)*32);
   await page.setContent(`<!doctype html><html><meta charset="utf-8"><style>body{margin:0;padding:20px;background:#F7F5F0;color:#1B1A17;font:12px system-ui}main{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.tile{--accent:#2F6BD8;--cat-bg:#EAEFF4;background:var(--cat-bg);border-radius:8px;padding:15px;height:155px;display:flex;flex-direction:column;gap:15px}.tile-icon{width:100%;height:90px;display:block;overflow:visible}${css}</style><main>${group.map(slug=>`<article class="tile icon-playing"><svg class="tile-icon" viewBox="0 0 120 64">${icons[slug]}</svg><span>${slug}</span></article>`).join('')}</main></html>`);
   await page.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=1600;}));
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:path.join(out,`contact-sheet-${part+1}.png`),fullPage:true});
  }
  // Compact 3 x 3 animated preview for the conversation.
  const previewSlugs=['earth-moon-race','well-depth','pendulum-period','heat-pump-magic','snells-law','keplers-third-law','bike-gears','coffee-cooling','double-slit'];
  const labels=['Speed of light','Well depth','Pendulum','Heat pump','Refraction','Planet orbits','Bike gears','Coffee cooling','Double slit'];
  await page.setViewportSize({width:780,height:660});
  await page.setContent(`<!doctype html><html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#F7F5F0;color:#1B1A17}main{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.tile{--accent:#2F6BD8;--cat-bg:#EAEFF4;background:var(--cat-bg);border-radius:8px;padding:20px;display:flex;flex-direction:column;gap:16px;height:194px}.tile-icon{width:100%;height:110px;display:block;overflow:visible}h2{font:400 19px Georgia;margin:0}${css}</style><main>${previewSlugs.map((slug,i)=>`<article class="tile icon-playing"><svg class="tile-icon" viewBox="0 0 120 64">${icons[slug]}</svg><h2>${labels[i]}</h2></article>`).join('')}</main></html>`);
  assert.equal(await page.evaluate(()=>document.body.scrollHeight>innerHeight),false,'preview fits the capture');
  await page.evaluate(()=>scrollTo(0,0));
  await page.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
  for(let i=0;i<34;i++){
   await page.evaluate(t=>document.getAnimations().forEach(a=>a.currentTime=t),i*100);
   await page.screenshot({path:path.join(out,'preview-'+String(i).padStart(3,'0')+'.png'),fullPage:true});
  }
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results));
 }finally{await browser.close();}
})();
