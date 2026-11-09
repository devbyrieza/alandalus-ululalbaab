"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  Search,
  Send,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BulkPengumumanDialog } from "@/components/admin/BulkPengumumanDialog";
import { SuratPengumumanDialog } from "@/components/admin/SuratPengumumanDialog";

function PengumumanContent() {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, ready: 0, accepted: 0 });
  const [tahunAjaranList, setTahunAjaranList] = useState<
    Array<{ id: string; nama: string; is_active: boolean }>
  >([]);
  const [showBulkAcceptedDialog, setShowBulkAcceptedDialog] = useState(false);
  const [suratTarget, setSuratTarget] = useState<{
    id: string;
    nama_lengkap: string;
    nomor_pendaftaran: string;
    jenjang?: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      const nA = a.nilai_ujian?.nilai_total ?? -1;
      const nB = b.nilai_ujian?.nilai_total ?? -1;
      return nB - nA;
    });
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    let list = sortedCandidates;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.nama_lengkap?.toLowerCase().includes(q) ||
          c.nomor_pendaftaran?.toLowerCase().includes(q) ||
          c.nik?.includes(q) ||
          c.asal_sekolah?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sortedCandidates, searchQuery]);

  const [filter, setFilter] = useState({
    jenjang: "",
    status: "tested", // Default to those who have completed ALL 6 exams
    tahun_ajaran: "",
  });

  const [isPublishing, setIsPublishing] = useState(false);

  // Load Tahun Ajaran list on mount and default to active TA
  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        const res = await fetch("/api/admin/tahun-ajaran");
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          setTahunAjaranList(list);
          const activeTA = list.find((ta: any) => ta.is_active);
          const latestTA = list[0];
          const defaultTA = activeTA || latestTA;
          if (defaultTA) {
            setFilter((prev) => ({
              ...prev,
              tahun_ajaran: prev.tahun_ajaran || defaultTA.id,
            }));
          }
        }
      } catch (e) {
        console.error("Gagal memuat tahun ajaran:", e);
      }
    };
    fetchTahunAjaran();
  }, []);

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Construct query
      const params = new URLSearchParams();
      if (filter.jenjang) params.append("jenjang", filter.jenjang);
      if (filter.status) params.append("status", filter.status);
      if (filter.tahun_ajaran) params.append("tahun_ajaran", filter.tahun_ajaran);
      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
      params.append("limit", "100"); // Fetch ample amount
      params.append("_t", String(Date.now()));

      const res = await fetch(`/api/admin/pendaftar/list?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (res.ok) {
        setCandidates(data.data || []);
        // Calculate basic stats from this batch
        const ready = data.data.filter(
          (c: any) =>
            ["selection", "scheduled", "testing", "tested"].includes(c.status_pendaftaran) ||
            c.exam_status === "tested"
        ).length;
        const accepted = data.data.filter((c: any) => c.status_pendaftaran === "accepted").length;
        setStats({ total: data.data.length, ready, accepted });
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data kandidat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [filter, debouncedSearch]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handlePublishSingle = async (
    id: string,
    nama: string,
    new_status: "accepted" | "cadangan" | "rejected"
  ) => {
    const actionText =
      new_status === "accepted"
        ? "menetapkan DITERIMA"
        : new_status === "cadangan"
          ? "menjadikan CADANGAN"
          : "menetapkan DITOLAK";
    const btnColor =
      new_status === "accepted" ? "#059669" : new_status === "cadangan" ? "#d97706" : "#dc2626";

    const result = await Swal.fire({
      title: `${actionText} Santri?`,
      html: `<p>Yakin ingin <b>${actionText}</b> santri an. <b>${nama}</b>?</p><p class="mt-2 text-xs text-stone-500">Status akan langsung ditetapkan, surat pengumuman terbit, dan notifikasi WhatsApp diantrekan.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: btnColor,
      cancelButtonColor: "#57534e",
      confirmButtonText: "Ya, Tetapkan!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setIsPublishing(true);
      const res = await fetch("/api/admin/pengumuman/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_ids: [id],
          new_status: new_status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Status ${nama} berhasil diperbarui.`);
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status_pendaftaran: new_status,
                  pengumuman: {
                    ...(c.pengumuman || {}),
                    status_kelulusan:
                      new_status === "accepted"
                        ? "Diterima"
                        : new_status === "cadangan"
                          ? "Cadangan"
                          : "Ditolak",
                    is_published: true,
                  },
                }
              : c
          )
        );
        fetchCandidates();
      } else {
        toast.error(data.error || "Gagal memperbarui status");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublish = async (new_status: "accepted" | "cadangan" | "rejected") => {
    if (selectedIds.length === 0) return;

    // Untuk status DITERIMA massal, buka Bulk Dialog (Auto-Generate / Multi-Upload Surat)
    if (new_status === "accepted") {
      setShowBulkAcceptedDialog(true);
      return;
    }

    const actionText = new_status === "cadangan" ? "menjadikan CADANGAN" : "menetapkan DITOLAK";
    const btnColor = new_status === "cadangan" ? "#d97706" : "#dc2626";

    const result = await Swal.fire({
      title: "Publikasi Pengumuman?",
      text: `Apakah Anda yakin ingin ${actionText} ${selectedIds.length} santri ini? Pengumuman resmi akan diterbitkan dan pesan masuk antrean WhatsApp otomatis.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: btnColor,
      cancelButtonColor: "#57534e", // Stone 600
      confirmButtonText: "Ya, Publikasikan!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setIsPublishing(true);
      const res = await fetch("/api/admin/pengumuman/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftar_ids: selectedIds,
          new_status: new_status,
          // Removed hardcoded announcement_message to use buildMessageHasilTes on backend
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(
          result.message || `Berhasil! ${result.queued} pengumuman sedang mengantri untuk dikirim.`
        );
        const affectedIds = new Set(selectedIds);
        setCandidates((prev) =>
          prev.map((c) =>
            affectedIds.has(c.id)
              ? {
                  ...c,
                  status_pendaftaran: new_status,
                  pengumuman: {
                    ...(c.pengumuman || {}),
                    status_kelulusan: new_status === "cadangan" ? "Cadangan" : "Ditolak",
                    is_published: true,
                  },
                }
              : c
          )
        );
        fetchCandidates();
        setSelectedIds([]);
      } else {
        toast.error(result.error || "Gagal mempublish pengumuman");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsPublishing(false);
    }
  };

  const renderStatusBadge = (c: any, isMobile = false) => {
    const textSize = isMobile ? "text-[10px]" : "text-xs";
    if (c.status_pendaftaran === "tested") {
      if (c.pengumuman) {
        const sL = c.pengumuman.status_kelulusan;
        const cls =
          sL === "Diterima"
            ? "bg-green-100 text-green-700"
            : sL === "Cadangan"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${cls} ${textSize} font-black uppercase whitespace-nowrap shrink-0`}
          >
            DRAFT: {sL}
          </span>
        );
      }
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 ${textSize} font-black uppercase whitespace-nowrap shrink-0`}
        >
          Menunggu Rapat
        </span>
      );
    }
    if (["selection", "testing"].includes(c.status_pendaftaran)) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 ${textSize} font-black uppercase whitespace-nowrap shrink-0`}
        >
          Proses Seleksi
        </span>
      );
    }
    if (c.status_pendaftaran === "scheduled") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 ${textSize} font-black uppercase whitespace-nowrap shrink-0`}
        >
          Terjadwal Ujian
        </span>
      );
    }
    if (c.status_pendaftaran === "accepted") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 ${textSize} font-black uppercase whitespace-nowrap shrink-0`}
        >
          <CheckCircle2 className="w-3 h-3" /> Diterima
        </span>
      );
    }
    if (c.status_pendaftaran === "cadangan" || c.status_pendaftaran === "announced") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 ${textSize} font-black uppercase whitespace-nowrap shrink-0`}
        >
          Cadangan
        </span>
      );
    }
    if (c.status_pendaftaran === "rejected") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 ${textSize} font-black uppercase whitespace-nowrap shrink-0`}
        >
          Ditolak
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 ${textSize} font-black uppercase whitespace-nowrap shrink-0`}
      >
        {c.status_pendaftaran}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-xl border border-stone-100">
          <p className="text-stone-500 text-sm font-medium">Kandidat Tampil</p>
          <h3 className="text-2xl font-bold text-stone-800">{stats.total}</h3>
        </div>
        <div className="bg-primary-50 p-6 rounded-xl shadow-xl border border-primary-100">
          <p className="text-primary-600 text-sm font-medium">Proses Seleksi (Siap Diluluskan)</p>
          <h3 className="text-2xl font-bold text-primary-700">{stats.ready}</h3>
        </div>
        <div className="bg-green-50 p-6 rounded-xl shadow-xl border border-green-100">
          <p className="text-green-600 text-sm font-medium">Sudah Diterima</p>
          <h3 className="text-2xl font-bold text-green-700">{stats.accepted}</h3>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-xl shadow-xl border border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Tahun Ajaran */}
          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200">
            <Calendar className="w-4 h-4 text-stone-500" />
            <select
              className="bg-transparent text-sm font-semibold text-stone-800 focus:outline-none cursor-pointer"
              value={filter.tahun_ajaran}
              onChange={(e) => setFilter({ ...filter, tahun_ajaran: e.target.value })}
            >
              <option value="all">Semua Tahun Ajaran</option>
              {tahunAjaranList.map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama} {ta.is_active ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200">
            <Filter className="w-4 h-4 text-stone-500" />
            <select
              className="bg-transparent text-sm font-medium text-stone-700 focus:outline-none cursor-pointer"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="sedang_seleksi">Semua Proses Seleksi (Siap Diluluskan)</option>
              <option value="tested">Sudah Selesai Ujian (Tested)</option>
              <option value="scheduled">Terjadwal Ujian</option>
              <option value="accepted">Diterima</option>
              <option value="cadangan">Cadangan</option>
              <option value="rejected">Ditolak</option>
              <option value="all">Semua Status</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-primary-500 focus-within:bg-white transition-all w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama / no. daftar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full focus:outline-none placeholder:text-stone-400 font-medium text-stone-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-stone-400 hover:text-stone-600 transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePublish("accepted")}
            disabled={selectedIds.length === 0 || isPublishing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-stone-300 text-white rounded-xl font-bold transition-all shadow-sm"
          >
            {isPublishing ? "Proses..." : `Diterima (${selectedIds.length})`}
          </button>
          <button
            onClick={() => handlePublish("cadangan")}
            disabled={selectedIds.length === 0 || isPublishing}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white rounded-xl font-bold transition-all shadow-sm"
          >
            {isPublishing ? "Proses..." : `Cadangkan (${selectedIds.length})`}
          </button>
          <button
            onClick={() => handlePublish("rejected")}
            disabled={selectedIds.length === 0 || isPublishing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white rounded-xl font-bold transition-all shadow-sm"
          >
            {isPublishing ? "Proses..." : `Tolak (${selectedIds.length})`}
          </button>
        </div>
      </div>

      {/* Table & Mobile View */}
      <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-stone-100 select-none">
          {filteredCandidates.length === 0 ? (
            <div className="px-6 py-12 text-center text-stone-500 italic">
              Tidak ada data kandidat sesuai pencarian / filter
            </div>
          ) : (
            filteredCandidates.map((c, rankIdx) => {
              const nu = c.nilai_ujian;
              const getGradeBadge = (score: number | null | undefined, type: string) => {
                if (score == null) return null;
                let grade = "C";
                if (type === "quran") grade = score >= 80 ? "A" : score >= 65 ? "B" : "C";
                else if (type === "akademik") grade = score >= 75 ? "A" : score >= 60 ? "B" : "C";
                else if (type === "kepribadian")
                  grade = score >= 70 ? "A" : score >= 50 ? "B" : "C";
                else grade = score >= 80 ? "A" : score >= 60 ? "B" : "C";

                const color =
                  grade === "A"
                    ? "bg-green-500"
                    : grade === "B"
                      ? "bg-primary-400"
                      : "bg-secondary-400";
                return (
                  <span
                    key={type}
                    className={`${color} text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase shrink-0`}
                  >
                    {grade}
                  </span>
                );
              };

              const ws = nu?.nilai_wawancara_santri || 0;
              const wo = nu?.nilai_wawancara_ortu || 0;
              const avgWawancara = ws > 0 && wo > 0 ? (ws + wo) / 2 : ws || wo;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectOne(c.id)}
                  className={`p-4 flex items-start gap-4 active:bg-stone-50 transition-colors ${selectedIds.includes(c.id) ? "bg-green-50/50" : ""}`}
                >
                  <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-stone-300 text-green-600 focus:ring-green-500"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => handleSelectOne(c.id)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2 flex-wrap">
                      <h4 className="font-black text-stone-900 leading-tight uppercase text-sm truncate">
                        {toTitleCase(c.nama_lengkap)}
                      </h4>
                      {c.nomor_pendaftaran?.startsWith("SMA") &&
                      (c.jenjang?.toUpperCase().includes("IL") ||
                        c.pengumuman?.kelas_diterima?.toUpperCase().includes("IL")) ? (
                        <span
                          className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded text-[9px] font-black uppercase shrink-0 whitespace-nowrap inline-flex items-center gap-1 shadow-xs"
                          title="Pendaftaran awal SMA dialihkan ke I'dad Lughowi"
                        >
                          SMA ➔ IL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[9px] font-black uppercase shrink-0 whitespace-nowrap inline-block shrink-0">
                          {c.jenjang}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono font-bold text-stone-400 tracking-tighter mb-2">
                      {c.nomor_pendaftaran}
                    </p>

                    <div className="flex gap-1 mb-3 overflow-x-auto pb-1 no-scrollbar">
                      {getGradeBadge(nu?.score_quran, "quran")}
                      {getGradeBadge(nu?.score_akademik, "akademik")}
                      {getGradeBadge(nu?.score_kepribadian, "kepribadian")}
                      {getGradeBadge(avgWawancara, "wawancara")}
                      {getGradeBadge(nu?.score_kesiapan, "kesiapan")}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">
                          Total Nilai
                        </span>
                        <span className="text-sm font-black text-stone-700">
                          {nu?.nilai_total != null ? Number(nu.nilai_total).toFixed(2) : "-"}
                          <span className="ml-1 text-stone-400 font-bold">
                            ({nu?.nilai_total >= 80 ? "A" : nu?.nilai_total >= 65 ? "B" : "C"})
                          </span>
                        </span>
                      </div>
                      <div>{renderStatusBadge(c, true)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500"
                    onChange={handleSelectAll}
                    checked={candidates.length > 0 && selectedIds.length === candidates.length}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase">
                  Nama & Komponen
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase">
                  Jenjang
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase">
                  Total / Grade
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase">
                  Rekomendasi / Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase">
                  Aksi Penetapan (1-Klik)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                    Tidak ada data kandidat sesuai pencarian / filter
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c, rankIdx) => {
                  const nu = c.nilai_ujian;
                  const getGradeBadge = (score: number | null | undefined, type: string) => {
                    if (score == null) return null;
                    let grade = "C";
                    if (type === "quran") grade = score >= 80 ? "A" : score >= 65 ? "B" : "C";
                    else if (type === "akademik")
                      grade = score >= 75 ? "A" : score >= 60 ? "B" : "C";
                    else if (type === "kepribadian")
                      grade = score >= 70 ? "A" : score >= 50 ? "B" : "C";
                    else grade = score >= 80 ? "A" : score >= 60 ? "B" : "C";

                    const color =
                      grade === "A"
                        ? "bg-green-500"
                        : grade === "B"
                          ? "bg-primary-400"
                          : "bg-secondary-400";
                    return (
                      <span
                        key={type}
                        className={`${color} text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase`}
                      >
                        {grade}
                      </span>
                    );
                  };

                  const ws = nu?.nilai_wawancara_santri || 0;
                  const wo = nu?.nilai_wawancara_ortu || 0;
                  const avgWawancara = ws > 0 && wo > 0 ? (ws + wo) / 2 : ws || wo;

                  return (
                    <tr key={c.id} className="hover:bg-stone-50/50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => handleSelectOne(c.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-stone-800">
                          {toTitleCase(c.nama_lengkap)}
                        </div>
                        <div className="text-xs text-stone-500 mb-2">{c.nomor_pendaftaran}</div>
                        <div className="flex gap-1">
                          {getGradeBadge(nu?.score_quran, "quran")}
                          {getGradeBadge(nu?.score_akademik, "akademik")}
                          {getGradeBadge(nu?.score_kepribadian, "kepribadian")}
                          {getGradeBadge(avgWawancara, "wawancara")}
                          {getGradeBadge(nu?.score_kesiapan, "kesiapan")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {c.nomor_pendaftaran?.startsWith("SMA") &&
                        (c.jenjang?.toUpperCase().includes("IL") ||
                          c.pengumuman?.kelas_diterima?.toUpperCase().includes("IL")) ? (
                          <div className="flex flex-col gap-0.5 items-start">
                            <span
                              className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-xs font-black inline-flex items-center gap-1 shadow-xs"
                              title="Pendaftaran awal SMA dialihkan ke I'dad Lughowi"
                            >
                              SMA ➔ IL
                            </span>
                            <span className="text-[10px] text-amber-700 font-semibold">
                              Pengalihan IL
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-bold whitespace-nowrap inline-block shrink-0">
                            {c.jenjang}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="font-black text-stone-800 text-lg leading-none">
                            {nu?.nilai_total != null ? Number(nu.nilai_total).toFixed(2) : "-"}
                          </div>
                          {nu?.nilai_total != null && (
                            <span className="text-[10px] font-bold text-stone-400 mt-1 italic">
                              Grade: {nu.nilai_total >= 80 ? "A" : nu.nilai_total >= 65 ? "B" : "C"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">{renderStatusBadge(c, false)}</td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {c.status_pendaftaran === "accepted" ? (
                            <button
                              onClick={() => {
                                setSuratTarget({
                                  id: c.id,
                                  nama_lengkap: c.nama_lengkap,
                                  nomor_pendaftaran: c.nomor_pendaftaran,
                                  jenjang: c.jenjang,
                                });
                              }}
                              title="Upload / Ganti Surat Pengumuman Resmi"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:scale-105 active:scale-95"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>
                                {c.pengumuman?.surat_pengumuman_path
                                  ? "Ganti Surat"
                                  : "Upload Surat"}
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSuratTarget({
                                  id: c.id,
                                  nama_lengkap: c.nama_lengkap,
                                  nomor_pendaftaran: c.nomor_pendaftaran,
                                  jenjang: c.jenjang,
                                });
                              }}
                              title="Upload Surat Resmi & Tetapkan Diterima"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all bg-green-600 hover:bg-green-700 text-white shadow-xs hover:scale-105 active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Diterima</span>
                            </button>
                          )}
                          <button
                            onClick={() => handlePublishSingle(c.id, c.nama_lengkap, "cadangan")}
                            disabled={
                              isPublishing ||
                              c.status_pendaftaran === "cadangan" ||
                              c.status_pendaftaran === "announced"
                            }
                            title="Jadikan Cadangan"
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              c.status_pendaftaran === "cadangan" ||
                              c.status_pendaftaran === "announced"
                                ? "bg-amber-100 text-amber-700 opacity-60 cursor-default"
                                : "bg-amber-500 hover:bg-amber-600 text-white shadow-xs hover:scale-105 active:scale-95"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Cadangan</span>
                          </button>
                          <button
                            onClick={() => handlePublishSingle(c.id, c.nama_lengkap, "rejected")}
                            disabled={isPublishing || c.status_pendaftaran === "rejected"}
                            title="Tolak"
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              c.status_pendaftaran === "rejected"
                                ? "bg-red-100 text-red-700 opacity-60 cursor-default"
                                : "bg-red-600 hover:bg-red-700 text-white shadow-xs hover:scale-105 active:scale-95"
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload Surat Pengumuman Resmi (Plan Kedua) */}
      {suratTarget && (
        <SuratPengumumanDialog
          pendaftar={suratTarget}
          initialTab="upload"
          onClose={() => setSuratTarget(null)}
          onDone={(resData) => {
            const targetId = resData?.pendaftarId || suratTarget.id;
            setSuratTarget(null);
            setCandidates((prev) =>
              prev.map((c) =>
                c.id === targetId
                  ? {
                      ...c,
                      status_pendaftaran: "accepted",
                      pengumuman: {
                        ...(c.pengumuman || {}),
                        status_kelulusan: "Diterima",
                        is_published: true,
                        nomor_surat: resData?.nomorSurat || c.pengumuman?.nomor_surat,
                        kelas_diterima: resData?.kelasDiterima || c.pengumuman?.kelas_diterima,
                        surat_pengumuman_path:
                          resData?.suratPath || c.pengumuman?.surat_pengumuman_path || "uploaded",
                      },
                    }
                  : c
              )
            );
            fetchCandidates();
          }}
        />
      )}

      {/* Modal Pengumuman Massal (Auto-Generate / Multi-Upload) */}
      {showBulkAcceptedDialog && (
        <BulkPengumumanDialog
          candidates={candidates
            .filter((c) => selectedIds.includes(c.id))
            .map((c) => ({
              id: c.id,
              nama_lengkap: c.nama_lengkap,
              nomor_pendaftaran: c.nomor_pendaftaran,
              jenjang: c.jenjang,
              kelas_diterima: c.pengumuman?.kelas_diterima,
            }))}
          onClose={() => setShowBulkAcceptedDialog(false)}
          onSuccess={(updatedIds) => {
            setShowBulkAcceptedDialog(false);
            setSelectedIds([]);
            const affectedSet = new Set(updatedIds);
            setCandidates((prev) =>
              prev.map((c) =>
                affectedSet.has(c.id)
                  ? {
                      ...c,
                      status_pendaftaran: "accepted",
                      pengumuman: {
                        ...(c.pengumuman || {}),
                        status_kelulusan: "Diterima",
                        is_published: true,
                      },
                    }
                  : c
              )
            );
            fetchCandidates();
          }}
        />
      )}
    </div>
  );
}

export default function PengumumanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <PengumumanContent />
    </Suspense>
  );
}
