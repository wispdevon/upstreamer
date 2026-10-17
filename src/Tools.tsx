import { useState } from "react";
import {
  ClipboardCheck,
  Copy,
  Download,
  GitBranch,
  Sparkles,
} from "lucide-react";
import { checks } from "./content";
import { createDraftTemplate, downloadText } from "./model";
import type { ReviewStatus } from "./model";
import { useApp } from "./state";
import { Arrow, PageHeading, TextLink } from "./ui";

export function StudioPage() {
  const { state, setState } = useApp();
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [message, setMessage] = useState("");
  const text = state.draft ?? createDraftTemplate();
  const considered = checks.filter(
    (check) =>
      state.review[check.id] === "satisfied" ||
      state.review[check.id] === "not-applicable",
  ).length;
  const unchecked = checks.length - considered;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Draft copied to clipboard.");
    } catch {
      setMode("edit");
      setMessage(
        "Clipboard is unavailable. Select the draft text to copy it, or download the Markdown file.",
      );
    }
  };

  return (
    <>
      <PageHeading
        title="Review the change. Write the handoff."
        intro="Keep the maintainer’s questions beside the contribution draft. A checked item is a reminder, not evidence that the work is ready."
      />
      <div className="studio-layout">
        <section className="studio-review" aria-labelledby="studio-review-title">
          <div className="studio-section-heading">
            <span className="studio-icon">
              <ClipboardCheck size={19} />
            </span>
            <div>
              <p className="eyebrow">Self-review</p>
              <h2 id="studio-review-title">Review checklist</h2>
            </div>
            <span className="quiet-count">
              {considered} / {checks.length}
            </span>
          </div>
          <p className="small-print">
            {unchecked
              ? `${unchecked} question${unchecked === 1 ? "" : "s"} still unchecked. Carry gaps into the draft.`
              : "All questions considered. This is a self-review, not an approval."}
          </p>
          <div className="review-list">
            {checks.map((check, index) => (
              <fieldset className="review-item" key={check.id}>
                <legend>
                  <span className="field-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
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
                        checked={
                          (state.review[check.id] ?? "unchecked") === value
                        }
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
          <p className="small-print studio-review-note">
            Explain any “not applicable” answers and keep the evidence visible.
            The checklist does not certify merge readiness.
          </p>
        </section>

        <section className="studio-draft" aria-labelledby="studio-draft-title">
          <div className="studio-section-heading">
            <span className="studio-icon">
              <GitBranch size={19} />
            </span>
            <div>
              <p className="eyebrow">Handoff</p>
              <h2 id="studio-draft-title">Contribution draft</h2>
            </div>
          </div>
          <p className="small-print">
            Write for a maintainer who was not in your development session.
            Record actual results; the starter text never claims checks passed.
          </p>
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
          </div>
          {mode === "edit" ? (
            <>
              <label
                className="visually-hidden"
                htmlFor="studio-draft-editor"
              >
                Contribution draft in Markdown
              </label>
              <textarea
                className="draft-editor"
                id="studio-draft-editor"
                name="studio-draft-editor"
                rows={24}
                value={text}
                spellCheck
                onChange={(event) =>
                  setState((old) => ({ ...old, draft: event.target.value }))
                }
              />
            </>
          ) : (
            <div className="draft-preview" aria-label="Draft reading view">
              {text.split(/\n\n/).map((block, index) => {
                if (block.startsWith("# ")) {
                  return <h2 key={index}>{block.slice(2)}</h2>;
                }
                if (block.startsWith("## ")) {
                  return <h3 key={index}>{block.slice(3)}</h3>;
                }
                return <p key={index}>{block}</p>;
              })}
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
                  downloadText("contribution-draft.md", text);
                  setMessage("Markdown download started.");
                }}
              >
                <Download size={17} />
                Download Markdown
              </button>
            </div>
            <p className="small-print">
              Your checklist and draft save on this device.
            </p>
          </div>
          <p className="action-message" role="status">
            {message}
          </p>
        </section>
      </div>
    </>
  );
}

export function SkillPage() {
  const [copied, setCopied] = useState("");
  const prompt =
    "Use $fork-to-upstream to prepare one focused contribution from this fork. Inspect project rules and the upstream base, identify dependencies, implement and verify the change, and prepare an evidence-backed PR draft. Do not publish it.";
  return (
    <>
      <PageHeading
        title="Give your agent a better way upstream."
        intro="A companion Codex skill for working in a real repository. Explore in your fork. Hand over something maintainable."
      />
      <section className="skill-intro">
        <div className="skill-symbol">
          <GitBranch size={40} strokeWidth={1.4} />
        </div>
        <div>
          <p className="eyebrow">The companion skill</p>
          <h2>fork-to-upstream</h2>
          <p>
            Prepares a focused contribution, from project context to an
            evidence-backed PR draft. You stay in control of publication.
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
            <h2>Bring your project context.</h2>
            <p>
              Give the agent the repository’s contribution rules, the problem
              you observed, and any decisions already made. It will check those
              assumptions against the project and report what it verifies.
            </p>
            <TextLink to="/studio">Open the contribution studio</TextLink>
          </section>
        </article>
        <aside className="tool-aside">
          <p className="eyebrow">Built for responsible preparation</p>
          <h3>No publication by default.</h3>
          <p>
            The skill can inspect, change, and verify work in the repository. It
            does not push, open a pull request, contact maintainers, or merge
            unless explicitly asked.
          </p>
          <div className="skill-symbol">
            <Sparkles size={30} strokeWidth={1.4} />
          </div>
        </aside>
      </div>
    </>
  );
}
