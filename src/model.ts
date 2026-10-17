import { briefFields, checks, lessons } from "./content";
import type { Brief } from "./content";

export type ReviewStatus = "unchecked" | "satisfied" | "not-applicable";
export type AppState = {
  version: 1;
  path: "beginner" | "fork";
  completed: string[];
  notes: Record<string, string>;
  brief: Brief;
  review: Record<string, ReviewStatus>;
  draft: string | null;
  scratchpad: string;
};
export const storageKey = "upstream-field-guide-v1";
export function createState(): AppState {
  return {
    version: 1,
    path: "beginner",
    completed: [],
    notes: {},
    brief: Object.fromEntries(
      briefFields.map((field) => [field.key, ""]),
    ) as Brief,
    review: {},
    draft: null,
    scratchpad: "",
  };
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function loadState(storage: Pick<Storage, "getItem">): {
  state: AppState;
  warning: string;
} {
  const state = createState();
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return { state, warning: "" };
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.version !== 1 || !isRecord(data.brief))
      throw new Error("Invalid state");
    let repaired = false;
    for (const { key } of briefFields) {
      if (typeof data.brief[key] === "string")
        state.brief[key] = data.brief[key];
      else repaired = true;
    }
    const ids = new Set(lessons.map((lesson) => lesson.id));
    if (Array.isArray(data.completed))
      state.completed = [
        ...new Set(
          data.completed.filter(
            (id): id is string => typeof id === "string" && ids.has(id),
          ),
        ),
      ];
    if (isRecord(data.notes)) {
      for (const id of ids)
        if (typeof data.notes[id] === "string")
          state.notes[id] = data.notes[id];
    }
    if (isRecord(data.review)) {
      for (const check of checks) {
        const value = data.review[check.id];
        if (
          value === "unchecked" ||
          value === "satisfied" ||
          value === "not-applicable"
        )
          state.review[check.id] = value;
      }
    }
    state.path = data.path === "fork" ? "fork" : "beginner";
    state.draft = typeof data.draft === "string" ? data.draft : null;
    state.scratchpad =
      typeof data.scratchpad === "string" ? data.scratchpad : "";
    return {
      state,
      warning: repaired
        ? "Some saved fields could not be restored. Check your brief before continuing."
        : "",
    };
  } catch {
    return {
      state,
      warning:
        "Saved data could not be read. This session is usable; your existing saved data has not been changed.",
    };
  }
}
export function saveState(
  storage: Pick<Storage, "setItem">,
  state: AppState,
): boolean {
  try {
    storage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
export function generateDraft(brief: Brief): string {
  const sections = [
    [
      "Upstream context",
      brief.upstream ||
        "Not recorded — add the project and relevant discussion.",
    ],
    [
      "Base revision",
      brief.base || "Not recorded — verify and record the upstream base.",
    ],
    ["Problem", brief.problem || "Incomplete — describe the user problem."],
    [
      "Resulting behavior",
      brief.behavior || "Incomplete — describe what changes.",
    ],
    [
      "Scope",
      brief.scope || "Incomplete — define what is included and excluded.",
    ],
    [
      "Dependencies and prerequisites",
      brief.dependencies ||
        "Not assessed — inspect code and runtime prerequisites.",
    ],
    [
      "Extraction and attribution",
      brief.extraction ||
        "Not recorded — explain the upstream-based extraction approach and preserve credit.",
    ],
    [
      "Verification",
      brief.evidence ||
        "Not run yet — record actual commands, tested revision, and outcomes.",
    ],
    [
      "Limitations and open questions",
      brief.limitations ||
        "Not assessed — record untested areas, risks, and questions.",
    ],
  ];
  return `# ${brief.title.trim() || "Contribution title — incomplete"}\n\n${sections.map(([heading, value]) => `## ${heading}\n\n${value.trim()}`).join("\n\n")}\n`;
}

export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/markdown;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
