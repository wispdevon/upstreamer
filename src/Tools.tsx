import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Copy,
  Download,
  GitBranch,
  NotebookPen,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Arrow, PageHeading, TextLink } from "./ui";
import { useApp } from "./state";
import { briefFields, checks, lessons } from "./content";
import { createState, downloadText, generateDraft } from "./model";
import type { ReviewStatus } from "./model";

export function WorkbenchPage() {
  const { state, setState } = useApp();
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const filled = briefFields.filter((field) =>
    state.brief[field.key].trim(),
  ).length;
  return (
    <>
      <PageHeading
        title="One idea. A clear way upstream."
        intro="Work through the boundaries before you work through the diff. This brief is for you, your agent, and your future reviewer."
      />
      <div className="tool-toolbar">
        <span>
          <GitBranch size={17} />
          Your active contribution
          <span className="quiet-count">
            {filled} / {briefFields.length} fields started
          </span>
        </span>
        <button
          className="text-link muted"
          onClick={() => setResetting(!resetting)}
        >
          Start a new brief
        </button>
      </div>
      {resetting && (
        <div className="callout" role="alert">
          <h3>Start again?</h3>
          <p>
            This clears your active brief, review answers, and draft. Your
            learning progress and notes stay saved.
          </p>
          <div className="actions">
            <button
              className="button primary"
              onClick={() => {
                setState((old) => ({
                  ...old,
                  brief: createState().brief,
                  review: {},
                  draft: null,
                }));
                setResetting(false);
                setMessage("New brief started.");
              }}
            >
              Clear and start fresh
            </button>
            <button
              className="button secondary"
              onClick={() => setResetting(false)}
            >
              Keep my work
            </button>
            <button
              className="text-link"
              onClick={() =>
                downloadText(
                  "contribution-brief.md",
                  generateDraft(state.brief),
                )
              }
            >
              Export brief first
              <Download size={17} />
            </button>
          </div>
        </div>
      )}
      <p role="status" className="small-print">
        {message}
      </p>
      <div className="tool-layout">
        <form
          className="brief-form"
          onSubmit={(event) => event.preventDefault()}
          aria-label="Contribution brief"
        >
          {briefFields.map((field, index) => (
            <div className="brief-field" key={field.key}>
              <div className="field-index">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <label htmlFor={`brief-${field.key}`}>{field.label}</label>
                <p className="field-hint" id={`hint-${field.key}`}>
                  {field.hint}
                </p>
                {field.key === "title" || field.key === "base" ? (
                  <input
                    id={`brief-${field.key}`}
                    name={field.key}
                    value={state.brief[field.key]}
                    placeholder={field.placeholder}
                    aria-describedby={`hint-${field.key}`}
                    onChange={(event) =>
                      setState((old) => ({
                        ...old,
                        brief: {
                          ...old.brief,
                          [field.key]: event.target.value,
                        },
                      }))
                    }
                  />
                ) : (
                  <textarea
                    rows={field.key === "evidence" ? 5 : 3}
                    id={`brief-${field.key}`}
                    name={field.key}
                    value={state.brief[field.key]}
                    placeholder={field.placeholder}
                    aria-describedby={`hint-${field.key}`}
                    onChange={(event) =>
                      setState((old) => ({
                        ...old,
                        brief: {
                          ...old.brief,
                          [field.key]: event.target.value,
                        },
                      }))
                    }
                  />
                )}
              </div>
            </div>
          ))}
          <div className="actions form-actions">
            <Link className="button primary" to="/review">
              Review your contribution
              <Arrow />
            </Link>
            <button
              className="button secondary"
              type="button"
              onClick={() =>
                downloadText(
                  "contribution-brief.md",
                  generateDraft(state.brief),
                )
              }
            >
              Export brief
              <Download size={17} />
            </button>
          </div>
        </form>
        <aside className="tool-aside">
          <p className="eyebrow">A useful constraint</p>
          <h3>Make the idea independent, not just the commit small.</h3>
          <p>
            Check what the code imports, what it assumes, and what only exists
            in your fork.
          </p>
          <TextLink to="/learn/dependencies">Revisit dependencies</TextLink>
          <hr />
          <h3>Start with an example</h3>
          <p>
            See a clean extraction and a tiny patch with a hidden prerequisite.
          </p>
          <TextLink to="/examples">Explore worked examples</TextLink>
          <hr />
          <p className="small-print">
            This tool organizes what you know. It does not inspect repositories
            or run checks. Record actual evidence, including failures.
          </p>
        </aside>
      </div>
    </>
  );
}

