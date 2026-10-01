import { createBookingUrl, validateBookingSearch } from "@/lib/booking";
import { readBooking, saveBooking, addNights, nightCount } from "@/lib/booking-state";
import { track } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    turnstile?: { reset: () => void };
  }
}

const $ = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const $$ = <T extends Element>(selector: string, root: ParentNode = document) => [...root.querySelectorAll<T>(selector)];

function setupHeader() {
  const header = $<HTMLElement>("[data-header]");
  if (!header) return;

  let scheduled = false;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 32);
    scheduled = false;
  };

  update();
  window.addEventListener("scroll", () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }, { passive: true });
}

function setupStickyBooking() {
  const sticky = $<HTMLElement>("[data-mobile-sticky]");
  if (!sticky || !("IntersectionObserver" in window)) return;

  const visibility = new Map<Element, boolean>();
  const update = () => {
    const hidden = [...visibility.values()].some(Boolean) || Boolean(document.querySelector("dialog[open]")) || /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName || "");
    sticky.classList.toggle("is-hidden", hidden);
    sticky.inert = hidden;
  };
  document.addEventListener("focusin", update);
  document.addEventListener("focusout", () => requestAnimationFrame(update));
  new MutationObserver(update).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting));
    update();
  }, { threshold: 0.2 });

  const targetSelector = sticky.dataset.stickyTarget || "#availability";
  const bookingAction = $<HTMLElement>(targetSelector);
  const footer = $<HTMLElement>(".site-footer");
  const inPageActions = $$<HTMLElement>("[data-booking-open], [data-sticky-suppress]").filter((target) => (
    !target.closest("[data-mobile-sticky], .site-header, .menu-drawer, .booking-sheet")
  ));

  [bookingAction, footer, ...inPageActions].forEach((target) => {
    if (!target) return;
    visibility.set(target, false);
    observer.observe(target);
  });
}

