import { describe, expect, it } from "vitest";
import {
  createDraftTemplate,
  createState,
  legacyStorageKey,
  loadState,
  saveState,
  storageKey,
} from "../../src/model";

describe("local contribution state", () => {
  it("recovers from malformed or incompatible saved data without throwing", () => {
    for (const value of [
      "{",
      "null",
      '{"version":99}',
      '{"version":1,"brief":null}',
    ]) {
      const result = loadState({
        getItem: (key) => (key === storageKey ? value : null),
      });
      expect(result.state.review).toEqual({});
      expect(result.warning).toBeTruthy();
    }
  });

  it("validates saved answers and excludes unknown completion IDs", () => {
    const value = {
      ...createState(),
      completed: ["maintainer", "unknown"],
      draft: 42,
      review: { dependencies: "satisfied", verification: "made-up" },
    };
    const result = loadState({
      getItem: (key) => (key === storageKey ? JSON.stringify(value) : null),
    });

    expect(result.state.completed).toEqual(["maintainer"]);
    expect(result.state.draft).toBeNull();
    expect(result.state.review.dependencies).toBe("satisfied");
    expect(result.state.review.verification).toBeUndefined();
  });

  it("migrates learning, review, and brief content without changing the old save", () => {
    const legacy = JSON.stringify({
      version: 1,
      path: "fork",
      completed: ["maintainer", "unknown"],
      notes: { maintainer: "Keep this in the old local save." },
      brief: {
        title: "Remember export destination",
        problem: "Repeated folder selection",
        evidence: "Not run yet — verify on upstream/main.",
      },
      review: { dependencies: "satisfied" },
      draft: null,
      scratchpad: "Old loose notes stay in the legacy record.",
    });
    const values = new Map<string, string>([[legacyStorageKey, legacy]]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    const result = loadState(storage);
    expect(result.state.path).toBe("fork");
    expect(result.state.completed).toEqual(["maintainer"]);
    expect(result.state.review.dependencies).toBe("satisfied");
    expect(result.state.draft).toContain("# Remember export destination");
    expect(result.state.draft).toContain("Repeated folder selection");
    expect(values.get(legacyStorageKey)).toBe(legacy);

    expect(saveState(storage, result.state)).toBe(true);
    expect(values.get(legacyStorageKey)).toBe(legacy);
    expect(JSON.parse(values.get(storageKey)!).version).toBe(2);
  });

  it("round trips studio work and reports quota errors", () => {
    const state = createState();
    state.draft = "My edited handoff";
    state.review.dependencies = "satisfied";
    let stored = "";

    expect(
      saveState(
        {
          setItem: (_key, value) => {
            stored = value;
          },
        },
        state,
      ),
    ).toBe(true);
    expect(
      loadState({ getItem: () => stored }).state,
    ).toEqual(state);
    expect(
      saveState(
        {
          setItem: () => {
            throw new Error("quota");
          },
        },
        state,
      ),
    ).toBe(false);
    expect(
      loadState({
        getItem: () => {
          throw new Error("blocked");
        },
      }).warning,
    ).toBeTruthy();
  });
});

describe("contribution draft", () => {
  it("starts with an honest, editable handoff template", () => {
    const draft = createDraftTemplate();
    expect(draft).toContain("# Contribution title — incomplete");
    expect(draft).toContain("Not run yet");
    expect(draft).toContain("Limitations and open questions");
    expect(draft).not.toContain("All tests pass");
  });
});
