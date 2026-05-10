import { chromium, firefox, webkit, devices } from "playwright";

const base = "http://127.0.0.1:4321";
const results = [];

function record(area, status, detail) {
  results.push({ area, status, detail });
}

async function toolParitySmoke(browserType, name) {
  const browser = await browserType.launch();
  const page = await browser.newPage();
  try {
    // word-counter
    await page.goto(`${base}/tools/word-counter.html`);
    await page.fill("#wordCounterInput", "Hello world.");
    const words = await page.textContent("#wordCount");
    if (String(words).trim() === "2") record(`${name}:word-counter`, "PASS", "Word count updates");
    else record(`${name}:word-counter`, "FAIL", `Unexpected word count: ${words}`);
    await page.click("#copy-btn");

    // json formatter
    await page.goto(`${base}/tools/json-formatter.html`);
    await page.fill("#jsonInput", '{"a":1}');
    await page.click("text=Format / Beautify");
    const msg = await page.textContent("#jsonMessage");
    if ((msg || "").includes("Valid JSON")) record(`${name}:json-formatter`, "PASS", "Formats valid JSON");
    else record(`${name}:json-formatter`, "FAIL", "No success message after format");
    await page.click("#copyBtn");

    // jwt decoder
    await page.goto(`${base}/tools/jwt-decoder.html`);
    await page.fill("#jwt-input", "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjMifQ.");
    await page.click("#jwt-decode-btn");
    const payload = await page.textContent("#jwt-payload-out");
    if ((payload || "").includes("\"sub\"")) record(`${name}:jwt-decoder`, "PASS", "Decodes payload");
    else record(`${name}:jwt-decoder`, "FAIL", "Payload decode failed");

    // text to slug
    await page.goto(`${base}/tools/text-to-slug.html`);
    await page.fill("#slug-input", "Crème Brûlée Recipe");
    const slug = await page.textContent("#slug-output");
    if ((slug || "").trim() === "creme-brulee-recipe") record(`${name}:text-to-slug`, "PASS", "Slug generation OK");
    else record(`${name}:text-to-slug`, "FAIL", `Unexpected slug: ${slug}`);

    // image compressor basic empty state
    await page.goto(`${base}/tools/image-compressor.html`);
    const disabled = await page.getAttribute("#compress-btn", "disabled");
    if (disabled !== null) record(`${name}:image-compressor`, "PASS", "Empty state keeps button disabled");
    else record(`${name}:image-compressor`, "FAIL", "Compress button should be disabled before file input");
  } catch (error) {
    record(`${name}:tool-parity`, "FAIL", error.message);
  } finally {
    await browser.close();
  }
}

async function searchAndShellSmoke(browserType, name) {
  const browser = await browserType.launch();
  const page = await browser.newPage();
  try {
    await page.goto(`${base}/search.html`);
    await page.fill("#search-input", "json");
    await page.waitForTimeout(250);
    const summary = await page.textContent("#search-summary");
    if ((summary || "").toLowerCase().includes("json")) record(`${name}:search`, "PASS", "Search updates summary");
    else record(`${name}:search`, "WARNING", "Search summary did not include query");

    await page.keyboard.down("Control");
    await page.keyboard.press("KeyK");
    await page.keyboard.up("Control");
    await page.waitForTimeout(100);
    const overlayHidden = await page.getAttribute("#search-overlay", "aria-hidden");
    if (overlayHidden === "false") record(`${name}:overlay`, "PASS", "Overlay keyboard open works");
    else record(`${name}:overlay`, "WARNING", "Overlay did not open via Ctrl+K");

    await page.goto(`${base}/`);
    const menuButton = page.locator("#mobile-menu-button");
    if (await menuButton.count()) {
      await menuButton.click();
      record(`${name}:menu`, "PASS", "Mobile menu hook present and clickable");
    } else {
      record(`${name}:menu`, "FAIL", "Missing #mobile-menu-button");
    }
  } catch (error) {
    record(`${name}:search-shell`, "FAIL", error.message);
  } finally {
    await browser.close();
  }
}

async function mobileSmoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext(devices["iPhone 13"]);
  const page = await context.newPage();
  try {
    await page.goto(`${base}/tools/word-counter.html`);
    await page.fill("#wordCounterInput", "mobile qa");
    await page.click("#copy-btn");
    await page.goto(`${base}/`);
    await page.click("#mobile-menu-button");
    record("mobile:layout", "PASS", "Mobile interactions usable on iPhone viewport");
  } catch (error) {
    record("mobile:layout", "FAIL", error.message);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function run() {
  await toolParitySmoke(chromium, "chromium");
  await searchAndShellSmoke(chromium, "chromium");

  await toolParitySmoke(firefox, "firefox");
  await searchAndShellSmoke(firefox, "firefox");

  await toolParitySmoke(webkit, "webkit");
  await searchAndShellSmoke(webkit, "webkit");

  await mobileSmoke();

  const counts = results.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({ counts, results }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
