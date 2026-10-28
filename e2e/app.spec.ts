import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { checks, lessons, quickProcess, workflow } from "../src/content";
import { createState, legacyStorageKey, storageKey } from "../src/model";

test("the homepage path buttons save the choice and open the intended sequence", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Start learning" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "New to opensource" })).toHaveAttribute("href", `/learn/${lessons[0].id}`);
  await page.getByRole("link", { name: "Already building a fork?" }).click();
  await expect(page).toHaveURL(`/learn/${workflow[0].id}`);
  await expect(page.locator("main")).toBeFocused();
  await page.getByRole("link", { name: "Learn the workflow", exact: true }).click();
  await expect(page.locator(".catalog-list li")).toHaveCount(6);
  await page.reload();
  await expect(page.getByRole("radio", { name: "Already building in a fork" })).toBeChecked();
  await page.getByRole("link", { name: "Start here", exact: true }).click();
  await page.getByRole("link", { name: "New to opensource" }).click();
  await expect(page).toHaveURL(`/learn/${lessons[0].id}`);
  await page.getByRole("link", { name: "Learn the workflow", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("radio", { name: "New to open source" })).toBeChecked();
  await expect(page.locator(".catalog-list li")).toHaveCount(10);
});

for (const path of ["beginner", "fork"] as const) {
  for (const complete of [false, true]) {
    test(`the ${path} homepage button opens ${complete ? "a completed path at its first lesson" : "its first incomplete lesson"}`, async ({ page }) => {
      const selected = path === "fork" ? workflow : lessons;
      const completed = (complete ? selected : [selected[0], selected[2]]).map((lesson) => lesson.id);
      await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
        key: storageKey,
        value: JSON.stringify({ ...createState(), path: path === "fork" ? "beginner" : "fork", completed }),
      });
      await page.goto("/");
      const next = complete ? selected[0] : selected[1];
      await page.getByRole("link", { name: path === "fork" ? "Already building a fork?" : "New to opensource" }).click();
      await expect(page).toHaveURL(`/learn/${next.id}`);
    });
  }
}

test("the homepage path buttons support keyboard activation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Draft a pull request" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "New to opensource" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Already building a fork?" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(`/learn/${workflow[0].id}`);
});

