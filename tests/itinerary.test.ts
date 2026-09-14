import assert from "node:assert/strict";
import test from "node:test";
import { activities, itineraryTemplates } from "../src/data/activities.ts";
import { allowedSlot, newItinerary, changeNights, placeActivity, restoreItinerary, itinerarySummary, alignPoolWithSeason, poolTime, mealGuidance, initialItinerary, suggestedItinerary, isSuggestedItinerary, poolSlot, slotTimeLabel } from "../src/lib/itinerary.ts";

const two = () => newItinerary(itineraryTemplates[0]);
test("templates respect arrival, departure and meaningful stay lengths", () => {
  for (const template of itineraryTemplates) {
    assert.ok(restoreItinerary(newItinerary(template), activities));
    assert.equal(template.days.length, template.nights + 1);
  }
  assert.equal(allowedSlot(0,"morning",2),false);
  assert.equal(allowedSlot(2,"afternoon",2),false);
  assert.equal(allowedSlot(2,"morning",2),true);
});
test("extending a stay adds suggestions and preserves custom days and departure", () => {
  const plan = placeActivity(two(),"chaturbhuj",2,"morning",activities);
  const longer = changeNights(plan,3,itineraryTemplates[1]);
  assert.deepEqual(longer.days[2],itineraryTemplates[1].days[2]);
  assert.deepEqual(longer.days[3].morning,["chaturbhuj"]);
  assert.deepEqual(longer.days[1],plan.days[1]);
  assert.equal(plan.days.length,3);
});
test("shortening a stay preserves displaced ideas, arrival and departure", () => {
  const plan = newItinerary(itineraryTemplates[1]); plan.arrival="2099-12-30";
  const shorter=changeNights(plan,2);
  assert.deepEqual(shorter.unscheduled,["rafting","pool","sound-light"]);
  assert.equal(shorter.arrival,plan.arrival);
  assert.deepEqual(shorter.days[2],plan.days[3]);
});
test("replacement keeps the displaced outing and moves existing outings only once", () => {
  const plan=placeActivity(two(),"rafting",1,"morning",activities);
  assert.deepEqual(plan.unscheduled,["guided-fort"]);
  const moved=placeActivity(plan,"rafting",0,"afternoon",activities);
  assert.deepEqual(moved.days[1].morning,[]);
  assert.deepEqual(moved.days[0].afternoon,["rafting"]);
});
test("guided and unguided fort visits are alternatives, hotel downtime may repeat", () => {
  const withPool=placeActivity(two(),"pool",1,"afternoon",activities);
  const plan=placeActivity(withPool,"fort",0,"afternoon",activities);
  assert.deepEqual(plan.days[1].morning,[]);
  assert.deepEqual(placeActivity(plan,"pool",0,"afternoon",activities).days[1].afternoon,["pool"]);
});
test("invalid slots and unknown activities cannot modify a plan", () => {
  const plan=two();
  assert.equal(placeActivity(plan,"rafting",0,"morning",activities),plan);
  assert.equal(placeActivity(plan,"unknown",1,"morning",activities),plan);
});
test("restore rejects corrupt versions, impossible dates, duplicate outings and unknown IDs", () => {
  const badDate={...two(),arrival:"2099-02-30"};
  const duplicate=two();duplicate.days[0].afternoon=["fort"];
  for(const invalid of [null,{}, {...two(),version:99},badDate,duplicate,{...two(),unscheduled:["unknown"]}]) assert.equal(restoreItinerary(invalid,activities),null);
});
test("shared summary includes stay length, hotel times and confirmation caveat", () => {
  const summary=itinerarySummary(two(),activities);
  assert.match(summary,/2 nights \/ 3 days/);assert.match(summary,/Arrival after 2pm/);assert.match(summary,/check-out by 10am/i);assert.match(summary,/proposed itinerary/);
});

test("summer pool visits move before breakfast without displacing the main sights",()=>{
  const plan=placeActivity(two(),"pool",1,"afternoon",activities);plan.arrival="2099-05-01";
  const seasonal=alignPoolWithSeason(plan);
  assert.deepEqual(seasonal.days[1].earlyMorning,["pool"]);
  assert.deepEqual(seasonal.days[1].morning,["guided-fort"]);
  assert.deepEqual(seasonal.days[1].evening,["chhatris"]);
  assert.deepEqual(seasonal.days[1].afternoon,[]);
  assert.deepEqual(plan.days[1].afternoon,["pool"]);
});

test("pool scheduling follows October-January and handles stays crossing seasons",()=>{
  for(const month of ["10","11","12","01"])assert.equal(poolTime(`2099-${month}-02`,1),"afternoon");
  for(const month of ["02","03","04","05","06","07","08","09"])assert.equal(poolTime(`2099-${month}-02`,1),"earlyMorning");
  assert.equal(poolTime("2099-09-30",1),"afternoon");
  assert.equal(poolTime("",1),"afternoon");
});

test("a seasonal pool change preserves an already chosen outing",()=>{
  const plan=placeActivity(two(),"pool",1,"afternoon",activities);plan.arrival="2099-05-01";plan.days[1].earlyMorning=["birdwatching"];
  const seasonal=alignPoolWithSeason(plan);
  assert.deepEqual(seasonal.days[1].earlyMorning,["birdwatching"]);
  assert.ok(seasonal.unscheduled.includes("pool"));
});

test("old saved itineraries gain the new early-morning slot without losing edits",()=>{
  const plan=two();const legacy={...plan,version:1,days:plan.days.map(({earlyMorning:_,...day})=>day)};
  const restored=restoreItinerary(legacy,activities);
  assert.equal(restored?.version,2);assert.deepEqual(restored?.days[1].morning,["guided-fort"]);assert.deepEqual(restored?.days[1].earlyMorning,[]);
});

