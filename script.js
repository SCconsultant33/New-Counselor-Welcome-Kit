const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const menuToggle = document.querySelector("#menu-toggle");
const menuPanel = document.querySelector("#guide-menu-panel");
const currentSection = document.querySelector("#current-section");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setMenuOpen(open) {
  if (!menuToggle || !menuPanel) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuPanel.hidden = !open;
}

function updateCurrentSection(tab) {
  if (currentSection) {
    currentSection.textContent = tab.textContent.trim();
  }
}

function refreshReveal(panel) {
  const items = Array.from(panel.querySelectorAll(".reveal-item"));

  items.forEach((item) => {
    item.classList.remove("is-visible");
  });

  window.requestAnimationFrame(() => {
    items.forEach((item, index) => {
      window.setTimeout(() => item.classList.add("is-visible"), index * 55);
    });
  });
}

function activateTab(tab, updateHash = true, collapseMenu = true) {
  const targetId = tab.getAttribute("aria-controls");
  const targetPanel = document.getElementById(targetId);

  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });

  panels.forEach((panel) => {
    panel.hidden = panel !== targetPanel;
  });

  updateCurrentSection(tab);

  if (collapseMenu) {
    setMenuOpen(false);
  }

  if (targetPanel && document.body.classList.contains("reveal-enabled")) {
    refreshReveal(targetPanel);
  }

  if (updateHash) {
    const tabName = tab.dataset.tab;
    history.replaceState(null, "", `#${tabName}`);
    targetPanel?.scrollIntoView({
      block: "start",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
    menuToggle?.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!menuPanel || !menuToggle) return;
  const target = event.target;
  const clickedInsideMenu = menuPanel.contains(target) || menuToggle.contains(target);

  if (!clickedInsideMenu) {
    setMenuOpen(false);
  }
});

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));

  tab.addEventListener("keydown", (event) => {
    const keyMap = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };

    if (event.key === "Home") {
      event.preventDefault();
      tabs[0].focus();
      activateTab(tabs[0], true, false);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastTab = tabs[tabs.length - 1];
      lastTab.focus();
      activateTab(lastTab, true, false);
      return;
    }

    if (keyMap[event.key]) {
      event.preventDefault();
      const nextIndex = (index + keyMap[event.key] + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex], true, false);
    }
  });
});

const revealItems = Array.from(document.querySelectorAll(".reveal-item"));

if (!reduceMotion && "IntersectionObserver" in window) {
  document.body.classList.add("reveal-enabled");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.16,
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const initialTabName = window.location.hash.replace("#", "");
const initialTab = tabs.find((tab) => tab.dataset.tab === initialTabName);

if (initialTab) {
  activateTab(initialTab, false, false);
} else if (tabs[0]) {
  updateCurrentSection(tabs[0]);
}
