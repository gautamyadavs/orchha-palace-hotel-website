import type { Activity, SavedItinerary } from "./types";
import { allowedSlot, blocks, slotTimeLabel, dayHeading, mealGuidance } from "./itinerary";

/** Uses the browser's accessible PDF/print renderer; no guest data leaves this device. */
export function printItinerary(plan: SavedItinerary, activities: Activity[]) {
  document.querySelector(".itinerary-print")?.remove();
  const page=document.createElement("article");page.className="itinerary-print";
  const node=(tag:string,text:string,className="")=>{const element=document.createElement(tag);element.textContent=text;element.className=className;return element;};
  const header=node("header","","itinerary-print__header");
  header.append(node("p","ORCHHA PALACE · HOTEL & CONVENTION CENTRE","itinerary-print__brand"),node("h1","Your time in Orchha"),node("p",`${plan.nights} nights / ${plan.nights+1} days${plan.arrival?` · Arriving ${new Date(`${plan.arrival}T12:00:00Z`).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})}`:" · Dates to confirm"}`));page.append(header);
  plan.days.forEach((day,index)=>{
    const section=node("section","","itinerary-print__day");section.append(node("h2",dayHeading(index,plan.nights)));
    mealGuidance(plan,index).forEach(note=>section.append(node("p",note,"itinerary-print__note")));
    blocks.filter(block=>allowedSlot(index,block,plan.nights)&&(block!=="earlyMorning"||day[block].length)).forEach(block=>{
      const slot=node("div","","itinerary-print__slot");slot.append(node("h3",index===plan.nights?"Optional after check-out":slotTimeLabel(plan,index,block)));
      const activity=activities.find(item=>item.id===day[block][0]);
      if(activity){slot.append(node("h4",activity.name),node("p",activity.description),node("p",`${activity.duration} · ${activity.bookingStatus}`,"itinerary-print__note"),node("p",activity.note,"itinerary-print__note"));}
      else slot.append(node("p",index===plan.nights?"Keep this time free for your onward journey, or arrange a short visit if travel allows.":"Time for a leisurely meal, rest or an experience of your choice."));
      section.append(slot);
    });page.append(section);
  });
  if(plan.unscheduled.length){const section=node("section","","itinerary-print__day");section.append(node("h2","Saved ideas"));const list=node("ul","");plan.unscheduled.forEach(id=>list.append(node("li",activities.find(a=>a.id===id)?.name||id)));section.append(list);page.append(section);}
  const footer=node("footer","","itinerary-print__footer");footer.append(node("p","This is a proposed itinerary, not a reservation. Please confirm access, weather, opening times, transport, tickets, meals and any charges with the hotel."),node("p","Arrange your stay: +91 95160 06201 · orchhapalace.com"));page.append(footer);
  document.body.append(page);
  const title=document.title;document.title=`Orchha Palace - ${plan.nights}-night itinerary`;
  const cleanup=()=>{document.title=title;page.remove();};
  window.addEventListener("afterprint",cleanup,{once:true});
  try { window.print(); }
  catch(error) { window.removeEventListener("afterprint",cleanup);cleanup();throw error; }
}