function setupMenu() {
  const menu = $<HTMLElement>("[data-menu]");
  const open = $<HTMLButtonElement>("[data-menu-open]");
  const close = $<HTMLButtonElement>("[data-menu-close]");
  if (!menu || !open || !close) return;

  const setOpen = (next: boolean) => {
    menu.classList.toggle("is-open", next);
    menu.setAttribute("aria-hidden", String(!next));
    open.setAttribute("aria-expanded", String(next));
    document.body.classList.toggle("menu-open", next);
    if (next) {
      menu.scrollTop = 0;
      close.focus({ preventScroll: true });
    } else open.focus({ preventScroll: true });
  };

  open.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  menu.addEventListener("click", (event) => {
    if ((event.target as Element).closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (!menu.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = $$<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', menu)
      .filter((element) => !element.hasAttribute("hidden"));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function loadGtm() {
  const id = document.body.dataset.gtmId;
  if (!id || document.querySelector(`script[data-gtm="${id}"]`)) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.dataset.gtm = id;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.append(script);
}

function setupConsent() {
  const banner = $<HTMLElement>("[data-consent-banner]");
  if (!banner || !document.body.dataset.gtmId) return;
  let decision: string | null = null;
  try { decision = localStorage.getItem("orchha_analytics_consent"); } catch {}
  if (!decision) banner.hidden = false;
  if (decision === "accepted") loadGtm();

  $("[data-consent-accept]", banner)?.addEventListener("click", () => {
    try { localStorage.setItem("orchha_analytics_consent", "accepted"); } catch {}
    banner.hidden = true;
    loadGtm();
    track("analytics_consent_granted");
  });
  $("[data-consent-decline]", banner)?.addEventListener("click", () => {
    try { localStorage.setItem("orchha_analytics_consent", "declined"); } catch {}
    banner.hidden = true;
    // Reload removes any analytics scripts already running after consent withdrawal.
    if (document.querySelector("script[data-gtm]")) location.reload();
  });
  $$("[data-consent-settings]").forEach((button) => button.addEventListener("click", () => {
    banner.hidden = false;
    banner.scrollIntoView({ block: "center" });
    $<HTMLButtonElement>("[data-consent-decline]", banner)?.focus();
  }));
}

function setupTrackedActions() {
  $$<HTMLElement>("[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      const event = element.dataset.track;
      if (!event) return;
      const details: Record<string, string> = {};
      if (element.dataset.room) details.room = element.dataset.room;
      if (element.dataset.source) details.source = element.dataset.source;
      track(event, details);
    });
  });
}

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function setupBookingSheet() {
  const sheet = $<HTMLDialogElement>("[data-booking-sheet]");
  const form = sheet ? $<HTMLFormElement>("[data-booking-form]", sheet) : null;
  if (!sheet || !form) return;

  let returnFocus: HTMLElement | null = null;
  const preference = $<HTMLElement>("[data-booking-room-preference]", form);
  const preferenceName = $<HTMLElement>("[data-booking-room-name]", form);
  const clearRoom = $<HTMLButtonElement>("[data-booking-room-clear]", form);

  const setRoomIntent = (slug = "", name = "", code = "") => {
    form.dataset.bookingRoom = slug;
    form.dataset.bookingRoomName = name;
    form.dataset.bookingRoomCode = code;
    if (preferenceName) preferenceName.textContent = name;
    if (preference) preference.hidden = !name;
    if (clearRoom) clearRoom.hidden = !name;
  };

  $$<HTMLElement>("[data-booking-open]").forEach((opener) => {
    opener.addEventListener("click", (event) => {
      event.preventDefault();
      returnFocus = opener;
      const room = opener.dataset.bookingRoom || "";
      const source = opener.dataset.bookingSource || "booking_cta";
      setRoomIntent(room, opener.dataset.bookingRoomName || "", opener.dataset.bookingRoomCode || "");
      form.dataset.bookingSource = source;
      track("booking_sheet_opened", room ? { source, room } : { source });
      if (room) track("room_booking_started", { source, room });
      sheet.showModal();
      document.body.classList.add("booking-open");
      requestAnimationFrame(() => $<HTMLInputElement>('input[name="checkIn"]', form)?.focus());
    });
  });

  clearRoom?.addEventListener("click", () => setRoomIntent());
  $<HTMLButtonElement>("[data-booking-close]", sheet)?.addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (event) => {
    if (event.target === sheet) sheet.close();
  });
  sheet.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      sheet.close();
    }
  });
  sheet.addEventListener("close", () => {
    document.body.classList.remove("booking-open");
    returnFocus?.focus();
  });
}

