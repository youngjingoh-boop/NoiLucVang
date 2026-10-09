// ─────────────────────────────────────────────────────────────────────────────
// Edit decision list, timed to the real cut (source 109.07 s, 1080×1920, 30 fps).
// ALL timings are seconds of the source video. Shot cuts: 13.23 18.07 24.63 25.40
// 31.90 36.93 41.23 60.33 77.13 88.50 98.00 (scripts/detect-cuts.sh).
// ─────────────────────────────────────────────────────────────────────────────

export type CameraKind =
  | "rest"
  | "pushIn" // slow dolly in, centered
  | "pushInLeft" // dolly in while yawing toward the left of frame
  | "pushInRight"
  | "pushInTopLeft" // toward the top-left corner (where he peeks in)
  | "tiltUp" // gentle 3D tilt, reveals depth
  | "orbitLeft" // slow parallax orbit
  | "orbitRight"
  | "hero"; // the strongest push, reserved for the hook / key beats

export type CameraMove = { at: number; kind: CameraKind; duration?: number };

// Each move eases from the previous framing into the new one over ≥ 1.5 s (default 2 s).
export const cameraMoves: CameraMove[] = [
  // CẢNH 1: HOOK (couch). Frame 0 already has depth; slow hero push under the title.
  { at: 0, kind: "hero" },
  { at: 6.0, kind: "pushInTopLeft" }, // he peeks in top-left: "You betrayed me"
  { at: 10.0, kind: "rest" }, // "Well, that was a good time." breathe out
  // CẢNH 2: UNBOX
  { at: 13.23, kind: "pushIn" }, // cut to the pink box
  { at: 18.07, kind: "tiltUp" }, // contents laid out
  { at: 23.4, kind: "orbitLeft" }, // "339 hộp"
  { at: 27.5, kind: "pushIn" }, // "số may mắn … vé du lịch Hàn Quốc"
  { at: 31.9, kind: "orbitRight" }, // "Mọi người có thấy những cái vé này không?"
  // Court insert
  { at: 36.93, kind: "rest" },
  // CẢNH 3: CẢM NHẬN (couch)
  { at: 41.23, kind: "pushIn" },
  { at: 49.4, kind: "orbitRight" }, // "đầm tay"
  { at: 57.24, kind: "pushInLeft" }, // "tấn công … mạnh"
  // Close-up on the paddle design
  { at: 60.33, kind: "rest" },
  { at: 64.8, kind: "hero" }, // "hoa sen"
  { at: 69.96, kind: "orbitLeft" }, // "tinh tế … 20/10"
  // CẢNH 4: TRÊN SÂN
  { at: 77.13, kind: "rest" },
  { at: 79.26, kind: "orbitRight" }, // "giữ nhịp, tạo thế cân bằng"
  { at: 82.98, kind: "pushIn" }, // "đừng xem thường nha"
  // CẢNH 5: VO (cinematic)
  { at: 86.2, kind: "rest", duration: 2.5 },
  { at: 91.8, kind: "tiltUp", duration: 2.5 },
  { at: 96.84, kind: "pushIn", duration: 2.5 }, // "90%"
  { at: 100.56, kind: "orbitLeft", duration: 2.5 },
  { at: 104.54, kind: "pushIn", duration: 2.5 }, // "kỷ niệm đẹp … lớn lên bên nhau"
  { at: 108.7, kind: "rest", duration: 2.5 }, // into the end card
];

// Light-leak bridges on the scene-level cuts (1.8 s each).
export const sceneBridges: number[] = [13.23, 36.93, 41.23, 60.33, 77.13];

export const overlays = {
  hook: { start: 0, end: 5.7 }, // gone before he peeks in (~6.3 s)
  giftBox: { start: 17.6, end: 24.6, itemsAt: [20.6, 21.35, 21.9, 22.6] },
  limited: { start: 24.4, end: 33.4, ticketAt: 29.5 },
  lotus: { start: 65.0, end: 75.0 },
  cinematic: { start: 85.9, end: 108.9 }, // VO: letterbox + warm grade + serif captions
  endCard: { start: 108.7 },
};

// Hold the final frame under the end card this long after the source ends.
export const TAIL_SECONDS = 3.6;

// Words that always pop in the caption accent color.
export const emphasis: string[] = [
  "betrayed",
  "đổi vợt",
  "Zocker!",
  "Limited Pink Gift Box",
  "339",
  "Hàn Quốc",
  "bất ngờ",
  "brand Việt Nam",
  "đầm tay",
  "hoa sen",
  "tà áo dài",
  "điềm tĩnh",
  "đừng xem thường",
  "90%",
  "kết nối",
  "trưởng thành",
];
