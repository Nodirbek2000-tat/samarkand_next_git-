import { gsap, SplitText } from "@/lib/gsap";

/**
 * Sayohat sahnalarini hero'ning scroll timeline'iga qo'shadi va tugash vaqtini qaytaradi.
 * Vaqt birliklari hero timeline bilan bir xil (darvoza qismi 0 → 1).
 *
 * Har bir bekat:  oldingisi chiqib ketayotganda ostidan yaqin plandan to'liq kadrga keladi →
 *                 sarlavha harflari ko'tariladi → kamera sekin suzadi (zoom + pan) →
 *                 yorug'lik "yalt" etib, joy o'z usulida chiqib ketadi.
 * Oxirgi bekat:   Imom al-Buxoriy kadri kartaga aylanib sahifa ustiga "qo'nadi", ostida
 *                 "Tarixdan — kelajakka" — pin tugaydi va sahifa tabiiy davom etadi.
 * Faqat transform/opacity — scroll paytida brauzer hech narsani qayta chizmaydi.
 */
export function addJourney(tl: gsap.core.Timeline, scope: HTMLElement, at: number) {
  const q = gsap.utils.selector(scope);
  const random = gsap.utils.random;
  const scenes = q("[data-j-scene]");
  const last = scenes.length - 1;
  const ENTER = 0.18; // kirish
  const STAY = 0.38; // bitta bekatning umumiy vaqti (kirishdan chiqishgacha)
  const sweep = q("[data-j-sweep]");

  tl.set(q("[data-journey]"), { autoAlpha: 1 }, at - 0.06)
    // darvoza sahnasi endi to'liq yopildi — uni o'chiramiz (GPU yengillashadi)
    .set(q("[data-hero-parallax]"), { autoAlpha: 0 }, at + 0.1)
    .fromTo(q("[data-j-rail]"), { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.08 }, at + 0.06);

  /** Plyonka yorug'ligi: o'tish boshida ekrandan qiya nur o'tadi. */
  const flash = (t: number, dir = 1) =>
    tl.fromTo(
      sweep,
      { xPercent: dir > 0 ? -160 : 260, autoAlpha: 0 },
      { xPercent: dir > 0 ? 260 : -160, keyframes: { autoAlpha: [0, 1, 1, 0] }, ease: "power2.inOut", duration: 0.16 },
      t,
    );

  scenes.forEach((scene, i) => {
    const s = at + i * STAY; // kirish boshlanishi
    const x = s + STAY; // chiqish boshlanishi (keyingi bekat kirishi)
    const one = (sel: string) => scene.querySelector(sel) as HTMLElement;
    const all = (sel: string) => scene.querySelectorAll<HTMLElement>(sel);
    const cam = one("[data-j-cam]");
    const title = SplitText.create(one("[data-j-title]"), { type: "words,chars", mask: "words" });
    const after = i > 0 ? (scenes[i - 1] as HTMLElement).dataset.exit : "";
    // kirish masshtabi: sifat saqlanishi uchun mo'tadil (rasm keragidan ortiq cho'zilmaydi)
    const from = i === 0 ? 1.3 : after === "warp" ? 1.28 : 1.14;
    const pan = i % 2 ? 1 : -1;

    // ---- kirish: yaqin plandan to'liq kadrga (birinchisi darvoza nuridan chiqadi)
    if (i > 0) tl.set(scene, { autoAlpha: 1 }, s - 0.02);
    tl.fromTo(
      cam,
      { scale: from, rotate: i === 0 ? 0 : pan * 2.2, xPercent: 0 },
      { scale: 1.035, rotate: 0, xPercent: pan * -0.9, ease: i === 0 ? "expo.out" : "power3.out", duration: ENTER },
      s,
    )
      .fromTo(all("[data-j-meta]"), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.06, stagger: 0.02 }, s + 0.07)
      .fromTo(
        title.chars,
        { yPercent: 118, rotationX: -70, transformPerspective: 500, transformOrigin: "50% 100%" },
        { yPercent: 0, rotationX: 0, ease: "expo.out", duration: 0.13, stagger: 0.004 },
        s + 0.07,
      )
      .fromTo(one("[data-j-caption]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08 }, s + 0.11)
      .fromTo(one("[data-j-caption-line]"), { scaleY: 0 }, { scaleY: 1, ease: "power3.out", duration: 0.08 }, s + 0.11)
      // ---- to'liq kadr: kamera sekin suzadi (zoom + yon tomonga pan) — rasm "jonli" turadi
      .to(cam, { scale: 1.07, xPercent: pan * 0.9, ease: "none", duration: STAY - ENTER }, s + ENTER);

    // yo'l xaritasi: shu bekat yonadi
    tl.to(q("[data-j-rail-fill]"), { scaleY: (i + 1) / scenes.length, ease: "power2.inOut", duration: 0.1 }, s)
      .fromTo(q(`[data-j-stop="${i + 1}"]`), { "--on": 0 }, { "--on": 1, duration: 0.05 }, s + 0.06);

    if (i === last) return;

    // ---- chiqish
    tl.to(one("[data-j-copy]"), { autoAlpha: 0, y: -44, ease: "power2.in", duration: 0.05 }, x - 0.05);
    flash(x - 0.02, i % 2 ? -1 : 1);
    const exit = scene.dataset.exit;
    const split = one("[data-j-split]");
    const pieces = split ? split.querySelectorAll<HTMLElement>("[data-j-piece]") : [];
    if (split) tl.set(one("[data-j-base]"), { autoAlpha: 0 }, x).set(split, { autoAlpha: 1 }, x);
    // keyingi bekatning o'z soyasi bor — eskisini yumshoq o'chiramiz
    tl.to(one(".j-shade"), { autoAlpha: 0, duration: 0.12 }, x + 0.04);

    if (exit === "shutter") {
      // jalyuzi: vertikal chiziqlar markazdan boshlab navbat bilan yuqoriga/pastga otilib ketadi
      tl.to(
        pieces,
        {
          yPercent: (k: number) => (k % 2 ? 114 : -114),
          scaleY: 1.12,
          ease: "power3.in",
          duration: 0.18,
          stagger: { each: 0.013, from: "center" },
        },
        x,
      );
    } else if (exit === "warp") {
      // warp: kadr kameraga qarab otilib ketadi, tezlik chiziqlari chaqnaydi
      tl.to(cam, { scale: 2.9, ease: "power2.in", duration: 0.18 }, x)
        .to(scene.querySelector(".j-pieces"), { autoAlpha: 0, ease: "power2.in", duration: 0.15 }, x + 0.04)
        .fromTo(
          all("[data-j-streak]"),
          { scaleX: 0, xPercent: -60, autoAlpha: 0 },
          {
            keyframes: { autoAlpha: [0, 1, 1, 0] },
            scaleX: 1,
            xPercent: () => random(40, 140),
            ease: "power2.in",
            duration: 0.16,
            stagger: { each: 0.006, from: "random" },
          },
          x,
        );
    } else if (exit === "doors") {
      // eshik: kadr ikki tavaqaga bo'linib ichkariga ochiladi — Registon darvozasiga ishora
      tl.to(pieces[0], { rotationY: -100, xPercent: -6, "--shade": 1, ease: "power3.inOut", duration: 0.21 }, x).to(
        pieces[1],
        { rotationY: 100, xPercent: 6, "--shade": 1, ease: "power3.inOut", duration: 0.21 },
        x,
      );
    }
    // chiqib bo'lgan bekat endi kerak emas
    tl.set(scene, { autoAlpha: 0 }, x + 0.23);
  });

  // ---------- Final: Imom al-Buxoriy kartaga aylanib sahifaga qo'nadi ----------
  const fin = scenes[last];
  const F0 = at + last * STAY + STAY; // to'liq kadr yetarlicha ko'rindi
  const words = SplitText.create(q("[data-j-outro-words]"), { type: "words,chars", mask: "words" });
  tl.to(fin.querySelector("[data-j-copy]"), { autoAlpha: 0, y: -44, ease: "power2.in", duration: 0.05 }, F0 - 0.05)
    .to(fin.querySelector(".j-shade"), { autoAlpha: 0, duration: 0.1 }, F0)
    .to(q("[data-j-rail]"), { autoAlpha: 0, x: 24, duration: 0.05 }, F0 - 0.05)
    .set(q("[data-j-finale-bg]"), { autoAlpha: 1 }, F0)
    .set(fin, { borderRadius: 28 }, F0)
    .fromTo(fin, { scale: 1, yPercent: 0, transformOrigin: "50% 40%" }, { scale: 0.64, yPercent: -8, ease: "power3.inOut", duration: 0.26 }, F0)
    .to(fin.querySelector("[data-j-cam]"), { scale: 1, xPercent: 0, ease: "power2.inOut", duration: 0.26 }, F0)
    .fromTo(q(".j-girih"), { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.24 }, F0 + 0.04)
    .set(q("[data-j-outro]"), { autoAlpha: 1 }, F0 + 0.12)
    .fromTo(
      words.chars,
      { yPercent: 118, rotationX: -70, transformPerspective: 500, transformOrigin: "50% 100%" },
      { yPercent: 0, rotationX: 0, ease: "expo.out", duration: 0.14, stagger: 0.004 },
      F0 + 0.12,
    );

  // biroz ushlab turamiz — keyin pin tugaydi va sahifa davom etadi
  tl.set({}, {}, F0 + 0.42);
  return F0 + 0.42;
}
