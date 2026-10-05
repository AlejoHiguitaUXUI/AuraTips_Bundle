'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

import './Aurora.css';

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uLightMode;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.88 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor * 1.3;
  
  if (uLightMode > 0.5) {
    float energy = clamp(max(intensity, 0.0), 0.0, 1.0);
    float coverage = clamp(auroraAlpha * (0.55 + 0.45 * energy), 0.0, 0.95);
    vec3 chroma = pow(clamp(rampColor * 1.15, 0.0, 1.0), vec3(0.92));
    float alpha = coverage * 0.96;
    fragColor = vec4(chroma * alpha, alpha);
  } else {
    fragColor = vec4(auroraColor * auroraAlpha, min(auroraAlpha * 1.25, 0.95));
  }
}
`;

export interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
  lightMode?: boolean;
}

export default function Aurora(props: AuroraProps) {
  const { colorStops = ['#5227FF', '#7cff67', '#5227FF'], amplitude = 1.0, blend = 0.5, lightMode = false } = props;
  const propsRef = useRef<AuroraProps>(props);
  propsRef.current = props;

  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    let renderer: Renderer | null = null;
    let program: Program | undefined;
    let mesh: Mesh | undefined;
    let animateId = 0;
    let lastFrame = 0;
    let lastStopsKey = '';
    // Each Aurora frame forces every backdrop-filter (glass) layer above it to re-blur,
    // so frame count directly drives GPU cost. The aurora moves slowly: 20fps looks identical.
    const FRAME_INTERVAL = 1000 / 20;
    const RENDER_SCALE = 0.35; // Soft gradient: render at low res and let CSS upscale
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function syncUniforms(t: number) {
      if (!program) return;
      const p = propsRef.current;
      const { time = t * 0.01, speed = 1.0 } = p;
      program.uniforms.uTime.value = time * speed * 0.1;
      program.uniforms.uAmplitude.value = p.amplitude ?? 1.0;
      program.uniforms.uBlend.value = p.blend ?? blend;
      program.uniforms.uLightMode.value = (p.lightMode ?? lightMode) ? 1 : 0;
      const stops = p.colorStops ?? colorStops;
      const key = stops.join('|');
      if (key !== lastStopsKey) {
        lastStopsKey = key;
        program.uniforms.uColorStops.value = stops.map((hex: string) => {
          const c = new Color(hex);
          return [c.r, c.g, c.b];
        });
      }
    }

    function draw(t: number) {
      if (!program || !renderer || !mesh) return;
      try {
        syncUniforms(t);
        renderer.render({ scene: mesh });
      } catch {
        // Context lost or animation frame issue
      }
    }

    function resize() {
      if (!ctn || !renderer) return;
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height);
      if (program) {
        program.uniforms.uResolution.value = [width * RENDER_SCALE, height * RENDER_SCALE];
      }
      if (reducedMotion) draw(0);
    }

    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      if (t - lastFrame < FRAME_INTERVAL) return;
      lastFrame = t;
      draw(t);
    };

    const start = () => {
      if (reducedMotion || animateId) return;
      animateId = requestAnimationFrame(update);
    };
    const stop = () => {
      if (animateId) cancelAnimationFrame(animateId);
      animateId = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: RENDER_SCALE,
        powerPreference: 'low-power'
      } as any);
      const gl = renderer.gl;
      if (!gl) return;

      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.canvas.style.backgroundColor = 'transparent';

      window.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', onVisibility);

      const geometry = new Triangle(gl);
      if (geometry.attributes.uv) {
        delete (geometry.attributes as any).uv;
      }

      program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: amplitude },
          uColorStops: { value: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] },
          uResolution: { value: [(ctn.offsetWidth || 1) * RENDER_SCALE, (ctn.offsetHeight || 1) * RENDER_SCALE] },
          uBlend: { value: blend },
          uLightMode: { value: lightMode ? 1 : 0 }
        }
      });

      mesh = new Mesh(gl, { geometry, program });
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      ctn.appendChild(gl.canvas);

      resize();
      if (reducedMotion) draw(0);
      else if (!document.hidden) start();
    } catch (err) {
      console.warn("Aurora WebGL initialization skipped or failed:", err);
    }

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (renderer) {
        try {
          if (ctn && renderer.gl.canvas.parentNode === ctn) {
            ctn.removeChild(renderer.gl.canvas);
          }
          renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
    // Create the WebGL context ONCE. All props are read live via propsRef in the render loop;
    // previously depending on [amplitude] destroyed/recreated the context on every slider tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ctnDom} className="aurora-container" />;
}
