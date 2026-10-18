# Upstreamer

A browser-local open source contribution field guide and companion Codex skill. Learn to explore in a fork, extract a focused idea, verify it from upstream, and write a handoff someone else can maintain.

Production domain: **https://upstreamer.dev**. Hosting is configured as a Cloudflare Worker with static assets and SPA fallback.

Source code: [github.com/wispdevon/upstreamer](https://github.com/wispdevon/upstreamer). Upstreamer is open source under the MIT License. Bug reports, lesson improvements, accessibility fixes, and focused app or skill changes are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md) for the fork-and-pull-request workflow.

## Run locally

Use Node **22.23.3** (`.nvmrc`) and pnpm **11.28.5**. pnpm 11 requires a compatible Node 22 runtime; the system Node 20 in the original development environment cannot run it.

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The dev server prints its URL, normally http://localhost:5173. No API keys, account setup, or database are needed. `dev` and `build` regenerate the skill ZIP from source.

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

The test command regenerates the skill before checking package integrity. Browser tests cover both learning paths, all ten exercises, local persistence and migration, the combined review-and-draft studio, Markdown downloads, safe text preview, legacy routes, responsive pill navigation, and WCAG 2.1 AA checks with axe.

The app uses Tailwind CSS through its Vite plugin, with shared palette tokens in `src/index.css`. Existing editorial base styles are preserved; Tailwind theme and utility layers are enabled without Preflight.

## Product structure

- `src/content.ts`: lesson content, two fictional examples, canonical workflow IDs, and checklist definitions.
- `src/model.ts` and `src/state.ts`: versioned local persistence, legacy migration, validation, and failure recovery.
- `src/Learning.tsx` and `src/Tools.tsx`: learning, read-only examples, the combined review-and-draft studio, and skill installation UI.
- `skills/fork-to-upstream/`: editable companion skill and supporting references. The shared contract JSON is generated from app content.
- `scripts/package-skill.mjs`: deterministic, self-contained ZIP at `public/downloads/fork-to-upstream.zip`. Generated downloads and build output are ignored by Git.
- `DESIGN.md`: visual and accessibility contract. The concept image is retained in `docs/design/` as a design artifact, not shipped to visitors.

Routes: `/`, `/learn`, `/learn/:id`, `/examples`, `/studio`, `/skill`. Previous `/workbench`, `/review`, and `/draft` URLs redirect to `/studio`; `/notes` redirects to the start page. The Worker serves the SPA shell on direct navigation.

## Data and privacy

Learning progress, review answers, an editable contribution draft, and the theme override stay in localStorage on the current browser/origin. On first visit after the v2 update, existing v1 progress and review answers migrate, and an existing draft is kept; otherwise the old contribution brief becomes an editable draft. The v1 record remains untouched during migration. The theme follows the device setting until someone chooses a light or dark override. There are no analytics, external font requests, accounts, cloud sync, or repository uploads. Clearing site data removes the current local work. The draft reading view renders text safely and never evaluates HTML.

The review checklist is a self-review aid beside the handoff draft. It does not certify merge readiness. The starter draft says verification has not been run; contributors replace that with actual results. The studio offers Markdown download.

## Companion skill

Download it on `/skill`, or use the source folder under `skills/`. The app links to the [official local skill discovery documentation](https://learn.chatgpt.com/docs/build-skills). Current Codex documentation uses `~/.agents/skills/` for personal skills and `.agents/skills/` for repository-scoped skills; consult the installed Codex version if using an older setup.

Invoke `$fork-to-upstream` with a concrete idea and relevant repository context. The skill prepares and verifies a contribution; it does not publish, contact maintainers, or merge by default. See `docs/skill-validation.md` for the scenario review and limits of validation.

## Deploy

```bash
pnpm exec wrangler whoami
pnpm deploy:check
pnpm deploy
```

`deploy` runs all local checks and the production build before `wrangler deploy`. The active Cloudflare account must own the active `upstreamer.dev` zone. `wrangler.jsonc` records the Worker, domain, assets, and SPA configuration; Cloudflare manages the custom-domain DNS and certificate. No credentials belong in this repository. The `no-transform` response header prevents Cloudflare from injecting its default Web Analytics beacon; hashed assets retain long-lived caching while downloads revalidate. See [Cloudflare’s documented behavior](https://developers.cloudflare.com/web-analytics/get-started/).

Verify the homepage, a direct lesson URL, the combined studio and its exported draft, and `/downloads/fork-to-upstream.zip` over HTTPS after deployment. For a regression, use `pnpm exec wrangler deployments list` and `pnpm exec wrangler rollback <previous-version-id>` once a prior deployment exists. On an initial launch there is no previous version to roll back to; redeploy a corrected build or detach the custom domain if necessary.

Reference material: [GitHub Open Source Guides](https://opensource.guide/how-to-contribute/), [GitHub fork documentation](https://docs.github.com/en/pull-requests/reference/forks), [Cloudflare static assets](https://developers.cloudflare.com/workers/static-assets/), and [custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/). Examples are fictional, not case-study claims about OpenCull or another real repository.
