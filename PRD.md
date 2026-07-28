# Prototype ERP Mitra — Context PRD

| Project | : Prototype ERP Mitra |
| Tipe | : Prototype |
| Stack | : HTML + CSS + Vanilla JS (no framework, no build system, no dependencies) |
| Status | : Aktif |
| Terakhir diupdate | : 2026-07-28 |
| Sumber acuan | : Belum ada BRD, ini exploratory |

---

## Ringkasan

Prototype sistem informasi ERP untuk operator internet (ISP) berbasis mitra. Cakupan yang ada: pengelolaan kemitraan (mitra, pengguna, pendapatan), manajemen pelanggan (data, registrasi ONU, paket layanan), billing & settlement, monitoring payment gateway, monitoring radius/status layanan, dan infrastruktur jaringan (topologi OLT/splitter, data perangkat). Semua data dummy/in-memory — reload browser menghapus semua perubahan. Tidak ada backend, autentikasi, atau integrasi API.

---

## Daftar Modul

#### Data Mitra (`partnership.mitra`)
- **Fungsi**: Menampilkan dan mengelola daftar mitra operator (partner) dengan data kode mitra, nama, perusahaan, wilayah operasional, jumlah pengguna, dan status.
- **Lokasi file**: `app-modules.js:54-204`, data di `app-data.js` (`DB.partners`)
- **Data yang dibutuhkan**:
  - Input: partner_code, partner_name, company_name, phone_number, email, address, operational_area (dari `WILAYAH_LIST`: Jabodetabek, Jawa Barat, Jawa Tengah, Jawa Timur, Bali & Nusra, Sumatera Utara, Kalimantan Timur), business_configuration, status
  - Tampil: KPI grid (total mitra, mitra aktif, total pengguna, wilayah operasional), DataTable dengan kolom kode, nama mitra, nama perusahaan, wilayah, jumlah pengguna, status
- **Ketergantungan**: `DataTable`, `renderKPIs`, `badge`, `openModal`, `activityTimeline`, `pushActivity`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 6 mitra dummy data

#### Manajemen Pengguna (`partnership.pengguna`)
- **Fungsi**: Mengelola akun pengguna di bawah masing-masing mitra. Setiap pengguna memiliki role (Administrator Mitra, Staf Billing, Staf Customer Service, Teknisi), status, dan last login.
- **Lokasi file**: `app-modules.js:206-322`, data di `app-data.js` (`DB.users`, `DB.roles`)
- **Data yang dibutuhkan**:
  - Input: partner_id (FK ke partners), user_name, username, role_name, user_status
  - Tampil: DataTable dengan kolom nama pengguna, username, role (badge), status, login terakhir. Modal detail menampilkan info lengkap + timeline aktivitas.
- **Ketergantungan**: `DB.partners` (untuk referensi nama mitra), `DataTable`, `badge`, `openModal`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 8 pengguna dummy, 4 role

#### Dashboard Pendapatan (`partnership.pendapatan`)
- **Fungsi**: Menampilkan ringkasan pendapatan per mitra dengan filter periode, status, dan mitra. Termasuk grafik bar 6 bulan terakhir, progress bar status invoice, dan tabel riwayat settlement.
- **Lokasi file**: `app-modules.js:324-442`, data di `app-data.js` (`DB.settlementHistory`)
- **Data yang dibutuhkan**:
  - Input: filter partner, periode (6 bulan terakhir), status pembayaran
  - Tampil: KPI (total pendapatan, belum dibayar, pelanggan aktif, total settlement), bar chart pendapatan 6 bulan, progress bar invoice status, DataTable riwayat settlement (ref, tipe, nominal, saldo sebelum/sesudah, tanggal, catatan)
- **Ketergantungan**: `barChart`, `DataTable`, `renderKPIs`, `DB.settlementHistory`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 4 settlement records

#### Data Pelanggan (`customer.pelanggan`)
- **Fungsi**: Mengelola data pelanggan akhir (end-user) termasuk kredensial PPPoE, informasi perangkat (modem, OLT port, ONU), koordinat lokasi, dan status langganan.
- **Lokasi file**: `app-modules.js:448-619`, data di `app-data.js` (`DB.customers`)
- **Data yang dibutuhkan**:
  - Input: partner_id, pppoe_secret, radius_username, customer_name, phone_number, customer_type (Reguler/Fasum), subscribe_date, expired_date, installation_address, package_id, modem_serial_number, latitude, longitude, olt_port, onu_number, access_name, access_port
  - Tampil: Banner peringatan untuk pelanggan Unregistered, KPI grid 5 kolom (total, active, isolir, terminate, unregistered), DataTable dengan kolom PPPoE secret, nama, telepon, expired, paket, status
