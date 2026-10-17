import { expect, test } from "@playwright/test";

// "Yutuqlarni e'tirof etish": admin panel ma'lumoti yoki (backend o'chiq bo'lsa) rasmiy ro'yxat bilan to'liq ochiladi.

test("e’tirof sahifasi: yillar, taqdirlanganlar va mukofotlar", async ({ page }) => {
  await page.goto("/council/recognition");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("e’tirof etish");
  for (const year of ["2022", "2023", "2024", "2025"]) {
    await expect(page.getByText(year, { exact: true }).first()).toBeVisible();
  }
  // documented in the council's list: the 2022 «Shuhrat» medal and the 2025 «Turon» academy nominations
  await expect(page.getByRole("heading", { name: "Karimov Ravshan Murodovich" })).toBeVisible();
  await expect(page.getByText("«Turon» xalqaro akademiyasining faxriy a’zoligiga taqdim etilgan").first()).toBeVisible();
  expect(await page.locator("article h3").count()).toBeGreaterThanOrEqual(12);
  await expect(page.locator('a[href="/business-environment/forum"]').last()).toBeVisible();
});
