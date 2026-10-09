import { Composition, Folder } from "remotion";
import { Main, mainSchema } from "./compositions/Main";
import { FPS } from "./theme";
import { ZockerEdit, calculateZockerMetadata, zockerDefaults, zockerSchema } from "./zocker/ZockerEdit";

const defaultProps = {
  title: "NoiLucVang",
  subtitle: "Sẵn sàng dựng phim — edit me in Studio",
  outro: "Cảm ơn",
};

const DURATION = 120 + 100 - 20; // sequences minus transition overlap

export const RemotionRoot: React.FC = () => (
  <>
  <Folder name="Zocker">
    <Composition
      id="ZockerEdit"
      component={ZockerEdit}
      schema={zockerSchema}
      defaultProps={zockerDefaults}
      calculateMetadata={calculateZockerMetadata}
      durationInFrames={30}
      fps={30}
      width={1080}
      height={1920}
    />
  </Folder>
  <Folder name="NoiLucVang">
    <Composition
      id="Main"
      component={Main}
      schema={mainSchema}
      defaultProps={defaultProps}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Vertical"
      component={Main}
      schema={mainSchema}
      defaultProps={defaultProps}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </Folder>
  </>
);
