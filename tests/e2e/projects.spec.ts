import { expect, test } from "@playwright/test";

// Siyob kanali loyihasi: «Siyob haqida» bo'limi (daryo yo'li) va hujjatdagi 8 tashabbuskor.

test("Siyob kanali: daryo yo'li va tashabbuskorlar", async ({ page }) => {
  await page.goto("/projects/siyob-canal");
  await expect(page.getByText("Siyob haqida")).toBeVisible();
  await expect(page.getByText("20–23 km")).toBeVisible();
  // the route reads from the source to the mouth, whichever layout the screen gets
  for (const place of ["Eshkak eshish kanali", "Cho‘ponota", "Afrosiyob", "Xalqaro aeroport", "Pastdarg‘om tumani"]) {
    await expect(page.getByText(place, { exact: true }).filter({ visible: true })).toHaveCount(1);
  }
  await expect(page.getByText("betonlash", { exact: false })).toBeVisible();
  await expect(page.getByText("Marupov Baxtiyor Mahmudovich", { exact: false })).toBeVisible();
});
