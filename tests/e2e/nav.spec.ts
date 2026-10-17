import { expect, test } from "@playwright/test";

// Menyu tashrif buyuruvchi qaysi sahifada ekanini ko'rsatadi: eng aniq mos havola (/news/films → «Filmlar», «Yangiliklar» emas).

test("menyuda joriy bo'lim va sahifa belgilanadi", async ({ page }) => {
  await page.goto("/news/films");
  // the top bar shows from xl (1280px); below that the burger menu does the same job
  if (page.viewportSize()!.width < 1280) {
    await page.getByRole("button", { name: "Menyuni ochish" }).click();
  } else {
    const top = page.getByRole("navigation", { name: "Asosiy menyu" }).getByRole("link", { name: "Media" });
    await expect(top).toHaveAttribute("aria-current", "true");
    await top.hover();
  }
  const current = page.locator('[aria-current="page"]');
  await expect(current).toHaveCount(1);
  await expect(current).toContainText("Filmlar");
});

test("tepada «Made in Samarkand» katalogi tugmasi bor", async ({ page }) => {
  await page.goto("/about");
  // phones keep it at the top of the opened menu; wider screens show it in the bar itself
  if (page.viewportSize()!.width < 768) await page.getByRole("button", { name: "Menyuni ochish" }).click();
  const link = page.getByRole("link", { name: /Katalog|Made in Samarkand/ }).filter({ visible: true }).first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", /madeinsam\.uz/);
  await expect(link).toHaveAttribute("target", "_blank");
});
