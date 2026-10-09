// Builds src/zocker/captions.json from the Whisper large-v3 word transcript (data/zocker-transcript.whisper.json),
// applying spelling fixes, bilingual subs and caption styles. Re-run after editing anything below.
import { readFileSync, writeFileSync } from "node:fs";

const words = JSON.parse(readFileSync(new URL("../data/zocker-transcript.whisper.json", import.meta.url), "utf8"))
  .map(({ text, start, end }) => ({ text, start, end }));

// Fixes pinned to a timestamp so they only touch the intended word.  [startSec, from, to]
const fixes = [
  [0.58, "sang", "xong"],
  [6.18, "She", "You"],
  [13.34, "Sehat", "CH"],
  [15.42, "nhà.", "nhà"],
  [16.3, "Joker.", "Zocker!"],
  [23.46, "Joker", "Zocker"],
  [67.44, "tài", "tà"],
  [76.76, "Chiên", "Trên"],
  [78.4, "điểm", "điềm"],
  [94.36, "cái", "cãi"],
];
for (const [at, from, to] of fixes) {
  const w = words.find((x) => Math.abs(x.start - at) < 0.05 && x.text === from);
  if (!w) throw new Error(`fix not found: ${from} @ ${at}`);
  w.text = to;
}
// Merge split tokens: "Big Ball" → pickleball, "90 %" → 90%.
for (let i = 0; i < words.length - 1; i++) {
  const a = words[i], b = words[i + 1];
  if (a.text === "Big" && /^Ball/.test(b.text)) { a.text = "pickleball" + b.text.slice(4); a.end = b.end; words.splice(i + 1, 1); }
  else if (/^\d+$/.test(a.text) && b.text === "%") { a.text += "%"; a.end = b.end; words.splice(i + 1, 1); }
}

const styleAt = (t) => (t >= 6.1 && t < 12.5 ? "en" : t >= 86.1 ? "vo" : "talk");
const subs = [
  [6.1, 9.2, "Em phản bội anh. Còn cây vợt cũ anh mua cho em thì sao?"],
  [10.1, 12.2, "Thôi mà, cây cũ cũng đã có một thời gian đẹp rồi."],
];
const subAt = (t) => subs.find(([a, b]) => t >= a && t < b)?.[2];

const MAX_WORDS = 7;
// Vietnamese compounds / fixed phrases that must never be split across two captions.
const glue = new Set(`cao cấp|tà áo|áo dài|cãi vã|chi phí|Việt Nam|Hàn Quốc|thể thao|kết nối|tinh tế|phù hợp|tài trợ|trưởng thành|đầm tay|may mắn|du lịch|nước ngoài|chất lượng|hoàn thiện|thiết kế|công nhận|người yêu|tìm hiểu|cân bằng|dứt điểm|xem thường|đánh số|sử dụng|tấn công|cảm nhận|trải nghiệm|hoa sen|phụ nữ|tượng trưng|kỷ niệm|lớn lên|bên nhau|hiểu nhau|bất ngờ|băng chặn|quả bóng|Limited Pink|Pink Gift|Gift Box|món quà|thực sự|bắt đầu|có thể|điềm tĩnh|giữ nhịp|lối đánh|đánh thủ|độ nảy|mọi người|cặp vé|1 cặp|2 quả|1 vợt|tháng 10|20 tháng|số may|đủ thứ|old paddle|mở hộp|339 hộp|lén mở|môn thể|hai đứa|cùng nhau|chúng mình|anh ấy|chơi pickleball|rất là|nhưng mà|khi mà|nên là|gọi là|cái hình|những cái|đứa chúng|thật ra|hầu như|cái vé|vé này|tà áo|cái tà`.split("|").map((x) => x.toLowerCase()));
const bare = (t) => t.replace(/[.,!?…"“”]/g, "");
const conj = new Set(["nhưng", "và", "mà", "rồi", "thì", "để", "cho", "nên", "khi", "là"]);

// Split a sentence recursively at the best break: long pauses, commas, before conjunctions, balanced halves.
const split = (ws) => {
  if (ws.length <= MAX_WORDS) return [ws];
  let best = -1, bestScore = -Infinity;
  const minPart = ws.length >= 6 ? 3 : 2;
  for (let i = minPart; i <= ws.length - minPart; i++) {
    const a = ws[i - 1], b = ws[i];
    if (glue.has(`${bare(a.text)} ${bare(b.text)}`.toLowerCase())) continue;
    const score = (b.start - a.end) * 6 + (/,$/.test(a.text) ? 1.2 : 0) + (conj.has(bare(b.text).toLowerCase()) ? 0.35 : 0) - Math.abs(ws.length / 2 - i) * 0.12;
    if (score > bestScore) { bestScore = score; best = i; }
  }
  if (best < 0) best = Math.ceil(ws.length / 2);
  return [...split(ws.slice(0, best)), ...split(ws.slice(best))];
};

// 1) sentences (punctuation, long pauses, style changes)  2) phrase-sized captions within each.
const sentences = [];
let cur = [];
for (const w of words) {
  const prev = cur.at(-1);
  if (prev && (w.start - prev.end > 0.6 || styleAt(w.start) !== styleAt(prev.start))) { sentences.push(cur); cur = []; }
  cur.push(w);
  if (/[.!?…]$/.test(w.text)) { sentences.push(cur); cur = []; }
}
if (cur.length) sentences.push(cur);

const lines = sentences.flatMap(split).map((ws) => {
  const start = ws[0].start, sub = subAt(start);
  return { start, end: ws.at(-1).end, style: styleAt(start), ...(sub ? { sub } : {}), words: ws };
});

// Never leave a lonely 1-word caption: fold it into the previous line when they're close.
for (let i = lines.length - 1; i > 0; i--) {
  const l = lines[i], p = lines[i - 1];
  if (l.words.length === 1 && l.start - p.end < 1.0 && p.style === l.style) {
    p.words.push(...l.words); p.end = l.end; lines.splice(i, 1);
  }
}
writeFileSync(new URL("../src/zocker/captions.json", import.meta.url), JSON.stringify({ draft: false, lines }, null, 1));
console.log(`${lines.length} lines`);
for (const l of lines) console.log(l.start.toFixed(2).padStart(6), l.style.padEnd(4), l.words.map((w) => w.text).join(" "));
