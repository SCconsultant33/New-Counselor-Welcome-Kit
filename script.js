const content = window.GUIDE_CONTENT;
const storageKey = "oakland-new-counselor-guide-checklist-v1";

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function configureLink(link, url) {
  link.href = url;
  if (/^https?:/i.test(url)) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  return link;
}

function loadChecklistState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set();
  }
}

function saveChecklistState(completed) {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...completed]));
  } catch {
    // The checklist remains usable when private browsing blocks storage.
  }
}

function renderChecklist() {
  const container = document.querySelector("#connection-checklist");
  const resetButton = document.querySelector("#reset-checklist");
  const progressText = document.querySelector("#progress-text");
  const progressTrack = document.querySelector("#progress-track");
  const progressFill = document.querySelector("#progress-fill");
  const status = document.querySelector("#checklist-status");
  const completed = loadChecklistState();

  function updateProgress(announce = false) {
    const total = content.checklist.length;
    const count = content.checklist.filter((item) => completed.has(item.id)).length;
    const percent = total ? Math.round((count / total) * 100) : 0;
    const message = `${count} of ${total} completed — ${percent}%`;

    progressText.textContent = message;
    progressTrack.setAttribute("aria-valuenow", String(percent));
    progressFill.style.width = `${percent}%`;
    resetButton.disabled = count === 0;
    if (announce) status.textContent = `Connection progress updated: ${message}`;
  }

  content.checklist.forEach((item) => {
    const wrapper = document.createElement("article");
    wrapper.className = "check-item";
    const checkbox = document.createElement("input");
    const inputId = `check-${item.id}`;
    checkbox.type = "checkbox";
    checkbox.id = inputId;
    checkbox.checked = completed.has(item.id);

    const body = document.createElement("div");
    const label = createTextElement("label", "check-label", item.title);
    label.htmlFor = inputId;
    const description = createTextElement("p", "", item.description);
    const action = configureLink(createTextElement("a", "", item.actionLabel), item.actionUrl);
    body.append(label, description, action);
    wrapper.append(checkbox, body);

    const syncState = () => {
      wrapper.classList.toggle("is-complete", checkbox.checked);
      if (checkbox.checked) completed.add(item.id);
      else completed.delete(item.id);
      saveChecklistState(completed);
      updateProgress(true);
    };

    checkbox.addEventListener("change", syncState);
    wrapper.classList.toggle("is-complete", checkbox.checked);
    container.appendChild(wrapper);
  });

  resetButton.addEventListener("click", () => {
    completed.clear();
    saveChecklistState(completed);
    container.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
      checkbox.closest(".check-item")?.classList.remove("is-complete");
    });
    updateProgress(true);
  });

  updateProgress();
}

function renderServices() {
  const container = document.querySelector("#service-grid");
  content.services.forEach((service) => {
    const card = document.createElement("article");
    card.className = "service-card";
    card.append(
      createTextElement("h3", "", service.title),
      createTextElement("p", "", service.description),
    );
    container.appendChild(card);
  });
}

function renderResources() {
  const container = document.querySelector("#resource-list");
  content.resources.forEach((resource) => {
    const card = document.createElement("article");
    card.className = "resource-card";
    const category = createTextElement("p", "resource-type", resource.category);
    const copy = document.createElement("div");
    copy.append(
      createTextElement("h3", "", resource.title),
      createTextElement("p", "", resource.description),
    );
    const action = configureLink(
      createTextElement("a", "button button-secondary", resource.actionLabel),
      resource.url,
    );
    card.append(category, copy, action);
    container.appendChild(card);
  });
}

function renderLearningLinks() {
  const container = document.querySelector("#learning-links");
  const learningOrder = ["Interactive calendar", "Living guide"];
  const learningResources = content.resources
    .filter((resource) => learningOrder.includes(resource.category))
    .sort((a, b) => learningOrder.indexOf(a.category) - learningOrder.indexOf(b.category));
  container.textContent = "";
  learningResources.forEach((resource) => {
    const link = configureLink(document.createElement("a"), resource.url);
    link.className = "learning-card";
    link.append(
      createTextElement("span", "resource-type", resource.category),
      createTextElement("strong", "", resource.title),
      createTextElement("span", "learning-description", resource.description),
      createTextElement("span", "", `${resource.actionLabel} →`),
    );
    container.appendChild(link);
  });
}

