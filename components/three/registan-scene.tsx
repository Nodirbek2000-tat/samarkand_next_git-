"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor, Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { sceneState } from "@/lib/store";
import { createDomeMaterial, createFloorMaterial, createPortalMaterial, createTileMaterial, sharedUniforms } from "./shaders";

const GOLD_LINE = new THREE.Color(2.4, 1.55, 0.55);
const TURQ_LINE = new THREE.Color(0.35, 2.2, 2.0);

/* ------------------------------------------------------------------ geometry */

/** Timurid pointed arch: two arcs whose centres are offset past the axis. */
function addArch(path: THREE.Path, w: number, spring: number, y0 = 0, cx0 = 0) {
  const hw = w / 2;
  const r = w * 0.62;
  const c = -hw + r;
  const apex = Math.acos(-c / r);
  path.moveTo(cx0 - hw, y0);
  path.lineTo(cx0 - hw, y0 + spring);
  path.absarc(cx0 + c, y0 + spring, r, Math.PI, apex, true);
  path.absarc(cx0 + hw - r, y0 + spring, r, Math.PI - apex, 0, true);
  path.lineTo(cx0 + hw, y0);
  path.lineTo(cx0 - hw, y0);
  return y0 + spring + r * Math.sin(apex);
}

function archPoints(w: number, spring: number, y0 = 0, cx0 = 0) {
  const p = new THREE.Path();
  addArch(p, w, spring, y0, cx0);
  return p.getPoints(24).map((v) => new THREE.Vector3(v.x, v.y, 0));
}

function rectPoints(x0: number, y0: number, x1: number, y1: number) {
  return [
    new THREE.Vector3(x0, y0, 0),
    new THREE.Vector3(x1, y0, 0),
    new THREE.Vector3(x1, y1, 0),
    new THREE.Vector3(x0, y1, 0),
    new THREE.Vector3(x0, y0, 0),
  ];
}

/** Merge several polylines into one LineSegments geometry (single draw call). */
function segments(polylines: THREE.Vector3[][], z: number) {
  const arr: number[] = [];
  for (const pts of polylines) {
    for (let i = 0; i < pts.length - 1; i++) {
      arr.push(pts[i].x, pts[i].y, z, pts[i + 1].x, pts[i + 1].y, z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
  return g;
}

/* ------------------------------------------------------------------ parts */

type Mats = {
  body: THREE.Material;
  tile: THREE.ShaderMaterial;
  dome: THREE.ShaderMaterial;
  portal: THREE.ShaderMaterial;
  gold: THREE.LineBasicMaterial;
  turq: THREE.LineBasicMaterial;
};

function Pishtaq({ W, H, mats, glow = false }: { W: number; H: number; mats: Mats; glow?: boolean }) {
  const depth = 1.4;
  const ow = W * 0.52;
  const spring = H * 0.42;

  const { body, face, lines, opening } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2, 0);
    shape.lineTo(W / 2, 0);
    shape.lineTo(W / 2, H);
    shape.lineTo(-W / 2, H);
    shape.lineTo(-W / 2, 0);
    const hole = new THREE.Path();
    addArch(hole, ow, spring);
    shape.holes.push(hole);

    const body = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 20 });
    body.translate(0, 0, -depth / 2);
    const face = new THREE.ShapeGeometry(shape, 20);

    const inset = W * 0.07;
    const lines = segments(
      [
        archPoints(ow, spring),
        archPoints(ow + 0.6, spring + 0.1, 0),
        rectPoints(-W / 2 + inset, 0, W / 2 - inset, H - inset),
        rectPoints(-W / 2 + inset * 0.45, 0, W / 2 - inset * 0.45, H - inset * 0.45),
        [new THREE.Vector3(-W / 2 + inset, H - inset * 2.2, 0), new THREE.Vector3(W / 2 - inset, H - inset * 2.2, 0)],
      ],
      depth / 2 + 0.02,
    );

    const openShape = new THREE.Shape();
    addArch(openShape, ow, spring);
    const opening = new THREE.ShapeGeometry(openShape, 20);
    return { body, face, lines, opening };
  }, [W, H, ow, spring]);

  return (
    <group>
      <mesh geometry={body} material={mats.body} />
      <mesh geometry={face} material={mats.tile} position-z={depth / 2 + 0.01} />
      <lineSegments geometry={lines} material={mats.gold} />
      {/* recessed back wall of the iwan */}
      <mesh geometry={opening} position-z={-depth / 2 - 0.6} material={glow ? mats.portal : mats.body} />
      {glow && <mesh geometry={opening} position-z={-depth / 2 + 0.2} material={mats.portal} />}
    </group>
  );
}

