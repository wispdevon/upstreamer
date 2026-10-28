import { describe, expect, it } from "vitest";
import {
  createNote, exportJournal, exportNote, journalStorageKey,
  loadJournal, saveJournal,
} from "../../src/journal";

describe("learning journal", () => {
  it("round trips independent notes without touching contribution saves", () => {
    const values = new Map([["upstream-field-guide-v2", "existing draft"]]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    };
    const note = { ...createNote(), title: "Read the dependency chain", learned: "Trace runtime calls, too." };
    expect(saveJournal(storage, [note])).toBe(true);
    expect(loadJournal(storage)).toEqual({ notes: [note], warning: "", unreadable: false });
    expect(values.get("upstream-field-guide-v2")).toBe("existing draft");
  });

  it("preserves malformed and incompatible records and reports blocked storage", () => {
    for (const raw of ["{broken", "null", '{"version":99,"notes":[]}', '{"version":1,"notes":[{}]}']) {
      const result = loadJournal({ getItem: () => raw });
      expect(result.notes).toEqual([]);
      expect(result.unreadable).toBe(true);
      expect(result.warning).toContain("could not be read");
    }
    expect(loadJournal({ getItem: () => { throw new Error("blocked"); } }).warning).toBeTruthy();
    expect(saveJournal({ setItem: () => { throw new Error("quota"); } }, [createNote()])).toBe(false);
  });

  it("rejects duplicate IDs and invalid fields without discarding the saved original", () => {
    const note = createNote();
    for (const notes of [[note, note], [{ ...note, learned: 12 }], [{ ...note, id: "" }]]) {
      const result = loadJournal({ getItem: () => JSON.stringify({ version: 1, notes }) });
      expect(result.unreadable).toBe(true);
      expect(result.notes).toEqual([]);
    }
  });

  it("creates distinct editable notes and exports incomplete evidence honestly", () => {
    const first = createNote();
    const second = createNote();
    expect(first.id).not.toBe(second.id);
    expect(first.evidence).toBe("");
    const markdown = exportNote(first);
    expect(markdown).toContain("Untitled learning note");
    expect(markdown).toContain("Not recorded — no verification claimed.");
    expect(markdown).not.toContain("passed");
    const edited = { ...second, title: "A real lesson", evidence: "pnpm test: failed; investigate the fixture.", nextPractice: "Reproduce with a smaller case." };
    const journal = exportJournal([first, edited]);
    expect(journal).toContain(markdown.trim());
    expect(journal).toContain("pnpm test: failed; investigate the fixture.");
    expect(journal).toContain("Reproduce with a smaller case.");
    expect(exportJournal([])).toContain("No learning notes recorded.");
    expect(journalStorageKey).not.toBe("upstream-field-guide-v2");
  });
});