function renderContactLinks() {
  const contact = content.contact;
  const container = document.querySelector(".contact-grid");
  const items = [
    { number: "01", label: "Call or text", value: contact.phoneDisplay, detail: "Connect directly by cell", url: `tel:${contact.phoneHref}` },
    { number: "02", label: "Email", value: contact.email, detail: "Send a question or introduction", url: `mailto:${contact.email}` },
    { number: "03", label: "Schedule", value: "Meet with Sean", detail: "Choose a time through Calendly", url: contact.calendlyUrl },
    { number: "04", label: "Coaching", value: "Request or refer for coaching", detail: "Open the school counselor coaching form", url: contact.coachingRequestUrl, accent: true },
  ];
  container.textContent = "";
  items.forEach((item) => {
    const link = configureLink(document.createElement("a"), item.url);
    link.className = `contact-card${item.accent ? " contact-card-accent" : ""}`;
    const number = createTextElement("span", "contact-icon", item.number);
    number.setAttribute("aria-hidden", "true");
    link.append(
      number,
      createTextElement("span", "contact-label", item.label),
      createTextElement("strong", "", item.value),
      createTextElement("span", "", item.detail),
    );
    container.appendChild(link);
  });
}

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const currentSection = document.querySelector("#current-section");
  const linksPanel = document.querySelector("#section-links");
  const links = [...linksPanel.querySelectorAll("a")];
  const sections = links.map((link) => document.querySelector(link.hash)).filter(Boolean);

  function selectSection(sectionId, { updateHistory = true, scroll = true } = {}) {
    const target = document.querySelector(`#${sectionId}`);
    const activeLink = links.find((link) => link.hash === `#${sectionId}`);
    if (!target || !activeLink) return;

    sections.forEach((section) => {
      section.hidden = section !== target;
    });
    links.forEach((link) => {
      const selected = link === activeLink;
      link.setAttribute("aria-selected", String(selected));
      link.tabIndex = selected ? 0 : -1;
    });
    currentSection.textContent = activeLink.textContent.trim();
    toggle.setAttribute("aria-expanded", "false");
    linksPanel.classList.remove("is-open");

    if (updateHistory && window.location.hash !== activeLink.hash) {
      window.history.pushState(null, "", activeLink.hash);
    }
    if (scroll) {
      document.querySelector(".section-nav").scrollIntoView({ block: "start" });
    }
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    linksPanel.classList.toggle("is-open", !open);
  });

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      selectSection(link.hash.slice(1));
      if (window.matchMedia("(max-width: 47.5rem)").matches) toggle.focus();
    });
    link.addEventListener("keydown", (event) => {
      const currentIndex = links.indexOf(link);
      let nextIndex;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % links.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + links.length) % links.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = links.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      links[nextIndex].focus();
      selectSection(links[nextIndex].hash.slice(1));
    });
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || links.includes(link)) return;
    const sectionId = link.hash.slice(1);
    if (!sections.some((section) => section.id === sectionId)) return;
    event.preventDefault();
    selectSection(sectionId);
  });

  window.addEventListener("popstate", () => {
    const sectionId = window.location.hash.slice(1);
    selectSection(sections.some((section) => section.id === sectionId) ? sectionId : "welcome", { updateHistory: false });
  });

  const initialSection = window.location.hash.slice(1);
  selectSection(sections.some((section) => section.id === initialSection) ? initialSection : "welcome", { updateHistory: false, scroll: false });
}

if (content) {
  renderChecklist();
  renderServices();
  renderResources();
  renderLearningLinks();
  renderContactLinks();
  setupNavigation();
}
