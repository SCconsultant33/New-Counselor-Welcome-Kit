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
  const learningResources = content.resources.filter((resource) =>
    ["Interactive calendar", "Living guide"].includes(resource.category),
  );
  container.textContent = "";
  learningResources.forEach((resource) => {
    const link = configureLink(document.createElement("a"), resource.url);
    link.className = "learning-card";
    link.append(
      createTextElement("span", "resource-type", resource.category),
      createTextElement("strong", "", resource.title),
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
  const linksPanel = document.querySelector("#section-links");
  const links = [...linksPanel.querySelectorAll("a")];
  const sections = links.map((link) => document.querySelector(link.hash)).filter(Boolean);

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    linksPanel.classList.toggle("is-open", !open);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      linksPanel.classList.remove("is-open");
    });
  });

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((section) => navObserver.observe(section));
  }
}

if (content) {
  renderChecklist();
  renderServices();
  renderResources();
  renderLearningLinks();
  renderContactLinks();
  setupNavigation();
}
