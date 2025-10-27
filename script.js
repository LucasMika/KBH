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

const inspirations = [
  "Pan-seared scallops with saffron-infused beurre blanc",
  "Smoked paprika lamb chops over rosemary polenta",
  "Butternut squash agnolotti finished with brown butter sage",
  "Charred citrus salmon with fennel and orange salad",
  "Wild mushroom tart with goat cheese and thyme drizzle"
];

const menuHighlight = document.querySelector(".menu-highlight");
const shuffleButton = document.querySelector(".shuffle-button");
const menuTabs = document.querySelectorAll(".menu-tabs button");
const menuItemsContainer = document.getElementById("menu-items");
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const form = document.querySelector(".contact-form");
const feedback = document.querySelector(".form-feedback");
const yearSpan = document.getElementById("year");

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

function shuffleInspiration() {
  const randomIndex = Math.floor(Math.random() * inspirations.length);
  menuHighlight.textContent = inspirations[randomIndex];
}

shuffleButton?.addEventListener("click", () => {
  shuffleInspiration();
  shuffleButton.classList.add("pulse");
  setTimeout(() => shuffleButton.classList.remove("pulse"), 400);
});

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

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  feedback.textContent = "Thank you! We’ll reach out within 24 hours.";
  form.reset();
});

yearSpan.textContent = new Date().getFullYear();

// initial state
renderMenu();
shuffleInspiration();