function Wing({ w, h, mats, flip = false }: { w: number; h: number; mats: Mats; flip?: boolean }) {
  const depth = 1.1;
  const lines = useMemo(() => {
    const polys: THREE.Vector3[][] = [];
    const cols = 2;
    const cw = w / cols;
    for (let row = 0; row < 2; row++) {
      for (let c = 0; c < cols; c++) {
        const cx = -w / 2 + cw * (c + 0.5);
        polys.push(archPoints(cw * 0.55, h * 0.18, 0.4 + row * (h * 0.46), cx));
      }
    }
    polys.push(rectPoints(-w / 2 + 0.2, 0, w / 2 - 0.2, h - 0.25));
    return segments(polys, depth / 2 + 0.02);
  }, [w, h]);

  return (
    <group scale-x={flip ? -1 : 1}>
      <mesh position-y={h / 2} material={mats.body}>
        <boxGeometry args={[w, h, depth]} />
      </mesh>
      <mesh position={[0, h / 2, depth / 2 + 0.01]} material={mats.tile}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <lineSegments geometry={lines} material={mats.turq} />
    </group>
  );
}

function Minaret({ h, mats }: { h: number; mats: Mats }) {
  const rings = useMemo(() => Array.from({ length: 6 }, (_, i) => 1.2 + (i * (h - 2)) / 6), [h]);
  return (
    <group>
      <mesh position-y={h / 2} material={mats.body}>
        <cylinderGeometry args={[0.36, 0.52, h, 20, 1]} />
      </mesh>
      {rings.map((y) => (
        <mesh key={y} position-y={y} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.47 - (y / h) * 0.13, 0.025, 6, 32]} />
          <meshBasicMaterial color={GOLD_LINE} toneMapped={false} />
        </mesh>
      ))}
      <mesh position-y={h + 0.18} material={mats.body}>
        <cylinderGeometry args={[0.62, 0.42, 0.36, 20]} />
      </mesh>
      <mesh position-y={h + 0.36} material={mats.dome} scale={0.42}>
        <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
}

function Dome({ r, mats }: { r: number; mats: Mats }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      const a = t * Math.PI * 0.5;
      const bulge = 1 + 0.2 * Math.sin(t * Math.PI * 0.95);
      const x = Math.max(Math.cos(a) * bulge * (1 - t * 0.08), 0.001);
      const y = Math.sin(a) * 1.35 + t * t * 0.25;
      pts.push(new THREE.Vector2(x, y));
    }
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  return (
    <group scale={r}>
      <mesh position-y={-0.55} material={mats.body}>
        <cylinderGeometry args={[0.92, 0.95, 1.1, 32]} />
      </mesh>
      <mesh geometry={geo} material={mats.dome} />
      <mesh position-y={1.72}>
        <cylinderGeometry args={[0.012, 0.03, 0.5, 6]} />
        <meshBasicMaterial color={GOLD_LINE} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Madrasa({
  W,
  H,
  mats,
  glow,
  ...props
}: { W: number; H: number; mats: Mats; glow?: boolean } & React.ComponentProps<"group">) {
  const wingW = W * 0.72;
  const wingH = H * 0.6;
  return (
    <group {...props}>
      <Pishtaq W={W} H={H} mats={mats} glow={glow} />
      <group position-x={-(W / 2 + wingW / 2)} position-z={-0.15}>
        <Wing w={wingW} h={wingH} mats={mats} />
      </group>
      <group position-x={W / 2 + wingW / 2} position-z={-0.15}>
        <Wing w={wingW} h={wingH} mats={mats} flip />
      </group>
      <group position-x={-(W / 2 + wingW + 0.3)}>
        <Minaret h={H * 0.95} mats={mats} />
      </group>
      <group position-x={W / 2 + wingW + 0.3}>
        <Minaret h={H * 0.95} mats={mats} />
      </group>
    </group>
  );
}

/** Rotating golden girih "sun" behind the central portal. */
function GirihSun({ mats }: { mats: Mats }) {
  const ref = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const polys: THREE.Vector3[][] = [];
    const sq = (s: number, rot: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 4; i++) {
        const a = rot + Math.PI / 4 + (i * Math.PI) / 2;
        pts.push(new THREE.Vector3(Math.cos(a) * s, Math.sin(a) * s, 0));
      }
      return pts;
    };
    const circle = (r: number, n = 96) =>
      Array.from({ length: n + 1 }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0);
      });
    for (let k = 0; k < 4; k++) polys.push(sq(7.2, (k * Math.PI) / 8));
    polys.push(sq(4.4, 0), sq(4.4, Math.PI / 4), circle(8.6), circle(9.1), circle(3.1), circle(1.2));
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      polys.push([
        new THREE.Vector3(Math.cos(a) * 9.1, Math.sin(a) * 9.1, 0),
        new THREE.Vector3(Math.cos(a) * (i % 2 ? 10 : 11.2), Math.sin(a) * (i % 2 ? 10 : 11.2), 0),
      ]);
    }
    return segments(polys, 0);
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.04;
  });

  return (
    <group ref={ref}>
      <lineSegments geometry={geo} material={mats.gold} />
    </group>
  );
}

