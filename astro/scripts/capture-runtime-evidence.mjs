import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ASTRO_ROOT = process.cwd();
const REPO_ROOT = path.resolve(ASTRO_ROOT, "..");
const OUT_DIR = path.join(REPO_ROOT, "reports", "runtime-health");

function parseArgs() {
  const defaults = {
    baseUrl: process.env.RUNTIME_EVIDENCE_BASE_URL || "http://127.0.0.1:4321",
    pages: ["/", "/search.html", "/tools/word-counter.html"],
    timeoutMs: 15000
  };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--base-url=")) defaults.baseUrl = arg.replace("--base-url=", "").trim();
    if (arg.startsWith("--pages=")) {
      defaults.pages = arg
        .replace("--pages=", "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }
  return defaults;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function collectForPage(page, urlPath) {
  const warnings = [];
  page.on("console", (msg) => {
    if (msg.type() !== "warning") return;
    const text = msg.text();
    if (text.includes("[ToolBite runtime health]")) warnings.push(text);
  });

  await page.goto(urlPath, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(350);

  const result = await page.evaluate(() => {
    const cookieIds = [
      "cookie-consent-banner",
      "cookie-preferences-modal",
      "cookie-accept-btn",
      "cookie-manage-btn",
      "cookie-modal-close",
      "cookie-save-preferences",
      "cookie-analytics-toggle",
      "cookie-advertising-toggle"
    ];

    const missingCookieIds = cookieIds.filter((id) => !document.getElementById(id));
    const themeToggle = document.getElementById("theme-toggle");
    const searchInput = document.getElementById("search-input");
    const searchOverlay = document.getElementById("search-overlay");
    const criticalMissing = ["mobile-menu-button", "mobile-menu", "theme-toggle"].filter((id) => !document.getElementById(id));
    const adSlots = [...document.querySelectorAll("ins.adsbygoogle")]
      .filter((el) => el.hasAttribute("data-ad-slot"))
      .map((el) => String(el.getAttribute("data-ad-slot") || "").trim());
    const emptyAdSlots = adSlots.filter((slot) => !slot);
    const runtimeScriptPresent = !!document.querySelector('script[src="/assets/js/runtime-health.js"]');

    return {
      path: window.location.pathname,
      cookieSystemInitialized: missingCookieIds.length === 0 && !!document.querySelector('script[src="/assets/js/cookies.js"]'),
      searchOverlayRelevant: !!searchInput || !!searchOverlay,
      searchOverlayInitialized: !!searchInput && !!searchOverlay,
      themeToggleInitialized: !!themeToggle,
      criticalDomHooksDetected: criticalMissing.length === 0,
      noEmptyAdContainers: emptyAdSlots.length === 0,
      runtimeScriptPresent,
      missingCookieIds,
      criticalMissing,
      emptyAdSlotsCount: emptyAdSlots.length,
      scripts: {
        coreScriptCount: document.querySelectorAll('script[src="/assets/js/core.js"]').length,
        cookieScriptCount: document.querySelectorAll('script[src="/assets/js/cookies.js"]').length,
        searchScriptCount: document.querySelectorAll('script[src="/assets/js/search.js"]').length
      }
    };
  });

  return {
    ...result,
    runtimeWarnings: warnings
  };
}

async function main() {
  const { baseUrl, pages, timeoutMs } = parseArgs();
  ensureDir(OUT_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  context.setDefaultTimeout(timeoutMs);

  const session = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    pages: [],
    summary: {
      cookieSystemInitialized: true,
      searchOverlayInitialized: true,
      searchOverlayChecks: 0,
      themeToggleInitialized: true,
      criticalDomHooksDetected: true,
      noEmptyAdContainers: true,
      noDuplicateEventListenerWarnings: true,
      warningCount: 0
    }
  };

  for (const rel of pages) {
    const page = await context.newPage();
    const fullUrl = new URL(rel, baseUrl).toString();
    try {
      const result = await collectForPage(page, fullUrl);
      session.pages.push(result);
      session.summary.cookieSystemInitialized = session.summary.cookieSystemInitialized && result.cookieSystemInitialized;
      if (result.searchOverlayRelevant) {
        session.summary.searchOverlayChecks += 1;
        session.summary.searchOverlayInitialized = session.summary.searchOverlayInitialized && result.searchOverlayInitialized;
      }
      session.summary.themeToggleInitialized = session.summary.themeToggleInitialized && result.themeToggleInitialized;
      session.summary.criticalDomHooksDetected = session.summary.criticalDomHooksDetected && result.criticalDomHooksDetected;
      session.summary.noEmptyAdContainers = session.summary.noEmptyAdContainers && result.noEmptyAdContainers;
      const hasDuplicateWarnings = result.runtimeWarnings.some((w) =>
        /core-script-duplicate|cookie-script-duplicate|search-script-duplicate|tool-script-duplicate/.test(w)
      );
      session.summary.noDuplicateEventListenerWarnings = session.summary.noDuplicateEventListenerWarnings && !hasDuplicateWarnings;
      session.summary.warningCount += result.runtimeWarnings.length;
    } catch (error) {
      session.pages.push({
        path: rel,
        error: error instanceof Error ? error.message : String(error),
        runtimeWarnings: []
      });
      session.summary.cookieSystemInitialized = false;
      session.summary.searchOverlayInitialized = false;
      session.summary.themeToggleInitialized = false;
      session.summary.criticalDomHooksDetected = false;
      session.summary.noEmptyAdContainers = false;
      session.summary.noDuplicateEventListenerWarnings = false;
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();

  if (session.summary.searchOverlayChecks === 0) {
    session.summary.searchOverlayInitialized = true;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(OUT_DIR, `${timestamp}-runtime-health.json`);
  const latestPath = path.join(OUT_DIR, "latest-runtime-health.json");
  fs.writeFileSync(outPath, `${JSON.stringify(session, null, 2)}\n`, "utf8");
  fs.writeFileSync(latestPath, `${JSON.stringify(session, null, 2)}\n`, "utf8");
  console.log(`Runtime evidence generated: reports/runtime-health/${path.basename(outPath)}`);
}

main().catch((error) => {
  console.error(`Runtime evidence capture failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
