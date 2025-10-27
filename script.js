// --- Seasonal Menus ---
const seasonalMenus = {
  spring: [
    { title: "Citrus Poached Halibut", description: "Shaved fennel salad, grapefruit beurre blanc, chive oil", price: "$38" },
    { title: "Morel Mushroom Risotto", description: "Parmesan crisp, pea tendrils, preserved lemon", price: "$32" },
    { title: "Lavender Honey Panna Cotta", description: "Macadamia crumble, blood orange glaze", price: "$16" }
  ],
  summer: [
    { title: "Heirloom Tomato Carpaccio", description: "Pickled shallot, basil oil, smoked sea salt", price: "$18" },
    { title: "Grilled Peach & Burrata Salad", description: "Prosciutto, spiced pecans, aged balsamic", price: "$24" },
    { title: "Charred Chimichurri Tenderloin", description: "Sweet corn purée, blistered shishito, herb jus", price: "$44" }
  ],
  autumn: [
    { title: "Pumpkin Velouté", description: "Brown butter crumble, sage cream, pepitas", price: "$14" },
    { title: "Cider-Glazed Duck Breast", description: "Farro pilaf, roasted figs, spiced jus", price: "$42" },
    { title: "Roasted Pear Tarte Tatin", description: "Vanilla bean mascarpone, burnt caramel", price: "$18" }
  ],
  winter: [
    { title: "Truffle Cauliflower Soup", description: "Crispy pancetta, parsley oil, brioche crumbs", price: "$16" },
    { title: "Braised Short Ribs", description: "Parsnip silk, red wine jus, charred scallions", price: "$40" },
    { title: "Molten Spiced Chocolate Cake", description: "Cayenne ganache, cinnamon chantilly", price: "$15" }
  ]
};

const menuTabs = document.querySelectorAll(".menu-tabs button");
const menuItemsContainer = document.getElementById("menu-items");
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const form = document.querySelector(".contact-form");
const feedback = document.querySelector(".form-feedback");
const submitButton = form?.querySelector("button[type='submit']");
const yearSpan = document.getElementById("year");

// Prefer AJAX; fall back to native POST if blocked
const FORM_ENDPOINT = "https://formsubmit.co/ajax/mikald1318@gmail.com";

function renderMenu(season = "spring") {
  if (!menuItemsContainer) return;
  menuItemsContainer.innerHTML = "";
  seasonalMenus[season].forEach((item) => {
    const article = document.createElement("article");
    article.classList.add("menu-item");
    article.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <span>${item.price}</span>
    `;
    menuItemsContainer.appendChild(article);
  });
}

function setActiveTab(activeButton) {
  menuTabs.forEach((button) => {
    const isActive = button === activeButton;
    button.setAttribute("aria-selected", isActive);
  });
}

menuTabs.forEach((button) => {
  button.addEventListener("click", () => {
    const season = button.dataset.season;
    renderMenu(season);
    setActiveTab(button);
  });
});

navToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (mainNav.classList.contains("open")) {
      mainNav.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });
});

// ---------- FIXED FALLBACK LOGIC ----------
function handleSubmit(event) {
  event.preventDefault();

  if (!feedback || !submitButton) return;

  feedback.textContent = "Sending your message...";
  feedback.classList.remove("error", "success");
  feedback.classList.add("pending");

  submitButton.disabled = true;
  const originalText = submitButton.textContent;
  submitButton.textContent = "Sending…";

  (async () => {
    try {
      const formData = new FormData(form);

      // basic validation
      const email = String(formData.get("email") || "");
      if (!email.includes("@")) throw new Error("Please enter a valid email.");

      // honeypot
      if (formData.get("_honey")) throw new Error("Bot detected.");

      const payload = Object.fromEntries(formData.entries());

      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...payload,
          _replyto: email,
          _subject: "Savory Creations Inquiry",
          _template: "table"
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();

      // success → go to thank-you page if present
      window.location.href = "/thank-you.html";
    } catch (err) {
      console.error("Form submission via AJAX failed:", err);
      // fall back to native POST (needs the handler removed first)
      try {
        form.removeEventListener("submit", handleSubmit);
        form.submit();
      } catch (fallbackErr) {
        console.error("Native submit fallback failed:", fallbackErr);
        feedback.textContent = "We couldn’t send your message. Please email us directly at mikald1318@gmail.com.";
        feedback.classList.remove("pending");
        feedback.classList.add("error");
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  })();
}



// Footer year + initial render
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
renderMenu();
