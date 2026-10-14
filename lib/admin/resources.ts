import {
  Award,
  Calendar,
  CalendarDays,
  Camera,
  Clapperboard,
  FileText,
  Handshake,
  Newspaper,
  Rows3,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "select"
  | "relation"
  | "date"
  | "datetime"
  | "number"
  | "switch"
  | "image"
  | "video"
  | "url"
  | "email"
  | "tel"
  | "stats"
  | "blocks";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** relation: endpoint returning [{id, title}] */
  relation?: { endpoint: string; labelKey: string };
  /** grid width on desktop */
  span?: 1 | 2;
  /** only editable when creating (e.g. page key) */
  createOnly?: boolean;
  defaultValue?: unknown;
};

export type Column = {
  key: string;
  label: string;
  kind?: "image" | "date" | "datetime" | "badge" | "bool" | "text" | "strong";
};

export type Nested = "news-images" | "gallery-images" | "project-media" | "participants" | "forum-structure";

export type Resource = {
  key: string;
  title: string;
  singular: string;
  icon: LucideIcon;
  endpoint: string;
  /** field used in detail URLs (`id` by default) */
  lookup?: "id" | "year" | "key";
  columns: Column[];
  fields: Field[];
  /** "published" -> is_published tabs; "active" -> is_active tabs */
  visibility?: "published" | "active";
  reorderable?: boolean;
  searchable?: boolean;
  nested?: Nested[];
  preview?: (item: Record<string, unknown>) => string | null;
  group: "content" | "council" | "structure";
  /** one record at `endpoint` itself (site settings) */
  singleton?: boolean;
};

const yes = (v: unknown) => (v ? String(v) : null);

const PUBLISH: Field[] = [
  { name: "is_published", label: "Saytda e’lon qilish", type: "switch", defaultValue: true },
];

