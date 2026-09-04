/**
 * Wiki Refined — Popup Script
 */

const KEYS = {
  enabled: 'wr-enabled',
  fontSize: 'wr-font-size',
  contentWidth: 'wr-content-width',
  theme: 'wr-theme',
};

const DEFAULTS = {
  enabled: true,
  fontSize: 18,
  contentWidth: 740,
  theme: 'auto',
};

function setPressed(buttons, isActive) {
  buttons.forEach((btn) => {
    const active = isActive(btn);
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

// ── Load saved settings ─────────────────────────────────────
chrome.storage.sync.get(Object.values(KEYS), (result) => {
  const enabled = result[KEYS.enabled] !== false;
  const fontSize = result[KEYS.fontSize] || DEFAULTS.fontSize;
  const contentWidth = result[KEYS.contentWidth] || DEFAULTS.contentWidth;
  const theme = result[KEYS.theme] || DEFAULTS.theme;

  document.getElementById('toggle-enabled').checked = enabled;
  document.getElementById('font-size-display').textContent = fontSize + 'px';

  setPressed(document.querySelectorAll('.width-btn'), (btn) => parseInt(btn.dataset.width) === contentWidth);
  setPressed(document.querySelectorAll('.theme-btn'), (btn) => btn.dataset.theme === theme);
});

// ── Toggle enabled ──────────────────────────────────────────
document.getElementById('toggle-enabled').addEventListener('change', (e) => {
  chrome.storage.sync.set({ [KEYS.enabled]: e.target.checked });
});

// ── Font size ───────────────────────────────────────────────
document.getElementById('font-decrease').addEventListener('click', () => changeFontSize(-1));
document.getElementById('font-increase').addEventListener('click', () => changeFontSize(1));

function changeFontSize(delta) {
  chrome.storage.sync.get([KEYS.fontSize], (result) => {
    const current = result[KEYS.fontSize] || DEFAULTS.fontSize;
    const next = Math.max(13, Math.min(23, current + delta));
    chrome.storage.sync.set({ [KEYS.fontSize]: next });
    document.getElementById('font-size-display').textContent = next + 'px';
  });
}

// ── Content width ───────────────────────────────────────────
document.querySelectorAll('.width-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const width = parseInt(btn.dataset.width);
    chrome.storage.sync.set({ [KEYS.contentWidth]: width });
    setPressed(document.querySelectorAll('.width-btn'), (b) => b === btn);
  });
});

// ── Theme ───────────────────────────────────────────────────
document.querySelectorAll('.theme-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    chrome.storage.sync.set({ [KEYS.theme]: btn.dataset.theme });
    setPressed(document.querySelectorAll('.theme-btn'), (b) => b === btn);
  });
});

// Settings reach open Wikipedia tabs through chrome.storage.onChanged in content.js —
// every tab, not just the active one — so no scripting/activeTab permission is needed.