export function ReviewPage() {
  const { state, setState } = useApp();
  const resolved = checks.filter(
    (check) =>
      state.review[check.id] === "satisfied" ||
      state.review[check.id] === "not-applicable",
  ).length;
  return (
    <>
      <PageHeading
        title="Give your reviewer a fair start."
        intro="Use these questions to find gaps in the handoff. A checked box is a reminder, not evidence that the work is ready."
      />
      <div className="review-summary">
        <div>
          <span className="eyebrow">Your contribution</span>
          <h2>{state.brief.title || "An idea taking shape"}</h2>
        </div>
        <span>
          {resolved} of {checks.length} considered
        </span>
      </div>
      <div className="review-list">
        {checks.map((check, i) => (
          <fieldset className="review-item" key={check.id}>
            <legend>
              <span className="field-index">0{i + 1}</span>
              {check.title}
            </legend>
            <p>{check.detail}</p>
            <div className="review-options">
              {(
                ["unchecked", "satisfied", "not-applicable"] as ReviewStatus[]
              ).map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name={check.id}
                    value={value}
                    checked={(state.review[check.id] ?? "unchecked") === value}
                    onChange={() =>
                      setState((old) => ({
                        ...old,
                        review: { ...old.review, [check.id]: value },
                      }))
                    }
                  />
                  <span>
                    {value === "unchecked"
                      ? "Not yet checked"
                      : value === "satisfied"
                        ? "Satisfied"
                        : "Not applicable"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="callout">
        <h3>
          {resolved === checks.length
            ? "Your questions are considered. Keep the evidence visible."
            : "Unanswered questions are useful findings."}
        </h3>
        <p>
          {resolved === checks.length
            ? "This is a self-review, not an approval. Make sure your brief explains any not-applicable items and that your draft matches actual results."
            : "You can still write a draft. Carry missing checks and unresolved dependencies into the limitations instead of hiding them."}
        </p>
        <div className="actions">
          <Link className="button primary" to="/draft">
            Shape the handoff
            <Arrow />
          </Link>
          <TextLink to="/workbench">Back to your brief</TextLink>
        </div>
      </div>
    </>
  );
}

export function DraftPage() {
  const { state, setState } = useApp();
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [message, setMessage] = useState("");
  const text = state.draft ?? generateDraft(state.brief);
  const unresolved = checks.filter(
    (check) =>
      !state.review[check.id] || state.review[check.id] === "unchecked",
  ).length;
  const regenerate = () => {
    setState((old) => ({ ...old, draft: generateDraft(old.brief) }));
    setConfirmRegenerate(false);
    setMessage("Draft rebuilt from the current brief.");
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Draft copied to clipboard.");
    } catch {
      setMessage(
        "Clipboard is unavailable. Select the draft text to copy it, or download the Markdown file.",
      );
      setMode("edit");
    }
  };
  return (
    <>
      <PageHeading
        title="Write the handoff, not the history."
        intro="Give the maintainer enough context to understand, verify, and own your change. Adapt this draft to the project’s PR template."
      />
      <div className="draft-context">
        <p>
          <strong>
            {unresolved
              ? `${unresolved} review questions still unchecked.`
              : "All review questions considered."}
          </strong>{" "}
          {!state.brief.evidence.trim()
            ? "Verification evidence is missing; the draft says so."
            : "Keep the verification section faithful to the checks you actually ran."}
        </p>
        <TextLink to="/review">Review checklist</TextLink>
      </div>
      <div className="draft-toolbar">
        <div className="view-switch" role="group" aria-label="Draft view">
          <button
            aria-pressed={mode === "edit"}
            onClick={() => setMode("edit")}
          >
            Edit Markdown
          </button>
          <button
            aria-pressed={mode === "preview"}
            onClick={() => setMode("preview")}
          >
            Read draft
          </button>
        </div>
        <button
          className="text-link"
          onClick={() =>
            state.draft === null ? regenerate() : setConfirmRegenerate(true)
          }
        >
          <RefreshCw size={16} />
          Rebuild from brief
        </button>
      </div>
      {confirmRegenerate && (
        <div className="replace-confirm" role="alert">
          <p>Rebuilding replaces your draft edits with the current brief.</p>
          <div className="actions">
            <button className="button primary" onClick={regenerate}>
              Replace draft
            </button>
            <button
              className="button secondary"
              onClick={() => setConfirmRegenerate(false)}
            >
              Keep edits
            </button>
          </div>
        </div>
      )}
      {mode === "edit" ? (
        <>
          <label className="visually-hidden" htmlFor="pr-draft">
            Pull request draft
          </label>
          <textarea
            className="draft-editor"
            id="pr-draft"
            name="pr-draft"
            rows={27}
            value={text}
            spellCheck
            onChange={(event) =>
              setState((old) => ({ ...old, draft: event.target.value }))
            }
          />
        </>
      ) : (
        <div className="draft-preview" aria-label="Draft reading view">
          {text
            .split(/\n\n/)
            .map((block, i) =>
              block.startsWith("# ") ? (
                <h2 key={i}>{block.slice(2)}</h2>
              ) : block.startsWith("## ") ? (
                <h3 key={i}>{block.slice(3)}</h3>
              ) : (
                <p key={i}>{block}</p>
              ),
            )}
        </div>
      )}
      <div className="draft-actions">
        <div className="actions">
          <button className="button primary" onClick={copy}>
            <Copy size={17} />
            Copy draft
          </button>
          <button
            className="button secondary"
            onClick={() => {
              downloadText("pull-request-draft.md", text);
              setMessage("Markdown download started.");
            }}
          >
            <Download size={17} />
            Download Markdown
          </button>
        </div>
        <p className="small-print">
          Draft edits stay separate from your brief. Rebuild explicitly when you
          want to bring in brief changes.
        </p>
      </div>
      <p className="action-message" role="status">
        {message}
      </p>
    </>
  );
}

export function NotesPage() {
  const { state, setState } = useApp();
  const saved = lessons.filter((lesson) => state.notes[lesson.id]?.trim());
  const exportNotes = () =>
    downloadText(
      "upstream-field-notes.md",
      `# Your field notes\n\n${state.scratchpad}\n\n${saved.map((lesson) => `## ${lesson.title}\n\n${state.notes[lesson.id]}`).join("\n\n")}`,
    );
  return (
    <>
      <PageHeading
        title="Keep the things you notice."
        intro="Questions, commands, and ideas for the next contribution. A field notebook that stays on this device."
      />
      <div className="notes-toolbar">
        <span>
          <NotebookPen size={18} />
          Your working notebook
        </span>
        <button className="text-link" onClick={exportNotes}>
          Export notes
          <Download size={17} />
        </button>
      </div>
      <label htmlFor="scratchpad" className="field-label">
        Loose notes
      </label>
      <textarea
        className="scratchpad"
        id="scratchpad"
        name="scratchpad"
        value={state.scratchpad}
        rows={8}
        placeholder="A project to explore. A dependency to trace. A question to ask the maintainer…"
        onChange={(event) =>
          setState((old) => ({ ...old, scratchpad: event.target.value }))
        }
      />
      <div className="section-heading">
        <h2>Along the learning path</h2>
        <span className="quiet-count">{saved.length} lessons with notes</span>
      </div>
      {saved.length ? (
        saved.map((lesson) => (
          <section className="note-entry" key={lesson.id}>
            <div>
              <h3>
                <Link to={`/learn/${lesson.id}`}>{lesson.title}</Link>
              </h3>
              <TextLink to={`/learn/${lesson.id}`}>Revisit lesson</TextLink>
            </div>
            <label className="visually-hidden" htmlFor={`note-${lesson.id}`}>
              {lesson.title} notes
            </label>
            <textarea
              id={`note-${lesson.id}`}
              name={`note-${lesson.id}`}
              rows={3}
              value={state.notes[lesson.id]}
              onChange={(event) =>
                setState((old) => ({
                  ...old,
                  notes: { ...old.notes, [lesson.id]: event.target.value },
                }))
              }
            />
          </section>
        ))
      ) : (
        <div className="empty-state">
          <NotebookPen size={27} />
          <h3>Your observations belong here.</h3>
          <p>
            Add notes as you read a lesson. They’ll gather here, ready for the
            next time you need them.
          </p>
          <TextLink to="/learn">Find your starting point</TextLink>
        </div>
      )}
    </>
  );
}

export function SkillPage() {
  const [copied, setCopied] = useState("");
  const prompt =
    "Use $fork-to-upstream to prepare one focused contribution from this fork. Inspect the project rules and upstream base, identify dependencies, implement and verify the smallest complete change, and prepare a PR draft. Do not publish it.";
  return (
    <>
      <PageHeading
        title="Give your agent a better way upstream."
        intro="A companion Codex skill that brings the field guide into a real repository. Explore in your fork. Hand over something maintainable."
      />
      <section className="skill-intro">
        <div className="skill-symbol">
          <GitBranch size={40} strokeWidth={1.4} />
        </div>
        <div>
          <p className="eyebrow">The companion skill</p>
          <h2>fork-to-upstream</h2>
          <p>
            Prepares a contribution, from project context to an evidence-backed
            PR draft. You stay in control of publication.
          </p>
          <a
            className="button primary"
            href="/downloads/fork-to-upstream.zip"
            download
          >
            <Download size={17} />
            Download Codex skill
          </a>
        </div>
      </section>
      <div className="reading-layout">
        <article className="lesson-article">
          <section className="prose-section">
            <h2>Built around the same six habits.</h2>
            <ol className="skill-steps">
              <li>
                <strong>Understand the project.</strong> Read instructions,
                contribution rules, licensing, and the project’s AI policy.
              </li>
              <li>
                <strong>Choose one reviewable idea.</strong> Connect the change
                to upstream’s goals and agree on its boundaries.
              </li>
              <li>
                <strong>Trace prerequisites.</strong> Identify fork-only code
                and decide what belongs in this contribution or an earlier one.
              </li>
              <li>
                <strong>Extract honestly.</strong> Use an upstream-based branch
                or isolated worktree and preserve attribution.
              </li>
              <li>
                <strong>Verify the actual change.</strong> Record commands,
                revisions, outcomes, and what remains untested.
              </li>
              <li>
                <strong>Prepare the handoff.</strong> Explain behavior, scope,
                dependencies, evidence, and limitations.
              </li>
            </ol>
          </section>
          <section className="prose-section">
            <h2>Install it in Codex.</h2>
            <ol className="install-steps">
              <li>
                Download and unzip the package. Keep the{" "}
                <code>fork-to-upstream</code> folder intact.
              </li>
              <li>
                Place that folder inside <code>~/.agents/skills/</code> for
                personal use, or <code>.agents/skills/</code> at your repository
                root for project use.
              </li>
              <li>
                Invoke <code>$fork-to-upstream</code> in your project. Codex
                discovers local skills automatically; restart Codex if the skill
                does not appear.
              </li>
            </ol>
            <a
              className="text-link"
              href="https://learn.chatgpt.com/docs/build-skills"
            >
              Official Codex skill installation guidance
              <Arrow />
            </a>
          </section>
          <section className="prose-section">
            <h2>Start with a concrete request.</h2>
            <div className="prompt-box">
              <p>{prompt}</p>
              <button
                className="text-link"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(prompt);
                    setCopied("Prompt copied.");
                  } catch {
                    setCopied("Select the prompt text to copy it.");
                  }
                }}
              >
                <Copy size={16} />
                Copy starter prompt
              </button>
            </div>
            <p role="status">{copied}</p>
          </section>
          <section className="prose-section">
            <h2>Bring your brief along.</h2>
            <p>
              Export your workbench brief as Markdown and give it to the agent
              with your request. The app and skill share the same contribution
              questions. The agent will verify your assumptions against the
              repository instead of treating the brief as proof.
            </p>
            <TextLink to="/workbench">Build your contribution brief</TextLink>
          </section>
        </article>
        <aside className="tool-aside">
          <Sparkles size={23} />
          <h3>Preparation, with clear boundaries.</h3>
          <p>
            The skill can edit and test code within your requested scope. It
            preserves unrelated work and follows repository-specific
            instructions.
          </p>
          <p>
            Pushing branches, opening PRs, and messaging maintainers require a
            user request. When context or prerequisites are missing, it reports
            the gap.
          </p>
          <hr />
          <p className="eyebrow">What you receive</p>
          <ul className="plain-list">
            <li>
              <Check size={15} />A focused contribution branch
            </li>
            <li>
              <Check size={15} />
              Dependency findings
            </li>
            <li>
              <Check size={15} />
              Actual verification results
            </li>
            <li>
              <Check size={15} />
              An editable PR handoff
            </li>
          </ul>
          <p className="small-print">
            An agent can prepare a contribution. Acceptance belongs to the
            project’s maintainers.
          </p>
        </aside>
      </div>
    </>
  );
}
