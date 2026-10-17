/*
 * "2750 yillik shahar" — 2D line drawings of Samarkand, built from Timurid parts (portal / pishtaq, ribbed dome on a
 * drum, minaret, arcaded wing) plus a few modern ones. Every building is one Part: an outline that also hides what
 * stands behind it (filled with the card colour), its fine details, and coloured fills (blue domes, tile recesses,
 * gold stars) that fade in once the lines are drawn. Parts are listed back → front.
 * viewBox 0 0 1000 480, ground at y = 440.
 */

export const VIEW = { w: 1000, h: 480 };
const G = 440;

export type FillKind = "bg" | "dome" | "tile" | "gold";
export type Part = { main: string; detail: string; fills: Partial<Record<FillKind, string>> };

class P {
  main: string[] = [];
  detail: string[] = [];
  fill: Record<FillKind, string[]> = { bg: [], dome: [], tile: [], gold: [] };
  done(): Part {
    const fills: Partial<Record<FillKind, string>> = {};
    for (const k of Object.keys(this.fill) as FillKind[]) if (this.fill[k].length) fills[k] = this.fill[k].join("");
    return { main: this.main.join(""), detail: this.detail.join(""), fills };
  }
}

const n = (v: number) => Math.round(v * 10) / 10;
const rect = (x: number, y: number, w: number, h: number) => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`;
const seg = (x1: number, y1: number, x2: number, y2: number) => `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`;
const circle = (cx: number, cy: number, r: number) =>
  `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;

/** two-centred pointed arch standing on yBase; open at the bottom unless closed */
function arch(cx: number, yBase: number, w: number, spring: number, closed = false) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const ys = yBase - spring;
  const rad = w * 0.82;
  const apex = ys - Math.sqrt(rad * rad - (w / 2 - rad) ** 2);
  const d = `M${n(l)} ${n(yBase)}V${n(ys)}A${n(rad)} ${n(rad)} 0 0 1 ${n(cx)} ${n(apex)}A${n(rad)} ${n(rad)} 0 0 1 ${n(r)} ${n(ys)}V${n(yBase)}${closed ? "Z" : ""}`;
  return { d, apex };
}

/** eight-pointed girih star (two overlapping squares) */
function star8(cx: number, cy: number, r: number) {
  const pts = (rot: number) =>
    Array.from({ length: 4 }, (_, i) => {
      const a = rot + (i * Math.PI) / 2;
      return `${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}`;
    });
  const a = pts(0);
  const b = pts(Math.PI / 4);
  return `M${a.join("L")}Z M${b.join("L")}Z`;
}

/** a row of short vertical ticks — reads as a band of Kufic lettering */
function kufic(x0: number, x1: number, y: number, h: number, step = 7) {
  let d = "";
  for (let x = x0 + step / 2; x < x1; x += step) d += seg(x, y, x, y - h * (0.55 + 0.45 * ((Math.round(x) % 3) / 2)));
  return d;
}