test("all full days have breakfast/dinner guidance and wildlife outings offer packed lunch",()=>{
  const plan=newItinerary(itineraryTemplates[1]);
  assert.match(mealGuidance(plan,1).join(" "),/breakfast.*before leaving/i);
  assert.match(mealGuidance(plan,2).join(" "),/pack lunch/);
  assert.match(mealGuidance(plan,3).join(" "),/breakfast.*before check-out/i);
  assert.equal(activities[0].id,"ram-raja");assert.deepEqual(activities.slice(0,3).map(a=>a.id),["ram-raja","fort","chhatris"]);
});

test("a fresh visit defaults to two nights and explicit links select either template", () => {
  assert.equal(initialItinerary(null,null,itineraryTemplates).plan.nights,2);
  assert.equal(initialItinerary(null,"3",itineraryTemplates).plan.nights,3);
  assert.equal(initialItinerary(null,"invalid",itineraryTemplates).plan.nights,2);
});

test("an explicit length link preserves custom choices and returns the previous plan for Undo", () => {
  const saved=placeActivity(newItinerary(itineraryTemplates[1]),"rafting",2,"morning",activities);
  saved.arrival="2099-05-02";
  const result=initialItinerary(saved,"2",itineraryTemplates);
  assert.equal(result.plan.nights,2);
  assert.deepEqual(result.previous,saved);
  assert.ok(result.plan.unscheduled.includes("rafting"));
  assert.ok(result.plan.unscheduled.includes("sound-light"));
  assert.equal(result.plan.arrival,saved.arrival);
  assert.deepEqual(saved.days[2].morning,["rafting"]);
  assert.ok(restoreItinerary(result.plan,activities));
});

test("restoring without an explicit length does not change or silently re-save a custom plan", () => {
  const saved=placeActivity(newItinerary(itineraryTemplates[1]),"birdwatching",1,"earlyMorning",activities);
  const result=initialItinerary(saved,null,itineraryTemplates);
  assert.deepEqual(result.plan,saved);assert.equal(result.previous,null);
  assert.deepEqual(initialItinerary(saved,"3",itineraryTemplates).plan,saved);
});

test("template comparison respects seasonal suggestions, saved ideas and actual itinerary edits", () => {
  const seasonal=suggestedItinerary(itineraryTemplates,2,"2099-05-01");
  assert.ok(isSuggestedItinerary(seasonal,itineraryTemplates));
  assert.deepEqual(seasonal.days[1].afternoon,["sanctuary"]);
  assert.equal(isSuggestedItinerary({...seasonal,unscheduled:["rafting"]},itineraryTemplates),false);
  assert.equal(isSuggestedItinerary(placeActivity(seasonal,"rafting",1,"morning",activities),itineraryTemplates),false);
});

test("changing between guided and unguided fort visits keeps the displaced version as an idea", () => {
  const changed=placeActivity(two(),"fort",1,"morning",activities);
  assert.deepEqual(changed.days[1].morning,["fort"]);
  assert.ok(changed.unscheduled.includes("guided-fort"));
  assert.ok(restoreItinerary(changed,activities));
});


test("both stays include arrival aarti and Chhatris; only the longer stay suggests pool time", () => {
  for (const template of itineraryTemplates) {
    assert.deepEqual(template.days[0].evening,["ram-raja"]);
    assert.deepEqual(template.days[1].morning,["guided-fort"]);
    assert.deepEqual(template.days[1].afternoon,["sanctuary"]);
    assert.deepEqual(template.days[1].evening,["chhatris"]);
    const poolDays=template.days.flatMap((day,i)=>Object.values(day).flat().includes("pool")?[i]:[]);
    assert.deepEqual(poolDays,template.nights===2?[]:[2]);
  }
  assert.deepEqual(itineraryTemplates[1].days[2].morning,["rafting"]);
  assert.deepEqual(itineraryTemplates[1].days[2].evening,["sound-light"]);
});

test("post-rafting pool time stays after the river outing and before the show in every season", () => {
  for (const arrival of ["", "2099-05-01", "2099-12-01", "2099-09-30"]) {
    const plan=suggestedItinerary(itineraryTemplates,3,arrival);
    assert.deepEqual(plan.days[2].morning,["rafting"]);
    assert.deepEqual(plan.days[2].afternoon,["pool"]);
    assert.deepEqual(plan.days[2].earlyMorning,[]);
    assert.deepEqual(plan.days[2].evening,["sound-light"]);
    assert.equal(poolSlot(plan,2),"afternoon");
    assert.equal(slotTimeLabel(plan,2,"afternoon"),arrival==="2099-05-01"?"Early evening":"Afternoon");
    assert.ok(isSuggestedItinerary(plan,itineraryTemplates));
    assert.ok(restoreItinerary(plan,activities));
  }
});

test("sharing carries dining, balanced pacing and seasonal timing without contradictory dinner guidance", () => {
  const plan=suggestedItinerary(itineraryTemplates,3,"2099-05-01");
  const dayTwo=mealGuidance(plan,1).join(" ");
  assert.match(dayTwo,/Betwa View Dining.*Orchha Resort, by the river/);
  assert.match(dayTwo,/lunch and rest after the fort/);
  assert.match(dayTwo,/short sanctuary visit with transfers/);
  assert.doesNotMatch(dayTwo,/Return to the hotel for dinner/);
  const summary=itinerarySummary(plan,activities);
  assert.match(summary,/Early evening: Pool & garden time/);
  assert.match(summary,/Betwa View Dining/);
  assert.match(summary,/pack lunch/);
  assert.match(summary,/breakfast at the hotel before check-out/);
  assert.equal(slotTimeLabel(plan,2,"afternoon","vr"),"Afternoon");
});
