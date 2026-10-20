// Hero eshigi rasmlari: public/images/gate/door-{day,night}.webp va door-glow.webp (asl nusxalar, WebP — eski
// brauzerlar uchun ham qoladi) dan quyidagilar yaratiladi:
//   door-{day,night}.avif         950 px, kompyuter (WebP dan ~45% kichik, ko'zga farqi yo'q)
//   door-{day,night}-sm.{avif,webp} 720 px, telefon (eshik u yerda eng yaqin zoom'da ham ~350 px)
//   door-glow.avif                yaltiroq qatlam
// Ishga tushirish: node scripts/optimize-door-images.mjs
// Rasm o'zgarsa, fayl nomini ham o'zgartiring (public/images bir hafta keshlanadi, next.config.ts).
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/images/gate");
const AVIF = { quality: 50, effort: 6 };

for (const name of ["door-day", "door-night"]) {
  const src = path.join(DIR, `${name}.webp`);
  await sharp(src).avif(AVIF).toFile(path.join(DIR, `${name}.avif`));
  const sm = sharp(src).resize({ width: 720, kernel: "lanczos3" });
  await sm.clone().avif(AVIF).toFile(path.join(DIR, `${name}-sm.avif`));
  await sm.clone().webp({ quality: 80, alphaQuality: 85, effort: 6 }).toFile(path.join(DIR, `${name}-sm.webp`));
  console.log("ok", name);
}
await sharp(path.join(DIR, "door-glow.webp")).avif(AVIF).toFile(path.join(DIR, "door-glow.avif"));
console.log("ok door-glow");
