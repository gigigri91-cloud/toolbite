"""Static site at repository root; dev tooling under Toolbite.org/."""

from pathlib import Path

# This file lives at Toolbite.org/scripts/paths.py
_TOOLBITE_ORG = Path(__file__).resolve().parents[1]
REPO_ROOT = _TOOLBITE_ORG.parent
SITE_ROOT = REPO_ROOT
SEO_JSON = _TOOLBITE_ORG / "data" / "seo.json"
DATA_DIR = _TOOLBITE_ORG / "data"
TEMPLATES_DIR = _TOOLBITE_ORG / "templates"
