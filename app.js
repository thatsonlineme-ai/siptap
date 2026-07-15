const STORAGE_KEY = "siptap-v1";

const defaults = {
  settings: {
    goalMl: 2500,
    bottles: [
      { id: "home", name: "Home bottle", ml: 700 },
      { id: "travel", name: "Travel bottle", ml: 500 },
    ],
  },
  days: {},
};

const dom = {
  todayMl: document.getElementById("todayMl"),
  todayLitres: document.getElementById("todayLitres"),
  goalLitres: document.getElementById("goalLitres"),
  waterFill: document.getElementById("waterFill"),
  percentText: document.getElementById("percentText"),
  bottleButtons: document.getElementById("bottleButtons"),
  undoBtn: document.getElementById("undoBtn"),
  resetBtn: document.getElementById("resetBtn"),
  tapCount: document.getElementById("tapCount"),
  history: document.getElementById("history"),
  avg7: document.getElementById("avg7"),
  goalDays: document.getElementById("goalDays"),
  settingsBtn: document.getElementById("settingsBtn"),
  settingsDialog: document.getElementById("settingsDialog"),
  goalInput: document.getElementById("goalInput"),
  b1Name: document.getElementById("b1Name"),
  b1Ml: document.getElementById("b1Ml"),
  b2Name: document.getElementById("b2Name"),
  b2Ml: document.getElementById("b2Ml"),
  saveSettingsBtn: document.getElementById("saveSettings"),
  toast: document.getElementById("toast"),
};

let state = loadState();

function cloneDefaults() {
  return structuredClone(defaults);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved || cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function dayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayEntries() {
  return state.days[dayKey()] || [];
}

function todayTotalMl() {
  return todayEntries().reduce((sum, entry) => sum + Number(entry.ml), 0);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  clearTimeout(window.siptapToastTimer);
  window.siptapToastTimer = setTimeout(() => {
    dom.toast.classList.remove("show");
  }, 1800);
}

function logBottle(bottleId, source = "button") {
  const bottle = state.settings.bottles.find((item) => item.id === bottleId);

  if (!bottle) {
    showToast("Bottle not found");
    return;
  }

  state.days[dayKey()] ??= [];
  state.days[dayKey()].push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    bottleId: bottle.id,
    name: bottle.name,
    ml: Number(bottle.ml),
    at: new Date().toISOString(),
    source,
  });

  saveState();
  render();
  showToast(`+${bottle.ml} mL - ${bottle.name}`);

  if (navigator.vibrate) {
    navigator.vibrate(35);
  }
}

function undoLastEntry() {
  if (!todayEntries().length) {
    showToast("Nothing to undo");
    return;
  }

  todayEntries().pop();
  saveState();
  render();
  showToast("Last entry removed");
}

function resetToday() {
  if (!todayEntries().length) {
    showToast("Nothing to reset");
    return;
  }

  if (!confirm("Reset all water entries for today?")) {
    return;
  }

  state.days[dayKey()] = [];
  saveState();
  render();
  showToast("Today reset");
}

function renderBottleButtons() {
  dom.bottleButtons.innerHTML = "";

  state.settings.bottles.forEach((bottle) => {
    const button = document.createElement("button");
    button.className = "bottle-action";
    button.innerHTML = `<strong>${escapeHtml(bottle.name)}</strong><span>+${Number(bottle.ml).toLocaleString()} mL</span>`;
    button.addEventListener("click", () => logBottle(bottle.id));
    dom.bottleButtons.appendChild(button);
  });
}

function renderHistory() {
  const entries = [...todayEntries()].reverse();

  dom.tapCount.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  dom.history.className = entries.length ? "history" : "history empty";
  dom.history.innerHTML = entries.length
    ? entries.map((entry) => {
      const time = new Date(entry.at).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      return `<div class="history-row"><strong>${escapeHtml(entry.name)} - ${Number(entry.ml).toLocaleString()} mL</strong><span>${time}</span></div>`;
    }).join("")
    : "No water logged yet.";
}

function renderSevenDayStats() {
  const goalMl = Number(state.settings.goalMl);
  let sevenDayTotal = 0;
  let goalDays = 0;

  for (let index = 0; index < 7; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);

    const totalForDay = (state.days[dayKey(date)] || [])
      .reduce((sum, entry) => sum + Number(entry.ml), 0);

    sevenDayTotal += totalForDay;

    if (totalForDay >= goalMl) {
      goalDays += 1;
    }
  }

  dom.avg7.textContent = `${(sevenDayTotal / 7 / 1000).toFixed(1)} L`;
  dom.goalDays.textContent = `${goalDays} / 7`;
}

function render() {
  const totalMl = todayTotalMl();
  const goalMl = Number(state.settings.goalMl);
  const progressPercent = Math.min(100, Math.round((totalMl / goalMl) * 100));

  dom.todayMl.textContent = totalMl.toLocaleString();
  dom.todayLitres.textContent = (totalMl / 1000).toFixed(1);
  dom.goalLitres.textContent = (goalMl / 1000).toFixed(1);
  dom.waterFill.style.height = `${progressPercent}%`;
  dom.percentText.textContent = `${progressPercent}%`;

  renderBottleButtons();
  renderHistory();
  renderSevenDayStats();
}

function openSettings() {
  const [firstBottle, secondBottle] = state.settings.bottles;

  dom.goalInput.value = state.settings.goalMl;
  dom.b1Name.value = firstBottle.name;
  dom.b1Ml.value = firstBottle.ml;
  dom.b2Name.value = secondBottle.name;
  dom.b2Ml.value = secondBottle.ml;
  dom.settingsDialog.showModal();
}

function saveSettings(event) {
  event.preventDefault();

  state.settings = {
    goalMl: Math.max(250, Number(dom.goalInput.value) || defaults.settings.goalMl),
    bottles: [
      {
        id: "home",
        name: dom.b1Name.value.trim() || defaults.settings.bottles[0].name,
        ml: Math.max(50, Number(dom.b1Ml.value) || defaults.settings.bottles[0].ml),
      },
      {
        id: "travel",
        name: dom.b2Name.value.trim() || defaults.settings.bottles[1].name,
        ml: Math.max(50, Number(dom.b2Ml.value) || defaults.settings.bottles[1].ml),
      },
    ],
  };

  saveState();
  render();
  dom.settingsDialog.close();
  showToast("Settings saved");
}

function handleUrlLogging() {
  const params = new URLSearchParams(location.search);
  const bottleId = params.get("log");
  const runId = params.get("run");

  if (!bottleId || !runId) {
    return;
  }

  const sessionKey = `run-${runId}`;

  if (sessionStorage.getItem(sessionKey)) {
    history.replaceState({}, "", location.pathname);
    return;
  }

  sessionStorage.setItem(sessionKey, "1");
  logBottle(bottleId, "nfc");
  history.replaceState({}, "", location.pathname);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js");
    });
  }
}

dom.undoBtn.addEventListener("click", undoLastEntry);
dom.resetBtn.addEventListener("click", resetToday);
dom.settingsBtn.addEventListener("click", openSettings);
dom.saveSettingsBtn.addEventListener("click", saveSettings);

registerServiceWorker();
render();
handleUrlLogging();
