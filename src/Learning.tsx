import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  Clock,
  CornerDownRight,
} from "lucide-react";
import { Arrow, PageHeading, TextLink } from "./ui";
import { useApp } from "./state";
import { examples, foundations, lessons, workflow } from "./content";

export function LearnPage() {
  const { state, setState } = useApp();
  const selected = state.path === "beginner" ? lessons : workflow;
  const done = selected.filter((lesson) =>
    state.completed.includes(lesson.id),
  ).length;
  return (
    <>
      <PageHeading
        title="Good contributions are learned."
        intro="A little project empathy. A clear idea. Evidence someone else can trust."
      />
      <fieldset className="path-selector">
        <legend>Choose your starting point</legend>
        {(["beginner", "fork"] as const).map((path) => (
          <label key={path}>
            <input
              type="radio"
              name="learning-path"
              checked={state.path === path}
              onChange={() => setState((old) => ({ ...old, path }))}
            />
            <span>
              {path === "beginner"
                ? "New to open source"
                : "Already building in a fork"}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="section-heading">
        <div>
          <h2>
            {state.path === "beginner"
              ? "From your first issue to a thoughtful handoff"
              : "From a working fork to a focused contribution"}
          </h2>
          <p>
            {state.path === "beginner"
              ? "Four foundations, followed by the six-part contribution workflow."
              : "Six lessons on extracting work that upstream can maintain. Foundations are always available."}
          </p>
        </div>
        <span className="quiet-count">
          {done} of {selected.length} complete
        </span>
      </div>
      <ol className="catalog-list">
        {selected.map((lesson, index) => (
          <li key={lesson.id}>
            <Link to={`/learn/${lesson.id}`}>
              <span
                className={`catalog-number ${state.completed.includes(lesson.id) ? "completed" : ""}`}
              >
                {state.completed.includes(lesson.id) ? (
                  <Check size={21} />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <div>
                <h3>{lesson.title}</h3>
                <p>{lesson.intro}</p>
              </div>
              <span className="duration">
                <Clock size={14} />
                {lesson.minutes} min
              </span>
              <Arrow />
            </Link>
          </li>
        ))}
      </ol>
      {state.path === "fork" && (
        <div className="callout">
          <h3>Need a refresher?</h3>
          <p>
            Get comfortable with project etiquette, forks, branches, and your
            first contribution.
          </p>
          <button
            className="text-link"
            onClick={() => setState((old) => ({ ...old, path: "beginner" }))}
          >
            Show the foundations
            <Arrow />
          </button>
        </div>
      )}
      <p className="small-print">
        Progress is a personal learning record. Finishing lessons does not
        certify a contribution as ready to merge.
      </p>
      <div className="further-reading">
        <h3>Keep exploring</h3>
        <p>
          Every project has its own conventions. These references provide useful
          background alongside its contribution guide.
        </p>
        <a
          className="text-link"
          href="https://opensource.guide/how-to-contribute/"
        >
          GitHub’s Open Source Guides
          <Arrow />
        </a>
        <a
          className="text-link"
          href="https://docs.github.com/en/pull-requests/reference/forks"
        >
          Understanding forks
          <Arrow />
        </a>
        <a
          className="text-link"
          href="https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork"
        >
          Pull requests from a fork
          <Arrow />
        </a>
      </div>
    </>
  );
}

export function LessonPage() {
  const { id } = useParams();
  const { state, setState } = useApp();
  const [choice, setChoice] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | "empty" | null>(null);
  const firstAnswer = useRef<HTMLButtonElement>(null);
  const lesson = lessons.find((item) => item.id === id);
  if (!lesson)
    return (
      <>
        <PageHeading
          title="Lesson not found."
          intro="Choose a lesson from either learning path."
        />
        <TextLink to="/learn">View the lessons</TextLink>
      </>
    );
  const sequence =
    state.path === "fork" && !lesson.foundation ? workflow : lessons;
  const index = sequence.findIndex((item) => item.id === lesson.id);
  const next = sequence[index + 1];
  const previous = sequence[index - 1];
  const complete = state.completed.includes(lesson.id);
  return (
    <>
      <div className="lesson-top">
        <Link className="text-link muted" to="/learn">
          ← All lessons
        </Link>
        <span className="duration">
          <Clock size={14} />
          {lesson.minutes} min read
        </span>
      </div>
      <div className="reading-layout">
        <article className="lesson-article">
          <p className="eyebrow">
            {lesson.foundation
              ? `Foundation ${foundations.findIndex((item) => item.id === lesson.id) + 1} of 4`
              : `Contribution habit ${workflow.findIndex((item) => item.id === lesson.id) + 1} of 6`}
          </p>
          <PageHeading title={lesson.title} intro={lesson.intro} />
          {lesson.sections.map((section) => (
            <section className="prose-section" key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          <aside className="example-callout">
            <p className="eyebrow">A fictional example</p>
            <p>{lesson.example}</p>
          </aside>
          <form
            className="exercise"
            onSubmit={(event) => {
              event.preventDefault();
              if (choice === null) {
                setResult("empty");
                firstAnswer.current?.focus();
                return;
              }
              const correct = choice === lesson.answer;
              setResult(correct ? "correct" : "incorrect");
              setState((old) => ({
                ...old,
                completed: correct
                  ? [...new Set([...old.completed, lesson.id])]
                  : old.completed.filter((value) => value !== lesson.id),
              }));
              if (!correct) {
                setChoice(null);
                firstAnswer.current?.focus();
              }
            }}
          >
            <fieldset>
              <legend>Put it into practice</legend>
              <p className="exercise-question" id="exercise-question">{lesson.question}</p>
              <div className="answer-options">
                {lesson.choices.map((text, i) => (
                  <button
                    className="answer"
                    type="button"
                    key={text}
                    ref={i === 0 ? firstAnswer : undefined}
                    aria-pressed={choice === i}
                    aria-describedby="exercise-question"
                    onClick={() => {
                      setChoice(i);
                      setResult(null);
                    }}
                  >
                    <span className="answer-marker" aria-hidden="true">
                      {choice === i ? <Check size={17} /> : String.fromCharCode(65 + i)}
                    </span>
                    <span>{text}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <button className="button secondary" type="submit">
              Check your thinking
              <Arrow />
            </button>
            {result && (
              <div
                className={`feedback ${result === "correct" ? "correct" : ""}`}
                role="status"
              >
                <strong>
                  {result === "correct"
                    ? "That’s the idea."
                    : result === "empty"
                      ? "Choose an answer before submitting."
                      : "Take another look."}
                </strong>
                {result !== "empty" && (
                  <p>
                    {result === "correct"
                      ? lesson.feedback
                      : `Consider this: ${lesson.feedback} Choose an answer and try again.`}
                  </p>
                )}
              </div>
            )}
          </form>
          {complete && (
            <p className="lesson-complete">
              <CheckCircle2 size={18} aria-hidden="true" />
              Lesson complete
            </p>
          )}
          <nav className="lesson-pagination" aria-label="Lesson navigation">
            <div>
              {previous && (
                <TextLink to={`/learn/${previous.id}`}>
                  ← {previous.title}
                </TextLink>
              )}
            </div>
            {complete && (
              <Link
                className="button primary"
                to={next ? `/learn/${next.id}` : "/studio"}
                aria-label={next ? `Next lesson: ${next.title}` : "Put it to work"}
              >
                {next ? "Next lesson" : "Put it to work"}
                <Arrow />
              </Link>
            )}
          </nav>
        </article>
        <aside className="reading-aside">
          <p className="eyebrow">Take it into your work</p>
          <h3>A lesson becomes useful when you apply it.</h3>
          <p>
            Keep one contribution in mind as you read. Use the checklist and
            draft together when you are ready to prepare a handoff.
          </p>
          <TextLink to="/studio">Open the contribution studio</TextLink>
          <hr />
          <p className="small-print">
            Jump to any lesson. Work at your own pace.
          </p>
          <TextLink to="/learn">See the full path</TextLink>
        </aside>
      </div>
    </>
  );
}

export function ExamplePage() {
  return (
    <>
      <PageHeading
        title="Small diff. Whole story."
        intro="Two fictional scenarios show why a focused contribution is about more than commit count."
      />
      <p className="fiction-label">
        <CornerDownRight size={17} />
        Teaching scenarios. These are not claims about a real project.
      </p>
      <div className="example-list">
        {examples.map((example, index) => (
          <article className="worked-example" key={example.id}>
            <div className="example-index">0{index + 1}</div>
            <div>
              <p className="eyebrow">{example.type}</p>
              <h2>{example.title}</h2>
              <p className="example-subtitle">{example.subtitle}</p>
              <p>{example.narrative}</p>
              <div className="example-takeaway">
                <strong>The contribution decision</strong>
                <p>{example.lesson}</p>
              </div>
              <TextLink to="/studio">Use the contribution studio</TextLink>
            </div>
          </article>
        ))}
      </div>
      <div className="callout">
        <h3>Have your own idea?</h3>
        <p>
          Use the contribution studio with your own project. Your review and
          draft stay on this device.
        </p>
        <TextLink to="/studio">Open the contribution studio</TextLink>
      </div>
    </>
  );
}
