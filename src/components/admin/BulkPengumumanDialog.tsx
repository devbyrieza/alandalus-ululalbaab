"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FileText,
  FileUp,
  HelpCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

interface CandidateItem {
  id: string;
  nama_lengkap: string;
  nomor_pendaftaran: string;
  jenjang?: string;
  kelas_diterima?: string;
}

export function BulkPengumumanDialog({
  candidates,
  onClose,
  onSuccess,
}: {
  candidates: CandidateItem[];
  onClose: () => void;
  onSuccess: (updatedIds: string[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"generate" | "upload">("generate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kirimWa, setKirimWa] = useState(true);

  // Tab 1: Generate state
  const [tanggalTerbit, setTanggalTerbit] = useState(() => new Date().toISOString().slice(0, 10));
  const [candidateClasses, setCandidateClasses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    candidates.forEach((c) => {
      const j = (c.jenjang || "").toUpperCase();
      if (j.includes("IL")) map[c.id] = "IL Putra";
      else if (j.includes("SMA") || j.includes("MA")) map[c.id] = "X SMA Putra";
      else map[c.id] = "VII MTs Putra";
    });
    return map;
  });

  // Tab 2: Multi-Upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileMappings, setFileMappings] = useState<Record<string, string>>({}); // candidateId -> filename

  // Body Scroll Lock (Mandatory UX Rule)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "unset";
    };
  }, []);

  // Smart Matching algorithm whenever uploadedFiles changes
  useEffect(() => {
    if (uploadedFiles.length === 0) {
      setFileMappings({});
      return;
    }

    const newMappings: Record<string, string> = {};

    candidates.forEach((c) => {
      const cleanReg = c.nomor_pendaftaran.replace(/\W/g, "").toLowerCase();
      const nameParts = c.nama_lengkap
        .toLowerCase()
        .split(/\s+/)
        .filter((p) => p.length > 2);

      // Search match in uploaded files
      const match = uploadedFiles.find((f) => {
        const fn = f.name.toLowerCase();
        // 1. Direct match with registration number
        if (cleanReg && fn.includes(cleanReg)) return true;
        // 2. Full name or first 2 words
        if (nameParts.length >= 2 && fn.includes(nameParts[0]) && fn.includes(nameParts[1])) {
          return true;
        }
        // 3. Exact full name substring
        if (fn.includes(c.nama_lengkap.trim().toLowerCase())) return true;
        return false;
      });

      if (match) {
        newMappings[c.id] = match.name;
      }
    });

    setFileMappings(newMappings);
  }, [uploadedFiles, candidates]);

  const handleFilesDropped = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter((f) =>
        f.name.toLowerCase().endsWith(".pdf")
      );
      setUploadedFiles((prev) => {
        // Merge without duplicate names
        const existingNames = new Set(prev.map((f) => f.name));
        const additions = filesArray.filter((f) => !existingNames.has(f.name));
        return [...prev, ...additions];
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.toLowerCase().endsWith(".pdf")
      );
      setUploadedFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const additions = filesArray.filter((f) => !existingNames.has(f.name));
        return [...prev, ...additions];
      });
    }
  };

  // Submit Tab 1: Auto Generate
  const handleSubmitGenerate = async () => {
    const confirm = await Swal.fire({
      title: "Generate Surat Massal?",
      html: `<p>Sistem akan otomatis membuat <b>${candidates.length} Surat Keputusan Resmi (PDF)</b> dengan penomoran urut resmi dan mengirimkan notifikasi WhatsApp.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Terbitkan Semua!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#059669",
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/surat-pengumuman/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: candidates.map((c) => ({
            pendaftarId: c.id,
            kelasDiterima: candidateClasses[c.id],
          })),
          tanggalTerbit,
          kirimWa,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menerbitkan surat massal.");

      await Swal.fire({
        title: "Berhasil Diterbitkan!",
        text: `${json.count} surat keputusan telah berhasil dibuat dan notifikasi dikirimkan.`,
        icon: "success",
        confirmButtonColor: "#059669",
      });

      onSuccess(candidates.map((c) => c.id));
    } catch (err: any) {
      Swal.fire({
        title: "Terjadi Kendala",
        text: err.message,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Tab 2: Bulk Upload
  const handleSubmitUpload = async () => {
    const matchedCount = Object.keys(fileMappings).length;
    if (matchedCount === 0) {
      Swal.fire({
        title: "Belum Ada File Cocok",
        text: "Silakan unggah file PDF yang sesuai dengan nama/nomor pendaftaran santri.",
        icon: "warning",
      });
      return;
    }

    if (matchedCount < candidates.length) {
      const confirm = await Swal.fire({
        title: "Sebagian Santri Belum Ada File",
        text: `Baru ${matchedCount} dari ${candidates.length} santri yang memiliki file PDF cocok. Lanjutkan memproses santri yang sudah memiliki file?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Proses yang Cocok",
        cancelButtonText: "Periksa Lagi",
        confirmButtonColor: "#059669",
      });
      if (!confirm.isConfirmed) return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      uploadedFiles.forEach((file) => formData.append("files", file));

      const mappingsPayload = Object.entries(fileMappings).map(([pId, fn]) => ({
        pendaftarId: pId,
        filename: fn,
        kelasDiterima: candidateClasses[pId],
      }));

      formData.append("mappings", JSON.stringify(mappingsPayload));
      formData.append("kirim_wa", kirimWa ? "true" : "false");

      const res = await fetch("/api/admin/surat-pengumuman/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal upload massal.");

      await Swal.fire({
        title: "Berhasil Diproses!",
        text: `${json.count} file surat berhasil diunggah dan status santri ditetapkan Diterima.`,
        icon: "success",
        confirmButtonColor: "#059669",
      });

      onSuccess(mappingsPayload.map((m) => m.pendaftarId));
    } catch (err: any) {
      Swal.fire({
        title: "Gagal Mengunggah",
        text: err.message,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchedCount = useMemo(() => Object.keys(fileMappings).length, [fileMappings]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Pengumuman Massal Santri Diterima
              </h2>
              <p className="text-xs text-stone-500">
                Menerbitkan keputusan kelulusan untuk <b>{candidates.length} santri terpilih</b>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-100/50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("generate")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
              activeTab === "generate"
                ? "bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            1. Auto-Generate Sistem (Rekomendasi)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
              activeTab === "upload"
                ? "bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-sm"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            2. Smart Multi-Upload (Banyak File PDF)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[calc(85vh-180px)] overflow-y-auto overscroll-contain custom-scrollbar">
          {activeTab === "generate" && (
            <div className="space-y-5">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Pembuatan Otomatis Sekali Klik</p>
                  <p className="mt-0.5 text-emerald-700">
                    Sistem akan otomatis memberikan nomor surat resmi berikutnya secara berurutan,
                    meng-generate dokumen PDF resmi lengkap dengan kop & tanda tangan, memasangnya
                    di dashboard santri, serta mengirimkan pesan WhatsApp ke masing-masing nomor
                    wali.
                  </p>
                </div>
              </div>

              {/* Tanggal Terbit Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tanggal Terbit Surat
                  </label>
                  <input
                    type="date"
                    value={tanggalTerbit}
                    onChange={(e) => setTanggalTerbit(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={kirimWa}
                      onChange={(e) => setKirimWa(e.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Kirim notifikasi WhatsApp resmi ke seluruh wali santri
                  </label>
                </div>
              </div>

              {/* List of Candidates */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Daftar Santri Terpilih ({candidates.length} Santri)
                </label>
                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 max-h-64 overflow-y-auto custom-scrollbar">
                  {candidates.map((c, idx) => {
                    const isSmaCandidate =
                      c.nomor_pendaftaran.startsWith("SMA") ||
                      (c.jenjang || "").toUpperCase().includes("SMA") ||
                      (c.jenjang || "").toUpperCase().includes("MA");
                    const isIL = (candidateClasses[c.id] || "").toUpperCase().includes("IL");

                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 text-xs gap-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-stone-400 w-5 shrink-0">{idx + 1}.</span>
                          <div className="truncate">
                            <p className="font-bold text-stone-900 truncate">{c.nama_lengkap}</p>
                            <p className="text-stone-500 font-mono text-[11px]">
                              {c.nomor_pendaftaran}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSmaCandidate ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setCandidateClasses((prev) => ({
                                    ...prev,
                                    [c.id]: "X SMA Putra",
                                  }))
                                }
                                className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${
                                  !isIL
                                    ? "bg-primary-600 text-white shadow-xs"
                                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                }`}
                              >
                                SMA
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setCandidateClasses((prev) => ({ ...prev, [c.id]: "IL Putra" }))
                                }
                                className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${
                                  isIL
                                    ? "bg-amber-600 text-white shadow-xs"
                                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                }`}
                              >
                                IL (Alih)
                              </button>
                            </>
                          ) : (
                            <span className="text-stone-400 text-[11px]">Kelas:</span>
                          )}
                          <input
                            type="text"
                            value={candidateClasses[c.id] || "VII MTs Putra"}
                            onChange={(e) =>
                              setCandidateClasses((prev) => ({ ...prev, [c.id]: e.target.value }))
                            }
                            className="rounded-lg border border-stone-200 px-2 py-1 text-xs font-semibold text-stone-800 focus:border-emerald-500 focus:outline-none w-28 text-center"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-5">
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-blue-900 text-xs flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Smart Multi-File Matching</p>
                  <p className="mt-0.5 text-blue-700">
                    Tarik dan lepaskan seluruh file PDF surat keputusan sekaligus. Sistem akan
                    mencocokkan setiap file secara cerdas berdasarkan <b>Nomor Pendaftaran</b> atau{" "}
                    <b>Nama Santri</b> di dalam nama file.
                  </p>
                </div>
              </div>

              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/20 transition cursor-pointer"
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFilesDropped}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center">
                  <UploadCloud className="h-10 w-10 text-stone-400 mb-2" />
                  <p className="text-sm font-semibold text-stone-800">
                    Klik atau Tarik & Lepas Banyak File PDF ke Sini
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    Bisa memilih banyak file PDF sekaligus (Format .pdf)
                  </p>
                  {uploadedFiles.length > 0 && (
                    <span className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {uploadedFiles.length} file PDF terunggah
                    </span>
                  )}
                </div>
              </div>

              {/* Matching Status */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-700">
                    Status Pencocokan File ({matchedCount}/{candidates.length} Cocok)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={kirimWa}
                      onChange={(e) => setKirimWa(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Kirim notifikasi WhatsApp
                  </label>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 max-h-64 overflow-y-auto custom-scrollbar">
                  {candidates.map((c, idx) => {
                    const matchedFileName = fileMappings[c.id];
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-stone-400 w-5">{idx + 1}.</span>
                          <div>
                            <p className="font-bold text-stone-900">{c.nama_lengkap}</p>
                            <p className="text-stone-500 font-mono">{c.nomor_pendaftaran}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {matchedFileName ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="max-w-[200px] truncate">{matchedFileName}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                              Belum ada file
                            </span>
                          )}

                          {/* Manual override selector */}
                          {uploadedFiles.length > 0 && (
                            <select
                              value={matchedFileName || ""}
                              onChange={(e) =>
                                setFileMappings((prev) => ({ ...prev, [c.id]: e.target.value }))
                              }
                              className="rounded-lg border border-stone-200 px-2 py-1 text-xs text-stone-700 bg-white focus:border-emerald-500 focus:outline-none max-w-[160px]"
                            >
                              <option value="">-- Pilih File --</option>
                              {uploadedFiles.map((f) => (
                                <option key={f.name} value={f.name}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-200 bg-stone-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
          >
            Batal
          </button>

          {activeTab === "generate" ? (
            <button
              type="button"
              onClick={handleSubmitGenerate}
              disabled={isSubmitting || candidates.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menerbitkan Surat...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Terbitkan & Generate Semua ({candidates.length})
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitUpload}
              disabled={isSubmitting || matchedCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengunggah File...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Upload & Terbitkan Semua ({matchedCount}/{candidates.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
