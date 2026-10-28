# Learning journal implementation

Accepted scope: global continuous-learning and Devon Labs project-tracking guidance; a browser-local learning journal in the existing Upstreamer checkout; repository learning notes and companion-skill guidance. No deployment or remote migration.

## Decisions

- Keep contribution state v2 unchanged. Store journal version 1 under its own key.
- Keep journal state above routes so session-only work survives navigation.
- Preserve an unreadable journal record until the user explicitly replaces it; export remains available.
- Use native labeled fields and stable note IDs so autosaves preserve focus and caret.
- Repository notes and the browser journal have no automatic synchronization.

## Verification

Use Node 22.23.3 and pnpm 11.28.5. Run unit tests before and after model implementation, then typecheck, lint, full tests, browser tests, skill validation, and production build. Check mobile/desktop and light/dark journal screens visually. Do not reuse an unrelated server on the test port.

Baseline: `pnpm test` passed all 7 existing tests on 2026-10-28.

Status: complete. Tested app source is `6a789ec`; final checks and limitations are recorded in the learning note. The daily global-guidance backup was preserved, and central tracking was initialized with the two projects touched by this work.

See [todo.md](todo.md) for implementation status and [learning notes](../docs/learning/README.md) for verified results.
