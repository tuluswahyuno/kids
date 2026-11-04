/**
 * KONTEN = DATA. Menambah hewan/buah/kata baru cukup menambah baris di sini
 * (nanti dipindah ke database/CMS tanpa mengubah game).
 */

export type CategoryId = "hewan" | "lokal" | "buah" | "kendaraan" | "benda";

export interface ContentItem {
  /** pengenal unik, stabil (dipakai untuk statistik & file audio) */
  id: string;
  emoji: string;
  /** nama Indonesia, kapitalisasi normal */
  name: string;
  categories: CategoryId[];
  /** Hanya hewan: bunyi yang diucapkan TTS, bunyi yang ditulis, nada (rendah = besar) */
  animal?: { sound: string; soundText: string; pitch: number; clue: string };
  /** File rekaman opsional. Jika ada, dipakai menggantikan TTS. Relatif terhadap /audio/ */
  audio?: { name?: string; sound?: string };
}

const i = (
  id: string,
  emoji: string,
  name: string,
  categories: CategoryId[],
  animal?: ContentItem["animal"],
): ContentItem => ({ id, emoji, name, categories, animal });

export const ITEMS: ContentItem[] = [
  // ---- Hewan ----
  i("kucing", "🐱", "Kucing", ["hewan"], { sound: "Meong. Meong.", soundText: "meong meong", pitch: 1.7, clue: "Aku suka makan ikan dan minum susu. Aku punya kumis." }),
  i("anjing", "🐶", "Anjing", ["hewan"], { sound: "Guk guk. Guk guk.", soundText: "guk guk", pitch: 1.0, clue: "Aku menjaga rumah dan suka mengejar bola." }),
  i("tikus", "🐭", "Tikus", ["hewan"]),
  i("hamster", "🐹", "Hamster", ["hewan"]),
  i("kelinci", "🐰", "Kelinci", ["hewan"]),
  i("rubah", "🦊", "Rubah", ["hewan"]),
  i("beruang", "🐻", "Beruang", ["hewan"]),
  i("panda", "🐼", "Panda", ["hewan"]),
  i("koala", "🐨", "Koala", ["hewan"]),
  i("singa", "🦁", "Singa", ["hewan"], { sound: "Raaaawr! Raaaawr!", soundText: "raaawr", pitch: 0.2, clue: "Aku raja hutan. Aku punya surai yang lebat." }),
  i("babi", "🐷", "Babi", ["hewan"], { sound: "Oink oink. Oink oink.", soundText: "oink oink", pitch: 0.7, clue: "Badanku bulat dan hidungku pesek berwarna merah muda." }),
  i("katak", "🐸", "Katak", ["hewan"], { sound: "Kwok kwok. Kwok kwok.", soundText: "kwok kwok", pitch: 1.2, clue: "Aku suka melompat dan tinggal dekat kolam." }),
  i("pinguin", "🐧", "Pinguin", ["hewan"]),
  i("jerapah", "🦒", "Jerapah", ["hewan"]),
  i("monyet", "🐵", "Monyet", ["hewan", "lokal"], { sound: "Uu uu aa aa! Uu uu aa aa!", soundText: "uu uu aa aa", pitch: 1.6, clue: "Aku pandai memanjat pohon dan suka makan pisang." }),
  i("burung", "🐦", "Burung", ["hewan"], { sound: "Cuit cuit cuit. Cuit cuit.", soundText: "cuit cuit", pitch: 2.0, clue: "Aku punya sayap dan bulu. Aku bernyanyi di pohon." }),
  i("lebah", "🐝", "Lebah", ["hewan"], { sound: "Bzzzzz. Bzzzzz.", soundText: "bzzzzz", pitch: 2.0, clue: "Aku kecil dan terbang. Aku membuat madu." }),

  // ---- Hewan yang juga hewan lokal Indonesia ----
  i("harimau", "🐅", "Harimau", ["hewan", "lokal"], { sound: "Groaaar! Groaaar!", soundText: "groaaar", pitch: 0.2, clue: "Badanku belang-belang oranye dan hitam. Aku hidup di hutan." }),
  i("gajah", "🐘", "Gajah", ["hewan", "lokal"], { sound: "Tuuuuut! Tuuuuut!", soundText: "tuuuut", pitch: 0.3, clue: "Aku punya belalai panjang dan badan sangat besar." }),
  i("orangutan", "🦧", "Orangutan", ["hewan", "lokal"]),
  i("buaya", "🐊", "Buaya", ["hewan", "lokal"]),
  i("cicak", "🦎", "Cicak", ["hewan", "lokal"]),
  i("ular", "🐍", "Ular", ["hewan", "lokal"], { sound: "Ssssss. Ssssss.", soundText: "ssssss", pitch: 1.0, clue: "Aku tidak punya kaki. Aku merayap dan mendesis." }),
  i("penyu", "🐢", "Penyu", ["hewan", "lokal"]),
  i("beo", "🦜", "Burung Beo", ["hewan", "lokal"]),
  i("elang", "🦅", "Elang", ["hewan", "lokal"]),
  i("kerbau", "🐃", "Kerbau", ["hewan", "lokal"]),
  i("sapi", "🐄", "Sapi", ["hewan", "lokal"], { sound: "Muuuu. Muuuu.", soundText: "muuu", pitch: 0.4, clue: "Aku menghasilkan susu. Aku suka makan rumput." }),
  i("kambing", "🐐", "Kambing", ["hewan", "lokal"], { sound: "Mbeeek. Mbeeek.", soundText: "mbeeek", pitch: 1.3, clue: "Aku punya janggut kecil dan suka makan daun." }),
  i("ayam", "🐓", "Ayam", ["hewan", "lokal"], { sound: "Kukuruyuuuk.", soundText: "kukuruyuk", pitch: 1.9, clue: "Aku berbunyi di pagi hari. Aku punya jengger merah." }),
  i("bebek", "🦆", "Bebek", ["hewan", "lokal"], { sound: "Kwek kwek. Kwek kwek.", soundText: "kwek kwek", pitch: 1.5, clue: "Aku suka berenang di kolam. Kakiku berselaput." }),
  i("ikan", "🐟", "Ikan", ["hewan", "lokal"]),
  i("udang", "🦐", "Udang", ["hewan", "lokal"]),
  i("kepiting", "🦀", "Kepiting", ["hewan", "lokal"]),
  i("kupu", "🦋", "Kupu-kupu", ["hewan", "lokal"]),
  i("kuda", "🐎", "Kuda", ["hewan", "lokal"], { sound: "Ihihihihi.", soundText: "ihihihi", pitch: 0.8, clue: "Aku berlari kencang. Aku bisa ditunggangi." }),

  // ---- Buah & sayur ----
  i("apel", "🍎", "Apel", ["buah"]),
  i("pisang", "🍌", "Pisang", ["buah"]),
  i("anggur", "🍇", "Anggur", ["buah"]),
  i("jeruk", "🍊", "Jeruk", ["buah"]),
  i("stroberi", "🍓", "Stroberi", ["buah"]),
  i("semangka", "🍉", "Semangka", ["buah"]),
  i("nanas", "🍍", "Nanas", ["buah"]),
  i("mangga", "🥭", "Mangga", ["buah"]),
  i("ceri", "🍒", "Ceri", ["buah"]),
  i("persik", "🍑", "Persik", ["buah"]),
  i("pir", "🍐", "Pir", ["buah"]),
  i("lemon", "🍋", "Lemon", ["buah"]),
  i("kiwi", "🥝", "Kiwi", ["buah"]),
  i("melon", "🍈", "Melon", ["buah"]),
  i("kelapa", "🥥", "Kelapa", ["buah"]),
  i("tomat", "🍅", "Tomat", ["buah"]),
  i("alpukat", "🥑", "Alpukat", ["buah"]),
  i("wortel", "🥕", "Wortel", ["buah"]),
  i("jagung", "🌽", "Jagung", ["buah"]),

  // ---- Kendaraan ----
  i("mobil", "🚗", "Mobil", ["kendaraan"]),
  i("taksi", "🚕", "Taksi", ["kendaraan"]),
  i("bus", "🚌", "Bus", ["kendaraan"]),
  i("ambulans", "🚑", "Ambulans", ["kendaraan"]),
  i("pemadam", "🚒", "Pemadam", ["kendaraan"]),
  i("traktor", "🚜", "Traktor", ["kendaraan"]),
  i("motor", "🏍️", "Motor", ["kendaraan"]),
  i("sepeda", "🚲", "Sepeda", ["kendaraan"]),
  i("skuter", "🛵", "Skuter", ["kendaraan"]),
  i("kereta", "🚂", "Kereta", ["kendaraan"]),
  i("pesawat", "✈️", "Pesawat", ["kendaraan"]),
  i("helikopter", "🚁", "Helikopter", ["kendaraan"]),
  i("roket", "🚀", "Roket", ["kendaraan"]),
  i("kapal", "🚢", "Kapal", ["kendaraan"]),
  i("truk", "🚚", "Truk", ["kendaraan"]),
  i("otopet", "🛴", "Otopet", ["kendaraan"]),

  // ---- Benda sehari-hari ----
  i("rumah", "🏠", "Rumah", ["benda"]),
  i("matahari", "☀️", "Matahari", ["benda"]),
  i("bulan", "🌙", "Bulan", ["benda"]),
  i("bintang", "⭐", "Bintang", ["benda"]),
  i("buku", "📚", "Buku", ["benda"]),
  i("bola", "⚽", "Bola", ["benda"]),
  i("kursi", "🪑", "Kursi", ["benda"]),
  i("pohon", "🌳", "Pohon", ["benda"]),
  i("bunga", "🌸", "Bunga", ["benda"]),
  i("susu", "🥛", "Susu", ["benda"]),
  i("nasi", "🍚", "Nasi", ["benda"]),
  i("balon", "🎈", "Balon", ["benda"]),
  i("kado", "🎁", "Kado", ["benda"]),
  i("kunci", "🔑", "Kunci", ["benda"]),
  i("jam", "⏰", "Jam", ["benda"]),
  i("payung", "☂️", "Payung", ["benda"]),
  i("sepatu", "👟", "Sepatu", ["benda"]),
  i("topi", "🧢", "Topi", ["benda"]),
];

