export type Lesson = {
  id: string;
  title: string;
  intro: string;
  minutes: number;
  foundation?: boolean;
  sections: { heading: string; body: string }[];
  example: string;
  question: string;
  choices: string[];
  answer: number;
  feedback: string;
};

export const lessons: Lesson[] = [
  {
    id: "find-your-project",
    title: "Find your place",
    foundation: true,
    minutes: 4,
    intro:
      "A useful contribution starts with a project you want to understand.",
    sections: [
      {
        heading: "Use it before changing it",
        body: "Try the project, read its getting-started guide, and reproduce a small problem. Documentation, accessibility fixes, and reproducible bug reports are contributions too. You do not need to begin with a new feature.",
      },
      {
        heading: "Look for a welcoming route in",
        body: "Read recent issues and pull requests. Notice how maintainers discuss changes, whether the project is active, and which work they have asked for. An issue label is a starting point, not a promise that any implementation will be accepted.",
      },
    ],
    example:
      "In our fictional project, Trail Notes, the setup guide skips an environment variable. You reproduce the problem and propose a two-line documentation fix before designing a whole new installer.",
    question: "Which is the strongest first contribution?",
    choices: [
      "A large feature you have not discussed",
      "A reproduced problem with a focused fix",
      "A rewrite of the project’s build system",
    ],
    answer: 1,
    feedback:
      "A reproduced problem gives the maintainer something concrete to assess, and a focused fix keeps the review manageable.",
  },
  {
    id: "read-the-room",
    title: "Read the room",
    foundation: true,
    minutes: 4,
    intro: "Every project has its own goals, conventions, and capacity.",
    sections: [
      {
        heading: "Find the contribution contract",
        body: "Read CONTRIBUTING, the code of conduct, issue templates, pull request templates, and any agent instructions. Check licensing and attribution requirements. Follow the project’s policy on AI-assisted contributions and disclose assistance when requested.",
      },
      {
        heading: "Ask with context",
        body: "Before substantial work, explain the user problem, your proposed scope, and the alternatives you considered in the project’s preferred channel. A maintainer may prefer a different approach or decide the feature belongs in a fork. Respect that answer.",
      },
    ],
    example:
      "Trail Notes asks contributors to discuss new export formats first. Instead of opening a completed PDF export PR, you share the use case and ask whether it fits the roadmap.",
    question:
      "The project requires feature discussion before implementation. What next?",
    choices: [
      "Open the PR and explain later",
      "Treat your fork as permission to bypass the rule",
      "Describe the problem in the requested discussion channel",
    ],
    answer: 2,
    feedback:
      "The project’s contribution process takes precedence. A fork gives you room to experiment, not an obligation for upstream to accept the result.",
  },
  {
    id: "fork-and-branch",
    title: "Understand forks and branches",
    foundation: true,
    minutes: 6,
    intro:
      "A fork is your space to explore. A branch is one line of work within it.",
    sections: [
      {
        heading: "Name the two repositories",
        body: "A fork is your copy of a repository on a host. In a common setup, origin points to your fork and upstream points to the original project. These are conventions, not guarantees: inspect the remote URLs and default branch before running commands.",
      },
      {
        heading: "Keep one branch per idea",
        body: "Create a dedicated branch from a known upstream revision for a contribution. Keep experiments in separate fork branches. Fetching updates downloads history; merging or rebasing changes your branch. Understand the difference before updating a shared branch.",
      },
    ],
    example:
      "Your fork has experiments in export-lab. For a small keyboard fix, create fix-export-focus from the verified upstream default branch, rather than bringing all of export-lab along.",
    question: "What does “origin” always mean?",
    choices: [
      "The original project",
      "Your fork",
      "A remote name whose URL you must inspect",
    ],
    answer: 2,
    feedback:
      "Remote names are labels. Inspect git remote -v and verify the upstream repository and branch instead of assuming them.",
  },
  {
    id: "first-contribution",
    title: "Make a small first contribution",
    foundation: true,
    minutes: 5,
    intro:
      "Complete the whole loop once: reproduce, change, verify, and explain.",
    sections: [
      {
        heading: "Establish a baseline",
        body: "Follow the project’s setup instructions and run the relevant checks before editing. Record existing failures so you can distinguish a regression from an environment problem. Never remove a failing check just to make a result look green.",
      },
      {
        heading: "Make the review easy",
        body: "Change only what solves the stated problem. Include an appropriate regression check, update related documentation, and read your final diff. In the handoff, explain the problem, resulting behavior, and exactly what you verified.",
      },
    ],
    example:
      "You correct Trail Notes’ setup instructions, try the documented steps in a clean environment, and report which command you ran and what happened. You leave an unrelated spelling cleanup for another change.",
    question:
      "A baseline check fails before your change. How should you report it?",
    choices: [
      "Hide it because you did not cause it",
      "Record the existing failure and separate it from your verification",
      "Delete the check",
    ],
    answer: 1,
    feedback:
      "Evidence includes limitations. Record the baseline failure, its impact on confidence, and which checks you could still complete.",
  },
  {
    id: "maintainer",
    title: "Start with the maintainer",
    minutes: 5,
    intro:
      "Your fork can serve your needs. Upstream needs a change it can own.",
    sections: [
      {
        heading: "Understand the long-term cost",
        body: "A feature brings documentation, compatibility expectations, support, tests, and future maintenance. Connect your proposal to the project’s goals and explain why the benefit is worth that cost. Treat the maintainer’s time as a limited resource.",
      },
      {
        heading: "Agree on the problem before the solution",
        body: "Check prior issues, closed PRs, roadmaps, and contribution guidance. For a substantial idea, ask whether the problem fits before investing in an upstream-ready implementation. Keep your fork useful even if upstream declines.",
      },
    ],
    example:
      "A fictional photo tool, Lantern, deliberately works offline. An account-based sharing feature may be useful in your fork but conflict with its goals. A local export improvement may fit better.",
    question:
      "A maintainer says your feature does not fit the project. What is a constructive response?",
    choices: [
      "Keep developing it in your fork and respect the decision",
      "Open several smaller PRs to introduce it indirectly",
      "Ask your agent to argue until they accept",
    ],
    answer: 0,
    feedback:
      "Respecting a boundary is part of contributing well. Smaller PRs should clarify a legitimate proposal, not conceal an unwanted feature.",
  },
  {
    id: "reviewable-idea",
    title: "Find one reviewable idea",
    minutes: 6,
    intro:
      "A contribution should have one reason to exist and a clear boundary.",
    sections: [
      {
        heading: "Describe an observable change",
        body: "Write one sentence explaining what a user can do after the change. Separate supporting work from unrelated improvements. A coherent idea may touch several files; line count alone does not define good scope.",
      },
      {
        heading: "Choose the smallest complete slice",
        body: "Make the slice useful, testable, and understandable on its own. A tiny diff that depends on half your fork is not independent. If several changes really belong together, explain the dependency or discuss a sequence with the maintainer.",
      },
    ],
    example:
      "Lantern’s export lab includes a new renderer, queue, and settings page. “Remember the last export folder” might be an independent improvement; “add a button that calls the fork-only queue” is not.",
    question: "Which measure best describes a focused contribution?",
    choices: [
      "Fewest possible commits",
      "Smallest possible line count",
      "One coherent behavior with explicit prerequisites",
    ],
    answer: 2,
    feedback:
      "Focus is about the behavior and its prerequisites. Commit count and diff size can help review, but do not prove independence.",
  },
  {
    id: "dependencies",
    title: "Make dependencies explicit",
    minutes: 7,
    intro: "Trace what the idea actually needs, then prove it from upstream.",
    sections: [
      {
        heading: "Follow the dependency chain",
        body: "Inspect imports, types, configuration, assets, database changes, generated files, and runtime assumptions. For each prerequisite, decide whether it already exists upstream, belongs in this change, needs a separate accepted prerequisite, or can be removed by adapting the implementation.",
      },
      {
        heading: "Verify on an upstream base",
        body: "Extract the idea onto a branch or worktree based on a recorded upstream revision. Install and build there using the project’s instructions. Passing in your full fork does not demonstrate that the contribution works independently.",
      },
    ],
    example:
      "A three-line “cancel export” button calls ExportQueue.cancel(), but ExportQueue exists only in the fork. The real scope includes a queue dependency or a redesign using upstream’s existing cancellation mechanism.",
    question:
      "A cherry-pick applies without conflicts. Is the contribution independent?",
    choices: [
      "Yes, Git has verified it",
      "Not yet: inspect dependencies and run it from upstream",
      "Yes, if the commit is small",
    ],
    answer: 1,
    feedback:
      "Git checks textual application, not semantic dependencies. Verify imports, runtime assumptions, and relevant behavior in the upstream-based checkout.",
  },
  {
    id: "history",
    title: "Keep history honest",
    minutes: 6,
    intro: "Shape history for review while preserving credit and intent.",
    sections: [
      {
        heading: "Inspect before editing history",
        body: "Read the project’s commit conventions and inspect your branch against its actual base. Identify unrelated work and contributions by others. Preserve authorship, license notices, and required sign-offs. Do not claim someone else’s work as your own.",
      },
      {
        heading: "Choose an extraction method deliberately",
        body: "A cherry-pick is useful for independent commits; a patch or reimplementation may be clearer when changes are tangled. Squashing does not remove dependencies. Avoid rewriting shared history without coordination and never force-push someone else’s branch.",
      },
    ],
    example:
      "Your fork inherited another contributor’s parser fix. If your export feature needs it, preserve attribution and explain the prerequisite. Squashing both into a new commit under your name would hide both history and scope.",
    question: "Does squashing 40 commits into one make a feature independent?",
    choices: [
      "No: the same code dependencies can remain",
      "Yes: one commit means one idea",
      "Only if the commit message is short",
    ],
    answer: 0,
    feedback:
      "Squashing changes presentation. Independence comes from what the code needs and what works against the upstream baseline.",
  },
  {
    id: "evidence",
    title: "Prove what you claim",
    minutes: 6,
    intro: "A trustworthy handoff distinguishes checked, failed, and untested.",
    sections: [
      {
        heading: "Test the actual contribution",
        body: "Run checks appropriate to the change in the upstream-based checkout. Include a meaningful regression test for changed behavior and use runtime checks for UI changes. Record the exact command, result, and tested revision; a command you recommend is not a command you ran.",
      },
      {
        heading: "Report uncertainty plainly",
        body: "If a tool, credential, platform, or dependency prevents verification, say what is blocked and what remains unknown. A successful build does not prove every runtime path. Do not convert skipped checks into passing evidence.",
      },
    ],
    example:
      "You ran the export unit suite on Linux and it passed. You could not test the macOS file picker. Your handoff states both, instead of claiming “tested on all platforms.”",
    question: "How should an unavailable platform check appear in the PR?",
    choices: [
      "As passed because CI will probably handle it",
      "Omitted to keep the description short",
      "Untested, with the limitation and suggested follow-up",
    ],
    answer: 2,
    feedback:
      "Honest limitations help the maintainer decide what to verify. Evidence should describe observations, not optimistic predictions.",
  },
  {
    id: "handoff",
    title: "Write the handoff",
    minutes: 5,
    intro: "Help another person understand, verify, and maintain the change.",
    sections: [
      {
        heading: "Explain the problem and resulting behavior",
        body: "Lead with the concrete user problem. Describe what changes, why this approach fits, and any tradeoffs. Link the relevant issue or discussion and follow the project’s PR template. Clearly state prerequisites and what remains in your fork.",
      },
      {
        heading: "Stay available for the review",
        body: "Share verification evidence, risks, and limitations. Respond to feedback without treating acceptance as owed. Make requested changes in the project’s preferred way and ask before expanding scope. A declined PR can still teach you something useful.",
      },
    ],
    example:
      "“Remember the last export folder” explains the repeated folder-selection problem, stores the preference using upstream’s existing settings service, lists the tests actually run, and explicitly excludes the fork’s export queue.",
    question: "What belongs in an effective PR description?",
    choices: [
      "Every step of your agent conversation",
      "Problem, behavior, prerequisites, evidence, and limitations",
      "Only “all tests pass”",
    ],
    answer: 1,
    feedback:
      "Write for a reviewer who was not in your development session. The handoff should make the contribution understandable and its evidence inspectable.",
  },
];

