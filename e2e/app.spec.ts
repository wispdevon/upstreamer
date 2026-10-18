import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { checks, lessons, quickProcess, workflow } from "../src/content";
import { createState, legacyStorageKey, storageKey } from "../src/model";

test("the homepage path choice persists and opens the intended lesson sequence", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("region", { name: "Choose a starting point." });
  await expect(card.getByRole("radio", { name: "New to open source" })).toBeChecked();
  await expect(card.getByRole("link", { name: "Start learning" })).toHaveAttribute("href", `/learn/${lessons[0].id}`);
  await card.getByRole("radio", { name: "Already building in a fork" }).check();
  await expect(page).toHaveURL(/\/$/);
  await page.reload();
  await expect(card.getByRole("radio", { name: "Already building in a fork" })).toBeChecked();
  await card.getByRole("link", { name: "Start learning" }).click();
  await expect(page).toHaveURL(`/learn/${workflow[0].id}`);
  await expect(page.locator("main")).toBeFocused();
  await page.getByRole("link", { name: "Learn the workflow", exact: true }).click();
  await expect(page.locator(".catalog-list li")).toHaveCount(6);
  await page.getByRole("link", { name: "Start here", exact: true }).click();
  await card.getByRole("radio", { name: "New to open source" }).check();
  await page.reload();
  await expect(card.getByRole("radio", { name: "New to open source" })).toBeChecked();
  await card.getByRole("link", { name: "Start learning" }).click();
  await expect(page).toHaveURL(`/learn/${lessons[0].id}`);
  await page.getByRole("link", { name: "Learn the workflow", exact: true }).click();
  await expect(page.locator(".catalog-list li")).toHaveCount(10);
});

for (const path of ["beginner", "fork"] as const) {
  for (const complete of [false, true]) {
    test(`the ${path} homepage resumes ${complete ? "a completed path at its first lesson" : "at its first incomplete lesson"}`, async ({ page }) => {
      const selected = path === "fork" ? workflow : lessons;
      const completed = (complete ? selected : [selected[0], selected[2]]).map((lesson) => lesson.id);
      await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
        key: storageKey,
        value: JSON.stringify({ ...createState(), path, completed }),
      });
      await page.goto("/");
      const next = complete ? selected[0] : selected[1];
      const card = page.getByRole("region", { name: "Choose a starting point." });
      await expect(card.getByRole("radio", { name: path === "fork" ? "Already building in a fork" : "New to open source" })).toBeChecked();
      await expect(page.locator(".hero .actions").getByRole("link", { name: "Continue learning" })).toHaveAttribute("href", `/learn/${next.id}`);
      await card.getByRole("link", { name: "Continue learning" }).click();
      await expect(page).toHaveURL(`/learn/${next.id}`);
    });
  }
}

test("the homepage path card supports keyboard selection and activation", async ({ page }) => {
  await page.goto("/");
  const beginner = page.getByRole("radio", { name: "New to open source" });
  await page.getByRole("link", { name: "Draft a pull request" }).focus();
  await page.keyboard.press("Tab");
  await expect(beginner).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: "Already building in a fork" })).toBeFocused();
  await expect(page.getByRole("radio", { name: "Already building in a fork" })).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("region", { name: "Choose a starting point." }).getByRole("link", { name: "Start learning" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(`/learn/${workflow[0].id}`);
});

test("lesson exercises, completion, and route focus work together", async ({ page }) => {
  await page.goto("/learn/dependencies");
  await page.getByRole("radio", { name: "Yes, Git has verified it" }).check();
  await page.getByRole("button", { name: "Check your thinking" }).click();
  await expect(page.getByText("Take another look.")).toBeVisible();
  await page.getByRole("radio", { name: /Not yet: inspect dependencies/ }).check();
  await page.getByRole("button", { name: "Check your thinking" }).click();
  await expect(page.getByText("That’s the idea.")).toBeVisible();
  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Completed — undo" })).toBeVisible();
  await page.getByRole("link", { name: "Keep history honest" }).click();
  await expect(page.locator("main")).toBeFocused();
});

