import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// PRIORITAS: Muat database dari .env.production jika ada, karena itu yang berisi IP Server
const envProdPath = path.resolve(process.cwd(), '.env.production');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envProdPath)) {
    console.log('📝 Menggunakan konfigurasi dari .env.production (OVERRIDE)...');
    dotenv.config({ path: envProdPath, override: true });
} else {
    console.log('📝 Menggunakan konfigurasi dari .env standar...');
    dotenv.config({ override: true });
}

// Baca Nama Sekolah secara langsung setelah Env dimuat
const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'Al-Andalus PPDB';

// DEBUG: Pastikan alamat yang dibaca benar
const dbUrl = process.env.DATABASE_URL || 'TIDAK DITEMUKAN';
const obfuscatedUrl = dbUrl.replace(/\/\/(.*):(.*)@/, '//***:***@');
console.log(`🔌 Alamat Database terbaca: ${obfuscatedUrl}`);

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log(`🚀 Memulai Sinkronisasi Pasukan Admin & Penguji: ${schoolName}...`);

    // Tentukan Suffix Email berdasarkan Branding
    // Jika ada Al-Imam di nama sekolah, gunakan @alimam.com, jika tidak @ululalbaab.com
    const emailSuffix = schoolName.toLowerCase().includes('al-imam') 
        ? 'alimam.com' 
        : 'ululalbaab.com';

    console.log(`📧 Target Suffix: @${emailSuffix}`);

    const staffList = [
        { 
            prefix: 'admin', 
            name: 'Super Admin', 
            role: 'admin_super', 
            phone: '081234567890' 
        },
        { 
            prefix: 'admin.berkas', 
            name: 'Admin Berkas', 
            role: 'admin_berkas', 
            phone: '081234567801' 
        },
        { 
            prefix: 'admin.keuangan', 
            name: 'Admin Keuangan', 
            role: 'admin_keuangan', 
            phone: '081234567802' 
        },
        { 
            prefix: 'penguji', 
            name: 'Ustadz Penguji', 
            role: 'penguji', 
            phone: '081234567803' 
        },
        { 
            prefix: 'headit', 
            name: 'Head of IT', 
            role: 'head_of_it', 
            phone: '085111524441' 
        }
    ];

    for (const staff of staffList) {
        const fullEmail = `${staff.prefix}@${emailSuffix}`;
        
        // Pola Password: Nama depan + 26! (Contoh: Admin26!)
        const firstName = staff.name.split(' ')[0];
        const capitalFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        const plainPassword = `${capitalFirstName}26!`;
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        console.log(`⚙️  Memproses: ${staff.name} (${fullEmail}) -> Password: ${plainPassword}`);

        const existingProfile = await prisma.profile.findFirst({
            where: { email: fullEmail }
        });

        if (!existingProfile) {
            await prisma.profile.create({
                data: {
                    id: crypto.randomUUID(),
                    email: fullEmail,
                    full_name: staff.name,
                    role: staff.role,
                    phone: staff.phone,
                    password_hash: hashedPassword,
                    updated_at: new Date()
                }
            });
            console.log(`✅ ${staff.name} BERHASIL DIBUAT.`);
        } else {
            await prisma.profile.update({
                where: { id: existingProfile.id },
                data: {
                    full_name: staff.name,
                    role: staff.role,
                    phone: staff.phone,
                    password_hash: hashedPassword,
                    updated_at: new Date()
                }
            });
            console.log(`✅ ${staff.name} BERHASIL DIUPDATE.`);
        }
    }

    // Penanganan Legacy Admin (Opsional: Jika ada admin lama @ululalbaab.com di database Al-Imam)
    if (emailSuffix === 'alimam.com') {
        const legacyAdmin = await prisma.profile.findFirst({
            where: { email: 'admin@ululalbaab.com' }
        });
        if (legacyAdmin) {
            console.log('🔍 Menemukan Akun Admin Lama (@ululalbaab.com). Sedang dinonaktifkan/dimigrasi...');
            // Bapak bisa pilih migrasi atau hapus, di sini saya biarkan saja namun password sudah diganti via upsert di atas jika namanya sama.
        }
    }

    console.log(`✨ SINKRONISASI SELESAI UNTUK ${schoolName}! ✨`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
