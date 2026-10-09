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
