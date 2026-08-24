"use client";

import { useState, useMemo } from "react";
import { X, Save, Calculator, Loader2, BookOpen, GraduationCap, Users } from "lucide-react";

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
  onSuccess }: InputNilaiManualModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    score_akademik: "",
    score_quran: "",
    score_wawancara_santri: "",
    score_wawancara_ortu: "",
    score_kepribadian: "",
    score_kesiapan: "",
    override_status: "",
    catatan_bypass: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const totalScore = useMemo(() => {
    const ak = parseFloat(formData.score_akademik) || 0;
    const quran = parseFloat(formData.score_quran) || 0;
    
    // Normalize Wawancara Santri (1-5 to 0-100)
    let ws = parseFloat(formData.score_wawancara_santri) || 0;
    if (ws <= 5 && ws > 0) ws = Math.min(100, ws * 20);
    
    const wo = parseFloat(formData.score_wawancara_ortu) || 0;
    const kp = parseFloat(formData.score_kepribadian) || 0;
    const ks = parseFloat(formData.score_kesiapan) || 0;

    const wawancaraTotal = (ws + wo) / 2;

    // Formula based on grading.ts (Akademik 30%, Quran 30%, Wawancara 20%, Kesiapan 10%, Kepribadian 10%)
    return (ak * 0.3) + (quran * 0.3) + (wawancaraTotal * 0.2) + (ks * 0.1) + (kp * 0.1);
  }, [formData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          ...formData }) });

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
    <div className="fixed inset-0 z-[100] flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center bg-primary-950/40  p-4 overflow-y-auto overflow-x-hidden overscroll-contain custom-scrollbar">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-ink-100 flex items-center justify-between bg-primary-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary-700 shadow-sm border border-primary-100">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary-950 tracking-tight italic">
                INPUT NILAI MANUAL
              </h2>
              <p className="text-sm font-bold text-ink-500">
                Bypass Nilai & Override Kelulusan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto no-scrollbar bg-ink-50/50 overscroll-contain custom-scrollbar">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-bold">
              {errorMsg}
            </div>
          )}

          <form id="form-input-manual" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Kolom Kiri: Input Nilai */}
              <div className="space-y-4 lg:col-span-3">
                
                {/* CBT Group */}
                <div className="bg-white p-5 rounded-lg border border-ink-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-ink-900">Ujian CBT</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-ink-500 uppercase tracking-widest">Akademik (0-100)</label>
                      <input type="number" step="0.01" min="0" max="100" name="score_akademik" value={formData.score_akademik} onChange={handleChange} className="w-full bg-ink-50 border border-ink-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-ink-500 uppercase tracking-widest">Kepribadian (0-100)</label>
                      <input type="number" step="0.01" min="0" max="100" name="score_kepribadian" value={formData.score_kepribadian} onChange={handleChange} className="w-full bg-ink-50 border border-ink-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold" required />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-black text-ink-500 uppercase tracking-widest">Kesiapan Mondok (0-100)</label>
                      <input type="number" step="0.01" min="0" max="100" name="score_kesiapan" value={formData.score_kesiapan} onChange={handleChange} className="w-full bg-ink-50 border border-ink-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold" required />
                    </div>
                  </div>
                </div>

                {/* Al-Quran Group */}
                <div className="bg-white p-5 rounded-lg border border-ink-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-ink-900">Tes Al-Qur'an</h3>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-ink-500 uppercase tracking-widest">Skor Al-Qur'an (0-100)</label>
                    <input type="number" step="0.01" min="0" max="100" name="score_quran" value={formData.score_quran} onChange={handleChange} className="w-full bg-ink-50 border border-ink-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" required />
                  </div>
                </div>

                {/* Wawancara Group */}
                <div className="bg-white p-5 rounded-lg border border-ink-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-ink-900">Wawancara</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-ink-500 uppercase tracking-widest">Santri (Skala 1-5)</label>
                      <input type="number" step="0.01" min="0" max="5" name="score_wawancara_santri" value={formData.score_wawancara_santri} onChange={handleChange} className="w-full bg-ink-50 border border-ink-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-ink-500 uppercase tracking-widest">Ortu (0-100)</label>
                      <input type="number" step="0.01" min="0" max="100" name="score_wawancara_ortu" value={formData.score_wawancara_ortu} onChange={handleChange} className="w-full bg-ink-50 border border-ink-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold" required />
                    </div>
                  </div>
                </div>

              </div>

              {/* Kolom Kanan: Kalkulator & Keputusan */}
              <div className="space-y-4 lg:col-span-2">
                
                <div className="bg-primary-900 text-white p-6 rounded-lg shadow-sm relative overflow-hidden h-[180px] flex flex-col justify-center">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                  <h3 className="text-xs font-bold text-primary-200 uppercase tracking-widest mb-1 relative z-10">Estimasi Total Skor</h3>
                  <div className="text-6xl font-black relative z-10">{totalScore.toFixed(1)}</div>
                  <p className="text-[10px] text-primary-200 mt-3 font-medium relative z-10 leading-snug opacity-80">Ini adalah estimasi real-time berdasarkan rumus bobot pesantren.</p>
                </div>

                <div className="bg-white p-5 rounded-lg border border-ink-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-ink-900 border-b border-ink-100 pb-2">Keputusan & Catatan</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-ink-500 uppercase tracking-widest">Override Kelulusan (Opsional)</label>
                    <select
                      name="override_status"
                      value={formData.override_status}
                      onChange={handleChange}
                      className="w-full bg-ink-50 border border-ink-200 px-3 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
                    >
                      <option value="">-- Ikuti Rumus Sistem (Default) --</option>
                      <option value="DITERIMA">Paksa: DITERIMA</option>
                      <option value="DITOLAK">Paksa: DITOLAK</option>
                      <option value="CADANGAN">Paksa: CADANGAN</option>
                    </select>
                    <p className="text-[10px] text-ink-500 font-medium leading-snug">Jika diisi, sistem akan memaksa hasil kelulusan sesuai pilihan.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-ink-500 uppercase tracking-widest">Catatan Bypass *</label>
                    <textarea
                      name="catatan_bypass"
                      value={formData.catatan_bypass}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-ink-50 border border-ink-200 px-3 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium resize-none"
                      placeholder="Misal: Santri mengikuti ujian offline di gelombang 1, data dari lembar nilai..."
                      required
                    ></textarea>
                  </div>
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-ink-100 bg-white flex items-center justify-end gap-3 rounded-b-[2rem]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-white text-ink-700 rounded-lg font-black text-sm shadow-sm border border-ink-200 hover:bg-ink-50"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            form="form-input-manual"
            disabled={loading}
            className="flex items-center gap-2 px-5 md:px-8 py-3 bg-primary-700 text-white rounded-lg font-black text-sm shadow-sm shadow-primary-200 hover:bg-primary-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? "Menyimpan..." : "Simpan & Proses"}
          </button>
        </div>
      </div>
    </div>
  );
}