/* ------------------------------------------------------------------ rig */

const v = new THREE.Vector3();
const look = new THREE.Vector3();

function CameraRig() {
  useFrame((state, dt) => {
    const { progress: p, mouseX, mouseY, intro } = sceneState;
    const t = state.clock.elapsedTime;
    const e = 1 - Math.pow(1 - intro, 3);

    // intro: high wide establishing shot → eye level; scroll: dolly through the central iwan
    const z = THREE.MathUtils.lerp(34, 19, e) - p * 31;
    const y = THREE.MathUtils.lerp(11, 3.2, e) - p * 0.9;
    v.set(mouseX * 1.6 * (1 - p), y - mouseY * 0.7 * (1 - p) + Math.sin(t * 0.4) * 0.08, z);
    state.camera.position.lerp(v, 1 - Math.pow(0.0015, dt));
    look.set(mouseX * 0.4, THREE.MathUtils.lerp(5.5, 4.2, e) - p * 0.6, state.camera.position.z - 26);
    state.camera.lookAt(look);

    sharedUniforms.uTime.value = t;
    sharedUniforms.uIntensity.value = 0.8 + p * 2.2;
  });
  return null;
}

function Floor({ day }: { day: boolean }) {
  const mat = useMemo(() => createFloorMaterial(day), [day]);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <>
      {day && (
        <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
          <planeGeometry args={[220, 220]} />
          <meshStandardMaterial color="#dcc59b" roughness={0.95} />
        </mesh>
      )}
      <mesh rotation-x={-Math.PI / 2} position-y={0.01} material={mat}>
        <planeGeometry args={[100, 100]} />
      </mesh>
    </>
  );
}

