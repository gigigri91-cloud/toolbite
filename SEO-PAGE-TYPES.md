# ToolBite SEO Page-Type Contract

This file defines the minimum SEO contract for each page family in the static ToolBite repo.

The site currently uses handwritten HTML pages, so this checklist is the canonical reference when adding or updating pages.

## 1) Homepage

Primary file:
- `index.html`

Required:
- exactly 1 `<title>`
- exactly 1 meta description
- exactly 1 canonical
- Open Graph + Twitter tags
- homepage schema suited to the page purpose:
  - `WebSite`
  - `Organization`
  - optional supporting schema such as `FAQPage` or `ItemList`
- no breadcrumb nav required

Notes:
- homepage canonical, `og:url`, and homepage entry in `sitemap.xml` must stay aligned

## 2) Category Pages

Primary files:
- `categories/text-tools.html`
- `categories/developer-tools.html`
- `categories/image-tools.html`
- `categories/seo-tools.html`

Required:
- exactly 1 `<title>`
- exactly 1 meta description
- exactly 1 canonical
- visible breadcrumb nav
- `BreadcrumbList` schema
- `CollectionPage` schema
- category H1 aligned with page intent

## 3) Tool Pages

Primary files:
- `tools/*.html`

Required:
- exactly 1 `<title>`
- exactly 1 meta description
- exactly 1 canonical
- Open Graph + Twitter tags
- visible breadcrumb nav
- `BreadcrumbList` schema
- `WebApplication` schema
- exactly 1 `<main>`
- exactly 1 `<h1>`

Recommended:
- `FAQPage` when the tool has enough stable FAQ content
- privacy-first helper note if the tool processes user input locally
- useful internal links to related tools, category page, or guide page

## 4) Guide Index

Primary file:
- `guides/index.html`

Required:
- exactly 1 `<title>`
- exactly 1 meta description
- exactly 1 canonical
- visible breadcrumb nav
- `BreadcrumbList` schema
- `CollectionPage` schema

## 5) Guide Articles

Primary files:
- `guides/*.html` except `guides/index.html`

Required:
- exactly 1 `<title>`
- exactly 1 meta description
- exactly 1 canonical
- visible breadcrumb nav
- `BreadcrumbList` schema
- `Article` schema

Recommended:
- internal links back to the related tool page
- internal links back to `guides/index.html`

## 6) Root Info Pages

Primary files:
- `about.html`
- `contact.html`
- `privacy.html`
- `terms.html`

Required:
- exactly 1 `<title>`
- exactly 1 meta description
- exactly 1 canonical
- visible breadcrumb nav
- `BreadcrumbList` schema
- `WebPage` schema

Indexation rules:
- `about.html` may remain indexable
- `contact.html` should use `noindex, follow`
- `privacy.html` should use `noindex, follow`
- `terms.html` should use `noindex, follow`

## 7) Search Page

Primary file:
- `search.html`

Required:
- exactly 1 `<title>`
- exactly 1 meta description
- exactly 1 `<main>`
- exactly 1 `<h1>`
- no canonical tag
- `meta name="robots" content="noindex, follow"`

Notes:
- `robots.txt` also disallows `/search.html`

## 8) Global SEO Hygiene

Required for all relevant page families:
- keep internal links current
- update `sitemap.xml` when indexable URLs change
- keep `robots.txt`, canonicals, and `sitemap.xml` coherent
- keep visible breadcrumbs and `BreadcrumbList` schema aligned

Validation commands:

```bash
python3 scripts/site_sanity_check.py
python3 scripts/check_internal_links.py
python3 scripts/validate_html_structure.py
```
