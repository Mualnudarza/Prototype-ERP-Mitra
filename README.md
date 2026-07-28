# Prototype-ERP-Mitra

## Branch: `feat/prototype-v2`

Restrukturisasi total prototype dari multi-page ke single-page application.

### Perubahan Utama

| Aspek | Sebelum (main) | Sesudah (feat/prototype-v2) |
| :---- | :---- | :---- |
| Arsitektur | Multi-page (HTML terpisah per halaman) | Single-page (SPA hash-based routing) |
| File | 20+ file HTML/JS/CSS | 1 file HTML + 4 file JS |
| CSS | Terpisah per modul + theme.css | Semua di `<style>` tag, CSS custom properties |
| Navigasi | Hardcoded sidebar di setiap HTML | Dinamis dari `NAV_CONFIG` via `renderSidebar()` |
| Data | Terpisah di `data.js` | Sentralisasi di `app-data.js` (`DB` global) |
| Framework | - | Vanilla JS, zero dependencies |

### Struktur File Baru

```
├── erp-mitra-prototype.html    # Entry point, CSS, app shell
├── app-data.js                 # Mock data layer, helper functions
├── app-ui.js                   # UI components (DataTable, KPIs, Modal, dll)
├── app-modules.js              # View functions (11 modul)
├── app-main.js                 # Router, NAV_CONFIG, init
├── PRD.md                      # Context PRD (Prototype Context PRD)
├── AGENTS.md                   # Agent instructions
└── RULES.md                    # Development rules
```

### Modul yang Tersedia

| Grup | Modul | Route Key |
| :---- | :---- | :---- |
| Kemitraan | Data Mitra | `partnership.mitra` |
| Kemitraan | Manajemen Pengguna | `partnership.pengguna` |
| Kemitraan | Dashboard Pendapatan | `partnership.pendapatan` |
| Pelanggan | Data Pelanggan | `customer.pelanggan` |
| Pelanggan | Registrasi Pelanggan | `customer.registrasi` |
| Pelanggan | Paket Layanan | `customer.paket` |
| Keuangan | Billing Customer | `billing.tagihan` |
| Keuangan | Riwayat Settlement | `billing.settlement` |
| Keuangan | Payment Gateway | `payment.gateway` |
| Jaringan | Radius & Status | `radius.monitoring` |
| Jaringan | Topologi Infrastruktur | `infra.topologi` |
| Jaringan | Data Perangkat | `infra.perangkat` |

### Cara Menjalankan

Buka `erp-mitra-prototype.html` langsung di browser. Tidak perlu server, build, atau install dependency.

### Catatan

- Semua data dummy/in-memory — reload browser = reset
- Tidak ada backend, autentikasi, atau integrasi API
- Lihat `PRD.md` untuk dokumentasi konteks lengkap
