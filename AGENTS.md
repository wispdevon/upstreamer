# Upstreamer project instructions

Read `README.md` and `DESIGN.md` before changing this app. Use Node from `.nvmrc` and pnpm from `package.json`; the system Node may be too old.

- Keep lesson, studio checklist, and skill vocabulary aligned through `src/content.ts` and `pnpm skill:package`.
- Preserve honest evidence: no check is passing merely because a field or checkbox is filled. Keep fictional examples clearly labeled.
- Keep user work browser-local. Do not add analytics, repository uploads, accounts, or AI services without a request.
- User text is untrusted: keep it rendered as React text. Never use raw HTML rendering for the draft preview.
- Follow the editorial design contract and verify mobile plus desktop layouts, keyboard navigation, and contrast.
- Validate changes with `pnpm typecheck`, `pnpm lint`, focused tests, and `pnpm build`. Use `pnpm test:e2e` for affected user flows.
- The Worker deployment is `upstreamer` at `upstreamer.dev`. Do not deploy unrelated workers or modify unrelated DNS. Keep credentials outside the repository.
- Keep the skill's publication boundary: preparation does not authorize pushing, PRs, maintainer messages, or merging.

## Learning through development

- During each task, identify a useful developer learning objective. Plan a small exercise or skill improvement with acceptance criteria, implement it within the authorized scope, verify it, and record the resulting lesson in `docs/learning/`.
- Use the learning-note template and index; update existing notes when the same lesson gains new evidence. Record commands, revisions, outcomes, limitations, and next practice without implying unrun checks passed.
- Assess whether each observed lesson should improve an exercise, learning tool, or companion skill. Keep larger follow-ups in `docs/learning/backlog.md` with dependencies and verification criteria.
- The browser journal and repository learning notes are separate. Never imply they synchronize; users transfer journal notes through Markdown export.
