"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { sceneState } from "@/lib/store";
import { CITIES, SAMARKAND } from "@/lib/silk-road";

const R = 2;
const globeUniforms = { uTime: { value: 0 }, uDpr: { value: 1 } };

function toVec(lat: number, lon: number, r = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function Dots({ count }: { count: number }) {
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      pos.set([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], i * 3);
      seed[i] = (i * 0.6180339) % 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: globeUniforms.uTime, uDpr: globeUniforms.uDpr },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform float uDpr;
        varying float vA;
        varying float vFacing;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * normalize(position));
          vFacing = smoothstep(-0.1, 0.6, dot(n, normalize(-mv.xyz)));
          vA = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 1.5 + aSeed * 40.0));
          gl_PointSize = (3.2 + aSeed * 3.0) * uDpr * (6.5 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vA;
        varying float vFacing;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          vec3 col = mix(vec3(0.23, 0.36, 1.0), vec3(0.18, 0.91, 0.84), vA);
          gl_FragColor = vec4(col * 1.4, a * (0.35 + vA * 0.65) * vFacing);
        }
      `,
    });
    return { geo, mat };
  }, [count]);
  return <points geometry={geo} material={mat} />;
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
            float i = pow(clamp(-dot(vN, vV) / 0.55, 0.0, 1.0), 4.0) * 0.75;
            gl_FragColor = vec4(vec3(0.18, 0.91, 0.84) * i, i);
          }
        `,
      }),
    [],
  );
  return (
    <mesh material={mat} scale={1.18}>
      <sphereGeometry args={[R, 64, 64]} />
    </mesh>
  );
}

function Graticule() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const push = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lon = -180; lon < 180; lon += 4) push(toVec(lat, lon, R * 1.001), toVec(lat, lon + 4, R * 1.001));
    }
    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = -88; lat < 88; lat += 4) push(toVec(lat, lon, R * 1.001), toVec(lat + 4, lon, R * 1.001));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#4f6cff" transparent opacity={0.35} depthWrite={false} />
    </lineSegments>
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

function Globe({ progress, mobile }: { progress: React.RefObject<number>; mobile: boolean }) {
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
      <mesh>
        <sphereGeometry args={[R * 0.995, 64, 64]} />
        <meshBasicMaterial color="#040817" />
      </mesh>
      <Graticule />
      <Dots count={mobile ? 1800 : 4200} />
      <Arcs />
      <SamarkandBeacon />
      <Atmosphere />
    </group>
  );
}

export default function GlobeScene({ active, progress }: { active: boolean; progress: React.RefObject<number> }) {
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 2]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, mobile ? 8.6 : 7.8], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Globe progress={progress} mobile={mobile} />
    </Canvas>
  );
}
