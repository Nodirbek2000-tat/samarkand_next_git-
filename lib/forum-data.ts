// Samarqand viloyati sanoatchilar forumi — nominatsiyalar va g'oliblar.
// Manba: forumlarning rasmiy nominatsiya ro'yxatlari (2022, 2023, 2024-yil yakunlari), o'zbekchaga o'girilgan.
// Ichki sahifalar (lib/forum.ts) avval admin panel (backend) ma'lumotini oladi; backend javob bermasa — shu ro'yxat.

export type ForumCategory = "lokal" | "koop" | "invest" | "eksport" | "brend" | "tarmoq" | "turizm" | "ijtimoiy" | "oav";

export const CATEGORIES: Record<ForumCategory, { label: string; color: string }> = {
  lokal: { label: "Lokalizatsiya", color: "var(--color-turq)" },
  koop: { label: "Kooperatsiya", color: "var(--color-lapis)" },
  invest: { label: "Investitsiya", color: "var(--color-gold)" },
  eksport: { label: "Eksport", color: "var(--color-ember)" },
  brend: { label: "Brend", color: "var(--color-gold)" },
  tarmoq: { label: "Tarmoq yetakchisi", color: "var(--color-turq)" },
  turizm: { label: "Turizm", color: "var(--color-lapis)" },
  ijtimoiy: { label: "Ijtimoiy faollik", color: "var(--color-ember)" },
  oav: { label: "OAV", color: "var(--color-mist)" },
};

/** reading order of the categories: home section, forum pages and the category table follow it */
export const CATEGORY_ORDER: ForumCategory[] = ["lokal", "koop", "invest", "tarmoq", "eksport", "brend", "turizm", "ijtimoiy", "oav"];
export const sortByCategory = <T extends { cat: ForumCategory }>(list: T[]): T[] =>
  [...list].sort((x, y) => CATEGORY_ORDER.indexOf(x.cat) - CATEGORY_ORDER.indexOf(y.cat));

/** 1–3: diplom darajasi, "winner": darajasiz g'olib, "special": OAV nominatsiyasi */
export type Place = 1 | 2 | 3 | "winner" | "special";
export type ForumWinner = { place: Place; name: string; note?: string };
export type Nomination = { cat: ForumCategory; title: string; official: string; winners: ForumWinner[] };
export type ForumYear = { year: number; resultsYear: number; date: string; nominations: Nomination[] };

const podium = (...w: [string, string?][]): ForumWinner[] => w.map(([name, note], i) => ({ place: (i + 1) as 1 | 2 | 3, name, note }));

