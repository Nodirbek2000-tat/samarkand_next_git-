import * as THREE from "three";

/** Uniforms shared by every material; ticked once per frame by the camera rig. */
export const sharedUniforms = {
  uTime: { value: 0 },
  uIntensity: { value: 1 },
};

/** Animated eight-point star lattice drawn on top of every facade. */
export function createTileMaterial(scale = 0.9, day = false) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    // night: glowing lines (additive); day: glazed tilework painted onto the brick
    blending: day ? THREE.NormalBlending : THREE.AdditiveBlending,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uScale: { value: scale },
      uAlpha: { value: day ? 0.95 : 0.6 },
      uA: { value: new THREE.Color(day ? "#0a8a80" : "#2ee8d6") },
      uB: { value: new THREE.Color(day ? "#1d3aa6" : "#3b5bff") },
      uGold: { value: new THREE.Color(day ? "#c9902c" : "#f3c46b") },
    },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      varying float vY;
      void main() {
        vP = position.xy;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vY = wp.y;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uScale;
      uniform float uAlpha;
      uniform vec3 uA;
      uniform vec3 uB;
      uniform vec3 uGold;
      varying vec2 vP;
      varying float vY;

      float line(float d, float w) { return 1.0 - smoothstep(0.0, w, abs(d)); }

      void main() {
        vec2 p = vP * uScale;
        vec2 cell = fract(p) - 0.5;
        vec2 q = abs(cell);
        float s1 = max(q.x, q.y);
        vec2 r = vec2(cell.x - cell.y, cell.x + cell.y) * 0.70710678;
        vec2 q2 = abs(r);
        float s2 = max(q2.x, q2.y);
        float star = line(min(s1, s2) - 0.30, 0.018);
        float oct = line(max(s1, s2) - 0.30, 0.012);
        float ring = line(length(cell) - 0.11, 0.012);
        float grid = line(q.x - 0.5, 0.01) + line(q.y - 0.5, 0.01);

        float sweep = smoothstep(0.35, 0.0, abs(fract(vY * 0.06 - uTime * 0.08) - 0.5) - 0.12);
        vec3 col = uA * star * 0.55 + uB * (oct * 0.5 + grid * 0.25) + uGold * ring * 0.6;
        col += uGold * star * sweep * 1.6;
        float a = clamp(star + oct + ring + grid, 0.0, 1.0);
        gl_FragColor = vec4(col / max(a, 0.001) * min(a, 1.0), a * uAlpha);
      }
    `,
  });
}

/** Ribbed melon dome: fresnel turquoise glaze with a golden light sweep. */
export function createDomeMaterial(day = false) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: sharedUniforms.uTime,
      uA: { value: new THREE.Color(day ? "#22b9ab" : "#2ee8d6") },
      uB: { value: new THREE.Color(day ? "#0c5a74" : "#0a1a4a") },
      uGold: { value: new THREE.Color(day ? "#e9b65a" : "#f3c46b") },
      uFres: { value: day ? 0.9 : 1.8 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vP;
      varying vec3 vV;
      void main() {
        vP = position;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uA;
      uniform vec3 uB;
      uniform vec3 uGold;
      uniform float uFres;
      varying vec3 vN;
      varying vec3 vP;
      varying vec3 vV;
      void main() {
        float ang = atan(vP.z, vP.x);
        float rib = pow(abs(cos(ang * 12.0)), 10.0);
        float fres = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.2);
        vec3 base = mix(uB, uA * 0.6, clamp(vP.y * 0.7, 0.0, 1.0));
        vec3 col = base * 0.7 + uA * fres * uFres + uA * rib * 0.35;
        float band = 1.0 - smoothstep(0.0, 0.05, abs(fract(vP.y * 0.45 - uTime * 0.12) - 0.5));
        col += uGold * band * (0.6 + fres);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/** Soft light filling an arch opening; additive so the camera can fly through it. */
export function createPortalMaterial(day = false) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: day ? THREE.NormalBlending : THREE.AdditiveBlending,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uTop: { value: 9 },
      uIntensity: sharedUniforms.uIntensity,
    },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vP = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uTop;
      uniform float uIntensity;
      varying vec2 vP;
      void main() {
        float h = clamp(vP.y / uTop, 0.0, 1.0);
        vec3 deep = vec3(0.02, 0.05, 0.16);
        vec3 turq = vec3(0.18, 0.91, 0.84);
        vec3 gold = vec3(0.95, 0.77, 0.42);
        vec3 col = mix(gold * 1.4, turq, smoothstep(0.0, 0.7, h));
        col = mix(col, deep, smoothstep(0.55, 1.0, h));
        float rays = 0.6 + 0.4 * sin(vP.x * 3.0 + uTime * 0.8) * sin(vP.y * 1.3 - uTime * 0.5);
        float edge = smoothstep(0.0, 1.2, abs(vP.x));
        gl_FragColor = vec4(col * rays * (0.55 + edge * 0.25) * uIntensity, 0.9);
      }
    `,
  });
}

/** Infinite-looking floor grid that fades out radially. */
export function createFloorMaterial(day = false) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: sharedUniforms.uTime,
      uC1: { value: new THREE.Color(day ? "#2a3f9e" : "#3b5cff") },
      uC2: { value: new THREE.Color(day ? "#0a7a72" : "#2ee8d6") },
      uGold: { value: new THREE.Color(day ? "#b57a1c" : "#f3c46b") },
      uGlow: { value: day ? 0.0 : 0.12 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vP = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uC1;
      uniform vec3 uC2;
      uniform vec3 uGold;
      uniform float uGlow;
      varying vec2 vP;
      float grid(vec2 p, float w) {
        vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
        return 1.0 - min(min(g.x, g.y), 1.0);
      }
      void main() {
        float d = length(vP);
        float fade = smoothstep(42.0, 4.0, d);
        float g1 = grid(vP * 0.5, 1.0) * 0.35;
        float g2 = grid(vP * 0.125, 1.0) * 0.6;
        float pulse = smoothstep(1.2, 0.0, abs(d - mod(uTime * 6.0, 48.0))) * 0.8;
        vec3 col = uC1 * g1 + uC2 * g2;
        col += uGold * pulse * (g1 + g2) * 2.0;
        float glow = smoothstep(14.0, 0.0, length(vP - vec2(0.0, 4.0))) * uGlow;
        col += vec3(0.18, 0.6, 0.8) * glow;
        gl_FragColor = vec4(col * fade, (g1 + g2 + glow + pulse * 0.3) * fade);
      }
    `,
  });
}