/** Daylight sky: warm haze at the horizon fading into clear blue. */
function SkyDome() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color("#8fc0e2") },
          uMid: { value: new THREE.Color("#d9ebf3") },
          uBottom: { value: new THREE.Color("#f6e7cc") },
        },
        vertexShader: /* glsl */ `
          varying vec3 vW;
          void main() {
            vW = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uMid;
          uniform vec3 uBottom;
          varying vec3 vW;
          void main() {
            float h = vW.y;
            vec3 col = mix(uBottom, uMid, smoothstep(-0.02, 0.18, h));
            col = mix(col, uTop, smoothstep(0.18, 0.75, h));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh material={mat} scale={150}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}

function Registan({ mobile, day }: { mobile: boolean; day: boolean }) {
  const mats = useMemo<Mats>(
    () => ({
      // night: dark lapis stone; day: sun-baked brick like the real Registan
      body: day
        ? new THREE.MeshStandardMaterial({ color: "#d2b98f", roughness: 0.9, metalness: 0 })
        : new THREE.MeshStandardMaterial({ color: "#0b1330", roughness: 0.55, metalness: 0.45 }),
      tile: createTileMaterial(0.85, day),
      dome: createDomeMaterial(day),
      portal: createPortalMaterial(day),
      gold: new THREE.LineBasicMaterial(day ? { color: "#8a5a14" } : { color: GOLD_LINE, toneMapped: false }),
      turq: new THREE.LineBasicMaterial(
        day
          ? { color: "#0b6f68", transparent: true, opacity: 0.85 }
          : { color: TURQ_LINE, toneMapped: false, transparent: true, opacity: 0.7 },
      ),
    }),
    [day],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  const bg = day ? "#f1e6d1" : "#03050b";

  return (
    <>
      <CameraRig />
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, day ? 40 : 18, day ? 130 : 70]} />

      {day ? (
        <>
          <SkyDome />
          <ambientLight intensity={0.55} />
          <hemisphereLight args={["#e3f1ff", "#c8a272", 1.1]} />
          <directionalLight position={[-14, 22, 16]} intensity={2.6} color="#fff0d2" />
          <pointLight position={[0, 4, -2]} intensity={25} distance={18} color="#ffd38a" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.25} />
          <hemisphereLight args={["#2ee8d6", "#03050b", 0.6]} />
          <directionalLight position={[-12, 18, 10]} intensity={1.4} color="#9fd8ff" />
          <pointLight position={[0, 4, -2]} intensity={60} distance={22} color="#f3c46b" />
          <pointLight position={[14, 6, 8]} intensity={40} distance={30} color="#3b5bff" />
          <pointLight position={[-14, 6, 8]} intensity={40} distance={30} color="#2ee8d6" />
        </>
      )}

      <group position={[0, 0, -6]}>
        <group position={[0, 8, -9]}>
          <GirihSun mats={mats} />
        </group>

        {/* Tilla-Kori — centre, facing the square */}
        <Madrasa W={9} H={12} mats={mats} glow position={[0, 0, -2]} />
        {/* Ulugbek — west */}
        <Madrasa W={7} H={10} mats={mats} position={[-15, 0, 6]} rotation-y={0.95} />
        {/* Sher-Dor — east */}
        <Madrasa W={7} H={10} mats={mats} position={[15, 0, 6]} rotation-y={-0.95} />

        <group position={[-8.5, 7.2, -5]}>
          <Dome r={2.4} mats={mats} />
        </group>
        <group position={[8.5, 7.2, -5]}>
          <Dome r={2.4} mats={mats} />
        </group>
        <group position={[-20, 6.4, -1]}>
          <Dome r={1.8} mats={mats} />
        </group>
        <group position={[20, 6.4, -1]}>
          <Dome r={1.8} mats={mats} />
        </group>
      </group>

      <Floor day={day} />
      {!day && <Stars radius={80} depth={40} count={mobile ? 1200 : 3000} factor={3} saturation={0} fade speed={0.6} />}
      <Sparkles
        count={mobile ? 60 : 160}
        scale={[40, 16, 30]}
        position={[0, 7, -4]}
        size={3}
        speed={0.35}
        color={day ? "#c7922f" : "#f3c46b"}
      />
      {!day && (
        <Sparkles count={mobile ? 30 : 80} scale={[30, 12, 20]} position={[0, 5, 0]} size={2} speed={0.25} color="#2ee8d6" />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ canvas */

export default function RegistanScene({ active, theme = "dark" }: { active: boolean; theme?: "light" | "dark" }) {
  const day = theme === "light";
  // this module is only ever loaded client-side (ssr: false), so window is available
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.6));

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 11, 34], fov: mobile ? 62 : 45, near: 0.1, far: 200 }}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(0.85, d - 0.35))}
        onIncline={() => setDpr((d) => Math.min(mobile ? 1.4 : 1.8, d + 0.2))}
      />
      <Registan mobile={mobile} day={day} />
      <EffectComposer multisampling={0}>
        <Bloom
          mipmapBlur
          intensity={day ? 0.3 : mobile ? 0.85 : 1.05}
          luminanceThreshold={day ? 0.92 : 0.55}
          luminanceSmoothing={0.2}
          radius={0.75}
        />
        <Vignette eskil={false} offset={0.2} darkness={day ? 0.3 : 0.85} />
      </EffectComposer>
    </Canvas>
  );
}