export const RESOURCES: Resource[] = [
  {
    key: "news",
    title: "Yangiliklar",
    singular: "Yangilik",
    icon: Newspaper,
    endpoint: "news",
    group: "content",
    visibility: "published",
    searchable: true,
    nested: ["news-images"],
    preview: (i) => (yes(i.slug) ? `/news/${i.slug}` : null),
    columns: [
      { key: "cover", label: "", kind: "image" },
      { key: "title", label: "Sarlavha", kind: "strong" },
      { key: "category_label", label: "Turkum", kind: "badge" },
      { key: "published_at", label: "Sana", kind: "date" },
      { key: "views", label: "Ko‘rishlar" },
    ],
    fields: [
      { name: "title", label: "Sarlavha", type: "text", required: true, span: 2 },
      {
        name: "category",
        label: "Turkum",
        type: "select",
        defaultValue: "council",
        options: [
          { value: "council", label: "Kengash" },
          { value: "projects", label: "Loyihalar" },
          { value: "forum", label: "Forum" },
          { value: "business", label: "Biznes" },
          { value: "cooperation", label: "Hamkorlik" },
          { value: "events", label: "Tadbirlar" },
          { value: "other", label: "Boshqa" },
        ],
      },
      { name: "published_at", label: "E’lon sanasi", type: "datetime", help: "Bo‘sh qoldirilsa — e’lon qilingan vaqt" },
      { name: "excerpt", label: "Qisqa mazmun", type: "textarea", span: 2, help: "Kartochkalarda va qidiruvda ko‘rinadi" },
      { name: "body", label: "To‘liq matn", type: "richtext", span: 2 },
      { name: "cover", label: "Muqova rasmi", type: "image", span: 2 },
      { name: "source_url", label: "Manba havolasi", type: "url" },
      { name: "is_featured", label: "Asosiy yangilik", type: "switch" },
      ...PUBLISH,
    ],
  },
  {
    key: "announcements",
    title: "E’lonlar va tadbirlar",
    singular: "E’lon",
    icon: CalendarDays,
    endpoint: "announcements",
    group: "content",
    visibility: "published",
    searchable: true,
    preview: (i) => (yes(i.slug) ? `/announcements/${i.slug}` : null),
    columns: [
      { key: "cover", label: "", kind: "image" },
      { key: "title", label: "Sarlavha", kind: "strong" },
      { key: "kind_label", label: "Turi", kind: "badge" },
      { key: "event_date", label: "Sana", kind: "datetime" },
      { key: "location", label: "Joy" },
    ],
    fields: [
      { name: "title", label: "Sarlavha", type: "text", required: true, span: 2 },
      {
        name: "kind",
        label: "Turi",
        type: "select",
        defaultValue: "event",
        options: [
          { value: "event", label: "Tadbir" },
          { value: "announcement", label: "E’lon" },
          { value: "tender", label: "Tanlov" },
        ],
      },
      { name: "location", label: "Manzil", type: "text" },
      { name: "event_date", label: "Boshlanish sanasi va vaqti", type: "datetime" },
      { name: "ends_at", label: "Tugash (amal qilish muddati)", type: "datetime" },
      { name: "participants", label: "Ishtirokchilar soni", type: "number" },
      { name: "registration_url", label: "Ro‘yxatdan o‘tish havolasi", type: "url" },
      { name: "excerpt", label: "Qisqa mazmun", type: "textarea", span: 2 },
      { name: "body", label: "To‘liq matn", type: "richtext", span: 2 },
      { name: "cover", label: "Muqova", type: "image", span: 2 },
      { name: "gallery", label: "Bog‘liq fotohisobot", type: "relation", relation: { endpoint: "galleries?page_size=200", labelKey: "title" } },
      { name: "is_featured", label: "Asosiy tadbir", type: "switch" },
      ...PUBLISH,
    ],
  },
  {
    key: "galleries",
    title: "Fotohisobotlar",
    singular: "Fotohisobot",
    icon: Camera,
    endpoint: "galleries",
    group: "content",
    visibility: "published",
    searchable: true,
    nested: ["gallery-images"],
    preview: (i) => (yes(i.slug) ? `/gallery/${i.slug}` : null),
    columns: [
      { key: "cover", label: "", kind: "image" },
      { key: "title", label: "Sarlavha", kind: "strong" },
      { key: "event_date", label: "Sana", kind: "date" },
      { key: "images_count", label: "Suratlar" },
    ],
    fields: [
      { name: "title", label: "Sarlavha", type: "text", required: true, span: 2 },
      { name: "event_date", label: "Tadbir sanasi", type: "date" },
      { name: "location", label: "Joy", type: "text" },
      { name: "description", label: "Tavsif", type: "textarea", span: 2 },
      { name: "cover", label: "Muqova (bo‘sh bo‘lsa — birinchi surat)", type: "image", span: 2 },
      ...PUBLISH,
    ],
  },
  {
    key: "films",
    title: "Filmlar",
    singular: "Film",
    icon: Clapperboard,
    endpoint: "films",
    group: "content",
    visibility: "published",
    reorderable: true,
    searchable: true,
    preview: (i) => (yes(i.slug) ? `/news/films/${i.slug}` : null),
    columns: [
      { key: "cover", label: "", kind: "image" },
      { key: "title", label: "Sarlavha", kind: "strong" },
      { key: "company", label: "Kompaniya" },
      { key: "duration", label: "Davomiyligi" },
    ],
    fields: [
      { name: "title", label: "Sarlavha", type: "text", required: true, span: 2 },
      { name: "company", label: "Kompaniya", type: "text", required: true },
      { name: "owner_name", label: "Kompaniya rahbari / egasi", type: "text" },
      { name: "video_url", label: "YouTube havolasi", type: "url", placeholder: "https://youtube.com/watch?v=…", help: "Yoki pastda video faylni yuklang" },
      { name: "duration", label: "Davomiyligi", type: "text", placeholder: "12:40" },
      { name: "description", label: "Tavsif", type: "richtext", span: 2 },
      { name: "video_file", label: "Video fayl (mp4, webm)", type: "video", span: 2 },
      { name: "cover", label: "Muqova", type: "image", span: 2 },
      { name: "published_at", label: "E’lon sanasi", type: "datetime" },
      ...PUBLISH,
    ],
  },
  {
    key: "projects",
    title: "Loyihalar",
    singular: "Loyiha",
    icon: Rows3,
    endpoint: "projects",
    group: "content",
    visibility: "published",
    reorderable: true,
    searchable: true,
    nested: ["project-media", "participants"],
    preview: (i) => (yes(i.slug) ? `/projects/${i.slug}` : null),
    columns: [
      { key: "cover", label: "", kind: "image" },
      { key: "title", label: "Nomi", kind: "strong" },
      { key: "category_label", label: "Yo‘nalish", kind: "badge" },
      { key: "status_label", label: "Holati", kind: "badge" },
    ],
    fields: [
      { name: "title", label: "Loyiha nomi", type: "text", required: true, span: 2 },
      {
        name: "category",
        label: "Yo‘nalish",
        type: "select",
        defaultValue: "social",
        options: [
          { value: "social", label: "Ijtimoiy loyiha" },
          { value: "science", label: "Ilmiy ishlanma" },
          { value: "startup", label: "Yoshlar startapi" },
          { value: "club", label: "Biznes klub" },
          { value: "media", label: "Media loyiha" },
          { value: "catalog", label: "Katalog" },
          { value: "forum", label: "Forum" },
          { value: "other", label: "Boshqa" },
        ],
      },
      {
        name: "status",
        label: "Holati",
        type: "select",
        defaultValue: "active",
        options: [
          { value: "active", label: "Amaldagi" },
          { value: "completed", label: "Amalga oshirilgan" },
          { value: "planned", label: "Rejalashtirilgan" },
        ],
      },
      { name: "summary", label: "Qisqa tavsif", type: "textarea", span: 2 },
      { name: "body", label: "To‘liq matn", type: "richtext", span: 2 },
      { name: "objectives", label: "Maqsadlar", type: "richtext" },
      { name: "expected_results", label: "Kutilayotgan natijalar", type: "richtext" },
      { name: "stats", label: "Raqamlar (kartochkalarda ko‘rinadi)", type: "stats", span: 2 },
      { name: "metrics", label: "Asosiy ko‘rsatkichlar (qisqa)", type: "text", placeholder: "406 korxona · 500 nusxa" },
      { name: "budget", label: "Moliyalashtirish hajmi", type: "text" },
      { name: "started_on", label: "Boshlangan sana", type: "date" },
      { name: "finished_on", label: "Yakunlangan sana", type: "date" },
      { name: "cover", label: "Muqova", type: "image", span: 2 },
      { name: "website_url", label: "Veb-sayt", type: "url" },
      { name: "telegram_url", label: "Telegram", type: "url" },
      { name: "instagram_url", label: "Instagram", type: "url" },
      { name: "video_url", label: "Video (YouTube)", type: "url" },
      { name: "is_featured", label: "Bosh sahifada ko‘rsatish", type: "switch" },
      ...PUBLISH,
    ],
  },
  {
    key: "forum",
    title: "Sanoatchilar forumi",
    singular: "Forum",
    icon: Trophy,
    endpoint: "forum",
    lookup: "year",
    group: "content",
    visibility: "published",
    nested: ["forum-structure"],
    preview: (i) => (yes(i.year) ? `/business-environment/forum/${i.year}` : null),
    columns: [
      { key: "year", label: "Yil", kind: "strong" },
      { key: "title", label: "Sarlavha" },
      { key: "dates", label: "Sanalar" },
      { key: "nominations_count", label: "Nominatsiya" },
      { key: "winners_count", label: "G‘oliblar" },
    ],
    fields: [
      { name: "year", label: "Forum yili", type: "number", required: true },
      { name: "results_year", label: "Qaysi yil yakunlari", type: "number", required: true },
      { name: "title", label: "Sarlavha", type: "text", required: true, span: 2 },
      { name: "dates", label: "O‘tkazilgan sanalar", type: "text", placeholder: "16–17 may 2024" },
      { name: "location", label: "Joy", type: "text" },
      { name: "intro", label: "Kirish matni", type: "richtext", span: 2 },
      { name: "cover", label: "Muqova", type: "image", span: 2 },
      { name: "gallery", label: "Fotohisobot", type: "relation", relation: { endpoint: "galleries?page_size=200", labelKey: "title" } },
      ...PUBLISH,
    ],
  },
  {
    key: "council-members",
    title: "Kengash a’zolari",
    singular: "Kengash a’zosi",
    icon: Users,
    endpoint: "council-members",
    group: "council",
    visibility: "active",
    reorderable: true,
    searchable: true,
    preview: (i) => (yes(i.slug) ? `/council/members/${i.slug}` : null),
    columns: [
      { key: "photo", label: "", kind: "image" },
      { key: "full_name", label: "F.I.Sh.", kind: "strong" },
      { key: "company", label: "Kompaniya" },
      { key: "position", label: "Lavozimi" },
    ],
    fields: [
      { name: "full_name", label: "F.I.Sh.", type: "text", required: true, span: 2 },
      { name: "company", label: "Kompaniya", type: "text" },
      { name: "position", label: "Lavozimi", type: "text" },
      { name: "industry", label: "Faoliyat sohasi", type: "text" },
      { name: "joined_year", label: "A’zo bo‘lgan yili", type: "number" },
      { name: "website", label: "Kompaniya sayti", type: "url" },
      { name: "contact_phone", label: "Aloqa telefoni", type: "tel" },
      { name: "contact_email", label: "Aloqa email", type: "email" },
      { name: "show_contacts", label: "Aloqa ma’lumotlarini saytda ko‘rsatish", type: "switch" },
      { name: "photo", label: "Surat", type: "image", span: 2 },
      { name: "bio", label: "Biografiya", type: "richtext", span: 2 },
      { name: "is_active", label: "Saytda ko‘rsatish", type: "switch", defaultValue: true },
    ],
  },
  {
    key: "board-members",
    title: "Boshqaruv",
    singular: "Boshqaruv a’zosi",
    icon: ShieldCheck,
    endpoint: "board-members",
    group: "council",
    visibility: "active",
    reorderable: true,
    preview: (i) => (yes(i.slug) ? `/council/management/${i.slug}` : null),
    columns: [
      { key: "photo", label: "", kind: "image" },
      { key: "full_name", label: "F.I.Sh.", kind: "strong" },
      { key: "role_label", label: "Lavozim", kind: "badge" },
      { key: "workplace", label: "Ish joyi" },
    ],
    fields: [
      { name: "full_name", label: "F.I.Sh.", type: "text", required: true, span: 2 },
      {
        name: "role",
        label: "Boshqaruvdagi lavozimi",
        type: "select",
        defaultValue: "member",
        options: [
          { value: "chairman", label: "Boshqaruv raisi" },
          { value: "deputy", label: "Rais o‘rinbosari" },
          { value: "member", label: "Boshqaruv a’zosi" },
          { value: "secretary", label: "Kotib" },
        ],
      },
      { name: "workplace", label: "Ish joyi va lavozimi", type: "text" },
      { name: "photo", label: "Surat", type: "image", span: 2 },
      { name: "bio", label: "Biografiya", type: "richtext", span: 2 },
      { name: "is_active", label: "Saytda ko‘rsatish", type: "switch", defaultValue: true },
    ],
  },
  {
    key: "leaders",
    title: "Rahbariyat",
    singular: "Rahbar",
    icon: UserRound,
    endpoint: "leaders",
    group: "council",
    visibility: "active",
    reorderable: true,
    columns: [
      { key: "photo", label: "", kind: "image" },
      { key: "full_name", label: "F.I.Sh.", kind: "strong" },
      { key: "position", label: "Lavozimi" },
      { key: "phone", label: "Telefon" },
    ],
    fields: [
      { name: "full_name", label: "F.I.Sh.", type: "text", required: true, span: 2 },
      { name: "position", label: "Lavozimi", type: "text", required: true },
      { name: "organization", label: "Tashkilot", type: "text" },
      { name: "phone", label: "Telefon", type: "tel" },
      { name: "email", label: "Email", type: "email" },
      { name: "reception_hours", label: "Qabul vaqti", type: "text", placeholder: "Du–Ju 10:00–12:00" },
      { name: "photo", label: "Surat", type: "image", span: 2 },
      { name: "bio", label: "Biografiya", type: "richtext", span: 2 },
      { name: "is_active", label: "Saytda ko‘rsatish", type: "switch", defaultValue: true },
    ],
  },
  {
    key: "meetings",
    title: "Kengash yig‘ilishlari",
    singular: "Yig‘ilish",
    icon: Calendar,
    endpoint: "meetings",
    group: "council",
    visibility: "published",
    searchable: true,
    preview: () => "/council/meetings",
    columns: [
      { key: "date", label: "Sana", kind: "date" },
      { key: "title", label: "Sarlavha", kind: "strong" },
      { key: "host_company", label: "Mezbon" },
    ],
    fields: [
      { name: "title", label: "Sarlavha", type: "text", required: true, span: 2 },
      { name: "date", label: "Sana", type: "date", required: true },
      { name: "host_company", label: "Mezbon kompaniya", type: "text" },
      { name: "location", label: "Manzil", type: "text" },
      { name: "gallery", label: "Fotohisobot", type: "relation", relation: { endpoint: "galleries?page_size=200", labelKey: "title" } },
      { name: "agenda", label: "Kun tartibi", type: "richtext", span: 2 },
      { name: "outcome", label: "Natijalar va topshiriqlar", type: "richtext", span: 2 },
      ...PUBLISH,
    ],
  },
  {
    key: "recognitions",
    title: "E’tiroflar",
    singular: "E’tirof",
    icon: Award,
    endpoint: "recognitions",
    group: "council",
    visibility: "published",
    reorderable: true,
    searchable: true,
    preview: () => "/council/recognition",
    columns: [
      { key: "year", label: "Yil", kind: "strong" },
      { key: "full_name", label: "F.I.Sh." },
      { key: "award", label: "Mukofot" },
    ],
    fields: [
      { name: "full_name", label: "F.I.Sh.", type: "text", required: true },
      { name: "year", label: "Yil", type: "number", required: true },
      { name: "award", label: "Mukofot / e’tirof", type: "text", required: true, span: 2 },
      { name: "company", label: "Kompaniya", type: "text", span: 2 },
      { name: "description", label: "Tavsif", type: "richtext", span: 2 },
      { name: "photo", label: "Surat", type: "image", span: 2 },
      ...PUBLISH,
    ],
  },
  {
    key: "partners",
    title: "Hamkorlar",
    singular: "Hamkor",
    icon: Handshake,
    endpoint: "partners",
    group: "structure",
    visibility: "published",
    reorderable: true,
    searchable: true,
    preview: () => "/cooperation",
    columns: [
      { key: "logo", label: "", kind: "image" },
      { key: "name", label: "Nomi", kind: "strong" },
      { key: "kind_label", label: "Turi", kind: "badge" },
      { key: "country", label: "Davlat" },
    ],
    fields: [
      { name: "name", label: "Nomi", type: "text", required: true, span: 2 },
      {
        name: "kind",
        label: "Turi",
        type: "select",
        defaultValue: "domestic",
        options: [
          { value: "domestic", label: "Mahalliy hamkor" },
          { value: "international", label: "Xalqaro hamkor" },
        ],
      },
      { name: "country", label: "Davlat", type: "text", defaultValue: "O‘zbekiston" },
      { name: "website", label: "Veb-sayt", type: "url", span: 2 },
      { name: "description", label: "Hamkorlik tavsifi", type: "textarea", span: 2 },
      { name: "logo", label: "Logotip", type: "image", span: 2 },
      ...PUBLISH,
    ],
  },
  {
    key: "pages",
    title: "Sahifalar matni",
    singular: "Sahifa",
    icon: FileText,
    endpoint: "pages",
    lookup: "key",
    group: "structure",
    visibility: "published",
    searchable: true,
    columns: [
      { key: "title", label: "Sarlavha", kind: "strong" },
      { key: "section_label", label: "Bo‘lim", kind: "badge" },
      { key: "key", label: "Kalit" },
      { key: "updated_at", label: "Yangilangan", kind: "date" },
    ],
    fields: [
      { name: "title", label: "Sarlavha", type: "text", required: true, span: 2 },
      { name: "key", label: "Kalit (sahifa manzili bilan bog‘liq)", type: "text", required: true, createOnly: true },
      {
        name: "section",
        label: "Bo‘lim",
        type: "select",
        defaultValue: "other",
        options: [
          { value: "about", label: "Biz haqimizda" },
          { value: "council", label: "Kengash" },
          { value: "projects", label: "Loyihalar" },
          { value: "business", label: "Biznes muhit" },
          { value: "cooperation", label: "Hamkorlik" },
          { value: "other", label: "Boshqa" },
        ],
      },
      { name: "subtitle", label: "Qisqa tavsif (sahifa boshida)", type: "textarea", span: 2 },
      { name: "body", label: "Asosiy matn", type: "richtext", span: 2 },
      { name: "blocks", label: "Kartochkalar (qadriyatlar, badallar, sanalar…)", type: "blocks", span: 2 },
      { name: "cover", label: "Muqova", type: "image", span: 2 },
      { name: "seo_description", label: "SEO tavsif", type: "textarea", span: 2 },
      ...PUBLISH,
    ],
  },
];