/** the monumental portal: frame, tile border, pointed arch with a deep recess, muqarnas, spandrel stars, top band */
function pishtaq(p: P, cx: number, w: number, h: number, g = G, motif: "star" | "sun" = "star") {
  const top = g - h;
  const frame = rect(cx - w / 2, top, w, h);
  p.fill.bg.push(frame);
  p.main.push(frame);
  const b = w * 0.06;
  p.detail.push(`M${n(cx - w / 2 + b)} ${n(g)}V${n(top + b)}H${n(cx + w / 2 - b)}V${n(g)}`);
  p.detail.push(seg(cx - w / 2 + b, top + h * 0.15, cx + w / 2 - b, top + h * 0.15), kufic(cx - w / 2 + b * 1.5, cx + w / 2 - b * 1.5, top + h * 0.13, h * 0.06));

  const ow = w * 0.6;
  const spring = h * 0.42;
  const outer = arch(cx, g, ow, spring, true);
  p.fill.tile.push(outer.d);
  p.main.push(outer.d);
  const inner = arch(cx, g, ow * 0.74, spring * 0.9);
  p.detail.push(inner.d);
  // muqarnas: two rows of little scallops hanging in the arch head
  for (let row = 0; row < 2; row++) {
    const y = inner.apex + 10 + row * 9;
    const half = ow * (0.12 + row * 0.08);
    const k = 3 + row * 2;
    const s = (2 * half) / k;
    let d = `M${n(cx - half)} ${n(y)}`;
    for (let i = 0; i < k; i++) d += `q${n(s / 2)} ${n(-s * 0.6)} ${n(s)} 0`;
    p.detail.push(d);
  }
  // spandrels
  const sx = ow / 2 + (w - ow) / 4 - b / 2;
  const sy = outer.apex + (g - spring - outer.apex) * 0.25;
  const sr = Math.min((w - ow) / 5, h * 0.05);
  if (motif === "sun") {
    for (const side of [-1, 1]) {
      const x = cx + side * sx;
      p.fill.gold.push(circle(x, sy, sr * 0.9));
      p.detail.push(circle(x, sy, sr * 0.9));
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        p.detail.push(seg(x + Math.cos(a) * sr * 1.15, sy + Math.sin(a) * sr * 1.15, x + Math.cos(a) * sr * 1.6, sy + Math.sin(a) * sr * 1.6));
      }
    }
  } else {
    for (const side of [-1, 1]) {
      const st = star8(cx + side * sx, sy, sr);
      p.fill.gold.push(st);
      p.detail.push(st);
    }
  }
}

/** ribbed (or smooth) melon dome on a drum with a lettering band */
function dome(p: P, cx: number, yBase: number, r: number, h: number, ribs = 0, drum = 26) {
  const dr = rect(cx - r * 0.9, yBase - drum, r * 1.8, drum);
  p.fill.bg.push(dr);
  p.main.push(dr);
  p.detail.push(kufic(cx - r * 0.85, cx + r * 0.85, yBase - drum * 0.25, drum * 0.45, 6));
  const y = yBase - drum;
  const shape = `M${n(cx - r)} ${n(y)}C${n(cx - r * 1.14)} ${n(y - h * 0.55)} ${n(cx - r * 0.5)} ${n(y - h * 0.93)} ${n(cx)} ${n(y - h)}C${n(cx + r * 0.5)} ${n(y - h * 0.93)} ${n(cx + r * 1.14)} ${n(y - h * 0.55)} ${n(cx + r)} ${n(y)}Z`;
  p.fill.dome.push(shape);
  p.main.push(shape);
  for (let k = 1; k < ribs; k++) {
    const t = -1 + (2 * k) / ribs;
    p.detail.push(`M${n(cx + t * r * 0.98)} ${n(y)}Q${n(cx + t * r * 1.08)} ${n(y - h * 0.62)} ${n(cx)} ${n(y - h)}`);
  }
  p.main.push(seg(cx, y - h, cx, y - h - 16), circle(cx, y - h - 19, 3));
}

