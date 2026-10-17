import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  FileText,
  GitBranch,
  House,
  Moon,
  NotebookPen,
  PenLine,
  Save,
  Sparkles,
  Sun,
} from "lucide-react";
import { foundations, lessons, workflow } from "./content";
import { StateContext, useApp, usePersistentState } from "./state";
import { Arrow, PageHeading, TextLink } from "./ui";
import { ExamplePage, LearnPage, LessonPage } from "./Learning";
import {
  DraftPage,
  NotesPage,
  ReviewPage,
  SkillPage,
  WorkbenchPage,
} from "./Tools";
import "./App.css";

const navigation = [
  { to: "/", label: "Start here", icon: House },
  { to: "/learn", label: "Learn the workflow", icon: BookOpen },
  { to: "/examples", label: "Worked examples", icon: FileText },
  { to: "/workbench", label: "PR workbench", icon: GitBranch },
  { to: "/review", label: "Review checklist", icon: ClipboardCheck },
  { to: "/draft", label: "Draft studio", icon: PenLine },
  { to: "/skill", label: "Agent skill", icon: Sparkles },
  { to: "/notes", label: "Field notes", icon: NotebookPen },
];

type ThemeChoice = "light" | "dark";

const themeStorageKey = "upstreamer-theme";

function readThemeOverride(): ThemeChoice | null {
  const value = document.querySelector<HTMLMetaElement>(
    'meta[name="color-scheme"]',
  )?.content;
  return value === "light" || value === "dark" ? value : null;
}

function ThemeToggle() {
  const [override, setOverride] = useState<ThemeChoice | null>(
    readThemeOverride,
  );
  const [systemTheme, setSystemTheme] = useState<ThemeChoice>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );
  const theme = override ?? systemTheme;
  const nextTheme = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () =>
      setSystemTheme(media.matches ? "dark" : "light");
    const updateFromStorage = (event: StorageEvent) => {
      if (event.key !== themeStorageKey && event.key !== null) return;
      setOverride(
        event.newValue === "light" || event.newValue === "dark"
          ? event.newValue
          : null,
      );
    };

    media.addEventListener("change", updateSystemTheme);
    window.addEventListener("storage", updateFromStorage);
    return () => {
      media.removeEventListener("change", updateSystemTheme);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, []);

  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="color-scheme"]',
    );
    if (meta) meta.content = override ?? "light dark";

    try {
      if (override) window.localStorage.setItem(themeStorageKey, override);
      else window.localStorage.removeItem(themeStorageKey);
    } catch {
      // The theme still works for this session when storage is unavailable.
    }
  }, [override]);

  useEffect(() => {
    const themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (themeColor) {
      themeColor.content = theme === "dark" ? "#1b1d19" : "#f8f7f3";
    }
  }, [theme]);

  const Icon = theme === "dark" ? Sun : Moon;
  const label = `Switch to ${nextTheme} mode`;
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => setOverride(nextTheme === systemTheme ? null : nextTheme)}
      aria-label={label}
      title={label}
    >
      <Icon size={17} aria-hidden="true" />
      <span className="theme-toggle-label-full">
        {nextTheme === "dark" ? "Dark mode" : "Light mode"}
      </span>
      <span className="theme-toggle-label-short">
        {nextTheme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}

