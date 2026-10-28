import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { journalStorageKey } from "../src/journal";
import { createState, legacyStorageKey, storageKey } from "../src/model";

test("journal creates, selects, edits, exports and deletes notes without changing contribution work", async ({ page }) => {
  const contribution = JSON.stringify({ ...createState(), draft: "Keep my contribution", completed: ["maintainer"] });
  await page.addInitScript(({ key, value, legacy }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    localStorage.setItem(legacy, "Legacy record to preserve");
  }, { key: storageKey, value: contribution, legacy: legacyStorageKey });
  await page.goto("/notes");
  await expect(page.getByRole("heading", { name: "Keep what you learn." })).toBeVisible();
  await expect(page.getByText("No learning notes yet.")).toBeVisible();
  await page.getByRole("button", { name: "New note", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toBeFocused();
  await page.getByLabel("Title", { exact: true }).fill("Trace dependencies");
  await page.getByLabel("Project context", { exact: true }).fill("Trail Notes");
  await page.getByLabel("Lesson learned", { exact: true }).fill("Follow the runtime calls.");
  await page.getByLabel("Evidence and limitations", { exact: true }).fill("pnpm test passed; mobile not checked.");
  await page.getByLabel("Next practice", { exact: true }).fill("Trace a second feature.");
  await page.getByRole("button", { name: "New note", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("A second lesson");
  await page.getByRole("button", { name: "Trace dependencies", exact: true }).click();
  await expect(page.getByLabel("Lesson learned", { exact: true })).toHaveValue("Follow the runtime calls.");
  const noteDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download note", exact: true }).click();
  const downloaded = await noteDownload;
  expect(await readFile((await downloaded.path())!, "utf8")).toContain("pnpm test passed; mobile not checked.");
  const allDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download journal", exact: true }).click();
  expect(await readFile((await (await allDownload).path())!, "utf8")).toContain("# A second lesson");
  await page.getByRole("link", { name: "Review & draft", exact: true }).click();
  await expect(page.getByLabel("Contribution draft in Markdown")).toHaveValue("Keep my contribution");
  await page.getByRole("link", { name: "Learning notes", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Trace dependencies", exact: true }).click();
  await expect(page.getByLabel("Next practice", { exact: true })).toHaveValue("Trace a second feature.");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Delete note", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Trace dependencies");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete note", exact: true }).click();
  await expect(page.getByRole("button", { name: "Trace dependencies", exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Title", { exact: true })).toBeFocused();
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(contribution);
  expect(await page.evaluate((key) => localStorage.getItem(key), legacyStorageKey)).toBe("Legacy record to preserve");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete note", exact: true }).click();
  await expect(page.getByText("No learning notes yet.")).toBeVisible();
  await expect(page.getByRole("button", { name: "New note", exact: true })).toBeFocused();
});

test("autosaves preserve focus, caret, literal text and independent field edits", async ({ page }) => {
  await page.goto("/notes");
  await page.getByRole("button", { name: "New note", exact: true }).click();
  const editor = page.getByLabel("Lesson learned", { exact: true });
  await editor.fill("Trace calls");
  await editor.press("Home");
  await editor.pressSequentially("First: ");
  await expect(editor).toBeFocused();
  expect(await editor.evaluate((node: HTMLTextAreaElement) => node.selectionStart)).toBe(7);
  await expect(editor).toHaveValue("First: Trace calls");
  await page.getByLabel("Reusable skill or tool ideas", { exact: true }).fill('<img src=x onerror="window.__journalXss=true">');
  await expect(editor).toHaveValue("First: Trace calls");
  await page.reload();
  await expect(editor).toHaveValue("First: Trace calls");
  expect(await page.evaluate(() => "__journalXss" in window)).toBe(false);
  await expect(page.locator("main img")).toHaveCount(0);
});

for (const failure of ["quota", "blocked"] as const) {
  test(`${failure} storage retains journal edits across routes and permits export`, async ({ page }) => {
    await page.addInitScript(({ failure, journalKey }) => {
      const originalSet = Storage.prototype.setItem;
      const originalGet = Storage.prototype.getItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === journalKey) throw new DOMException("Unavailable", "QuotaExceededError");
        return originalSet.call(this, key, value);
      };
      if (failure === "blocked") Storage.prototype.getItem = function (key) {
        if (key === journalKey) throw new DOMException("Blocked", "SecurityError");
        return originalGet.call(this, key);
      };
    }, { failure, journalKey: journalStorageKey });
    await page.goto(failure === "quota" ? "/notes/" : "/notes");
    await page.getByRole("button", { name: "New note", exact: true }).click();
    await page.getByLabel("Title", { exact: true }).fill("Session lesson");
    await expect(page.getByRole("alert")).toContainText("could not save");
    await expect(page.getByText("Session only — not saved", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Review & draft", exact: true }).click();
    await page.getByRole("link", { name: "Learning notes", exact: true }).click();
    await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Session lesson");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download journal", exact: true }).click();
    expect(await readFile((await (await download).path())!, "utf8")).toContain("# Session lesson");
  });
}

test("unreadable journal is preserved until explicit replacement", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "{broken"), journalStorageKey);
  await page.goto("/notes");
  await expect(page.getByRole("alert")).toContainText("could not be read");
  await page.getByRole("button", { name: "New note", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Recovered session");
  expect(await page.evaluate((key) => localStorage.getItem(key), journalStorageKey)).toBe("{broken");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Replace unreadable journal" }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), journalStorageKey)).toBe("{broken");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Replace unreadable journal" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).notes[0].title, journalStorageKey)).toBe("Recovered session");
});

test("journal works from the keyboard and fits mobile and desktop in both themes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [360, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/notes");
      await expect(page).toHaveTitle("Learning notes · Upstreamer");
      await expect(page.getByRole("link", { name: "Learning notes", exact: true })).toHaveAttribute("aria-current", "page");
      await page.getByRole("button", { name: "New note", exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByLabel("Title", { exact: true })).toBeFocused();
      await page.keyboard.type("Keyboard lesson");
      await page.keyboard.press("Tab");
      await expect(page.getByLabel("Project context", { exact: true })).toBeFocused();
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
