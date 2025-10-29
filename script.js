/* =========================================================
   Savory Creations JavaScript
   ========================================================= */

// ---------- MOBILE NAV TOGGLE ----------
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

// ---------- SMOOTH SCROLL ----------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId.startsWith("#")) {
      e.preventDefault();
      const section = document.querySelector(targetId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        mainNav?.classList.remove("open");
      }
    }
  });
});

// ---------- CONTACT FORM HANDLING ----------
const form = document.querySelector("form.contact-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const resultEl = document.querySelector(".form-feedback");
    if (resultEl) {
      resultEl.textContent = "Sending...";
      resultEl.className = "form-feedback pending";
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        if (resultEl) {
          resultEl.textContent = "Message sent successfully!";
          resultEl.className = "form-feedback success";
        }
        form.reset();
      } else {
        throw new Error("Submission failed.");
      }
    } catch (error) {
      console.error(error);
      if (resultEl) {
        resultEl.textContent = "An error occurred. Please try again.";
        resultEl.className = "form-feedback error";
      }
    }
  });
}

/* =========================================================
   SERVICE AREA CHECKER (NO API) + FADE-IN EFFECT
   ========================================================= */
(function () {
  console.log("[ServiceCheck] script loaded");

  // Hubs + radius (in kilometers)
  const SERVICE_HUBS = [
    { name: "Greater Grand Rapids",    lat: 42.9634, lng: -85.6681, radiusKm: 35 },
    { name: "Holland (Lakeshore)",     lat: 42.7875, lng: -86.1089, radiusKm: 32 },
    { name: "Grand Haven (Lakeshore)", lat: 43.0631, lng: -86.2284, radiusKm: 28 },
    { name: "Muskegon (Lakeshore)",    lat: 43.2342, lng: -86.2484, radiusKm: 28 }
  ];

  // Calculate distance between two coordinates
  function haversineKm(lat1, lng1, lat2, lng2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Check if point is inside any hub radius
  function isInServiceArea(lat, lng) {
    for (const hub of SERVICE_HUBS) {
      const d = haversineKm(lat, lng, hub.lat, hub.lng);
      if (d <= hub.radiusKm)
        return { ok: true, hub: hub.name, distanceKm: d.toFixed(1) };
    }
    return { ok: false };
  }

  // Update the result element with fade-in animation
function ui(el, text, cls) {
  if (!el) return;

  // fade out existing message first
  el.classList.remove("show");
  el.classList.add("fading-out");

  // after fade-out ends, change text and fade back in
  setTimeout(() => {
    el.textContent = text;
    el.classList.remove("ok", "nope", "pending", "fading-out");
    if (cls) el.classList.add(cls);

    // restart fade-in animation
    void el.offsetWidth;
    el.classList.add("show");
  }, 300); // matches fadeOut duration
}


  // Main button handler
  function onClickCheck(btn, result) {
    console.log("[ServiceCheck] button clicked");
    ui(result, "Checking your location…", "pending");

    // Must be HTTPS or localhost
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      ui(result, "Location only works over HTTPS (or localhost). Please open the secure site.", "nope");
      return;
    }

    if (!("geolocation" in navigator)) {
      ui(result, "Your browser doesn’t support location services.", "nope");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("[ServiceCheck] coords:", latitude, longitude);
        const res = isInServiceArea(latitude, longitude);
        if (res.ok) {
          ui(result, `✅ You're in my service area (${res.hub}).`, "ok");
        } else {
          ui(result, "❌ You appear to be outside my service area. Still message me—exceptions are possible!", "nope");
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        let msg = "Couldn’t access your location. ";
        if (err.code === 1)
          msg += "Permission denied. Enable location for this site.";
        else if (err.code === 2)
          msg += "Position unavailable. Try again.";
        else if (err.code === 3)
          msg += "Timed out. Try again.";
        ui(result, msg, "nope");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  }

  // Attach event listener once DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("check-my-location");
    const result = document.getElementById("check-result");
    if (!btn || !result) return;

    btn.addEventListener("click", () => onClickCheck(btn, result));
    console.log("[ServiceCheck] handler bound");
  });
})();


/* =========================================================
   SCROLL FADE-IN for Meal Prep Menu (Staggered)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".menu-grid article");

    function revealOnScroll() {
        const triggerBottom = window.innerHeight * 0.85;
        let delay = 0;

        items.forEach((item) => {
            const boxTop = item.getBoundingClientRect().top;
            if (boxTop < triggerBottom && !item.classList.contains("visible")) {
                item.classList.add("visible");
                // stagger delay per visible item
                item.style.animationDelay = `${delay}s`;
                delay += 0.15; // adjust spacing between fades
            }
        });
    }

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();
});
