const FLOWERS = [
  "Garden Roses",
  "Peonies",
  "Tulips",
  "Ranunculus",
  "Spray Roses",
  "Hydrangeas",
  "Sunflowers",
  "Snowball Viburnum",
  "Daffodils",
  "Gerberas",
  "Lilies",
  "Chrysanthemums",
  "Lilacs",
  "Asters",
  "Lavender",
  "Irises",
  "Daisies"
];

const DEFAULT_BOUQUET = ["Garden Roses", "Peonies", "Daisies", "Lavender", "Tulips"];

const PETALS = {
  "Garden Roses": "\u{1f339}",
  "Peonies": "\u{1f338}",
  "Tulips": "\u{1f337}",
  "Ranunculus": "\u{1f33c}",
  "Spray Roses": "\u{1f33a}",
  "Hydrangeas": "\u{1f490}",
  "Sunflowers": "\u{1f33b}",
  "Snowball Viburnum": "\u25cb",
  "Daffodils": "\u{1f33c}",
  "Gerberas": "\u{1f338}",
  "Lilies": "\u273d",
  "Chrysanthemums": "\u273a",
  "Lilacs": "\u273f",
  "Asters": "\u2726",
  "Lavender": "\u273f",
  "Irises": "\u2735",
  "Daisies": "\u{1f33c}"
};

const BOUQUET_SPOTS = [
  { x: 200, y: 121, scale: .54, layer: 0 },
  { x: 148, y: 145, scale: .56, layer: 0 },
  { x: 252, y: 145, scale: .56, layer: 0 },
  { x: 181, y: 155, scale: .66, layer: 0 },
  { x: 219, y: 155, scale: .66, layer: 0 },
  { x: 124, y: 184, scale: .64, layer: 1 },
  { x: 276, y: 184, scale: .64, layer: 1 },
  { x: 159, y: 188, scale: .78, layer: 1 },
  { x: 241, y: 188, scale: .78, layer: 1 },
  { x: 200, y: 202, scale: .98, layer: 2 },
  { x: 139, y: 224, scale: .84, layer: 2 },
  { x: 261, y: 224, scale: .84, layer: 2 },
  { x: 174, y: 232, scale: .94, layer: 3 },
  { x: 226, y: 232, scale: .94, layer: 3 },
  { x: 200, y: 246, scale: 1.08, layer: 3 },
  { x: 112, y: 238, scale: .58, layer: 3 },
  { x: 288, y: 238, scale: .58, layer: 3 }
];

const DEFAULT_CUSTOM = {
  customFlower: "",
  bgColor: "#f5e6e0",
  wrapColor: "#161412",
  bgImage: "",
  frameEnabled: false,
  frameImage: "",
  fontChoice: "serif",
  customFont: "",
  themeChoice: "system"
};

const state = {
  selected: new Set(),
  themeChoice: "system",
  currentTheme: "light",
  custom: { ...DEFAULT_CUSTOM }
};

const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function flowerButtonName(name) {
  return name.replace(/\s+/g, "-").toLowerCase();
}

function encode(data) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decode(value) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(value))));
  } catch {
    return null;
  }
}

function shortId() {
  if (!window.crypto || !crypto.getRandomValues) {
    return Math.random().toString(36).slice(2, 10);
  }

  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("").slice(0, 8);
}

function saveBouquet(data) {
  const id = shortId();
  try {
    localStorage.setItem(`flowers-bouquet-${id}`, JSON.stringify(data));
    return id;
  } catch {
    return null;
  }
}

