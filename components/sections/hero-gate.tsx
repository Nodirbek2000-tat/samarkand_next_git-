import type { CSSProperties } from "react";
import { GATE_APEX, GATE_FRAME, GATE_HINGE, GATE_LEFT, GATE_MEDALLION, GATE_OPENING, GATE_RIGHT } from "./hero-gate-shape";

/**
 * The carved double door set into Tilla-Kori's portal on the hero photograph.
 * Frame and both leaves are the same graded picture (one file per theme, see .hero-stage),
 * clipped apart along the door's own moulding — so the frame stays in the wall while the
 * leaves swing inward on their hinges, without a seam. A flipped copy lies in the mirror
 * plaza and opens with it. Every animated part carries a data attribute the hero timeline targets.
 */

function Door({ mirror = false }: { mirror?: boolean }) {
  return (
    <div data-gate className={mirror ? "gate gate-mirror" : "gate"} aria-hidden>
      {/* the gilded hall behind the leaves — a further, brighter arch gives it depth */}
      <div data-gate-hall className="gate-hall" style={{ clipPath: GATE_OPENING }}>
        <span className="gate-hall-far" style={{ clipPath: GATE_OPENING }} />
      </div>

      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          data-gate-leaf={side}
          className="gate-part"
          style={{
            clipPath: side === "left" ? GATE_LEFT : GATE_RIGHT,
            transformOrigin: side === "left" ? `${GATE_HINGE} 50%` : `calc(100% - ${GATE_HINGE}) 50%`,
          }}
        >
          <span className="gate-gild" />
          <span data-gate-charge className="gate-charge">
            <span />
          </span>
          <span data-gate-dim className={side === "left" ? "gate-dim" : "gate-dim gate-dim-r"} />
        </div>
      ))}

      <div className="gate-part" style={{ clipPath: GATE_FRAME }}>
        <span className="gate-gild" />
        <span data-gate-charge className="gate-charge">
          <span />
        </span>
      </div>

      {/* light forcing its way through the seam */}
      <span data-gate-seam className="gate-seam" style={{ top: GATE_APEX, transformOrigin: `50% ${GATE_MEDALLION.y}` }} />

      {/* the star medallion catches fire from within — the lock giving way */}
      <svg
        data-gate-lock
        viewBox="-50 -50 100 100"
        className="gate-lock"
        style={{ left: GATE_MEDALLION.x, top: GATE_MEDALLION.y }}
      >
        <defs>
          <radialGradient id={mirror ? "lock-m" : "lock"}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.12" stopColor="#fffaf0" stopOpacity="0.95" />
            <stop offset="0.3" stopColor="#ffd98a" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ffb547" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r="50" fill={`url(#${mirror ? "lock-m" : "lock"})`} />
        {/* sparkle: two long glints and two short ones */}
        <path d="M0 -50 L1.3 0 L0 50 L-1.3 0 Z M-50 0 L0 -1.3 L50 0 L0 1.3 Z" fill="#fffdf6" />
        <path d="M-22 -22 L0.9 -0.9 L22 22 L-0.9 0.9 Z M22 -22 L0.9 0.9 L-22 22 L-0.9 -0.9 Z" fill="#fff3d0" opacity="0.75" />
      </svg>
    </div>
  );
}

/** Door + its reflection, light spilling on the facade and the wet plaza, rays and sparks. */
export function HeroGate() {
  return (
    <>
      <div data-gate-spill className="gate-spill" />
      <div data-gate-pool className="gate-pool" />
      <div data-gate-shake className="absolute inset-0">
        <Door mirror />
        <Door />
      </div>
      <div data-gate-rays className="gate-rays" />
      <div className="gate-sparks" style={{ "--mx": GATE_MEDALLION.x, "--my": GATE_MEDALLION.y } as CSSProperties}>
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} data-gate-spark />
        ))}
      </div>
    </>
  );
}
