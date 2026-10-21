import type { Metadata } from "next";
import { Toaster } from "sonner";
import { MotionProvider } from "@/components/motion-provider";

export const metadata: Metadata = {
  title: "Boshqaruv paneli — Yangi Samarqand",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      {/* shared site pieces (theme switch, Telegram sign-in) use the light motion elements too */}
      <MotionProvider>{children}</MotionProvider>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{ style: { fontSize: "15px", fontFamily: "var(--font-manrope)", borderRadius: "16px" } }}
      />
    </>
  );
}
