import { checks, lessons } from "./content";

export type ReviewStatus = "unchecked" | "satisfied" | "not-applicable";

export type AppState = {
  version: 2;
  path: "beginner" | "fork";
  completed: string[];
  review: Record<string, ReviewStatus>;
  draft: string | null;
};

export const legacyStorageKey = "upstream-field-guide-v1";
export const storageKey = "upstream-field-guide-v2";

export function createDraftTemplate(): string {
  return `# Contribution title — incomplete

## Problem and behavior

Describe the problem and the behavior this change adds.

## Scope and dependencies

Explain what is included, what stays in the fork, and any prerequisites.

## Verification

Not run yet — record the actual commands, tested revision, and outcomes.

## Limitations and open questions

Record untested areas, risks, and questions for the maintainer.
`;
}

export function createState(): AppState {
  return {
    version: 2,
    path: "beginner",
    completed: [],
    review: {},
    draft: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function restoreReview(value: unknown): AppState["review"] {
  const review: AppState["review"] = {};
  if (!isRecord(value)) return review;

  for (const check of checks) {
    const answer = value[check.id];
    if (
      answer === "unchecked" ||
      answer === "satisfied" ||
      answer === "not-applicable"
    ) {
      review[check.id] = answer;
    }
  }
  return review;
}

function restoreCompleted(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set(lessons.map((lesson) => lesson.id));
  return [
    ...new Set(
      value.filter(
        (id): id is string => typeof id === "string" && ids.has(id),
      ),
    ),
  ];
}

function legacyBriefToDraft(brief: unknown): string | null {
  if (!isRecord(brief)) return null;

  const title =
    typeof brief.title === "string" && brief.title.trim()
      ? brief.title.trim()
      : "Contribution title — incomplete";
  const lines = [`# ${title}`, ""];
  const addSection = (
    heading: string,
    key: string,
    emptyText: string,
  ) => {
    const value = typeof brief[key] === "string" ? brief[key].trim() : "";
    lines.push(`## ${heading}`, "", value || emptyText, "");
  };

  addSection("Problem", "problem", "Add the problem this change addresses.");
  addSection(
    "Resulting behavior",
    "behavior",
    "Describe what changes for users.",
  );
  addSection(
    "Scope",
    "scope",
    "Explain what is included and what stays in the fork.",
  );
  addSection(
    "Dependencies and prerequisites",
    "dependencies",
    "List prerequisites or say what still needs investigation.",
  );
  addSection(
    "Verification",
    "evidence",
    "Not run yet — record the actual commands, tested revision, and outcomes.",
  );
  addSection(
    "Limitations and open questions",
    "limitations",
    "Record untested areas, risks, and questions for the maintainer.",
  );
  addSection("Upstream context", "upstream", "Project context not recorded.");
  addSection(
    "Upstream base revision",
    "base",
    "Base revision not recorded.",
  );
  addSection(
    "Extraction and attribution",
    "extraction",
    "Extraction approach not recorded.",
  );

  return lines.join("\n");
}

function restoreCurrent(data: Record<string, unknown>): AppState {
  if (data.version !== 2) throw new Error("Unsupported state version");
  return {
    version: 2,
    path: data.path === "fork" ? "fork" : "beginner",
    completed: restoreCompleted(data.completed),
    review: restoreReview(data.review),
    draft: typeof data.draft === "string" ? data.draft : null,
  };
}

function migrateLegacy(data: unknown): AppState {
  if (!isRecord(data) || data.version !== 1) {
    throw new Error("Invalid legacy state");
  }
  return {
    version: 2,
    path: data.path === "fork" ? "fork" : "beginner",
    completed: restoreCompleted(data.completed),
    review: restoreReview(data.review),
    draft:
      typeof data.draft === "string"
        ? data.draft
        : legacyBriefToDraft(data.brief),
  };
}

export function loadState(storage: Pick<Storage, "getItem">): {
  state: AppState;
  warning: string;
} {
  const fallback = createState();
  try {
    const raw = storage.getItem(storageKey);
    if (raw) {
      const data: unknown = JSON.parse(raw);
      if (!isRecord(data)) throw new Error("Invalid state");
      return { state: restoreCurrent(data), warning: "" };
    }

    const legacyRaw = storage.getItem(legacyStorageKey);
    if (!legacyRaw) return { state: fallback, warning: "" };
    return { state: migrateLegacy(JSON.parse(legacyRaw)), warning: "" };
  } catch {
    return {
      state: fallback,
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
