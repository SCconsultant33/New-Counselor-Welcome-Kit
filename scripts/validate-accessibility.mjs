import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const script = fs.readFileSync(new URL("../script.js", import.meta.url), "utf8");
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const idSet = new Set(ids);
assert(ids.length === idSet.size, "Every HTML id must be unique.");

for (const match of html.matchAll(/\b(?:aria-controls|aria-labelledby)="([^"]+)"/g)) {
  for (const id of match[1].split(/\s+/)) {
    assert(idSet.has(id), `ARIA reference '${id}' must point to an existing element.`);
  }
}

for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) {
  assert(idSet.has(match[1]), `Section link '#${match[1]}' must point to an existing element.`);
}

assert((html.match(/<h1\b/g) || []).length === 1, "The page must contain exactly one h1.");
assert((html.match(/role="tab"/g) || []).length === 8, "The guide must contain eight section tabs.");
assert((html.match(/role="tabpanel"/g) || []).length === 8, "The guide must contain eight matching tab panels.");
assert((html.match(/role="tabpanel"[^>]*hidden/g) || []).length === 7, "Only the Welcome panel should be visible initially.");
assert(html.includes('class="skip-link" href="#main-content"'), "A skip link must target the main content.");

for (const image of html.matchAll(/<img\b[^>]*>/g)) {
  assert(/\balt="[^"]+"/.test(image[0]), "Every content image must have non-empty alternative text.");
}

for (const anchor of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
  assert(/\brel="[^"]*noopener[^"]*"/.test(anchor[0]), "Links opening a new tab must use rel=noopener.");
}

assert(css.includes(":focus-visible"), "Keyboard focus must have a visible style.");
assert(css.includes("@media (prefers-reduced-motion: reduce)"), "Reduced-motion preferences must be supported.");
assert(css.includes("@media (max-width: 47.5rem)"), "The guide must include a mobile reflow breakpoint.");
assert(css.includes(".guide-section[hidden]"), "Inactive panels must be removed from the visual layout.");
assert(!/outline\s*:\s*(?:none|0)\b/.test(css), "Focus outlines must not be removed.");

for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
  assert(script.includes(`event.key === "${key}"`), `Tabbed navigation must support the ${key} key.`);
}
assert(script.includes('activeLink.focus({ preventScroll: true })'), "Section links must preserve a meaningful focus location.");
assert(script.includes('window.scrollTo({ top: navigation.offsetTop'), "Section changes must align the sticky menu with the top of the viewport.");

function rgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function luminance(hex) {
  return rgb(hex)
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const contrastPairs = [
  ["#2a328b", "#ffffff", 4.5, "Oakland blue text on white"],
  ["#006b3b", "#ffffff", 4.5, "dark green text on white"],
  ["#46516b", "#ffffff", 4.5, "body text on white"],
  ["#ffffff", "#2a328b", 4.5, "white text on Oakland blue"],
  ["#ffffff", "#1d2468", 4.5, "white text on dark blue"],
  ["#bff0d3", "#1d2468", 4.5, "light green text on dark blue"],
  ["#b64f00", "#ffffff", 3, "outer focus ring on white"],
];

for (const [foreground, background, minimum, label] of contrastPairs) {
  const ratio = contrast(foreground, background);
  assert(ratio >= minimum, `${label} contrast is ${ratio.toFixed(2)}:1; expected at least ${minimum}:1.`);
}

if (errors.length) {
  console.error(`Accessibility validation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("Accessibility structure, navigation, focus, responsive, reduced-motion, and contrast checks passed.");
