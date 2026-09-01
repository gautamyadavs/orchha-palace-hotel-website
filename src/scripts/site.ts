import { createBookingUrl } from "@/lib/booking";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const $ = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const $$ = <T extends Element>(selector: string, root: ParentNode = document) => [...root.querySelectorAll<T>(selector)];

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
    if (next) close.focus();
    else open.focus();
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

function analyticsAllowed() {
  return localStorage.getItem("orchha_analytics_consent") === "accepted";
}

function track(event: string, details: Record<string, string | number | boolean> = {}) {
  if (!analyticsAllowed()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...details });
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
  if (!banner) return;
  const decision = localStorage.getItem("orchha_analytics_consent");
  if (!decision) banner.hidden = false;
  if (decision === "accepted") loadGtm();

  $("[data-consent-accept]", banner)?.addEventListener("click", () => {
    localStorage.setItem("orchha_analytics_consent", "accepted");
    banner.hidden = true;
    loadGtm();
    track("analytics_consent_granted");
  });
  $("[data-consent-decline]", banner)?.addEventListener("click", () => {
    localStorage.setItem("orchha_analytics_consent", "declined");
    banner.hidden = true;
  });
}

function setupTrackedActions() {
  $$<HTMLElement>("[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      const event = element.dataset.track;
      if (!event) return;
      const details: Record<string, string> = {};
      if (element.dataset.room) details.room = element.dataset.room;
      track(event, details);
    });
  });
}

function setupBooking() {
  const form = $<HTMLFormElement>("[data-booking-form]");
  if (!form) return;
  const message = $<HTMLElement>("[data-booking-message]", form);
  const checkIn = $<HTMLInputElement>('input[name="checkIn"]', form);
  const checkOut = $<HTMLInputElement>('input[name="checkOut"]', form);

  checkIn?.addEventListener("change", () => {
    if (!checkIn.value || !checkOut) return;
    const minimum = new Date(`${checkIn.value}T12:00:00`);
    minimum.setDate(minimum.getDate() + 1);
    checkOut.min = minimum.toISOString().slice(0, 10);
    if (!checkOut.value || checkOut.value <= checkIn.value) checkOut.value = checkOut.min;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    try {
      const url = createBookingUrl(
        {
          checkIn: String(data.get("checkIn") || ""),
          checkOut: String(data.get("checkOut") || ""),
          adults: Number(data.get("adults") || 2),
          children: Number(data.get("children") || 0),
          rooms: Number(data.get("rooms") || 1)
        },
        { baseUrl: form.dataset.bookingUrl || `${document.body.dataset.basePath || ""}/rooms/`, supportsSearch: form.dataset.supportsSearch === "true" }
      );
      if (message) message.textContent = "Opening the hotel's secure booking engine…";
      track("availability_started", { adults: Number(data.get("adults") || 2) });
      track("booking_engine_handoff");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      if (message) message.textContent = error instanceof Error ? error.message : "Review the dates and try again.";
    }
  });
}

function setupLeadForm() {
  const form = $<HTMLFormElement>("[data-event-lead-form]");
  if (!form) return;
  const message = $<HTMLElement>("[data-lead-message]", form);
  const fallback = $<HTMLElement>("[data-lead-fallback]", form);
  const submit = $<HTMLButtonElement>('button[type="submit"]', form);
  let started = false;

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
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      eventType: String(data.get("eventType") || ""),
      tentativeDate: String(data.get("tentativeDate") || ""),
      guestCount: Number(data.get("guestCount") || 0),
      preferredVenue: String(data.get("preferredVenue") || ""),
      message: String(data.get("message") || ""),
      consent: data.get("consent") === "on",
      turnstileToken: String(data.get("cf-turnstile-response") || ""),
      website: String(data.get("website") || "")
    };

    if (submit) submit.disabled = true;
    if (message) message.textContent = "Sending your enquiry securely…";

    try {
      const response = await fetch(`${document.body.dataset.basePath || ""}/api/event-leads`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({})) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "The enquiry could not be sent.");

      form.reset();
      if (message) {
        message.textContent = "Thank you. The events team has received your enquiry and will be in touch.";
        message.classList.add("is-success");
      }
      track("event_form_completed");
    } catch (error) {
      if (message) message.textContent = error instanceof Error ? error.message : "The enquiry could not be sent.";
      fallback?.removeAttribute("hidden");
      track("event_form_failed");
    } finally {
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
    let pointerStart: number | null = null;

    const render = (requested: number, revealThumbnail = true) => {
      current = (requested + thumbnails.length) % thumbnails.length;
      const selected = thumbnails[current];
      const src = selected.dataset.src || "";
      const alt = selected.dataset.alt || "Room photograph";
      const label = selected.dataset.caption || alt;
      const position = selected.dataset.position || "50% 50%";

      main.src = src;
      main.alt = alt;
      main.style.objectPosition = position;
      open.setAttribute("aria-label", `Open ${label} full screen`);
      if (count) count.textContent = `${current + 1} / ${thumbnails.length}`;
      if (caption) caption.textContent = label;

      thumbnails.forEach((thumbnail, index) => {
        thumbnail.setAttribute("aria-pressed", String(index === current));
        thumbnail.classList.toggle("is-active", index === current);
      });
      if (revealThumbnail) selected.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });

      if (dialogImage) {
        dialogImage.src = src;
        dialogImage.alt = alt;
        dialogImage.style.objectPosition = position;
      }
      if (dialogCaption) dialogCaption.textContent = label;
      if (dialogCount) dialogCount.textContent = `${current + 1} / ${thumbnails.length}`;
    };

    thumbnails.forEach((thumbnail, index) => thumbnail.addEventListener("click", () => render(index)));
    previous.addEventListener("click", () => render(current - 1));
    next.addEventListener("click", () => render(current + 1));
    dialogPrevious?.addEventListener("click", () => render(current - 1));
    dialogNext?.addEventListener("click", () => render(current + 1));

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        render(current - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        render(current + 1);
      }
    };
    stage.addEventListener("keydown", handleKey);
    dialog?.addEventListener("keydown", handleKey);

    const swipeStart = (event: PointerEvent) => {
      pointerStart = event.clientX;
    };
    const swipeEnd = (event: PointerEvent) => {
      if (pointerStart === null) return;
      const distance = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(distance) < 45) return;
      render(current + (distance < 0 ? 1 : -1));
    };
    stage.addEventListener("pointerdown", swipeStart);
    stage.addEventListener("pointerup", swipeEnd);
    dialogImage?.addEventListener("pointerdown", swipeStart);
    dialogImage?.addEventListener("pointerup", swipeEnd);

    open.addEventListener("click", () => {
      render(current, false);
      dialog?.showModal();
    });
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog?.addEventListener("close", () => open.focus());

    render(0, false);
  });
}

setupMenu();
setupConsent();
setupTrackedActions();
setupBooking();
setupLeadForm();
setupRoomGalleries();
