import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Boshqaruv paneli — Yangi Samarqand",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{ style: { fontSize: "15px", fontFamily: "var(--font-manrope)", borderRadius: "16px" } }}
      />
    </>
  );
}
