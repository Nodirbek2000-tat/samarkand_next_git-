import { expect, test } from "@playwright/test";

// Ichki forum sahifalari: backend (admin panel) o'chiq bo'lsa ham rasmiy ro'yxat bilan to'liq ochiladi.

test("barcha forumlar sahifasi: 3 ta yil va kategoriyalar jadvali", async ({ page }) => {
  await page.goto("/business-environment/forum");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Eng ilg‘orlar");
  for (const year of ["2023", "2024", "2025"]) {
    await expect(page.locator(`a[href="/business-environment/forum/${year}"]`).first()).toBeVisible();
  }
  await expect(page.getByText("AZIA METALL PROF").first()).toBeVisible();
});

for (const [year, count] of [["2023", 8], ["2024", 12], ["2025", 4]] as const) {
  test(`forum ${year}: barcha ${count} nominatsiya va filtr`, async ({ page }) => {
    await page.goto(`/business-environment/forum/${year}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(year);
    const cards = page.locator("main ul li article");
    await expect(cards).toHaveCount(count);
    // one category at a time
    await page.getByRole("button", { name: /^Lokalizatsiya/ }).click();
    await expect(cards).toHaveCount(1);
    await page.getByRole("button", { name: /^Hammasi/ }).click();
    await expect(cards).toHaveCount(count);
  });
}

test("yo'q yil uchun 404 sahifa", async ({ page }) => {
  await page.goto("/business-environment/forum/1999");
  await expect(page.getByText("Sahifa topilmadi")).toBeVisible();
});