/** minaret: tapering shaft, ring bands, a balcony and a small lantern dome */
function minaret(p: P, x: number, h: number, wb = 22, g = G) {
  const wt = wb * 0.78;
  const shaft = `M${n(x - wb / 2)} ${n(g)}L${n(x - wt / 2)} ${n(g - h)}H${n(x + wt / 2)}L${n(x + wb / 2)} ${n(g)}Z`;
  p.fill.bg.push(shaft);
  p.main.push(shaft);
  for (const t of [0.22, 0.48, 0.72]) {
    const w = wb - (wb - wt) * t;
    p.detail.push(seg(x - w / 2, g - h * t, x + w / 2, g - h * t), seg(x - w / 2, g - h * t - 5, x + w / 2, g - h * t - 5));
  }
  p.detail.push(kufic(x - wt / 2 + 1, x + wt / 2 - 1, g - h * 0.9, h * 0.06, 4));
  const bal = rect(x - wt / 2 - 5, g - h - 7, wt + 10, 7);
  p.fill.bg.push(bal);
  p.main.push(bal);
  const lw = wt * 0.8;
  const lan = `M${n(x - lw / 2)} ${n(g - h - 7)}V${n(g - h - 7 - lw * 0.7)}H${n(x + lw / 2)}V${n(g - h - 7)}`;
  p.main.push(lan);
  const ly = g - h - 7 - lw * 0.7;
  const cap = `M${n(x - lw / 2 - 2)} ${n(ly)}C${n(x - lw / 2)} ${n(ly - lw * 0.7)} ${n(x - 2)} ${n(ly - lw)} ${n(x)} ${n(ly - lw * 1.1)}C${n(x + 2)} ${n(ly - lw)} ${n(x + lw / 2)} ${n(ly - lw * 0.7)} ${n(x + lw / 2 + 2)} ${n(ly)}Z`;
  p.fill.dome.push(cap);
  p.main.push(cap);
}

/** slender modern minaret (Imam al-Bukhari complex): plinth, straight shaft, two balconies, open lantern, small dome */
function tallMinaret(p: P, x: number, h: number, w = 16, g = G) {
  const top = g - h;
  const plinth = rect(x - w * 0.75, g - h * 0.15, w * 1.5, h * 0.15);
  const shaft = rect(x - w / 2, top, w, h * 0.85);
  p.fill.bg.push(shaft, plinth);
  p.main.push(shaft, plinth);
  for (const t of [0.64, 0.9]) {
    const y = g - h * t;
    const bal = `M${n(x - w / 2)} ${n(y + 7)}L${n(x - w)} ${n(y)}H${n(x + w)}L${n(x + w / 2)} ${n(y + 7)}`;
    p.fill.bg.push(`${bal}Z`);
    p.main.push(bal, seg(x - w, y - 5, x + w, y - 5));
  }
  p.detail.push(seg(x - w / 2, g - h * 0.4, x + w / 2, g - h * 0.4));
  const lh = w * 1.25;
  const lan = rect(x - w * 0.42, top - lh, w * 0.84, lh);
  p.fill.bg.push(lan);
  p.main.push(lan);
  p.detail.push(seg(x, top - lh, x, top));
  const cy = top - lh;
  const r = w * 0.55;
  const cap = `M${n(x - r)} ${n(cy)}C${n(x - r)} ${n(cy - r * 1.3)} ${n(x - 2)} ${n(cy - r * 1.7)} ${n(x)} ${n(cy - r * 1.9)}C${n(x + 2)} ${n(cy - r * 1.7)} ${n(x + r)} ${n(cy - r * 1.3)} ${n(x + r)} ${n(cy)}Z`;
  p.fill.dome.push(cap);
  p.main.push(cap, seg(x, cy - r * 1.9, x, cy - r * 1.9 - 9));
}

/** a madrasa wing: wall, parapet and two storeys of niches */
function wing(p: P, x0: number, x1: number, h: number, rows = 2, g = G) {
  const wall = rect(x0, g - h, x1 - x0, h);
  p.fill.bg.push(wall);
  p.main.push(wall);
  p.detail.push(seg(x0, g - h + 9, x1, g - h + 9));
  const rowH = (h - 16) / rows;
  const cols = Math.max(1, Math.floor((x1 - x0) / 38));
  const cw = (x1 - x0) / cols;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      p.detail.push(arch(x0 + cw * (c + 0.5), g - r * rowH - 4, cw * 0.62, rowH * 0.5).d);
    }
  }
}

