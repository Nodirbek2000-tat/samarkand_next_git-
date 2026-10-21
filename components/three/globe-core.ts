import * as THREE from "three";
import { CITIES, SAMARKAND } from "@/lib/silk-road";

/**
 * The live Earth for «Ipak yo‘li chorrahasida»: NASA Blue Marble by day, Black Marble city lights by night,
 * blended across the terminator, a slowly drifting cloud layer, sun glint on the oceans, a thin limb of
 * atmosphere and the Silk Road arcs from Samarkand. Imagery: NASA Visible Earth / Earth Observatory.
 *
 * Plain three.js with no DOM: it runs in a Web Worker on an OffscreenCanvas (globe.worker.ts) — loading,
 * shader compilation and every frame happen off the page's main thread, so the globe never stalls scrolling —
 * or, where a worker can't draw, on the page itself (globe-view.tsx).
 */

export type GlobeInit = {
  width: number;
  height: number;
  dpr: number;
  phone: boolean;
  night: boolean;
  /** absolute URLs: day, night lights, clouds */
  maps: string[];
  antialias: boolean;
  progress: number;
};
export type GlobeMsg =
  | { type: "size"; width: number; height: number; dpr: number }
  | { type: "active"; value: boolean }
  | { type: "theme"; night: boolean }
  | { type: "input"; progress: number; x: number; y: number }
  | { type: "dispose" };
export type GlobeEvents = { ready(): void; slow(): void; unsupported(): void };
export type Globe = { handle(msg: GlobeMsg): void };

const R = 2;
/** the Earth keeps turning on its own: one revolution in about 45 s */
const SPIN = (Math.PI * 2) / 45;

// workers have requestAnimationFrame in current browsers; a timer elsewhere
const raf: (cb: (t: number) => void) => number =
  typeof requestAnimationFrame === "function"
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
const caf: (id: number) => void =
  typeof cancelAnimationFrame === "function" ? (id) => cancelAnimationFrame(id) : (id) => clearTimeout(id);

