"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { useIntroDone } from "@/lib/store";
import { isLite, onLite } from "@/lib/perf";
import { JOURNEY, JOURNEY_RAIL, PIECES, journeyImage, type JourneyStop } from "./hero-journey-data";

/**
 * Darvozadan keyingi sayohat (hero ichida, eshik ochilgandan keyin).
 * Har bir joy butun ekranda to'liq ko'rinadi, kamera sekin suzadi, keyin joy o'z usulida chiqib ketadi
 * va ostidagi keyingisi ochiladi: jalyuzi → tezlik "warp"i → eshik tavaqalari. Imom al-Buxoriyda
 * kadr kartaga aylanib sahifaga "qo'nadi" va sahifa o'z-o'zidan davom etadi.
 * Yengillik: faqat transform/opacity animatsiya qilinadi (GPU, qayta chizish yo'q); rasmlar AVIF/WebP,
 * ekran o'lchamiga mos versiyasi va faqat birinchi ekran yuklangandan keyin yuklanadi.
 * Harakatlar hero timeline'ida (hero-journey-timeline.ts) scroll bilan boshqariladi.
 */

const STREAKS = 12;

/** Deterministik "tasodifiy" qiymat (server va brauzerda bir xil). */
const hash = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Sahifaning o'zi (Registon rasmi bilan) to'liq yuklandimi — shundan keyin sayohat rasmlari yuklanadi. */
const subscribeLoad = (cb: () => void) => {
  window.addEventListener("load", cb);
  return () => window.removeEventListener("load", cb);
};
/** Sekin internet yoki zaif qurilmada katta (1920 px) rasm versiyalari yuklanmaydi. */
const useLite = () => useSyncExternalStore(onLite, isLite, () => true);
const usePageLoaded = () =>
  useSyncExternalStore(
    subscribeLoad,
    () => document.readyState === "complete",
    () => false,
  );

/** Rasmni bo'laklarga ajratadi: har bir bo'lak rasmning o'z qismini ko'rsatadi (object-fit: cover hisobi). */
function Pieces({ cols, rows, ...attrs }: { cols: number; rows: number } & Record<`data-${string}`, string>) {
  return (
    <div className="j-pieces" style={{ "--cols": cols, "--rows": rows } as CSSProperties} {...attrs}>
      {Array.from({ length: cols * rows }, (_, i) => (
        <span key={i} data-j-piece style={{ "--c": i % cols, "--r": Math.floor(i / cols) } as CSSProperties} />
      ))}
    </div>
  );
}

function Scene({ stop, i }: { stop: JourneyStop; i: number }) {
  const [cols, rows] = PIECES[stop.exit];
  return (
    <div
      data-j-scene
      data-exit={stop.exit}
      className="j-scene"
      style={
        {
          zIndex: (JOURNEY.length - i) * 2,
          "--img-sm": journeyImage(stop.key, "sm"),
          "--img-lg": journeyImage(stop.key, "lg"),
          "--ar": stop.ar,
          "--fx": stop.fx,
          "--fy": stop.fy,
        } as CSSProperties
      }
    >
      <div data-j-cam className="j-cam">
        <Pieces cols={1} rows={1} data-j-base="" />
        {cols * rows > 1 ? <Pieces cols={cols} rows={rows} data-j-split="" /> : null}
      </div>
      {stop.exit === "warp" ? (
        <div className="j-streaks">
          {Array.from({ length: STREAKS }, (_, k) => (
            <span
              key={k}
              data-j-streak
              style={{ top: `${(4 + hash(k, 3) * 92).toFixed(2)}%`, "--w": `${(18 + hash(k, 4) * 40).toFixed(1)}%` } as CSSProperties}
            />
          ))}
        </div>
      ) : null}
      <div className="j-shade" />

      <div data-j-copy className="j-copy">
        <div className="j-copy-head">
          <span data-j-meta className="j-index">
            {stop.index}
            <small>/05</small>
          </span>
          <span data-j-meta className="j-label">
            {stop.label}
          </span>
        </div>
        <p data-j-title className="j-title">
          {stop.title}
        </p>
        <p data-j-caption className="j-caption">
          <span data-j-caption-line className="j-caption-line" />
          {stop.caption}
        </p>
      </div>
    </div>
  );
}

export function HeroJourney() {
  // rasmlar birinchi ekran (Registon) yuklangandan keyin fonda yuklanadi — u bilan raqobat qilmaydi
  const loaded = usePageLoaded();
  const intro = useIntroDone();
  const lite = useLite();
  return (
    <div
      data-journey
      data-load={loaded || intro ? "" : undefined}
      data-lite={lite ? "" : undefined}
      className="journey"
      aria-hidden
    >
      {/* final fon — sahifa rangida: oxirgi kadr kartaga aylanganda sahifaning o'zi ochiladi */}
      <div data-j-finale-bg className="j-finale-bg">
        <svg className="j-girih" width="100%" height="100%">
          <defs>
            <pattern id="j-girih" width="84" height="84" patternUnits="userSpaceOnUse">
              <path
                d="M42 9 L49.6 25.7 L67.5 16.5 L58.3 34.4 L75 42 L58.3 49.6 L67.5 67.5 L49.6 58.3 L42 75 L34.4 58.3 L16.5 67.5 L25.7 49.6 L9 42 L25.7 34.4 L16.5 16.5 L34.4 25.7 Z"
                fill="none"
                className="j-girih-star"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#j-girih)" />
        </svg>
      </div>

      {JOURNEY.map((stop, i) => (
        <Scene key={stop.key} stop={stop} i={i} />
      ))}

      {/* o'tishlardagi yorug'lik "yalt"i (plyonka effekti) */}
      <span data-j-sweep className="j-sweep" />

      <div data-j-outro className="j-outro">
        <p data-j-outro-words className="j-outro-words">
          Tarixdan — kelajakka
        </p>
      </div>

      {/* yo'l xaritasi: qaysi bekatdamiz */}
      <div data-j-rail className="j-rail">
        <span className="j-rail-track">
          <span data-j-rail-fill className="j-rail-fill" />
        </span>
        <ol>
          {JOURNEY_RAIL.map((name, i) => (
            <li key={name} data-j-stop={i} data-done={i === 0 ? "" : undefined}>
              <span className="j-rail-dot" />
              {name}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** Ekran o'quvchilar uchun sayohat matni (vizual qism aria-hidden). */
export function HeroJourneySummary() {
  return (
    <p className="sr-only">
      Sayohat: Registon, {JOURNEY.map((s) => `${s.title} — ${s.caption}`).join(" ")}
    </p>
  );
}
