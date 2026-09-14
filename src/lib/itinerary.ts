import type { Activity, ItineraryTemplate, SavedItinerary, TimeBlock } from "./types";
export const blocks: TimeBlock[] = ["earlyMorning", "morning", "afternoon", "evening"];
export const blockLabels: Record<TimeBlock, string> = { earlyMorning: "Early morning", morning: "Morning", afternoon: "Afternoon", evening: "Evening" };
export function newItinerary(template: ItineraryTemplate): SavedItinerary {
  return { ...structuredClone(template), version: 2, arrival: "", unscheduled: [] };
}
export function suggestedItinerary(templates: ItineraryTemplate[], nights: 2 | 3, arrival = "") {
  const plan = newItinerary(templates.find(template => template.nights === nights)!);
  plan.arrival = arrival;
  return alignPoolWithSeason(plan);
}
export function isSuggestedItinerary(plan: SavedItinerary, templates: ItineraryTemplate[]) {
  const suggested = suggestedItinerary(templates, plan.nights, plan.arrival);
  return !plan.unscheduled.length && plan.days.every((day, index) => blocks.every(block =>
    day[block].join("|") === suggested.days[index][block].join("|")));
}
/** Explicit stay links take precedence without throwing away a restored plan. */
export function initialItinerary(saved: SavedItinerary | null, requested: string | null, templates: ItineraryTemplate[]) {
  const nights = requested === "2" || requested === "3" ? Number(requested) as 2 | 3 : null;
  if (!saved) return { plan: suggestedItinerary(templates, nights ?? 2), previous: null };
  if (nights && nights !== saved.nights) {
    return { plan: alignPoolWithSeason(changeNights(saved, nights, templates.find(t => t.nights === 3))), previous: saved };
  }
  return { plan: saved, previous: null };
}
export function allowedSlot(day: number, block: TimeBlock, nights: number) {
  if (block === "earlyMorning") return day > 0 && day < nights;
  return day >= 0 && day <= nights && !(day === 0 && block === "morning") && !(day === nights && block !== "morning");
}
export function changeNights(plan: SavedItinerary, nights: 2 | 3, template?: ItineraryTemplate): SavedItinerary {
  const result = structuredClone(plan);
  if (result.nights === nights) return result;
  if (nights === 2) {
    const removed = result.days.splice(2, 1)[0];
    result.unscheduled.push(...blocks.flatMap(block => removed[block]));
  } else {
    const extra = structuredClone(template?.nights === 3 ? template.days[2] : { earlyMorning: [], morning: [], afternoon: [], evening: [] });
    const scheduled = new Set(result.days.flatMap(day => blocks.flatMap(block => day[block])));
    // Keep custom outings in place when introducing the suggested extra day.
    blocks.forEach(block => extra[block] = extra[block].filter(id => ["pool", "dining"].includes(id) || !scheduled.has(id)));
    result.days.splice(2, 0, extra);
    const added = blocks.flatMap(block => extra[block]);
    result.unscheduled = result.unscheduled.filter(id => !added.includes(id));
  }
  result.nights = nights;
  result.unscheduled = [...new Set(result.unscheduled)];
  return result;
}
export function placeActivity(plan: SavedItinerary, id: string, day: number, block: TimeBlock, activities: Activity[]): SavedItinerary {
  if (!allowedSlot(day, block, plan.nights) || !activities.some(a => a.id === id)) return plan;
  const next = structuredClone(plan);
  // Guided and unguided heritage are two versions of the same outing.
  const alternatives = id === "fort" || id === "guided-fort" ? ["fort", "guided-fort"] : [id];
  const repeatable = activities.find(a => a.id === id)?.categories.includes("At the hotel");
  const displaced = next.days[day][block].filter(value => value !== id);
  if (!repeatable) next.days.forEach(d => blocks.forEach(b => d[b] = d[b].filter(value => !alternatives.includes(value))));
  next.unscheduled = [...new Set([...next.unscheduled.filter(value => !alternatives.includes(value)), ...displaced])];
  next.days[day][block] = [id];
  return next;
}
export function restoreItinerary(value: unknown, activities: Activity[]): SavedItinerary | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as Omit<SavedItinerary,"version"> & { version: number };
  if (![1,2].includes(stored.version) || ![2,3].includes(stored.nights) || !Array.isArray(stored.days) || stored.days.length !== stored.nights + 1 || !Array.isArray(stored.unscheduled) || typeof stored.arrival !== "string") return null;
  if (stored.days.some(day => !day || typeof day !== "object")) return null;
  // Upgrade existing saved plans without resetting the guest's choices.
  const plan: SavedItinerary = { ...structuredClone(stored), version: 2, days: stored.days.map(day => ({ ...day, earlyMorning: day.earlyMorning ?? [] })) };
  const known = (id: unknown) => typeof id === "string" && activities.some(a => a.id === id);
  if (plan.days.some(d => !d || blocks.some(b => !Array.isArray(d[b]) || d[b].length > 1 || !d[b].every(known)))) return null;
  if (plan.days.some((d,i) => blocks.some(b => !allowedSlot(i,b,plan.nights) && d[b].length))) return null;
  if (!plan.unscheduled.every(known)) return null;
  if (plan.arrival && (!/^\d{4}-\d{2}-\d{2}$/.test(plan.arrival) || !Number.isFinite(Date.parse(plan.arrival)) || new Date(plan.arrival).toISOString().slice(0,10) !== plan.arrival)) return null;
  const outings = plan.days.flatMap(d => blocks.flatMap(b => d[b])).filter(id => !activities.find(a => a.id === id)?.categories.includes("At the hotel")).map(id => id === "guided-fort" ? "fort" : id);
  if (new Set(outings).size !== outings.length) return null;
  return structuredClone(plan);
}
export function itinerarySummary(plan: SavedItinerary, activities: Activity[]) {
  const name = (id: string) => activities.find(a => a.id === id)?.name || id;
  return [`Orchha Palace · ${plan.nights} nights / ${plan.nights + 1} days`, plan.arrival ? `Arrival: ${plan.arrival}` : "Dates to confirm", ...plan.days.map((day,i) => `\n${dayHeading(i,plan.nights)}\n${mealGuidance(plan,i).join("\n")}\n${blocks.filter(b => allowedSlot(i,b,plan.nights) && (b!=="earlyMorning" || day[b].length)).map(b => `${i===plan.nights?"Optional after check-out":slotTimeLabel(plan,i,b)}: ${day[b].map(name).join(", ") || "Time for rest and a leisurely meal"}`).join("\n")}`), plan.unscheduled.length ? `\nSaved ideas: ${plan.unscheduled.map(name).join(", ")}` : "", "\nThis is a proposed itinerary. Please confirm activities, transport, timings and any charges."].filter(Boolean).join("\n");
}