function setupBookingForms() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const forms = $$<HTMLFormElement>("[data-booking-form]");
  forms.forEach((form, index) => {
    const message = $<HTMLElement>("[data-booking-message]", form);
    const checkIn = $<HTMLInputElement>('input[name="checkIn"]', form);
    const checkOut = $<HTMLInputElement>('input[name="checkOut"]', form);
    if (!checkIn || !checkOut) return;

    checkIn.min = formatLocalDate(today);
    if (message) message.id = `booking-error-${index}`;
    const fields = $$<HTMLInputElement | HTMLSelectElement>("input, select", form);
    const sync = () => {
      const state = readBooking();
      fields.forEach((field) => { if (field.name in state) field.value = String(state[field.name as keyof typeof state] ?? ""); });
      checkOut.min = checkIn.value ? addNights(checkIn.value, 1) : formatLocalDate(today);
      const nights = nightCount(state.checkIn, state.checkOut);
      const summary = $<HTMLElement>("[data-booking-summary]", form);
      if (summary) summary.textContent = nights > 0 ? `${state.checkIn} → ${state.checkOut} · ${nights} ${nights === 1 ? "night" : "nights"} · ${state.adults} adults · ${state.children} children` : "Choose your dates to see the length of your stay.";
    };
    sync();
    document.addEventListener("booking-state-changed", sync);
    form.addEventListener("change", () => {
      const data = new FormData(form);
      fields.forEach((field) => { field.removeAttribute("aria-invalid"); field.removeAttribute("aria-describedby"); });
      if (message) message.textContent = "";
      saveBooking({ checkIn: String(data.get("checkIn") || ""), checkOut: String(data.get("checkOut") || ""), adults: Number(data.get("adults")), children: Number(data.get("children")), promoCode: String(data.get("promoCode") || "") });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const source = form.dataset.bookingSource || "availability_bar";
      const room = form.dataset.bookingRoom || "";
      const details: Record<string, string | number> = {
        source,
        adults: Number(data.get("adults") || 2),
        children: Number(data.get("children") || 0)
      };
      if (room) details.room = room;

      try {
        if (!form.dataset.bookingUrl) throw new Error("Live booking is temporarily unavailable. Please call or WhatsApp reservations.");
        const search = {
            checkIn: String(data.get("checkIn") || ""),
            checkOut: String(data.get("checkOut") || ""),
            adults: Number(data.get("adults") || 2),
            children: Number(data.get("children") || 0),
            promoCode: String(data.get("promoCode") || ""),
            roomCode: form.dataset.bookingRoomCode || ""
          };
        const validation = validateBookingSearch(search);
        if (!validation.valid) {
          const field = form.elements.namedItem(validation.field) as HTMLInputElement;
          field?.setAttribute("aria-invalid", "true");
          if (message) field?.setAttribute("aria-describedby", message.id);
          field?.focus();
          throw new Error(validation.message);
        }
        saveBooking(search);
        details.nights = nightCount(search.checkIn, search.checkOut);
        const url = createBookingUrl(search, { baseUrl: form.dataset.bookingUrl });
        if (message) message.textContent = "Taking you to secure live rates…";
        track("availability_submitted", details);
        track("booking_engine_handoff", details);
        window.location.assign(url.href);
      } catch (error) {
        if (message) message.textContent = error instanceof Error ? error.message : "Review the dates and try again.";
        track("booking_handoff_failed", details);
      }
    });
  });
}

