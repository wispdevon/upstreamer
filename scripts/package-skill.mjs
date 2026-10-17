import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";
import { checks, workflow } from "../src/content.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(root, "skills/fork-to-upstream");
const contract = {
  version: 2,
  workflow: workflow.map(({ id, title, intro }) => ({
    id,
    title,
    purpose: intro,
  })),
  checklist: checks,
};
await writeFile(
  path.join(skillRoot, "references/workflow-contract.json"),
  JSON.stringify(contract, null, 2) + "\n",
);
const files = {};
async function collect(directory, prefix) {
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    const absolute = path.join(directory, entry.name);
    const name = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) await collect(absolute, name);
    else if (entry.isFile())
      files[name] = [
        new Uint8Array(await readFile(absolute)),
        { mtime: new Date("2026-01-01T00:00:00Z") },
      ];
  }
}
await collect(skillRoot, "fork-to-upstream");
await mkdir(path.join(root, "public/downloads"), { recursive: true });
await writeFile(
  path.join(root, "public/downloads/fork-to-upstream.zip"),
  zipSync(files, { level: 9 }),
);
console.log(`Packaged fork-to-upstream (${Object.keys(files).length} files).`);
