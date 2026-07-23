# Aturan dan Standar Pengembangan (Rules & Guidelines)

File ini berisi panduan, konvensi, dan aturan-aturan arsitektural yang harus dipatuhi selama pengembangan proyek ini. **Jika ada aturan baru atau penyesuaian, harap tambahkan ke dalam file ini agar menjadi referensi bersama.**

## 1. Struktur Modul dan File
- **Modul dan Fitur:** Setiap modul bisnis utama harus memiliki foldernak sendiri di dalam folder `pages/` (misal: `pages/customer-management/`). Semua file HTML terkait fitur di dalam modul tersebut harus berada di dalam folder yang sama (contoh: `index.html` untuk list, `edit.html` untuk form edit).
- **Aset Khusus Modul:** Jika ada CSS atau JS yang spesifik hanya untuk satu modul, letakkan file tersebut dengan prefix nama modul di folder `assets/css/` atau `assets/js/` (contoh: `assets/css/customer-management.css`, `assets/js/customer-management-list.js`), atau letakkan di dalam folder modul itu sendiri jika skala proyek membesar.
- **Aset Global:** File CSS global seperti `theme.css` dan JS global seperti `app.js` digunakan untuk layout dasar, komponen shell (sidebar, topbar), utilitas umum, dan tema.

## 2. Sinkronisasi Data dan State
- **Single Source of Truth:** Semua data mock atau state aplikasi sementara harus dikelola secara terpusat (saat ini menggunakan `assets/js/data.js`).
- **Sinkronisasi UI:** Setiap perubahan data (seperti menambah, mengedit, atau menghapus) harus segera tercermin di UI. Panggil ulang fungsi render atau update DOM terkait setelah operasi data berhasil.
- **Konsistensi Status:** Pastikan logika untuk menghitung statistik (seperti jumlah total, aktif, isolir, terminate di Dashboard) selalu membaca dari *state* terbaru dan disinkronisasi setiap kali ada pembaruan data.

## 3. UI/UX & Tema
- **Tema Netral (Light Mode):** Desain menggunakan pendekatan *Light Mode* yang bersih.
- **Warna Aksen:** Warna utama (Primary/Accent) adalah **Biru Langit** (`#3B82F6` / `var(--color-accent)`). Warna ini digunakan untuk tombol utama, link, dan elemen interaktif yang perlu *highlight*.
- **Aksesibilitas & Kontras:** Pastikan teks selalu kontras terhadap background. Teks utama menggunakan warna gelap (`var(--color-text)` / `#18181B`), sedangkan background dominan putih (`#FFFFFF`) atau abu-abu sangat terang (`#F8F8F8`).
- **Sidebar & Topbar:** Menggunakan background terang (`#FFFFFF` atau semi-transparan putih dengan *blur*) agar selaras dengan *light mode*. Menu yang aktif ditandai dengan warna aksen biru.
- **Responsive & Layar Penuh:** Elemen utama (`.page`) harus dirancang memenuhi lebar layar (`width: 100%`, `max-width: none`), dengan tetap mempertahankan *padding* yang proporsional.

## 4. Konvensi Kode
- **Penamaan Class CSS:** Gunakan *kebab-case* (misal: `btn-primary`, `nav-item`).
- **Penamaan Variabel JS:** Gunakan *camelCase* untuk variabel lokal dan fungsi (misal: `renderTable`, `customerData`). Gunakan *PascalCase* untuk class atau object global (misal: `CustomerDB`).
- **Pemisahan Logika:** Hindari menulis logika JS secara *inline* di dalam file HTML (seperti atribut `onclick`). Gunakan *event listener* di file JS terpisah.

## 5. Navigasi dan Label Modul
- Modul "Operasional" dinamakan menjadi **"Modul Customer Management"**.
- Fitur/Menu yang belum tersedia jangan ditampilkan di Sidebar untuk menghindari kebingungan pengguna (seperti menu yang sebelumnya berlabel "Segera"). Hanya tampilkan menu yang sudah dapat digunakan secara fungsional.

---
**Catatan untuk Developer:** File ini bersifat hidup (living document). Jangan ragu untuk memperbarui atau menambahkan poin baru di sini jika ada kesepakatan desain, alur data, atau konvensi baru yang diimplementasikan.
