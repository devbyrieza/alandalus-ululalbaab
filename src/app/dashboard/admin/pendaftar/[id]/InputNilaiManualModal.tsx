"use client";

import { useState } from "react";
import { X, Save, Calculator, Loader2 } from "lucide-react";

interface InputNilaiManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendaftarId: string;
  onSuccess: () => void;
}

export default function InputNilaiManualModal({
  isOpen,
  onClose,
  pendaftarId,
  onSuccess,
}: InputNilaiManualModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    score_akademik: "",
    score_quran: "",
    score_wawancara_santri: "",
    score_wawancara_ortu: "",
    score_kepribadian: "",
    score_kesiapan: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/nilai/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_id: pendaftarId,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan nilai");
      }

      onSuccess();
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-950/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-ink-100 flex items-center justify-between bg-primary-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-700 shadow-sm border border-primary-100">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary-950 tracking-tight italic">
                INPUT NILAI MANUAL
              </h2>
              <p className="text-sm font-bold text-ink-500">
                Fitur khusus Admin Super (By-pass Nilai)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto no-scrollbar">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-sm font-bold">
              {errorMsg}
            </div>
          )}

          <form id="form-input-manual" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Akademik */}
              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                  Skor Akademik / Tertulis (0-100)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="score_akademik"
                  value={formData.score_akademik}
                  onChange={handleChange}
                  className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Misal: 85.5"
                  required
                />
              </div>

              {/* Al-Quran */}
              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                  Skor Al-Qur'an (0-100)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="score_quran"
                  value={formData.score_quran}
                  onChange={handleChange}
                  className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Misal: 90"
                  required
                />
              </div>

              {/* Wawancara Santri */}
              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                  Nilai Wawancara Santri (Skala 1-5)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  name="score_wawancara_santri"
                  value={formData.score_wawancara_santri}
                  onChange={handleChange}
                  className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Misal: 4.5"
                  required
                />
                <p className="text-[10px] text-ink-400">Sistem akan otomatis mengubahnya ke skala 100.</p>
              </div>

              {/* Wawancara Orang Tua */}
              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                  Skor Wawancara Ortu (0-100)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="score_wawancara_ortu"
                  value={formData.score_wawancara_ortu}
                  onChange={handleChange}
                  className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Misal: 95"
                  required
                />
              </div>

              {/* Kepribadian */}
              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                  Skor Kepribadian (0-100)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="score_kepribadian"
                  value={formData.score_kepribadian}
                  onChange={handleChange}
                  className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Misal: 80"
                  required
                />
              </div>

              {/* Kesiapan */}
              <div className="space-y-2">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest">
                  Skor Kesiapan Mondok (0-100)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="score_kesiapan"
                  value={formData.score_kesiapan}
                  onChange={handleChange}
                  className="w-full bg-ink-50 border border-ink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Misal: 85"
                  required
                />
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
              <p className="text-xs text-orange-800 font-medium">
                <strong>Catatan:</strong> Nilai yang dimasukkan akan langsung disimpan sebagai data akhir. Sistem akan otomatis menghitung Total Skor dan status Kelulusan.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-ink-100 bg-ink-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-white text-ink-700 rounded-xl font-black text-sm shadow-sm border border-ink-200 hover:bg-ink-50"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            form="form-input-manual"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-primary-700 text-white rounded-xl font-black text-sm shadow-lg shadow-primary-200 hover:bg-primary-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? "Menyimpan..." : "Simpan & Proses"}
          </button>
        </div>
      </div>
    </div>
  );
}
