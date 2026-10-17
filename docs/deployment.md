# Upstreamer deployment

Current release, deployed 17 October 2026:

- Site: https://upstreamer.dev
- Worker fallback: https://upstreamer.wispcream.workers.dev
- Worker: `upstreamer`
- Version: `0ee045c8-9088-4ecb-994f-259025608801`
- Source commit: `9924976` on `main`

This release keeps the start-page headline and branch diagram within balanced columns, removes the figure's default margins, and stacks the two before they become cramped. It also replaces the separate workbench, checklist, draft, and field-notes screens with a single contribution studio. It keeps the top navigation to five pill buttons, migrates v1 progress and review answers, and preserves the previous local save unchanged.

## Validation

`pnpm deploy:check` passed: typecheck, lint, 7 unit tests, 15 Playwright tests, and production build. The updated home page was inspected at 1270×800 and 1024×900 in dark mode. Automated layout checks covered 360px, 768px, 1024px, 1270px, and 1440px widths, verified the diagram stays within the main content, and retained no-overflow, keyboard-focus, accessibility, and browser-error checks.

The production domain returned HTTP 200 for `/`, `/studio`, `/learn/dependencies`, and the skill ZIP. The Worker fallback returned HTTP 200 for `/`.

## Deployment history

- Previous source-link release: `43cf5d84-4d98-4df9-9e19-010f8562545c`.
- Navigation and theme release: `3ac5f556-0631-4f20-8b0d-a6390e6e416a`.
- Initial launch: `90de8f37-5f72-41db-a54f-3da57a8c4875`.

Inspect deployment history with `pnpm exec wrangler deployments list`; use `pnpm exec wrangler rollback <previous-version-id>` if a rollback is needed. A corrected build is preferable when reverting would reintroduce the earlier automatic analytics beacon behavior. Cloudflare manages DNS and the certificate for the custom domain; no unrelated DNS records or Workers should be changed.
