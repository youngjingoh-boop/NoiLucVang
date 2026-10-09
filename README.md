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
1. Put the edited video at `public/zocker/source.mp4` (or `.mov`; then set the `src` prop in Studio). Duration, size and fps come from the file.
2. `scripts/detect-cuts.sh public/zocker/source.mp4`: lists the existing cuts. Line `cameraMoves`, `sceneBridges` and `overlays` up with them in `src/zocker/edit.ts`.
3. Captions: `src/zocker/captions.json` is currently a **draft with estimated timing**. Transcribe the footage, then run `node scripts/import-transcript.mjs transcript.json` and tag the English lines (`style: "en"` + `sub`) and the VO lines (`style: "vo"`).
4. `npm run studio` to review, then `npm run render:zocker`.

**Rules baked in** (`src/zocker/config.ts` → `MOTION`)
- Every zoom, camera move and transition takes ≥ 1.5 s (camera moves 2 s, light-leak bridges 1.8 s).
- Camera stays restrained: ≤ 10% push, ≤ 3° yaw, with overscan so edges never show.
- Hook: "Người yêu bị “phản bội” 🥲" is fully readable on frame 0 (thumbnail), then settles in 3D with a light sweep.
