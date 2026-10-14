import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  Camera,
  CircleDollarSign,
  Clapperboard,
  Factory,
  FlaskConical,
  Globe2,
  Handshake,
  HeartHandshake,
  History,
  Landmark,
  Mail,
  MessageSquareText,
  Newspaper,
  Palette,
  Rocket,
  Rows3,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { label: string; href: string; desc?: string; icon: LucideIcon };
export type NavGroup = { label: string; href: string; children: NavLink[] };

export const SITE_NAV: NavGroup[] = [
  {
    label: "Biz haqimizda",
    href: "/about",
    children: [
      { label: "Biz haqimizda", href: "/about", desc: "Missiya, maqsadlar va qadriyatlar", icon: Landmark },
      { label: "Tashkil topish tarixi", href: "/about/history", desc: "2021-yildan bugungacha", icon: History },
      { label: "Korporativ elementlar", href: "/about/corporate", desc: "Nomi, shiori va uslubi", icon: Palette },
      { label: "A’zolik", href: "/about/membership", desc: "Shartlar, badallar, ariza", icon: CircleDollarSign },
    ],
  },
  {
    label: "Kengash",
    href: "/council",
    children: [
      { label: "Kengash a’zolari", href: "/council/members", desc: "Viloyatning yetakchi tadbirkorlari", icon: Users },
      { label: "Boshqaruv", href: "/council/management", desc: "Kengash Boshqaruvi tarkibi", icon: ShieldCheck },
      { label: "Rahbariyat", href: "/council/leadership", desc: "Fond ijroiya apparati", icon: UserRound },
      { label: "Kengash yig‘ilishlari", href: "/council/meetings", desc: "Hokim ishtirokidagi muloqot", icon: Calendar },
      { label: "Yutuqlarni e’tirof etish", href: "/council/recognition", desc: "Mukofot va unvonlar", icon: Award },
    ],
  },
  {
    label: "Loyihalar",
    href: "/projects",
    children: [
      { label: "Barcha loyihalar", href: "/projects", desc: "Kengash tashabbuslari", icon: Rows3 },
      { label: "Amaldagi loyihalar", href: "/projects/active", desc: "Hozir davom etayotganlar", icon: Sparkles },
      { label: "Amalga oshirilgan", href: "/projects/completed", desc: "Yakunlangan loyihalar", icon: Trophy },
      { label: "Ijtimoiy loyihalar", href: "/projects/social", desc: "Shahar va jamiyat uchun", icon: HeartHandshake },
      { label: "Ilmiy ishlanmalar", href: "/projects/science", desc: "Olimlarni qo‘llab-quvvatlash", icon: FlaskConical },
      { label: "Yoshlar startaplari", href: "/projects/startup", desc: "Moliyalashtirish va mentorlik", icon: Rocket },
      { label: "Biznes klublar", href: "/projects/clubs", desc: "HR va buxgalterlar klublari", icon: BookOpen },
    ],
  },
  {
    label: "Biznes muhit",
    href: "/business-environment/forum",
    children: [
      { label: "Sanoatchilar forumi", href: "/business-environment/forum", desc: "G‘oliblar va nominatsiyalar", icon: Factory },
      { label: "Media loyihalar", href: "/business-environment/media", desc: "«Uz Made» va filmlar", icon: Clapperboard },
      { label: "Made in Samarkand", href: "/made-in-samarkand", desc: "406 korxona katalogi", icon: Building2 },
      { label: "Hamkorlik", href: "/cooperation", desc: "Mahalliy va xalqaro hamkorlar", icon: Handshake },
    ],
  },
  {
    label: "Media",
    href: "/news",
    children: [
      { label: "Yangiliklar", href: "/news", desc: "Kengash hayotidan", icon: Newspaper },
      { label: "E’lonlar va tadbirlar", href: "/announcements", desc: "Yaqinlashayotgan tadbirlar", icon: Calendar },
      { label: "Fotohisobotlar", href: "/gallery", desc: "Tadbirlardan suratlar", icon: Camera },
      { label: "Filmlar", href: "/news/films", desc: "Kompaniyalar haqida videolar", icon: Clapperboard },
    ],
  },
  {
    label: "Aloqa",
    href: "/feedback/contacts",
    children: [
      { label: "Murojaat yuborish", href: "/feedback/appeals", desc: "Taklif, savol yoki shikoyat", icon: MessageSquareText },
      { label: "Aloqa ma’lumotlari", href: "/feedback/contacts", desc: "Manzil, telefon, ish vaqti", icon: Mail },
      { label: "Hamkorlik taklifi", href: "/cooperation#taklif", desc: "Tashkilotlar uchun", icon: Globe2 },
    ],
  },
];