/** an open gallery: frame and a run of pointed arches */
function arcade(p: P, x0: number, x1: number, h: number, count: number, g = G) {
  const wall = rect(x0, g - h, x1 - x0, h);
  p.fill.bg.push(wall);
  p.main.push(wall);
  p.detail.push(seg(x0, g - h + 10, x1, g - h + 10), kufic(x0 + 4, x1 - 4, g - h + 8, 6, 8));
  const cw = (x1 - x0) / count;
  for (let i = 0; i < count; i++) {
    const a = arch(x0 + cw * (i + 0.5), g, cw * 0.72, h * 0.5, true);
    p.fill.tile.push(a.d);
    p.main.push(a.d);
  }
}

function windows(p: P, x0: number, y0: number, x1: number, y1: number, cols: number, rows: number) {
  const cw = (x1 - x0) / cols;
  const rh = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) p.detail.push(rect(x0 + c * cw + cw * 0.2, y0 + r * rh + rh * 0.2, cw * 0.6, rh * 0.55));
}

function ground(extra: string[] = []): Part {
  const p = new P();
  p.main.push(seg(0, G, 1000, G));
  p.detail.push(seg(60, G + 14, 940, G + 14), seg(150, G + 28, 850, G + 28), ...extra);
  return p.done();
}

/* ---------- scenes ---------- */

function registon(): Part[] {
  const parts: Part[] = [];
  const add = (f: (p: P) => void) => {
    const p = new P();
    f(p);
    parts.push(p.done());
  };
  // domes behind the façades: Tilla-Kori (smooth) and Sher-Dor's two ribbed ones
  add((p) => dome(p, 420, G - 150, 48, 70, 0, 26));
  add((p) => dome(p, 712, G - 160, 34, 64, 12, 30));
  add((p) => dome(p, 918, G - 160, 34, 64, 12, 30));
  // Ulug'bek · Tilla-Kori · Sher-Dor
  add((p) => wing(p, 40, 330, 165));
  add((p) => wing(p, 370, 630, 150));
  add((p) => wing(p, 670, 960, 165));
  add((p) => pishtaq(p, 185, 122, 258));
  add((p) => pishtaq(p, 500, 112, 222));
  add((p) => pishtaq(p, 815, 122, 258, G, "sun"));
  add((p) => minaret(p, 44, 300));
  add((p) => minaret(p, 326, 300));
  add((p) => minaret(p, 674, 290));
  add((p) => minaret(p, 956, 290));
  add((p) => minaret(p, 372, 186, 14));
  add((p) => minaret(p, 628, 186, 14));
  parts.push(ground());
  return parts;
}

function shohiZinda(): Part[] {
  const parts: Part[] = [];
  const tombs = [
    { cx: 105, w: 92, h: 172, r: 30 },
    { cx: 255, w: 112, h: 212, r: 38 },
    { cx: 405, w: 84, h: 162, r: 28 },
    { cx: 548, w: 122, h: 232, r: 42 },
    { cx: 703, w: 92, h: 184, r: 32 },
    { cx: 860, w: 112, h: 216, r: 38 },
  ];
  const base = (i: number) => G - i * 14;
  // the stairs climbing the hill, behind everything
  const stairs = new P();
  let d = `M0 ${G}`;
  for (let x = 0; x <= 1000; x += 40) d += `H${x}V${n(G - (x / 1000) * 14 * 6)}`;
  stairs.main.push(d);
  stairs.detail.push(`M0 ${G + 12}L1000 ${n(G + 12 - 84)}`);
  parts.push(stairs.done());
  // walls linking the street, behind the portals
  tombs.forEach((t, i) => {
    if (i === 0) return;
    const prev = tombs[i - 1];
    const p = new P();
    wing(p, prev.cx + prev.w / 2 - 4, t.cx - t.w / 2 + 4, 78, 1, base(i - 0.5));
    parts.push(p.done());
  });
  tombs.forEach((t, i) => {
    const p = new P();
    dome(p, t.cx, base(i) - t.h * 0.8, t.r, t.r * 1.7, i % 2 ? 14 : 0, t.r * 0.7);
    pishtaq(p, t.cx, t.w, t.h, base(i));
    parts.push(p.done());
  });
  return parts;
}

