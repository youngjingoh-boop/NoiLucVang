import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";
import { fontFamily as sans } from "../theme";

// Playfair Display (self-hosted) for editorial / cinematic moments.
export const serif = "Playfair Display";
const ranges = {
  latin: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  "latin-ext": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
  vietnamese: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
};
for (const [subset, unicodeRange] of Object.entries(ranges)) {
  for (const [weight, style] of [["400", "italic"], ["700", "normal"], ["700", "italic"]] as const) {
    loadFont({
      family: serif,
      url: staticFile(`fonts/playfair-display-${subset}-${weight}-${style}.woff2`),
      weight,
      style,
      unicodeRange,
    });
  }
}

export { sans };

export const palette = {
  pink: "#ff6fa5",
  blush: "#ffd3e2",
  plum: "#3a0f24",
  gold: "#e8c77a",
  white: "#ffffff",
  ink: "rgba(20, 6, 14, 0.55)",
};

// Design space: every overlay is laid out on a 1080-wide canvas and scaled to the real video size.
export const DESIGN_WIDTH = 1080;

// Motion rules (user brief): any zoom, camera move or transition runs at least 1.5 s, ideally ~2 s.
export const MOTION = {
  min: 1.5,
  camera: 2.0,
  transition: 1.8,
};

// Slow, premium curves. "out" settles softly, so 1.5 s entrances still read instantly.
export const ease = {
  inOut: Easing.bezier(0.45, 0, 0.2, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
};
