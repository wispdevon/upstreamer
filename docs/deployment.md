# Upstreamer deployment

Current release, deployed 17 October 2026:

- Site: https://upstreamer.dev
- Worker fallback: https://upstreamer.wispcream.workers.dev
- Worker: `upstreamer`
- Version: `fa157fc0-77d2-40c3-8e9a-f5fac9d17c35`
- Source commit: `7eaeab9` on `main`

This release removes the homepage breadcrumb row, brand tagline, and extra explanatory copy. The headline, five step titles, and real Click fork-to-PR example remain. The example follows `sitiyou/click:fix-fish-completion` to `pallets/click:main` in Click PR #3504. The five-step process remains in the companion agent-skill contract and full workflow lessons; lesson progress and local-save status remain on inner pages.

## Validation

`pnpm deploy` passed: typecheck, lint, 7 unit tests, 16 Playwright tests, production build, and Worker deployment. The updated home page was inspected at 1440×1000 and 390×844 in light mode. Automated layout checks covered 360px, 768px, 1024px, 1270px, and 1440px widths, verified the diagram stays within the main content, and checked no horizontal overflow, keyboard focus, accessibility, and browser errors.

The production domain returned HTTP 200 for `/`, `/studio`, `/learn/dependencies`, `/examples`, `/skill`, and the skill ZIP. The Worker fallback returned HTTP 200 for `/` and `/studio`.

## Deployment history

- Previous concise five-step homepage release: `f08025eb-d5a9-4e15-a2b8-318f1b9c01c2`.
- Previous proportional homepage release: `0ee045c8-9088-4ecb-994f-259025608801`.
- Previous source-link release: `43cf5d84-4d98-4df9-9e19-010f8562545c`.
- Navigation and theme release: `3ac5f556-0631-4f20-8b0d-a6390e6e416a`.
- Initial launch: `90de8f37-5f72-41db-a54f-3da57a8c4875`.

Inspect deployment history with `pnpm exec wrangler deployments list`; use `pnpm exec wrangler rollback <previous-version-id>` if a rollback is needed. A corrected build is preferable when reverting would reintroduce the earlier automatic analytics beacon behavior. Cloudflare manages DNS and the certificate for the custom domain; no unrelated DNS records or Workers should be changed.
