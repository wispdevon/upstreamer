# Companion skill validation

The source skill passes the skill-creator structural validator. Automated tests verify that its downloadable ZIP includes every source file and that its generated workflow/checklist/brief contract matches the app. Those checks validate packaging, not an agent's future decisions.

The following scenarios were reviewed against the instruction flow and references. This is a structured author review, not an independent model evaluation or a claim that real upstream contributions were performed.

| Scenario                                         | Required behavior                                                                                                                   | Instruction coverage                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Independent preference change                    | Verify upstream identity/base; isolate the preference; reuse existing settings; run meaningful checks; preserve attribution         | Establish contract; choose idea; extract; verify; handoff  |
| Tiny patch with hidden queue dependency          | Trace the fork-only service; adapt or propose prerequisites; do not call a clean cherry-pick independent                            | Dependency extraction reference, three-line button example |
| Dirty checkout with unrelated work               | Inspect status; preserve unrelated changes; use a separate upstream-based branch/worktree; do not stash/reset by assumption         | Choose/develop and extraction safeguards                   |
| Focused checks fail or a platform is unavailable | Investigate relevant failures; distinguish failed/blocked/not-run; never claim all tests pass or weaken checks                      | Verification section; handoff evidence table               |
| User requests preparation without publishing     | Finish the local contribution and draft; do not push, create PRs, contact maintainers, or end with unnecessary publication approval | Handoff and publication boundary                           |

Before wider distribution, run independent agent evaluations against isolated repositories for these scenarios and inspect resulting diffs, attribution, evidence, and external side effects. Real-world skill behavior depends on the executing model, repository instructions, task scope, tools, and permissions.
