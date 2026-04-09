# ToolBite.org - Project Documentation and Agent Handoff

This repository is a static website for `toolbite.org`, hosted on GitHub Pages.

It contains:
- landing/home page
- category hubs
- individual browser-based tools
- guides
- shared CSS/JS assets

The project is designed to run without a build step at deploy time.

---

## 1) Tech Stack and Hosting

- **Hosting:** GitHub Pages (direct static hosting)
- **Pages:** plain HTML files
- **Styling:** precompiled Tailwind CSS (`assets/css/tailwind.min.css`) + custom CSS (`assets/css/global.css`)
- **Behavior:** vanilla JavaScript (`assets/js/main.js`)
- **Ads/Monetization:** Google AdSense + BuyMeACoffee (lazy-loaded)

Important constraints from hosting:
- HTTP response headers cannot be reliably managed from repo alone.
- See `SECURITY-HEADERS.md` for what is in-repo vs what needs CDN/proxy headers.

---

## 2) Repository Structure

- `index.html` - homepage
- `about.html`, `contact.html`, `privacy.html`, `terms.html`, `search.html` - static root pages
- `categories/` - category listing pages:
  - `text-tools.html`
  - `developer-tools.html`
  - `image-tools.html`
  - `seo-tools.html`
- `tools/` - individual tools
- `guides/` - guide/index pages
- `assets/css/`
  - `tailwind.min.css` - precompiled Tailwind utilities
  - `global.css` - project-specific styling and overrides
- `assets/js/main.js` - all shared JS logic for tools + global interactions
- `robots.txt`, `sitemap.xml`, `ads.txt`
- `SECURITY-HEADERS.md` - security deployment notes

---

## 3) Tool Inventory

Current tool pages in `tools/`:

- `word-counter.html`
- `password-generator.html`
- `json-formatter.html`
- `find-replace.html`
- `lorem-ipsum.html`
- `remove-extra-spaces.html`
- `image-compressor.html`
- `color-palette-generator.html`
- `case-converter.html`
- `text-to-slug.html`
- `read-time-calculator.html`
- `base64-encoder.html`
- `uuid-generator.html`
- `url-encoder.html`
- `hash-generator.html`
- `jwt-decoder.html`
- `remove-duplicate-lines.html`
- `sort-text-lines.html`

---

## 4) Shared Frontend Conventions

### 4.1 Head block conventions (all pages)

Expected structure in `<head>`:
- `meta charset`
- `meta viewport`
- `meta http-equiv="Content-Security-Policy"` baseline
- `title`, canonical, description, OG/Twitter/meta
- AdSense script (`async`)
- Google fonts preconnect + preload
- local CSS:
  - root pages: `assets/css/tailwind.min.css` + `assets/css/global.css`
  - nested pages: `../assets/css/tailwind.min.css` + `../assets/css/global.css`

Do not reintroduce:
- Tailwind CDN runtime (`https://cdn.tailwindcss.com`)
- CSS `@import` for Google fonts in `global.css`

### 4.2 JavaScript conventions

`assets/js/main.js` contains:
- global UI interactions (menu, header shrink, footer year)
- logic for each tool (guarded by element existence checks)
- category filtering + link copy helpers
- deferred third-party bootstrap:
  - AdSense slot init is delayed
  - BuyMeACoffee widget is lazy-injected (interaction or idle timeout)

Do not add inline `<script>(adsbygoogle...).push({})</script>` in HTML.
Ad rendering is centralized in `main.js`.

### 4.3 Styling conventions

`assets/css/global.css` includes:
- hero and card visual styles
- logo sizing + CLS protection (`aspect-ratio`)
- ad-slot reserved min-heights
- readability/accessibility adjustments (e.g. gray text contrast, footer touch target sizing)

---

## 5) SEO and Crawl Rules

- Canonicals exist on content pages.
- `search.html` intentionally has no canonical and is disallowed in `robots.txt`.
- `sitemap.xml` contains root pages, categories, tools, and guides.

When adding/removing pages:
1. update internal links
2. update `sitemap.xml`
3. verify canonical path
4. keep robots rules coherent

---

## 6) Security Model (Important)

In-repo:
- CSP meta baseline in HTML (best effort only).

Needs proxy/CDN headers for full enforcement:
- CSP as response header
- HSTS
- COOP
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy
- X-Content-Type-Options

Details and recommended values: `SECURITY-HEADERS.md`.

---