test("every lesson can be completed and undone", async ({ page }) => {
  for (const lesson of lessons) {
    await page.goto(`/learn/${lesson.id}`);
    await expect(page.getByRole("heading", { name: lesson.title, exact: true })).toBeVisible();
    await page.getByRole("radio", { name: lesson.choices[lesson.answer], exact: true }).check();
    await page.getByRole("button", { name: "Check your thinking" }).click();
    await expect(page.getByText("That’s the idea.")).toBeVisible();
    await page.getByRole("button", { name: "Mark lesson complete" }).click();
  }
  await expect(page.getByRole("progressbar", { name: "Completed lessons" })).toHaveAttribute("value", "10");
  await page.getByRole("button", { name: "Completed — undo" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "9");
});

test("review answers and handoff edits persist together in the studio", async ({ page }) => {
  await page.goto("/studio");
  const draft = page.getByLabel("Contribution draft in Markdown");
  await expect(draft).toHaveValue(/Not run yet/);
  await expect(draft).not.toHaveValue(/All tests pass/);
  const firstCheck = page.getByRole("group", { name: new RegExp(checks[0].title) });
  await firstCheck.getByRole("radio", { name: "Satisfied", exact: true }).check();
  await draft.fill("# Custom handoff\n\nmacOS not tested. <img src=x onerror=alert(1)>");
  await page.reload();
  await expect(draft).toHaveValue("# Custom handoff\n\nmacOS not tested. <img src=x onerror=alert(1)>");
  await expect(page.getByText("1 / 8", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Read draft" }).click();
  await expect(page.getByRole("heading", { name: "Custom handoff" })).toBeVisible();
  await expect(page.locator(".draft-preview img")).toHaveCount(0);
  await expect(page.locator(".draft-preview")).toContainText("<img src=x onerror=alert(1)>");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Markdown" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("contribution-draft.md");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString()).toContain("macOS not tested.");
  await page.reload();
  await expect(page.getByRole("group", { name: new RegExp(checks[0].title) }).getByRole("radio", { name: "Satisfied" })).toBeChecked();
});

test("legacy saves migrate progress, review, and brief while preserving a custom draft and the v1 record", async ({ page }) => {
  const legacy = JSON.stringify({
    version: 1,
    path: "fork",
    completed: ["maintainer", "unknown"],
    notes: { maintainer: "Keep old note data in the original save." },
    scratchpad: "Old scratchpad stays in the original save.",
    brief: { title: "Old brief title", problem: "Old brief problem" },
    draft: "# My existing handoff\n\nKeep my edits.",
    review: { dependencies: "satisfied" },
  });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: legacyStorageKey, value: legacy });
  await page.goto("/studio");
  await expect(page.getByLabel("Contribution draft in Markdown")).toHaveValue("# My existing handoff\n\nKeep my edits.");
  await expect(page.getByRole("group", { name: new RegExp(checks[2].title) }).getByRole("radio", { name: "Satisfied", exact: true })).toBeChecked();
  expect(await page.evaluate((key) => localStorage.getItem(key), legacyStorageKey)).toBe(legacy);
  await page.getByLabel("Contribution draft in Markdown").fill("# Saved migrated work");
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}").version, storageKey)).toBe(2);
  expect(await page.evaluate((key) => localStorage.getItem(key), legacyStorageKey)).toBe(legacy);
});

test("legacy brief converts into an honest draft when no custom draft exists", async ({ page }) => {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: legacyStorageKey,
    value: JSON.stringify({ version: 1, brief: { title: "Remember export destination", problem: "Repeated folder selection", evidence: "" } }),
  });
  await page.goto("/studio");
  await expect(page.getByLabel("Contribution draft in Markdown")).toHaveValue(/# Remember export destination/);
  await expect(page.getByLabel("Contribution draft in Markdown")).toHaveValue(/Repeated folder selection/);
  await expect(page.getByLabel("Contribution draft in Markdown")).toHaveValue(/Not run yet/);
});

test("worked examples are read-only and do not change the saved draft", async ({ page }) => {
  await page.goto("/studio");
  await page.getByLabel("Contribution draft in Markdown").fill("# My active contribution");
  await page.getByRole("link", { name: "Worked examples", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Small diff. Whole story." })).toBeVisible();
  await page.getByRole("link", { name: "Use the contribution studio" }).first().click();
  await expect(page.getByLabel("Contribution draft in Markdown")).toHaveValue("# My active contribution");
});

test("removed routes redirect into the simplified navigation", async ({ page }) => {
  for (const oldRoute of ["/workbench", "/review", "/draft"]) {
    await page.goto(oldRoute);
    await expect(page).toHaveURL(/\/studio$/);
    await expect(page.getByRole("heading", { name: "Review the change. Write the handoff." })).toBeVisible();
  }
  await page.goto("/notes");
  await expect(page).toHaveURL(/\/$/);
});

test("malformed saved data stays untouched and the studio remains usable", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "{broken"), storageKey);
  await page.goto("/studio");
  await expect(page.getByRole("alert")).toContainText("could not be read");
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe("{broken");
  await page.getByLabel("Contribution draft in Markdown").fill("Recovered session");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("storage quota errors retain the session and allow Markdown export", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException("Quota exceeded", "QuotaExceededError"); }; });
  await page.goto("/studio");
  await page.getByLabel("Contribution draft in Markdown").fill("Still usable");
  await expect(page.getByRole("alert")).toContainText("could not save");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Markdown" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("contribution-draft.md");
});

