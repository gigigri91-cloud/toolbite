import { test, expect, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:4323";

test.describe("Tool parity QA", () => {
  test("word-counter behavior", async ({ page }) => {
    await page.goto(`${baseURL}/tools/word-counter.html`);
    await page.fill("#wordCounterInput", "Hello world.");
    await expect(page.locator("#wordCount")).toHaveText("2");
    await expect(page.locator("#charCount")).toHaveText("12");
    await page.click("#copy-btn");
    await page.click("#clear-btn");
    await expect(page.locator("#wordCount")).toHaveText("0");
  });

  test("json formatter behavior", async ({ page }) => {
    await page.goto(`${baseURL}/tools/json-formatter.html`);
    await page.fill("#jsonInput", '{"a":1}');
    await page.click("text=Format / Beautify");
    await expect(page.locator("#jsonMessage")).toContainText("Valid JSON");
    await page.click("#copyBtn");
    await page.fill("#jsonInput", "{");
    await page.click("text=Format / Beautify");
    await expect(page.locator("#jsonMessage")).toContainText("Invalid JSON");
  });

  test("jwt decoder behavior", async ({ page }) => {
    await page.goto(`${baseURL}/tools/jwt-decoder.html`);
    await page.fill("#jwt-input", "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjMifQ.");
    await page.click("#jwt-decode-btn");
    await expect(page.locator("#jwt-payload-out")).toContainText("\"sub\": \"123\"");
    await page.click("#jwt-clear-btn");
    await expect(page.locator("#jwt-payload-out")).toHaveText("");
  });

  test("text-to-slug behavior", async ({ page }) => {
    await page.goto(`${baseURL}/tools/text-to-slug.html`);
    await page.fill("#slug-input", "Crème Brûlée Recipe");
    await expect(page.locator("#slug-output")).toHaveText("creme-brulee-recipe");
    await page.click("#slug-clear-btn");
    await expect(page.locator("#slug-output")).toHaveText("");
  });

  test("image-compressor empty state", async ({ page }) => {
    await page.goto(`${baseURL}/tools/image-compressor.html`);
    await expect(page.locator("#compress-btn")).toBeDisabled();
  });
});

test.describe("Search + shell QA", () => {
  test("search page keyboard and filters", async ({ page }) => {
    await page.goto(`${baseURL}/search.html`);
    await page.fill("#search-input", "json");
    await page.waitForTimeout(220);
    await expect(page.locator("#search-summary")).toContainText("json");
    await page.selectOption("#search-category-filter", "developer-tools");
    await page.waitForTimeout(220);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/tools\/|\/guides\//);
  });

  test("overlay shortcut open/close", async ({ page }) => {
    await page.goto(`${baseURL}/`);
    await page.keyboard.press("/");
    await expect(page.locator("#search-overlay")).toHaveAttribute("aria-hidden", "false");
    await page.keyboard.press("Escape");
    await expect(page.locator("#search-overlay")).toHaveAttribute("aria-hidden", "true");
  });

  test("mobile menu and theme toggle hooks", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${baseURL}/`);
    await expect(page.locator("#mobile-menu-button")).toHaveCount(1);
    await expect(page.locator("#theme-toggle")).toHaveCount(1);
    await page.click("#mobile-menu-button");
    await expect(page.locator("#mobile-menu")).not.toHaveClass(/hidden/);
    await context.close();
  });
});

test("mobile tool usability on iPhone viewport", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: devices["iPhone 13"].userAgent
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/tools/word-counter.html`);
  await page.fill("#wordCounterInput", "mobile qa");
  await page.click("#copy-btn");
  await expect(page.locator("#wordCount")).toHaveText("2");
  await context.close();
});
