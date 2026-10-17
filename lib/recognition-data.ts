// «Xizmat ko'rsatgan, o'zini ko'rsatgan tadbirkorlarni jamoatchilik tomonidan e'tirof etish» loyihasi.
// Manba: Kengashning rasmiy ro'yxati (davlat mukofotlari, faxriy unvonlar, Kengash qarorlari).
// Sahifa (lib/recognition.ts) avval admin panel ma'lumotini oladi; backend javob bermasa — shu ro'yxat.

export type RecognitionItem = {
  year: number;
  fullName: string;
  company: string;
  award: string;
  /** by which document: decree / resolution / council meeting */
  basis: string;
  /** what for, when the document says so */
  reason?: string;
  photo?: string | null;
};

const DECREE = (date: string) => `O‘zbekiston Respublikasi Prezidentining ${date} farmoni bilan`;

export const RECOGNITIONS: RecognitionItem[] = [
  {
    year: 2022,
    fullName: "Karimov Ravshan Murodovich",
    company: "«Metin Group Impeks» MChJ rahbari, Bulung‘ur tumani",
    award: "«Shuhrat» medali",
    basis: "O‘zbekiston Respublikasi Prezidentining 2022-yil 20-avgustdagi qarori bilan",
    reason: "respublikaning iqtisodiy qudrati va eksport salohiyatini oshirishga qo‘shgan katta hissasi uchun",
  },
  {
    year: 2023,
    fullName: "Shukurullayev Dilshod Dalerovich",
    company: "«Zarmed Pratiksha Hospital Group» MChJ ta’sischisi, Samarqand shahri",
    award: "«Do‘stlik» ordeni",
    basis: DECREE("2023-yil 18-avgustdagi"),
  },
  {
    year: 2023,
    fullName: "Norboyev Anvar Ochilovich",
    company: "«Kattaqo‘rg‘on elektrotexnika zavodi» MChJ direktori, Kattaqo‘rg‘on tumani",
    award: "«Shuhrat» medali",
    basis: DECREE("2023-yil 18-avgustdagi"),
  },
  {
    year: 2024,
    fullName: "Rustamov Ilhom Aslamovich",
    company: "«Ahmadbek Qurilish Trio» MChJ bosh direktori, Samarqand shahri",
    award: "«Do‘stlik» ordeni",
    basis: DECREE("2024-yil 14-avgustdagi"),
  },
  {
    year: 2024,
    fullName: "Ibodullayev Umarjon G‘aybullayevich",
    company: "«Bekmez Carpet» MChJ direktori, Urgut tumani",
    award: "«Shuhrat» medali",
    basis: DECREE("2024-yil 14-avgustdagi"),
  },
  {
    year: 2024,
    fullName: "Eshonqulov Shokir Hamdamovich",
    company: "«Silver Green Tea» oilaviy korxonasi direktori, Payariq tumani",
    award: "«Shuhrat» medali",
    basis: DECREE("2024-yil 14-avgustdagi"),
  },
  {
    year: 2025,
    fullName: "Abdullayev Kamol Tal’atovich",
    company: "«Sam Antep Gilam» MChJ ta’sischisi, Samarqand shahri",
    award: "«O‘zbekiston Respublikasida xizmat ko‘rsatgan tadbirkor» faxriy unvoni",
    basis: DECREE("2025-yil 21-avgustdagi"),
  },
  {
    year: 2025,
    fullName: "Saidmurodov O‘ktam Saidmurodovich",
    company: "«Stekloplastik» MChJ ta’sischisi va direktorlar kengashi raisi",
    award: "«O‘zbekiston Respublikasida xizmat ko‘rsatgan tadbirkor» faxriy unvoni",
    basis: DECREE("2025-yil 21-avgustdagi"),
  },
  {
    year: 2025,
    fullName: "To‘rayev Zafar Suyunovich",
    company: "«SXF Big Stroy Building» MChJ ta’sischisi, Urgut tumani",
    award: "«Do‘stlik» ordeni",
    basis: DECREE("2025-yil 21-avgustdagi"),
  },
  {
    year: 2025,
    fullName: "Ergashev Shuhrat Sharipovich",
    company: "«Samarkand Garden Plast» MChJ direktorlar kengashi raisi, Bulung‘ur tumani",
    award: "«Do‘stlik» ordeni",
    basis: DECREE("2025-yil 21-avgustdagi"),
  },
  {
    year: 2025,
    fullName: "Komilov Nasimjon Qobiljonovich",
    company: "«STD Health Med» MChJ ta’sischisi, Samarqand shahri",
    award: "«Shuhrat» medali",
    basis: DECREE("2025-yil 21-avgustdagi"),
  },
  {
    year: 2025,
    fullName: "Sharipov Shavkat O‘ktamovich",
    company: "«Sharq Sanoat» konserni ta’sischisi",
    award: "«Turon» xalqaro akademiyasining faxriy a’zoligiga taqdim etilgan",
    basis: "Kengash a’zolarining 2025-yil 13-martdagi yig‘ilishida",
    reason: "mamlakatda tadbirkorlikni rivojlantirish va minglab ish o‘rinlari yaratishdagi ko‘p yillik faoliyati uchun",
  },
  {
    year: 2025,
    fullName: "Abdullayev Kamol Tal’atovich",
    company: "«SAG» kompaniyalar guruhi hammuassisi",
    award: "«Turon» xalqaro akademiyasining faxriy a’zoligiga taqdim etilgan",
    basis: "Kengash a’zolarining 2025-yil 13-martdagi yig‘ilishida",
    reason: "mamlakatda tadbirkorlikni rivojlantirish va minglab ish o‘rinlari yaratishdagi ko‘p yillik faoliyati uchun",
  },
];

/** Ustoz va murabbiylar kuni munosabati bilan esdalik plaketkalari (Kengash yig'ilishi, 2025-yil 29-sentabr). */
export const TEACHERS_DAY = {
  date: "2025-yil 29-sentabr",
  text: "Mamlakatda tadbirkorlikni rivojlantirish bo‘yicha ko‘p yillik faoliyati uchun 60 yoshdan oshgan Kengash a’zolari Ustoz va murabbiylar kuni munosabati bilan esdalik plaketkalari bilan taqdirlandi. Sovg‘alarni viloyat hokimi A.M. Boboyev topshirdi.",
  names: [
    "Niyozova Mar’yam Qodirovna",
    "Qo‘chqorova Gulbeka Allamuratovna",
    "Rahimov Po‘lat Rahimovich",
    "Ziyoyev Fayzullo Ziyoyevich",
    "Saidmurodov O‘ktam Saidmurodovich",
  ],
};

export const RECOGNITION_INTRO = {
  subtitle: "Xizmat ko‘rsatgan, o‘zini ko‘rsatgan tadbirkorlarni jamoatchilik tomonidan e’tirof etish loyihasi.",
  paragraphs: [
    "Tadbirkorlarning xizmatlarini e’tirof etish — mamlakatda tadbirkorlik nufuzini oshirish, tadbirkorni biznesdagi yangi yutuqlarga undash, xayriya va ezgu ishlar ko‘lamini kengaytirish yo‘nalishlaridan biri.",
    "Kengash Boshqaruvi biznesni kengaytirish va yangi ish o‘rinlari yaratish, sog‘liqni saqlash, ta’lim, muhtojlarga yordam sohalarida xayriya aksiyalarini amalga oshirgan tadbirkorlarning xizmatlarini qayd etish imkoniyatlarini doimo izlaydi.",
  ],
};
