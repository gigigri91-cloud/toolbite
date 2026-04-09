# Security Header Deployment Notes

This repository is hosted on GitHub Pages direct origin, which limits control over HTTP response headers.

## What is implemented in-repo

- A baseline `<meta http-equiv="Content-Security-Policy">` is present in HTML documents.
- This is a best-effort client-side fallback and not a full replacement for server headers.

## What still requires edge/proxy header control

For production-grade protection, configure these as HTTP response headers at a reverse proxy/CDN layer (Cloudflare, Netlify, Vercel, Nginx, etc.):

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `Cross-Origin-Opener-Policy`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-Content-Type-Options: nosniff`

## Recommended header baseline

```http
Content-Security-Policy: default-src 'self'; base-uri 'self'; form-action 'self' mailto:; object-src 'none'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://cdnjs.buymeacoffee.com; connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://google.com https://www.buymeacoffee.com https://buymeacoffee.com https://cdnjs.buymeacoffee.com; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Cross-Origin-Opener-Policy: same-origin-allow-popups
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Important limitations on GitHub Pages direct

- `HSTS` cannot be enforced from this repo alone.
- `COOP` and `X-Frame-Options` cannot be reliably enforced from this repo alone.
- Trusted Types (`require-trusted-types-for 'script'`) should be applied only after code is audited for compatibility and deployed via headers.