function loadBouquet(id) {
  const saved = localStorage.getItem(`flowers-bouquet-${id}`);
  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cssUrl(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function clampColor(value) {
  return Math.max(0, Math.min(255, value));
}

function hexToRgb(hex) {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "161412";
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => clampColor(value).toString(16).padStart(2, "0")).join("")}`;
}

function shiftHex(hex, amount) {
  const rgb = hexToRgb(hex);
  return rgbToHex({
    r: rgb.r + amount,
    g: rgb.g + amount,
    b: rgb.b + amount
  });
}

function renderPetalRing(count, rx, ry, distance, colors, start = 0) {
  return Array.from({ length: count }, (_, index) => {
    const angle = start + (360 / count) * index;
    const fill = colors[index % colors.length];
    return `<ellipse cx="0" cy="-${distance}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${angle})"/>`;
  }).join("");
}

function renderRose(colors) {
  return `
    <g>
      ${renderPetalRing(8, 11, 16, 17, colors.outer, 10)}
      ${renderPetalRing(6, 8, 12, 10, colors.inner, 35)}
      <circle cx="0" cy="0" r="8" fill="${colors.center}"/>
      <circle cx="-2" cy="-1" r="3.6" fill="${colors.highlight}"/>
    </g>
  `;
}

function renderCluster(colors) {
  const dots = [
    [-16, -12, 10], [2, -17, 11], [18, -7, 10], [-22, 4, 9],
    [-5, 5, 12], [13, 10, 9], [-10, 17, 8], [5, -2, 8]
  ];
  return `<g>${dots.map((dot, index) => `<circle cx="${dot[0]}" cy="${dot[1]}" r="${dot[2]}" fill="${colors[index % colors.length]}"/>`).join("")}</g>`;
}

function renderDaisy(petalColors, center = "#f4d94f") {
  return `
    <g>
      ${renderPetalRing(10, 6, 15, 15, petalColors, 0)}
      <circle cx="0" cy="0" r="7" fill="${center}"/>
      <circle cx="0" cy="0" r="3" fill="#c59635" opacity=".45"/>
    </g>
  `;
}

function renderTulip(colors) {
  return `
    <g>
      <path d="M-20,4 C-19,-18 -8,-28 0,-8 C8,-28 19,-18 20,4 C16,20 6,27 0,27 C-6,27 -16,20 -20,4Z" fill="${colors.main}"/>
      <path d="M-5,20 C-18,4 -12,-18 0,-8 C12,-18 18,4 5,20Z" fill="${colors.light}" opacity=".9"/>
      <path d="M0,-8 C-5,5 -5,17 0,27 C5,17 5,5 0,-8Z" fill="${colors.deep}" opacity=".42"/>
    </g>
  `;
}

function renderSunflower() {
  return `
    <g>
      ${renderPetalRing(18, 5.5, 19, 17, ["#f8c84e", "#f2aa2e", "#ffd76a"], 0)}
      <circle cx="0" cy="0" r="14" fill="#5d3b20"/>
      <circle cx="-4" cy="-2" r="3" fill="#866338"/>
      <circle cx="5" cy="2" r="3" fill="#866338"/>
      <circle cx="1" cy="-6" r="2.5" fill="#a0783f"/>
    </g>
  `;
}

function renderLavender() {
  const buds = Array.from({ length: 9 }, (_, index) => {
    const y = -34 + index * 8;
    const side = index % 2 === 0 ? -7 : 7;
    return `<ellipse cx="${side}" cy="${y}" rx="6" ry="9" fill="${index % 3 === 0 ? "#8c77c8" : "#a894dc"}" transform="rotate(${side < 0 ? -25 : 25},${side},${y})"/>`;
  }).join("");
  return `
    <g>
      <path d="M0,34 C-4,8 3,-14 0,-40" stroke="#526f46" stroke-width="2" fill="none"/>
      ${buds}
    </g>
  `;
}

function renderLily() {
  return `
    <g>
      ${renderPetalRing(6, 8, 24, 14, ["#fff6ee", "#f5d8d8", "#fffaf2"], 30)}
      <path d="M0,-2 L-5,12 M0,-2 L5,12 M0,-2 L0,14" stroke="#b76e6a" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="-5" cy="12" r="2" fill="#c77a4b"/>
      <circle cx="5" cy="12" r="2" fill="#c77a4b"/>
      <circle cx="0" cy="14" r="2" fill="#c77a4b"/>
    </g>
  `;
}

function renderIris() {
  return `
    <g>
      <ellipse cx="0" cy="-19" rx="10" ry="22" fill="#7f65c9"/>
      <ellipse cx="-15" cy="3" rx="11" ry="25" fill="#5f55b8" transform="rotate(-36,-15,3)"/>
      <ellipse cx="15" cy="3" rx="11" ry="25" fill="#6f58c2" transform="rotate(36,15,3)"/>
      <ellipse cx="0" cy="12" rx="10" ry="22" fill="#7c62c8" transform="rotate(180)"/>
      <path d="M-5,9 Q0,20 5,9" stroke="#f6cf6a" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
  `;
}

