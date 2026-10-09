import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { MOTION, ease, palette } from "./config";

const window = (s: number, start: number, end: number, fade = MOTION.min) =>
  interpolate(s, [start, start + fade, end - fade, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.inOut,
  });

// Fine film grain via a shifting SVG turbulence tile. Low opacity: texture, not dirt.
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`g${Math.floor(frame / 2)}`) * 1000);
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`n${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#n${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.38 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

// Warm light leak that sweeps across a cut over ~1.8 s, masking the edit with glow instead of a hard jump.
export const LightLeak: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const half = MOTION.transition / 2;
  if (s < at - half || s > at + half) return null;
  const t = interpolate(s, [at - half, at + half], [0, 1]);
  const o = Math.sin(t * Math.PI) * 0.42;
  const x = interpolate(t, [0, 1], [-30, 130], { easing: ease.inOut });
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: o, pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 90% at ${x}% 40%, ${palette.blush} 0%, ${palette.pink}aa 30%, rgba(255,170,90,0.35) 55%, transparent 75%)`,
          filter: "blur(30px)",
        }}
      />
    </AbsoluteFill>
  );
};

// Cinematic mode for the VO: letterbox + warm grade, both easing in/out over 2 s.
export const Cinematic: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = window(frame / fps, start, end, MOTION.camera);
  if (k <= 0) return null;
  const bar = `${7.5 * k}%`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,160,90,0.10), rgba(255,111,165,0.08))", mixBlendMode: "soft-light", opacity: k }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: bar, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: bar, background: "#000" }} />
    </AbsoluteFill>
  );
};

export { window as fadeWindow };
