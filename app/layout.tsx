import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import { NavProgress } from "@/components/nav-progress";
import { Vitals } from "@/components/vitals";
import { THEME_SCRIPT } from "@/lib/theme-script";
import { LITE_SCRIPT } from "@/lib/perf";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // 300: preloader counter
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// small uppercase labels only: not preloaded, so its 40 KB never queue ahead of the first screen's picture
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Yangi Samarqand — Tadbirkorlar jamoat maslahat kengashi",
  description:
    "Samarqand viloyati tadbirkorlarining jamoat maslahat kengashi: hokimiyat va biznes muloqoti, investitsiyalar, sanoat kooperatsiyasi va ijtimoiy loyihalar.",
  openGraph: {
    title: "Yangi Samarqand",
    description: "Hokimiyat va biznes muloqoti — mintaqa taraqqiyotining asosi.",
    locale: "uz_UZ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ed" },
    { media: "(prefers-color-scheme: dark)", color: "#10132f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uz"
      data-theme="light"
      suppressHydrationWarning
      className={`${unbounded.variable} ${manrope.variable} ${jetbrains.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT + ";" + LITE_SCRIPT }} />
      </head>
      {/* browser extensions (e.g. ColorZilla) inject attributes into <body> */}
      <body suppressHydrationWarning>
        <NavProgress />
        <Vitals />
        {children}
      </body>
    </html>
  );
}