function renderImageFlower(src, index) {
  const safeSrc = escapeAttr(src);
  const clipId = `custom-flower-clip-${String(index).replace(/[^a-z0-9-]/gi, "")}`;
  return `
    <g>
      <defs>
        <clipPath id="${clipId}">
          <circle cx="0" cy="0" r="31"/>
        </clipPath>
      </defs>
      <circle cx="0" cy="0" r="33" fill="#f8f3ec" opacity=".95"/>
      <image href="${safeSrc}" x="-31" y="-31" width="62" height="62" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>
      <circle cx="0" cy="0" r="31" fill="none" stroke="#ffffff" stroke-width="3" opacity=".7"/>
    </g>
  `;
}

function renderFlowerHead(name, customFlower = "", index = 0) {
  if (name === "Custom Flower" && customFlower) {
    return renderImageFlower(customFlower, index);
  }

  switch (name) {
    case "Garden Roses":
      return renderRose({
        outer: ["#d94868", "#e76986", "#c83256"],
        inner: ["#f08aa1", "#df5774"],
        center: "#ffd0d8",
        highlight: "#ffe4e9"
      });
    case "Peonies":
      return renderRose({
        outer: ["#ed9aba", "#f3b1ca", "#d96f9f"],
        inner: ["#f7bfd2", "#e88aaf"],
        center: "#ffe2eb",
        highlight: "#fff1f5"
      });
    case "Tulips":
      return renderTulip({ main: "#e65367", light: "#ff7b8b", deep: "#a92944" });
    case "Ranunculus":
      return renderRose({
        outer: ["#f4b16f", "#f7c282", "#eca05e"],
        inner: ["#ffd198", "#f4b16f"],
        center: "#ffe8be",
        highlight: "#fff3d8"
      });
    case "Spray Roses":
      return renderCluster(["#ff9ab0", "#e85f84", "#f7bac8", "#d84a72"]);
    case "Hydrangeas":
      return renderCluster(["#a8b6ec", "#93a1df", "#c2cdf7", "#8795d4"]);
    case "Sunflowers":
      return renderSunflower();
    case "Snowball Viburnum":
      return renderCluster(["#f8fbf2", "#eef6e8", "#ffffff", "#e2efde"]);
    case "Daffodils":
      return `
        <g>
          ${renderPetalRing(6, 8, 18, 12, ["#ffe786", "#fff1a9"], 30)}
          <circle cx="0" cy="0" r="10" fill="#f7a93b"/>
          <circle cx="0" cy="-1" r="5" fill="#ffd36a"/>
        </g>
      `;
    case "Gerberas":
      return renderDaisy(["#f57ca2", "#ff9eb9", "#f36f96"], "#f5d64e");
    case "Lilies":
      return renderLily();
    case "Chrysanthemums":
      return `
        <g>
          ${renderPetalRing(22, 4, 21, 16, ["#eab4d0", "#f0c6dd", "#cf82b6"], 0)}
          ${renderPetalRing(14, 3.5, 15, 9, ["#f5d4e4", "#dc94c3"], 12)}
          <circle cx="0" cy="0" r="5" fill="#f7e0ad"/>
        </g>
      `;
    case "Lilacs":
      return renderCluster(["#b695df", "#9b7cc8", "#cdb6ed", "#8769ba"]);
    case "Asters":
      return renderDaisy(["#9f83d6", "#8169c4", "#baa3e7"], "#f0cf56");
    case "Lavender":
      return renderLavender();
    case "Irises":
      return renderIris();
    case "Daisies":
    default:
      return renderDaisy(["#fffdfa", "#f6f1e9", "#ffffff"], "#f1d85c");
  }
}

function bouquetFlowerNames(flowers) {
  const names = flowers.length ? flowers : DEFAULT_BOUQUET;
  return BOUQUET_SPOTS.map((_, index) => names[index % names.length]);
}

function selectedFlowersForData() {
  const flowers = [...state.selected];
  if (state.custom.customFlower && !flowers.includes("Custom Flower")) {
    flowers.push("Custom Flower");
  }

  return flowers;
}

