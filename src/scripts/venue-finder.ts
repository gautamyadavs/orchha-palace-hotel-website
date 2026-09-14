import { venueMatch } from "@/lib/venues";
import type { EventJourney, EventVenue, SeatingLayout } from "@/lib/types";
document.querySelectorAll<HTMLElement>("[data-venue-finder]").forEach(root => {
  const journey = root.dataset.journey as EventJourney;
  const venues: EventVenue[] = JSON.parse(root.querySelector("[data-venue-data]")!.textContent!);
  const setting = root.querySelector<HTMLSelectElement>("[data-venue-setting]")!;
  const layout = root.querySelector<HTMLSelectElement>("[data-venue-layout]")!;
  const guests = root.querySelector<HTMLInputElement>("[data-venue-guests]")!;
  const cards = [...root.querySelectorAll<HTMLElement>("[data-venue-card]")];
  root.querySelector<HTMLElement>("[data-venue-controls]")!.hidden = false;
  const update = () => {
    let matched = 0, uncertain = 0;
    const count = guests.value ? Number(guests.value) : undefined;
    if (count !== undefined && (!Number.isInteger(count) || count < 2 || count > 5000)) {
      guests.setAttribute("aria-invalid", "true");
      root.querySelector<HTMLElement>("[data-venue-status]")!.textContent = "Enter a guest count between 2 and 5,000."; return;
    }
    guests.removeAttribute("aria-invalid");
    cards.forEach(card => {
      const venue = venues.find(v => v.slug === card.dataset.slug)!;
      const match = venueMatch(venue, journey, setting.value, layout.value as SeatingLayout, count);
      card.hidden = match === "excluded";
      if (match === "excluded") return;
      const target = match === "match" ? "[data-matched-results]" : "[data-confirm-results]";
      root.querySelector(target)!.append(card);
      const supported = Object.entries(venue.capacities || {}).filter(([, capacity]) => !count || capacity >= count).map(([name,capacity]) => `${name}: up to ${capacity}`).join(" · ");
      card.querySelector<HTMLElement>("[data-match-label]")!.textContent = !layout.value ? (count ? supported || "Let's discuss the best arrangement for your group" : venue.capacity) : match === "match" ? `Up to ${venue.capacities?.[layout.value as SeatingLayout]} · ${layout.value} layout` : `Ask us to confirm ${layout.value.toLowerCase()} capacity`;
      if (match === "match") matched++; else uncertain++;
    });
    root.querySelector<HTMLElement>("[data-matched-heading]")!.hidden = !matched || (!layout.value && !count);
    root.querySelector<HTMLElement>("[data-matched-heading]")!.textContent = layout.value ? "Matches for your layout" : "Layouts to suit your group";
    root.querySelector<HTMLElement>("[data-confirm-heading]")!.hidden = !uncertain;
    root.querySelector<HTMLElement>("[data-venue-status]")!.textContent = !layout.value && !count ? `${matched} spaces to explore${setting.value ? ` · ${setting.value.toLowerCase()} settings` : " · find your favourite setting"}.` : matched + uncertain ? `${matched} layout options${uncertain ? ` · ${uncertain} more spaces to discuss with our team` : ""}.` : "No spaces match those filters. Try a different setting or ask our team about your requirements.";
  };
  [setting,layout,guests].forEach(input => input.addEventListener("change",update));
  root.querySelector("[data-venue-reset]")!.addEventListener("click",()=>{ setting.value="";layout.selectedIndex=0;guests.value="";update(); });
  root.querySelectorAll<HTMLElement>("[data-select-venue]").forEach(button=>button.addEventListener("click",()=>{
    const form=document.querySelector<HTMLFormElement>("[data-event-lead-form]"); if(!form)return;
    for(const [name,value] of [["preferredVenue",button.dataset.selectVenue!],["seatingLayout",layout.value],["guestCount",guests.value]]){
      const field=form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;
      if(field && value)field.value=value;
    }
    form.dispatchEvent(new CustomEvent("event-requirements-selected"));
    requestAnimationFrame(()=>form.querySelector<HTMLInputElement | HTMLSelectElement>("[data-lead-step='1'] select")?.focus());
  }));
  update();
});
