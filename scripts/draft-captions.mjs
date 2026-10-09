// Builds src/zocker/captions.json from the script with ESTIMATED timings.
// Replace with real word timings (scripts/import-transcript.mjs) once the footage is transcribed.
import { writeFileSync } from "node:fs";

// [start, end, text, style?, sub?]  style: talk | en | vo
const segments = [
  [0.0, 5.4, "Chơi xong ngày đầu là mình đổi luôn, vợt xịn, màu xinh. Giờ đây là cây vợt chính của mình rồi."],
  [5.6, 8.4, "You betrayed me. I bought you that old paddle.", "en", "Em phản bội anh. Cây vợt cũ là anh mua cho em mà."],
  [8.6, 10.2, "It was a good time.", "en", "Thôi mà, cây cũ cũng đã có một thời gian đẹp rồi."],
  [10.8, 14.2, "Cùng CH unbox pack quà 20/10 cực xịn từ nhà Zocker nhé!"],
  [14.6, 27.0, "Bộ Limited Pink Gift Box này gồm vợt cao cấp, áo, băng chặn và 2 quả bóng. Zocker chỉ làm đúng 339 hộp, mỗi hộp đánh số riêng trên mỗi vợt, và với số may mắn sẽ nhận được 1 cặp vé du lịch Hàn Quốc nữa đó."],
  [27.4, 33.8, "Nói thật là mình lén mở hộp rồi chơi thử từ hôm trước rồi. Nên hôm nay sẽ chỉ có cảm nhận chân thật của mình sau khi đánh thôi."],
  [34.2, 41.8, "Hai đứa mình từng dùng vợt của mấy brand nước ngoài rồi. Nên thật sự là bất ngờ, không nghĩ một brand Việt Nam lại làm vợt chất lượng và hoàn thiện tới vậy."],
  [42.0, 48.8, "Cầm rất đầm tay. Vợt thiên về lối đánh thủ, nhưng không hề yếu nha, vẫn có độ nảy khi mình muốn đánh lực hay tấn công."],
  [49.2, 56.8, "Mà thiết kế thì đẹp thật sự. Có cả hoa sen, tà áo dài, rất đặc trưng của người phụ nữ Việt Nam, tinh tế và phù hợp cho ngày 20/10 sắp tới đây."],
  [57.2, 62.4, "Trên sân, mình là người điềm tĩnh hơn. Mình giữ nhịp, tạo thế cân bằng, rồi để anh ấy dứt điểm."],
  [62.6, 66.2, "Cũng giống cây vợt này vậy đó. Cân bằng, nhưng cũng đừng xem thường nha."],
  [66.8, 76.0, "Hai đứa mình bắt đầu chơi pickleball cùng nhau. Nhưng anh ấy là người xem video, tìm hiểu đủ thứ, rồi dẫn mình đi drill cùng, trải qua những cuộc cãi vã để cả hai cùng hiểu nhau hơn...", "vo"],
  [76.2, 80.2, "...và gần như 90% chi phí pickleball của mình tới giờ là anh ấy tài trợ hết.", "vo"],
  [80.4, 88.2, "Nên với mình, pickleball không chỉ là một môn thể thao. Đó là sự kết nối, là kỷ niệm đẹp, và là cách hai đứa cùng trưởng thành và lớn lên bên nhau.", "vo"],
];

const MAX_WORDS = 6;
const lines = [];
for (const [start, end, text, style = "talk", sub] of segments) {
  const words = text.split(/\s+/).filter(Boolean);
  const per = (end - start) / words.length;
  // Chunk on punctuation first, then by length, so each caption reads as a phrase.
  const chunks = [];
  let cur = [];
  words.forEach((w, i) => {
    cur.push({ text: w, start: +(start + i * per).toFixed(3), end: +(start + (i + 1) * per).toFixed(3) });
    if (/[.!?…]$/.test(w) || (/,$/.test(w) && cur.length >= 3) || cur.length >= MAX_WORDS) { chunks.push(cur); cur = []; }
  });
  if (cur.length) chunks.push(cur);
  chunks.forEach((c, i) => lines.push({
    start: c[0].start,
    end: c[c.length - 1].end,
    style,
    // Bilingual lines carry the Vietnamese sub for the whole utterance.
    ...(sub ? { sub } : {}),
    words: c,
  }));
}
writeFileSync(new URL("../src/zocker/captions.json", import.meta.url), JSON.stringify({ draft: true, lines }, null, 1));
console.log(`${lines.length} caption lines written`);