export const workflow = lessons.filter((lesson) => !lesson.foundation);
export const foundations = lessons.filter((lesson) => lesson.foundation);

export const quickProcess = [
  {
    id: "identify",
    title: "Identify a problem",
    detail:
      "Choose a problem or improvement you can confidently address.",
  },
  {
    id: "branch",
    title: "Update your fork, then branch",
    detail:
      "Make sure your fork is up to date, then create a feature branch for the work.",
  },
  {
    id: "explore",
    title: "Explore the wider effects",
    detail:
      "Consider alternate solutions, important constraints, and effects on related systems or features.",
  },
  {
    id: "focus",
    title: "Keep the change small",
    detail:
      "Make the smallest complete change possible. Avoid scope creep.",
  },
  {
    id: "handoff",
    title: "Explain the PR plainly",
    detail:
      "Write a concise PR that explains the problem, the change, and what you verified.",
  },
] as const;

export const featuredPullRequest = {
  title: "Keep multi-line help intact in Fish completion",
  description:
    "Fish uses newlines to separate completion results and tabs to separate help text. This change escapes embedded newlines, normalizes tabs in the help, and adds a regression test for multi-line descriptions.",
  fork: "sitiyou/click",
  branch: "fix-fish-completion",
  upstream: "pallets/click",
  base: "main",
  url: "https://github.com/pallets/click/pull/3504",
  merged: "Merged 23 May 2026",
  commits: "2 commits",
  files: "2 files",
} as const;

