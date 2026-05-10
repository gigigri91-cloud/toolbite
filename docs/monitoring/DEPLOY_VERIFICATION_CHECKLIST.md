# Deploy Verification Checklist

- Confirm deploy artifact source is `_site/` only.
- Confirm snapshot files were generated for post-build and post-compose.
- Confirm `PRODUCTION_STATUS.md` and `migration-status.json` were refreshed.
- Confirm no validation gate was skipped or bypassed.
- Confirm key URLs (`/`, `/search.html`, migrated tools) return expected HTML.
- Confirm rollback-ready revision is tagged and documented.
