import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { z } from "zod";
import { Title } from "../components/Title";
import { theme } from "../theme";

export const mainSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  outro: z.string(),
});

export type MainProps = z.infer<typeof mainSchema>;

const Scene: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.colors.background,
      backgroundImage: "radial-gradient(circle at 50% 40%, rgba(212,175,55,0.18), transparent 60%)",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);

// Placeholder timeline. Swap scenes for footage (<OffthreadVideo src={staticFile("footage/...")} />),
// add <Audio src={staticFile("audio/...")} /> for music/VO, and adjust durations.
export const Main: React.FC<MainProps> = ({ title, subtitle, outro }) => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={120}>
      <Scene>
        <Title title={title} subtitle={subtitle} />
      </Scene>
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
    <TransitionSeries.Sequence durationInFrames={100}>
      <Scene>
        <Title title={outro} />
      </Scene>
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
