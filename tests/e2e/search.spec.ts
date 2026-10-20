import { expect, test, type Page } from "@playwright/test";

// Sayt bo'yicha qidiruv: tepadagi oyna yozish bilan natija beradi, apostrofning har xil yozilishi bir xil topiladi,
// ↓ + Enter tanlangan natijani ochadi; /search sahifasi natijalarni turlar bo'yicha guruhlaydi.

async function openSearch(page: Page) {
  // phones keep the search at the top of the opened menu; wider screens have the button in the bar
  if (page.viewportSize()!.width < 640) {
    await page.getByRole("button", { name: "Menyuni ochish" }).click();
    await page.getByRole("button", { name: /Saytdan qidirish/ }).click();
  } else {
    await page.getByRole("button", { name: "Qidirish", exact: true }).click();
  }
  const box = page.getByRole("combobox", { name: "Sayt bo‘yicha qidirish" });
  await expect(box).toBeFocused();
  return box;
}

test("tepadagi qidiruv yozish bilan natija beradi va klaviatura bilan ochadi", async ({ page }) => {
  await page.goto("/about");
  const box = await openSearch(page);
  // an ASCII apostrophe finds «A’zolik» (typographic one) — the menu page answers at once
  await box.fill("a'zolik");
  const first = page.getByRole("option").first();
  await expect(first).toContainText("A’zolik");
  await box.press("ArrowDown");
  await expect(first).toHaveAttribute("aria-selected", "true");
  await box.press("Enter");
  await expect(page).toHaveURL(/\/about\/membership$/);
  await expect(page.getByRole("dialog", { name: "Sayt bo‘yicha qidiruv" })).toHaveCount(0);
});

test("qidiruv kontentni ham topadi va to'liq natijalar sahifasiga olib boradi", async ({ page }) => {
  await page.goto("/about");
  const box = await openSearch(page);
  await box.fill("siyob");
  await expect(page.locator('[role="option"][href="/projects/siyob-canal"]')).toBeVisible();
  await box.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=siyob$/);
  const results = page.getByRole("main");
  await expect(results.locator('a[href="/projects/siyob-canal"]').filter({ visible: true }).first()).toBeVisible();
  // a filter per kind: «Loyiha» keeps only projects
  await results.getByRole("link", { name: /^Loyiha\s*\d+$/ }).click();
  await expect(page).toHaveURL(/kind=Loyiha/);
  await expect(results.getByRole("region", { name: "Loyiha" })).toBeVisible();
  await expect(results.getByRole("region", { name: "Kengash a’zosi" })).toHaveCount(0);
});
