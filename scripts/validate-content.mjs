import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../data/guide-content.js", import.meta.url), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);

const guide = context.window.GUIDE_CONTENT;
const errors = [];

function requireText(value, path) {
  if (typeof value !== "string" || !value.trim()) errors.push(`${path} must contain text.`);
}

function requireUrl(value, path, allowHash = false) {
  requireText(value, path);
  if (typeof value !== "string") return;
  if (allowHash && value.startsWith("#")) return;
  if (!/^(https?:|mailto:|tel:)/i.test(value)) errors.push(`${path} must use https, mailto, tel, or an allowed section link.`);
}

if (!guide || typeof guide !== "object") errors.push("GUIDE_CONTENT is missing.");

for (const collection of ["checklist", "services", "resources"]) {
  if (!Array.isArray(guide?.[collection]) || guide[collection].length === 0) {
    errors.push(`${collection} must be a non-empty list.`);
  }
}

const checklistIds = new Set();
guide?.checklist?.forEach((item, index) => {
  const path = `checklist[${index}]`;
  requireText(item.id, `${path}.id`);
  requireText(item.title, `${path}.title`);
  requireText(item.description, `${path}.description`);
  requireText(item.actionLabel, `${path}.actionLabel`);
  requireUrl(item.actionUrl, `${path}.actionUrl`, true);
  if (checklistIds.has(item.id)) errors.push(`${path}.id duplicates ${item.id}.`);
  checklistIds.add(item.id);
});

guide?.services?.forEach((item, index) => {
  requireText(item.title, `services[${index}].title`);
  requireText(item.description, `services[${index}].description`);
});

guide?.resources?.forEach((item, index) => {
  const path = `resources[${index}]`;
  requireText(item.category, `${path}.category`);
  requireText(item.title, `${path}.title`);
  requireText(item.description, `${path}.description`);
  requireText(item.actionLabel, `${path}.actionLabel`);
  requireUrl(item.url, `${path}.url`);
});

for (const field of ["name", "title", "organization", "email", "phoneDisplay", "phoneHref", "calendlyUrl", "coachingRequestUrl"]) {
  requireText(guide?.contact?.[field], `contact.${field}`);
}
requireUrl(guide?.contact?.calendlyUrl, "contact.calendlyUrl");
requireUrl(guide?.contact?.coachingRequestUrl, "contact.coachingRequestUrl");

if (errors.length) {
  console.error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Content is valid: ${guide.checklist.length} checklist items, ${guide.services.length} services, and ${guide.resources.length} resources.`);