function ForkDiagram() {
  return (
    <figure className="fork-diagram">
      <svg
        viewBox="0 0 620 260"
        role="img"
        aria-labelledby="fork-title fork-desc"
      >
        <title id="fork-title">
          Explore in your fork. Contribute a focused idea back.
        </title>
        <desc id="fork-desc">
          Upstream moves forward while your fork branches away for
          experimentation and returns with a focused contribution.
        </desc>
        <path className="main-line" d="M20 95H598m-11-10 11 10-11 10" />
        <path
          className="branch-line"
          d="M140 95C202 95 175 190 255 190H410C493 190 460 95 535 95"
        />
        {[65, 140, 245, 360].map((x) => (
          <circle className="upstream-node" key={x} cx={x} cy="95" r="8" />
        ))}
        {[255, 330, 410].map((x) => (
          <circle className="fork-node" key={x} cx={x} cy="190" r="8" />
        ))}
        <circle className="merge-node" cx="535" cy="95" r="9" />
        <path className="dashed-line" d="M535 48v31" />
        <text className="diagram-title" x="35" y="53">
          upstream
        </text>
        <text className="diagram-small" x="535" y="30" textAnchor="middle">
          contribute back
        </text>
        <text className="diagram-fork" x="330" y="229" textAnchor="middle">
          your fork
        </text>
        <text className="diagram-caption" x="330" y="252" textAnchor="middle">
          explore, build, iterate
        </text>
      </svg>
    </figure>
  );
}
function StartPage() {
  const { state, setState } = useApp();
  const first = state.path === "fork" ? workflow[0] : foundations[0];
  const next =
    (state.path === "fork" ? workflow : lessons).find(
      (lesson) => !state.completed.includes(lesson.id),
    ) ?? first;
  return (
    <>
      <section className="hero">
        <div>
          <h1>
            Build with ambition.
            <br />
            Contribute with care.
          </h1>
          <p className="hero-copy">
            A practical field guide to turning your ideas into open source
            contributions someone else can maintain.
          </p>
          <div className="actions">
            <Link className="button primary" to={`/learn/${next.id}`}>
              {state.completed.length ? "Continue learning" : "Start learning"}
              <Arrow />
            </Link>
            <Link className="button secondary" to="/workbench">
              Open the workbench
              <Arrow />
            </Link>
          </div>
        </div>
        <ForkDiagram />
      </section>
      <section className="entry-section">
        <h2>Two ways in. One thoughtful contribution.</h2>
        <p>Start where you are. Both paths lead to a better handoff.</p>
        <div className="path-options">
          <Link
            to="/learn"
            className="path-option"
            onClick={() => setState((old) => ({ ...old, path: "beginner" }))}
          >
            <span className="path-number">01</span>
            <div>
              <h3>New to open source</h3>
              <p>Find your footing, then make your first contribution.</p>
            </div>
            <Arrow />
          </Link>
          <Link
            to="/learn"
            className="path-option"
            onClick={() => setState((old) => ({ ...old, path: "fork" }))}
          >
            <span className="path-number">02</span>
            <div>
              <h3>Already building in a fork</h3>
              <p>Turn your work into one focused upstream idea.</p>
            </div>
            <Arrow />
          </Link>
        </div>
      </section>
      <section className="home-bottom">
        <div>
          <h2>The contribution path</h2>
          <p className="section-subtitle">
            Six habits that make your work easier to review.
          </p>
          <ol className="lesson-list">
            {workflow.map((lesson, index) => (
              <li key={lesson.id}>
                <Link to={`/learn/${lesson.id}`}>
                  <span className="lesson-number">
                    {state.completed.includes(lesson.id) ? (
                      <Check size={16} />
                    ) : (
                      `0${index + 1}`
                    )}
                  </span>
                  <span>{lesson.title}</span>
                  <ArrowRight size={16} />
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <aside className="quote-panel">
          <span className="quote-mark" aria-hidden="true">
            “
          </span>
          <p className="eyebrow">The question to ask first</p>
          <blockquote>
            Could someone merge this without taking the rest of my fork?
          </blockquote>
          <p>
            Independent means it works from upstream. A smaller commit count
            does not make a smaller dependency.
          </p>
          <TextLink to="/workbench">Try it in the workbench</TextLink>
        </aside>
      </section>
      <div className="skill-strip">
        <Sparkles size={20} />
        <p>The same principles. An agent that puts them into practice.</p>
        <TextLink to="/skill">Meet the companion skill</TextLink>
      </div>
    </>
  );
}
function App() {
  const { state, setState, warning, saveStatus } = usePersistentState();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousRoute = useRef(location.pathname);
  useEffect(() => {
    const label =
      navigation.find(
        (item) => item.to !== "/" && location.pathname.startsWith(item.to),
      )?.label ??
      (location.pathname === "/notes" ? "Field notes" : "Start here");
    document.title = `${label} · Upstreamer`;
    if (previousRoute.current === location.pathname) return;
    previousRoute.current = location.pathname;
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);
  const crumb = location.pathname.startsWith("/learn/")
    ? (lessons.find((lesson) => location.pathname.endsWith(`/${lesson.id}`))
        ?.title ?? "Lesson")
    : (navigation.find((item) => item.to === location.pathname)?.label ??
      "Field notes");
  return (
    <StateContext.Provider value={{ state, setState }}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand-group">
            <Link to="/" className="brand">
              <GitBranch size={33} strokeWidth={1.7} aria-hidden="true" />
              <span>upstreamer.</span>
            </Link>
            <p className="brand-caption">
              An open source contribution field guide
            </p>
          </div>
          <ThemeToggle />
        </div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-button${isActive ? " active" : ""}`
              }
            >
              <item.icon size={18} strokeWidth={1.7} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>
      <div className="workspace">
        <div className="topbar">
          <div>
            <Link to="/">The field guide</Link>
            <span className="breadcrumb-divider">/</span>
            <span>{crumb}</span>
          </div>
          <div className="topbar-status">
            <div className="header-progress">
              <span>
                {state.completed.length} / {lessons.length} lessons
              </span>
              <progress
                value={state.completed.length}
                max={lessons.length}
                aria-label="Completed lessons"
              />
            </div>
            <div className="save-indicator" role="status">
              <Save size={15} aria-hidden="true" />
              {saveStatus}
            </div>
          </div>
        </div>
        {warning && (
          <div className="storage-warning" role="alert">
            {warning}
          </div>
        )}
        <main id="main-content" tabIndex={-1} ref={mainRef}>
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route
              path="/learn/:id"
              element={<LessonPage key={location.pathname} />}
            />
            <Route path="/examples" element={<ExamplePage />} />
            <Route path="/workbench" element={<WorkbenchPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/draft" element={<DraftPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/skill" element={<SkillPage />} />
            <Route
              path="*"
              element={
                <>
                  <PageHeading
                    title="A path not found."
                    intro="This page is not in the field guide."
                  />
                  <TextLink to="/">Back to start</TextLink>
                </>
              }
            />
          </Routes>
        </main>
        <footer>
          <span>Made for thoughtful contributions.</span>
          <span>
            Learn<span aria-hidden="true"> / </span>Practice
            <span aria-hidden="true"> / </span>Contribute
            <span aria-hidden="true"> / </span>
            <a
              className="text-link footer-source-link"
              href="https://github.com/wispdevon/upstreamer"
            >
              Source on GitHub
            </a>
          </span>
        </footer>
      </div>
    </StateContext.Provider>
  );
}
export default App;
