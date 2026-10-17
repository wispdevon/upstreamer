# Upstreamer deployment

Deployed on 17 October 2026 using Cloudflare Workers static assets.

- Domain: https://upstreamer.dev
- Worker fallback: https://upstreamer.wispcream.workers.dev
- Worker: `upstreamer`
- Version: `3ac5f556-0631-4f20-8b0d-a6390e6e416a`
- Configuration: `wrangler.jsonc`; active custom domain and SPA fallback.

This release moves navigation into a full-width row of buttons, makes all destinations visible in a compact phone grid, and adds a system-aware light/dark theme control.

## Validation

For this UI refresh, typecheck, lint, and production build passed. Desktop and 290px mobile layouts were visually checked in light and dark themes. Both the custom domain and Worker fallback returned HTTP 200 with the expected security headers. Automated unit and browser test suites were not rerun for this release.

The custom domain returned HTTP 200 over valid HTTPS using its public Cloudflare DNS address. Cloudflare DNS and Google DNS both resolved the domain to Cloudflare addresses. The local system resolver still had a stale negative answer immediately after launch, so the live browser smoke test used the public DNS address with the original HTTPS hostname and normal certificate validation; TLS checks were not bypassed.

The initial launch version was `90de8f37-5f72-41db-a54f-3da57a8c4875`. Follow-up deployments finalized the privacy/cache headers to prevent Cloudflare auto-injecting its default analytics beacon. Deployment history can be inspected with `pnpm exec wrangler deployments list` and rolled back with `pnpm exec wrangler rollback <previous-version-id>`. Prefer a corrected build if reverting would restore the earlier automatic-beacon behavior. No unrelated DNS records or workers were changed.

The previous release also passed 7 unit/package tests, 11 Playwright tests, skill structural validation, and a production dependency audit. Its live browser check verified seven routes, draft flow and downloads, zero homepage axe WCAG A/AA findings, zero console/page errors, zero external requests, and no injected analytics script. Public HTTPS certificate validation remained enabled.
