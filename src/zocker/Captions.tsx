import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, palette, sans, serif } from "./config";
import { emphasis } from "./edit";

export type Word = { text: string; start: number; end: number };
export type Line = { start: number; end: number; style?: "talk" | "en" | "vo"; sub?: string; words: Word[] };

const norm = (s: string) => s.toLowerCase().replace(/[.,!?…"“”()]/g, "");
const emphasisWords = new Set(emphasis.flatMap((p) => p.split(/\s+/).map(norm)));

// Captions sit in TikTok's safe zone: above the bottom UI, clear of the right-hand buttons.
export const Captions: React.FC<{ lines: Line[]; cinematicFrom?: number }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  // Hold a line a beat past its last word so it never flickers between phrases.
  const line = lines.find((l, i) => s >= l.start && s < Math.min(l.end + 0.35, lines[i + 1]?.start ?? Infinity));
  if (!line) return null;

  const vo = line.style === "vo";
  const en = line.style === "en";
  const age = s - line.start;
  // Phrase entrance: a short opacity/rise synced to speech (text appearing, not a zoom or transition).
  const enter = interpolate(age, [0, 0.22], [0, 1], { extrapolateRight: "clamp", easing: ease.out });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: vo ? 330 : 470 }}>
      <div
        style={{
          maxWidth: 860,
          textAlign: "center",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 14}px)`,
        }}
      >
        <div
          style={{
            fontFamily: vo ? serif : sans,
            fontStyle: vo ? "italic" : "normal",
            fontWeight: vo ? 400 : 800,
            fontSize: vo ? 58 : 62,
            lineHeight: 1.22,
            letterSpacing: vo ? 0 : -0.5,
            color: palette.white,
            textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 8px 28px rgba(0,0,0,0.55)",
            WebkitTextStroke: vo ? undefined : "1.5px rgba(0,0,0,0.25)",
          }}
        >
          {line.words.map((w, i) => {
            const spoken = s >= w.start;
            const active = s >= w.start && s < w.end + 0.08;
            const hot = emphasisWords.has(norm(w.text));
            const color = hot ? (vo ? palette.blush : palette.pink) : palette.white;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: "0.26em",
                  color: spoken ? color : "rgba(255,255,255,0.62)",
                  transform: `translateY(${active && !vo ? -3 : 0}px)`,
                  fontWeight: hot && vo ? 700 : undefined,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
        {en && line.sub ? (
          <div
            style={{
              marginTop: 14,
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 36,
              color: palette.blush,
              textShadow: "0 4px 18px rgba(0,0,0,0.6)",
            }}
          >
            {line.sub}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