test("lesson answer buttons reset on failure and complete on a correct submission", async ({ page }) => {
  await page.goto("/learn/dependencies");
  const submit = page.getByRole("button", { name: "Check your thinking" });
  await submit.click();
  await expect(page.getByText("Choose an answer before submitting.")).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "0");
  const wrong = page.getByRole("button", { name: "Yes, Git has verified it", exact: true });
  await wrong.click();
  await expect(wrong).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "0");
  await submit.click();
  await expect(page.getByText("Take another look.")).toBeVisible();
  await expect(page.locator('.answer[aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator(".answer").first()).toBeFocused();
  const correct = page.getByRole("button", { name: /Not yet: inspect dependencies/ });
  await correct.click();
  await expect(wrong).toHaveAttribute("aria-pressed", "false");
  await expect(correct).toHaveAttribute("aria-pressed", "true");
  await submit.click();
  await expect(page.getByText("That’s the idea.")).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await page.reload();
  await expect(page.getByText("Lesson complete", { exact: true })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await page.getByRole("link", { name: "Next lesson: Keep history honest" }).click();
  await expect(page).toHaveURL("/learn/history");
  await expect(page.locator("main")).toBeFocused();
  await expect(page.locator('.answer[aria-pressed="true"]')).toHaveCount(0);
});

test("every lesson completes automatically and the final lesson opens the studio", async ({ page }) => {
  for (const lesson of lessons) {
    await page.goto(`/learn/${lesson.id}`);
    await page.getByRole("button", { name: lesson.choices[lesson.answer], exact: true }).click();
    await page.getByRole("button", { name: "Check your thinking" }).click();
    await expect(page.getByText("That’s the idea.")).toBeVisible();
    await expect(page.getByText("Lesson complete", { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "10");
  await page.getByRole("link", { name: "Put it to work" }).click();
  await expect(page).toHaveURL("/studio");
});

test("a failed retry resets only the current lesson's completion", async ({ page }) => {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: storageKey,
    value: JSON.stringify({ ...createState(), completed: ["dependencies", "maintainer"] }),
  });
  await page.goto("/learn/dependencies");
  await page.getByRole("button", { name: "Yes, Git has verified it", exact: true }).click();
  await page.getByRole("button", { name: "Check your thinking" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).completed, storageKey)).toEqual(["maintainer"]);
});

test("lesson answers and submission work from the keyboard", async ({ page }) => {
  await page.goto("/learn/dependencies");
  const correct = page.getByRole("button", { name: /Not yet: inspect dependencies/ });
  await correct.focus();
  await page.keyboard.press("Space");
  await expect(correct).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Check your thinking" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Next lesson: Keep history honest" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/learn/history");
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
  for (const width of [360, 768, 1024, 1270, 1440, 1800]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByRole("link")).toHaveCount(6);
    await expect(nav.getByRole("link", { name: "Start here" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Review & draft" })).toHaveCSS("border-radius", "999px");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const diagram = await page.locator(".fork-diagram").boundingBox();
    const main = await page.locator("main").boundingBox();
    expect(diagram).not.toBeNull();
    expect(main).not.toBeNull();
    const brand = (await page.locator(".brand").boundingBox())!;
    const header = (await page.locator(".site-header-inner").boundingBox())!;
    const headerPadding = await page.locator(".site-header-inner").evaluate((node) => {
      const style = getComputedStyle(node);
      return { left: parseFloat(style.paddingLeft), right: parseFloat(style.paddingRight) };
    });
    expect(Math.abs(brand.x - main!.x)).toBeLessThan(1);
    expect(Math.abs(header.x + headerPadding.left - main!.x)).toBeLessThan(1);
    expect(Math.abs(header.x + header.width - headerPadding.right - (main!.x + main!.width))).toBeLessThan(1);

    expect(diagram!.x).toBeGreaterThanOrEqual(main!.x);
    expect(diagram!.x + diagram!.width).toBeLessThanOrEqual(main!.x + main!.width + 1);
    const heroActions = (await page.getByRole("group", { name: "Choose a starting point" }).boundingBox())!;
    expect(heroActions.x).toBeGreaterThanOrEqual(main!.x);
    expect(heroActions.x + heroActions.width).toBeLessThanOrEqual(main!.x + main!.width + 1);
    expect(heroActions.y).toBeGreaterThanOrEqual(diagram!.y + diagram!.height);
    if (width >= 1270) {
      const brand = (await page.locator(".brand").boundingBox())!;
      const theme = (await page.locator(".theme-toggle").boundingBox())!;
      const links = await nav.getByRole("link").all();
      for (const link of links) {
        const box = (await link.boundingBox())!;
        expect(Math.abs(box.y + box.height / 2 - (brand.y + brand.height / 2))).toBeLessThan(2);
        expect(box.x).toBeGreaterThanOrEqual(brand.x + brand.width);
        expect(box.x + box.width).toBeLessThanOrEqual(theme.x);
      }
    }
    if (width <= 700) {
      const heading = (await page.locator(".hero h1").boundingBox())!;
      expect(diagram!.y).toBeGreaterThanOrEqual(heading.y + heading.height);
      const steps = (await page.locator(".quick-process").boundingBox())!;
      const featured = (await page.locator(".featured-pr-card").boundingBox())!;
      expect(steps.y).toBeGreaterThanOrEqual(heroActions.y + heroActions.height);
      expect(featured.y).toBeGreaterThanOrEqual(steps.y + steps.height);
    }
    await page.goto("/studio");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (let i = 0; i < 3; i += 1) await page.keyboard.press("Tab");
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
      for (const route of ["/", "/studio", "/learn/dependencies"]) {
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

test("lesson answer states meet mobile accessibility checks in both themes", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/learn/dependencies");
    const wrong = page.getByRole("button", { name: "Yes, Git has verified it", exact: true });
    await wrong.click();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: "Check your thinking" }).click();
    await expect(page.locator('.answer[aria-pressed="true"]')).toHaveCount(0);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: /Not yet: inspect dependencies/ }).click();
    await page.getByRole("button", { name: "Check your thinking" }).click();
    await expect(page.getByRole("link", { name: "Next lesson: Keep history honest" })).toBeVisible();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
