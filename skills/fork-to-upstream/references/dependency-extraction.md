# Extracting an idea from a fork

Use the repository's conventions and inspect command effects before running them. These are decision criteria, not a fixed shell script.

1. Record the upstream repository identity and exact base commit. Inspect the fork's merge base, commits, and diff against that base. A fork may contain inherited work by other authors.
2. Describe the behavior to retain. Trace its execution paths into services, types, config, assets, migrations, generated files, and external dependencies. Search symbol definitions and inspect relevant history instead of relying on the selected commit's patch alone.
3. Classify each prerequisite as upstream-existing, included, separately required, or removed by adaptation. For migrations or data formats, account for compatibility and rollout requirements from the actual project.
4. Use a new upstream-based worktree when the source checkout has unrelated work or another active task. Give new branches and directories unique names. Do not move or delete another person's branches or worktrees.
5. Cherry-pick only when the commit is coherent and prerequisites are understood. For tangled commits, extract a patch or implement the behavior against upstream APIs. Preserve credit and explain meaningful deviations.
6. Verify fresh installation/build behavior where relevant, then changed behavior and regression checks. Inspect staged, unstaged, untracked, and ignored/generated dependencies as appropriate. A missing asset or configuration file can be invisible in a clean textual patch.

## Three-line button example

Fictional project: Lantern. A cancel button calls `ExportQueue.cancel()`. The queue exists only in the fork. The button applying cleanly does not make it upstream-ready.

- Inspect upstream's cancellation facilities before proposing a queue.
- If adaptation is feasible within the requested scope, implement and test it.
- Otherwise explain the queue prerequisite and propose a discussion or separate contribution. Include lifecycle, cleanup, and failure behavior in the dependency findings.
- Do not automatically bring the full fork's queue, renderer, settings page, and migrations into a supposedly tiny PR.

## Stop and report when necessary

- An upstream base cannot be identified: provide qualified local findings and the missing identifier.
- A conflict cannot be resolved without choosing new product behavior: explain the choice needed.
- Prerequisites require a broader architecture or policy exception: prepare a concrete recommendation for review.
- A command fails: inspect and report the cause, retry only after a relevant fix or changed condition, and avoid destructive cleanup.

In each case continue independent, useful preparation. Never convert a blocked check into a pass or claim maintainers have agreed without evidence.
