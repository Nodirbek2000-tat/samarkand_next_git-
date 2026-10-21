import { memo, type CSSProperties } from "react";

/**
 * Life on the hero photograph: twinkling stars and a shooting star in the night sky (placed only
 * where the night photo's sky is truly dark), a slow gloss gliding over the mirror plaza, and the
 * intro overlays the hero timeline plays when the preloader lifts — the lights of Registan switching
 * on from Tilla-Kori's gate outward at night, a morning haze burning off with a sun sweep by day.
 * All of it is CSS transforms/opacity (composited); positions are fractions of the photo.
 */

// [x %, y %, size px, delay s, duration s] — sampled from public/images/registan/night-v2.webp
const STARS: [number, number, number, number, number][] = [
  [2, 34.6, 0.95, 1.26, 5.08], [53.1, 13.4, 1.5, 4.53, 4.45], [67.7, 24.4, 1.58, 1.45, 3.87], [70, 26.6, 0.66, 4.1, 4.19],
  [13.8, 20, 1.71, 4.13, 4.79], [57.4, 34.3, 1.69, 2.23, 3.74], [82.4, 13.5, 0.78, 1.79, 4.06], [55.5, 27.8, 1.65, 0.35, 3.53],
  [55.8, 19.8, 1.11, 1.16, 5.69], [7.3, 14.7, 1.01, 3.99, 5.74], [51.4, 7.5, 1.09, 1.7, 3.84], [42.7, 13.5, 1.24, 3.68, 3.39],
  [89, 18, 1.64, 3.81, 4.76], [51.6, 19.7, 1.43, 5.64, 3.95], [70, 10.5, 1.3, 2.1, 3.72], [39.6, 30.1, 1.65, 0.67, 5.39],
  [9.5, 16.1, 0.78, 0.47, 5.99], [15.8, 18, 1.31, 0.83, 5.73], [75.1, 11.4, 0.61, 1.49, 2.86], [2.2, 23.7, 0.88, 4.45, 4.26],
  [68, 10.1, 1.66, 1.41, 3.87], [87.9, 5.8, 1.19, 0.02, 5.7], [63.1, 34.7, 0.63, 5.4, 3.24], [95, 21.9, 1.42, 1.6, 3.36],
  [7, 29.2, 1.44, 4.28, 4.29], [5.1, 5.5, 1.7, 0.78, 4.94], [87.7, 2.8, 1.66, 5.17, 5.98], [93.6, 29, 1.1, 1.49, 5.07],
  [86.7, 15.8, 0.88, 2.43, 5.62], [55.6, 14.2, 1.35, 4.41, 3.74], [71.6, 16.7, 0.84, 1.87, 5.95], [97.4, 24.3, 1.65, 5.51, 3.28],
  [63.9, 6.4, 1.2, 3.34, 5.22], [92.8, 18.9, 0.82, 2.68, 3.16],
];

export const HeroSky = memo(function HeroSky() {
  return (
    <>
      <div className="only-night pointer-events-none absolute inset-0" aria-hidden>
        {STARS.map(([x, y, s, d, t], i) => (
          <span
            key={i}
            className="hero-star"
            style={{ left: `${x}%`, top: `${y}%`, "--s": `${s * 1.6}px`, animationDelay: `${d}s`, animationDuration: `${t}s` } as CSSProperties}
          />
        ))}
        <span className="hero-meteor" style={{ left: "61%", top: "4%" }} />
        <span className="hero-meteor" style={{ left: "31%", top: "3%", animationDelay: "11s", "--a": "-31deg" } as CSSProperties} />
      </div>

      <div className="hero-gloss" aria-hidden>
        <span />
      </div>
    </>
  );
});

/** Intro overlays (inside the zoom layer so they stay pinned to the photograph). */
export const HeroIntroLight = memo(function HeroIntroLight() {
  return (
    <>
      <div data-hero-lights className="hero-lights only-night" aria-hidden />
      <div data-hero-haze className="hero-haze only-day" aria-hidden />
      <div data-hero-sweep className="hero-sweep only-day" aria-hidden />
    </>
  );
});
