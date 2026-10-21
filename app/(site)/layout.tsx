import { MotionProvider } from "@/components/motion-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { RouteEffects } from "@/components/site/route-effects";
import { api } from "@/lib/api/server";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await api.settings();
  return (
    <SmoothScroll>
      <MotionProvider>
        <RouteEffects />
        <SiteHeader phone={settings?.phone} catalog={settings?.catalog_url} />
        <main id="main" className="min-h-svh">
          {children}
        </main>
        <SiteFooter settings={settings} />
      </MotionProvider>
    </SmoothScroll>
  );
}
