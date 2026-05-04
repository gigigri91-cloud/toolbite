# Toolbite (site repository)

This git repository contains **only the static site** deployed to GitHub Pages (HTML, `assets/`, `tools/`, etc.).

**Python tooling** (sanity checks, `seo.json`, templates, optional Lighthouse copy) lives **outside** this repo, in a sibling folder named `Toolbite.org` next to this checkout (same parent directory as `toolbite/`).

From the site repo directory, scripts typically run like:

```bash
python3 ../Toolbite.org/scripts/site_sanity_check.py
```

Override the site root if needed:

```bash
TOOLBITE_SITE_ROOT=/path/to/toolbite python3 ../Toolbite.org/scripts/seo_metadata.py --check
```

See `../Toolbite.org/README.md` next to your tooling folder for full notes.
