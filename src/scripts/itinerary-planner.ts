import type { Activity, ItineraryTemplate, SavedItinerary, TimeBlock } from "@/lib/types";
import { changeNights, placeActivity, restoreItinerary, itinerarySummary, allowedSlot, blocks, blockLabels, dayHeading, mealGuidance, alignPoolWithSeason, poolSlot, slotTimeLabel, suggestedItinerary, isSuggestedItinerary, initialItinerary } from "@/lib/itinerary";
import { readBooking, saveBooking, addNights } from "@/lib/booking-state";
import { validateBookingSearch } from "@/lib/booking";
import { track } from "@/lib/analytics";
import { withBase } from "@/lib/paths";

type Slot = { day: number; block: TimeBlock };
type FocusPoint = { element: HTMLElement | null; id: string; y: number };
type PlanKind = "Suggested stay" | "Restored stay" | "Customised stay";

document.querySelectorAll<HTMLElement>("[data-planner]").forEach(root => {
  const $ = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const { activities, templates } = JSON.parse($("[data-plan-data]").textContent!) as { activities: Activity[]; templates: ItineraryTemplate[] };
  const key = "orchha_itinerary_v1"; // Keep the existing key and v2 data contract.
  let stored: SavedItinerary | null = null;
  try { stored = restoreItinerary(JSON.parse(localStorage.getItem(key) || "null"), activities); } catch { /* The planner also works without storage. */ }
  const initial = initialItinerary(stored, new URLSearchParams(location.search).get("nights"), templates);
  let plan = initial.plan;
  let kind: PlanKind = stored ? "Restored stay" : "Suggested stay";
  let undo: { plan: SavedItinerary; kind: PlanKind; focus?: FocusPoint | null } | null = initial.previous ? { plan: initial.previous, kind: "Restored stay" } : null;
  let lastChangePoint: FocusPoint | null = null;
  let editing = false;
  let showUndo = Boolean(initial.previous);
  const expanded = new Set([0]);
  const arrival = $<HTMLInputElement>("[data-plan-arrival]");
  const status = $("[data-plan-status]");
  const days = $("[data-plan-days]");
  const picker = $<HTMLDialogElement>("[data-picker-dialog]");
  const placeDialog = $<HTMLDialogElement>("[data-place-dialog]");
  const arrivalDialog = $<HTMLDialogElement>("[data-arrival-dialog]");
  const dateDialog = $<HTMLDialogElement>("[data-date-dialog]");
  const daySelect = $<HTMLSelectElement>("[data-place-day]");
  const blockSelect = $<HTMLSelectElement>("[data-place-block]");
  const bookingArrival = $<HTMLInputElement>("[data-book-arrival]");
  let pickerSlot: Slot = { day: 0, block: "afternoon" };
  let pendingId = "";
  let origin: Slot | undefined;
  let returnPoint: FocusPoint | null = null;
  let bookingPoint: FocusPoint | null = null;
  let bookingHandoff = false;
  let proposedDates = { checkIn: "", checkOut: "" };
  const today = new Date();
  arrival.min = bookingArrival.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const name = (id: string) => activities.find(a => a.id === id)?.name || id;
  const slotLabel = ({ day, block }: Slot) => `Day ${day + 1} · ${day === plan.nights ? "After check-out" : slotTimeLabel(plan, day, block)}`;
  const element = <K extends keyof HTMLElementTagNameMap>(tag: K, text = "", className = "") => {
    const el = document.createElement(tag); el.textContent = text; el.className = className; return el;
  };
  const button = (text: string, action: () => void, label = text, id = "") => {
    const el = element("button", text, "button button--secondary button--small");
    el.type = "button"; el.setAttribute("aria-label", label); if (id) el.id = id;
    el.addEventListener("click", action); return el;
  };
  const focusPoint = (target = document.activeElement as HTMLElement | null): FocusPoint => ({ element: target, id: target?.id || "", y: window.scrollY });
  const restoreFocus = (point: FocusPoint | null) => {
    if (!point || point.element === document.body || point.element === document.documentElement) return;
    window.scrollTo({ top: point.y, behavior: "instant" });
    let target = point.element?.isConnected ? point.element : document.getElementById(point.id);
    const inView = (el: HTMLElement) => {
      const bounds = el.getBoundingClientRect();
      const bottom = el.closest("[data-mobile-sticky]") ? innerHeight : innerHeight - 80;
      return bounds.height > 0 && bounds.top >= 80 && bounds.bottom <= bottom && getComputedStyle(el).visibility !== "hidden" && !el.closest("[inert]");
    };
    // A saved idea may disappear after placement. Keep keyboard focus in the
    // visible itinerary instead of sending it to a removed or off-screen node.
    if (!target || !inView(target)) target = [...root.querySelectorAll<HTMLElement>("button, summary, a")].find(el => !el.closest("dialog, [data-undo-notice]") && inView(el)) || $("[data-plan-edit]");
    target.focus({ preventScroll: true });
  };
  const updateSummary = () => {
    const summary = itinerarySummary(plan, activities);
    $<HTMLAnchorElement>("[data-plan-whatsapp]").href = `https://wa.me/919516006201?text=${encodeURIComponent("Hello Orchha Palace, please help arrange this stay:\n\n" + summary)}`;
    $<HTMLTextAreaElement>("[data-copy-text]").value = summary;
  };
  const persist = (notice: string) => {
    let saved = true;
    try { localStorage.setItem(key, JSON.stringify(plan)); } catch { saved = false; }
    $("[data-undo-notice] > span").textContent = saved ? "Stay updated" : "Not saved on this device";
    status.textContent = `${notice} ${saved ? "Saved on this device." : "Device storage is unavailable; save a PDF or copy your stay to keep it."}`;
  };
  const scheduled = (id: string) => {
    const alternatives = ["fort", "guided-fort"].includes(id) ? ["fort", "guided-fort"] : [id];
    return plan.days.flatMap((day, index) => blocks.filter(block => day[block].some(value => alternatives.includes(value))).map(block => ({ day: index, block })));
  };
  const scheduledText = (id: string) => {
    const locations = scheduled(id);
    return locations.length ? `In your stay: ${locations.map(slotLabel).join("; ")}` : "";
  };
  const poolBlock = (day: number) => poolSlot(plan, day);
  const timingIssue = (id: string, slot: Slot) => {
    if (id !== "pool") return "";
    if (slot.day === plan.nights) return "Pool time belongs before check-out. Choose an earlier day.";
    if (plan.arrival && slot.block !== poolBlock(slot.day)) return `For your travel dates, pool time is ${slotTimeLabel(plan, slot.day, poolBlock(slot.day), "pool").toLowerCase()}. Keep this slot for another experience; add pool time to that period from Saved ideas or the catalogue.`;
    return "";
  };
  const placementNotes = (id: string, target: Slot, movingFrom?: Slot) => {
    const notes: string[] = [];
    const repeatable = activities.find(a => a.id === id)?.categories.includes("At the hotel");
    const sources = movingFrom ? [movingFrom] : repeatable ? [] : scheduled(id);
    const elsewhere = sources.filter(slot => slot.day !== target.day || slot.block !== target.block);
    if (elsewhere.length) notes.push(`Moves from ${elsewhere.map(slotLabel).join("; ")}, leaving that time free.`);
    const displaced = plan.days[target.day][target.block].filter(value => value !== id);
    if (displaced.length) notes.push(`${displaced.map(name).join(", ")} will stay in Saved ideas.`);
    const activity = activities.find(a => a.id === id)!;
    if (id !== "pool" && slotTimeLabel(plan, target.day, target.block) !== blockLabels[target.block]) notes.push("This experience uses the afternoon slot. The early-evening timing applied to the pool only.");
    if (id === "pool" && slotTimeLabel(plan, target.day, target.block, id) !== blockLabels[target.block]) notes.push("After rafting, swim in the cooler early evening; leave time to change before your evening plans.");
    if (activity.block !== target.block && id !== "pool") notes.push(`Usually ${blockLabels[activity.block].toLowerCase()}; your ${blockLabels[target.block].toLowerCase()} slot stays selected. Confirm visiting times with the hotel.`);
    return notes.join(" ") || `Added to ${slotLabel(target)}. Arrangements need confirmation.`;
  };
  const commit = (next: SavedItinerary, notice: string) => {
    if (JSON.stringify(next) === JSON.stringify(plan)) return false;
    const active = document.activeElement as HTMLElement | null;
    lastChangePoint = picker.open || placeDialog.open ? returnPoint : focusPoint(active?.closest(".planner-slot")?.querySelector<HTMLElement>("button") || active);
    undo = { plan: structuredClone(plan), kind, focus: lastChangePoint };
    showUndo = true;
    plan = next;
    kind = isSuggestedItinerary(plan, templates) ? "Suggested stay" : "Customised stay";
    const url = new URL(location.href);
    if (url.searchParams.has("nights")) { url.searchParams.set("nights", String(plan.nights)); history.replaceState(null, "", url); }
    render(); persist(notice); track("itinerary_saved", { nights: plan.nights }); return true;
  };
  const remove = (slot: Slot, id: string) => {
    const point = focusPoint(document.getElementById(`slot-${slot.day}-${slot.block}`));
    const next = structuredClone(plan);
    next.days[slot.day][slot.block] = [];
    next.unscheduled = [...new Set([...next.unscheduled, id])];
    commit(next, `${name(id)} moved to Saved ideas.`); restoreFocus(point);
  };
  const render = () => {
    const point = focusPoint();
    root.dataset.editing = String(editing);
    root.querySelectorAll<HTMLInputElement>("[data-plan-nights]").forEach(radio => radio.checked = Number(radio.value) === plan.nights);
    arrival.value = plan.arrival;
    $("[data-travel-label]").textContent = plan.arrival ? new Date(`${plan.arrival}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "Optional";
    $("[data-plan-kind]").textContent = kind;
    $("[data-plan-edit]").textContent = editing ? "Done" : "Customise this stay";
    $("[data-plan-edit]").setAttribute("aria-pressed", String(editing));
    $("[data-plan-options]").hidden = isSuggestedItinerary(plan, templates) && !undo;
    $("[data-plan-reset]").hidden = isSuggestedItinerary(plan, templates);
    root.querySelectorAll<HTMLElement>("[data-plan-undo]").forEach(el => el.hidden = !undo);
    $("[data-undo-notice]").hidden = !undo || !showUndo;
    $("[data-sticky-length]").textContent = `${plan.nights} nights · ${plan.nights + 1} days`;
    days.replaceChildren();
    plan.days.forEach((day, index) => {
      const card = element("details", "", "planner-day"); card.open = expanded.has(index);
      const summary = element("summary"); summary.id = `day-summary-${index}`;
      summary.append(element("h3", dayHeading(index, plan.nights)));
      summary.append(element("span", blocks.flatMap(block => day[block]).map(name).join(" · ") || (index === plan.nights ? "Breakfast and onward travel" : "Time to make your own"), "day-preview"));
      card.addEventListener("toggle", () => { if (card.isConnected) { if (card.open) expanded.add(index); else expanded.delete(index); } });
      const body = element("div", "", "planner-day-body");
      for (const block of blocks.filter(value => allowedSlot(index, value, plan.nights) && (value !== "earlyMorning" || day[value].length || editing))) {
        const slot = element("div", "", "planner-slot");
        slot.append(element("p", index === plan.nights ? "Optional after check-out" : slotTimeLabel(plan, index, block), "planner-time"));
        const id = day[block][0];
        if (id) {
          const activity = activities.find(a => a.id === id)!;
          slot.append(element("h4", activity.name, "planner-activity-name"), element("p", activity.description, "planner-activity-description"));
          const detail = element("details", "", "experience-details");
          detail.append(element("summary", `Details · ${activity.duration}`), element("p", `${activity.bookingStatus}. ${activity.note}`));
          const link = element("a", `${activity.actionLabel} ↗`); link.href = withBase(activity.bookingUrl || activity.sourceUrl);
          if (link.href.startsWith("http") && link.origin !== location.origin) { link.target = "_blank"; link.rel = "noreferrer"; }
          detail.append(link);
          if (id === "chhatris") {
            const diningLink = element("a", "Discover Betwa View Dining →"); diningLink.href = withBase("/dining/#betwa-view-dining");
            detail.append(element("br"), diningLink);
          }
          slot.append(detail);
          if (editing) {
            const actions = element("div", "", "slot-actions");
            actions.append(button("Change", () => openPicker({ day: index, block }), `Change ${activity.name}`, `slot-${index}-${block}`));
            const options = element("details", "", "slot-options");
            const menu = element("summary", "More"); menu.setAttribute("aria-label", `More options for ${activity.name}`);
            options.append(menu, button("Move", () => { openPlacement(id, { day: index, block }); options.open = false; }, `Move ${activity.name}`), button("Remove", () => remove({ day: index, block }, id), `Remove ${activity.name}`));
            actions.append(options); slot.append(actions);
          }
        } else {
          slot.append(element("p", index === plan.nights ? "Leave time for your onward journey, or a short visit if travel allows." : "A little space for a leisurely meal, rest or something of your own.", "small-copy"));
          if (editing) slot.append(button("Add an experience", () => openPicker({ day: index, block }), `Add an experience: ${slotLabel({ day: index, block })}`, `slot-${index}-${block}`));
        }
        body.append(slot);
      }
      const notes = element("div", "", "planner-meals");
      notes.append(element("p", "Meals & pauses", "planner-time"));
      mealGuidance(plan, index).forEach(note => notes.append(element("p", note, "small-copy")));
      body.append(notes); card.append(summary, body); days.append(card);
    });
    $("[data-plan-unscheduled]").hidden = !plan.unscheduled.length;
    $("[data-saved-count]").textContent = `(${plan.unscheduled.length})`;
    const list = $("[data-unscheduled-list]"); list.replaceChildren();
    plan.unscheduled.forEach(id => {
      const item = element("div", "", "unscheduled-item");
      item.append(element("span", name(id)), button("Add to a day", () => openPlacement(id), `Add ${name(id)} to a day`, `saved-${id}`));
      list.append(item);
    });
    root.querySelectorAll<HTMLElement>("[data-scheduled]").forEach(el => { el.textContent = scheduledText(el.dataset.scheduled!); el.hidden = !el.textContent; });
    root.querySelectorAll<HTMLButtonElement>("[data-add-activity]").forEach(el => {
      const id = el.dataset.addActivity!;
      el.textContent = scheduled(id).length && !activities.find(a => a.id === id)?.categories.includes("At the hotel") ? "Move in stay" : "Add to stay";
    });
    updateSummary(); restoreFocus(point);
  };

  const pickerMessage = () => {
    const control = $<HTMLButtonElement>("[data-picker-save]");
    const issue = pendingId ? timingIssue(pendingId, pickerSlot) : "";
    const unchanged = plan.days[pickerSlot.day][pickerSlot.block].includes(pendingId);
    control.disabled = !pendingId || Boolean(issue) || unchanged;
    control.textContent = pendingId && scheduled(pendingId).some(slot => slot.day !== pickerSlot.day || slot.block !== pickerSlot.block) && !activities.find(a => a.id === pendingId)?.categories.includes("At the hotel") ? "Move here" : "Confirm change";
    $("[data-picker-message]").textContent = !pendingId ? "Choose an experience to see how it fits." : issue || (unchanged ? "This experience is already in this slot. Choose another, or cancel to keep it." : placementNotes(pendingId, pickerSlot));
  };
  const filterPicker = () => {
    const query = $<HTMLInputElement>("[data-picker-search]").value.toLowerCase().trim();
    const category = $<HTMLSelectElement>("[data-picker-category]").value;
    const matches = activities.filter(activity => (category === "All" || activity.categories.some(value => value === category)) && `${activity.name} ${activity.description} ${activity.categories.join(" ")}`.toLowerCase().includes(query));
    const results = $("[data-picker-results]"); results.replaceChildren();
    $("[data-picker-count]").textContent = `${matches.length} ${matches.length === 1 ? "experience" : "experiences"}`;
    matches.forEach(activity => {
      const label = element("label", "", "picker-option");
      const input = element("input"); input.type = "radio"; input.name = "replacement"; input.value = activity.id; input.checked = pendingId === activity.id;
      const copy = element("span"); copy.append(element("strong", activity.name), element("span", `${activity.duration} · Usually ${blockLabels[activity.block].toLowerCase()}`, "small-copy"));
      const scheduledLabel = scheduledText(activity.id);
      if (scheduledLabel) copy.append(element("span", scheduledLabel, "activity-scheduled"));
      input.addEventListener("change", () => { pendingId = activity.id; pickerMessage(); });
      label.append(input, copy); results.append(label);
    });
    if (!matches.length) {
      results.append(element("p", "No matching experiences. Try another interest or search."), button("Clear filters", () => { $<HTMLInputElement>("[data-picker-search]").value = ""; $<HTMLSelectElement>("[data-picker-category]").value = "All"; filterPicker(); $("[data-picker-search]").focus(); }));
    }
    // A hidden selection must never leave a surprising confirm action enabled.
    if (pendingId && !matches.some(activity => activity.id === pendingId)) pendingId = "";
    pickerMessage();
  };
  const openPicker = (slot: Slot) => {
    pickerSlot = slot; pendingId = ""; returnPoint = focusPoint();
    $("#picker-title").textContent = plan.days[slot.day][slot.block].length ? "Change experience" : "Add an experience";
    $("[data-picker-context]").textContent = `${slotLabel(slot)}${plan.days[slot.day][slot.block].length ? ` · Replacing ${name(plan.days[slot.day][slot.block][0])}` : ""}`;
    $<HTMLInputElement>("[data-picker-search]").value = ""; $<HTMLSelectElement>("[data-picker-category]").value = "All";
    filterPicker(); picker.showModal(); $("[data-picker-results]").scrollTop = 0;
  };
  $("[data-picker-search]").addEventListener("input", filterPicker);
  $("[data-picker-category]").addEventListener("change", filterPicker);
  $("[data-picker-cancel]").addEventListener("click", () => picker.close());
  $("[data-picker-save]").addEventListener("click", () => {
    if (!pendingId || timingIssue(pendingId, pickerSlot)) return;
    commit(placeActivity(plan, pendingId, pickerSlot.day, pickerSlot.block, activities), `${name(pendingId)} set for ${slotLabel(pickerSlot)}.`);
    picker.close();
  });
  picker.addEventListener("close", () => requestAnimationFrame(() => restoreFocus(returnPoint)));

  const placementMessage = () => {
    const target = { day: Number(daySelect.value), block: blockSelect.value as TimeBlock };
    const issue = timingIssue(pendingId, target);
    const same = origin?.day === target.day && origin.block === target.block;
    $("[data-place-conflict]").textContent = issue || (same ? "Choose a different day or time to move this experience." : placementNotes(pendingId, target, origin));
    $<HTMLButtonElement>("[data-place-save]").disabled = Boolean(issue) || same || !allowedSlot(target.day, target.block, plan.nights);
    $("[data-place-save]").textContent = origin || (scheduled(pendingId).length && !activities.find(a => a.id === pendingId)?.categories.includes("At the hotel")) ? "Move experience" : "Add experience";
  };
  const updateBlocks = () => {
    const day = Number(daySelect.value);
    for (const option of blockSelect.options) {
      option.textContent = slotTimeLabel(plan, day, option.value as TimeBlock, pendingId);
      option.disabled = !allowedSlot(day, option.value as TimeBlock, plan.nights) || (pendingId === "pool" && Boolean(plan.arrival) && option.value !== poolBlock(day));
    }
    if (blockSelect.selectedOptions[0]?.disabled) blockSelect.value = [...blockSelect.options].find(option => !option.disabled)?.value || "";
    placementMessage();
  };
  const openPlacement = (id: string, from?: Slot) => {
    pendingId = id; origin = from; returnPoint = focusPoint(from ? document.getElementById(`slot-${from.day}-${from.block}`) : undefined);
    $("#place-title").textContent = `${from ? "Move" : "Schedule"} ${name(id)}`;
    const activity = activities.find(a => a.id === id)!;
    $("[data-place-note]").textContent = `${from ? `Currently ${slotLabel(from)}. ` : ""}${id === "pool" && plan.arrival ? "Pool times follow your travel dates. In February–September, swim in early evening after morning rafting, or early morning on other full days. October–January afternoons suit a swim. Allow time for your evening plans." : `Usually ${blockLabels[activity.block].toLowerCase()}. Choose a day and time below.`}`;
    daySelect.replaceChildren(...plan.days.map((_, index) => { const option = new Option(dayHeading(index, plan.nights), String(index)); option.disabled = id === "pool" && index === plan.nights; return option; }));
    daySelect.value = String(from?.day ?? 1); blockSelect.value = from?.block ?? activity.block;
    updateBlocks(); placeDialog.showModal();
  };
  daySelect.addEventListener("change", updateBlocks); blockSelect.addEventListener("change", placementMessage);
  $<HTMLFormElement>("[data-place-form]").addEventListener("submit", event => {
    if (((event as SubmitEvent).submitter as HTMLButtonElement)?.value !== "save") return;
    const target = { day: Number(daySelect.value), block: blockSelect.value as TimeBlock };
    if (timingIssue(pendingId, target) || !allowedSlot(target.day, target.block, plan.nights)) { event.preventDefault(); return; }
    const next = structuredClone(plan);
    if (origin) next.days[origin.day][origin.block] = next.days[origin.day][origin.block].filter(id => id !== pendingId);
    commit(placeActivity(next, pendingId, target.day, target.block, activities), `${name(pendingId)} set for ${slotLabel(target)}.`);
  });
  placeDialog.addEventListener("close", () => requestAnimationFrame(() => restoreFocus(returnPoint)));

  root.querySelectorAll<HTMLElement>("[data-planner-tools], [data-planner-actions], [data-activity-filters], [data-add-activity]").forEach(el => el.hidden = false);
  $("[data-plan-edit]").addEventListener("click", () => { editing = !editing; render(); status.textContent = editing ? "Customising your stay. Choose Change beside an experience, or More to move or remove it." : "Your stay is ready to read. You can customise it again at any time."; });
  root.querySelectorAll<HTMLInputElement>("[data-plan-nights]").forEach(radio => radio.addEventListener("change", () => {
    commit(alignPoolWithSeason(changeNights(plan, Number(radio.value) as 2 | 3, templates.find(t => t.nights === 3))), `Stay changed to ${radio.value} nights. Any displaced experiences are kept in Saved ideas.`);
  }));
  arrival.addEventListener("change", () => {
    if (!arrival.checkValidity()) { arrival.reportValidity(); return; }
    commit(alignPoolWithSeason({ ...plan, arrival: arrival.value }), "Travel dates updated. Pool suggestions now follow your dates; other outings are preserved.");
  });
  $("[data-plan-reset]").addEventListener("click", () => {
    $<HTMLDetailsElement>("[data-plan-options]").open = false;
    commit(suggestedItinerary(templates, plan.nights, plan.arrival), "Suggested stay restored. Undo brings back your previous itinerary and saved ideas.");
    $("[data-plan-edit]").focus({ preventScroll: true });
  });
  root.querySelectorAll<HTMLElement>("[data-plan-undo]").forEach(control => control.addEventListener("click", () => {
    if (!undo) return;
    const previousPoint = undo.focus;
    plan = undo.plan; kind = undo.kind; undo = null;
    $<HTMLDetailsElement>("[data-plan-options]").open = false;
    const url = new URL(location.href); if (url.searchParams.has("nights")) { url.searchParams.set("nights", String(plan.nights)); history.replaceState(null, "", url); }
    const point = focusPoint();
    render(); persist("Last change undone.");
    restoreFocus({ ...(previousPoint || point), y: point.y });
  }));
  $("[data-undo-dismiss]").addEventListener("click", () => {
    const point = focusPoint(); showUndo = false; $("[data-undo-notice]").hidden = true;
    restoreFocus({ ...(lastChangePoint || point), y: point.y });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-add-activity]").forEach(el => el.addEventListener("click", () => openPlacement(el.dataset.addActivity!)));
  const filter = () => {
    const category = $<HTMLSelectElement>("[data-activity-category]").value;
    const query = $<HTMLInputElement>("[data-activity-search]").value.toLowerCase().trim(); let count = 0;
    root.querySelectorAll<HTMLElement>("[data-activity-id]").forEach(card => {
      const activity = activities.find(a => a.id === card.dataset.activityId)!;
      card.hidden = (category !== "All" && !activity.categories.some(value => value === category)) || !`${activity.name} ${activity.description} ${activity.categories.join(" ")}`.toLowerCase().includes(query);
      if (!card.hidden) count++;
    });
    $("[data-activity-count]").textContent = count ? `${count} experiences to explore.` : "No matching experiences. Try another interest or search.";
    $("[data-filter-clear]").hidden = category === "All" && !query;
  };
  $("[data-activity-category]").addEventListener("change", filter); $("[data-activity-search]").addEventListener("input", filter);
  $("[data-filter-clear]").addEventListener("click", () => { $<HTMLInputElement>("[data-activity-search]").value = ""; $<HTMLSelectElement>("[data-activity-category]").value = "All"; filter(); $("[data-activity-search]").focus(); });
  $("[data-plan-copy]").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(itinerarySummary(plan, activities)); status.textContent = "Itinerary copied."; }
    catch { $("[data-copy-fallback]").hidden = false; $<HTMLTextAreaElement>("[data-copy-text]").focus(); $<HTMLTextAreaElement>("[data-copy-text]").select(); status.textContent = "Select and copy your itinerary below."; }
  });
  $("[data-plan-pdf]").addEventListener("click", async () => {
    const control = $<HTMLButtonElement>("[data-plan-pdf]"); control.disabled = true;
    try { const { printItinerary } = await import("@/lib/itinerary-print"); printItinerary(plan, activities); status.textContent = "Choose Save as PDF in the print dialog to keep your itinerary."; }
    catch { status.textContent = "The PDF view could not open. Copy your itinerary to keep a copy."; }
    finally { control.disabled = false; }
  });

  const openBooking = () => {
    bookingHandoff = true;
    arrivalDialog.close(); dateDialog.close();
    $("[data-plan-booking-proxy]").click(); track("planner_to_booking", { nights: plan.nights });
  };
  const checkRooms = () => {
    proposedDates = { checkIn: plan.arrival, checkOut: addNights(plan.arrival, plan.nights) };
    const current = readBooking();
    const valid = validateBookingSearch({ ...current, ...proposedDates, adults: 2, children: 0 });
    if (!valid.valid) {
      bookingArrival.value = plan.arrival;
      $("[data-arrival-summary]").textContent = `We’ll check ${plan.nights} nights / ${plan.nights + 1} days, with check-out ${plan.nights} days after arrival.`;
      $("[data-arrival-error]").textContent = plan.arrival ? valid.message : "";
      arrivalDialog.showModal(); return;
    }
    if (validateBookingSearch(current).valid && (current.checkIn !== proposedDates.checkIn || current.checkOut !== proposedDates.checkOut)) {
      $("[data-date-summary]").textContent = `Your itinerary: ${proposedDates.checkIn} → ${proposedDates.checkOut} (${plan.nights} nights). Your room search: ${current.checkIn} → ${current.checkOut}.`;
      arrivalDialog.close(); dateDialog.showModal(); return;
    }
    saveBooking({ ...current, ...proposedDates }); openBooking();
  };
  root.querySelectorAll<HTMLElement>("[data-plan-book]").forEach(el => el.addEventListener("click", () => { bookingPoint = focusPoint(el); bookingHandoff = false; checkRooms(); }));
  $<HTMLFormElement>("[data-arrival-form]").addEventListener("submit", event => {
    event.preventDefault();
    if (!bookingArrival.reportValidity()) return;
    commit(alignPoolWithSeason({ ...plan, arrival: bookingArrival.value }), "Travel dates added. Pool suggestions updated for the season.");
    checkRooms();
  });
  $("[data-arrival-cancel]").addEventListener("click", () => arrivalDialog.close());
  $("[data-dates-use]").addEventListener("click", () => { saveBooking({ ...readBooking(), ...proposedDates }); openBooking(); });
  $("[data-dates-keep]").addEventListener("click", () => { saveBooking(readBooking()); openBooking(); });
  $("[data-dates-close]").addEventListener("click", () => dateDialog.close());
  [arrivalDialog, dateDialog].forEach(dialog => dialog.addEventListener("close", () => requestAnimationFrame(() => {
    if (!bookingHandoff && !dateDialog.open && !arrivalDialog.open) restoreFocus(bookingPoint);
  })));
  document.querySelector("[data-booking-sheet]")?.addEventListener("close", () => { if (bookingHandoff) { bookingHandoff = false; requestAnimationFrame(() => restoreFocus(bookingPoint)); } });
  if (initial.previous) { kind = "Customised stay"; persist(`Opened your ${plan.nights}-night stay. Your previous choices are preserved, with displaced experiences in Saved ideas. Undo restores your previous stay.`); }
  else if (stored) status.textContent = "Your saved itinerary has been restored on this device.";
  render();
});
