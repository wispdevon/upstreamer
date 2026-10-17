import { describe, expect, it } from "vitest";
import { createState, loadState, saveState, generateDraft } from "../../src/model";

describe("local contribution state", () => {
  it("recovers from malformed or future saved data without throwing", () => {
    for (const value of [
      "{",
      "null",
      '{"version":99}',
      '{"version":1,"brief":null}',
    ]) {
      const result = loadState({ getItem: () => value });
      expect(result.state.brief.title).toBe("");
      expect(result.warning).toBeTruthy();
    }
  });
  it("validates nested saved values and excludes unknown completion IDs", () => {
    const value = {
      ...createState(),
      completed: ["maintainer", "unknown"],
      notes: { maintainer: "<script>alert(1)</script>", bad: 5 },
      brief: { ...createState().brief, title: 42 },
      review: { dependencies: "satisfied", verification: "made-up" },
    };
    const result = loadState({ getItem: () => JSON.stringify(value) });
    expect(result.state.completed).toEqual(["maintainer"]);
    expect(result.state.brief.title).toBe("");
    expect(result.state.notes.maintainer).toBe("<script>alert(1)</script>");
    expect(result.state.review.dependencies).toBe("satisfied");
    expect(result.state.review.verification).toBeUndefined();
  });
  it("round trips a contribution and reports quota errors", () => {
    const state = createState();
    state.brief.problem = "Repeated folder selection";
    state.draft = "My edited draft";
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
    expect(loadState({ getItem: () => stored }).state).toEqual(state);
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

describe("PR handoff", () => {
  it("leaves evidence explicitly incomplete instead of claiming checks passed", () => {
    const draft = generateDraft(createState().brief);
    expect(draft).toContain("Not run yet");
    expect(draft).toContain("Not recorded");
    expect(draft).not.toContain("All tests pass");
  });
  it("includes exact evidence, limitations, and prerequisites supplied by the person", () => {
    const brief = {
      ...createState().brief,
      title: "Cancel export",
      dependencies: "Requires queue PR #12",
      evidence: "pnpm test — failed at revision abc123",
      limitations: "macOS untested",
    };
    const draft = generateDraft(brief);
    expect(draft).toContain("# Cancel export");
    expect(draft).toContain("Requires queue PR #12");
    expect(draft).toContain("failed at revision abc123");
    expect(draft).toContain("macOS untested");
  });
});
