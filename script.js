const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

function activateTab(tab, updateHash = true) {
  const targetId = tab.getAttribute("aria-controls");

  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });

  panels.forEach((panel) => {
    panel.hidden = panel.id !== targetId;
  });

  if (updateHash) {
    const tabName = tab.dataset.tab;
    history.replaceState(null, "", `#${tabName}`);
  }
}

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
      activateTab(tabs[0]);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastTab = tabs[tabs.length - 1];
      lastTab.focus();
      activateTab(lastTab);
      return;
    }

    if (keyMap[event.key]) {
      event.preventDefault();
      const nextIndex = (index + keyMap[event.key] + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    }
  });
});

const initialTabName = window.location.hash.replace("#", "");
const initialTab = tabs.find((tab) => tab.dataset.tab === initialTabName);

if (initialTab) {
  activateTab(initialTab, false);
}
