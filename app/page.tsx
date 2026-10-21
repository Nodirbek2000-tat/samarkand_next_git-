import { MotionProvider } from "@/components/motion-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Preloader } from "@/components/preloader";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { api } from "@/lib/api/server";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Manifesto } from "@/components/sections/manifesto";
import { Stats } from "@/components/sections/stats";
import { Meetings } from "@/components/sections/meetings";
import { Directions } from "@/components/sections/directions";
import { Projects } from "@/components/sections/projects";
import { MadeIn } from "@/components/sections/made-in";
import { Forum } from "@/components/sections/forum";
import { SilkRoad } from "@/components/sections/silk-road";
import { Membership } from "@/components/sections/membership";
import { Heritage } from "@/components/sections/heritage";
import { ZoomReveal } from "@/components/sections/zoom-reveal";
import { Cta } from "@/components/sections/cta";
import { OffscreenPause } from "@/components/offscreen-pause";
import { HeadingReveal } from "@/components/heading-reveal";
import { Suspense } from "react";

export default async function Home() {
  // same header and footer as every inner page (real menu links, contacts); the header waits for the intro
  const settings = await api.settings();
  return (
    <SmoothScroll startStopped>
      <MotionProvider>
        <Preloader />
        <SiteHeader phone={settings?.phone} catalog={settings?.catalog_url} waitForIntro />
        <main>
          <Hero />
          {/* Each section below the first screen is its own Suspense boundary: React brings them to life one
              by one and gives the browser a turn in between, instead of one long freeze for the whole page.
              (All of it is still in the HTML.) */}
          <Suspense>
            <Marquee />
          </Suspense>
          <Suspense>
            <Manifesto />
          </Suspense>
          <Suspense>
            <Stats />
          </Suspense>
          <Suspense>
            <Meetings />
          </Suspense>
          <Suspense>
            <Directions />
          </Suspense>
          <Suspense>
            <Projects />
          </Suspense>
          <Suspense>
            <MadeIn />
          </Suspense>
          <Suspense>
            <Forum />
          </Suspense>
          <Suspense>
            <SilkRoad />
          </Suspense>
          <Suspense>
            <Membership />
          </Suspense>
          <Suspense>
            <Heritage />
          </Suspense>
          <Suspense>
            <ZoomReveal />
          </Suspense>
          <Suspense>
            <Cta />
          </Suspense>
        </main>
        <Suspense>
          <SiteFooter settings={settings} />
        </Suspense>
        <HeadingReveal />
        <OffscreenPause />
      </MotionProvider>
    </SmoothScroll>
  );
}
