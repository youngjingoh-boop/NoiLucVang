import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { MOTION, ease, palette, sans, serif } from "./config";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const useSeconds = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

// Entrance/exit progress with the brief's minimum duration on both sides.
const life = (s: number, start: number, end: number, dur = MOTION.min) => ({
  in: interpolate(s, [start, start + dur], [0, 1], { ...clamp, easing: ease.out }),
  out: interpolate(s, [end - dur, end], [1, 0], { ...clamp, easing: ease.inOut }),
});

// Faux-extruded 3D type: stacked offset shadows give real depth without WebGL.
const extrude = (depth: number, color: string) =>
  Array.from({ length: depth }, (_, i) => `0 ${i + 1}px 0 ${color}`).join(", ") + `, 0 ${depth + 10}px 40px rgba(0,0,0,0.55)`;

/* ───────────────────────── HOOK ─────────────────────────
   Fully legible on frame 0 (thumbnail + instant read), then settles in 3D while a light sweep crosses it. */
export const Hook: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const s = useSeconds();
  if (s < start || s > end) return null;
  const t = interpolate(s, [start, start + MOTION.camera], [0, 1], { ...clamp, easing: ease.out });
  const { out } = life(s, start, end);
  const sweep = interpolate(s, [start + 0.3, start + 2.1], [-60, 160], { ...clamp, easing: ease.inOut });
  const rotX = interpolate(t, [0, 1], [16, 7]);
  const rotY = interpolate(t, [0, 1], [-12, -5]);
  const z = interpolate(t, [0, 1], [-80, 0]);

  return (
    <AbsoluteFill style={{ perspective: 1400, alignItems: "center", paddingTop: 250, opacity: out }}>
      <div style={{ transform: `translateZ(${z}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`, transformStyle: "preserve-3d", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: sans,
            fontWeight: 800,
            fontSize: 54,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: palette.plum,
            background: palette.white,
            padding: "10px 26px 12px",
            borderRadius: 14,
            boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
            transform: "translateZ(30px) rotate(-3deg)",
          }}
        >
          Người yêu bị
        </div>
        <div style={{ position: "relative", marginTop: 6 }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 800,
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: -3,
              color: palette.white,
              textShadow: extrude(11, "#c2447a"),
              whiteSpace: "nowrap",
            }}
          >
            “phản bội” <span style={{ textShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>🥲</span>
          </div>
          {/* light sweep, clipped to the glyphs */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              fontFamily: sans,
              fontWeight: 800,
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: -3,
              whiteSpace: "nowrap",
              color: "transparent",
              backgroundImage: `linear-gradient(105deg, transparent ${sweep - 18}%, rgba(255,255,255,0.95) ${sweep}%, transparent ${sweep + 18}%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              mixBlendMode: "screen",
            }}
          >
            “phản bội” <span style={{ opacity: 0 }}>🥲</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── GLASS CARD ───────────────────────── */
const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: "linear-gradient(140deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
      border: "1.5px solid rgba(255,255,255,0.35)",
      borderRadius: 34,
      backdropFilter: "blur(18px) saturate(1.3)",
      WebkitBackdropFilter: "blur(18px) saturate(1.3)",
      boxShadow: "0 30px 80px rgba(58,15,36,0.45), inset 0 1px 0 rgba(255,255,255,0.45)",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ───────────────────────── GIFT BOX CONTENTS ───────────────────────── */
const items = [
  { icon: "🏓", label: "Vợt cao cấp" },
  { icon: "👕", label: "Áo" },
  { icon: "🎀", label: "Băng chặn" },
  { icon: "ball", label: "2 quả bóng" },
];

// Pickleball (yellow, perforated): emoji only offers a tennis ball.
const Pickleball: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="#e6f24a" stroke="#b9c62e" strokeWidth="1.5" />
    {[[20, 9], [11, 16], [29, 16], [14, 27], [26, 27], [20, 20]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="2.6" fill="#a3ad22" />
    ))}
  </svg>
);

export const GiftBox: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const s = useSeconds();
  if (s < start || s > end) return null;
  const card = life(s, start, end);
  const swing = interpolate(card.in, [0, 1], [-38, -8]);
  return (
    <AbsoluteFill style={{ perspective: 1600, alignItems: "flex-start", paddingTop: 240, paddingLeft: 70, opacity: card.out }}>
      <div style={{ transform: `rotateY(${swing}deg) translateZ(${(card.in - 1) * 120}px)`, transformOrigin: "left center", opacity: card.in }}>
        <Glass style={{ padding: "34px 44px 30px", width: 560 }}>
          <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 700, fontSize: 54, color: palette.white, lineHeight: 1.05 }}>
            Limited <span style={{ color: palette.pink }}>Pink</span>
            <br />
            Gift Box
          </div>
          <div style={{ height: 2, background: `linear-gradient(90deg, ${palette.pink}, transparent)`, margin: "18px 0 14px" }} />
          {items.map((it, i) => {
            const k = interpolate(s, [start + 0.5 + i * 0.4, start + 0.5 + i * 0.4 + MOTION.min], [0, 1], { ...clamp, easing: ease.out });
            return (
              <div
                key={it.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "8px 0",
                  opacity: k,
                  transform: `translateX(${(1 - k) * 40}px)`,
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 40,
                  color: palette.white,
                }}
              >
                <span style={{ width: 52, display: "flex", justifyContent: "center" }}>{it.icon === "ball" ? <Pickleball /> : it.icon}</span>
                {it.label}
              </div>
            );
          })}
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── 339 + KOREA TICKET ───────────────────────── */
export const Limited: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const s = useSeconds();
  if (s < start || s > end) return null;
  const { out } = life(s, start, end);
  const num = Math.round(interpolate(s, [start, start + 2.0], [0, 339], { ...clamp, easing: ease.out }));
  const head = interpolate(s, [start, start + MOTION.min], [0, 1], { ...clamp, easing: ease.out });
  const tStart = start + 2.2;
  const tk = interpolate(s, [tStart, tStart + 1.8], [0, 1], { ...clamp, easing: ease.out });
  const float = Math.sin((s - tStart) * 1.1) * 4;

  return (
    <AbsoluteFill style={{ perspective: 1600, alignItems: "center", paddingTop: 230, opacity: out }}>
      <div style={{ textAlign: "center", opacity: head, transform: `rotateX(${(1 - head) * 30}deg)` }}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 36, letterSpacing: 8, color: palette.blush, textTransform: "uppercase" }}>Chỉ có</div>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 230, lineHeight: 1.05, marginBottom: 18, color: palette.white, textShadow: extrude(10, "#c2447a"), fontVariantNumeric: "tabular-nums" }}>
          {num}
        </div>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 44, color: palette.white, textShadow: "0 6px 24px rgba(0,0,0,0.5)" }}>
          hộp · mỗi vợt đánh số riêng
        </div>
      </div>

      {/* boarding-pass ticket */}
      <div
        style={{
          marginTop: 46,
          opacity: tk,
          transform: `translateY(${float}px) rotateY(${interpolate(tk, [0, 1], [42, -6])}deg) rotateZ(${interpolate(tk, [0, 1], [6, -2])}deg)`,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 720,
            borderRadius: 26,
            overflow: "hidden",
            background: `linear-gradient(120deg, ${palette.white}, ${palette.blush})`,
            boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ flex: 1, padding: "26px 34px" }}>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 24, letterSpacing: 4, color: palette.pink, textTransform: "uppercase" }}>Số may mắn</div>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 44, color: palette.plum, lineHeight: 1.15, marginTop: 6 }}>
              1 cặp vé du lịch
              <br />
              Hàn Quốc
            </div>
          </div>
          <div style={{ width: 0, borderLeft: `4px dashed ${palette.pink}66`, margin: "16px 0" }} />
          <div style={{ width: 170, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 92 }}>✈️</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── LOTUS ─────────────────────────
   Gold line-art lotus drawing itself over ~2.2 s beside the close-up: delicate, never covering the detail. */
const petals = [
  "M150 250 C 120 190, 130 120, 150 70 C 170 120, 180 190, 150 250 Z",
  "M150 250 C 95 215, 70 160, 72 110 C 112 135, 140 185, 150 250 Z",
  "M150 250 C 205 215, 230 160, 228 110 C 188 135, 160 185, 150 250 Z",
  "M150 250 C 80 245, 35 210, 18 170 C 70 170, 120 205, 150 250 Z",
  "M150 250 C 220 245, 265 210, 282 170 C 230 170, 180 205, 150 250 Z",
  "M60 262 C 110 275, 190 275, 240 262",
];

export const Lotus: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const s = useSeconds();
  if (s < start || s > end) return null;
  const { out } = life(s, start, end);
  const draw = interpolate(s, [start, start + 2.2], [0, 1], { ...clamp, easing: ease.inOut });
  const text = interpolate(s, [start + 1.0, start + 1.0 + MOTION.min], [0, 1], { ...clamp, easing: ease.out });
  return (
    <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "flex-start", padding: "230px 64px 0 0", opacity: out }}>
      <div style={{ textAlign: "right" }}>
        <svg width="250" height="240" viewBox="0 0 300 290" style={{ filter: `drop-shadow(0 0 14px ${palette.gold}88)` }}>
          {petals.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={palette.gold}
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - interpolate(draw, [i * 0.1, Math.min(1, i * 0.1 + 0.6)], [0, 1], clamp)}
            />
          ))}
        </svg>
        <div style={{ opacity: text, transform: `translateY(${(1 - text) * 16}px)` }}>
          <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 700, fontSize: 56, color: palette.white, textShadow: "0 6px 26px rgba(0,0,0,0.6)" }}>
            Hoa sen · Tà áo dài
          </div>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 28, letterSpacing: 5, marginTop: 6, color: palette.gold, textTransform: "uppercase" }}>
            Nét đẹp người phụ nữ Việt
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── END CARD ───────────────────────── */
export const EndCard: React.FC<{ start: number }> = ({ start }) => {
  const s = useSeconds();
  if (s < start) return null;
  const k = interpolate(s, [start, start + MOTION.camera], [0, 1], { ...clamp, easing: ease.out });
  const line = interpolate(s, [start + 0.6, start + 2.4], [0, 1], { ...clamp, easing: ease.inOut });
  const tag = interpolate(s, [start + 1.2, start + 1.2 + MOTION.min], [0, 1], { ...clamp, easing: ease.out });
  return (
    <AbsoluteFill style={{ perspective: 1600, justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(58,15,36,0.35), rgba(20,4,12,0.78))`, opacity: k }} />
      <div style={{ textAlign: "center", opacity: k, transform: `rotateX(${(1 - k) * 28}deg) translateZ(${(k - 1) * 160}px)` }}>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 40, letterSpacing: 14, color: palette.pink, textTransform: "uppercase" }}>Pick For Girls</div>
        <div style={{ width: 520 * line, height: 2, margin: "26px auto", background: `linear-gradient(90deg, transparent, ${palette.blush}, transparent)` }} />
        <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: 92, lineHeight: 1.08, color: palette.white, textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
          Let Her Game
          <br />
          <span style={{ fontWeight: 700, color: palette.blush }}>Tell Her Story</span>
        </div>
        <div style={{ marginTop: 40, opacity: tag, fontFamily: sans, fontWeight: 600, fontSize: 30, letterSpacing: 3, color: "rgba(255,255,255,0.8)" }}>
          #PickForGirls · Zocker Aspire Signature
        </div>
      </div>
    </AbsoluteFill>
  );
};
