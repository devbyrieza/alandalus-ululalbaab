import type { KepribadianQuestion, KepribadianSection } from "./types";

export const KEPRIBADIAN_SECTIONS: KepribadianSection[] = [
  {
    section: "Kelompok 1 — Amanah dan Kejujuran",
    items: [
      { id: 1, text: "Saya mengembalikan barang yang saya pinjam tepat waktu dan dalam keadaan baik.", group: "Amanah", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false, optionA: "Saya mengembalikan barang tepat waktu", optionB: "Saya menjaga barang pinjaman" },
      { id: 2, text: "Bila saya menemukan uang atau barang milik orang lain, saya menyerahkannya kepada pemiliknya atau guru.", group: "Amanah", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false, optionA: "Saya serahkan ke guru", optionB: "Saya cari pemiliknya" },
      { id: 3, text: "Bila ujian terasa sulit dan tidak ada yang mengawasi, saya tergoda untuk menyontek.", group: "Amanah", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 4, text: "Saya berani mengaku bila saya yang berbuat salah, walaupun orang lain tidak mengetahuinya.", group: "Amanah", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 5, text: "Menurut saya, berbohong sedikit itu wajar bila bisa menghindarkan saya dari hukuman.", group: "Amanah", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 6, text: "Saya menjaga rahasia yang dipercayakan teman kepada saya.", group: "Amanah", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false }
    ]
  },
  {
    section: "Kelompok 2 — Pengendalian Emosi",
    items: [
      { id: 7, text: "Saat sedang marah, saya bisa menenangkan diri dulu sebelum berbicara atau bertindak.", group: "Pengendalian Emosi", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 8, text: "Saya mudah marah bila ada orang yang pendapatnya berbeda dengan saya.", group: "Pengendalian Emosi", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 9, text: "Bila merasa kesal kepada seseorang, saya memilih menjauh sebentar daripada melampiaskannya.", group: "Pengendalian Emosi", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 10, text: "Saat marah, saya sulit menahan diri untuk tidak memukul, membanting barang, atau berkata kasar.", group: "Pengendalian Emosi", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 11, text: "Saya bisa menerima nasihat atau teguran tanpa menyimpan dendam.", group: "Pengendalian Emosi", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 12, text: "Setelah merasa kecewa atau sedih, saya bisa kembali tenang dalam waktu yang tidak terlalu lama.", group: "Pengendalian Emosi", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false }
    ]
  },
  {
    section: "Kelompok 3 — Empati dan Kepedulian",
    items: [
      { id: 13, text: "Bila melihat teman sedang sedih atau kesusahan, saya ingin membantunya.", group: "Empati", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 14, text: "Saya merasa lucu bila ada teman yang dipermalukan atau diejek.", group: "Empati", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 15, text: "Saya mau berbagi makanan atau barang dengan teman yang membutuhkan.", group: "Empati", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 16, text: "Saya menyapa dan berbicara dengan sopan kepada orang yang lebih tua.", group: "Empati", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 17, text: "Saya tidak peduli dengan masalah teman selama masalah itu tidak merugikan saya.", group: "Empati", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 18, text: "Saya berani membela teman yang diperlakukan tidak adil, dengan cara yang baik.", group: "Empati", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false }
    ]
  },
  {
    section: "Kelompok 4 — Kerja Sama dan Pergaulan",
    items: [
      { id: 19, text: "Saya mudah berkenalan dan berteman dengan orang baru.", group: "Kerja Sama", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 20, text: "Dalam kerja kelompok, saya mau menerima pendapat teman walaupun berbeda dengan pendapat saya.", group: "Kerja Sama", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 21, text: "Saya lebih suka mengerjakan tugas kelompok sendirian karena teman-teman sering menghambat.", group: "Kerja Sama", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 22, text: "Saya bisa rukun dengan teman yang sifatnya sangat berbeda dari saya.", group: "Kerja Sama", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 23, text: "Saya sering merasa tidak cocok dan sulit akrab dengan teman-teman di sekitar saya.", group: "Kerja Sama", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 24, text: "Saya mau mengalah demi kepentingan bersama.", group: "Kerja Sama", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false }
    ]
  },
  {
    section: "Kelompok 5 — Tanggung Jawab dan Ketekunan",
    items: [
      { id: 25, text: "Saya menyelesaikan tugas atau PR sampai tuntas, walaupun terasa sulit.", group: "Tanggung Jawab", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 26, text: "Saya sering menunda pekerjaan sampai mendekati batas waktu.", group: "Tanggung Jawab", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 27, text: "Bila mendapat tugas piket atau jadwal kebersihan, saya mengerjakannya tanpa perlu diingatkan.", group: "Tanggung Jawab", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 28, text: "Saya sering lupa atau lalai pada tugas yang sudah menjadi tanggung jawab saya.", group: "Tanggung Jawab", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 29, text: "Saya datang tepat waktu ke sekolah, pengajian, atau kegiatan lain.", group: "Tanggung Jawab", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 30, text: "Saya membuat jadwal atau target kecil agar tugas saya selesai tepat waktu.", group: "Tanggung Jawab", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false }
    ]
  },
  {
    section: "Kelompok 6 — Percaya Diri dan Ketahanan",
    items: [
      { id: 31, text: "Saya berani bertanya atau menyampaikan pendapat di depan teman-teman.", group: "Ketahanan", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 32, text: "Saya takut mencoba hal baru karena khawatir salah atau ditertawakan.", group: "Ketahanan", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 33, text: "Bila gagal, saya mencoba lagi dengan cara yang berbeda.", group: "Ketahanan", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 34, text: "Saya bisa menerima kekalahan dalam lomba atau permainan dengan lapang dada.", group: "Ketahanan", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false },
      { id: 35, text: "Saya sering merasa kurang mampu dibandingkan teman-teman saya.", group: "Ketahanan", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: true },
      { id: 36, text: "Saya tetap melakukan hal yang benar walaupun tidak ada teman yang melakukannya.", group: "Ketahanan", labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", isReverse: false }
    ]
  },
  {
    section: "Kelompok 7 — Pernyataan Validasi Respon",
    items: [
      { id: 37, text: "Saya tidak pernah marah sekalipun dalam hidup saya.", group: "Kontrol", isControl: true, labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", optionA: "Tidak pernah marah", optionB: "Kadang bisa marah" },
      { id: 38, text: "Saya selalu berkata jujur dalam keadaan apa pun, tanpa pernah ada pengecualian.", group: "Kontrol", isControl: true, labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", optionA: "Selalu jujur 100%", optionB: "Berusaha jujur" },
      { id: 39, text: "Saya selalu senang membantu siapa saja, bahkan ketika sedang sangat lelah.", group: "Kontrol", isControl: true, labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", optionA: "Selalu senang membantu", optionB: "Membantu saat mampu" },
      { id: 40, text: "Saya tidak pernah melakukan kesalahan sedikit pun.", group: "Kontrol", isControl: true, labelMin: "Sangat Tidak Setuju", labelMax: "Sangat Setuju", optionA: "Tidak pernah salah", optionB: "Pernah salah" }
    ]
  }
];

export const KEPRIBADIAN_QUESTIONS: KepribadianQuestion[] = KEPRIBADIAN_SECTIONS.flatMap(s => s.items);
