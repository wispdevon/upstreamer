import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { checks, lessons } from "../src/content";
import { storageKey } from "../src/model";

test("two entry paths lead to different lesson sequences", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Already building in a fork/ }).click();
  await expect(page.locator(".catalog-list li")).toHaveCount(6);
  await expect(
    page.getByRole("radio", { name: "Already building in a fork" }),
  ).toBeChecked();
  await page.getByRole("radio", { name: "New to open source" }).check();
  await expect(page.locator(".catalog-list li")).toHaveCount(10);
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "New to open source" }),
  ).toBeChecked();
});

test("lesson exercise, completion, notes and route focus work together", async ({
  page,
}) => {
  await page.goto("/learn/dependencies");
  await page.getByRole("radio", { name: "Yes, Git has verified it" }).check();
  await page.getByRole("button", { name: "Check your thinking" }).click();
  await expect(page.getByText("Take another look.")).toBeVisible();
  await page
    .getByRole("radio", { name: /Not yet: inspect dependencies/ })
    .check();
  await page.getByRole("button", { name: "Check your thinking" }).click();
  await expect(page.getByText("That’s the idea.")).toBeVisible();
  await page
    .getByLabel("Your field notes")
    .fill("Trace ExportQueue before cherry-picking.");
  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Completed — undo" }),
  ).toBeVisible();
  await expect(page.getByLabel("Your field notes")).toHaveValue(
    "Trace ExportQueue before cherry-picking.",
  );
  await page.getByRole("link", { name: "Keep history honest" }).click();
  await expect(page.locator("main")).toBeFocused();
  await page.getByRole("link", { name: "Your field notes" }).click();
  await expect(page.getByLabel("Make dependencies explicit notes")).toHaveValue(
    "Trace ExportQueue before cherry-picking.",
  );
});

