"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { sceneState } from "@/lib/store";
import { CITIES, SAMARKAND } from "@/lib/silk-road";
import { isLite } from "@/lib/perf";

const R = 2;
const globeUniforms = { uTime: { value: 0 }, uDpr: { value: 1 } };

function toVec(lat: number, lon: number, r = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/**
 * Chromium decodes the maps off the main thread (ImageBitmapLoader): handing a 2K image to the GPU
 * then no longer freezes the page for a moment. Other browsers use the regular loader.
 */
const BITMAPS = typeof window !== "undefined" && typeof createImageBitmap === "function" && /Chrome\//.test(navigator.userAgent);

function useEarthMaps(urls: string[]) {
  const loaded = useLoader(BITMAPS ? THREE.ImageBitmapLoader : THREE.TextureLoader, urls, (loader) => {
    if (BITMAPS) (loader as THREE.ImageBitmapLoader).setOptions({ imageOrientation: "flipY", premultiplyAlpha: "none" });
  });
  return useMemo(
    () =>
      loaded.map((src, i) => {
        const t = src instanceof THREE.Texture ? src : new THREE.Texture(src as ImageBitmap);
        if (!(src instanceof THREE.Texture)) {
          t.flipY = false; // already flipped while decoding
          t.needsUpdate = true;
        }
        if (i < 2) t.colorSpace = THREE.SRGBColorSpace; // day + night are colour, clouds are a mask
        t.anisotropy = 8;
        t.wrapS = THREE.RepeatWrapping;
        return t;
      }),
    [loaded],
  );
}

/**
 * The real Earth: NASA Blue Marble by day, Black Marble city lights by night, blended across the
 * terminator, a slowly drifting cloud layer, sun glint on the oceans and a thin limb of atmosphere.
 * Imagery: NASA Visible Earth / Earth Observatory.
 */
function Earth({ mobile, sun }: { mobile: boolean; sun: THREE.Vector3 }) {
  // 2K maps stay sharp at the globe's on-screen size and are a third of the download of the full ones
  const [day, night, clouds] = useEarthMaps([
    "/textures/earth/day-2k.webp",
    "/textures/earth/night-2k.webp",
    `/textures/earth/clouds${mobile ? "-1k" : ""}.webp`,
  ]);
  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uDay: { value: day },
        uNight: { value: night },
        uClouds: { value: clouds },
        uSun: { value: sun },
        uTime: globeUniforms.uTime,
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vN;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vN = normalize(mat3(modelMatrix) * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uDay;
        uniform sampler2D uNight;
        uniform sampler2D uClouds;
        uniform vec3 uSun;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vN;
        varying vec3 vPos;
        void main() {
          vec3 n = normalize(vN);
          vec3 v = normalize(cameraPosition - vPos);
          float sunOrient = dot(n, uSun);
          float dayMix = smoothstep(-0.2, 0.45, sunOrient);

          vec3 dayCol = texture2D(uDay, vUv).rgb;
          vec3 nightCol = texture2D(uNight, vUv).rgb;
          float cloud = smoothstep(0.2, 0.95, texture2D(uClouds, vUv + vec2(uTime * 0.0015, 0.0)).r);

          // city lights only on the dark side, dimmed under clouds
          vec3 lights = pow(nightCol, vec3(1.4)) * vec3(1.25, 0.95, 0.6) * 2.4 * (1.0 - cloud * 0.8);
          vec3 col = mix(lights, dayCol * (0.25 + 0.95 * max(sunOrient, 0.0)), dayMix);
          col = mix(col, vec3(1.0), cloud * dayMix * 0.85);

          // sun glint on open water
          float water = smoothstep(0.015, 0.09, dayCol.b - max(dayCol.r, dayCol.g));
          float spec = pow(max(dot(reflect(-uSun, n), v), 0.0), 40.0) * water * (1.0 - cloud) * dayMix;
          col += spec * vec3(1.0, 0.88, 0.7) * 0.9;

          // atmosphere seen on the disc: blue by day, warm along the terminator
          float fres = pow(1.0 - max(dot(v, n), 0.0), 2.6);
          vec3 atmo = mix(vec3(1.0, 0.42, 0.16), vec3(0.32, 0.62, 1.0), smoothstep(-0.15, 0.5, sunOrient));
          col = mix(col, atmo, fres * smoothstep(-0.35, 0.9, sunOrient) * 0.85);

          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });
  }, [day, night, clouds, sun]);
  return (
    <mesh material={mat}>
      <sphereGeometry args={[R, 128, 96]} />
    </mesh>
  );
}