function setupLeadForm() {
  const form = $<HTMLFormElement>("[data-event-lead-form]");
  if (!form) return;
  const message = $<HTMLElement>("[data-lead-message]", form);
  const fallback = $<HTMLElement>("[data-lead-fallback]", form);
  const submit = $<HTMLButtonElement>('button[type="submit"]', form);
  const endpoint = form.dataset.leadEndpoint || "";
  const enabled = form.dataset.leadEnabled === "true";
  if (!enabled || !endpoint) return;
  const step1 = $<HTMLElement>("[data-lead-step='1']", form)!;
  const step2 = $<HTMLElement>("[data-lead-step='2']", form)!;
  const submitWrap = $<HTMLElement>(".lead-form__submit", form)!;
  const next = $<HTMLButtonElement>("[data-lead-next]", form)!;
  const back = $<HTMLButtonElement>("[data-lead-back]", form)!;
  const review = $<HTMLElement>("[data-lead-review]", form)!;
  const step = (value: number) => {
    step1.hidden = value !== 1; step2.hidden = value !== 2; submitWrap.hidden = value !== 2;
    if (value === 2) {
      const data = new FormData(form);
      review.textContent = [["Event", "eventType"], ["Date", "tentativeDate"], ["Guests", "guestCount"], ["Venue", "preferredVenue"], ["Layout", "seatingLayout"], ["Guest rooms", "guestRooms"], ["Organisation", "organisation"], ["Functions", "functions"], ["AV needs", "avNeeds"], ["Notes", "message"]].map(([label, key]) => `${label}: ${data.get(key) || "Not specified"}`).join("\n");
      review.hidden = false;
    }
  };
  const requirementsValid = () => {
    const invalid = $$<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea", step1).find(field => !field.checkValidity());
    if (invalid) { step(1); invalid.reportValidity(); invalid.focus(); return false; }
    return true;
  };
  step(1); back.hidden = false;
  $<HTMLElement>("[data-lead-next-wrap]", form)!.hidden = false;
  next.addEventListener("click", () => { if (requirementsValid()) { step(2); $<HTMLInputElement>("input[name='name']", form)?.focus(); } });
  back.addEventListener("click", () => { step(1); next.focus(); });
  form.addEventListener("event-requirements-selected", () => step(1));
  let started = false;
  let submissionId = crypto.randomUUID();
  const tentativeDate = $<HTMLInputElement>('input[name="tentativeDate"]', form);
  if (tentativeDate) tentativeDate.min = formatLocalDate(new Date());

  form.addEventListener("focusin", () => {
    if (!started) {
      started = true;
      track("event_form_started");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    fallback?.setAttribute("hidden", "");
    message?.classList.remove("is-success");
    if (!requirementsValid()) return;
    if (step2.hidden) { step(2); $<HTMLInputElement>("input[name='name']", form)?.focus(); return; }
    if (!form.reportValidity()) return;
    if (form.getAttribute("aria-busy") === "true") return;

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      eventType: String(data.get("eventType") || ""),
      journey: String(data.get("journey") || ""),
      organisation: String(data.get("organisation") || ""),
      functions: String(data.get("functions") || ""),
      seatingLayout: String(data.get("seatingLayout") || ""),
      avNeeds: String(data.get("avNeeds") || ""),
      guestRooms: data.get("guestRooms") === "" || data.get("guestRooms") === null ? undefined : Number(data.get("guestRooms")),
      tentativeDate: String(data.get("tentativeDate") || ""),
      guestCount: Number(data.get("guestCount") || 0),
      preferredVenue: String(data.get("preferredVenue") || ""),
      message: String(data.get("message") || ""),
      consent: data.get("consent") === "on",
      turnstileToken: String(data.get("cf-turnstile-response") || ""),
      website: String(data.get("website") || ""),
      submissionId
    };

    if (submit) submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    if (message) message.textContent = "Sending your enquiry securely…";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({})) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "The enquiry could not be sent.");

      form.reset();
      review.textContent = "";
      review.hidden = true;
      step1.hidden = true;
      step2.hidden = true;
      next.hidden = true;
      if (submit) submit.hidden = true;
      submissionId = crypto.randomUUID();
      if (message) {
        message.textContent = "Thank you. The sales team has received your enquiry and will be in touch.";
        message.classList.add("is-success");
      }
      track("event_form_completed", { journey: payload.journey || "legacy" });
    } catch (error) {
      if (message) message.textContent = error instanceof Error ? error.message : "The enquiry could not be sent.";
      fallback?.removeAttribute("hidden");
      track("event_form_failed");
    } finally {
      window.turnstile?.reset();
      form.removeAttribute("aria-busy");
      if (submit) submit.disabled = false;
    }
  });
}