export interface CategoryInfo {
  id: CategoryId | "semua";
  name: string;
  emoji: string;
}

export const CATEGORY_INFO: CategoryInfo[] = [
  { id: "hewan", name: "Hewan", emoji: "🐘" },
  { id: "lokal", name: "Hewan Lokal", emoji: "🐅" },
  { id: "buah", name: "Buah", emoji: "🍎" },
  { id: "kendaraan", name: "Kendaraan", emoji: "🚗" },
  { id: "benda", name: "Benda", emoji: "🏠" },
  { id: "semua", name: "Campur", emoji: "🎲" },
];

/** Ambil semua item untuk satu kategori ("semua" = semuanya). */
export function itemsFor(category: string): ContentItem[] {
  if (category === "semua") return ITEMS;
  return ITEMS.filter((it) => (it.categories as string[]).includes(category));
}

export const ANIMALS = ITEMS.filter((it) => it.animal);

/** Nama untuk game huruf: hanya A–Z tanpa spasi/tanda. */
export const isSpellable = (it: ContentItem) => /^[A-Za-z]+$/.test(it.name);

export const numberWord = (n: number): string =>
  [
    "nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh",
    "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas", "tujuh belas",
    "delapan belas", "sembilan belas", "dua puluh",
  ][n] ?? String(n);