function renderStems(flowerNames) {
  return flowerNames.map((name, index) => {
    const spot = BOUQUET_SPOTS[index];
    const bend = Math.round((spot.x - 200) * .18);
    const width = name === "Lavender" ? 1.8 : 2.2;
    return `<path d="M200,260 Q${200 + bend},${220 + spot.layer * 5} ${spot.x},${spot.y + 22}" stroke="#587850" stroke-width="${width}" fill="none" stroke-linecap="round"/>`;
  }).join("");
}

function renderLeaves() {
  return `
    <g fill="#6a8860" stroke="#4a6840" stroke-width=".5">
      <ellipse cx="150" cy="200" rx="15" ry="6" transform="rotate(-36,150,200)"/>
      <ellipse cx="250" cy="200" rx="15" ry="6" transform="rotate(36,250,200)"/>
      <ellipse cx="158" cy="224" rx="12" ry="5" transform="rotate(-52,158,224)"/>
      <ellipse cx="242" cy="224" rx="12" ry="5" transform="rotate(52,242,224)"/>
      <ellipse cx="173" cy="217" rx="10" ry="4" transform="rotate(-22,173,217)"/>
      <ellipse cx="227" cy="217" rx="10" ry="4" transform="rotate(22,227,217)"/>
    </g>
  `;
}

function renderWrap(wrapColor = DEFAULT_CUSTOM.wrapColor) {
  const base = /^#[0-9a-f]{6}$/i.test(wrapColor) ? wrapColor : DEFAULT_CUSTOM.wrapColor;
  const dark = shiftHex(base, -24);
  const light = shiftHex(base, 24);
  const line = shiftHex(base, 54);
  const rim = shiftHex(base, 12);
  return `
    <polygon points="200,480 58,232 342,232" fill="${base}" stroke="${line}" stroke-width="1"/>
    <polygon points="200,480 58,232 128,232" fill="${dark}"/>
    <polygon points="200,480 342,232 272,232" fill="${light}"/>
    <line x1="200" y1="480" x2="88" y2="272" stroke="${line}" stroke-width=".8" opacity=".58"/>
    <line x1="200" y1="480" x2="312" y2="272" stroke="${line}" stroke-width=".8" opacity=".58"/>
    <line x1="200" y1="480" x2="200" y2="260" stroke="${line}" stroke-width=".6" opacity=".42"/>
    <ellipse cx="200" cy="234" rx="144" ry="14" fill="${rim}" stroke="${line}" stroke-width="1"/>
  `;
}

function renderRibbon() {
  return `
    <g transform="translate(200,250)">
      <path d="M-32,0 Q-44,-13 -54,-9 Q-40,-2 -32,9 Z" fill="#f2cbb0" stroke="#e0b098" stroke-width=".5"/>
      <path d="M32,0 Q44,-13 54,-9 Q40,-2 32,9 Z" fill="#eac3a6" stroke="#d8a888" stroke-width=".5"/>
      <ellipse cx="0" cy="0" rx="22" ry="11" fill="#f6d2b8" stroke="#e2bca0" stroke-width=".5"/>
    </g>
  `;
}

function renderBouquet(container, flowers, customFlower = "", wrapColor = state.custom.wrapColor) {
  const flowerNames = bouquetFlowerNames(flowers);
  const heads = flowerNames.map((name, index) => {
    const spot = BOUQUET_SPOTS[index];
    return `
      <g transform="translate(${spot.x},${spot.y}) scale(${spot.scale})" opacity="${spot.layer === 0 ? ".84" : "1"}">
        ${renderFlowerHead(name, customFlower, `${container.id}-${index}`)}
      </g>
    `;
  }).join("");

  container.innerHTML = `
    <svg class="bouquet-svg" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="bouquet made from selected flowers">
      <g stroke-linecap="round">
        ${renderWrap(wrapColor)}
        <g>${renderStems(flowerNames)}</g>
        ${renderLeaves()}
        ${heads}
        <g fill="#904060" opacity=".58">
          <circle cx="128" cy="222" r="4"/>
          <circle cx="272" cy="220" r="4"/>
          <circle cx="174" cy="173" r="3"/>
          <circle cx="226" cy="170" r="3"/>
        </g>
        ${renderRibbon()}
      </g>
    </svg>
  `;
}

