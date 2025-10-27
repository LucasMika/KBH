/* ================================
   Savory Creations - Core JS
   ================================ */

/* --- Header nav (kept minimal) --- */
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
navToggle?.addEventListener("click", () => mainNav?.classList.toggle("open"));

/* --- Smooth scroll for same-page links --- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id && id.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(id);
      el?.scrollIntoView({ behavior: "smooth" });
      mainNav?.classList.remove("open");
    }
  });
});

/* ================================
   SERVICE AREA CHECKER (No API)
   ================================ */
(function () {
  console.log("[ServiceCheck] script loaded");

  // Hubs + radii (km)
  const SERVICE_HUBS = [
    { name: "Greater Grand Rapids",    lat: 42.9634, lng: -85.6681, radiusKm: 35 },
    { name: "Holland (Lakeshore)",     lat: 42.7875, lng: -86.1089, radiusKm: 32 },
    { name: "Grand Haven (Lakeshore)", lat: 43.0631, lng: -86.2284, radiusKm: 28 },
    { name: "Muskegon (Lakeshore)",    lat: 43.2342, lng: -86.2484, radiusKm: 28 }
  ];

  // Haversine distance (km)
  function haversineKm(lat1, lng1, lat2, lng2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function isInServiceArea(lat, lng) {
    for (const hub of SERVICE_HUBS) {
      const d = haversineKm(lat, lng, hub.lat, hub.lng);
      if (d <= hub.radiusKm) return { ok: true, hub: hub.name, distanceKm: d.toFixed(1) };
    }
    return { ok: false };
  }

  function ui(el, text, cls) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove("ok", "nope", "pending");
    if (cls) el.classList.add(cls);
  }

  function onClickCheck(btn, resultEl) {
    console.log("[ServiceCheck] button clicked");
    ui(resultEl, "Checking your location…", "pending");

    // Must be HTTPS or localhost
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      ui(resultEl, "Location only works over HTTPS (or localhost). Open your secure site URL.", "nope");
      console.warn("[ServiceCheck] Not HTTPS/localhost");
      return;
    }

    if (!("geolocation" in navigator)) {
      ui(resultEl, "Geolocation isn’t supported by your browser.", "nope");
      console.warn("[ServiceCheck] No geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("[ServiceCheck] coords:", latitude, longitude);
        const res = isInServiceArea(latitude, longitude);
        if (res.ok) {
          ui(resultEl, `✅ You're in our service area (${res.hub}).`, "ok");
        } else {
          ui(resultEl, "❌ You appear to be outside our service area. Still message me—exceptions are possible!", "nope");
        }
      },
      (err) => {
        console.error("[ServiceCheck] geolocation error:", err);
        let msg = "Couldn’t access your location. ";
        if (err.code === 1) msg += "Permission denied. Enable location for this site and try again.";
        else if (err.code === 2) msg += "Position unavailable. Try again.";
        else if (err.code === 3) msg += "Timed out. Try again.";
        ui(resultEl, msg, "nope");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  }

  function bindHandler() {
    const btn = document.getElementById("check-my-location");
    const result = document.getElementById("check-result");
    if (!btn || !result) {
      console.warn("[ServiceCheck] elements not found yet");
      return false;
    }
    if (btn.dataset.bound === "1") return true;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => onClickCheck(btn, result));
    console.log("[ServiceCheck] handler bound");
    return true;
  }

  // 1) Try now (defer should make DOM ready, but just in case)
  if (!bindHandler()) {
    // 2) Try on DOMContentLoaded
    document.addEventListener("DOMContentLoaded", bindHandler, { once: true });
    // 3) Try again after a short delay (for late DOM inserts)
    setTimeout(bindHandler, 500);
  }

  // 4) Inline debug hook (from HTML onclick) — guarantees we can test the flow
  window._debugClick = function () {
    console.log("[ServiceCheck] _debugClick fired");
    const btn = document.getElementById("check-my-location");
    const result = document.getElementById("check-result");
    if (!btn || !result) {
      alert("Service checker elements not found in DOM.");
      return;
    }
    onClickCheck(btn, result);
  };
})();
