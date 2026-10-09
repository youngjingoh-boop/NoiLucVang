// ─────────────────────────────────────────────────────────────────────────────
// Edit decision list. ALL timings are in seconds of the source video.
// Re-time these against the real footage (shot cuts + transcription).
// ─────────────────────────────────────────────────────────────────────────────

export type CameraKind =
  | "rest"
  | "pushIn" // slow dolly in, centered
  | "pushInLeft" // dolly in while yawing toward the left subject
  | "pushInRight"
  | "tiltUp" // gentle 3D tilt, reveals depth
  | "orbitLeft" // slow parallax orbit
  | "orbitRight"
  | "hero"; // the strongest push, reserved for the hook / key beats

export type CameraMove = { at: number; kind: CameraKind; duration?: number };

// Each move eases from the previous framing into the new one (never faster than MOTION.min).
export const cameraMoves: CameraMove[] = [
  // CẢNH 1: HOOK. Starts already slightly pushed in, so frame 0 has depth.
  { at: 0, kind: "hero", duration: 2.0 },
  { at: 5.6, kind: "pushInRight", duration: 2.0 }, // "You betrayed me": push toward him
  { at: 8.6, kind: "orbitLeft", duration: 2.0 }, // back to Huyền's shoulder tap
  { at: 10.6, kind: "rest", duration: 1.8 },
  // CẢNH 2: UNBOX
  { at: 14.6, kind: "pushIn", duration: 2.0 },
  { at: 21.0, kind: "tiltUp", duration: 2.0 },
  { at: 27.4, kind: "orbitRight", duration: 2.0 },
  // CẢNH 3: CẢM NHẬN
  { at: 34.2, kind: "rest", duration: 2.0 },
  { at: 42.0, kind: "pushInLeft", duration: 2.0 },
  { at: 49.2, kind: "hero", duration: 2.0 }, // lotus close-up
  // CẢNH 4: TRÊN SÂN
  { at: 57.2, kind: "orbitLeft", duration: 2.0 },
  { at: 62.6, kind: "pushIn", duration: 2.0 }, // "đừng xem thường nha"
  // CẢNH 5: VO
  { at: 66.8, kind: "rest", duration: 2.0 },
  { at: 76.2, kind: "tiltUp", duration: 2.0 },
  { at: 80.4, kind: "pushIn", duration: 2.0 },
  { at: 88.4, kind: "rest", duration: 2.0 },
];

// Soft light-leak transitions that bridge the existing cuts between scenes (≥1.8 s each).
export const sceneBridges: number[] = [10.6, 14.4, 34.0, 57.0, 66.6];

export const overlays = {
  hook: { start: 0, end: 4.6 },
  giftBox: { start: 15.4, end: 21.8 },
  limited: { start: 22.0, end: 27.2 },
  lotus: { start: 49.4, end: 56.8 },
  cinematic: { start: 66.6, end: 88.4 }, // VO section: letterbox + warm grade + serif captions
  endCard: { start: 88.4 },
};

// Words that always pop in the caption accent color.
export const emphasis: string[] = [
  "phản bội",
  "betrayed",
  "đổi luôn",
  "20/10",
  "339",
  "Hàn Quốc",
  "chân thật",
  "brand Việt Nam",
  "đầm tay",
  "hoa sen",
  "tà áo dài",
  "đừng xem thường",
  "90%",
  "kết nối",
  "trưởng thành",
];
