// Globus posteri: WebGL globusning tayyor rasmi (kunduzgi va tungi). Sahifa ochilishi bilan shu rasm
// ko'rinadi, 3D globus esa tayyor bo'lgach ustiga almashadi; yengil rejimda faqat rasm qoladi.
//   public/images/globe/{day,night}.webp  (shaffof fon)
// Ishga tushirish (sayt ishlab turgan bo'lsin):  node scripts/render-globe-poster.mjs [http://localhost:3000]
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = path.resolve("public/images/globe");
const SIZE = 1200;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=default"] });

for (const [theme, name] of [["light", "day"], ["dark", "night"]]) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.5 });
  await ctx.addInitScript((t) => localStorage.setItem("ys-theme", t), theme);
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.locator(".odo").waitFor({ state: "detached", timeout: 60000 }).catch(() => {});
  // full quality even if this machine (or a slow dev build) switched the page to its light version
  await page.evaluate(() => document.documentElement.removeAttribute("data-lite"));
  // bring the section's centre to the screen centre: the globe has spun round to face Samarkand
  await page.evaluate(() => {
    const s = document.getElementById("ipak-yoli");
    window.scrollTo(0, s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2 - innerHeight / 2);
  });
  const canvas = page.locator("#ipak-yoli canvas");
  await canvas.waitFor({ timeout: 30000 });
  await page.waitForTimeout(6000); // textures in, rotation settled
  // only the globe, on a transparent page
  await page.addStyleTag({
    content: "html,body{background:transparent!important} body *{visibility:hidden!important} #ipak-yoli canvas{visibility:visible!important}",
  });
  const png = await canvas.screenshot({ omitBackground: true });
  // keep only the globe and its atmosphere: a soft round mask drops anything else the capture caught
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><defs><radialGradient id="g"><stop offset="0.86" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE * 0.47}" fill="url(#g)"/></svg>`,
  );
  const square = await sharp(png).resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp(square)
    .composite([{ input: mask, blend: "dest-in" }])
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(path.join(OUT, `${name}.webp`));
  console.log("ok", name);
  await ctx.close();
}
await browser.close();