export const checks = [
  {
    id: "project-fit",
    title: "The change fits the project",
    detail:
      "Read contribution guidance and link the relevant issue or discussion. Account for the project’s AI contribution policy.",
  },
  {
    id: "focused-scope",
    title: "There is one clear, reviewable idea",
    detail:
      "Describe the behavior and explain what stays in the fork. Remove unrelated cleanup.",
  },
  {
    id: "dependencies",
    title: "Every prerequisite is accounted for",
    detail:
      "Trace code, configuration, assets, migrations, and runtime assumptions. State any required earlier PR.",
  },
  {
    id: "upstream-base",
    title: "The contribution works from upstream",
    detail:
      "Record the upstream base revision and verify the extracted change in an upstream-based checkout.",
  },
  {
    id: "attribution",
    title: "History and attribution are honest",
    detail:
      "Preserve authorship, license notices, and required sign-offs. Follow the project’s history conventions.",
  },
  {
    id: "verification",
    title: "Verification is backed by evidence",
    detail:
      "Record actual commands and outcomes. Distinguish failures and untested areas from passing checks.",
  },
  {
    id: "documentation",
    title: "Tests and documentation match the behavior",
    detail:
      "Add a meaningful regression check and update user-facing guidance when relevant.",
  },
  {
    id: "handoff",
    title: "The maintainer has a clear handoff",
    detail:
      "Explain the problem, behavior, dependencies, risks, and limitations using the project’s PR template.",
  },
] as const;

export const examples: {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  narrative: string;
  lesson: string;
}[] = [
  {
    id: "independent",
    title: "A preference that stands on its own",
    subtitle: "Remember the last export folder",
    type: "Independent improvement",
    narrative:
      "Lantern is a fictional photo application. A personal fork adds a batch-export queue, new presets, and a preference that remembers the last destination. Only the preference fits the agreed upstream scope.",
    lesson:
      "Reuse upstream’s settings service. Extract the preference without the queue, presets, or new renderer, then verify it on the upstream base.",
  },
  {
    id: "hidden-dependency",
    title: "The three-line change with a long tail",
    subtitle: "Add a cancel-export button",
    type: "Hidden fork dependency",
    narrative:
      "In the fictional Lantern fork, a tiny cancel button calls ExportQueue.cancel(). The commit applies cleanly to upstream, but the queue service only exists in the fork. A small diff has concealed a substantial prerequisite.",
    lesson:
      "Trace the call into the fork-only queue. Discuss a prerequisite contribution or adapt to upstream’s cancellation mechanism before calling the button independent.",
  },
];