function renderBuilderBouquet() {
  renderBouquet(document.getElementById("builder-bouquet"), selectedFlowersForData(), state.custom.customFlower, state.custom.wrapColor);
}

function buildGrid() {
  const grid = document.getElementById("flowers-grid");

  FLOWERS.forEach((name, index) => {
    const chip = document.createElement("button");
    chip.className = "flower-chip";
    chip.type = "button";
    chip.textContent = name;
    chip.dataset.flower = name;
    chip.id = `flower-${flowerButtonName(name)}`;
    chip.style.animation = `fadeUp .6s ${.26 + index * .026}s ease forwards`;
    chip.style.opacity = "0";

    chip.addEventListener("click", () => {
      if (state.selected.has(name)) {
        state.selected.delete(name);
        chip.classList.remove("selected");
      } else {
        state.selected.add(name);
        chip.classList.add("selected");
      }

      renderBuilderBouquet();
    });

    grid.appendChild(chip);
  });
}

function showError() {
  const error = document.getElementById("error-msg");
  error.textContent = "please fill in both names and pick at least one flower";
  error.classList.add("visible");
  window.setTimeout(() => error.classList.remove("visible"), 3000);
}

function showCustomError(message) {
  const error = document.getElementById("error-msg");
  error.textContent = message;
  error.classList.add("visible");
  window.setTimeout(() => error.classList.remove("visible"), 4600);
}

function letterFont(custom = state.custom) {
  const fonts = {
    serif: '"Cormorant Garamond", serif',
    sans: '"DM Sans", system-ui, sans-serif',
    script: '"Brush Script MT", "Segoe Script", cursive',
    mono: '"Courier New", monospace'
  };

  if (custom.fontChoice === "custom" && custom.customFont.trim()) {
    return custom.customFont.trim();
  }

  return fonts[custom.fontChoice] || fonts.serif;
}

function applyBackground(custom = state.custom) {
  const panels = document.querySelectorAll(".bouquet-panel, .viewer-bouquet-panel");
  panels.forEach((panel) => {
    panel.style.backgroundColor = custom.bgColor || "";
    if (custom.bgImage) {
      panel.style.backgroundImage = `linear-gradient(rgba(0,0,0,.16), rgba(0,0,0,.16)), url("${cssUrl(custom.bgImage)}")`;
      panel.style.backgroundSize = "cover";
      panel.style.backgroundPosition = "center";
    } else {
      panel.style.backgroundImage = "";
      panel.style.backgroundSize = "";
      panel.style.backgroundPosition = "";
    }
  });
}

function applyFont(custom = state.custom) {
  document.body.style.setProperty("--letter-font", letterFont(custom));
}

function applyFrame(custom = state.custom) {
  const frame = document.getElementById("picture-frame");
  const image = document.getElementById("frame-image");
  if (custom.frameEnabled) {
    if (custom.frameImage) {
      image.src = custom.frameImage;
      frame.classList.remove("empty");
    } else {
      image.removeAttribute("src");
      frame.classList.add("empty");
    }
    frame.classList.add("visible");
  } else {
    image.removeAttribute("src");
    frame.classList.remove("visible", "empty");
  }
}

function applyCustomization(custom = state.custom, shouldApplyTheme = false) {
  state.custom = { ...DEFAULT_CUSTOM, ...custom };
  applyBackground(state.custom);
  applyFont(state.custom);
  applyFrame(state.custom);

  if (shouldApplyTheme) {
    setThemeChoice(state.custom.themeChoice || "system", false);
  }
}

function generate() {
  const to = document.getElementById("input-to").value.trim();
  const from = document.getElementById("input-from").value.trim();
  const note = document.getElementById("input-note").value.trim();
  const flowers = selectedFlowersForData();

  if (!to || !from || flowers.length === 0) {
    showError();
    return;
  }

  const data = {
    to,
    from,
    flowers,
    note,
    custom: { ...state.custom }
  };

  const id = saveBouquet(data);
  if (!id) {
    showCustomError("that design is too large to save as a short link. try image URLs or smaller uploads");
    return;
  }
  history.pushState(null, "", `#b/${id}`);
  showViewer(data, true);
}

