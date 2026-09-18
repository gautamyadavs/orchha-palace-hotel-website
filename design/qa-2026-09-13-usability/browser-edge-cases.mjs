import {chromium} from '/Users/gautamyadav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const out='design/qa-2026-09-13-usability';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const checks=[];const errors=[];const context=await browser.newContext({viewport:{width:611,height:844},reducedMotion:'reduce'});
await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
let blocked=true;const held=[];
await context.route('**/event-showcase-fireworks.webp',route=>blocked?held.push(route):route.continue());
await context.route('**/private-date.webp',route=>route.abort());
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const selected=async index=>page.waitForFunction(i=>document.querySelectorAll('[data-gallery-thumbnail]')[i].getAttribute('aria-pressed')==='true'&&!document.querySelector('[data-room-gallery]').hasAttribute('aria-busy'),index);
try{
 await page.goto('http://127.0.0.1:4330/weddings/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await selected(0);
 await page.locator('[data-gallery-thumbnail]').nth(1).evaluate(el=>el.click());await page.waitForFunction(()=>document.querySelector('[data-room-gallery]').hasAttribute('aria-busy'));
 assert.match(await page.locator('[data-gallery-main]').getAttribute('src'),/event-showcase-one/);assert.equal(await page.locator('[data-gallery-caption]').innerText(),'Daytime wedding celebration');assert.equal(await page.locator('[data-gallery-thumbnail]').nth(0).getAttribute('aria-pressed'),'true');
 await page.locator('[data-gallery-thumbnail]').nth(2).evaluate(el=>el.click());await selected(2);blocked=false;await Promise.all(held.map(route=>route.continue()));await page.waitForLoadState('networkidle');assert.match(await page.locator('[data-gallery-main]').getAttribute('src'),/event-showcase-two/);
 await page.locator('[data-gallery-thumbnail]').nth(4).evaluate(el=>el.click());await page.waitForFunction(()=>document.querySelector('[data-gallery-status]').textContent.includes('could not load'));assert.match(await page.locator('[data-gallery-main]').getAttribute('src'),/event-showcase-two/);assert.equal(await page.locator('[data-gallery-caption]').innerText(),'Open-air amphitheatre');
 await context.unroute('**/private-date.webp');await page.locator('[data-gallery-thumbnail]').nth(4).evaluate(el=>el.click());await selected(4);
 checks.push('Delayed image keeps original image/caption/selection; stale loads cannot overwrite the newest choice; failed image retains current view and retry works');
 await page.locator('[data-gallery-thumbnail]').nth(0).evaluate(el=>el.click());await selected(0);
 await page.locator('.room-gallery__stage').dispatchEvent('pointerdown',{clientX:350,clientY:250,pointerType:'touch'});await page.locator('.room-gallery__stage').dispatchEvent('pointerup',{clientX:100,clientY:252,pointerType:'touch'});await selected(1);
 await page.locator('.room-gallery__stage').dispatchEvent('pointerdown',{clientX:250,clientY:150,pointerType:'touch'});await page.locator('.room-gallery__stage').dispatchEvent('pointerup',{clientX:300,clientY:450,pointerType:'touch'});assert.equal(await page.locator('[data-gallery-thumbnail]').nth(1).getAttribute('aria-pressed'),'true');checks.push('Horizontal touch-pointer swipe advances; predominantly vertical swipe leaves the photograph unchanged');
 // Existing room presentation remains opt-in, not globally changed to contain.
 await page.goto('http://127.0.0.1:4330/rooms/standard-room/');assert.equal(await page.locator('[data-gallery-main]').evaluate(el=>getComputedStyle(el).objectFit),'cover');checks.push('Existing room-gallery fit defaults remain unchanged');
 await page.setViewportSize({width:390,height:500});await page.goto('http://127.0.0.1:4330/explore-orchha/');await page.locator('[data-plan-edit]').click();await page.locator('#slot-0-afternoon').click();await page.locator('input[name=replacement][value=ram-raja]').check();
 const sheet=await page.locator('[data-picker-dialog]').evaluate(el=>({dialog:el.getBoundingClientRect().toJSON(),context:el.querySelector('[data-picker-context]').getBoundingClientRect().toJSON(),button:el.querySelector('[data-picker-save]').getBoundingClientRect().toJSON(),list:el.querySelector('[data-picker-results]').clientHeight}));assert.ok(sheet.button.bottom<=500);assert.ok(sheet.context.top>=0);assert.ok(sheet.list>=48);await page.screenshot({path:`out/short-picker.png`.replace('out',out)});await page.locator('[data-picker-cancel]').click();
 checks.push({check:'Short mobile viewport keeps context and confirmation controls visible',sheet});
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('unavailable');}},configurable:true});});await page.locator('[data-plan-copy]').click();assert.equal(await page.locator('[data-copy-fallback]').isVisible(),true);assert.match(await page.locator('[data-copy-text]').inputValue(),/Day 3/);assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-copy-text')),true);
 checks.push('Clipboard denial provides a focused, complete selectable summary');
 await page.evaluate(()=>sessionStorage.setItem('orchha_booking_v1',JSON.stringify({checkIn:'2000-01-01',checkOut:'2000-01-03',adults:2,children:0,promoCode:''})));
 await page.locator('#planner-book').click();await page.locator('[data-book-arrival]').fill('2099-10-04');await page.locator('[data-arrival-form] button[type=submit]').click();assert.equal(await page.locator('[data-date-dialog]').evaluate(el=>el.open),false);assert.equal(await page.locator('[data-booking-sheet] input[name=checkIn]').inputValue(),'2099-10-04');await page.locator('[data-booking-close]').click();checks.push('Invalid past room-search dates do not create a date conflict');
 // Browser restoration for a legacy v1 fixture, with no write just for visiting.
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('orchha_itinerary_v1')));
 saved.version=1;saved.days=saved.days.map(({earlyMorning,...day})=>day);
 await page.evaluate(value=>localStorage.setItem('orchha_itinerary_v1',JSON.stringify(value)),saved);await page.reload();assert.equal(await page.locator('[data-plan-kind]').innerText(),'Restored stay');assert.match(await page.locator('.planner-day').nth(1).innerText(),/Orchha Fort with a heritage guide/);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('orchha_itinerary_v1')).version),1);
 checks.push('A legacy v1 saved plan restores without overwriting storage until the guest changes it');
 await context.close();
 const blockedContext=await browser.newContext({viewport:{width:390,height:844}});await blockedContext.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('disabled')};Storage.prototype.setItem=()=>{throw new Error('disabled')};});
 const blockedPage=await blockedContext.newPage();await blockedPage.goto('http://127.0.0.1:4330/explore-orchha/');await blockedPage.locator('[data-plan-nights][value="3"]').check();assert.equal(await blockedPage.locator('.planner-day').count(),4);assert.match(await blockedPage.locator('[data-plan-status]').innerText(),/storage is unavailable/);assert.match(await blockedPage.locator('[data-undo-notice]').innerText(),/Not saved on this device/);await blockedContext.close();checks.push('Disabled storage leaves the planner usable with a visible save warning');
 assert.deepEqual(errors,[]);await writeFile(`${out}/edge-results.json`,JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
}catch(error){console.error(error);process.exitCode=1;}finally{await browser.close();}
