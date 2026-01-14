// extension/src/content/content.js

(function () {
  const WIDGET_ID = "project3o-widget";
  const STORAGE_KEY = "p3o_active_session";

  const TOKEN_KEY = "p3o_auth_token";
  const API_BASE = "http://localhost:4000";

  // inject only once
  if (document.getElementById(WIDGET_ID)) return;

  const getCodeforcesProblemData = window.Project3O?.getCodeforcesProblemData;
  if (!getCodeforcesProblemData) return;

  const data = getCodeforcesProblemData();
  if (!data || !data.problemKey) return;

  // ------------------ Token Helpers ------------------
  async function getToken() {
    const obj = await chrome.storage.local.get(TOKEN_KEY);
    return obj?.[TOKEN_KEY] || null;
  }

  async function setToken(token) {
    await chrome.storage.local.set({ [TOKEN_KEY]: token });
  }

  // ------------------ UI ------------------
  const root = document.createElement("div");
  root.id = WIDGET_ID;

  root.innerHTML = `
    <div class="p3o-card">
      <div class="p3o-title">project-3o</div>

      <div class="p3o-problem" title="${escapeHtml(data.title)}">
        ${escapeHtml(data.title)}
      </div>

      <div class="p3o-muted" title="${escapeHtml(data.problemKey)}">
        ${escapeHtml(data.problemKey)}
      </div>

      <div class="p3o-timer" id="p3o-timer">00:00</div>

      <div class="p3o-actions">
        <button class="p3o-btn" id="p3o-start">Start</button>
        <button class="p3o-btn" id="p3o-pause">Pause</button>
        <button class="p3o-btn" id="p3o-resume">Resume</button>
        <button class="p3o-btn" id="p3o-done">Done</button>
      </div>

      <div class="p3o-actions" style="margin-top: 8px;">
        <button class="p3o-btn" id="p3o-set-token">Set Token</button>
      </div>

      <div class="p3o-muted" id="p3o-status"></div>
    </div>
  `;

  document.body.appendChild(root);

  const timerEl = document.getElementById("p3o-timer");
  const statusEl = document.getElementById("p3o-status");

  const btnStart = document.getElementById("p3o-start");
  const btnPause = document.getElementById("p3o-pause");
  const btnResume = document.getElementById("p3o-resume");
  const btnDone = document.getElementById("p3o-done");
  const btnSetToken = document.getElementById("p3o-set-token");

  // ------------------ State ------------------
  let isRunning = false;
  let lastStartTime = null; // ms timestamp
  let elapsedSeconds = 0;

  // stored once (not reset on pause/resume)
  let startedAtISO = null;

  // prevent double clicks
  let isSaving = false;

  // ------------------ Helpers ------------------
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function nowShownSeconds() {
    let shown = elapsedSeconds;
    if (isRunning && lastStartTime) {
      shown += (Date.now() - lastStartTime) / 1000;
    }
    return shown;
  }

  function setStatus(msg) {
    statusEl.textContent = msg || "";
  }

  function render() {
    timerEl.textContent = fmt(nowShownSeconds());

    btnStart.disabled = isRunning || elapsedSeconds > 0 || isSaving;
    btnPause.disabled = !isRunning || isSaving;
    btnResume.disabled = isRunning || elapsedSeconds === 0 || isSaving;
    btnDone.disabled = (elapsedSeconds === 0 && !isRunning) || isSaving;
    btnSetToken.disabled = isSaving;

    if (isSaving) {
      setStatus("Saving...");
      return;
    }

    if (isRunning) setStatus("Running...");
    else if (elapsedSeconds > 0) setStatus("Paused");
    else setStatus("Not started");
  }

  // ------------------ Storage ------------------
  async function saveToStorage() {
    const payload = {
      platform: data.platform,
      problemKey: data.problemKey,
      title: data.title,
      url: data.url,

      isRunning,
      lastStartTime,
      elapsedSeconds,

      startedAt: startedAtISO,
      updatedAt: new Date().toISOString(),
    };

    await chrome.storage.local.set({ [STORAGE_KEY]: payload });
  }

  async function clearStorage() {
    await chrome.storage.local.remove(STORAGE_KEY);
  }

  async function loadFromStorage() {
    const obj = await chrome.storage.local.get(STORAGE_KEY);
    const saved = obj?.[STORAGE_KEY];

    if (!saved) return;

    // restore only if same problem
    if (saved.problemKey !== data.problemKey) return;

    isRunning = !!saved.isRunning;
    elapsedSeconds = Number(saved.elapsedSeconds || 0);
    lastStartTime = saved.lastStartTime ?? null;
    startedAtISO = saved.startedAt || null;

    // safety
    if (isRunning && !lastStartTime) {
      isRunning = false;
    }

    setStatus("Restored previous session");
  }

  // ------------------ Timer Actions ------------------
  async function start() {
    if (isRunning) return;

    isRunning = true;
    elapsedSeconds = 0;
    lastStartTime = Date.now();
    startedAtISO = new Date().toISOString();

    await saveToStorage();
    render();
  }

  async function pause() {
    if (!isRunning) return;

    elapsedSeconds += (Date.now() - lastStartTime) / 1000;
    isRunning = false;
    lastStartTime = null;

    await saveToStorage();
    render();
  }

  async function resume() {
    if (isRunning || elapsedSeconds === 0) return;

    isRunning = true;
    lastStartTime = Date.now();

    await saveToStorage();
    render();
  }

  // ------------------ Backend API save ------------------
  async function saveSessionToBackend() {
    const token = await getToken();
    if (!token) {
      alert("Token not found. Click Set Token first.");
      return false;
    }

    const endedAtISO = new Date().toISOString();
    const total = Math.floor(elapsedSeconds);

    const payload = {
      platform: data.platform,
      problemKey: data.problemKey,
      title: data.title,
      url: data.url,

      // later we fetch tags/rating from CF API; keep empty now
      tags: [],
      rating: null,

      session: {
        startedAt: startedAtISO || endedAtISO,
        endedAt: endedAtISO,
        durationSeconds: total,
        state: "done",
        notes: "",
      },
    };

    const res = await fetch(`${API_BASE}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    let json = {};
    try {
      json = await res.json();
    } catch (e) {}

    if (!res.ok) {
      alert(`Save failed: ${json.message || "Unknown error"}`);
      return false;
    }

    return true;
  }

  async function done() {
    if (isSaving) return;

    // stop properly
    if (isRunning && lastStartTime) {
      elapsedSeconds += (Date.now() - lastStartTime) / 1000;
      isRunning = false;
      lastStartTime = null;
    }

    if (elapsedSeconds <= 0) return;

    isSaving = true;
    render();

    try {
      // save current state before API call (safety)
      await saveToStorage();

      const ok = await saveSessionToBackend();
      if (!ok) {
        isSaving = false;
        render();
        return; // IMPORTANT: keep storage so session isn't lost
      }

      // clear active session only after success
      await clearStorage();

      // reset local state
      isRunning = false;
      lastStartTime = null;
      elapsedSeconds = 0;
      startedAtISO = null;

      isSaving = false;
      setStatus("Saved");
      render();
    } catch (err) {
      isSaving = false;
      render();
      alert("Network error while saving session");
    }
  }

  // ------------------ Token UI ------------------
  btnSetToken.addEventListener("click", async () => {
    const token = prompt("Paste JWT token:");
    if (!token) return;
    await setToken(token.trim());
    alert("Token saved");
  });

  // ------------------ Events ------------------
  btnStart.addEventListener("click", start);
  btnPause.addEventListener("click", pause);
  btnResume.addEventListener("click", resume);
  btnDone.addEventListener("click", done);

  // auto-save periodically so reload never loses time
  setInterval(async () => {
    if (!isSaving && (isRunning || elapsedSeconds > 0)) {
      await saveToStorage();
    }
    render();
  }, 1000);

  // init
  (async function init() {
    await loadFromStorage();
    render();
  })();

  // ------------------ helpers ------------------
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
