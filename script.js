/* =========================================================
   Savory Creations — Optimized JS
   ========================================================= */

// ---------- MOBILE NAV TOGGLE ----------
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
}

// ---------- SMOOTH SCROLL ----------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;
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
            resultEl.textContent = "Sending…";
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
        } catch (err) {
            console.error(err);
            if (resultEl) {
                resultEl.textContent = "An error occurred. Please try again.";
                resultEl.className = "form-feedback error";
            }
        }
    });
}

/* =========================================================
   SERVICE AREA CHECKER (No external API)
   ========================================================= */
(function () {
    const SERVICE_HUBS = [
        { name: "Greater Grand Rapids", lat: 42.9634, lng: -85.6681, radiusKm: 35 },
        { name: "Holland (Lakeshore)", lat: 42.7875, lng: -86.1089, radiusKm: 32 },
        { name: "Grand Haven (Lakeshore)", lat: 43.0631, lng: -86.2284, radiusKm: 28 },
        { name: "Muskegon (Lakeshore)", lat: 43.2342, lng: -86.2484, radiusKm: 28 },
    ];

    function haversineKm(lat1, lng1, lat2, lng2) {
        const toRad = (d) => (d * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
        el.classList.remove("show");
        el.classList.add("fading-out");
        setTimeout(() => {
            el.textContent = text;
            el.className = `check-result ${cls || ""}`.trim();
            void el.offsetWidth; // restart animation
            el.classList.add("show");
        }, 300);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("check-my-location");
        const result = document.getElementById("check-result");
        if (!btn || !result) return;

        btn.addEventListener("click", () => {
            ui(result, "Checking your location…", "pending");

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
                    const res = isInServiceArea(latitude, longitude);
                    if (res.ok) {
                        ui(result, `✅ You're in my service area (${res.hub}).`, "ok");
                    } else {
                        ui(result, "❌ You appear to be outside my service area. Still message me—exceptions are possible!", "nope");
                    }
                },
                (err) => {
                    let msg = "Couldn’t access your location. ";
                    if (err.code === 1) msg += "Permission denied. Enable location for this site.";
                    else if (err.code === 2) msg += "Position unavailable. Try again.";
                    else if (err.code === 3) msg += "Timed out. Try again.";
                    ui(result, msg, "nope");
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
            );
        });
    });
})();

/* =========================================================
   MEAL PREP MENU TOGGLE + STAGGERED REVEAL
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggle-menu-button");
    const menuContainer = document.getElementById("menu-toggle-container");
    const items = document.querySelectorAll(".mealprep .menu-grid article");

    function revealOnScroll() {
        if (!menuContainer || menuContainer.style.display === "none") return;
        const triggerBottom = window.innerHeight * 0.85;
        let delay = 0;
        items.forEach((item) => {
            const boxTop = item.getBoundingClientRect().top;
            if (boxTop < triggerBottom && !item.classList.contains("visible")) {
                item.classList.add("visible");
                item.style.animationDelay = `${delay}s`;
                delay += 0.15;
            }
        });
    }

    if (toggleButton && menuContainer) {
        menuContainer.style.opacity = "0";
        menuContainer.style.display = "none";

        toggleButton.addEventListener("click", () => {
            const isVisible = menuContainer.style.display !== "none";
            if (isVisible) {
                menuContainer.style.opacity = "0";
                setTimeout(() => {
                    menuContainer.style.display = "none";
                    items.forEach((i) => i.classList.remove("visible"));
                }, 500);
                toggleButton.textContent = "Show Menu Selections";
            } else {
                menuContainer.style.display = "grid";
                setTimeout(() => {
                    menuContainer.style.opacity = "1";
                    revealOnScroll();
                }, 10);
                toggleButton.textContent = "Hide Menu Selections";
            }
            window.removeEventListener("scroll", revealOnScroll);
            if (!isVisible) {
                window.addEventListener("scroll", revealOnScroll);
                revealOnScroll();
            }
        });

        window.addEventListener("scroll", revealOnScroll);
    }
});

/* =========================================================
   PORTRAIT GALLERY LIGHTBOX
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.getElementById("lightbox");
    const imgs = document.querySelectorAll(".gallery-grid-portrait img");
    if (!lightbox || !imgs.length) return;

    imgs.forEach((img) => {
        img.addEventListener("click", () => {
            lightbox.classList.add("active");
            lightbox.querySelector("img").src = img.src;
            lightbox.querySelector("img").alt = img.alt || "Gallery image";
        });
    });

    lightbox.addEventListener("click", () => lightbox.classList.remove("active"));
});
