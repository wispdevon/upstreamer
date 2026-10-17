import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileText,
  GitBranch,
  House,
  Moon,
  Save,
  Sparkles,
  Sun,
} from "lucide-react";
import {
  featuredPullRequest,
  foundations,
  lessons,
  quickProcess,
  workflow,
} from "./content";
import { StateContext, useApp, usePersistentState } from "./state";
import { Arrow, PageHeading, TextLink } from "./ui";
import { ExamplePage, LearnPage, LessonPage } from "./Learning";
import { SkillPage, StudioPage } from "./Tools";
import "./App.css";

const navigation = [
  { to: "/", label: "Start here", icon: House },
  { to: "/learn", label: "Learn the workflow", icon: BookOpen },
  { to: "/examples", label: "Worked examples", icon: FileText },
  { to: "/studio", label: "Review & draft", icon: ClipboardCheck },
  { to: "/skill", label: "Agent skill", icon: Sparkles },
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
          <div className="actions">
            <Link className="button primary" to={`/learn/${next.id}`}>
              {state.completed.length ? "Continue learning" : "Start learning"}
              <Arrow />
            </Link>
            <Link className="button secondary" to="/studio">
              Draft a pull request
              <Arrow />
            </Link>
          </div>
        </div>
        <ForkDiagram />
      </section>
      <section className="home-bottom">
        <div className="quick-process">
          <h2>Five steps from fork to pull request.</h2>
          <ol className="quick-process-list">
            {quickProcess.map((step, index) => (
              <li key={step.id}>
                <span className="quick-step-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <article className="featured-pr-card">
          <p className="eyebrow">Click · PR #3504</p>
          <h2>{featuredPullRequest.title}</h2>
          <div className="pr-flow" role="group" aria-label="Pull request path">
            <div className="pr-flow-step">
              <span>Fork</span>
              <strong>{featuredPullRequest.fork}</strong>
            </div>
            <ArrowRight aria-hidden="true" />
            <div className="pr-flow-step">
              <span>Feature branch</span>
              <strong>{featuredPullRequest.branch}</strong>
            </div>
            <ArrowRight aria-hidden="true" />
            <div className="pr-flow-step">
              <span>Upstream</span>
              <strong>
                {featuredPullRequest.upstream}:{featuredPullRequest.base}
              </strong>
            </div>
          </div>
          <div className="featured-pr-meta" aria-label="Pull request result">
            <span>{featuredPullRequest.merged}</span>
            <span>{featuredPullRequest.commits}</span>
            <span>{featuredPullRequest.files}</span>
          </div>
          <a className="text-link featured-pr-link" href={featuredPullRequest.url}>
            Read pull request #3504
            <Arrow />
          </a>
        </article>
      </section>
      <section className="entry-section">
        <h2>Choose a starting point.</h2>
        <div className="path-options">
          <Link
            to="/learn"
            className="path-option"
            onClick={() => setState((old) => ({ ...old, path: "beginner" }))}
          >
            <span className="path-number">01</span>
            <div>
              <h3>New to open source</h3>
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
            </div>
            <Arrow />
          </Link>
        </div>
      </section>
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
      "Start here";
    document.title = `${label} · Upstreamer`;
    if (previousRoute.current === location.pathname) return;
    previousRoute.current = location.pathname;
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);
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
        {location.pathname !== "/" && (
          <div className="topbar">
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
        )}
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
            <Route path="/studio" element={<StudioPage />} />
            <Route
              path="/workbench"
              element={<Navigate to="/studio" replace />}
            />
            <Route
              path="/review"
              element={<Navigate to="/studio" replace />}
            />
            <Route
              path="/draft"
              element={<Navigate to="/studio" replace />}
            />
            <Route path="/notes" element={<Navigate to="/" replace />} />
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