function showViewer(data, showShare) {
  const viewerPage = document.getElementById("page-viewer");
  document.getElementById("page-builder").classList.remove("active");
  document.body.classList.toggle("recipient-view", !showShare);
  viewerPage.classList.remove("opening", "opened");
  viewerPage.classList.add("active");
  applyCustomization(data.custom || {}, true);
  window.scrollTo(0, 0);

  document.getElementById("v-to").textContent = data.to;
  document.getElementById("envelope-to").textContent = data.to;
  document.getElementById("v-from").textContent = data.from;
  renderBouquet(document.getElementById("viewer-bouquet"), data.flowers || [], state.custom.customFlower, state.custom.wrapColor);

  const bouquetList = document.getElementById("v-bouquet");
  bouquetList.innerHTML = "";
  (data.flowers || []).forEach((name, index) => {
    const tag = document.createElement("div");
    tag.className = "v-bouquet-tag";
    tag.style.animationDelay = `${.32 + index * .07}s`;
    tag.textContent = name;
    bouquetList.appendChild(tag);
  });

  const note = document.getElementById("v-note");
  const divider = document.getElementById("v-divider");
  if (data.note) {
    note.textContent = data.note;
    divider.classList.add("visible");
  } else {
    note.textContent = "";
    divider.classList.remove("visible");
  }

  const shareBox = document.getElementById("share-box");
  const copyButton = document.getElementById("copy-btn");
  copyButton.textContent = "copy link";
  copyButton.classList.remove("copied");
  shareBox.classList.remove("leaving");
  if (showShare) {
    document.getElementById("share-url-display").textContent = location.href;
    shareBox.classList.add("visible");
  } else {
    shareBox.classList.remove("visible");
  }

  spawnPetals(data.flowers || []);
}

function openLetter() {
  const viewerPage = document.getElementById("page-viewer");
  const shareBox = document.getElementById("share-box");

  if (viewerPage.classList.contains("opened") || viewerPage.classList.contains("opening")) {
    return;
  }

  if (shareBox.classList.contains("visible")) {
    shareBox.classList.add("leaving");
    window.setTimeout(() => shareBox.classList.remove("visible", "leaving"), 360);
  }
  viewerPage.classList.add("opening");

  window.setTimeout(() => {
    viewerPage.classList.remove("opening");
    viewerPage.classList.add("opened");
  }, 760);
}

function spawnPetals(flowers) {
  const background = document.getElementById("petals-bg");
  background.innerHTML = "";
  const symbols = (flowers.length ? flowers : DEFAULT_BOUQUET).map((name) => PETALS[name] || "\u{1f338}");

  for (let index = 0; index < 22; index += 1) {
    const petal = document.createElement("div");
    petal.className = "petal";
    petal.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const rotation = `${Math.random() * 44 - 22}deg`;
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.top = `${4 + Math.random() * 88}%`;
    petal.style.setProperty("--r", rotation);
    petal.style.animationDelay = `${(Math.random() * 1.6).toFixed(2)}s, ${(Math.random() * 4).toFixed(2)}s`;
    petal.style.animationDuration = `1s, ${(4 + Math.random() * 5).toFixed(1)}s`;
    petal.style.fontSize = `${15 + Math.random() * 26}px`;

    background.appendChild(petal);
  }
}

function copyLink() {
  navigator.clipboard.writeText(location.href).then(() => {
    const button = document.getElementById("copy-btn");
    button.textContent = "copied";
    button.classList.add("copied");

    window.setTimeout(() => {
      button.textContent = "copy link";
      button.classList.remove("copied");
    }, 2200);
  });
}

function goBack() {
  history.pushState(null, "", location.pathname);
  document.body.classList.remove("recipient-view");
  document.getElementById("page-viewer").classList.remove("active", "opening", "opened");
  document.getElementById("page-builder").classList.add("active");
  window.scrollTo(0, 0);
}

function startOwnBouquet() {
  history.pushState(null, "", location.pathname);
  showBuilder();
  window.scrollTo(0, 0);
}

function resolveTheme(choice) {
  if (choice === "system") {
    return systemThemeQuery.matches ? "dark" : "light";
  }

  return choice;
}

