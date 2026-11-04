/**
 * Kalimat pendek untuk game "Baca Kalimat". Kosakata umum, baku, ramah anak.
 * scene: emoji adegan, UNIK di seluruh daftar (tidak ada emoji yang dipakai dua kalimat).
 */

export interface Sentence {
  id: string;
  /** kalimat lengkap dengan huruf awal kapital dan tanda baca */
  text: string;
  /** kata-kata tanpa tanda baca, sama urutannya dengan text */
  words: string[];
  scene: string;
  /** kata inti yang cocok dikosongkan pada soal isian */
  keyWord: string;
  /** 1: 2–3 kata, 2: 4 kata, 3: 5 kata */
  level: 1 | 2 | 3;
}

const s = (id: string, text: string, scene: string, keyWord: string): Sentence => {
  const words = text.replace(/[.!?,]/g, "").split(" ");
  const level = words.length <= 3 ? 1 : words.length === 4 ? 2 : 3;
  return { id, text, words, scene, keyWord, level };
};

export const SENTENCES: Sentence[] = [
  // 2–3 kata
  s("ini-bola", "Ini bola.", "⚽", "bola"),
  s("ini-buku", "Ini buku.", "📚", "buku"),
  s("itu-ayam", "Itu ayam.", "🐔", "ayam"),
  s("ini-rumah", "Ini rumah.", "🏠", "rumah"),
  s("itu-bunga", "Itu bunga.", "🌸", "bunga"),
  s("aku-apel", "Aku suka apel.", "🍎", "apel"),
  s("aku-roti", "Aku makan roti.", "🍞", "roti"),
  s("ayah-motor", "Ayah naik motor.", "🏍️", "motor"),
  s("adik-susu", "Adik minum susu.", "🥛", "susu"),
  s("ibu-nasi", "Ibu memasak nasi.", "🍚", "nasi"),
  s("kucing-tidur", "Kucing suka tidur.", "🐱💤", "kucing"),
  s("bulan", "Bulan bersinar.", "🌙", "bulan"),
  s("hujan", "Hujan turun.", "🌧️", "hujan"),
  s("bebek", "Bebek berenang.", "🦆", "bebek"),
  s("matahari", "Matahari bersinar terang.", "☀️", "matahari"),
  s("gigi", "Aku menyikat gigi.", "🪥", "gigi"),
  s("payung", "Aku membawa payung.", "☂️", "payung"),
  s("pesawat", "Pesawat terbang tinggi.", "✈️", "pesawat"),
  s("monyet", "Monyet makan pisang.", "🐵🍌", "monyet"),
  // 4 kata
  s("topi", "Kakak memakai topi merah.", "🧢", "topi"),
  s("taman", "Adik bermain di taman.", "🛝", "taman"),
  s("mobil", "Ayah mencuci mobil biru.", "🚗", "mobil"),
  s("mangga", "Ibu memotong buah mangga.", "🥭", "mangga"),
  s("air", "Kami minum air putih.", "💧", "air"),
  s("telur", "Ayam bertelur di kandang.", "🥚", "bertelur"),
  s("burung", "Burung hinggap di pohon.", "🐦🌳", "burung"),
  s("koran", "Ayah membaca koran pagi.", "📰", "koran"),
  s("boneka", "Adik memeluk boneka beruang.", "🧸", "boneka"),
  s("sepeda", "Kakak naik sepeda baru.", "🚲", "sepeda"),
  s("tangan", "Cuci tangan sebelum makan.", "🧼", "tangan"),
  s("sepatu", "Aku pakai sepatu baru.", "👟", "sepatu"),
  s("kapal", "Kapal berlayar di laut.", "🚢", "kapal"),
  s("kereta", "Kereta api berjalan cepat.", "🚂", "kereta"),
  s("ikan", "Ikan berenang di kolam.", "🐟", "ikan"),
  // 5 kata
  s("pasar", "Ibu pergi ke pasar pagi.", "🛒", "pasar"),
  s("kerja", "Ayah dan ibu pergi kerja.", "💼", "kerja"),
  s("sekolah", "Kami belajar membaca di sekolah.", "🏫", "sekolah"),
  s("pantai", "Adik bermain pasir di pantai.", "🏖️", "pantai"),
  s("papan", "Bu guru menulis di papan.", "✏️", "papan"),
  s("sawah", "Nenek menanam padi di sawah.", "🌾", "sawah"),
  s("sungai", "Kakek memancing ikan di sungai.", "🎣", "sungai"),
  s("bintang", "Bintang bersinar di langit malam.", "⭐", "bintang"),
  s("meja", "Kami makan bersama di meja.", "🍽️", "meja"),
  s("badut", "Adik senang melihat badut lucu.", "🤡", "badut"),
  s("baju", "Ibu menjemur baju di halaman.", "👕", "baju"),
  s("semut", "Semut membawa makanan ke sarang.", "🐜", "semut"),
  s("lebah", "Lebah terbang mencari madu manis.", "🐝🍯", "lebah"),
];