function modernGate(): Part[] {
  const parts: Part[] = [];
  // airliner climbing out, with a dotted trail
  const sky = new P();
  const px = 230;
  const py = 120;
  sky.main.push(
    `M${px - 46} ${py + 14}L${px + 40} ${py - 12}Q${px + 54} ${py - 16} ${px + 52} ${py - 8}L${px - 40} ${py + 20}Z`,
    `M${px - 2} ${py + 3}L${px - 28} ${py + 30}L${px - 16} ${py + 30}L${px + 18} ${py - 2}`,
    `M${px - 36} ${py + 16}L${px - 52} ${py + 2}L${px - 44} ${py + 2}L${px - 28} ${py + 12}`,
  );
  for (let i = 1; i < 9; i++) sky.detail.push(seg(px - 52 - i * 22, py + 20 + i * 7, px - 62 - i * 22, py + 23 + i * 7));
  parts.push(sky.done());
  // control tower
  const tower = new P();
  const shaft = rect(888, G - 262, 24, 262);
  tower.fill.bg.push(shaft);
  tower.main.push(shaft);
  const cab = `M870 ${G - 262}L860 ${G - 304}H940L930 ${G - 262}Z`;
  tower.fill.tile.push(cab);
  tower.main.push(cab, seg(856, G - 304, 944, G - 304), seg(900, G - 304, 900, G - 340));
  for (let x = 872; x < 930; x += 10) tower.detail.push(seg(x, G - 266, x - 2, G - 300));
  for (let y = G - 240; y < G - 10; y += 26) tower.detail.push(seg(892, y, 908, y));
  parts.push(tower.done());
  // terminal: a long wave roof over a glass wall, a pointed-arch entrance in the middle
  const roofY = (x: number) => G - 150 - 72 * Math.sin((Math.PI * (x - 60)) / 800) - 14 * Math.sin((2 * Math.PI * (x - 60)) / 800);
  const term = new P();
  let roof = `M60 ${n(roofY(60))}`;
  for (let x = 80; x <= 860; x += 20) roof += `L${x} ${n(roofY(x))}`;
  const body = `${roof}L860 ${G}H60Z`;
  term.fill.bg.push(body);
  term.main.push(body);
  let eave = `M40 ${n(roofY(60) - 8)}`;
  for (let x = 60; x <= 880; x += 20) eave += `L${x} ${n(roofY(Math.min(860, x)) - 8)}`;
  term.main.push(eave);
  for (let x = 86; x < 860; x += 26) term.detail.push(seg(x, roofY(x) + 10, x, G));
  term.detail.push(seg(60, G - 44, 860, G - 44), seg(60, G - 96, 860, G - 96));
  for (const x of [120, 260, 640, 780]) term.main.push(`M${x} ${G}L${x + 14} ${n(roofY(x + 14) + 2)}M${x} ${G}L${x - 14} ${n(roofY(x - 14) + 2)}`);
  parts.push(term.done());
  const door = new P();
  pishtaq(door, 460, 150, 150);
  parts.push(door.done());
  parts.push(ground([`M0 ${G + 34}H1000`, ...Array.from({ length: 12 }, (_, i) => seg(30 + i * 82, G + 24, 70 + i * 82, G + 24))]));
  return parts;
}