## 7) Performance/A11y Work Already Applied

Implemented:
- removed Tailwind CDN dependency
- migrated to local `tailwind.min.css`
- non-blocking font load pattern (preconnect + preload + noscript fallback)
- removed inline AdSense push scripts from HTML
- lazy-load BuyMeACoffee widget
- reserved ad and logo layout space to reduce CLS
- improved small gray text contrast and footer tap-target sizing
- homepage canonical aligned to `https://toolbite.org/index.html`

---

## 8) How To Add a New Tool Page

1. Copy an existing tool page in `tools/` as template.
2. Update:
   - title/meta/canonical/OG/Twitter
   - JSON-LD schema (`WebApplication` + breadcrumb)
   - visible H1/content
   - related tools links
3. Keep ad slots as `<ins class="adsbygoogle ...">` only (no inline push script).
4. Add optional BuyMeACoffee CTA card in sidebar; keep hidden config div before `main.js`.
5. Add JS logic to `assets/js/main.js` guarded by target element checks.
6. Add page to:
   - relevant category page
   - `sitemap.xml`
   - any homepage/category feature lists as needed
7. Verify:
   - no Tailwind CDN usage
   - no inline AdSense push
   - no direct BMC widget script tag

---

## 9) Manual QA Checklist

After meaningful edits, test:

- **Navigation**
  - desktop menu + mobile menu
  - footer links
- **Tool behavior**
  - primary tool actions
  - clear/copy buttons
  - empty/error states
- **Monetization**
  - AdSense slots render
  - BMC widget appears after interaction/idle
- **SEO/Semantics**
  - title/description/canonical
  - schema JSON-LD validity
- **Accessibility**
  - label/aria presence
  - keyboard access
  - contrast and tap target checks
- **Performance hygiene**
  - no Tailwind CDN
  - fonts loaded via preload pattern

### Automated sanity check

Before release, run:

`python3 scripts/site_sanity_check.py`

GitHub Actions also runs the same check automatically on:
- every `push`
- every `pull_request`
- manual `workflow_dispatch`

Workflow file:
- `.github/workflows/site-sanity.yml`
- `python3 scripts/check_internal_links.py`
- `python3 scripts/validate_html_structure.py`

It validates:
- no Tailwind CDN regressions
- no inline AdSense push in HTML
- no direct BMC widget script tags in HTML
- no malformed escaped script closing tags
- homepage canonical/OG/sitemap consistency
- required OG/Twitter + schema completeness on tool pages
- shared structural checks (`lang`, search noindex/canonical rules, menu ARIA)
- internal links, assets, and local anchors

### Additional CI workflows

- `.github/workflows/external-links.yml`
  - runs external URL checks manually or weekly
- `.github/workflows/lighthouse-ci.yml`
  - runs Lighthouse CI manually or weekly against:
  - `https://toolbite.org/index.html`
  - `https://toolbite.org/tools/word-counter.html`

Local commands:

- `python3 scripts/site_sanity_check.py`
- `python3 scripts/check_internal_links.py`
- `python3 scripts/validate_html_structure.py`
- `python3 scripts/check_external_links.py`

---

## 10) Lighthouse Validation Notes

Recommended pages for quick regression checks:
- `https://toolbite.org/index.html`
- one representative tool page (ex: `https://toolbite.org/tools/word-counter.html`)

Track at least:
- Performance score
- Accessibility score
- Best Practices score
- SEO score
- FCP, LCP, TBT, CLS, Speed Index

If local CLI is unavailable, run audits in PageSpeed Web UI.

---

## 11) New Chat Agent Quick-Start Prompt

Use this prompt at the start of a new chat to continue safely:

```text
Read README.md and SECURITY-HEADERS.md first. Then scan index.html, assets/css/global.css, and assets/js/main.js.
Respect current architecture:
- static HTML + shared global.css/main.js
- local tailwind.min.css (never Tailwind CDN runtime)
- no inline adsbygoogle push scripts in HTML
- BuyMeACoffee loaded lazily via main.js only
- keep canonical/SEO/schema coherent and update sitemap.xml when pages change.
When editing, preserve existing behavior and do not revert unrelated changes.
```

---

## 12) Maintenance Notes

- Keep file paths relative and consistent (`assets/...` vs `../assets/...`).
- Keep repeated page patterns aligned across root/category/tool/guide templates.
- Prefer small, repeatable changes across all affected pages, not one-off drift.

