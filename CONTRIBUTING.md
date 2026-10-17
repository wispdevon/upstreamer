# Contributing to Upstreamer

Thanks for helping make open source contributions easier to prepare and review. Changes to the field guide, examples, app, and companion `fork-to-upstream` skill are welcome.

## Before you start

For a substantial feature or change in direction, open an issue first so we can agree on scope. Small fixes to wording, accessibility, or documentation can go straight to a pull request.

## Run it locally

Use Node **22.23.3** from `.nvmrc` and pnpm **11.28.5**:

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The app needs no API keys, database, or service account. Progress and drafts stay in the current browser.

## Verify your change

Run the checks relevant to your change. Before opening a pull request, run:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

The build and dev server regenerate the downloadable skill archive from `skills/fork-to-upstream/`; the generated ZIP is intentionally not tracked.

## Open a pull request

1. Fork `wispdevon/upstreamer` and create a short-lived branch for one focused change.
2. Keep app copy and companion skill instructions consistent. Label fictional examples clearly and keep claims about tests and evidence accurate.
3. Include the behavior changed, checks you ran, and any useful screenshots for visual changes.
4. Push the branch to your fork and open a pull request targeting `main`.

The project keeps user work in the browser. Please discuss changes involving analytics, accounts, cloud storage, repository uploads, AI services, new dependencies, or credentials in an issue before implementing them. Never include secrets in a commit.
