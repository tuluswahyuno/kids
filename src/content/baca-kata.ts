/**
 * Pemenggalan suku kata sederhana untuk kata Indonesia umum (game "Baca Kata").
 * Aturan: gugus "ng", "ny", "kh", "sy" dianggap satu konsonan; diftong "ai", "au", "oi"
 * hanya di akhir kata. Pola: V-KV, VK-KV (konsonan pertama ikut suku sebelumnya).
 * Tidak sempurna, tetapi huruf tidak pernah berubah: hyphenate(w).join("") sama dengan hurufnya.
 */

const VOWELS = "aiueo";
const DIGRAPHS = ["ng", "ny", "kh", "sy"];
const FINAL_DIPHTHONGS = ["ai", "au", "oi"];

function syllabify(seg: string): string[] {
  const low = seg.toLowerCase();
  const units: { s: string; v: boolean }[] = [];
  let i = 0;
  while (i < seg.length) {
    if (VOWELS.includes(low[i])) {
      if (i === seg.length - 2 && FINAL_DIPHTHONGS.includes(low.slice(i))) {
        units.push({ s: seg.slice(i), v: true });
        i += 2;
      } else {
        units.push({ s: seg[i], v: true });
        i += 1;
      }
    } else if (DIGRAPHS.includes(low.slice(i, i + 2))) {
      units.push({ s: seg.slice(i, i + 2), v: false });
      i += 2;
    } else {
      units.push({ s: seg[i], v: false });
      i += 1;
    }
  }
  const nuclei = units.flatMap((u, idx) => (u.v ? [idx] : []));
  if (nuclei.length < 2) return [seg];
  const cuts: number[] = [];
  for (let n = 0; n < nuclei.length - 1; n++) {
    const a = nuclei[n];
    const b = nuclei[n + 1];
    const k = b - a - 1;
    cuts.push(k >= 2 ? a + 2 : a + 1);
  }
  const out: string[] = [];
  let start = 0;
  for (const c of [...cuts, units.length]) {
    out.push(units.slice(start, c).map((u) => u.s).join(""));
    start = c;
  }
  return out;
}

/** Pecah kata menjadi suku kata. Spasi dan tanda hubung memisahkan bagian kata. */
export function hyphenate(word: string): string[] {
  if (!/^[A-Za-z\s-]+$/.test(word)) return [word];
  return word
    .split(/[\s-]+/)
    .filter(Boolean)
    .flatMap(syllabify);
}

/** "ku-cing" untuk ditampilkan. */
export const hyphenated = (word: string) => hyphenate(word).join("-");
