# NoiLucVang — video production (Remotion)

## Setup
```bash
npm install
npm run studio          # live preview & editing at http://localhost:3000
```

## Media
- `public/footage/` — video clips (use `<OffthreadVideo src={staticFile("footage/clip.mp4")} />`)
- `public/audio/` — music / voice-over (use `<Audio src={staticFile("audio/track.mp3")} />`)
- `public/fonts/` — self-hosted Be Vietnam Pro (full Vietnamese support)

## Compositions
- `Main` — 1920×1080 @ 30fps
- `Vertical` — 1080×1920 @ 30fps (Reels / TikTok / Shorts)

## Render
| Command | Output |
|---|---|
| `npm run render` | H.264, CRF 16 (project default) |
| `npm run render:hq` | H.264, CRF 16, x264 `slow`, 320k audio |
| `npm run render:prores` | ProRes 422 HQ `.mov` for grading/mastering |
| `npm run render:vertical` | 9:16 H.264 |
| `npm run still` | PNG frame check |

In a sandbox without Remotion's downloaded browser, set
`REMOTION_BROWSER_EXECUTABLE` to a local Chromium/headless-shell binary.

---

## Zocker Aspire Signature — #PickForGirls (TikTok)

Finishing pass on an already-cut video: 3D camera moves, word-synced captions, info graphics and an end card.

**Workflow**
1. Source: the edited cut (HEVC .MOV) → `public/zocker/source.mp4` (H.264 CRF 12, CFR 30 fps) — kept out of git.
   `ffmpeg -i source.MOV -vf fps=30 -c:v libx264 -preset slow -crf 12 -pix_fmt yuv420p -c:a aac -b:a 320k public/zocker/source.mp4`
2. Cuts: `scripts/detect-cuts.sh public/zocker/source.mp4` → timings in `src/zocker/edit.ts`.
3. Captions: Whisper large-v3 word timestamps (`data/zocker-transcript.whisper.json`) → `node scripts/zocker-captions.mjs`
   (spelling fixes pinned to timestamps, bilingual subs, phrase-aware line breaks) → `src/zocker/captions.json`.
4. Audio master → `public/zocker/mastered.wav`: court/VO section (from 76.2 s) +14 dB with a 0.5 s ramp, 70 Hz high-pass,
   light compression, two-pass loudnorm to −14 LUFS / −1.5 dBTP.
5. End-card hold: `ffmpeg -sseof -0.1 -i public/zocker/source.mp4 -update 1 -frames:v 1 public/zocker/lastframe.png`
6. `npm run studio` to review → `npm run render:zocker`.

**Rules baked in** (`src/zocker/config.ts` → `MOTION`)
- Every zoom, camera move and transition takes ≥ 1.5 s (camera moves 2 s, light-leak bridges 1.8 s).
- Camera stays restrained: ≤ 10% push, ≤ 3° yaw, with overscan so edges never show.
- Hook: "Người yêu bị “phản bội” 🥲" is fully readable on frame 0 (thumbnail), then settles in 3D with a light sweep.
