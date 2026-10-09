import { Config } from "@remotion/cli/config";

// High-production defaults: near-lossless H.264, full-range color, high-quality JPEG frames.
Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setAudioBitrate("320k");
Config.setX264Preset("slow");
Config.setConcurrency(null); // auto
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");

// Use the pre-installed headless shell when available (cloud sandbox); falls back to Remotion's own.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
