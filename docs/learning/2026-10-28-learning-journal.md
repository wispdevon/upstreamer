# Preserve work while adding a local learning journal

Date: 2026-10-28
Project: Upstreamer
Base revision: `0e3a295`; implementation on `feature/learning-journal`.

## Learning objective

Add a useful local tool without coupling its persistence, failure recovery, or editor focus to an existing contribution workflow.

## Problem, approach, and reasoning

The app had lessons and a contribution draft but `/notes` redirected to the start page. A learning journal needs to retain practical observations and evidence without changing draft or lesson progress.

The journal has its own versioned storage record. Its state lives above route changes, so blocked saves remain usable while moving around the app. An unreadable journal is kept intact until an explicit replacement, and session notes can still be exported. This avoids treating a recovery fallback as permission to erase unreadable work.

Fields and note IDs stay stable while editing. Focus changes when the selected note changes, not when its text changes. Depending on the entire mutable note object in the focus effect would make autosaves repeatedly move the caret.

## Lesson learned

Persistence ownership and editor identity are separate concerns. A small independent storage boundary can preserve an existing workflow without a migration. Recovery needs a clear distinction between keeping work usable in memory and successfully saving it.

## Evidence and limitations

Tested app source: `6a789ecd5169760ab69d700016474e8de1dd4fb9` on `feature/learning-journal`, based on `0e3a295`. Checks ran on the equivalent working tree before the app commits; companion-skill and learning-documentation changes were included in validation and committed afterward. Runtime: Node 22.23.3, pnpm 11.28.5, Chromium on Linux.

- Baseline `pnpm test`: 7 existing tests passed.
- `pnpm exec vitest run tests/unit/journal.test.ts`: failed before the module existed; all 4 journal tests passed after implementation.
- Initial journal creation browser test: failed before `/notes` existed, then passed with the page implemented.
- The quota-error browser scenario was extended to `/notes/` and reproduced a hidden save warning. Normalizing trailing slashes for storage-status selection fixed it.
- `pnpm test:e2e --workers=2`: all 30 browser tests passed after that fix. They cover note creation, selection, edits, persistence, deletion/cancellation, individual and journal export, caret stability, literal untrusted text, storage quota and access failures, unreadable-save preservation/replacement, keyboard navigation, and accessibility in both themes. Existing contribution and legacy-save regressions passed too.
- Production preview: page identity, meaningful content, create/edit interactions, and zero browser errors verified. Inspected desktop light and mobile dark screenshots; no horizontal overflow at widths 320, 360, 768, 1024, 1270, and 1440. Screenshots are local QA artifacts outside the repository.

Final checks after the trailing-slash fix:

| Check | Actual result |
| --- | --- |
| `pnpm typecheck` | Passed |
| `pnpm lint` | Passed, no lint warnings |
| `pnpm test` | 11 tests passed, including exact companion-package source integrity |
| `pnpm test:e2e --workers=2` | 30 tests passed |
| `pnpm build` | Passed |
| Skill creator `quick_validate.py skills/fork-to-upstream` | Skill valid |
| Production preview at `/notes/` | Create/edit and both themes passed; no browser errors |
| Local Markdown links and `git diff --check` | Passed |

Limits: Chromium only; Firefox, WebKit, and physical mobile devices were not tested. Browser journal entries remain local and do not sync with repository learning notes. No deployment or public-health check was performed. The in-app Browser backend reported `Browser is not available: iab`; runtime QA used the authorized repository Playwright workflow and production preview.

## Next practice

In a disposable browser profile, block writes to the journal storage key. Edit two notes, navigate to the contribution studio and back, and export the journal. Confirm both notes remain in the export and the UI says they are session-only.

## Reusable skill or tool ideas

Implemented: explicit recovery for unreadable records, separate journal storage, honest evidence exports, and a companion-skill reference for learning capture. Proposed: evaluate a practice prompt after real journal use; see [backlog](backlog.md).
