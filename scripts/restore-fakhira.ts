import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 RESTORING FAKHIRA FAUZIYYAH RAMADHANI AND SIBLINGS...\n');

    const FAKHIRA_DATA = {
        nama_lengkap: 'Fakhira Fauziyyah Ramadhani',
        nomor_pendaftaran: 'D250028',
        nik: '3202286010130002', // Placeholder based on sister
        email: 'halimahnurjalalhfnjl@gmail.com',
        no_hp: '081546829796',
        jenis_kelamin: 'P',
        jenjang: 'MTS',
        status_pendaftaran: 'enrolled',
        tahun_ajaran_id: '11111111-1111-1111-1111-111111111111'
    };

    const ULFIA_ID = '59a42290-abcc-4968-9de5-a11d176691b4';

    // 1. Un-delete Ulfia Nurfauziah
    console.log('📦 1. Un-deleting Ulfia Nurfauziah...');
    await prisma.pendaftar.update({
        where: { id: ULFIA_ID },
        data: {
            deleted_at: null,
            deleted_by: null,
            status_pendaftaran: 'enrolled' // Ensure she is enrolled
        }
    });
    console.log('   ✓ Ulfia is now active.');

    // 2. Check if Fakhira already exists
    console.log('\n📦 2. Restoring Fakhira Fauziyyah Ramadhani...');
    let fakhira = await prisma.pendaftar.findFirst({
        where: {
            OR: [
                { nama_lengkap: { contains: 'Fakhira', mode: 'insensitive' } },
                { nomor_pendaftaran: FAKHIRA_DATA.nomor_pendaftaran }
            ]
        }
    });

    if (fakhira) {
        console.log(`   ⚠ Fakhira already exists (ID: ${fakhira.id}). Updating...`);
        fakhira = await prisma.pendaftar.update({
            where: { id: fakhira.id },
            data: {
                ...FAKHIRA_DATA,
                deleted_at: null,
                deleted_by: null
            }
        });
    } else {
        console.log('   ⚠ Fakhira not found, creating new...');
        
        // Create Profile first
        const passwordHash = await bcrypt.hash(FAKHIRA_DATA.nik, 10);
        const profile = await prisma.profile.create({
            data: {
                id: crypto.randomUUID(),
                full_name: FAKHIRA_DATA.nama_lengkap,
                email: FAKHIRA_DATA.email,
                phone: FAKHIRA_DATA.no_hp,
                role: 'pendaftar',
                password_hash: passwordHash
            }
        });
        console.log(`   ✓ Profile created (ID: ${profile.id})`);

        // Create Pendaftar
        fakhira = await prisma.pendaftar.create({
            data: {
                id: crypto.randomUUID(),
                user_id: profile.id,
                ...FAKHIRA_DATA
            }
        });
        console.log(`   ✓ Pendaftar created (ID: ${fakhira.id})`);

        // Link Parents (Halimah Fauziah)
        const halimah = await prisma.orangTua.findFirst({
            where: { pendaftar_id: ULFIA_ID }
        });

        if (halimah) {
            const { id, pendaftar_id, created_at, updated_at, ...parentData } = halimah as any;
            await prisma.orangTua.create({
                data: {
                    ...parentData,
                    id: crypto.randomUUID(),
                    pendaftar_id: fakhira.id
                }
            });
            console.log('   ✓ Parents data linked from Ulfia.');
        }
    }

    console.log('\n✅ RESTORE COMPLETED!');
    console.log(`   Fakhira: ${fakhira.nama_lengkap} (${fakhira.nomor_pendaftaran})`);
    console.log(`   Ulfia: Active`);
    console.log('\n📝 LOGIN CREDENTIALS (Fakhira):');
    console.log(`   - Username: ${fakhira.nomor_pendaftaran} or ${fakhira.nik}`);
    console.log(`   - Password: ${fakhira.nik}`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
