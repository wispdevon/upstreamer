export const journalStorageKey = "upstreamer-learning-journal-v1";

export const noteFields = [
  { key: "title", label: "Title" },
  { key: "project", label: "Project context" },
  { key: "objective", label: "Learning objective", hint: "What did you want to understand or become able to do?" },
  { key: "learned", label: "Lesson learned", hint: "Describe the problem, approach, reasoning, and what changed your understanding." },
  { key: "evidence", label: "Evidence and limitations", hint: "Record actual commands, revisions, results, and untested areas. Writing here does not certify verification." },
  { key: "nextPractice", label: "Next practice", hint: "Choose a small exercise that will help you apply this again." },
  { key: "ideas", label: "Reusable skill or tool ideas", hint: "What could help another developer? Note an adaptation or a follow-up plan." },
] as const;

export type NoteField = typeof noteFields[number]["key"];
export type LearningNote = Record<NoteField, string> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export function createNote(): LearningNote {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(), createdAt: now, updatedAt: now,
    title: "", project: "", objective: "", learned: "", evidence: "", nextPractice: "", ideas: "",
  };
}

function isNote(value: unknown): value is LearningNote {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const note = value as Record<string, unknown>;
  return typeof note.id === "string" && note.id.length > 0 &&
    typeof note.createdAt === "string" && Number.isFinite(Date.parse(note.createdAt)) &&
    typeof note.updatedAt === "string" && Number.isFinite(Date.parse(note.updatedAt)) &&
    noteFields.every(({ key }) => typeof note[key] === "string");
}

export function loadJournal(storage: Pick<Storage, "getItem">): {
  notes: LearningNote[]; warning: string; unreadable: boolean;
} {
  let raw: string | null;
  try {
    raw = storage.getItem(journalStorageKey);
  } catch {
    return { notes: [], unreadable: false, warning: "Browser storage is unavailable. Your journal will stay in this session; export it before leaving." };
  }
  if (raw === null) return { notes: [], warning: "", unreadable: false };
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || !("version" in data) ||
      data.version !== 1 || !("notes" in data) || !Array.isArray(data.notes) ||
      !data.notes.every(isNote) || new Set(data.notes.map((note) => note.id)).size !== data.notes.length) {
      throw new Error("Invalid journal");
    }
    return { notes: data.notes, warning: "", unreadable: false };
  } catch {
    return { notes: [], unreadable: true, warning: "Saved journal data could not be read and has been kept unchanged. New notes stay in this session; export them before leaving." };
  }
}

export function saveJournal(storage: Pick<Storage, "setItem">, notes: LearningNote[]): boolean {
  try {
    storage.setItem(journalStorageKey, JSON.stringify({ version: 1, notes }));
    return true;
  } catch {
    return false;
  }
}

export function exportNote(note: LearningNote): string {
  const sections = noteFields.filter(({ key }) => key !== "title").map(({ key, label }) =>
    `## ${label}\n\n${note[key].trim() || (key === "evidence" ? "Not recorded — no verification claimed." : "Not recorded yet.")}`,
  );
  return `# ${note.title.trim() || "Untitled learning note"}\n\nCreated: ${note.createdAt}\nUpdated: ${note.updatedAt}\n\n${sections.join("\n\n")}\n`;
}

export function exportJournal(notes: LearningNote[]): string {
  return notes.length ? notes.map(exportNote).join("\n---\n\n") : "# Learning journal\n\nNo learning notes recorded.\n";
}
