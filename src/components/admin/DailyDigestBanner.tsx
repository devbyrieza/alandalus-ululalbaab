"use client";

import { useEffect, useState } from "react";
import { BellRing, Loader2, CheckCircle2, AlertTriangle, Pencil } from "lucide-react";
import Swal from "sweetalert2";

/**
 * Banner konfigurasi penerima Digest Jadwal Seleksi Harian (06.45 WIB).
 * Relevan untuk Admin Super / Head of IT.
 * Jika staf non-superadmin (mis. Admin Keuangan / Berkas) yang membuka dashboard,
 * banner peringatan belum diatur TIDAK AKAN mengganggu mereka.
 */
export default function DailyDigestBanner({ role }: { role?: string }) {
    const isSuper = role === "admin_super" || role === "head_of_it" || role === "superadmin";

    const [state, setState] = useState<{
        loading: boolean;
        setting: string | null;
        adminSuperPhone: string | null;
        configured: boolean;
    }>({ loading: true, setting: null, adminSuperPhone: null, configured: true });

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [phoneInput, setPhoneInput] = useState("");

    const load = () =>
        fetch("/api/admin/digest-recipient")
            .then(async (r) => {
                if (!r.ok) return null;
                return r.json();
            })
            .then((d) => {
                if (!d) {
                    setState((s) => ({ ...s, loading: false }));
                    return;
                }
                setState({
                    loading: false,
                    setting: d.setting ?? null,
                    adminSuperPhone: d.adminSuperPhone ?? null,
                    configured: Boolean(d.configured),
                });
            })
            .catch(() => setState((s) => ({ ...s, loading: false })));

    useEffect(() => {
        load();
    }, []);

    const startEdit = () => {
        setPhoneInput(state.setting || state.adminSuperPhone || "");
        setEditing(true);
    };

    const save = async (phone: string) => {
        setSaving(true);
        try {
            const r = await fetch("/api/admin/digest-recipient", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || "Gagal menyimpan");
            await load();
            setEditing(false);
            Swal.fire("Tersimpan", `Nomor penerima digest jadwal harian: ${phone}`, "success");
        } catch (e: any) {
            Swal.fire({
                icon: "error",
                title: "Gagal menyimpan",
                text: e.message,
            });
        } finally {
            setSaving(false);
        }
    };

    if (state.loading) return null;

    // Untuk staf non-super (misal admin_keuangan, admin_berkas),
    // jangan pernah tampilkan banner peringatan konfigurasi
    if (!isSuper) {
        return null;
    }

    const activeNumber = state.setting || state.adminSuperPhone;

    // Sudah dikonfigurasi → ringkas + tombol edit untuk Admin Super
    if (state.configured && !editing) {
        return (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                    Digest jadwal harian (06.45 WIB) dikirim ke{" "}
                    <strong className="text-slate-800">{activeNumber}</strong>
                    {state.setting ? " (diatur admin super)" : " (nomor WA admin super)"}
                </span>
                <button
                    className="inline-flex items-center gap-1 text-primary-600 font-bold hover:underline cursor-pointer"
                    onClick={startEdit}
                >
                    <Pencil className="w-3 h-3" />
                    Edit nomor
                </button>
            </div>
        );
    }

    // Form edit nomor oleh Admin Super
    if (editing) {
        return (
            <div className={`rounded-2xl border-2 p-4 sm:p-5 shadow-xs ${state.configured ? "border-primary-200 bg-white" : "border-amber-300 bg-amber-50"}`}>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-primary-600" />
                    Nomor WhatsApp Penerima Digest Jadwal Harian
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Setiap pagi <strong>pukul 06.45 WIB</strong>, daftar lengkap jadwal seleksi hari itu dikirim ke
                    nomor ini untuk <strong>diteruskan ke grup WhatsApp penguji &amp; pewawancara</strong>.
                </p>
                <form
                    className="mt-3 flex flex-col sm:flex-row gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (phoneInput.trim()) save(phoneInput.trim());
                    }}
                >
                    <input
                        name="phone"
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="cth. 0812xxxx / 62812xxxx"
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                        required
                    />
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-4 py-2.5 disabled:opacity-60 cursor-pointer"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
                        Simpan
                    </button>
                    {state.configured && (
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="rounded-xl border border-slate-300 text-slate-600 text-sm font-bold px-4 py-2.5 hover:bg-slate-50 cursor-pointer"
                        >
                            Batal
                        </button>
                    )}
                </form>
            </div>
        );
    }

    // Belum dikonfigurasi & yang melihat adalah Admin Super → Tampilkan HIGHLIGHT untuk Admin Super
    return (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-amber-900">
                        ⚠️ Nomor penerima Digest Jadwal Harian belum diatur
                    </h3>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Setiap pagi <strong>pukul 06.45 WIB</strong>, sistem mengirim daftar lengkap jadwal seleksi
                        hari itu via WhatsApp untuk diteruskan ke grup penguji &amp; pewawancara. Saat ini pesan
                        <strong> belum dapat dikirim</strong> karena nomor penerima belum diatur dan nomor WA admin
                        super juga belum terisi di profil.
                    </p>
                    <button
                        onClick={startEdit}
                        className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2.5 cursor-pointer"
                    >
                        <BellRing className="w-4 h-4" />
                        Atur Nomor Penerima
                    </button>
                </div>
            </div>
        </div>
    );
}