export const FORUM: ForumYear[] = [
  {
    year: 2023,
    resultsYear: 2022,
    date: "30–31 may 2023",
    nominations: [
      {
        cat: "lokal",
        title: "Ishlab chiqarishni lokalizatsiya qilish",
        official: "2022-yilda ishlab chiqarishni lokalizatsiya qilish sohasidagi eng namunali korxona",
        winners: podium(["AZIA METALL PROF", "QK MChJ"], ["MIRANKUL CONSTRUCTION MATERIALS", "MChJ"], ["KATTAQO‘RG‘ON ELEKTRO TEXNIKA ZAVODI", "MChJ"]),
      },
      {
        cat: "koop",
        title: "Sanoat kooperatsiyasi",
        official: "2022-yilda sanoat kooperatsiyasi sohasidagi eng namunali korxona",
        winners: podium(["STEKLOPLASTIK", "MChJ"], ["MITAN YOG‘DU ELEKTRIK", "MChJ"], ["SAM NEGIN", "MChJ"]),
      },
      {
        cat: "invest",
        title: "Sanoatdagi eng yirik investitsiya loyihasi",
        official: "2022-yilda sanoat sohasidagi eng yirik investitsiya loyihasi",
        winners: podium(["BAHT SAMARKAND TEKS", "MChJ"], ["AZIA METALL PROF", "QK MChJ"], ["SMART HYGIENE FACILITIES", "MChJ"]),
      },
      {
        cat: "brend",
        title: "Eng namunali brend",
        official: "2022-yilning eng namunali brendi",
        winners: podium(
          ["SAG", "savdo belgisi · «Sam Antep Gilam» MChJ"],
          ["Pure Milky", "savdo belgisi · «SIYOB Group» kompaniyalar guruhi"],
          ["Nishon Baxt", "savdo belgisi · «Nishon Baxt» XK"],
        ),
      },
      {
        cat: "eksport",
        title: "Eksportyor korxona — yirik korxonalar",
        official: "2022-yilning eng namunali eksportyor korxonasi (yirik korxonalar orasida)",
        winners: podium(["AZIA METALL PROF", "QK MChJ"], ["PAXTACHI KLASTER", "MChJ"], ["OHALIK OLTIN BOG‘I MEVASI", "MChJ"]),
      },
      {
        cat: "eksport",
        title: "Eksportyor korxona — o‘rta va kichik korxonalar",
        official: "2022-yilning eng namunali eksportyor korxonasi (o‘rta va kichik korxonalar orasida)",
        winners: podium(["JOMBOY NASLLI PARRANDA", "MChJ"], ["DKIZ 2022", "MChJ"], ["URGUT KAMOL JAMOL", "MChJ"]),
      },
      {
        cat: "ijtimoiy",
        title: "Ijtimoiy faol korxona",
        official: "2023-yilning eng namunali ijtimoiy faol korxonasi",
        winners: podium(["SXF Group", "kompaniyalar guruhi"], ["Nurli Kelajak Ishonch Servis", "MChJ"], ["Sam Antep Gilam", "MChJ"]),
      },
      {
        cat: "oav",
        title: "Ommaviy axborot vositalari xodimlari",
        official: "Ommaviy axborot vositalari xodimlari orasidagi nominatsiya",
        winners: [
          { place: "special", name: "O‘ktam Xudoyberdiyev", note: "«Zarafshon» gazetasi muxbiri" },
          { place: "special", name: "Yulduz Haydarova", note: "«Samarkandskiy vestnik» gazetasi muxbiri" },
          { place: "special", name: "Jamshed Obidov", note: "«Ovozi Samarqand» gazetasi muxbiri" },
          { place: "special", name: "Lutfulla Shomurodov", note: "«O‘zbekiston — 24» telekanali muxbiri" },
          { place: "special", name: "Ikrom Mamadaliyev", note: "2022-yilning eng faol teleoperatori" },
        ],
      },
    ],
  },
  {
    year: 2024,
    resultsYear: 2023,
    date: "16–17 may 2024",
    nominations: [
      {
        cat: "lokal",
        title: "Ishlab chiqarishni lokalizatsiya qilish",
        official: "2023-yilda ishlab chiqarishni lokalizatsiya qilish sohasidagi eng namunali korxona",
        winners: podium(["NBA ALLIANZ", "MChJ"], ["SATURN METAL QAYTA ISHLASH", "MChJ"], ["SAMARKAND GOLDEN COLORS", "MChJ"]),
      },
      {
        cat: "koop",
        title: "Sanoat kooperatsiyasi",
        official: "2023-yilda sanoat kooperatsiyasi sohasidagi eng namunali korxona",
        winners: podium(["MITAN YOG‘DU ELEKTRIK", "MChJ"], ["ESMAK", "MChJ"], ["SHERDOR ELITA PLAST", "MChJ"]),
      },
      {
        cat: "tarmoq",
        title: "Oziq-ovqat sanoati",
        official: "2023-yilda oziq-ovqat sanoatidagi eng namunali korxona",
        winners: podium(["MAROQAND GOLD OIL EXTRACTION", "MChJ"], ["PAXTACHI RODNIK", "MChJ"], ["NISHON GROUP", "MChJ"]),
      },
      {
        cat: "eksport",
        title: "Sanoat mahsulotlari eksporti",
        official: "2023-yilda sanoat mahsulotlarini eksport qiluvchi eng namunali korxona",
        winners: podium(["BRADJUS", "MChJ"], ["HASID TEXTILE", "YaTT"], ["ASIA TAREN", "MChJ"]),
      },
      {
        cat: "brend",
        title: "Eng namunali brend",
        official: "2023-yilning eng namunali brendi",
        winners: podium(
          ["KLEO", "savdo belgisi · «SAM FERRE» MChJ"],
          ["AGRO BRAVO", "savdo belgisi · «AGRO BRAVO» MChJ"],
          ["MONDELUX", "savdo belgisi · «GULOBOD MEBEL» MChJ"],
        ),
      },
      {
        cat: "turizm",
        title: "Turizm sohasi",
        official: "2023-yilda turizm sohasidagi eng namunali korxona",
        winners: podium(["SOF EXPO SAMARKAND", "ko‘rgazma markazi"], ["SILK TUR", "MChJ"], ["BO‘STON TRAVEL", "MChJ"]),
      },
      {
        cat: "eksport",
        title: "Qishloq xo‘jaligi mahsulotlari eksporti",
        official: "2023-yilda qishloq xo‘jaligi mahsulotlarini eksport qiluvchi eng namunali korxona",
        winners: podium(["ANSORJON AGRO SAXOVATI", "MChJ"], ["AGRO SOY PLAST", "MChJ"], ["HAKAN AGRO INVEST", "MChJ"]),
      },
      {
        cat: "turizm",
        title: "Turizm uchun mahsulot ishlab chiqarish",
        official: "2023-yilda turizm sohasi uchun mahsulot ishlab chiqaruvchi eng namunali korxona",
        winners: podium(["KUMUSH TOLA", "XK"], ["ASIA INVEST TEXTILE", "MChJ"], ["SAIDOV ABDULLO", "YaTT"]),
      },
      {
        cat: "tarmoq",
        title: "Elektrotexnika sanoati",
        official: "2023-yilda elektrotexnika sanoatidagi eng namunali korxona",
        winners: podium(["SAM NUR TAFRIZ", "MChJ"], ["TESPACK INVESTMENT", "MChJ"], ["KATTAQO‘RG‘ON ELEKTROTEXNIKA ZAVODI", "MChJ"]),
      },
      {
        cat: "tarmoq",
        title: "Farmatsevtika sanoati",
        official: "2023-yilda farmatsevtika sanoatidagi eng namunali korxona",
        winners: podium(["OPTIMA SOBIRJON", "MChJ"], ["MAXMADJON NURAFSHON", "XK"], ["FORTUNA URGUT MEDICAL", "MChJ"]),
      },
      {
        cat: "tarmoq",
        title: "Mebel sanoati",
        official: "2023-yilda mebel sanoatidagi eng namunali korxona",
        winners: podium(["ERKIN SAVDO MOBIL SERVIS", "MChJ"], ["MEHR MEBELI", "oilaviy korxona"], ["SABINA-S", "MChJ"]),
      },
      {
        cat: "tarmoq",
        title: "Qurilish materiallari sanoati",
        official: "2023-yilda qurilish materiallari sanoatidagi eng namunali korxona",
        winners: podium(["KAFOLAT-STIL", "MChJ"], ["FOX PIPES INNOVATION", "MChJ"], ["XITOY BESH BARMOQ QURILISH MATERIALLARI", "YaTT"]),
      },
    ],
  },
  {
    year: 2025,
    resultsYear: 2024,
    date: "17–18 aprel 2025",
    nominations: [
      {
        cat: "koop",
        title: "Sanoat kooperatsiyasi",
        official: "2024-yilda sanoat kooperatsiyasi sohasidagi eng namunali korxona",
        winners: [{ place: "winner", name: "SAM FERRE", note: "MChJ · Urgut tumani" }],
      },
      {
        cat: "lokal",
        title: "Ishlab chiqarishni lokalizatsiya qilish",
        official: "2024-yilda ishlab chiqarishni lokalizatsiya qilish sohasidagi eng namunali korxona",
        winners: [{ place: "winner", name: "AZIA METALL PROF", note: "O‘zbekiston-Xitoy QK MChJ · Samarqand shahri" }],
      },
      {
        cat: "eksport",
        title: "Sanoat mahsulotlari eksporti",
        official: "2024-yilda sanoat mahsulotlari eksporti sohasidagi eng namunali korxona",
        winners: [{ place: "winner", name: "NAVOBOD NASLLI PARRANDA", note: "fermer xo‘jaligi · Samarqand tumani" }],
      },
      {
        cat: "brend",
        title: "Eng namunali brend",
        official: "2024-yilning eng namunali brendi",
        winners: [{ place: "winner", name: "BLISS, MEVA JUICE, MARINELLE", note: "savdo belgilari · «AGROMIR» QK, Samarqand tumani" }],
      },
    ],
  },
];

/** Bosh sahifa marqueesi uchun: barcha birinchi o'rin / g'olib korxonalar (takrorlarsiz). */
export const CHAMPIONS = Array.from(
  new Set(FORUM.flatMap((y) => y.nominations.flatMap((n) => n.winners.filter((w) => w.place === 1 || w.place === "winner").map((w) => w.name)))),
);
