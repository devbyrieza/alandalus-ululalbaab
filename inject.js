const fs = require('fs');
const path = require('path');

const file = 'c:/Users/itpua/Dev/Work/al-andalus/alandalus-ululalbaab/src/app/dashboard/admin/pendaftar/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr =   const handleExport = async (type: "excel" | "pdf") => {
    try {;

const replaceStr =   const handleExport = async (type: "excel" | "pdf") => {
    if (type === "excel") {
      Swal.fire({
        title: 'Fitur Terkunci 👑',
        text: 'Fitur Export Excel Lengkap (Laporan Data Otomatis) hanya tersedia di versi Gold/Platinum. Hubungi Tim Pusat/Developer untuk melakukan Upgrade.',
        icon: 'info',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Mengerti'
      });
      return;
    }
    try {;

content = content.replace(targetStr, replaceStr);

// Also add crown emoji to button
const btnTarget = <span className="hidden sm:inline">Export Excel</span>;
const btnReplace = <span className="hidden sm:inline">Export Excel 👑</span>;
content = content.replace(btnTarget, btnReplace);

fs.writeFileSync(file, content, 'utf8');