function eternalCity(): Part[] {
  const parts: Part[] = [];
  const add = (f: (p: P) => void) => {
    const p = new P();
    f(p);
    parts.push(p.done());
  };
  // hotels on both sides
  add((p) => {
    const b = rect(60, G - 236, 190, 236);
    p.fill.bg.push(b);
    p.main.push(b, seg(52, G - 236, 258, G - 236));
    windows(p, 70, G - 226, 240, G - 12, 6, 9);
  });
  add((p) => {
    const b = rect(760, G - 204, 176, 204);
    p.fill.bg.push(b);
    p.main.push(b, seg(752, G - 204, 944, G - 204));
    windows(p, 770, G - 194, 926, G - 12, 5, 8);
  });
  // the congress hall: a great ribbed dome on a colonnade
  add((p) => dome(p, 500, G - 178, 118, 116, 16, 22));
  add((p) => {
    const podium = rect(320, G - 40, 360, 40);
    const beam = rect(334, G - 178, 332, 16);
    p.fill.bg.push(podium, beam);
    p.main.push(podium, beam);
    for (let i = 0; i < 12; i++) {
      const x = 352 + i * 27;
      p.main.push(seg(x - 4, G - 40, x - 4, G - 162), seg(x + 4, G - 40, x + 4, G - 162));
    }
    p.detail.push(kufic(338, 662, G - 166, 8, 9), seg(320, G - 20, 680, G - 20));
  });
  // the old-city quarter in between
  add((p) => arcade(p, 252, 330, 96, 2));
  add((p) => arcade(p, 670, 756, 96, 2));
  add((p) => dome(p, 291, G - 96, 20, 30, 8, 12));
  add((p) => dome(p, 713, G - 96, 20, 30, 8, 12));
  // canal and bridge
  const water = new P();
  water.main.push(seg(0, G, 1000, G), `M410 ${G + 40}Q500 ${G + 6} 590 ${G + 40}`);
  for (let row = 0; row < 3; row++) {
    let d = `M${20 + row * 30} ${G + 12 + row * 9}`;
    for (let x = 20 + row * 30; x < 980; x += 24) d += `q6 -4 12 0t12 0`;
    water.detail.push(d);
  }
  parts.push(water.done());
  return parts;
}

/**
 * The new Imam al-Bukhari complex as seen across its pool: a long white front stepping up to the centre —
 * outer arcades, wings with the two big side domes, the main block with two small domes, the great portal and,
 * behind it, the ribbed central dome — with two slim minarets inside and two tall ones at the very ends.
 * Proportions are a little fuller than the real (very low) front, and the end minarets only as tall as the
 * dome: the card fits a drawing by its height, so the building itself gets the room.
 */
function imamBukhari(): Part[] {
  const parts: Part[] = [];
  const add = (f: (p: P) => void) => {
    const p = new P();
    f(p);
    parts.push(p.done());
  };
  add((p) => dome(p, 500, G - 214, 64, 86, 16, 20));
  add((p) => minaret(p, 334, 262, 15));
  add((p) => minaret(p, 666, 262, 15));
  add((p) => dome(p, 398, G - 146, 26, 38, 12, 14));
  add((p) => dome(p, 602, G - 146, 26, 38, 12, 14));
  add((p) => wing(p, 370, 630, 146, 2));
  add((p) => dome(p, 270, G - 116, 48, 58, 14, 18));
  add((p) => dome(p, 730, G - 116, 48, 58, 14, 18));
  add((p) => arcade(p, 196, 372, 116, 4));
  add((p) => arcade(p, 628, 804, 116, 4));
  add((p) => arcade(p, 50, 198, 84, 3));
  add((p) => arcade(p, 802, 950, 84, 3));
  add((p) => pishtaq(p, 500, 176, 214));
  add((p) => tallMinaret(p, 36, 290, 18));
  add((p) => tallMinaret(p, 964, 290, 18));
  // the reflecting pool in front (one line: no extra depth below the ground that would shrink the fit)
  const pool = new P();
  pool.main.push(seg(0, G, 1000, G));
  pool.detail.push(seg(260, G + 10, 740, G + 10));
  parts.push(pool.done());
  return parts;
}

export const SCENES: Part[][] = [registon(), shohiZinda(), modernGate(), eternalCity(), imamBukhari()];
