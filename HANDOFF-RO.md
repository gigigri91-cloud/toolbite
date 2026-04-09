# ToolBite - Handoff rapid (RO)

Document scurt pentru continuarea proiectului de catre un agent nou.

## 1) Context tehnic

- Site static hostat pe GitHub Pages.
- Fisiere principale:
  - `index.html`
  - `assets/css/global.css`
  - `assets/js/main.js`
- Stiluri:
  - `assets/css/tailwind.min.css` (local, precompilat)
  - `assets/css/global.css` (custom)

## 2) Reguli critice (NU incalca)

- Nu reintroduce Tailwind CDN (`cdn.tailwindcss.com`).
- Nu adauga `@import` Google Fonts in CSS.
- Nu adauga scripturi inline cu `adsbygoogle.push(...)` in HTML.
- Nu adauga direct scriptul BMC in HTML (`widget.prod.min.js`).
- BMC se incarca lazy din `main.js`.
- AdSense ramane activ, dar init-ul este centralizat/deferat in `main.js`.

## 3) Structura proiect

- `tools/` - unelte individuale.
- `categories/` - pagini de categorie.
- `guides/` - pagini ghid.
- root pages: `about.html`, `contact.html`, `privacy.html`, `terms.html`, `search.html`.
- SEO:
  - `robots.txt`
  - `sitemap.xml`
- securitate:
  - `SECURITY-HEADERS.md`

## 4) Ce este deja implementat

- Tailwind CDN eliminat, CSS local folosit.
- Fonturi optimizate (preconnect + preload + fallback noscript).
- CLS redus (logo + sloturi ads cu dimensiuni rezervate).
- Canonical homepage setat la `https://toolbite.org/index.html`.
- Meta CSP adaugat in paginile HTML.
- Contrast/tap-target ajustate in `global.css`.

## 5) Daca adaugi o unealta noua

1. Cloneaza template din `tools/`.
2. Completeaza meta SEO (title, description, canonical, OG/Twitter).
3. Pastreaza sloturile `<ins class="adsbygoogle ...">` fara inline push.
4. Daca ai nevoie de JS, adauga logic in `assets/js/main.js` cu guard pe ID-uri.
5. Adauga linkuri in categoria potrivita.
6. Actualizeaza `sitemap.xml`.

## 6) Checklist rapid de verificare

- Meniu desktop/mobile functioneaza.
- Functionalitatea tool-ului nou merge.
- Butoane copy/clear merg.
- Canonical/meta corecte.
- Nicio aparitie:
  - `cdn.tailwindcss.com`
  - `adsbygoogle = window.adsbygoogle` in HTML
  - `widget.prod.min.js` in HTML

## 7) Prompt scurt pentru agent nou

```text
Citeste README.md, HANDOFF-RO.md si SECURITY-HEADERS.md.
Respecta arhitectura curenta: HTML static + global.css + main.js.
Nu reintroduce Tailwind CDN, nu adauga inline adsbygoogle push in HTML, nu adauga script BMC direct in HTML.
Pentru pagini noi, actualizeaza SEO/schema/linkuri si sitemap.xml.
Nu modifica sau reveni peste schimbari care nu tin de task.
```