function Atmosphere() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            // back faces: brightest right at the globe's silhouette, fading to the outer shell
            float i = pow(clamp(-dot(vN, vV) / 0.55, 0.0, 1.0), 4.0) * 0.8;
            gl_FragColor = vec4(vec3(0.33, 0.62, 1.0) * i, i);
          }
        `,
      }),
    [],
  );
  return (
    <mesh material={mat} scale={1.12}>
      <sphereGeometry args={[R, 64, 64]} />
    </mesh>
  );
}

function Arcs() {
  const { meshes, markers } = useMemo(() => {
    const origin = toVec(SAMARKAND.lat, SAMARKAND.lon);
    const meshes = CITIES.map((c, i) => {
      const end = toVec(c.lat, c.lon);
      const dist = origin.distanceTo(end);
      const mid = origin.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(R + dist * 0.42);
      const curve = new THREE.QuadraticBezierCurve3(origin, mid, end);
      const geo = new THREE.TubeGeometry(curve, 96, 0.012, 6, false);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: globeUniforms.uTime, uOffset: { value: i * 0.37 } },
        vertexShader: /* glsl */ `
          varying float vT;
          void main() {
            vT = uv.x;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uOffset;
          varying float vT;
          void main() {
            float head = fract(uTime * 0.22 + uOffset) * 1.4 - 0.2;
            float trail = smoothstep(head - 0.35, head, vT) * (1.0 - smoothstep(head, head + 0.02, vT));
            vec3 col = mix(vec3(0.95, 0.77, 0.42), vec3(0.18, 0.91, 0.84), vT);
            float base = 0.12;
            gl_FragColor = vec4(col * (base + trail * 2.4), base + trail);
          }
        `,
      });
      return { geo, mat, key: c.name };
    });
    const markers = CITIES.map((c) => ({ pos: toVec(c.lat, c.lon, R * 1.01), key: c.name }));
    return { meshes, markers };
  }, []);

  return (
    <>
      {meshes.map((m) => (
        <mesh key={m.key} geometry={m.geo} material={m.mat} />
      ))}
      {markers.map((m) => (
        <mesh key={m.key} position={m.pos}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshBasicMaterial color="#2ee8d6" toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function SamarkandBeacon() {
  const ring = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => toVec(SAMARKAND.lat, SAMARKAND.lon, R * 1.012), []);
  const quat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize()),
    [pos],
  );
  useFrame((s) => {
    if (!ring.current) return;
    const t = (s.clock.elapsedTime * 0.8) % 1;
    ring.current.scale.setScalar(1 + t * 4);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = 1 - t;
  });
  return (
    <group position={pos} quaternion={quat}>
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#f3c46b" toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.07, 0.09, 48]} />
        <meshBasicMaterial color="#f3c46b" transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position-z={0.5}>
        <cylinderGeometry args={[0.004, 0.004, 1, 6]} />
        <meshBasicMaterial color="#f3c46b" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/** Tells the page once the Earth has been drawn with its maps (the picture underneath can fade out). */
function FirstFrame({ onReady }: { onReady?: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => onReady?.());
  });
  return null;
}

function Globe({
  progress,
  mobile,
  night,
  onReady,
}: {
  progress: React.RefObject<number>;
  mobile: boolean;
  night: boolean;
  onReady?: () => void;
}) {
  // world-space sun: from the upper left by day; behind the globe at night so the city lights glow
  const sun = useMemo(
    () => (night ? new THREE.Vector3(-0.85, 0.25, -0.45) : new THREE.Vector3(-0.55, 0.35, 0.76)).normalize(),
    [night],
  );
  const group = useRef<THREE.Group>(null);
  const face = useMemo(() => {
    const p = toVec(SAMARKAND.lat, SAMARKAND.lon);
    return -Math.atan2(p.x, p.z);
  }, []);

  useFrame((s, dt) => {
    globeUniforms.uTime.value = s.clock.elapsedTime;
    globeUniforms.uDpr.value = s.gl.getPixelRatio();
    const g = group.current;
    if (!g) return;
    const p = progress.current ?? 0;
    // spin in from the far side and settle with Samarkand facing the viewer
    const targetY = face + (1 - p) * Math.PI * 1.4 + sceneState.mouseX * 0.25 + Math.sin(s.clock.elapsedTime * 0.2) * 0.05;
    const targetX = 0.5 + sceneState.mouseY * 0.12;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 3, dt);
  });

  return (
    <group ref={group}>
      <Suspense fallback={null}>
        <Earth mobile={mobile} sun={sun} />
        <FirstFrame onReady={onReady} />
      </Suspense>
      <Arcs />
      <SamarkandBeacon />
      <Atmosphere />
    </group>
  );
}

export default function GlobeScene({
  active,
  progress,
  theme = "light",
  onReady,
}: {
  active: boolean;
  progress: React.RefObject<number>;
  theme?: "light" | "dark";
  onReady?: () => void;
}) {
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [lite] = useState(isLite);
  return (
    <Canvas
      dpr={lite ? 1 : [1, mobile ? 1.25 : 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, mobile ? 8.6 : 7.8], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Globe progress={progress} mobile={mobile} night={theme === "dark"} onReady={onReady} />
    </Canvas>
  );
}
