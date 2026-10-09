import { parseMedia } from "@remotion/media-parser";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Camera } from "./Camera";
import { Captions, Line } from "./Captions";
import { DESIGN_WIDTH } from "./config";
import { TAIL_SECONDS, cameraMoves, overlays, sceneBridges } from "./edit";
import { Cinematic, Grain, LightLeak, Vignette } from "./Fx";
import { EndCard, GiftBox, Hook, Limited, Lotus } from "./Overlays";
import captions from "./captions.json";

export const zockerSchema = z.object({
  src: z.string(),
  // Final soundtrack: levelled speech + original music bed + sfx, -14 LUFS, full length incl. the end-card hold
  // (scripts/zocker-sound.py → scripts/zocker-master.sh). Empty string = use the video's own audio.
  audio: z.string(),
  showCaptions: z.boolean(),
  showGrain: z.boolean(),
  // Still of the source's last frame, held under the end card.
  tail: z.string(),
  sourceFrames: z.number().optional(),
});
type Props = z.infer<typeof zockerSchema>;

export const zockerDefaults: Props = {
  src: "zocker/source.mp4",
  audio: "zocker/mix.wav",
  tail: "zocker/lastframe.png",
  showCaptions: true,
  showGrain: true,
};

// Overlays are designed on a 1080-wide canvas and scaled to the footage's real resolution.
const DesignSpace: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  const k = width / DESIGN_WIDTH;
  return (
    <AbsoluteFill style={{ width: DESIGN_WIDTH, height: height / k, transform: `scale(${k})`, transformOrigin: "top left" }}>
      {children}
    </AbsoluteFill>
  );
};

const fill: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };

export const ZockerEdit: React.FC<Props> = ({ src, audio, tail, showCaptions, showGrain, sourceFrames }) => {
  const { durationInFrames } = useVideoConfig();
  const n = sourceFrames ?? durationInFrames;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Camera moves={cameraMoves}>
        <Sequence durationInFrames={n} layout="none">
          <OffthreadVideo src={staticFile(src)} muted={Boolean(audio)} style={fill} />
        </Sequence>
        {/* hold the true last frame under the end card (ffmpeg -sseof -0.1 … lastframe.png) */}
        <Sequence from={n} layout="none">
          <Img src={staticFile(tail)} style={fill} />
        </Sequence>
      </Camera>
      {audio ? (
        <Audio src={staticFile(audio)} />
      ) : null}

      {sceneBridges.map((at) => (
        <LightLeak key={at} at={at} />
      ))}
      <Vignette />
      <Cinematic start={overlays.cinematic.start} end={overlays.cinematic.end} />

      <DesignSpace>
        <Hook {...overlays.hook} />
        <GiftBox {...overlays.giftBox} />
        <Limited {...overlays.limited} />
        <Lotus {...overlays.lotus} />
        {showCaptions ? <Captions lines={(captions as { lines: Line[] }).lines} /> : null}
        <EndCard start={overlays.endCard.start} />
      </DesignSpace>

      {showGrain ? <Grain /> : null}
    </AbsoluteFill>
  );
};

// Size, fps and length come from the source file; the end-card hold is added on top.
export const calculateZockerMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const { durationInSeconds, dimensions, fps } = await parseMedia({
    src: staticFile(props.src),
    fields: { durationInSeconds: true, dimensions: true, fps: true },
    acknowledgeRemotionLicense: true,
  });
  const frameRate = Math.round(fps ?? 30);
  const sourceFrames = Math.max(1, Math.floor((durationInSeconds ?? 1) * frameRate));
  return {
    durationInFrames: sourceFrames + Math.round(TAIL_SECONDS * frameRate),
    fps: frameRate,
    width: dimensions?.width ?? 1080,
    height: dimensions?.height ?? 1920,
    props: { ...props, sourceFrames },
  };
};
