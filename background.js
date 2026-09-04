/**
 * Wiki Refined — Background Service Worker
 * Only job: turn keyboard commands (manifest "commands") into actions.
 *
 * - toggle-enabled: flips wr-enabled in chrome.storage.sync; every open
 *   Wikipedia tab reacts through its storage.onChanged listener.
 * - toggle-toc: tells the content script in the active tab to toggle the TOC.
 *   tabs.sendMessage needs no "tabs" permission; without it this worker cannot
 *   see tab URLs or titles, and it never asks for them.
 */

const ENABLED_KEY = "wr-enabled";

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-enabled") {
    chrome.storage.sync.get([ENABLED_KEY], (result) => {
      chrome.storage.sync.set({ [ENABLED_KEY]: result[ENABLED_KEY] === false });
    });
    return;
  }

  if (command === "toggle-toc") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId === undefined) return;
      // Rejects when the active tab has no content script (not a Wikipedia article) — ignore.
      chrome.tabs.sendMessage(tabId, { type: "wr-toggle-toc" }).catch(() => {});
    });
  }
});