test("every lesson is accessible and progress can be completed and undone", async ({
  page,
}) => {
  for (const lesson of lessons) {
    await page.goto(`/learn/${lesson.id}`);
    await expect(
      page.getByRole("heading", { name: lesson.title, exact: true }),
    ).toBeVisible();
    await page
      .getByRole("radio", { name: lesson.choices[lesson.answer], exact: true })
      .check();
    await page.getByRole("button", { name: "Check your thinking" }).click();
    await expect(page.getByText("That’s the idea.")).toBeVisible();
    await page.getByRole("button", { name: "Mark lesson complete" }).click();
  }
  await expect(
    page.getByRole("progressbar", { name: "Completed lessons" }),
  ).toHaveAttribute("value", "10");
  await page.getByRole("button", { name: "Completed — undo" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "9");
});

test("brief flows into draft without inventing verification; edits survive rebuilding decisions", async ({
  page,
}) => {
  await page.goto("/workbench");
  await page
    .getByLabel("Contribution title", { exact: true })
    .fill("Remember export destination");
  await page
    .getByLabel("The problem", { exact: true })
    .fill("Repeated folder selection");
  await page
    .getByLabel("Dependencies and prerequisites", { exact: true })
    .fill("Uses upstream settings service");
  await page.getByRole("link", { name: "Draft studio", exact: true }).click();
  await expect(page.getByLabel("Pull request draft")).toHaveValue(
    /Remember export destination/,
  );
  await expect(page.getByLabel("Pull request draft")).toHaveValue(
    /Not run yet/,
  );
  await page
    .getByLabel("Pull request draft")
    .fill("# Custom handoff\n\nmacOS not tested.");
  await page.reload();
  await expect(page.getByLabel("Pull request draft")).toHaveValue(
    "# Custom handoff\n\nmacOS not tested.",
  );
  await page.getByRole("button", { name: "Rebuild from brief" }).click();
  await page.getByRole("button", { name: "Keep edits" }).click();
  await expect(page.getByLabel("Pull request draft")).toHaveValue(
    "# Custom handoff\n\nmacOS not tested.",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Markdown" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("pull-request-draft.md");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString()).toBe(
    "# Custom handoff\n\nmacOS not tested.",
  );
  await page.getByRole("button", { name: "Rebuild from brief" }).click();
  await page
    .getByRole("button", { name: "Replace draft", exact: true })
    .click();
  await expect(page.getByLabel("Pull request draft")).toHaveValue(
    /Uses upstream settings service/,
  );
});

test("loading an example protects the active brief and resets stale review data on replacement", async ({
  page,
}) => {
  await page.goto("/workbench");
  await page
    .getByLabel("Contribution title", { exact: true })
    .fill("My real contribution");
  await page
    .getByRole("link", { name: "Worked examples", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Explore this in the workbench" })
    .nth(1)
    .click();
  await page.getByRole("button", { name: "Keep my work" }).click();
  await page.getByRole("link", { name: "PR workbench", exact: true }).click();
  await expect(
    page.getByLabel("Contribution title", { exact: true }),
  ).toHaveValue("My real contribution");
  await page
    .getByRole("link", { name: "Worked examples", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Explore this in the workbench" })
    .nth(1)
    .click();
  await page.getByRole("button", { name: "Replace with this example" }).click();
  await expect(
    page.getByLabel("Dependencies and prerequisites", { exact: true }),
  ).toHaveValue(/ExportQueue.cancel/);
  await expect(
    page.getByLabel("Verification evidence", { exact: true }),
  ).toHaveValue("");
});

test("review states persist without claiming merge readiness", async ({
  page,
}) => {
  await page.goto("/review");
  for (const check of checks)
    await page
      .getByRole("group", { name: new RegExp(check.title) })
      .getByRole("radio", { name: "Satisfied", exact: true })
      .check();
  await page.reload();
  await expect(page.getByText("8 of 8 considered")).toBeVisible();
  await expect(
    page.getByText("This is a self-review, not an approval.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("group", { name: /History and attribution/i })
    .getByRole("radio", { name: "Not applicable" })
    .check();
  await page.reload();
  await expect(
    page
      .getByRole("group", { name: /History and attribution/i })
      .getByRole("radio", { name: "Not applicable" }),
  ).toBeChecked();
});

test("corrupt saved data stays untouched on initial load and app remains usable", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, "{broken"),
    storageKey,
  );
  await page.goto("/workbench");
  await expect(page.getByRole("alert")).toContainText("could not be read");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe("{broken");
  await page
    .getByLabel("Contribution title", { exact: true })
    .fill("Recovered session");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("storage quota errors retain the current session and allow export", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page.goto("/workbench");
  await page
    .getByLabel("Contribution title", { exact: true })
    .fill("Still usable");
  await expect(page.getByRole("alert")).toContainText("could not save");
  await page.getByRole("link", { name: "Draft studio", exact: true }).click();
  await expect(page.getByLabel("Pull request draft")).toHaveValue(
    /Still usable/,
  );
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Markdown" }).click();
  expect((await downloading).suggestedFilename()).toBe("pull-request-draft.md");
});

test("untrusted notes and drafts stay text rather than executable HTML", async ({
  page,
}) => {
  await page.goto("/draft");
  const hostile =
    '<img src=x onerror="window.__injected=true">\n\n<script>window.__injected=true</script>';
  await page.getByLabel("Pull request draft").fill(hostile);
  await page.getByRole("button", { name: "Read draft", exact: true }).click();
  await expect(page.locator(".draft-preview")).toContainText("<img src=x");
  await expect(
    page.locator(".draft-preview img, .draft-preview script"),
  ).toHaveCount(0);
  expect(await page.evaluate(() => "__injected" in window)).toBe(false);
});

test("responsive navigation, keyboard entry, and routes have no overflow or serious accessibility violations", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of [
      "/",
      "/learn",
      "/learn/dependencies",
      "/examples",
      "/workbench",
      "/review",
      "/draft",
      "/notes",
      "/skill",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "PR workbench", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  for (const route of [
    "/",
    "/learn",
    "/learn/dependencies",
    "/workbench",
    "/review",
    "/draft",
    "/skill",
    "/notes",
    "/examples",
  ]) {
    await page.goto(route);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("skill package is served as a downloadable zip", async ({ page }) => {
  await page.goto("/skill");
  const response = await page.request.get("/downloads/fork-to-upstream.zip");
  expect(response.status()).toBe(200);
  const bytes = await response.body();
  expect(bytes.subarray(0, 2).toString()).toBe("PK");
  await expect(
    page.getByRole("link", { name: "Download Codex skill" }),
  ).toHaveAttribute("download", "");
});
