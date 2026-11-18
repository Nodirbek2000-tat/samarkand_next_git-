import { GraduationCap, HeartHandshake, House, Rocket, Sparkles, type LucideIcon } from "lucide-react";

// Kengashning beshta shiori (mijoz matni). Har birining o'z rangi bor — saytning qaysi joyida chiqmasin,
// bir xil rangda tanilsin: marquee, aylanuvchi muhrlar, CTA sarlavhasi, preloader, toast va footer.
export type Motto = {
  text: string;
  /** a theme token, so the colour stays readable in day and night mode */
  color: string;
  icon: LucideIcon;
  /** the last one is drawn with the brand gradient instead of a single colour */
  gradient?: boolean;
};

export const MOTTOS: Motto[] = [
  { text: "O‘zing o‘qigan maktabga e’tibor qil", color: "var(--color-lapis)", icon: GraduationCap },
  { text: "Yashab turgan mahallangning faoli bo‘l", color: "var(--color-turq)", icon: House },
  { text: "Tadbirkorlik kelajagiga befarq bo‘lma", color: "var(--color-gold)", icon: Rocket },
  { text: "Samarqandimiz fidoyisi bo‘l", color: "var(--color-ember)", icon: HeartHandshake },
  { text: "Yangi Samarqandni birga quramiz", color: "var(--color-turq)", icon: Sparkles, gradient: true },
];

export const [SCHOOL, MAHALLA, FUTURE, DEVOTEE, TOGETHER] = MOTTOS;
