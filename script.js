const seasonalMenus = {
  spring: [
    {
      title: "Citrus Poached Halibut",
      description: "Shaved fennel salad, grapefruit beurre blanc, chive oil",
      price: "$38"
    },
    {
      title: "Morel Mushroom Risotto",
      description: "Parmesan crisp, pea tendrils, preserved lemon",
      price: "$32"
    },
    {
      title: "Lavender Honey Panna Cotta",
      description: "Macadamia crumble, blood orange glaze",
      price: "$16"
    }
  ],
  summer: [
    {
      title: "Heirloom Tomato Carpaccio",
      description: "Pickled shallot, basil oil, smoked sea salt",
      price: "$18"
    },
    {
      title: "Grilled Peach & Burrata Salad",
      description: "Prosciutto, spiced pecans, aged balsamic",
      price: "$24"
    },
    {
      title: "Charred Chimichurri Tenderloin",
      description: "Sweet corn purée, blistered shishito, herb jus",
      price: "$44"
    }
  ],
  autumn: [
    {
      title: "Pumpkin Velouté",
      description: "Brown butter crumble, sage cream, pepitas",
      price: "$14"
    },
    {
      title: "Cider-Glazed Duck Breast",
      description: "Farro pilaf, roasted figs, spiced jus",
      price: "$42"
    },
    {
      title: "Roasted Pear Tarte Tatin",
      description: "Vanilla bean mascarpone, burnt caramel",
      price: "$18"
    }
  ],
  winter: [
    {
      title: "Truffle Cauliflower Soup",
      description: "Crispy pancetta, parsley oil, brioche crumbs",
      price: "$16"
    },
    {
      title: "Braised Short Ribs",
      description: "Parsnip silk, red wine jus, charred scallions",
      price: "$40"
    },
    {
      title: "Molten Spiced Chocolate Cake",
      description: "Cayenne ganache, cinnamon chantilly",
      price: "$15"
    }
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
const FORM_ENDPOINT = "https://formsubmit.co/ajax/mikald1318@gmail.com";

function renderMenu(season = "spring") {
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

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!feedback || !submitButton) {
    return;
  }

  feedback.textContent = "Sending your message...";
  feedback.classList.remove("error", "success");
  feedback.classList.add("pending");

  submitButton.disabled = true;
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = "Sending...";

  try {
    const formData = new FormData(form);
    if (!formData.has("_replyto")) {
      formData.append("_replyto", formData.get("email") || "");
    }
    formData.set("_subject", "Savory Creations Inquiry");
    formData.set("_template", "table");

    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Submission failed with status ${response.status}`);
    }

    await response.json();
    feedback.textContent = "Thank you! Your message has been sent.";
    feedback.classList.add("success");
    form.reset();
  } catch (error) {
    console.error("Form submission failed:", error);
    feedback.textContent =
      "We couldn’t send your message. Please try again or email us directly at mikald1318@gmail.com.";
    feedback.classList.add("error");
  } finally {
    feedback.classList.remove("pending");
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

yearSpan.textContent = new Date().getFullYear();

// initial state
renderMenu();
