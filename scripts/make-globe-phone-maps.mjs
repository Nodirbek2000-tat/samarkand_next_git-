// Telefon globusi uchun kichik xaritalar: telefondagi globus ~400 px, unga 1K xarita yetadi
// (2K ning to'rtdan bir hajmi). Manba — kompyuter globusining 2K xaritalari.
//   public/textures/earth/{day,night}-1k.webp
// Ishga tushirish:  node scripts/make-globe-phone-maps.mjs
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/textures/earth");

for (const name of ["day", "night"]) {
  const out = path.join(DIR, `${name}-1k.webp`);
  const info = await sharp(path.join(DIR, `${name}-2k.webp`))
    .resize(1024, 512, { kernel: "lanczos3" })
    .webp({ quality: 82, effort: 6 })
    .toFile(out);
  console.log(`${name}-1k.webp  ${Math.round(info.size / 1024)} KB`);
}
