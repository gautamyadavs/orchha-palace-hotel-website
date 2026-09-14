import assert from "node:assert/strict";
import test from "node:test";
import { venueMatch } from "../src/lib/venues.ts";
import type { EventVenue } from "../src/lib/types.ts";
const hall={type:"Indoor",journeys:["wedding","corporate"],capacities:{Theatre:700}} as EventVenue;
test("any layout shows all journey spaces before a choice is made",()=>{
  assert.equal(venueMatch(hall,"corporate","",""),"match");
  assert.equal(venueMatch({...hall,type:"Outdoor",capacities:{}},"corporate","",""),"match");
  assert.equal(venueMatch({...hall,type:"Boardroom"},"corporate","",""),"match");
  assert.equal(venueMatch(hall,"corporate","","",800),"confirm");
});
test("matches only the verified capacity for the requested layout",()=>{
  assert.equal(venueMatch(hall,"corporate","","Theatre",700),"match");
  assert.equal(venueMatch(hall,"corporate","","Theatre",701),"excluded");
  assert.equal(venueMatch(hall,"corporate","","Banquet",700),"confirm");
});
test("keeps unknown capacity separate and respects setting and journey",()=>{
  assert.equal(venueMatch(hall,"wedding","Outdoor","Theatre",10),"excluded");
  const boardroom={...hall,type:"Boardroom",journeys:["corporate"],capacities:{Boardroom:14}} as EventVenue;
  assert.equal(venueMatch(boardroom,"wedding","","Boardroom",10),"excluded");
  assert.equal(venueMatch(boardroom,"corporate","","Theatre",10),"excluded");
  assert.equal(venueMatch(boardroom,"corporate","","Boardroom",14),"match");
});
