import { expect, test } from "@playwright/test";

// Siyob kanali loyihasi: «Siyob haqida» bo'limi (daryo yo'li) va hujjatdagi 8 tashabbuskor.

test("Siyob kanali: daryo yo'li va tashabbuskorlar", async ({ page }) => {
  await page.goto("/projects/siyob-canal");
  // the first, still-streaming render can briefly hold a hidden copy of the section: check the visible one
  await expect(page.getByText("Siyob haqida").filter({ visible: true })).toBeVisible();
  await expect(page.getByText("20–23 km").filter({ visible: true })).toBeVisible();
  // the route reads from the source to the mouth, whichever layout the screen gets
  for (const place of ["Eshkak eshish kanali", "Cho‘ponota", "Afrosiyob", "Xalqaro aeroport", "Pastdarg‘om tumani"]) {
    await expect(page.getByText(place, { exact: true }).filter({ visible: true })).toHaveCount(1);
  }
  await expect(page.getByText("betonlash", { exact: false }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText("Marupov Baxtiyor Mahmudovich", { exact: false }).filter({ visible: true })).toBeVisible();
});