- **Ketergantungan**: `DB.packages` (lookup nama & harga paket), `DB.partners`, `DataTable`, `renderKPIs`, `openModal`, `fieldsHTML`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 10 pelanggan dummy (2 Unregistered)

#### Registrasi Pelanggan (`customer.registrasi`)
- **Fungsi**: Antrean registrasi ONU untuk pelanggan berstatus Unregistered. Menampilkan daftar pelanggan yang menunggu registrasi ke perangkat OLT, beserta modal untuk input serial number modem dan generate script CLI per vendor (Huawei, ZTE, Fiberhome).
- **Lokasi file**: `app-modules.js:744-810`, data dari `DB.customers` (filter `Unregistered`)
- **Data yang dibutuhkan**:
  - Input: customer_id, modem_serial_number, olt_id, olt_slot, olt_pon
  - Tampil: KPI (ukuran antrean, mitra terlibat, menunggu >3 hari), daftar pelanggan Unregistered dengan tombol "Registrasi". Modal registrasi menampilkan info pelanggan, input SN, selector OLT/Slot/PON, dan script CLI yang di-generate per vendor (Huawei MA5800, ZTE C320, Fiberhome AN5516) dengan tombol copy.
- **Ketergantungan**: `DB.customers`, `DB.infrastructure` (OLT nodes), `genOnuScripts()` (generates CLI scripts), `openRegistrationModal()`, `pushActivity()`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, flow registrasi ONU dengan generate script CLI

#### Paket Layanan (`customer.paket`)
- **Fungsi**: Mengelola paket layanan internet yang ditawarkan per mitra, termasuk nama paket, bandwidth, harga, dan status.
- **Lokasi file**: `app-modules.js:812-877`, data di `app-data.js` (`DB.packages`)
- **Data yang dibutuhkan**:
  - Input: partner_id, package_name, bandwidth, price, status
  - Tampil: DataTable dengan kolom nama paket, mitra, bandwidth (badge cyan), harga (Rupiah), status
- **Ketergantungan**: `DB.partners`, `DataTable`, `badge`, `openModal`, `Fmt.rupiah()`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 6 paket dummy

#### Billing Customer (`billing.tagihan`)
- **Fungsi**: Menampilkan tagihan pelanggan dengan informasi nomor invoice, nama pelanggan, paket, periode billing, nominal, jatuh tempo, dan status (Lunas/Belum Dibayar/Jatuh Tempo).
- **Lokasi file**: `app-modules.js:883-948`, data di `app-data.js` (`DB.invoices`)
- **Data yang dibutuhkan**:
  - Input: customer_id, invoice_number, billing_period, billing_amount, generated_date, due_date, billing_status
  - Tampil: KPI (total invoice, belum dibayar, lunas, total nilai), DataTable dengan kolom nomor invoice, nama pelanggan, paket, periode, nominal, jatuh tempo, status. Modal detail invoice.
- **Ketergantungan**: `DB.customers` (lookup nama), `DB.packages` (lookup nama paket), `DataTable`, `renderKPIs`, `openModal`, `Fmt.rupiah()`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 8 invoice dummy

#### Riwayat Settlement (`billing.settlement`)
- **Fungsi**: Menampilkan riwayat transaksi keuangan antara mitra dan platform: settlement, top up, dan auto deduction. Menampilkan saldo sebelum/sesudah transaksi.
- **Lokasi file**: `app-modules.js:950-1014`, data di `app-data.js` (`DB.settlementHistory`)
- **Data yang dibutuhkan**:
  - Input: partner_id, type (Settlement/Top Up/Auto Deduction), amount, balance_before, balance_after, date, note
  - Tampil: KPI (saldo saat ini, total settlement, top up, auto deduction), DataTable dengan kolom referensi, tipe (badge), nominal (hijau/merah), saldo sebelum, saldo sesudah, tanggal, catatan. Modal detail.
- **Ketergantungan**: `DB.settlementHistory`, `DataTable`, `renderKPIs`, `badge`, `openModal`, `Fmt.rupiah()`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 4 settlement records (shared data dengan Dashboard Pendapatan)

