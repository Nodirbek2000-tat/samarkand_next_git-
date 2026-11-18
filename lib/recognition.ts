// "Eng ilg‘orlarni e’tirof etish" sahifasi uchun ma'lumot: avval admin panel (Django API), u javob bermasa —
// Kengashning rasmiy ro'yxati (lib/recognition-data.ts).
import { api } from "@/lib/api/server";
import { RECOGNITIONS, type RecognitionItem } from "@/lib/recognition-data";

export { awardKind, type AwardKind } from "@/lib/recognition-data";

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.$/, "");

/** "…farmoni bilan respublikaning … uchun" → basis "…farmoni bilan", reason "respublikaning … uchun" */
function splitBasis(text: string) {
  const m = text.match(/^(.*?(?:bilan|yig‘ilishida))[,:]?\s+(.+)$/);
  return m ? { basis: m[1], reason: m[2] } : { basis: text };
}

/** Every recognition, oldest year first. */
export async function getRecognitions(): Promise<RecognitionItem[]> {
  const list = await api.recognitions();
  if (!list?.length) return RECOGNITIONS;
  return [...list]
    .sort((a, b) => a.year - b.year || a.order - b.order)
    .map((r) => ({ year: r.year, fullName: r.full_name, company: r.company, award: r.award, ...splitBasis(plain(r.description)), photo: r.photo }));
}
