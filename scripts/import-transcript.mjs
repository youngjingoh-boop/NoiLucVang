// Converts a word-level transcript into src/zocker/captions.json.
// Accepts: ElevenLabs Scribe JSON ({ words: [{ text, start, end, type }] }),
//          Whisper JSON ({ segments: [{ words: [{ word, start, end }] }] }),
//          or a plain array of { text, start, end } (seconds).
// Usage: node scripts/import-transcript.mjs transcript.json
// Afterwards: mark English lines with "style": "en" + "sub", and VO lines with "style": "vo".
import { readFileSync, writeFileSync } from "node:fs";

const raw = JSON.parse(readFileSync(process.argv[2], "utf8"));
let words =
  Array.isArray(raw) ? raw
  : raw.words ? raw.words.filter((w) => (w.type ?? "word") === "word")
  : raw.segments.flatMap((s) => s.words.map((w) => ({ text: w.word, start: w.start, end: w.end })));
words = words.map((w) => ({ text: String(w.text).trim(), start: +(+w.start).toFixed(3), end: +(+w.end).toFixed(3) })).filter((w) => w.text);

const MAX_WORDS = 6, MAX_GAP = 0.6;
const lines = [];
let cur = [];
const flush = () => { if (cur.length) lines.push({ start: cur[0].start, end: cur.at(-1).end, style: "talk", words: cur }); cur = []; };
for (const w of words) {
  if (cur.length && w.start - cur.at(-1).end > MAX_GAP) flush();
  cur.push(w);
  if (/[.!?…]$/.test(w.text) || (/,$/.test(w.text) && cur.length >= 3) || cur.length >= MAX_WORDS) flush();
}
flush();
writeFileSync(new URL("../src/zocker/captions.json", import.meta.url), JSON.stringify({ draft: false, lines }, null, 1));
console.log(`${lines.length} lines from ${words.length} words`);