function themeIcon(choice, theme) {
  if (choice === "system") {
    return "\u2606";
  }

  const icons = {
    light: "\u2600",
    dark: "\u263d",
    rose: "\u273f",
    sage: "\u25cc",
    midnight: "\u2726"
  };

  return icons[theme] || "\u2606";
}

function updateThemeButtons(choice) {
  document.querySelectorAll(".theme-choice").forEach((button) => {
    const isPressed = button.dataset.themeChoice === choice;
    button.setAttribute("aria-pressed", String(isPressed));
  });
}

function setThemeChoice(choice, shouldSave = true) {
  const choices = ["system", "light", "dark", "rose", "sage", "midnight"];
  const nextChoice = choices.includes(choice) ? choice : "system";
  const theme = resolveTheme(nextChoice);
  state.themeChoice = nextChoice;
  state.currentTheme = theme;

  document.documentElement.setAttribute("data-theme-mode", nextChoice);
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("theme-btn").textContent = themeIcon(nextChoice, theme);
  updateThemeButtons(nextChoice);
  state.custom.themeChoice = nextChoice;
  const bouquetTheme = document.getElementById("bouquet-theme");
  if (bouquetTheme) {
    bouquetTheme.value = nextChoice;
  }

  if (shouldSave) {
    localStorage.setItem("flowers-theme", nextChoice);
  }
}

function cycleTheme() {
  const choices = ["system", "light", "dark", "rose", "sage", "midnight"];
  const currentIndex = choices.indexOf(state.themeChoice);
  const nextChoice = choices[(currentIndex + 1) % choices.length];
  setThemeChoice(nextChoice);
}

function openSettings() {
  const panel = document.getElementById("settings-panel");
  const overlay = document.getElementById("settings-overlay");
  panel.classList.remove("closing");
  panel.classList.add("open");
  overlay.classList.add("open");
}

function closeSettings() {
  const panel = document.getElementById("settings-panel");
  const overlay = document.getElementById("settings-overlay");
  panel.classList.add("closing");
  overlay.classList.remove("open");

  window.setTimeout(() => {
    panel.classList.remove("open", "closing");
  }, 300);
}

function checkHash() {
  const hash = location.hash.slice(1);
  if (!hash) {
    return false;
  }

  if (hash.startsWith("b/")) {
    const data = loadBouquet(hash.slice(2));
    if (data) {
      showViewer(data, false);
      return true;
    }

    showBuilder();
    return false;
  }

  const data = decode(hash);
  if (data) {
    showViewer(data, false);
    return true;
  }

  return false;
}

function showBuilder() {
  document.body.classList.remove("recipient-view");
  document.getElementById("page-viewer").classList.remove("active", "opening", "opened");
  document.getElementById("page-builder").classList.add("active");
  syncCustomizationControls();
  applyCustomization(state.custom, true);
  renderBuilderBouquet();
}

function previewCustomFlower(src) {
  const preview = document.getElementById("custom-flower-preview");
  if (!src) {
    preview.classList.remove("visible");
    preview.innerHTML = "";
    return;
  }

  preview.classList.add("visible");
  preview.innerHTML = `<img src="${escapeAttr(src)}" alt=""><span>custom flower added to bouquet</span>`;
}

function readCustomizationFromForm() {
  state.custom.bgColor = document.getElementById("bg-color").value;
  state.custom.wrapColor = document.getElementById("wrap-color").value;
  state.custom.bgImage = document.getElementById("bg-image-url").value.trim() || state.custom.bgImage;
  state.custom.frameEnabled = document.getElementById("frame-enabled").checked;
  state.custom.frameImage = document.getElementById("frame-image-url").value.trim() || state.custom.frameImage;
  state.custom.fontChoice = document.getElementById("font-choice").value;
  state.custom.customFont = document.getElementById("custom-font").value.trim();
  state.custom.themeChoice = document.getElementById("bouquet-theme").value;
  applyCustomization(state.custom, true);
  renderBuilderBouquet();
}