test("pill navigation fits mobile and desktop and exposes the active destination", async ({ page }) => {
  for (const width of [360, 768, 1024, 1270, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByRole("link")).toHaveCount(5);
    await expect(nav.getByRole("link", { name: "Start here" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Review & draft" })).toHaveCSS("border-radius", "999px");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const diagram = await page.locator(".fork-diagram").boundingBox();
    const main = await page.locator("main").boundingBox();
    expect(diagram).not.toBeNull();
    expect(main).not.toBeNull();
    expect(diagram!.x).toBeGreaterThanOrEqual(main!.x);
    expect(diagram!.x + diagram!.width).toBeLessThanOrEqual(main!.x + main!.width + 1);
    const card = (await page.getByRole("region", { name: "Choose a starting point." }).boundingBox())!;
    expect(card.x).toBeGreaterThanOrEqual(main!.x);
    expect(card.x + card.width).toBeLessThanOrEqual(main!.x + main!.width + 1);
    const heroActions = (await page.locator(".hero .actions").boundingBox())!;
    if (width <= 700) {
      expect(diagram!.y).toBeGreaterThanOrEqual(heroActions.y + heroActions.height);
      expect(card.y).toBeGreaterThanOrEqual(diagram!.y + diagram!.height);
      const steps = (await page.locator(".quick-process").boundingBox())!;
      const featured = (await page.locator(".featured-pr-card").boundingBox())!;
      expect(steps.y).toBeGreaterThanOrEqual(card.y + card.height);
      expect(featured.y).toBeGreaterThanOrEqual(steps.y + steps.height);
    } else if (width > 1080) {
      expect(card.y).toBeGreaterThanOrEqual(diagram!.y + diagram!.height);
      expect(card.x).toBeGreaterThanOrEqual(heroActions.x + heroActions.width);
    } else {
      expect(card.x).toBeGreaterThanOrEqual(diagram!.x + diagram!.width);
    }
    await page.goto("/studio");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (let i = 0; i < 4; i += 1) await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Start here" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Learn the workflow" })).toBeFocused();
});

test("the homepage presents five clear steps beside a real fork-to-PR example", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".topbar")).toHaveCount(0);
  await expect(page.getByText("The field guide", { exact: true })).toHaveCount(0);
  await expect(page.locator(".brand-caption")).toHaveCount(0);
  await expect(page.locator(".hero-copy")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Five steps from fork to pull request." })).toBeVisible();
  await expect(page.locator(".quick-process-list li")).toHaveCount(5);
  await expect(page.locator(".quick-process-list p")).toHaveCount(0);
  for (const step of quickProcess) {
    await expect(page.getByRole("heading", { name: step.title, exact: true })).toBeVisible();
    await expect(page.getByText(step.detail, { exact: true })).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { name: "Keep multi-line help intact in Fish completion" })).toBeVisible();
  await expect(page.locator(".featured-pr-copy")).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Pull request path" })).toContainText("sitiyou/click");
  await expect(page.getByRole("group", { name: "Pull request path" })).toContainText("fix-fish-completion");
  await expect(page.getByRole("group", { name: "Pull request path" })).toContainText("pallets/click:main");
  await expect(page.getByRole("link", { name: "Read pull request #3504" })).toHaveAttribute("href", "https://github.com/pallets/click/pull/3504");
});

test("home and studio meet WCAG A/AA automated checks", async ({ page }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [360, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ["/", "/studio"]) {
        await page.goto(route);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        expect(results.violations).toEqual([]);
      }
    }
  }
});

test("the home page and studio render without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const [route, heading] of [
    ["/", "Build with ambition."],
    ["/studio", "Review the change. Write the handoff."],
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: new RegExp(heading) })).toBeVisible();
    await expect(page.locator("main")).not.toBeEmpty();
  }
  expect(errors).toEqual([]);
});

test("the theme button toggles and persists the local dark-mode choice", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const themeButton = page.getByRole("button", { name: "Switch to dark mode" });
  await expect(themeButton).toHaveText("");
  await expect(themeButton).toHaveCSS("border-radius", "20px");
  await themeButton.click();
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", "dark");
  await page.reload();
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", "light dark");
  await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
});

test("the companion skill download remains available", async ({ page }) => {
  await page.goto("/skill");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download Codex skill" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("fork-to-upstream.zip");
});