#### Payment Gateway (`payment.gateway`)
- **Fungsi**: Monitoring transaksi pembayaran melalui payment gateway (Paspe). Menampilkan referensi pembayaran, virtual account, nominal, waktu, dan status (Berhasil/Pending/Gagal).
- **Lokasi file**: `app-modules.js:1020-1089`, data di `app-data.js` (`DB.payments`)
- **Data yang dibutuhkan**:
  - Input: invoice_id, payment_reference, virtual_account, billing_amount, payment_date, payment_status
  - Tampil: KPI (total transaksi, berhasil, gagal, total nilai), DataTable dengan kolom referensi, nomor invoice, nama pelanggan, virtual account, nominal, waktu, status. Modal detail dengan timeline callback.
- **Ketergantungan**: `DB.invoices` (lookup nomor invoice), `DB.customers` (lookup nama), `DataTable`, `renderKPIs`, `openModal`, `Fmt.rupiah()`, `Fmt.datetime()`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 5 payment records

#### Radius & Status (`radius.monitoring`)
- **Fungsi**: Monitoring status koneksi radius pelanggan — online, isolir, atau terminate. Memungkinkan aksi manual isolir dan aktivasi ulang langsung dari detail modal.
- **Lokasi file**: `app-modules.js:1095-1183`, data di `app-data.js` (`DB.radius`, derived dari `DB.customers`)
- **Data yang dibutuhkan**:
  - Input: customer_id, bandwidth (dari package), customer_status, radius_status, isolation_date, activation_date, last_update
  - Tampil: KPI (online, isolir, active, synced), DataTable dengan kolom PPPoE secret, nama pelanggan, radius username, bandwidth, customer status, radius status, update terakhir. Modal detail dengan tombol "Isolir Manual" / "Aktivasi Ulang" (kontekstual berdasarkan status). Pelanggan Fasum tidak bisa diisolir.
- **Ketergantungan**: `DB.customers`, `DB.packages`, `DB.radius` (derived), `DataTable`, `renderKPIs`, `openModal`, `pushActivity()`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, status sync antara radius dan customers

#### Topologi Infrastruktur (`infra.topologi`)
- **Fungsi**: Menampilkan pohon topologi infrastruktur jaringan: OLT → Input Splitter → Output Splitter. Mendukung expand/collapse, seleksi node, panel detail, dan penambah Output Splitter baru.
- **Lokasi file**: `app-modules.js:1208-1383`, data di `app-data.js` (`DB.infrastructure`)
- **Data yang dibutuhkan**:
  - Input (OLT): id, label, partner_id, olt_type (Huawei MA5800/ZTE C320/Fiberhome AN5516)
  - Input (Output Splitter): lat, lng, address, capacity (8/16), connected, status (Aktif/Penuh)
  - Tampil: KPI (total OLT, total splitter, titik tersedia, total pelanggan), pohon interaktif (klik expand/collapse), panel detail node (info, progress bar kapasitas, editor lat/lng dengan placeholder peta), tombol "Tambah Titik" untuk Output Splitter baru
- **Ketergantungan**: `DB.infrastructure`, `DB.customers` (untuk count pelanggan per node), `renderKPIs`, `openModal`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 3 OLT nodes dengan tree interaktif

#### Data Perangkat (`infra.perangkat`)
- **Fungsi**: Menampilkan daftar flat (rata) dari seluruh perangkat dalam topologi infrastruktur — OLT, Input Splitter, dan Output Splitter — dalam satu tabel.
- **Lokasi file**: `app-modules.js:1385-1463`, data dari `DB.infrastructure` (diflatten via `allOltNodes()`)
- **Data yang dibutuhkan**:
  - Input: data dari tree `DB.infrastructure` (OLT, input splitter, output splitter)
  - Tampil: DataTable dengan kolom nama, tipe (badge: Port OLT/Input Splitter/Output Splitter), OLT ID, parent, lat, lng, status. Edit hanya untuk Output Splitter.
- **Ketergantungan**: `DB.infrastructure`, `allOltNodes()`, `findOltNode()`, `DataTable`, `badge`, `openModal`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, flatten view dari tree infrastructure

---

## Peta Ketergantungan Modul

```
partnership.mitra ──→ partnership.pengguna (FK partner_id)
                    ──→ partnership.pendapatan (FK partner_id)
                    ──→ customer.pelanggan (FK partner_id)
                    ──→ customer.paket (FK partner_id)

customer.pelanggan ──→ customer.registrasi (filter Unregistered)
                    ──→ billing.tagihan (FK customer_id)
                    ──→ payment.gateway (via invoice → customer)
                    ──→ radius.monitoring (derived dari customers)

customer.paket ──→ customer.pelanggan (lookup package_id)
               ──→ radius.monitoring (lookup bandwidth)

infra.topologi ──→ infra.perangkat (flatten dari tree)
               ──→ customer.registrasi (OLT nodes untuk registrasi)
```

