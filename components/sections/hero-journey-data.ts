// Darvozadan keyingi sayohat: Registon eshigi ochilgach har bir joy butun ekranda to'liq ko'rinadi,
// so'ng o'ziga xos o'tish bilan keyingisiga almashadi va Imom al-Buxoriy majmuasida yakunlanadi.
// Rasmlar: public/images/journey (eski saytdagi hero rasmlari; opt/ ichida AVIF/WebP versiyalari).

/** Bekatdan chiqish usuli: jalyuzi, tezlik "warp"i, eshik kabi ochilish yoki final mozaika. */
export type JourneyExit = "shutter" | "warp" | "doors" | "final";

export interface JourneyStop {
  key: string;
  /** rasm tomonlar nisbati (kenglik / balandlik) — bo'laklar cover bilan aniq mos tushishi uchun */
  ar: number;
  /** kadr markazi (object-position kabi), 0..1 */
  fx: number;
  fy: number;
  index: string;
  label: string;
  title: string;
  caption: string;
  exit: JourneyExit;
}

export const JOURNEY: JourneyStop[] = [
  {
    key: "khoja-daniyar",
    ar: 720 / 479,
    fx: 0.5,
    fy: 0.42,
    index: "02",
    label: "Ziyoratgoh · Afrosiyob",
    title: "Xo‘ja Doniyor",
    caption: "Samarqandning eng e’zozli ziyoratgohlaridan biri.",
    exit: "shutter",
  },
  {
    key: "airport",
    ar: 1024 / 682,
    fx: 0.5,
    fy: 0.55,
    index: "03",
    label: "Zamonaviy darvoza",
    title: "Samarqand aeroporti",
    caption: "Samarqandning dunyoga ochilgan zamonaviy darvozasi.",
    exit: "warp",
  },
  {
    key: "tourist-center",
    ar: 1024 / 575,
    fx: 0.5,
    fy: 0.5,
    index: "04",
    label: "Turizm · Biznes · Investitsiya",
    title: "Ipak yo‘li",
    caption: "Turizm, biznes va investitsiyalar uchun yangi makon.",
    exit: "doors",
  },
  {
    key: "imam-bukhari",
    ar: 1024 / 592,
    fx: 0.5,
    fy: 0.5,
    index: "05",
    label: "Ma’naviyat markazi",
    title: "Imom al‑Buxoriy",
    caption: "Ma’naviy meros va mamlakat kelajagi ramzi.",
    exit: "final",
  },
];

/** Yo'l xaritasi (o'ng tomondagi ko'rsatkich): Registon birinchi bekat. */
export const JOURNEY_RAIL = ["Registon", "Xo‘ja Doniyor", "Aeroport", "Ipak yo‘li", "Imom al‑Buxoriy"];

/** Bo'laklar soni: jalyuzi chiziqlari va eshik tavaqalari (final bitta butun kadr). */
export const PIECES: Record<JourneyExit, [cols: number, rows: number]> = {
  shutter: [7, 1],
  warp: [1, 1],
  doors: [2, 1],
  final: [1, 1],
};

/**
 * Rasm manbalari (scripts/optimize-journey-images.mjs yaratadi): AVIF, eski brauzerlar uchun WebP.
 * sm — asl o'lcham (telefon, sekin internet), lg — 1920 px (katta ekranlar).
 */
export function journeyImage(key: string, size: "sm" | "lg") {
  const base = `/images/journey/opt/${key}-${size}`;
  return `image-set(url("${base}.avif") type("image/avif"), url("${base}.webp") type("image/webp"))`;
}
