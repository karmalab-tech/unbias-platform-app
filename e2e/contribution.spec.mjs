import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";

const fixture = fileURLToPath(new URL("../spec/fixtures/files/person.jpg", import.meta.url));
const admin = { email: process.env.ADMIN_EMAIL ?? "pierre.de.milly@gmail.com", password: process.env.ADMIN_PASSWORD ?? "unbias-admin" };

async function describePerson(page) {
  await page.getByRole("radio", { name: "30–44" }).click();
  await page.getByRole("radio", { name: "Skin tone 6" }).click();
  await page.getByRole("radio", { name: "Woman" }).click();
  await page.getByRole("radio", { name: "Medium" }).click();
}

test("a contributor submits, a moderator approves, the dashboard moves", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contribute/upload");
  await page.getByText("Upload photos").first().waitFor();
  await page.locator("input[type=file]").setInputFiles(fixture);
  await expect(page.getByText("1 photo ready")).toBeVisible({ timeout: 30_000 });
  await page.locator("footer").getByRole("button", { name: "Continue" }).click();

  await page.waitForURL(/permission/);
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button", { name: "I confirm" }).click();

  await page.waitForURL(/photos\/1\/people$/);
  await page.waitForFunction(() => !document.body.innerText.includes("Looking for people"), null, { timeout: 60_000 });
  const image = page.locator("main img").first();
  const box = await image.boundingBox();
  if ((await page.getByRole("button", { name: /Remove person/ }).count()) === 0) {
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.45);
  }
  await page.locator("footer").getByRole("button", { name: /Continue with/ }).click();

  await page.waitForURL(/people\/1$/);
  await describePerson(page);
  await page.getByRole("button", { name: "Done with this photo" }).click();

  await page.waitForURL(/review/);
  await expect(page.getByText("Complete")).toBeVisible();
  await page.getByRole("button", { name: "Continue to consent" }).click();

  await page.waitForURL(/consent/);
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Submit my photos" }).click();
  await page.waitForURL(/done/);
  const code = (await page.locator("code").innerText()).trim();
  expect(code).toMatch(/^UNB-[0-9A-Z]{4}-[0-9A-Z]{4}$/);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/moderation");
  await page.waitForURL(/login/);
  await page.fill("#email", admin.email);
  await page.fill("#password", admin.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/moderation\/\d+/);
  await expect(page.getByText(code)).toBeVisible();
  await page.keyboard.press("a");
  await expect(page.getByText(/Approved today [1-9]/)).toBeVisible();

  await page.goto("/");
  await expect(page.locator("section").first()).toContainText(/[1-9]\d*\s*\/ 10,000/);
});
