import { expect, test, type Page } from "@playwright/test";

// Bosh sahifaning asosiy kafolatlari: ochiladi, yonga scroll yo'q, bo'limlar bir-biriga kirmaydi,
// xatolik yo'q, ikkala rejim ishlaydi. Desktop va telefon (Pixel 7) proyektlarida ishlaydi.

/** Preloader tugashini kutadi (odometr yo'qoladi). */
async function openHome(page: Page, theme?: "light" | "dark") {
  if (theme) await page.addInitScript((t) => localStorage.setItem("ys-theme", t), theme);
  await page.goto("/");
  await expect(page.locator(".odo")).toHaveCount(0, { timeout: 15_000 });
}

/** Sahifani qadam-baqadam pastga aylantiradi (barcha ScrollTrigger'lar ishga tushadi). */
async function scrollThrough(page: Page, onStep?: () => Promise<void>) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = await page.evaluate(() => Math.round(innerHeight * 0.9));
  for (let y = 0; y < height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
    await onStep?.();
  }
}

test("ochiladi va xatoliksiz ishlaydi", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    // backend (Django) o'chiq bo'lsa /api so'rovlari yiqiladi — bu sahifa xatosi emas
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) errors.push(m.text());
  });
  await openHome(page);
  await expect(page.locator("header").first()).toBeVisible();
  await expect(page.locator("h1")).toContainText("Samarqand");
  await scrollThrough(page);
  expect(errors).toEqual([]);
});

test("yonga scroll yo'q (har qadamda)", async ({ page }) => {
  await openHome(page);
  await scrollThrough(page, async () => {
    // clientWidth, not innerWidth: a phone widens its layout viewport (and innerWidth) to fit overflow
    const [sw, w] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(sw).toBeLessThanOrEqual(w);
  });
});

test("bo'limlar ketma-ket, bir-birining ustiga chiqmaydi", async ({ page }) => {
  await openHome(page);
  await scrollThrough(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const boxes = await page.evaluate(() =>
    Array.from(document.querySelectorAll("main > *")).map((el) => {
      const r = el.getBoundingClientRect();
      return { name: el.querySelector("section")?.id || el.id || el.className.toString().slice(0, 30), top: r.top + scrollY, bottom: r.bottom + scrollY };
    }),
  );
  for (let i = 1; i < boxes.length; i++) {
    expect(boxes[i].top, `${boxes[i].name} oldingisi (${boxes[i - 1].name}) ustiga chiqib qolgan`).toBeGreaterThanOrEqual(boxes[i - 1].bottom - 2);
  }
});

test("bo'lim sarlavhalari o'z ustuniga sig'adi (kesilmaydi)", async ({ page }) => {
  await openHome(page);
  await scrollThrough(page);
  const overflowing = await page.evaluate(() =>
    Array.from(document.querySelectorAll("main section h2")).flatMap((h) => {
      const width = h.getBoundingClientRect().width;
      const widest = Math.max(0, ...Array.from(h.querySelectorAll("div > div, span"), (l) => l.scrollWidth));
      return widest > width + 1 ? [`${h.closest("section")?.id}: ${Math.round(widest)} > ${Math.round(width)}`] : [];
    }),
  );
  expect(overflowing).toEqual([]);
});

test("forum: barcha nominatsiyalar 2023 → 2024 → 2025 tartibida chiqadi", async ({ page }) => {
  await openHome(page);
  const forum = page.locator("#forum");
  await forum.scrollIntoViewIfNeeded();
  // the section is pinned, one scroll step per forum; the rest of a forum is behind ‹ ›
  const seen = new Set<string>();
  const order: string[] = [];
  const box = await page.evaluate(() => {
    const spacer = document.getElementById("forum")!.querySelector(".pin-spacer") as HTMLElement;
    return { top: spacer.getBoundingClientRect().top + scrollY, distance: spacer.offsetHeight - innerHeight };
  });
  for (let k = 0; k < 3; k++) {
    await page.evaluate(([top, distance, step]) => window.scrollTo(0, top + (distance * (step + 0.5)) / 3), [box.top, box.distance, k]);
    await page.waitForTimeout(900);
    const year = (await forum.locator("button[aria-pressed=true]").first().innerText()).slice(0, 4);
    order.push(year);
    for (;;) {
      for (const t of await forum.locator("li h3").allInnerTexts()) seen.add(`${year}|${t}`);
      const next = forum.getByRole("button", { name: "Keyingi nominatsiyalar" });
      if (!(await next.count()) || (await next.isDisabled())) break;
      await next.click();
      await page.waitForTimeout(900);
    }
  }
  expect(order).toEqual(["2023", "2024", "2025"]);
  expect(seen.size).toBe(8 + 12 + 4);
});

test("footer havolalari haqiqiy sahifalarga olib boradi", async ({ page }) => {
  await openHome(page);
  expect(await page.locator("footer a[href^='/']").count()).toBeGreaterThan(10);
});

test("tungi rejim saqlanadi va ochiladi", async ({ page }) => {
  await openHome(page, "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("h1")).toBeVisible();
});
