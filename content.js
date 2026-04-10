/**
 * Wiki Refined — Content Script
 * Injects custom TOC, topbar, progress bar, and manages scroll-based features
 */

(function () {
  "use strict";

  // Only run on article pages
  const bodyContent = document.getElementById("mw-content-text");
  if (!bodyContent) return;

  // ── State ──────────────────────────────────────────────────
  let isEnabled = true;
  const STORAGE_KEY = "wr-enabled";
  let scrollController = null;
  let spaObserver = null;
  let currentArticleTitle = "";

  // ── Init ───────────────────────────────────────────────────
  chrome.storage.sync.get([STORAGE_KEY, "wr-font-size", "wr-content-width"], (result) => {
    isEnabled = result[STORAGE_KEY] !== false; // default: enabled
    if (isEnabled) {
      // Apply custom settings before activating
      if (result["wr-font-size"]) {
        document.documentElement.style.setProperty("--wr-body-size", result["wr-font-size"] + "px");
      }
      if (result["wr-content-width"]) {
        document.documentElement.style.setProperty("--wr-content-max-width", result["wr-content-width"] + "px");
      }
      activate();
    }
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]) {
      isEnabled = changes[STORAGE_KEY].newValue !== false;
      isEnabled ? activate() : deactivate();
    }
    if (changes["wr-font-size"]) {
      document.documentElement.style.setProperty("--wr-body-size", changes["wr-font-size"].newValue + "px");
    }
    if (changes["wr-content-width"]) {
      document.documentElement.style.setProperty("--wr-content-max-width", changes["wr-content-width"].newValue + "px");
    }
  });

  // ── Activate / Deactivate ─────────────────────────────────
  function activate() {
    if (scrollController) scrollController.abort();
    scrollController = new AbortController();

    document.body.classList.add("wr-active");
    buildTopbar();
    buildTOC();
    buildProgressBar();
    setupScrollTracking();
    setupSPADetection();
    currentArticleTitle = getArticleTitle();
  }

  function deactivate() {
    if (scrollController) {
      scrollController.abort();
      scrollController = null;
    }
    if (spaObserver) {
      spaObserver.disconnect();
      spaObserver = null;
    }
    document.body.classList.remove("wr-active");
    removeElement(".wr-toc");
    removeElement(".wr-topbar");
    removeElement(".wr-progress");
  }

  function removeElement(selector) {
    const el = document.querySelector(selector);
    if (el) el.remove();
  }

  // ── Article title ─────────────────────────────────────────
  function getArticleTitle() {
    const heading = document.querySelector(".mw-first-heading");
    return heading ? heading.textContent.trim() : document.title.replace(/ - Wikipedia$/, "");
  }

  // ── Top Bar ───────────────────────────────────────────────
  function buildTopbar() {
    if (document.querySelector(".wr-topbar")) return;

    const bar = document.createElement("div");
    bar.className = "wr-topbar";
    bar.innerHTML = `
      <div class="wr-topbar-left">
        <div class="wr-topbar-logo">Wiki<span>Refined</span></div>
        <div class="wr-topbar-article-title">${escapeHtml(getArticleTitle())}</div>
      </div>
      <div class="wr-topbar-right">
        <button class="wr-topbar-btn" id="wr-btn-original" title="View original Wikipedia page">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Original
        </button>
        <button class="wr-topbar-btn" id="wr-btn-toggle" title="Toggle Wiki Refined">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          Disable
        </button>
      </div>
    `;

    document.body.prepend(bar);

    // "Original" button — opens in new tab without extension
    document.getElementById("wr-btn-original").addEventListener("click", () => {
      window.open(window.location.href, "_blank");
    });

    // Toggle button
    document.getElementById("wr-btn-toggle").addEventListener("click", () => {
      chrome.storage.sync.set({ [STORAGE_KEY]: false });
    });
  }

  // ── Reading Progress Bar ──────────────────────────────────
  function buildProgressBar() {
    if (document.querySelector(".wr-progress")) return;

    const bar = document.createElement("div");
    bar.className = "wr-progress";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", "Reading progress");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", "0");
    document.body.prepend(bar);
  }

  function updateProgress() {
    const bar = document.querySelector(".wr-progress");
    if (!bar) return;

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      bar.style.transform = "scaleX(1)";
      bar.setAttribute("aria-valuenow", "100");
      return;
    }
    const pct = Math.min(100, (window.scrollY / docHeight) * 100);
    bar.style.transform = `scaleX(${pct / 100})`;
    bar.setAttribute("aria-valuenow", Math.round(pct));
  }

  // ── Table of Contents ─────────────────────────────────────
  function buildTOC() {
    if (document.querySelector(".wr-toc")) return;

    const headings = Array.from(
      document.querySelectorAll(".mw-parser-output h2, .mw-parser-output h3, .mw-parser-output h4"),
    ).filter((h) => {
      // Skip headings in collapsed boxes, navboxes, infoboxes, etc.
      if (h.closest(".navbox, .mw-collapsible, .reflist, .references, .infobox, .sidebar, .metadata")) return false;
      // Must be a direct child of mw-parser-output or inside mw-heading div (new Wikipedia)
      const parent = h.parentElement;
      const grandparent = parent?.parentElement;
      const isDirectChild = parent?.classList.contains("mw-parser-output");
      const isInHeadingDiv =
        parent?.classList.contains("mw-heading") && grandparent?.classList.contains("mw-parser-output");
      if (!isDirectChild && !isInHeadingDiv) return false;
      // Skip empty headings
      const text = getHeadingText(h);
      return text.length > 0;
    });

    if (headings.length < 3) return; // Not worth showing TOC for very short articles

    const toc = document.createElement("nav");
    toc.className = "wr-toc";
    toc.setAttribute("aria-label", "Table of Contents");

    // Detect language for TOC title
    const lang = document.documentElement.lang || "en";
    const tocTitles = { en: "Contents", ru: "Содержание", uk: "Зміст", de: "Inhalt", fr: "Sommaire", es: "Contenido" };
    const tocTitle = tocTitles[lang] || tocTitles.en;

    let html = `<div class="wr-toc-title">${tocTitle}</div><ul>`;

    headings.forEach((heading, i) => {
      const text = getHeadingText(heading);
      const level = heading.tagName.toLowerCase();
      const id = heading.id || heading.querySelector(".mw-headline")?.id || `wr-heading-${i}`;

      // Ensure heading has an ID for scrolling
      if (!heading.id && !heading.querySelector("[id]")) {
        heading.id = `wr-heading-${i}`;
      }

      const targetId = heading.id || heading.querySelector("[id]")?.id || `wr-heading-${i}`;

      html += `<li><a href="#${targetId}" class="wr-toc-${level}" data-wr-target="${targetId}">${escapeHtml(text)}</a></li>`;
    });

    html += "</ul>";
    toc.innerHTML = html;

    document.body.appendChild(toc);

    // Smooth scroll on click
    toc.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-wr-target]");
      if (!link) return;
      e.preventDefault();

      const targetId = link.getAttribute("data-wr-target");
      const target = document.getElementById(targetId);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  }

  function getHeadingText(heading) {
    // Try .mw-headline first (old Wikipedia), then the heading's own text
    const headline = heading.querySelector(".mw-headline");
    if (headline) return headline.textContent.trim();

    // For newer Wikipedia, clone and remove edit buttons
    const clone = heading.cloneNode(true);
    clone.querySelectorAll(".mw-editsection").forEach((el) => el.remove());
    return clone.textContent.trim();
  }

  // ── SPA Navigation Detection ───────────────────────────────
  function rebuildForNewArticle() {
    removeElement(".wr-toc");
    removeElement(".wr-topbar");
    removeElement(".wr-progress");

    if (isEnabled) {
      buildTopbar();
      buildTOC();
      buildProgressBar();
      updateProgress();
    }
  }

  function setupSPADetection() {
    if (spaObserver) spaObserver.disconnect();

    const contentNode = document.getElementById("mw-content-text");
    if (!contentNode) return;

    let debounceTimer = null;
    spaObserver = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const newTitle = getArticleTitle();
        if (newTitle !== currentArticleTitle) {
          currentArticleTitle = newTitle;
          rebuildForNewArticle();
        }
      }, 150);
    });

    spaObserver.observe(contentNode, { childList: true });

    window.addEventListener("popstate", () => {
      setTimeout(() => {
        const newTitle = getArticleTitle();
        if (newTitle !== currentArticleTitle) {
          currentArticleTitle = newTitle;
          rebuildForNewArticle();
        }
      }, 200);
    }, { signal: scrollController.signal });
  }

  // ── Scroll Tracking ───────────────────────────────────────
  function setupScrollTracking() {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            updateProgress();
            updateActiveTOC();
            updateTopbarTitle();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true, signal: scrollController.signal },
    );
  }

  function updateActiveTOC() {
    const links = document.querySelectorAll(".wr-toc a[data-wr-target]");
    if (!links.length) return;

    let activeId = null;
    const scrollY = window.scrollY + 80; // offset for topbar

    // Walk backwards to find the current heading
    for (let i = links.length - 1; i >= 0; i--) {
      const targetId = links[i].getAttribute("data-wr-target");
      const target = document.getElementById(targetId);
      if (target && target.getBoundingClientRect().top + window.scrollY <= scrollY) {
        activeId = targetId;
        break;
      }
    }

    links.forEach((link) => {
      if (link.getAttribute("data-wr-target") === activeId) {
        link.classList.add("wr-toc-active");
        // Scroll TOC to keep active item visible
        const toc = document.querySelector(".wr-toc");
        if (toc) {
          const linkTop = link.offsetTop;
          const tocScroll = toc.scrollTop;
          const tocHeight = toc.clientHeight;
          if (linkTop < tocScroll + 60 || linkTop > tocScroll + tocHeight - 60) {
            toc.scrollTo({ top: linkTop - tocHeight / 3, behavior: "smooth" });
          }
        }
      } else {
        link.classList.remove("wr-toc-active");
      }
    });
  }

  function updateTopbarTitle() {
    const titleEl = document.querySelector(".wr-topbar-article-title");
    if (!titleEl) return;

    const heading = document.querySelector(".mw-first-heading");
    if (!heading) return;

    const headingBottom = heading.getBoundingClientRect().bottom;
    titleEl.classList.toggle("wr-visible", headingBottom < 0);
  }

  // ── Utilities ─────────────────────────────────────────────
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
})();