export function dayHeading(day: number, nights: number) {
  return `Day ${day+1} · ${day===0 ? "Arrival after 2pm" : day===nights ? "Breakfast & check-out by 10am" : day===1 ? "Palaces, heritage & the Betwa" : "River time & an evening of stories"}`;
}

export function poolTime(arrival: string, day: number): TimeBlock {
  if (!arrival) return "afternoon";
  const date = new Date(`${arrival}T12:00:00Z`); date.setUTCDate(date.getUTCDate()+day);
  const month = date.getUTCMonth();
  return month===0 || month>=9 ? "afternoon" : "earlyMorning";
}

/** Keep the existing v2 slot contract: the post-rafting pool period precedes
 * the evening show, with an explicit early-evening label in warmer months. */
export function poolSlot(plan: SavedItinerary, day: number): TimeBlock {
  const seasonal = poolTime(plan.arrival, day);
  if (day === 0 && seasonal === "earlyMorning") return "evening";
  return plan.days[day]?.morning.includes("rafting") ? "afternoon" : seasonal;
}

export function slotTimeLabel(plan: SavedItinerary, day: number, block: TimeBlock, id = plan.days[day]?.[block][0]) {
  if (id === "pool" && block === "afternoon" && plan.days[day].morning.includes("rafting") && poolTime(plan.arrival, day) === "earlyMorning") return "Early evening";
  return blockLabels[block];
}

export function alignPoolWithSeason(plan: SavedItinerary): SavedItinerary {
  const next=structuredClone(plan);
  next.days.forEach((day,i)=>{
    if(i===0 || i===next.nights || !blocks.some(block=>day[block].includes("pool")))return;
    const target=poolSlot(next,i);
    if(day[target].includes("pool"))return;
    // Preserve chosen outings when the seasonal pool slot is already occupied.
    blocks.forEach(block=>day[block]=day[block].filter(id=>id!=="pool"));
    if(!day[target].length)day[target]=["pool"];
    else next.unscheduled=[...new Set([...next.unscheduled,"pool"])];
  });
  return next;
}

export function mealGuidance(plan: SavedItinerary, day: number): string[] {
  if(day===plan.nights)return ["Enjoy breakfast at the hotel before check-out by 10am. Any visit below is optional afterwards, subject to onward travel and luggage arrangements."];
  const ids=blocks.flatMap(block=>plan.days[day][block]);
  const dinner=ids.includes("chhatris") ? "After Chhatris sunset, enjoy dinner at Betwa View Dining at our sister property, Orchha Resort, by the river. Ask about a river-facing table and your return transfer; dining is arranged separately." : "Return to the hotel for dinner after your evening activities.";
  const notes=[day===0 ? "Check in from 2pm and settle in before exploring." : "Begin with breakfast at the hotel before leaving for your activities.", dinner];
  if(plan.days[day].earlyMorning.includes("pool"))notes.unshift("An early swim before breakfast; confirm the pool's opening time with the hotel.");
  if(ids.includes("sanctuary") && ids.some(id=>["fort","guided-fort"].includes(id)))notes.push("Pause for lunch and rest after the fort. Choose a short sanctuary visit with transfers, subject to access and weather, and return in time for sunset.");
  if(plan.days[day].morning.includes("rafting") && plan.days[day].afternoon.includes("pool"))notes.push(poolTime(plan.arrival,day)==="earlyMorning" ? "After rafting, take lunch and rest. Swim in the cooler early evening; allow time to change and travel before your evening plans. Confirm pool and show times locally." : "After rafting, take lunch and rest before an afternoon swim. Leave time to change before your evening plans.");
  if(ids.some(id=>["sanctuary","birdwatching","rafting","trekking"].includes(id)))notes.push("We can pack lunch for your outing. Arrange it with the hotel the evening before and confirm your menu and any charges.");
  return notes;
}