function setupRoomGalleries() {
  $$<HTMLElement>("[data-room-gallery]").forEach((gallery) => {
    const thumbnails = $$<HTMLButtonElement>("[data-gallery-thumbnail]", gallery);
    const main = $<HTMLImageElement>("[data-gallery-main]", gallery);
    const open = $<HTMLButtonElement>("[data-gallery-open]", gallery);
    const previous = $<HTMLButtonElement>("[data-gallery-previous]", gallery);
    const next = $<HTMLButtonElement>("[data-gallery-next]", gallery);
    const count = $<HTMLElement>("[data-gallery-count]", gallery);
    const caption = $<HTMLElement>("[data-gallery-caption]", gallery);
    const stage = $<HTMLElement>(".room-gallery__stage", gallery);
    const dialog = $<HTMLDialogElement>("[data-gallery-dialog]", gallery);
    const dialogImage = $<HTMLImageElement>("[data-gallery-dialog-image]", gallery);
    const dialogCaption = $<HTMLElement>("[data-gallery-dialog-caption]", gallery);
    const dialogCount = $<HTMLElement>("[data-gallery-dialog-count]", gallery);
    const dialogPrevious = $<HTMLButtonElement>("[data-gallery-dialog-previous]", gallery);
    const dialogNext = $<HTMLButtonElement>("[data-gallery-dialog-next]", gallery);
    if (!thumbnails.length || !main || !open || !previous || !next || !stage) return;

    let current = 0;
    let requestedIndex = 0;
    let requestId = 0;
    let pointerStart: { x: number; y: number } | null = null;
    let swiped = false;
    const strip = $<HTMLElement>(".room-gallery__thumbnails", gallery);
    const announcement = $<HTMLElement>("[data-gallery-status]", gallery);

    const render = async (requested: number, revealThumbnail = true) => {
      const index = (requested + thumbnails.length) % thumbnails.length;
      requestedIndex = index;
      const token = ++requestId;
      const selected = thumbnails[index];
      const src = selected.dataset.src || "";
      const alt = selected.dataset.alt || "Room photograph";
      const label = selected.dataset.caption || alt;
      const position = selected.dataset.position || "50% 50%";
      gallery.setAttribute("aria-busy", "true");
      try {
        // Decode before committing: photo, caption and selection change together.
        const loaded = new Image();
        loaded.src = src;
        await loaded.decode();
        if (token !== requestId) return;
        current = index;
        main.src = src;
        main.alt = alt;
        main.style.objectPosition = position;
        open.setAttribute("aria-label", `Open ${label} full screen`);
        if (count) count.textContent = `${current + 1} / ${thumbnails.length}`;
        if (caption) caption.textContent = label;
        thumbnails.forEach((thumbnail, itemIndex) => {
          thumbnail.setAttribute("aria-pressed", String(itemIndex === current));
          thumbnail.classList.toggle("is-active", itemIndex === current);
        });
        if (revealThumbnail && strip) {
          const left = selected.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft - (strip.clientWidth - selected.clientWidth) / 2;
          strip.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
        }
        if (dialogImage) {
          dialogImage.src = src;
          dialogImage.alt = alt;
          dialogImage.style.objectPosition = position;
        }
        if (dialogCaption) dialogCaption.textContent = label;
        if (dialogCount) dialogCount.textContent = `${current + 1} / ${thumbnails.length}`;
        if (announcement) announcement.textContent = revealThumbnail ? `${label}. Photo ${current + 1} of ${thumbnails.length}.` : "";
      } catch {
        if (token !== requestId) return;
        requestedIndex = current;
        if (announcement) announcement.textContent = "That photograph could not load. Please choose it again to retry.";
      } finally {
        if (token === requestId) gallery.removeAttribute("aria-busy");
      }
    };

    thumbnails.forEach((thumbnail, index) => thumbnail.addEventListener("click", () => render(index)));
    previous.addEventListener("click", () => render(requestedIndex - 1));
    next.addEventListener("click", () => render(requestedIndex + 1));
    dialogPrevious?.addEventListener("click", () => render(requestedIndex - 1));
    dialogNext?.addEventListener("click", () => render(requestedIndex + 1));

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        render(requestedIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        render(requestedIndex + 1);
      }
    };
    stage.addEventListener("keydown", handleKey);
    dialog?.addEventListener("keydown", handleKey);

    const swipeStart = (event: PointerEvent) => {
      pointerStart = { x: event.clientX, y: event.clientY };
      swiped = false;
    };
    const swipeEnd = (event: PointerEvent) => {
      if (pointerStart === null) return;
      const distance = event.clientX - pointerStart.x;
      const vertical = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(distance) < 45 || Math.abs(distance) <= Math.abs(vertical)) return;
      swiped = true;
      setTimeout(() => { swiped = false; }, 0);
      render(requestedIndex + (distance < 0 ? 1 : -1));
    };
    stage.addEventListener("pointerdown", swipeStart);
    stage.addEventListener("pointerup", swipeEnd);
    stage.addEventListener("pointercancel", () => { pointerStart = null; });
    dialogImage?.addEventListener("pointerdown", swipeStart);
    dialogImage?.addEventListener("pointerup", swipeEnd);
    dialogImage?.addEventListener("pointercancel", () => { pointerStart = null; });

    open.addEventListener("click", (event) => {
      if (swiped) { event.preventDefault(); swiped = false; return; }
      dialog?.showModal();
    });
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog?.addEventListener("close", () => open.focus({ preventScroll: true }));

    render(0, false);
  });
}

setupHeader();
setupMenu();
setupConsent();
setupTrackedActions();
setupBookingSheet();
setupBookingForms();
setupLeadForm();
setupRoomGalleries();
setupStickyBooking();
