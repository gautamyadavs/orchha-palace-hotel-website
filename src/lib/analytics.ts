export function track(event: string, details: Record<string, string | number | boolean> = {}) {
  try {
    if (!document.body.dataset.gtmId || localStorage.getItem("orchha_analytics_consent") !== "accepted") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...details });
  } catch { /* Analytics must never interrupt guest actions. */ }
}
