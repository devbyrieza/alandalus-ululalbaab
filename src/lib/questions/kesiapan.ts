import type { KesiapanSection } from "./types";

export const KESIAPAN_QUESTIONS: KesiapanSection[] = [
  {
    section: "Kelompok 1 — Ketaatan dan Disiplin",
    items: [
      {
        id: 1,
        text: "Saya melaksanakan perintah orang tua dan guru dengan segera, walaupun sedang asyik melakukan hal lain.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 2,
        text: "Saya menganggap aturan pesantren dan asrama penting untuk dipatuhi, walaupun tidak ada yang mengawasi.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 3,
        text: "Saya sering mencari cara agar bisa lolos dari aturan yang menurut saya merepotkan.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: true
      },
      {
        id: 4,
        text: "Jika saya melanggar aturan, saya siap menerima sanksinya dan memperbaiki diri.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 5,
        text: "Saya sulit bangun pagi untuk salat Subuh bila tidak dibangunkan orang lain.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: true
      }
    ]
  },
  {
    section: "Kelompok 2 — Motivasi Belajar",
    items: [
      {
        id: 6,
        text: "Keinginan masuk pesantren ini datang dari diri saya sendiri, bukan hanya karena disuruh.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 7,
        text: "Saya sudah paham bahwa belajar di pesantren berarti belajar agama sekaligus pelajaran umum, dan saya mau menjalaninya.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 8,
        text: "Ada seseorang (orang tua, guru, atau tokoh) yang membuat saya bersemangat untuk belajar.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 9,
        text: "Saya tetap berusaha belajar walaupun sedang lelah, jenuh, atau rindu rumah.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 10,
        text: "Saya ingin pindah sekolah bila merasa pelajaran di pesantren terlalu berat.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: true
      }
    ]
  },
  {
    section: "Kelompok 3 — Kemandirian dan Daya Tahan",
    items: [
      {
        id: 11,
        text: "Saya siap tinggal jauh dari orang tua di asrama.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 12,
        text: "Saya bisa mencuci pakaian, merapikan tempat tidur, dan mengatur barang-barang saya sendiri.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 13,
        text: "Saya mudah panik atau menangis bila menghadapi masalah tanpa ada orang tua di dekat saya.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: true
      },
      {
        id: 14,
        text: "Bila saya sakit atau punya masalah di asrama, saya berani melapor kepada ustadz, ustadzah, atau musyrif.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 15,
        text: "Bila uang jajan saya menipis, saya bisa menahan diri dan mengatur pengeluaran.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      }
    ]
  },
  {
    section: "Kelompok 4 — Gawai, Pergaulan, dan Pengendalian Diri",
    items: [
      {
        id: 16,
        text: "Saya bisa belajar tanpa terus-menerus memegang HP atau bermain game.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 17,
        text: "Saya gelisah atau mudah marah bila beberapa hari tidak boleh memegang HP atau bermain game online.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: true
      },
      {
        id: 18,
        text: "Saya mampu menolak ajakan teman untuk melakukan hal yang dilarang, seperti merokok atau vape.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 19,
        text: "Saya bisa menahan diri dan tidak membalas dengan kasar ketika diejek atau dijahili teman.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      },
      {
        id: 20,
        text: "Saya mau meminta maaf lebih dulu bila bertengkar dengan teman.",
        labelMin: "Sangat Tidak Setuju",
        labelMax: "Sangat Setuju",
        isReverse: false
      }
    ]
  }
];
