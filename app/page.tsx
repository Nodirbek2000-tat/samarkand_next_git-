import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Preloader } from "@/components/preloader";
import { Cursor } from "@/components/cursor";
import { Header } from "@/components/header";
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
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <SmoothScroll startStopped>
      <Preloader />
      <Cursor />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <Stats />
        <Meetings />
        <Directions />
        <Projects />
        <MadeIn />
        <Forum />
        <SilkRoad />
        <Membership />
        <Heritage />
        <ZoomReveal />
        <Cta />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
