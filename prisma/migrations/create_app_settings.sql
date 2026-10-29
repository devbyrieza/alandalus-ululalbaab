-- Tabel key-value untuk konfigurasi aplikasi SPMB.
-- Dipakai antara lain untuk menyimpan nomor WhatsApp penerima
-- digest jadwal seleksi harian (key: daily_jadwal_recipient)
-- dan penanda terakhir kirim (key: daily_jadwal_last_sent).
CREATE TABLE IF NOT EXISTS app_settings (
  key        VARCHAR(255) PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);
