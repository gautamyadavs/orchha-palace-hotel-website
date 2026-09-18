import {chromium} from '/Users/gautamyadav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const out='design/qa-2026-09-13-usability';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
await context.addInitScript(()=>{window.planWrites=0;const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='orchha_itinerary_v1')window.planWrites++;return original.call(this,key,value);};});
const page=await context.newPage();const errors=[],checks=[],layouts=[],accessibility=[];
page.on('pageerror',e=>errors.push(e.message));
const visit=async(path='/explore-orchha/')=>{await page.goto('http://127.0.0.1:4330'+path);await page.evaluate(()=>document.fonts.ready);};
const plan=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('orchha_itinerary_v1')));
const tick=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const shot=async name=>page.screenshot({path:`${out}/${name}.png`});
const openDay=async index=>{if(!await page.locator('.planner-day').nth(index).getAttribute('open').then(v=>v!==null))await page.locator(`#day-summary-${index}`).click();};
const undo=async()=>{await page.locator('[data-undo-notice] [data-plan-undo]').click();await tick();};
const axe=await readFile('/private/tmp/orchha-lighthouse/node_modules/axe-core/axe.min.js','utf8');
const audit=async state=>{await page.addScriptTag({content:axe});const result=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));accessibility.push({state,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});};
try {
 await visit();assert.equal(await page.evaluate(()=>window.planWrites),0);assert.equal(await plan(),null);
 assert.equal(await page.locator('.planner-day[open]').count(),1);assert.equal(await page.locator('.activity-library').getAttribute('open'),null);
 assert.equal(await page.locator('.slot-actions:visible').count(),0);assert.equal(await page.locator('h1').count(),1);
 for(const width of [320,390,611,768,1030,1440]){
  await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await tick();
  const measured=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,firstActivity:document.querySelector('.planner-activity-name').getBoundingClientRect().bottom,choices:document.querySelector('.stay-choices').getBoundingClientRect().bottom,imageHeight:document.querySelector('.explore-intro img').getBoundingClientRect().height,dayColumns:getComputedStyle(document.querySelector('.planner-days')).gridTemplateColumns}));
  assert.equal(measured.scrollWidth,width);if(width===390){assert.ok(measured.firstActivity<776);assert.ok(measured.choices<776);}if(width<768)assert.ok(measured.imageHeight<=140);
  layouts.push({page:'explore',...measured});await shot(`explore-${width}`);
 }
 await page.setViewportSize({width:390,height:844});await audit('suggested-mobile');
 await page.locator('[data-plan-edit]').click();assert.equal(await page.locator('[data-plan-edit]').innerText(),'Done');
 await page.locator('#slot-0-afternoon').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await tick();
 const before=await page.evaluate(()=>scrollY);await page.locator('#slot-0-afternoon').click();await shot('change-390');
 await audit('picker-mobile');assert.match(await page.locator('[data-picker-context]').innerText(),/Day 1 · Afternoon/);
 await page.locator('[data-picker-search]').fill('no-such-experience');assert.equal(await page.locator('.picker-option').count(),0);assert.equal(await page.locator('[data-picker-save]').isDisabled(),true);
 await page.getByRole('button',{name:'Clear filters',exact:true}).click();assert.equal(await page.locator('.picker-option').count(),21);
 await page.keyboard.press('Escape');await tick();assert.equal(await page.evaluate(()=>document.activeElement.id),'slot-0-afternoon');assert.ok(Math.abs(await page.evaluate(()=>scrollY)-before)<2);assert.equal(await page.evaluate(()=>window.planWrites),0);
 checks.push('Change/search/empty state/clear/Cancel retain focus and scroll; reading and editing-mode toggles do not save');
 await page.locator('#slot-0-afternoon').click();await page.locator('input[name=replacement][value=chhatris]').check();
 assert.match(await page.locator('[data-picker-message]').innerText(),/Moves from Day 2 · Evening/);assert.equal(await page.locator('[data-picker-save]').innerText(),'Move here');
 await page.locator('[data-picker-save]').click();await tick();let value=await plan();assert.deepEqual(value.days[0].afternoon,['chhatris']);assert.deepEqual(value.days[1].evening,[]);assert.ok(value.unscheduled.includes('chaturbhuj'));assert.equal(await page.evaluate(()=>document.activeElement.id),'slot-0-afternoon');
 const undoY=await page.evaluate(()=>scrollY);await undo();assert.equal(await page.evaluate(()=>document.activeElement.id),'slot-0-afternoon');assert.ok(Math.abs(await page.evaluate(()=>scrollY)-undoY)<2);value=await plan();assert.deepEqual(value.days[0].afternoon,['chaturbhuj']);assert.deepEqual(value.days[1].evening,['chhatris']);assert.equal(await page.locator('[data-plan-options]').isVisible(),false);
 checks.push('Replacement retains its target slot; existing outing explicitly moves; displaced idea saved; one-step Undo restores all');
 await page.locator('#slot-0-afternoon').click();await page.locator('input[name=replacement][value=rafting]').check();await page.locator('[data-picker-save]').click();await tick();const dismissY=await page.evaluate(()=>scrollY);await page.locator('[data-undo-dismiss]').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'slot-0-afternoon');assert.ok(Math.abs(await page.evaluate(()=>scrollY)-dismissY)<2);await page.locator('[data-plan-options] summary').click();await page.locator('.plan-options-menu [data-plan-undo]').click();checks.push('Undo and dismissing its notification retain visible keyboard focus; Undo remains available in Options');
 await openDay(1);assert.equal(await page.locator('.planner-day[open]').count(),2);
 await page.locator('#slot-1-morning').locator('..').getByText('More',{exact:true}).click();await page.getByRole('button',{name:'Move Orchha Fort with a heritage guide',exact:true}).click();
 await page.locator('[data-place-day]').selectOption('0');await page.locator('[data-place-block]').selectOption('afternoon');await page.locator('[data-place-save]').click();await tick();value=await plan();assert.deepEqual(value.days[1].morning,[]);assert.deepEqual(value.days[0].afternoon,['guided-fort']);assert.equal(await page.evaluate(()=>document.activeElement.id),'slot-1-morning');
 await undo();checks.push('Move confirms target and restores focus to source; multiple days remain expanded');
 await page.locator('#slot-0-afternoon').locator('..').getByText('More',{exact:true}).click();await page.getByRole('button',{name:'Remove Chaturbhuj Temple',exact:true}).click();await tick();value=await plan();assert.deepEqual(value.days[0].afternoon,[]);assert.ok(value.unscheduled.includes('chaturbhuj'));
 await page.locator('[data-plan-options] summary').click();await page.locator('[data-plan-reset]').click();assert.deepEqual((await plan()).days[0].afternoon,['chaturbhuj']);assert.equal(await page.locator('[data-plan-reset]').isVisible(),false);await undo();assert.deepEqual((await plan()).days[0].afternoon,[]);
 checks.push('Remove retains saved ideas; Reset is conditional, reversible and retains arrival dates');
 await page.locator('[data-plan-options] summary').click();await page.locator('[data-plan-reset]').click();
 await page.locator('[data-plan-nights][value="3"]').check();assert.equal((await plan()).nights,3);
 await page.locator('[data-travel-dates] summary').click();await page.locator('[data-plan-arrival]').fill('2099-05-02');await page.locator('[data-plan-arrival]').blur();value=await plan();assert.deepEqual(value.days[1].earlyMorning,['pool']);assert.deepEqual(value.days[1].morning,['guided-fort']);assert.deepEqual(value.days[2].earlyMorning,['pool']);
 await page.locator('[data-plan-edit]').click();assert.equal(await page.locator('.slot-actions:visible').count(),0);await page.reload();await tick();assert.equal(await page.locator('[data-plan-kind]').innerText(),'Restored stay');assert.equal(await page.evaluate(()=>window.planWrites),0);
 await visit('/explore-orchha/?nights=2');value=await plan();assert.equal(value.nights,2);assert.ok(value.unscheduled.includes('sanctuary'));assert.ok(value.unscheduled.includes('sound-light'));await undo();assert.equal((await plan()).nights,3);assert.match(page.url(),/nights=3/);
 checks.push('Seasonal dates, restored plans, explicit two-night links, saved ideas and length Undo');
 await page.locator('.activity-library > summary').click();await page.locator('[data-activity-search]').fill('qzqzqzqz');assert.equal(await page.locator('.activity-card:visible').count(),0);await page.locator('[data-filter-clear]').click();assert.equal(await page.locator('.activity-card:visible').count(),21);await page.locator('[data-activity-category]').selectOption('Nature');assert.ok(await page.locator('.activity-card:visible').count()<21);await page.locator('.activity-library > summary').click();
 checks.push('Catalogue search and interests retain a recoverable empty state');
 // Print all days even though only the first is expanded; the browser print view is self-contained.
 await page.evaluate(()=>window.print=()=>{window.printRequested=true;});await page.locator('[data-plan-pdf]').click();await page.waitForSelector('.itinerary-print',{state:'attached'});
 assert.equal(await page.locator('.itinerary-print__day').count(),4);assert.match(await page.locator('.itinerary-print').innerText(),/pack lunch/i);
 await page.pdf({path:`${out}/three-night-itinerary.pdf`,format:'A4',printBackground:true});await page.evaluate(()=>dispatchEvent(new Event('afterprint')));assert.equal(await page.locator('.itinerary-print').count(),0);
 const whatsapp=decodeURIComponent(await page.locator('[data-plan-whatsapp]').getAttribute('href'));assert.match(whatsapp,/Day 4/);assert.match(whatsapp,/pack lunch/);
 await page.locator('[data-plan-nights][value="2"]').check();await page.locator('[data-plan-pdf]').click();await page.waitForSelector('.itinerary-print',{state:'attached'});assert.match(await page.locator('.itinerary-print').innerText(),/Saved ideas/);await page.pdf({path:`${out}/two-night-with-saved-ideas.pdf`,format:'A4',printBackground:true});await page.evaluate(()=>dispatchEvent(new Event('afterprint')));
 checks.push('PDF and WhatsApp include all days, meal notes and saved ideas while day cards are closed');
 // Fresh guest booking journey; no dates stored must not produce a conflict dialog.
 await page.evaluate(()=>{localStorage.removeItem('orchha_itinerary_v1');sessionStorage.clear();});await visit();
 await page.locator('.planner-sticky [data-plan-book]').click();assert.equal(await page.locator('[data-arrival-dialog]').evaluate(el=>el.open),true);await page.locator('[data-arrival-cancel]').click();await tick();assert.equal(await page.evaluate(()=>document.activeElement.closest('.planner-sticky')!==null),true);
 await page.locator('.planner-sticky [data-plan-book]').click();await page.locator('[data-book-arrival]').fill('2099-05-02');await page.locator('[data-arrival-form] button[type=submit]').click();await tick();assert.equal(await page.locator('[data-date-dialog]').evaluate(el=>el.open),false);assert.equal(await page.locator('[data-booking-sheet]').evaluate(el=>el.open),true);
 assert.equal(await page.locator('[data-booking-sheet] input[name=checkIn]').inputValue(),'2099-05-02');assert.equal(await page.locator('[data-booking-sheet] input[name=checkOut]').inputValue(),'2099-05-04');await page.locator('[data-booking-close]').click();await tick();
 await page.evaluate(()=>sessionStorage.setItem('orchha_booking_v1',JSON.stringify({checkIn:'2099-06-02',checkOut:'2099-06-04',adults:3,children:1,promoCode:'TEST'})));
 await page.locator('.planner-sticky [data-plan-book]').click();assert.equal(await page.locator('[data-date-dialog]').evaluate(el=>el.open),true);await shot('booking-date-choice-390');await page.locator('[data-dates-keep]').click();assert.equal(await page.locator('[data-booking-sheet] input[name=checkIn]').inputValue(),'2099-06-02');await page.locator('[data-booking-close]').click();await tick();
 await page.locator('.planner-sticky [data-plan-book]').click();await page.locator('[data-dates-use]').click();assert.equal(await page.locator('[data-booking-sheet] input[name=checkIn]').inputValue(),'2099-05-02');await page.locator('[data-booking-close]').click();await tick();
 await page.locator('.planner-sticky [data-plan-book]').click();assert.equal(await page.locator('[data-date-dialog]').evaluate(el=>el.open),false);await page.locator('[data-booking-close]').click();
 checks.push('Missing arrival is requested in context; conflicts appear only for differing valid room dates; both choices and equal-date handoff work');
 await page.locator('[data-plan-edit]').click();await openDay(1);await page.locator('#slot-1-afternoon').click();await page.locator('input[name=replacement][value=pool]').check();assert.equal(await page.locator('[data-picker-save]').isDisabled(),true);assert.match(await page.locator('[data-picker-message]').innerText(),/early morning/);await shot('pool-timing-explanation-390');await page.locator('[data-picker-cancel]').click();
 for(const width of [320,611,768,1030,1440]){await page.setViewportSize({width,height:844});await page.locator('#slot-0-afternoon').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);await shot(`picker-${width}`);await page.locator('[data-picker-cancel]').click();}
 checks.push('Picker layouts work from 320 to 1440; seasonal timing incompatibility is explained before confirmation');
 await visit('/weddings/');
 const expected=['event-showcase-one','event-showcase-fireworks','event-showcase-two','dining-groups','private-date'];
 for(const width of [320,390,611,768,1030,1440]){
  await page.setViewportSize({width,height:844});
  await page.locator('.room-gallery__stage').scrollIntoViewIfNeeded();await tick();
  for(let i=0;i<5;i++){
   await page.locator('[data-gallery-thumbnail]').nth(i).evaluate(el=>el.click());await page.waitForFunction(index=>document.querySelectorAll('[data-gallery-thumbnail]')[index].getAttribute('aria-pressed')==='true',i);
   const measured=await page.locator('[data-room-gallery]').evaluate(el=>{const img=el.querySelector('[data-gallery-main]'),frame=el.querySelector('.room-gallery__stage'),selected=el.querySelector('[aria-pressed=true]');return{width:innerWidth,scrollWidth:document.documentElement.scrollWidth,frame:frame.getBoundingClientRect().toJSON(),image:img.getBoundingClientRect().toJSON(),fit:getComputedStyle(img).objectFit,src:img.getAttribute('src'),caption:el.querySelector('[data-gallery-caption]').textContent,selected:selected.dataset.caption,natural:[img.naturalWidth,img.naturalHeight]};});
   assert.equal(measured.fit,'contain');assert.match(measured.src,new RegExp(expected[i]));assert.equal(measured.caption,measured.selected);assert.equal(measured.scrollWidth,width);assert.ok(Math.abs(measured.frame.width/measured.frame.height-(width<960?1.5:16/9))<.01);assert.ok(measured.natural[0]>0);
   layouts.push({page:'wedding',...measured});
   if(width===611 || (i===0&&[390,1440].includes(width)))await shot(`wedding-${width}-${i+1}`);
  }
 }
 await page.setViewportSize({width:611,height:844});await page.locator('.room-gallery__thumbnails').scrollIntoViewIfNeeded();await tick();const weddingY=await page.evaluate(()=>scrollY);await page.locator('[data-gallery-thumbnail]').nth(0).evaluate(el=>el.click());await page.waitForFunction(()=>document.querySelector('[data-gallery-caption]').textContent==='Daytime wedding celebration');await tick();assert.ok(Math.abs(await page.evaluate(()=>scrollY)-weddingY)<2);
 await page.locator('.room-gallery__stage').focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('[data-gallery-caption]').textContent==='Wedding finale with fireworks');await page.locator('[data-gallery-open]').click();assert.equal(await page.locator('[data-gallery-dialog]').evaluate(el=>el.open),true);await page.locator('[data-gallery-dialog-next]').click();await page.waitForFunction(()=>document.querySelector('[data-gallery-dialog-caption]').textContent==='Open-air amphitheatre');await page.keyboard.press('Escape');await tick();assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-gallery-open')),true);
 await audit('wedding-mobile');checks.push('All five wedding images retain complete frames at six widths; caption/selection match; thumbnail changes do not move the page; keyboard/fullscreen work');
 assert.deepEqual(errors,[]);
 await writeFile(`${out}/usability-results.json`,JSON.stringify({checks,layouts,accessibility,errors},null,2));console.log(JSON.stringify({checks,accessibility,errors},null,2));
} catch(error){await shot('failure');console.error(error);console.log('Errors',errors);process.exitCode=1;}finally{await browser.close();}