function toVec(lat: number, lon: number, r = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Decoded off the main thread (createImageBitmap); uploaded unflipped — the shaders read v upside down. */
async function loadMap(url: string, colour: boolean) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const bitmap = await createImageBitmap(await res.blob());
  const t = new THREE.Texture(bitmap as unknown as HTMLImageElement);
  t.flipY = false;
  if (colour) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.wrapS = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

const sunFor = (night: boolean) =>
  // world-space sun: from the upper left by day; behind the globe at night so the city lights glow
  (night ? new THREE.Vector3(-0.85, 0.25, -0.45) : new THREE.Vector3(-0.55, 0.35, 0.76)).normalize();

export function startGlobe(canvas: HTMLCanvasElement | OffscreenCanvas, init: GlobeInit, events: GlobeEvents): Globe {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: init.antialias, alpha: true, powerPreference: "high-performance" });
  } catch {
    events.unsupported();
    return { handle() {} };
  }
  renderer.setPixelRatio(init.dpr);
  renderer.setSize(init.width, init.height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, init.width / Math.max(1, init.height), 0.1, 1000);
  camera.position.set(0, 0, init.phone ? 8.6 : 7.8);

  const uTime = { value: 0 };
  const uSun = { value: sunFor(init.night) };
  const group = new THREE.Group();
  scene.add(group);
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  // ---------- Earth (added once the maps are in)
  const earthGeo = keep(new THREE.SphereGeometry(R, init.phone ? 64 : 96, init.phone ? 48 : 64));
  let earthReady = false;
  Promise.all(init.maps.map((url, i) => loadMap(url, i < 2)))
    .then(([day, night, clouds]) => {
      if (disposed) return [day, night, clouds].forEach((t) => t.dispose());
      [day, night, clouds].forEach(keep);
      const mat = keep(
        new THREE.ShaderMaterial({
          uniforms: { uDay: { value: day }, uNight: { value: night }, uClouds: { value: clouds }, uSun, uTime },
          vertexShader: /* glsl */ `
            varying vec2 vUv;
            varying vec3 vN;
            varying vec3 vPos;
            void main() {
              // the maps were uploaded as decoded (top row first): read them upside down
              vUv = vec2(uv.x, 1.0 - uv.y);
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
        }),
      );
      group.add(new THREE.Mesh(earthGeo, mat));
      earthReady = true;
      // the first frame with the maps: shaders and textures reach the GPU now, then the page may swap the
      // picture for the live globe
      render(performance.now());
      raf(() => !disposed && events.ready());
    })
    .catch(() => !disposed && events.unsupported());

  // ---------- atmosphere: back faces, brightest right at the silhouette
  const atmo = new THREE.Mesh(
    keep(new THREE.SphereGeometry(R, 64, 64)),
    keep(
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
            float i = pow(clamp(-dot(vN, vV) / 0.55, 0.0, 1.0), 4.0) * 0.8;
            gl_FragColor = vec4(vec3(0.33, 0.62, 1.0) * i, i);
          }
        `,
      }),
    ),
  );
  atmo.scale.setScalar(1.12);
  group.add(atmo);

  // ---------- Silk Road arcs from Samarkand, a light running along each
  const origin = toVec(SAMARKAND.lat, SAMARKAND.lon);
  const markerGeo = keep(new THREE.SphereGeometry(0.03, 12, 12));
  const markerMat = keep(new THREE.MeshBasicMaterial({ color: "#2ee8d6", toneMapped: false }));
  CITIES.forEach((c, i) => {
    const end = toVec(c.lat, c.lon);
    const dist = origin.distanceTo(end);
    const mid = origin
      .clone()
      .add(end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(R + dist * 0.42);
    const geo = keep(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(origin, mid, end), 96, 0.012, 6, false));
    const mat = keep(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime, uOffset: { value: i * 0.37 } },
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
      }),
    );
    group.add(new THREE.Mesh(geo, mat));
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(toVec(c.lat, c.lon, R * 1.01));
    group.add(marker);
  });

  // ---------- Samarkand: a gold beacon with a pulsing ring
  const beaconPos = toVec(SAMARKAND.lat, SAMARKAND.lon, R * 1.012);
  const beacon = new THREE.Group();
  beacon.position.copy(beaconPos);
  beacon.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), beaconPos.clone().normalize());
  beacon.add(
    new THREE.Mesh(
      keep(new THREE.SphereGeometry(0.06, 16, 16)),
      keep(new THREE.MeshBasicMaterial({ color: "#f3c46b", toneMapped: false })),
    ),
  );
  const ringMat = keep(
    new THREE.MeshBasicMaterial({ color: "#f3c46b", transparent: true, side: THREE.DoubleSide, depthWrite: false }),
  );
  const ring = new THREE.Mesh(keep(new THREE.RingGeometry(0.07, 0.09, 48)), ringMat);
  beacon.add(ring);
  const stem = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(0.004, 0.004, 1, 6)),
    keep(new THREE.MeshBasicMaterial({ color: "#f3c46b", transparent: true, opacity: 0.6 })),
  );
  stem.position.z = 0.5;
  beacon.add(stem);
  group.add(beacon);

  // ---------- motion
  // Samarkand faces the viewer when the section has scrolled in; the Earth keeps turning from there
  const p0 = toVec(SAMARKAND.lat, SAMARKAND.lon);
  const face = -Math.atan2(p0.x, p0.z);
  let progress = init.progress;
  let mouseX = 0;
  let mouseY = 0;
  let spin = 0;
  const start = performance.now();
  let last = start;

  function render(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    uTime.value = (now - start) / 1000;
    spin += dt * SPIN;
    const targetY = face + (1 - progress) * Math.PI * 1.4 + spin + mouseX * 0.25;
    const targetX = 0.5 + mouseY * 0.12;
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 3, dt);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 3, dt);
    const t = (uTime.value * 0.8) % 1;
    ring.scale.setScalar(1 + t * 4);
    ringMat.opacity = 1 - t;
    renderer.render(scene, camera);
  }

  // the device must keep about 28 frames a second while the globe is on screen (median over its first 2.5 s
  // there) — otherwise the page goes back to the picture instead of stuttering
  const gaps: number[] = [];
  let watched = 0;
  let judged = false;
  function judge(gap: number) {
    if (judged || gap > 0.5) return;
    gaps.push(gap);
    watched += gap;
    if (watched < 2.5 || gaps.length < 12) return;
    judged = true;
    const sorted = gaps.slice(5).sort((a, b) => a - b);
    if (sorted[Math.floor(sorted.length / 2)] > 1 / 28) {
      active = false;
      events.slow();
    }
  }

  let active = false;
  let disposed = false;
  let frame = 0;
  let prev = 0;
  const loop = (now: number) => {
    frame = 0;
    if (!active || disposed) return;
    if (prev) judge((now - prev) / 1000);
    prev = now;
    render(now);
    frame = raf(loop);
  };

  return {
    handle(msg) {
      if (disposed) return;
      switch (msg.type) {
        case "size":
          renderer.setPixelRatio(msg.dpr);
          renderer.setSize(msg.width, msg.height, false);
          camera.aspect = msg.width / Math.max(1, msg.height);
          camera.updateProjectionMatrix();
          if (!active && earthReady) render(performance.now());
          break;
        case "active":
          active = msg.value;
          prev = 0;
          if (active && !frame) {
            last = performance.now();
            frame = raf(loop);
          }
          break;
        case "theme":
          uSun.value = sunFor(msg.night);
          if (!active && earthReady) render(performance.now());
          break;
        case "input":
          progress = msg.progress;
          mouseX = msg.x;
          mouseY = msg.y;
          break;
        case "dispose":
          disposed = true;
          if (frame) caf(frame);
          disposables.forEach((d) => d.dispose());
          renderer.dispose();
          break;
      }
    },
  };
}
