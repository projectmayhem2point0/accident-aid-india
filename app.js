const SUPPORTED = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "ta", name: "தமிழ்" }
  // add more later: bn, mr, gu, te, kn, ml, pa, or, etc.
];

const els = {
  langSelect: document.getElementById("langSelect"),
  appTitle: document.getElementById("appTitle"),
  heroTitle: document.getElementById("heroTitle"),
  heroSubtitle: document.getElementById("heroSubtitle"),
  disclaimerText: document.getElementById("disclaimerText"),
  sourceBadge: document.getElementById("sourceBadge"),
  searchInput: document.getElementById("searchInput"),
  cards: document.getElementById("cards"),
};

let STRINGS = {};
let SCENARIOS = [];

function populateLangPicker() {
  SUPPORTED.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.code; opt.textContent = l.name;
    els.langSelect.appendChild(opt);
  });
  const saved = localStorage.getItem("lang") || autoPick();
  els.langSelect.value = saved;
}

function autoPick() {
  const nav = (navigator.language || "en").slice(0,2);
  return SUPPORTED.find(l => l.code === nav)?.code || "en";
}

async function loadLang(lang) {
  try {
    const res = await fetch(`content/${lang}.json`);
    const data = await res.json();
    STRINGS = data.strings;
    SCENARIOS = data.scenarios;
    localStorage.setItem("lang", lang);
    renderUI();
  } catch (e) {
    console.error("Language load failed", e);
  }
}

function renderUI() {
  els.appTitle.textContent = STRINGS.app_title;
  els.heroTitle.textContent = STRINGS.hero_title;
  els.heroSubtitle.textContent = STRINGS.hero_subtitle;
  els.disclaimerText.textContent = STRINGS.disclaimer;
  if (els.sourceBadge) els.sourceBadge.textContent = STRINGS.source_badge || "";
  renderCards(SCENARIOS);
}

function renderCards(list) {
  els.cards.innerHTML = "";
  list.forEach(s => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <span class="tag">${s.category}</span>
      <h3>${s.title}</h3>
      <p>${s.summary}</p>
      <ol class="steps">
        ${s.do_now.map(step=>`<li>${step}</li>`).join("")}
      </ol>
      ${s.red_flags?.length ? `<p><strong>${STRINGS.red_flags}:</strong> ${s.red_flags.join("; ")}</p>` : ""}
      <p><small>${STRINGS.source}: ${s.source.join(", ")}</small></p>
    `;
    els.cards.appendChild(card);
  });
}

function search() {
  const q = els.searchInput.value.trim().toLowerCase();
  if (!q) return renderCards(SCENARIOS);
  const filtered = SCENARIOS.filter(s =>
    [s.title, s.summary, s.category, ...(s.do_now||[])]
      .join(" ")
      .toLowerCase().includes(q)
  );
  renderCards(filtered);
}

els.langSelect.addEventListener("change", e => loadLang(e.target.value));
els.searchInput.addEventListener("input", search);

populateLangPicker();
loadLang(els.langSelect.value);

// PWA (offline cache)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}
