// Hero sayohati rasmlarini tayyorlaydi: public/images/journey/*.jpg → public/images/journey/opt/
//   *-sm.{avif,webp}  asl o'lchamda (telefon, planshet, sekin internet)
//   *-lg.{avif,webp}  1920 px: Lanczos bilan kattalashtirilib, yengil keskinlashtirilgan (katta ekranlar)
// Ishga tushirish: node scripts/optimize-journey-images.mjs
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("public/images/journey");
const OUT = path.join(SRC, "opt");
const LG = 1920;

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => f.endsWith(".jpg"));

for (const file of files) {
  const name = path.basename(file, ".jpg");
  const input = path.join(SRC, file);
  const { width = LG } = await sharp(input).metadata();

  const sm = sharp(input).rotate();
  await sm.clone().avif({ quality: 62, effort: 6 }).toFile(path.join(OUT, `${name}-sm.avif`));
  await sm.clone().webp({ quality: 84, effort: 6 }).toFile(path.join(OUT, `${name}-sm.webp`));

  const lg = sharp(input)
    .rotate()
    .resize({ width: Math.max(width, LG), kernel: "lanczos3" })
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 1.4 });
  await lg.clone().avif({ quality: 58, effort: 6 }).toFile(path.join(OUT, `${name}-lg.avif`));
  await lg.clone().webp({ quality: 80, effort: 6 }).toFile(path.join(OUT, `${name}-lg.webp`));

  const sizes = await Promise.all(
    ["sm.avif", "sm.webp", "lg.avif", "lg.webp"].map(async (s) => `${s} ${Math.round((await stat(path.join(OUT, `${name}-${s}`))).size / 1024)}KB`),
  );
  console.log(`${file} (${width}px) → ${sizes.join(", ")}`);
}
