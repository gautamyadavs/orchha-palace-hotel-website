import type { Room } from "@/lib/types";
import { track } from "@/lib/analytics";
document.querySelectorAll<HTMLElement>("[data-room-chooser]").forEach((root) => {
  const rooms: Room[] = JSON.parse(root.querySelector("[data-room-data]")?.textContent || "[]");
  const bed = root.querySelector<HTMLSelectElement>("[data-bed-filter]")!;
  const bath = root.querySelector<HTMLInputElement>("[data-bath-filter]")!;
  const count = root.querySelector<HTMLElement>("[data-room-count]")!;
  const cards = [...root.querySelectorAll<HTMLElement>("[data-room-option]")];
  const checks = [...root.querySelectorAll<HTMLInputElement>("[data-compare]")];
  const panel = root.querySelector<HTMLElement>("[data-comparison]")!;
  root.querySelector<HTMLElement>("[data-room-filters]")!.hidden = false;
  root.querySelectorAll<HTMLElement>(".compare-select").forEach(label => label.hidden = false);
  const filter = () => {
    cards.forEach(card => card.hidden = Boolean((bed.value && card.dataset.bed !== bed.value) || (bath.checked && card.dataset.bath !== "true")));
    const total = cards.filter(card => !card.hidden).length;
    count.textContent = `${total} room choices. ${checks.filter(c => c.checked).length} of 2 selected to compare.`;
    root.querySelector<HTMLElement>("[data-room-empty]")!.hidden = total !== 0;
  };
  bed.addEventListener("change", filter); bath.addEventListener("change", filter);
  root.querySelector("[data-clear-filters]")!.addEventListener("click", () => { bed.value = ""; bath.checked = false; filter(); });
  const compare = () => {
    const selected = checks.filter(c => c.checked);
    checks.forEach(c => c.disabled = selected.length === 2 && !c.checked);
    panel.hidden = selected.length !== 2;
    const content = panel.querySelector("[data-comparison-content]")!;
    content.replaceChildren();
    if (selected.length === 2) {
      const pair = selected.map(c => rooms.find(room => room.slug === c.value)!);
      for (const [label, key] of [["Space", "size"], ["Beds", "bed"], ["Bathroom", "bathroom"], ["Aspect", "view"], ["Included", "inclusions"], ["Reservation", "bookingMode"]] as const) {
        const row = document.createElement("div"); row.className = "comparison-row";
        const heading = document.createElement("h3"); heading.textContent = label; row.append(heading);
        pair.forEach(room => {
          const item = document.createElement("p"); const name = document.createElement("strong"); name.textContent = room.name;
          const value = key === "bookingMode" ? (room.bookingMode === "assisted" ? "Call or WhatsApp" : "Check live rates") : Array.isArray(room[key]) ? room[key].join(" · ") : room[key];
          item.append(name, document.createTextNode(String(value || "Confirm with the hotel"))); row.append(item);
        });
        content.append(row);
      }
      track("room_comparison", { rooms: pair.map(r => r.slug).join(",") });
    }
    filter();
  };
  checks.forEach(c => c.addEventListener("change", compare));
  root.querySelector("[data-clear-comparison]")!.addEventListener("click", () => { checks.forEach(c => c.checked = false); compare(); checks[0]?.focus(); });
});
