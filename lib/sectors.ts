/**
 * Which line of business a council member's company is in — read from the company name (and the admin's
 * "Faoliyat sohasi" field when it is filled). Each sector gets its own Samarqand ornament behind the portrait.
 */
export type Sector = "agro" | "industry" | "textile" | "health" | "education" | "tourism" | "general";

export const SECTOR_LABEL: Record<Sector, string> = {
  agro: "Qishloq xo‘jaligi va oziq-ovqat",
  industry: "Sanoat va qurilish",
  textile: "To‘qimachilik va gilamchilik",
  health: "Tibbiyot va farmatsevtika",
  education: "Ta’lim va fan",
  tourism: "Turizm va xizmatlar",
  general: "Tadbirkorlik",
};

// order matters: the first family whose words appear in the text wins
const RULES: [Sector, RegExp][] = [
  ["health", /pharm|meros|farm(?!er)|med\b|zarmed|tibbiy|shifo|klinika|health|apteka|dori/i],
  ["education", /universitet|institut|ta[’'‘]?lim|maktab|akademiya|ilm|fan\b|professor/i],
  ["tourism", /\btur\b|turizm|tour|travel|mehmonxona|hotel|sayyoh|star tur/i],
  ["textile", /tola|to[‘'’]?qim|textile|tekstil|gilam|carpet|\bsag\b|paxta|ip\b|charm|tikuv|kiyim/i],
  [
    "agro",
    /agro|konserva|parranda|nasl|cheakpeas|chickpea|no[‘'’]?xat|meva|sabzavot|bog[‘'’]|uzum|charos|eko|planeta|oziq|food|sut|go[‘'’]sht|qishloq|fermer|\bxk\b|un\b|non\b/i,
  ],
  [
    "industry",
    /metall|metal|stroy|qurilish|zavod|elektro|sanoat|steklo|plastik|pack|mebel|yog[‘'’]och|yug[‘'’]och|beton|sement|g[‘'’]isht|kabel|texnika|mash/i,
  ],
];

function match(text: string): Sector | null {
  for (const [sector, re] of RULES) if (re.test(text)) return sector;
  return null;
}

/** The admin's own "Faoliyat sohasi" decides first; otherwise the company / workplace name. */
export function sectorOf(industry: string | null | undefined, ...texts: (string | null | undefined)[]): Sector {
  return (industry && match(industry)) || match(texts.filter(Boolean).join(" · ")) || "general";
}