function syncCustomizationControls() {
  document.getElementById("bg-color").value = state.custom.bgColor;
  document.getElementById("wrap-color").value = state.custom.wrapColor;
  document.getElementById("bg-image-url").value = state.custom.bgImage.startsWith("data:") ? "" : state.custom.bgImage;
  document.getElementById("frame-enabled").checked = state.custom.frameEnabled;
  document.getElementById("frame-image-url").value = state.custom.frameImage.startsWith("data:") ? "" : state.custom.frameImage;
  document.getElementById("font-choice").value = state.custom.fontChoice;
  document.getElementById("custom-font").value = state.custom.customFont;
  document.getElementById("bouquet-theme").value = state.custom.themeChoice;
  document.getElementById("frame-controls").classList.toggle("visible", state.custom.frameEnabled);
  document.getElementById("custom-font-field").classList.toggle("visible", state.custom.fontChoice === "custom");
  previewCustomFlower(state.custom.customFlower);
}

async function handleImageFile(event, key, urlInputId) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  state.custom[key] = await fileToDataUrl(file);
  document.getElementById(urlInputId).value = "";
  if (key === "customFlower") {
    previewCustomFlower(state.custom.customFlower);
    renderBuilderBouquet();
  } else {
    applyCustomization(state.custom, true);
  }
}

function bindEvents() {
  document.getElementById("theme-btn").addEventListener("click", cycleTheme);
  document.getElementById("settings-btn").addEventListener("click", openSettings);
  document.getElementById("close-settings-btn").addEventListener("click", closeSettings);
  document.getElementById("settings-overlay").addEventListener("click", closeSettings);
  document.querySelectorAll(".theme-choice").forEach((button) => {
    button.addEventListener("click", () => setThemeChoice(button.dataset.themeChoice));
  });
  const handleSystemThemeChange = () => {
    if (state.themeChoice === "system") {
      setThemeChoice("system", false);
    }
  };
  if (systemThemeQuery.addEventListener) {
    systemThemeQuery.addEventListener("change", handleSystemThemeChange);
  } else {
    systemThemeQuery.addListener(handleSystemThemeChange);
  }
  document.getElementById("generate-btn").addEventListener("click", generate);
  document.getElementById("back-btn").addEventListener("click", goBack);
  document.getElementById("copy-btn").addEventListener("click", copyLink);
  document.getElementById("open-letter-btn").addEventListener("click", openLetter);
  document.getElementById("recipient-cta").addEventListener("click", startOwnBouquet);
  document.getElementById("bg-color").addEventListener("input", readCustomizationFromForm);
  document.getElementById("wrap-color").addEventListener("input", readCustomizationFromForm);
  document.getElementById("bouquet-theme").addEventListener("change", readCustomizationFromForm);
  document.getElementById("font-choice").addEventListener("change", () => {
    document.getElementById("custom-font-field").classList.toggle("visible", document.getElementById("font-choice").value === "custom");
    readCustomizationFromForm();
  });
  document.getElementById("custom-font").addEventListener("input", readCustomizationFromForm);
  document.getElementById("frame-enabled").addEventListener("change", () => {
    document.getElementById("frame-controls").classList.toggle("visible", document.getElementById("frame-enabled").checked);
    readCustomizationFromForm();
  });
  document.getElementById("bg-image-url").addEventListener("input", (event) => {
    state.custom.bgImage = event.target.value.trim();
    applyCustomization(state.custom, true);
  });
  document.getElementById("frame-image-url").addEventListener("input", (event) => {
    state.custom.frameImage = event.target.value.trim();
    applyCustomization(state.custom, true);
  });
  document.getElementById("custom-flower-url").addEventListener("input", (event) => {
    state.custom.customFlower = event.target.value.trim();
    previewCustomFlower(state.custom.customFlower);
    renderBuilderBouquet();
  });
  document.getElementById("custom-flower-file").addEventListener("change", (event) => handleImageFile(event, "customFlower", "custom-flower-url"));
  document.getElementById("bg-image-file").addEventListener("change", (event) => handleImageFile(event, "bgImage", "bg-image-url"));
  document.getElementById("frame-image-file").addEventListener("change", (event) => handleImageFile(event, "frameImage", "frame-image-url"));
  window.addEventListener("hashchange", () => {
    if (!checkHash()) {
      showBuilder();
    }
  });
}

function init() {
  buildGrid();
  bindEvents();
  syncCustomizationControls();
  applyCustomization(state.custom, false);
  renderBuilderBouquet();
  setThemeChoice(localStorage.getItem("flowers-theme") || "system", false);

  checkHash();
}

init();
