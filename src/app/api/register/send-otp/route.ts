import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/notifications/multi-channel";
import type { OTPChannel } from "@/lib/notifications/multi-channel";
import { normalizePhoneNumber } from "@/lib/validations/registration";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * ─── REGISTER API: SEND OTP ───
 * Menangani permintaan kode OTP via WhatsApp/SMS saat santri mendaftar.
 * Fitur Keamanan: Rate Limiting & Hashed OTP Storage.
 */



// ─── 1. SECURITY CONFIG ───
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // Jeda 1 jam
const MAX_OTP_ATTEMPTS = 5;               // Maksimal 5x minta OTP per nomor per jam
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * checkRateLimit
 * Mencegah satu nomor HP membombardir server dengan permintaan OTP (Anti-Spam).
 */
function checkRateLimit(phone: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(phone);
  if (!limit) return true;
  if (now > limit.resetTime) {
    rateLimitStore.delete(phone);
    return true;
  }
  return limit.count < MAX_OTP_ATTEMPTS;
}

function updateRateLimit(phone: string): void {
  const now = Date.now();
  const limit = rateLimitStore.get(phone);
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(phone, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    limit.count++;
  }
}

// ─── 2. LOGIC HELPERS ───

/**
 * generateOTP: Membuat 6 digit angka acak.
 * hashOTP: Mengenkripsi OTP sebelum disimpan di database demi keamanan.
 */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

// ─── 3. MAIN API HANDLER ───

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { no_hp, otp_channel = "whatsapp", nama_lengkap } = body;

    // A. Validasi Input
    if (!no_hp) return NextResponse.json({ success: false, error: "Nomor HP wajib diisi" }, { status: 400 });

    const normalizedPhone = normalizePhoneNumber(no_hp);

    // B. Cek Batas Permintaan (Security Check)
    if (!checkRateLimit(normalizedPhone)) {
      return NextResponse.json({ success: false, error: "Terlalu banyak permintaan. Silakan tunggu 1 jam." }, { status: 429 });
    }

    // C. Proses Pembuatan & Pengiriman OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Kode hangus dalam 5 menit



    // ── Production mode: kirim via Wablas ──
    const otpResult = await sendOTP({
      channel: otp_channel as OTPChannel,
      identifier: normalizedPhone,
      otp,
      nama: nama_lengkap,
    });

    if (!otpResult.success) {
      console.error("❌ OTP send failed:", otpResult.message);
      return NextResponse.json({
        success: false,
        error: "Gagal mengirim WhatsApp. Pastikan nomor Anda terdaftar di WhatsApp dan coba lagi nanti."
      }, { status: 500 });
    }

    // D. Simpan ke Database (Tabel Sementara)
    // Data pendaftaran disimpan di sini dulu, baru dipindah ke tabel Pendaftar setelah OTP diverifikasi.
    await prisma.otpVerification.create({
      data: {
        phone: normalizedPhone,
        otp_hash: hashedOTP,
        expires_at: expiresAt,
        otp_channel: otp_channel,
        registration_data: body, // Menyimpan seluruh payload pendaftaran
      },
    });

    updateRateLimit(normalizedPhone);

    // E. Response ke User
    return NextResponse.json({
      success: true,
      message: "Kode OTP telah dikirim ke WhatsApp Anda",
      channel: otp_channel,
      expires_in: 300 // 5 menit
    });

  } catch (error: any) {
    console.error("❌ REGISTER_OTP_ERROR:", error.message);
    return NextResponse.json({ success: false, error: "Gagal memproses pendaftaran" }, { status: 500 });
  }
}
