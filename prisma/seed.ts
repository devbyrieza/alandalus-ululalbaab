import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Ambil Nama Sekolah langsung dari Env (Menghindari bug hoisting)
    const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'Al-Andalus PPDB';

    // Tentukan Suffix Email berdasarkan Branding
    const emailSuffix = schoolName.toLowerCase().includes('al-imam') 
        ? 'alimam.com' 
        : 'ululalbaab.com';

    // 1. Seed Tahun Ajaran
    let tahunAjaran = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });

    if (tahunAjaran) {
        console.log('Found existing active Tahun Ajaran:', tahunAjaran.id);
        try {
            tahunAjaran = await prisma.tahunAjaran.update({
                where: { id: tahunAjaran.id },
                data: {
                    nama: '2026/2027',
                    tahun_mulai: 2026,
                    tahun_selesai: 2027,
                }
            });
        } catch (e) {
            console.log('Update active year failed, using as is.');
        }
    } else {
        console.log('No active year found, attempting to create seed year...');
        try {
            tahunAjaran = await prisma.tahunAjaran.upsert({
                where: { id: '11111111-1111-1111-1111-111111111111' },
                update: { is_active: true },
                create: {
                    id: '11111111-1111-1111-1111-111111111111',
                    tahun_mulai: 2026,
                    tahun_selesai: 2027,
                    nama: '2026/2027',
                    is_active: true,
                    tanggal_buka_pendaftaran: new Date('2026-01-01'),
                    tanggal_tutup_pendaftaran: new Date('2026-12-31'),
                    biaya_pendaftaran: 250000,
                },
            });
        } catch (error) {
            tahunAjaran = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
            if (!tahunAjaran) throw error;
        }
    }

    console.log('Using Tahun Ajaran:', tahunAjaran.nama);

    // 2. Create Users (Profiles) DIRECTLY in Database
    const staffToCreate = [
        { prefix: 'admin', name: 'Super Admin', role: 'admin_super', phone: '081234567890', label: 'ADMIN_SUPER' },
        { prefix: 'admin.berkas', name: 'Admin Berkas', role: 'admin_berkas', phone: '081234567801', label: 'ADMIN_BERKAS' },
        { prefix: 'admin.keuangan', name: 'Admin Keuangan', role: 'admin_keuangan', phone: '081234567802', label: 'ADMIN_KEUANGAN' },
        { prefix: 'penguji', name: 'Ustadz Penguji', role: 'penguji', phone: '081234567803', label: 'PENGUJI' },
        { prefix: 'headit', name: 'Head of IT', role: 'head_of_it', phone: '085111524441', label: 'HEADIT' }
    ];

    const usersToCreate = staffToCreate.map(s => {
        const firstName = s.name.split(' ')[0];
        const capitalFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        return {
            email: `${s.prefix}@${emailSuffix}`,
            password: `${capitalFirstName}26!`,
            role: s.role,
            name: s.name,
            phone: s.phone,
            label: s.label
        };
    });

    const createdUsers: Record<string, string> = {};

    for (const u of usersToCreate) {
        console.log(`Processing user: ${u.email} (Password: ${u.password})...`);

        // Check if profile exists by email
        const existingProfile = await prisma.profile.findFirst({
            where: { email: u.email }
        });

        let userId = existingProfile?.id;

        if (!existingProfile) {
            // Create new profile
            userId = crypto.randomUUID();
            const hashedPassword = await bcrypt.hash(u.password, 10);

            await prisma.profile.create({
                data: {
                    id: userId,
                    email: u.email,
                    password_hash: hashedPassword,
                    role: u.role,
                    full_name: u.name,
                    phone: u.phone,
                    updated_at: new Date(),
                }
            });
            console.log(`Created new user: ${u.email}`);
        } else {
            // Update existing profile (ensure password matches our new rules)
            const hashedPassword = await bcrypt.hash(u.password, 10);
            await prisma.profile.update({
                where: { id: userId },
                data: {
                    password_hash: hashedPassword,
                    role: u.role,
                    full_name: u.name,
                    phone: u.phone
                }
            });
            console.log(`Updated existing user: ${u.email}`);
        }

        createdUsers[u.label] = userId!;
    }

    console.log('Created/Verified Users & Profiles');

    // 3. Seed Pendaftar
    const { ADMIN, ADMIN_SUPER, ADMIN_BERKAS, ADMIN_KEUANGAN, PENGUJI, DRAFT, PENDING, VERIFIED, COMPLETED } = createdUsers;

    // --- Case 1: Draft (MTs) ---
    console.log('Seeding DRAFT...');
    await prisma.pendaftar.upsert({
        where: { nomor_pendaftaran: 'REG-2025-001' },
        update: {},
        create: {
            user_id: DRAFT,
            tahun_ajaran_id: tahunAjaran.id,
            nomor_pendaftaran: 'REG-2025-001',
            nik: '3201000000000001',
            nama_lengkap: 'Ahmad Draft',
            jenis_kelamin: 'L',
            jenjang: 'MTs',
            status_pendaftaran: 'draft',
            verifikasi_status: 'pending',
        },
    });

    // --- Case 2: Pending (MA) - Represents Payment Verification ---
    console.log('Seeding PENDING...');
    const pendaftarPending = await prisma.pendaftar.upsert({
        where: { nomor_pendaftaran: 'REG-2025-002' },
        update: {},
        create: {
            user_id: PENDING,
            tahun_ajaran_id: tahunAjaran.id,
            nomor_pendaftaran: 'REG-2025-002',
            nik: '3201000000000002',
            nama_lengkap: 'Budi Pending',
            jenis_kelamin: 'L',
            jenjang: 'SMA',
            tempat_lahir: 'Jakarta',
            tanggal_lahir: new Date('2010-01-01'),
            alamat: 'Jl. Merdeka No. 1',
            no_hp: '081234567892',
            status_pendaftaran: 'payment_verification',
            verifikasi_status: 'verified',
        },
    });

    await prisma.orangTua.upsert({
        where: { pendaftar_id: pendaftarPending.id },
        update: {},
        create: {
            pendaftar_id: pendaftarPending.id,
            nama_ayah: 'Ayah Budi',
            no_hp_ayah: '08111111111',
        }
    });

    // --- Case 3: Verified (MTs) ---
    console.log('Seeding VERIFIED...');
    const pendaftarVerified = await prisma.pendaftar.upsert({
        where: { nomor_pendaftaran: 'REG-2025-003' },
        update: {},
        create: {
            user_id: VERIFIED,
            tahun_ajaran_id: tahunAjaran.id,
            nomor_pendaftaran: 'REG-2025-003',
            nik: '3201000000000003',
            nama_lengkap: 'Citra Verified',
            jenis_kelamin: 'P',
            jenjang: 'MTs',
            tempat_lahir: 'Bandung',
            tanggal_lahir: new Date('2010-02-02'),
            alamat: 'Jl. Asia Afrika No. 10',
            status_pendaftaran: 'verified',
            verifikasi_status: 'verified',
        },
    });

    // CORRECTED: document types
    const doks = ['kartu_keluarga', 'akta_kelahiran'];
    for (const d of doks) {
        const count = await prisma.dokumen.count({ where: { pendaftar_id: pendaftarVerified.id, jenis_dokumen: d } });
        if (count === 0) {
            await prisma.dokumen.create({
                data: {
                    pendaftar_id: pendaftarVerified.id,
                    jenis_dokumen: d,
                    file_name: `${d}.pdf`,
                    file_path: `uploads/${d}.pdf`,
                    is_verified: true,
                    verified_by: createdUsers['ADMIN_BERKAS'] || ADMIN,
                    verified_at: new Date(),
                }
            });
        }
    }

    await prisma.pembayaran.deleteMany({ where: { pendaftar_id: pendaftarVerified.id } });
    await prisma.pembayaran.create({
        data: {
            pendaftar_id: pendaftarVerified.id,
            tahun_ajaran_id: tahunAjaran.id,
            metode_pembayaran: 'manual', // CORRECTED: 'manual_transfer' -> 'manual'
            jumlah: 250000,
            status_pembayaran: 'verified',
            verified_by: createdUsers['ADMIN_KEUANGAN'] || ADMIN,
            verified_at: new Date(),
        }
    });

    // --- Case 4: Completed (MA) ---
    console.log('Seeding ACCEPTED...');
    const pendaftarCompleted = await prisma.pendaftar.upsert({
        where: { nomor_pendaftaran: 'REG-2025-004' },
        update: {},
        create: {
            user_id: COMPLETED,
            tahun_ajaran_id: tahunAjaran.id,
            nomor_pendaftaran: 'REG-2025-004',
            nik: '3201000000000004',
            nama_lengkap: 'Dewi Completed',
            jenis_kelamin: 'P',
            jenjang: 'SMA',
            status_pendaftaran: 'accepted',
            verifikasi_status: 'verified',
        },
    });

    console.log('Seeding finished successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        const fs = await import('fs');
        fs.writeFileSync('seed_error.txt', JSON.stringify(e, null, 2) + '\n' + e.toString());
        await prisma.$disconnect();
        process.exit(1);
    });
