---
name: fork-to-upstream
description: Develop ideas in a fork and prepare focused upstream contributions, including dependency extraction, upstream-based verification, and an evidence-backed PR draft. Use for turning existing fork work or a new fork experiment into a maintainable contribution.
---

# Fork to Upstream

Prepare one contribution that another person can understand, verify, and maintain. A fork is a legitimate place for ambitious experimentation; upstream contributions need an explicit problem, coherent scope, and accounted-for prerequisites. Acceptance belongs to the project.

## Establish the task and project contract

Read applicable AGENTS.md files, contribution guidance, code of conduct, license, issue/PR templates, and any AI-assistance policy. Inspect recent relevant changes and discussions available in the task context. Respect project-specific rules about design discussion, sign-offs, testing, and history.

Inspect the working tree, branches, remotes, and branch tracking. Remote names and default branches are not proof of repository identity. Verify the upstream URL and base revision. Do not assume `origin` is the fork or `main` is the default branch. Never print credentials embedded in remote URLs.

Determine whether the user wants a new experiment or extraction of existing work. Summarize the user problem, resulting behavior, scope, and upstream fit. Reuse a supplied contribution brief as a starting hypothesis, not evidence. Ask only when unresolved intent or project policy materially changes the work. Do not publish or contact maintainers to settle a question unless requested.

If upstream context is unavailable, inspect what is local, report what is missing, and qualify findings. Do not label an unverified base or contribution independent. Continue useful preparation that does not depend on the missing information.

## Choose and develop one reviewable idea

Inspect the actual diff and relevant code. Separate the desired behavior from unrelated experiments and supporting infrastructure. Prefer the smallest complete, useful slice, not an arbitrary commit count or line budget. Do not smuggle an upstream-declined feature through a series of innocuous-looking PRs.

For a new idea, develop and validate within a dedicated fork branch or isolated worktree. For existing work, inspect its history and dependency chain before choosing an extraction method. Preserve unrelated changes; do not reset, stash, overwrite, or rewrite shared work to obtain a clean checkout. If dirty work is required for the contribution, identify it and agree on its inclusion before copying it.

## Trace prerequisites and extract honestly

Follow imports, types, configuration, assets, generated files, migrations, feature flags, runtime services, and behavior assumptions. For each prerequisite, identify whether it exists upstream, belongs in this contribution, needs a separate prerequisite contribution, or can be avoided by adapting to upstream facilities. Read [dependency-extraction.md](references/dependency-extraction.md) when extraction is nontrivial.

Create the contribution branch or worktree from a recorded, verified upstream commit. Fetching is appropriate when network access and the task permit it; do not guess a newer base if fetching fails. Inspect baseline behavior before applying the change.

Choose cherry-picking, patch application, or adaptation based on the dependency structure and project conventions. A clean cherry-pick is only textual application. Squashing does not remove semantic dependencies. Preserve authorship, coauthor credit, license notices, and sign-offs required by the project; follow its accepted attribution method for adapted work.

For unresolved prerequisite decisions, prepare the findings and proposed sequence. Do not implement a larger architecture without authorization merely to make the initial idea pass. If a prerequisite is not merged, state whether the contribution is stacked and which base/PR it requires; never call it independently mergeable.

## Verify the actual contribution

Use the repository's documented runtime, package manager, build, lint, and test commands. Run relevant baseline checks, then meaningful checks against the extracted upstream-based checkout. Include an appropriate regression check for changed behavior and runtime verification for UI work. Do not weaken checks or remove tests to manufacture success.

Record the tested base and head revisions, exact commands, outcomes, and environment limitations. Distinguish passing, failed, blocked, and not-run checks. Inspect the final diff for unintended files, untracked dependencies, missing assets, generated output, secrets, and unrelated cleanup.

A build passing in the full fork does not establish independence. If verification cannot be completed, finish the inspectable preparation and report the limitation without claiming readiness.

## Prepare the handoff

Use the project's PR template when present. Read [handoff.md](references/handoff.md) for the minimum evidence and output. Present a focused summary, base/head and branch/worktree, prerequisite findings, verification evidence, limitations, and an editable PR title/body. State what remains in the fork and any expected follow-up discussion.

Do not push, open PRs, post comments, or message maintainers unless the user requests those actions. Existing explicit publication authorization remains valid within its scope; do not ask for it again. Never merge or force-push by implication. When preparation is the requested outcome, end with a concrete reviewable result, not a publication permission question.

## Companion app contract

The app's shared workflow, checklist IDs, and brief fields are in [workflow-contract.json](references/workflow-contract.json). Consult it when consuming an app brief or aligning an output with the field guide. It defines vocabulary and questions, not proof that work has been performed. A handwritten brief is equally valid; no app, account, or special integration is required.
