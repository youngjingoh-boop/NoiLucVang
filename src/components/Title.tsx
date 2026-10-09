import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export const Title: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const subOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ textAlign: "center", fontFamily: theme.fontFamily }}>
      <h1
        style={{
          margin: 0,
          fontSize: 120,
          fontWeight: 800,
          letterSpacing: -2,
          background: `linear-gradient(180deg, ${theme.colors.goldLight}, ${theme.colors.gold})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
          transform: `translateY(${(1 - enter) * 40}px)`,
          opacity: enter,
        }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p style={{ marginTop: 24, fontSize: 44, fontWeight: 400, color: theme.colors.text, opacity: subOpacity }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};
