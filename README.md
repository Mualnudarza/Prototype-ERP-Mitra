# Prototype-ERP-Mitra

Prototype front-end ERP Mitra berbasis HTML, CSS, dan JavaScript. Data prototype disimpan di `localStorage` lewat `assets/js/data.js`.

## Branch `dev-testing`

Branch ini berisi update prototype dari `main` dengan fokus perluasan modul ERP Mitra.

## Perubahan dari `main`

- Menambahkan halaman login: `login.html`.
- Memperbarui dashboard utama di `index.html` dengan ringkasan pelanggan, invoice, payment, settlement, dan daftar modul ERP.
- Menambahkan dynamic sidebar dan role switcher di `assets/js/app.js`.
- Memperluas data layer di `assets/js/data.js` untuk Mitra, Base Package, Billing, Payment, Settlement, Radius Logs, role, dan seed data prototype.
- Menambahkan modul Mitra Management:
  - `pages/mitra-management/index.html`
  - `pages/mitra-management/edit.html`
  - `assets/js/mitra-management-list.js`
  - `assets/js/mitra-management-edit.js`
- Menambahkan modul Base Package ISP:
  - `pages/base-package/index.html`
  - `pages/base-package/edit.html`
  - `assets/js/base-package-list.js`
  - `assets/js/base-package-edit.js`
- Menambahkan modul Billing / Invoice:
  - `pages/billing/index.html`
  - `assets/js/billing-list.js`
- Menambahkan modul Payment Gateway:
  - `pages/payment/index.html`
  - `assets/js/payment-list.js`
- Menambahkan modul Settlement Mitra:
  - `pages/settlement/index.html`
  - `assets/js/settlement-list.js`
- Menambahkan modul Radius Logs:
  - `pages/radius/index.html`
  - `assets/js/radius-list.js`
- Menambahkan halaman operasional jaringan:
  - `pages/olt-management/index.html`
  - `pages/odp-management/index.html`
  - `pages/monitoring-olt/index.html`

## Ringkasan Teknis

- Total perubahan dari `main`: 23 file.
- File baru: 20 file.
- File diperbarui: 3 file (`index.html`, `assets/js/app.js`, `assets/js/data.js`).
- Perubahan utama: prototype ERP Mitra diperluas dari dashboard dasar menjadi multi-modul untuk operasional mitra, billing, payment, settlement, Radius, dan jaringan.
