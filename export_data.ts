import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log("Fetching data from database...");
    const pendaftars = await prisma.pendaftar.findMany({
      where: {
        deleted_at: null,
        // Mengeluarkan status yang biasanya dianggap sampah atau batal
        status_pendaftaran: {
          notIn: ['draft']
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    console.log(`Found ${pendaftars.length} records.`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Santri', {
      views: [{ state: 'frozen', ySplit: 5 }] // Bekukan 5 baris pertama (Title + Header) agar mudah di-scroll
    });

    // Aktifkan gridlines secara eksplisit
    worksheet.views[0].showGridLines = true;

    // Set kolom tanpa header (header akan dibuat manual di baris 5 agar bisa didesain)
    worksheet.columns = [
      { key: 'no', width: 6 },
      { key: 'id1', width: 22 },
      { key: 'id2', width: 22 },
      { key: 'nama', width: 35 },
      { key: 'tempatLahir', width: 20 },
      { key: 'tanggalLahir', width: 15 },
      { key: 'jk', width: 15 },
      { key: 'alamat', width: 45 },
      { key: 'jenjang', width: 12 },
      { key: 'kelas', width: 12 },
      { key: 'kelasDetail', width: 15 },
      { key: 'tags', width: 18 },
      { key: 'note', width: 35 }
    ];

    // --- 1. TITLE BLOCK (SUPER RAPI) ---
    // Baris 1: Kosong untuk spacing atas
    worksheet.getRow(1).height = 10;

    // Baris 2: Judul Utama
    worksheet.mergeCells('A2:M2');
    const titleCell = worksheet.getCell('A2');
    titleCell.value = 'DATA PENDAFTAR SANTRI BARU (PPDB) - ULUL ALBAAB';
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF1F4E79' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(2).height = 30;

    // Baris 3: Sub-judul / Metadata info
    worksheet.mergeCells('A3:M3');
    const subtitleCell = worksheet.getCell('A3');
    const tglEkspor = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    subtitleCell.value = `Tanggal Ekspor: ${tglEkspor} | Total Santri Aktif: ${pendaftars.length} Orang`;
    subtitleCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF595959' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(3).height = 20;

    // Baris 4: Spacing kosong sebelum tabel
    worksheet.getRow(4).height = 10;

    // --- 2. HEADER TABEL (BARIS 5) ---
    const headerRow = worksheet.getRow(5);
    headerRow.values = [
      'No', 
      'Nomor Identitas 1', 
      'Nomor Identitas 2', 
      'Nama Lengkap', 
      'Tempat Lahir', 
      'Tanggal Lahir', 
      'L/P', 
      'Alamat Lengkap', 
      'Jenjang', 
      'Kelas', 
      'Kelas Detail', 
      'Tags', 
      'Note'
    ];
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E79' } // Navy Blue
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF122F4A' } },
        left: { style: 'thin', color: { argb: 'FFFFFFFF' } }, // Border putih antar kolom header
        bottom: { style: 'medium', color: { argb: 'FF122F4A' } },
        right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
      };
    });

    // --- 3. DATA ROWS ---
    pendaftars.forEach((p, index) => {
      let tanggalLahir = "-";
      if (p.tanggal_lahir) {
        const d = new Date(p.tanggal_lahir);
        tanggalLahir = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      const row = worksheet.addRow({
        no: index + 1,
        id1: p.nisn || p.nomor_induk_lama || "",
        id2: "",
        nama: p.nama_lengkap ? p.nama_lengkap.toUpperCase() : "-",
        tempatLahir: p.tempat_lahir ? p.tempat_lahir.toUpperCase() : "-",
        tanggalLahir: tanggalLahir,
        jk: p.jenis_kelamin === "L" ? "L" : (p.jenis_kelamin === "P" ? "P" : p.jenis_kelamin || "-"),
        alamat: p.alamat || "-",
        jenjang: p.jenjang ? p.jenjang.toUpperCase() : "-",
        kelas: "",
        kelasDetail: "",
        tags: "",
        note: ""
      });

      row.height = 22; // Tinggi baris data yang ideal

      // Zebra striping color (baris ganjil/genap)
      const isEvenRow = index % 2 === 0;
      const rowBgColor = isEvenRow ? 'FFFFFFFF' : 'FFF2F6FA'; // Putih vs Biru-Abu Sangat Lembut

      row.eachCell((cell, colNumber) => {
        // Set Font Segoe UI untuk semua cell data
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF333333' } };
        
        // Background color
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowBgColor }
        };

        // Alignments default
        cell.alignment = { vertical: 'middle', wrapText: true };

        // Gridlines border abu-abu tipis
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };

        // Alignment khusus kolom tengah
        // 1: No, 2: ID 1, 3: ID 2, 6: Tgl Lahir, 7: L/P, 9: Jenjang, 10: Kelas, 11: Kelas Detail, 12: Tags
        if ([1, 2, 3, 6, 7, 9, 10, 11, 12].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }
      });
    });

    const outputPath = 'C:\\Users\\itpua\\Downloads\\Data_Santri_Ululalbaab_Export_v7.xlsx';
    
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Successfully exported to ${outputPath}`);
  } catch (error) {
    console.error("Error exporting data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
