# Upstreamer deployment

Current release, deployed 17 October 2026:

- Site: https://upstreamer.dev
- Worker fallback: https://upstreamer.wispcream.workers.dev
- Worker: `upstreamer`
- Version: `e3c53dca-76da-4cc6-800e-9be51bb179b9`
- Source commit: `99fce9e` on `main`

This release replaces the separate workbench, checklist, draft, and field-notes screens with a single contribution studio. It keeps the top navigation to five pill buttons, migrates v1 progress and review answers, and preserves the previous local save unchanged.

## Validation

`pnpm deploy:check` passed: typecheck, lint, 7 unit tests, 15 Playwright tests, and production build. The screenshots were inspected at 1440×900 and 360×900 for the home page, and 1440×1000 and 360×900 for the studio. Automated layout checks covered 360px, 768px, and 1440px widths, verified no horizontal overflow, checked keyboard focus, and found no browser console or page errors. The in-app browser connection was unavailable for this release; the repository's Playwright browser was used for rendered checks.

The production domain returned HTTP 200 for `/`, `/studio`, `/learn/dependencies`, and the skill ZIP. The Worker fallback returned HTTP 200 for `/` and `/studio`. The homepage response included the expected content security policy and security headers.

## Deployment history

- Previous source-link release: `43cf5d84-4d98-4df9-9e19-010f8562545c`.
- Navigation and theme release: `3ac5f556-0631-4f20-8b0d-a6390e6e416a`.
- Initial launch: `90de8f37-5f72-41db-a54f-3da57a8c4875`.

Inspect deployment history with `pnpm exec wrangler deployments list`; use `pnpm exec wrangler rollback <previous-version-id>` if a rollback is needed. A corrected build is preferable when reverting would reintroduce the earlier automatic analytics beacon behavior. Cloudflare manages DNS and the certificate for the custom domain; no unrelated DNS records or Workers should be changed.
