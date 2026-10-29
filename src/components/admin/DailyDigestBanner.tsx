"use client";

import { useEffect, useState } from "react";
import { BellRing, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";

/**
 * Banner konfigurasi penerima Digest Jadwal Seleksi Harian (07.00 WIB).
 * Muncul sebagai HIGHLIGHT di akun admin super ketika nomor penerima
 * belum diatur dan nomor WA admin super juga belum tersedia di profil.
 */
export default function DailyDigestBanner({ role }: { role?: string }) {
    const [state, setState] = useState<{
        loading: boolean;
        setting: string | null;
        adminSuperPhone: string | null;
        configured: boolean;
    }>({ loading: true, setting: null, adminSuperPhone: null, configured: true });
    const [saving, setSaving] = useState(false);
    const isSuper = role === "admin_super";

    useEffect(() => {
        fetch("/api/admin/digest-recipient")
            .then((r) => r.json())
            .then((d) =>
                setState({
                    loading: false,
                    setting: d.setting ?? null,
                    adminSuperPhone: d.adminSuperPhone ?? null,
                    configured: Boolean(d.configured),
                })
            )
            .catch(() => setState((s) => ({ ...s, loading: false })));
    }, []);

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
            setState((s) => ({ ...s, setting: phone, configured: true }));
            Swal.fire("Tersimpan", "Nomor penerima digest jadwal harian sudah diatur.", "success");
        } catch (e: any) {
            Swal.fire("Gagal", e.message, "error");
        } finally {
            setSaving(false);
        }
    };

    if (state.loading) return null;

    // Sudah dikonfigurasi → tampilkan ringkas (bukan highlight)
    if (state.configured) {
        return (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 w-fit">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                    Digest jadwal harian (07.00 WIB) dikirim ke{" "}
                    <strong className="text-slate-800">{state.setting || state.adminSuperPhone}</strong>
                    {state.setting ? " (diatur admin super)" : " (nomor WA admin super)"}
                    {isSuper && (
                        <>
                            {" · "}
                            <button
                                className="text-rose-600 font-semibold hover:underline"
                                onClick={async () => {
                                    setSaving(true);
                                    await fetch("/api/admin/digest-recipient", { method: "DELETE" });
                                    setState((s) => ({ ...s, setting: null, configured: Boolean(s.adminSuperPhone) }));
                                    setSaving(false);
                                }}
                            >
                                atur ulang
                            </button>
                        </>
                    )}
                </span>
            </div>
        );
    }

    // Belum dikonfigurasi → HIGHLIGHT
    return (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-amber-900">
                        ⚠️ Nomor penerima Digest Jadwal Harian belum diatur
                    </h3>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Setiap pagi <strong>pukul 07.00 WIB</strong>, sistem mengirim daftar lengkap jadwal seleksi
                        hari itu via WhatsApp untuk diteruskan ke grup penguji &amp; pewawancara. Saat ini pesan
                        <strong> belum dapat dikirim</strong> karena nomor penerima belum diatur dan nomor WA admin
                        super juga belum terisi di profil.
                    </p>

                    {isSuper ? (
                        <form
                            className="mt-3 flex flex-col sm:flex-row gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const input = (e.currentTarget.elements.namedItem("phone") as HTMLInputElement).value;
                                if (input.trim()) save(input.trim());
                            }}
                        >
                            <input
                                name="phone"
                                type="tel"
                                placeholder="cth. 0812xxxx / 62812xxxx"
                                className="flex-1 rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                required
                            />
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2.5 disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
                                Simpan Nomor Penerima
                            </button>
                        </form>
                    ) : (
                        <p className="text-xs text-amber-800 mt-2 font-semibold">
                            Silakan hubungi Admin Super untuk mengatur nomor penerima ini.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