export const RESOURCE_MAP = Object.fromEntries(RESOURCES.map((r) => [r.key, r]));

export const SETTINGS_RESOURCE: Resource = {
  key: "settings",
  title: "Sayt sozlamalari",
  singular: "Sozlamalar",
  icon: FileText,
  endpoint: "settings",
  singleton: true,
  group: "structure",
  columns: [],
  fields: [
    { name: "org_name", label: "Tashkilot nomi", type: "text", required: true, span: 2 },
    { name: "council_name", label: "Kengash nomi", type: "text", required: true, span: 2 },
    { name: "slogan", label: "Shior", type: "text", span: 2 },
    { name: "phone", label: "Asosiy telefon", type: "tel" },
    { name: "phone_secondary", label: "Qo‘shimcha telefon", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "working_hours", label: "Ish vaqti", type: "text", placeholder: "Du–Ju: 9:00–18:00" },
    { name: "address", label: "Manzil", type: "text", span: 2 },
    { name: "map_embed_url", label: "Xarita (Google Maps «embed» havolasi)", type: "url", span: 2, help: "Bo‘sh qoldirilsa, manzil bo‘yicha xarita ko‘rsatiladi" },
    { name: "telegram", label: "Telegram", type: "url" },
    { name: "instagram", label: "Instagram", type: "url" },
    { name: "facebook", label: "Facebook", type: "url" },
    { name: "youtube", label: "YouTube", type: "url" },
    { name: "catalog_url", label: "Made in Samarkand katalogi havolasi", type: "url", span: 2 },
    { name: "stat_members", label: "Kengash a’zolari soni", type: "number" },
    { name: "stat_catalog", label: "Katalogdagi korxonalar", type: "number" },
    { name: "stat_startups", label: "Qo‘llab-quvvatlangan startaplar", type: "number" },
    { name: "stat_enterprises", label: "Viloyatdagi sanoat korxonalari", type: "number" },
  ],
};

export function itemRef(resource: Resource, item: Record<string, unknown>) {
  return String(item[resource.lookup ?? "id"]);
}

export function itemTitle(item: Record<string, unknown>) {
  return String(item.title ?? item.full_name ?? item.name ?? item.year ?? "—");
}