---

## Struktur Data / Entitas Kunci

| Entitas | Field Kunci | Dipakai di Modul |
| :---- | :---- | :---- |
| Partner | id, partner_code, partner_name, company_name, operational_area, status | Data Mitra, Manajemen Pengguna, Dashboard Pendapatan, Data Pelanggan, Paket Layanan, Radius Monitoring |
| User | id, partner_id, user_name, username, role_name, user_status | Manajemen Pengguna |
| Customer | id, partner_id, pppoe_secret, radius_username, customer_name, package_id, customer_status, olt_port, onu_number | Data Pelanggan, Registrasi, Billing, Payment Gateway, Radius Monitoring |
| Package | id, partner_id, package_name, bandwidth, price, status | Paket Layanan, Data Pelanggan (lookup), Radius Monitoring (lookup) |
| Invoice | id, customer_id, invoice_number, billing_period, billing_amount, billing_status | Billing Customer, Payment Gateway (lookup) |
| Payment | id, invoice_id, payment_reference, virtual_account, billing_amount, payment_status | Payment Gateway |
| Settlement | id, partner_id, ref, type, amount, balance_before, balance_after | Dashboard Pendapatan, Riwayat Settlement |
| Infrastructure | id, type, label, partner_id, children (tree: OLT → Input Splitter → Output Splitter) | Topologi Infrastruktur, Data Perangkat, Registrasi (OLT nodes) |
| Radius | id, customer_id, bandwidth, customer_status, radius_status | Radius & Status |
| ActivityLog | actor, action, time | Shared (semua modul via `pushActivity()`) |

---

## Komponen UI Shared

| Komponen | Fungsi | Lokasi |
| :---- | :---- | :---- |
| `DataTable(opts)` | Tabel data dengan search, filter, sort, pagination | `app-ui.js` |
| `renderKPIs(items)` | Grid kartu KPI (4-5 kolom) | `app-ui.js` |
| `badge(text, variant)` | Label status/badge berwarna | `app-ui.js` |
| `Modal.open/close` | Modal overlay bersama (default/lg/xl) | `app-ui.js` |
| `toast(msg)` | Notifikasi sementara | `app-ui.js` |
| `barChart(data)` | Grafik bar vertikal sederhana | `app-ui.js` |
| `renderSidebar()` | Sidebar navigasi dari `NAV_CONFIG` | `app-ui.js` |
| `ICONS` | 31 ikon SVG inline | `app-ui.js` |
| `fieldsHTML(fields)` | Generator form fields dari config array | `app-modules.js` |
| `activityTimeline(entries)` | Timeline vertikal aktivitas | `app-modules.js` |
| `openRegistrationModal()` | Modal registrasi OLU dengan generate CLI script | `app-modules.js` |

---

## Catatan Teknis & Batasan Prototype

- **Tidak ada persistensi**: Semua data in-memory di objek `DB` global. Reload browser = reset data. Tombol "Reset data" hanya `location.reload()`.
- **Tidak ada autentikasi**: User "Super Admin" hardcoded di sidebar footer. Role ada di data tapi tidak ditegakkan (tidak ada role-based access).
- **Tidak ada API/backend**: Semua operasi murni client-side.
- **Tidak ada test**: Tidak ada framework atau file test.
- **Single-user view**: Tidak ada multi-tenancy atau scoped view per mitra — Super Admin melihat semua data.
- **Placeholder peta**: Koordinat lat/lng pelanggan dan splitter hanya ditampilkan sebagai div placeholder, bukan peta interaktif.
- **Theme mismatch**: RULES.md menetapkan accent `#3B82F6` (sky blue), tapi CSS aktual menggunakan `--color-accent: #18181b` (near-black). Perlu verifikasi sebelum perubahan tema.
- **ID generation**: `__uid` counter mulai dari 1000, increment otomatis. Pattern: `{PREFIX}-{number}`.
- **Script load order kritis**: `app-data.js` → `app-ui.js` → `app-modules.js` → `app-main.js`. Globals dari file awal dipakai oleh file berikutnya.
- **Responsive**: Breakpoint 960px — sidebar collapse ke off-canvas overlay.
- **Bahasa**: Semua teks UI dalam Bahasa Indonesia.

---

## Changelog Global

| Tanggal | Perubahan | Modul Terdampak |
| :---- | :---- | :---- |
| 2026-07-28 | Initial prototype — 11 modul, 4 grup navigasi, data dummy lengkap | Semua modul |
