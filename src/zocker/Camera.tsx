import { noise2D } from "@remotion/noise";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { MOTION, ease } from "./config";
import { CameraKind, CameraMove } from "./edit";

type Pose = { scale: number; rotX: number; rotY: number; x: number; y: number };

// Restrained framings: max 10% push, max ~3° yaw. Enough to feel 3D, never seasick.
const poses: Record<CameraKind, Pose> = {
  rest: { scale: 1.0, rotX: 0, rotY: 0, x: 0, y: 0 },
  pushIn: { scale: 1.07, rotX: 0, rotY: 0, x: 0, y: -0.5 },
  pushInLeft: { scale: 1.08, rotX: 0.6, rotY: 2.6, x: 1.6, y: -0.4 },
  pushInRight: { scale: 1.08, rotX: 0.6, rotY: -2.6, x: -1.6, y: -0.4 },
  pushInTopLeft: { scale: 1.07, rotX: -1.2, rotY: 2.2, x: 1.8, y: 1.8 },
  tiltUp: { scale: 1.05, rotX: 2.4, rotY: 0, x: 0, y: 0.6 },
  orbitLeft: { scale: 1.05, rotX: 0.4, rotY: 3.0, x: 1.2, y: 0 },
  orbitRight: { scale: 1.05, rotX: 0.4, rotY: -3.0, x: -1.2, y: 0 },
  hero: { scale: 1.1, rotX: 1.2, rotY: -1.2, x: 0, y: -0.8 },
};

const lerp = (a: Pose, b: Pose, t: number): Pose => ({
  scale: a.scale + (b.scale - a.scale) * t,
  rotX: a.rotX + (b.rotX - a.rotX) * t,
  rotY: a.rotY + (b.rotY - a.rotY) * t,
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export const poseAt = (moves: CameraMove[], seconds: number): Pose => {
  // The first move starts from a slightly pushed state so frame 0 already has depth (hook thumbnail).
  let pose: Pose = { ...poses.rest, scale: 1.03 };
  for (const m of moves) {
    if (seconds < m.at) break;
    const dur = Math.max(MOTION.min, m.duration ?? MOTION.camera);
    const t = interpolate(seconds, [m.at, m.at + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease.inOut,
    });
    pose = lerp(pose, poses[m.kind], t);
  }
  return pose;
};

export const Camera: React.FC<{ moves: CameraMove[]; children: React.ReactNode }> = ({ moves, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const p = poseAt(moves, s);

  // Barely-there "operator" drift for life (≈0.15% / 0.15°), slow enough to never read as shake.
  const dx = noise2D("x", s * 0.12, 0) * 0.15;
  const dy = noise2D("y", s * 0.12, 0) * 0.15;
  const dr = noise2D("r", s * 0.1, 0) * 0.15;

  // Overscan so rotations never reveal frame edges.
  const cover = 1 + (Math.abs(p.rotX) + Math.abs(p.rotY)) * 0.012 + (Math.abs(p.x) + Math.abs(p.y)) * 0.02 + 0.006;
  const scale = Math.max(p.scale, cover);

  return (
    <AbsoluteFill style={{ perspective: 1800, overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          transform: `translate3d(${p.x + dx}%, ${p.y + dy}%, 0) rotateX(${p.rotX}deg) rotateY(${p.rotY + dr}deg) scale(${scale})`,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
