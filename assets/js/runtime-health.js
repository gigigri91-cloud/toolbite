(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__tbRuntimeHealthInit) return;
  window.__tbRuntimeHealthInit = true;

  function warn(code, details) {
    console.warn("[ToolBite runtime health]", code, details || "");
  }

  function has(id) {
    return !!document.getElementById(id);
  }

  function countScript(pathname) {
    return document.querySelectorAll('script[src="' + pathname + '"]').length;
  }

  function validateCookieContract() {
    var ids = [
      "cookie-consent-banner",
      "cookie-preferences-modal",
      "cookie-accept-btn",
      "cookie-manage-btn",
      "cookie-modal-close",
      "cookie-save-preferences",
      "cookie-analytics-toggle",
      "cookie-advertising-toggle"
    ];
    var missing = ids.filter(function (id) { return !has(id); });
    if (missing.length) warn("cookie-contract-missing", missing.join(", "));
  }

  function validateSearchOverlay() {
    if (!has("search-input")) return;
    if (!has("search-overlay")) warn("search-overlay-missing", "search-input exists without search overlay");
  }

  function validateThemeToggle() {
    if (!has("theme-toggle")) {
      warn("theme-toggle-missing");
      return;
    }
    var theme = document.documentElement.getAttribute("data-theme");
    if (theme !== "dark" && theme !== "light") {
      warn("theme-attribute-invalid", theme || "(empty)");
    }
  }

  function validateCriticalHooks() {
    var critical = ["mobile-menu-button", "mobile-menu", "theme-toggle"];
    var missing = critical.filter(function (id) { return !has(id); });
    if (missing.length) warn("critical-dom-missing", missing.join(", "));
  }

  function validateToolScriptAttach() {
    if (!window.location.pathname.startsWith("/tools/")) return;
    var scripts = document.querySelectorAll('script[src^="/assets/js/tools/"]');
    if (!scripts.length) warn("tool-script-missing", window.location.pathname);
    if (scripts.length > 1) warn("tool-script-duplicate", scripts.length);
  }

  function validateDuplicateCoreListeners() {
    var coreCount = countScript("/assets/js/core.js");
    if (coreCount > 1) warn("core-script-duplicate", coreCount);
    var cookieCount = countScript("/assets/js/cookies.js");
    if (cookieCount > 1) warn("cookie-script-duplicate", cookieCount);
    var searchCount = countScript("/assets/js/search.js");
    if (searchCount > 1) warn("search-script-duplicate", searchCount);
  }

  function validateAdContainers() {
    var slots = document.querySelectorAll("ins.adsbygoogle");
    slots.forEach(function (slot) {
      if (!slot.hasAttribute("data-ad-slot")) return;
      var value = slot.getAttribute("data-ad-slot");
      if (!value || !String(value).trim()) {
        warn("ad-slot-empty", window.location.pathname);
      }
    });
  }

  try {
    validateCookieContract();
    validateSearchOverlay();
    validateThemeToggle();
    validateCriticalHooks();
    validateToolScriptAttach();
    validateDuplicateCoreListeners();
    validateAdContainers();
  } catch (_) {
    // Non-invasive health checks must never break runtime.
  }
})();
