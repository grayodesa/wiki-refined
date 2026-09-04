/**
 * Wiki Refined — Popup Script
 */

const KEYS = {
  enabled: 'wr-enabled',
  fontSize: 'wr-font-size',
  contentWidth: 'wr-content-width',
};

const DEFAULTS = {
  enabled: true,
  fontSize: 18,
  contentWidth: 740,
};

// ── Load saved settings ─────────────────────────────────────
chrome.storage.sync.get(Object.values(KEYS), (result) => {
  const enabled = result[KEYS.enabled] !== false;
  const fontSize = result[KEYS.fontSize] || DEFAULTS.fontSize;
  const contentWidth = result[KEYS.contentWidth] || DEFAULTS.contentWidth;

  document.getElementById('toggle-enabled').checked = enabled;
  document.getElementById('font-size-display').textContent = fontSize + 'px';

  document.querySelectorAll('.width-btn').forEach((btn) => {
    const isActive = parseInt(btn.dataset.width) === contentWidth;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
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

    document.querySelectorAll('.width-btn').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
  });
});

// Settings reach open Wikipedia tabs through chrome.storage.onChanged in content.js —
// every tab, not just the active one — so no scripting/activeTab permission is needed.

