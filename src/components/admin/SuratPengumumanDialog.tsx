"use client";

import { CheckCircle2, ExternalLink, FileText, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

interface PendaftarRingkas {
  id: string;
  nama_lengkap: string;
  nomor_pendaftaran: string;
}

interface PreviewData {
  nomor_surat: string;
  kelas_diterima: string;
  tanggal_terbit: string;
  pdf_base64: string;
  filename: string;
}

/**
 * Dialog "Terbitkan Surat Pengumuman Hasil":
 * 1. Preview PDF auto-generate (nomor surat otomatis, belum terkunci)
 * 2. Admin boleh koreksi tanggal / kelas / nomor surat, lalu regenerate
 * 3. Finalisasi = lock nomor + simpan PDF + status Diterima + kirim WA
 * Tab kedua: upload surat manual (fallback).
 */
export function SuratPengumumanDialog({
  pendaftar,
  onClose,
  onDone,
}: {
  pendaftar: PendaftarRingkas;
  onClose: () => void;
  onDone?: () => void;
}) {
  const [tab, setTab] = useState<"generate" | "upload">("generate");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [kirimWa, setKirimWa] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  // field editable
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [kelas, setKelas] = useState("kelas VII MTs Putra");
  const [nomorSurat, setNomorSurat] = useState("");

  // upload manual
  const [file, setFile] = useState<File | null>(null);
  const [nomorManual, setNomorManual] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadPreview() {
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/admin/surat-pengumuman/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: pendaftar.id,
          tanggal_terbit: new Date(tanggal + "T00:00:00+07:00").toISOString(),
          kelas_diterima: kelas,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal generate preview");
      setPreview(json);
      setNomorSurat(json.nomor_surat);
      setShowEdit(false);
    } catch (e: any) {
      Swal.fire("Gagal", e.message, "error");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function finalize() {
    if (!preview) return;
    const konfirm = await Swal.fire({
      title: "Finalisasi surat?",
      html: `Nomor <b>${nomorSurat}</b> akan <b>terkunci</b>, status pendaftar menjadi <b>Diterima</b>${
        kirimWa ? ", dan surat terkirim ke WhatsApp pendaftar" : ""
      }.<br/><br/>Surat yang sudah final tidak dapat diedit — kesalahan ditangani dengan terbitan ulang bernomor baru.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Finalisasi",
      cancelButtonText: "Batal",
      confirmButtonColor: "#1e5c46",
    });
    if (!konfirm.isConfirmed) return;

    setFinalizing(true);
    try {
      const res = await fetch("/api/admin/surat-pengumuman/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: pendaftar.id,
          nomor_surat: nomorSurat,
          tanggal_terbit: new Date(tanggal + "T00:00:00+07:00").toISOString(),
          kelas_diterima: kelas,
          kirim_wa: kirimWa,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal finalisasi");
      await Swal.fire(
        "Terbit!",
        `Surat ${nomorSurat} final${json.data?.wa_sent ? " & terkirim ke WhatsApp" : " (pengiriman WA gagal — kirim manual bila perlu)"}.`,
        "success"
      );
      onDone?.();
      onClose();
    } catch (e: any) {
      Swal.fire("Gagal", e.message, "error");
    } finally {
      setFinalizing(false);
    }
  }

  async function uploadManual() {
    if (!file || !nomorManual.trim()) {
      Swal.fire("Lengkapi dulu", "File surat dan nomor surat wajib diisi.", "info");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("pendaftar_id", pendaftar.id);
      fd.append("nomor_surat", nomorManual.trim());
      fd.append("kirim_wa", String(kirimWa));
      fd.append("file", file);
      const res = await fetch("/api/admin/surat-pengumuman/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal upload");
      await Swal.fire(
        "Tersimpan",
        `Surat manual terpasang untuk ${pendaftar.nama_lengkap}${json.data?.wa_sent ? " & terkirim ke WhatsApp" : ""}.`,
        "success"
      );
      onDone?.();
      onClose();
    } catch (e: any) {
      Swal.fire("Gagal", e.message, "error");
    } finally {
      setUploading(false);
    }
  }

  const pdfUrl = preview ? `data:application/pdf;base64,${preview.pdf_base64}` : null;

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      data-modal="true"
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-start md:items-center pt-8 md:pt-0 pb-16 md:pb-0 justify-center bg-black/50 p-4 overflow-y-auto overscroll-contain custom-scrollbar backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border-2 border-stone-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Surat Pengumuman Hasil</h3>
            <p className="text-sm text-stone-500 mt-0.5">
              {pendaftar.nama_lengkap} · {pendaftar.nomor_pendaftaran}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 border-b border-stone-100">
          <button
            onClick={() => setTab("generate")}
            className={`px-4 py-2 text-sm font-bold rounded-t-xl transition-colors ${
              tab === "generate"
                ? "bg-primary-50 text-primary-800 border-b-2 border-primary-700"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1.5" />
            Generate Otomatis
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`px-4 py-2 text-sm font-bold rounded-t-xl transition-colors ${
              tab === "upload"
                ? "bg-primary-50 text-primary-800 border-b-2 border-primary-700"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Upload className="w-4 h-4 inline mr-1.5" />
            Upload Manual
          </button>
        </div>

        <div className="p-5">
          {tab === "generate" ? (
            <div className="space-y-4">
              {!preview ? (
                <div className="text-center py-10">
                  <FileText className="w-12 h-12 mx-auto text-stone-300 mb-3" />
                  <p className="text-sm text-stone-500 mb-4 max-w-md mx-auto">
                    Sistem akan membuat surat otomatis dari data pendaftar dengan nomor urut
                    berikutnya (AA → AZ → BA ...). Nomor baru terkunci saat finalisasi.
                  </p>
                  <button
                    onClick={loadPreview}
                    disabled={loadingPreview}
                    className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-black uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {loadingPreview ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    Buat Preview Surat
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Ringkasan field */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-stone-50 rounded-xl p-3">
                      <div className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">
                        Nomor Surat
                      </div>
                      <div className="font-bold text-stone-800">{nomorSurat}</div>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3">
                      <div className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">
                        Tanggal Terbit
                      </div>
                      <div className="font-bold text-stone-800">{tanggal}</div>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3">
                      <div className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">
                        Kelas Diterima
                      </div>
                      <div className="font-bold text-stone-800">{kelas}</div>
                    </div>
                  </div>

                  {/* Preview PDF */}
                  <iframe
                    src={pdfUrl || undefined}
                    title="Preview Surat"
                    className="w-full h-[55vh] border border-stone-200 rounded-xl"
                  />

                  {/* Editor (muncul saat koreksi) */}
                  {showEdit && (
                    <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 space-y-3">
                      <div className="text-sm font-black uppercase tracking-wider text-gold-800">
                        Koreksi Sebelum Finalisasi
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className="text-xs font-bold text-stone-600">
                          Tanggal Terbit
                          <input
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-normal"
                          />
                        </label>
                        <label className="text-xs font-bold text-stone-600">
                          Kelas Diterima
                          <input
                            value={kelas}
                            onChange={(e) => setKelas(e.target.value)}
                            className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-normal"
                          />
                        </label>
                        <label className="text-xs font-bold text-stone-600">
                          Nomor Surat
                          <input
                            value={nomorSurat}
                            onChange={(e) => setNomorSurat(e.target.value)}
                            className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-normal"
                          />
                        </label>
                      </div>
                      <button
                        onClick={loadPreview}
                        disabled={loadingPreview}
                        className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {loadingPreview ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        Regenerate Preview
                      </button>
                    </div>
                  )}

                  {/* Aksi */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kirimWa}
                        onChange={(e) => setKirimWa(e.target.checked)}
                        className="w-4 h-4 accent-primary-700"
                      />
                      Kirim surat ke WhatsApp pendaftar
                    </label>
                    <div className="flex gap-2">
                      {!showEdit && (
                        <button
                          onClick={() => setShowEdit(true)}
                          className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Koreksi
                        </button>
                      )}
                      <button
                        onClick={finalize}
                        disabled={finalizing}
                        className="px-5 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {finalizing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Finalisasi &amp; Kirim
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Nama &amp; nomor pendaftaran diambil dari data sistem (tidak dapat diubah di
                    surat). Setelah final, surat tampil di dashboard pendaftar.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* TAB UPLOAD MANUAL */
            <div className="space-y-4">
              <div className="text-sm text-stone-500">
                Untuk surat yang dibuat manual di luar sistem. Pastikan nomor surat belum dipakai
                pendaftar lain.
              </div>
              <label className="text-xs font-bold text-stone-600 block">
                Nomor Surat (lengkap, contoh: 012-AA/PSB-PUAS/X/2026)
                <input
                  value={nomorManual}
                  onChange={(e) => setNomorManual(e.target.value)}
                  placeholder="012-AA/PSB-PUAS/X/2026"
                  className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="text-xs font-bold text-stone-600 block">
                File Surat (PDF / JPG / PNG)
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kirimWa}
                  onChange={(e) => setKirimWa(e.target.checked)}
                  className="w-4 h-4 accent-primary-700"
                />
                Kirim surat ke WhatsApp pendaftar
              </label>
              <button
                onClick={uploadManual}
                disabled={uploading}
                className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-black uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload &amp; Publikasikan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
