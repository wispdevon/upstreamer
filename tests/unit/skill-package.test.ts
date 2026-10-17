import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, relative } from "node:path";
import { unzipSync, strFromU8 } from "fflate";
import { describe, expect, it } from "vitest";
import { checks, quickProcess, workflow } from "../../src/content";

describe("downloadable companion skill", () => {
  it("contains every skill source file exactly, with one installable top-level folder", () => {
    const archive = unzipSync(
      readFileSync("public/downloads/fork-to-upstream.zip"),
    );
    const root = resolve("skills/fork-to-upstream");
    const sourceFiles: string[] = [];
    function visit(directory: string) {
      for (const file of readdirSync(directory)) {
        const path = resolve(directory, file);
        if (statSync(path).isDirectory()) visit(path);
        else sourceFiles.push(relative(root, path).split("\\").join("/"));
      }
    }
    visit(root);
    expect(Object.keys(archive).sort()).toEqual(
      sourceFiles.map((file) => `fork-to-upstream/${file}`).sort(),
    );
    for (const file of sourceFiles)
      expect(strFromU8(archive[`fork-to-upstream/${file}`])).toBe(
        readFileSync(resolve(root, file), "utf8"),
      );
  });
  it("shares workflow and checklist IDs with the app", () => {
    const contract = JSON.parse(
      readFileSync(
        "skills/fork-to-upstream/references/workflow-contract.json",
        "utf8",
      ),
    );
    expect(contract.workflow.map((item: { id: string }) => item.id)).toEqual(
      workflow.map((item) => item.id),
    );
    expect(contract.checklist).toEqual(checks);
    expect(contract.quickProcess).toEqual(quickProcess);
    expect(contract.version).toBe(3);
    expect(contract).not.toHaveProperty("brief");
  });
});
