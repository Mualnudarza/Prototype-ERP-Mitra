# Prototype ERP Mitra — Context PRD

| Project | : Prototype ERP Mitra |
| Tipe | : Prototype |
| Stack | : HTML + CSS + Vanilla JS (no framework, no build system, no dependencies) |
| Status | : Aktif |
| Terakhir diupdate | : 2026-07-29 |
| Sumber acuan | : Belum ada BRD, ini exploratory |

---

## Ringkasan

Prototype sistem informasi ERP untuk operator internet (ISP) berbasis mitra. Cakupan yang ada: **Super User** mengelola kemitraan (mitra — tambah/edit, pengguna, pendapatan). **Admin User** mengelola pelanggan (data, registrasi ONU, paket layanan), keuangan mitra (dashboard deposit, dashboard settlement, payment gateway), monitoring radius & control gateway, dan infrastruktur jaringan (topologi OLT/splitter). Semua data dummy/in-memory — reload browser menghapus semua perubahan. Tidak ada backend, autentikasi, atau integrasi API.

---

## Daftar Modul

> **Pemisahan Role**: Super User (Super Admin) hanya mengakses grup **Kemitraan**. Admin User (Admin Mitra) mengakses grup **Pelanggan**, **Keuangan**, dan **Jaringan**.

### Super User — Grup Kemitraan

#### Data Mitra (`partnership.mitra`)
- **Fungsi**: Mengelola data mitra — menampilkan daftar mitra dengan KPI dan filter, serta form tambah/edit mitra (halaman penuh via hash `#partnership.mitra?id=add` atau `#partnership.mitra?id={partner_id}`).
- **Lokasi file**: `app-modules.js:54-237` (form `renderMitraForm`), `app-modules.js:239-305` (list view), data di `app-data.js` (`DB.partners`)
- **Data yang dibutuhkan**:
  - Input: partner_code, partner_name, company_name, pic_name, phone_number, email, status, cooperation_name, cooperation_doc_no, cooperation_start, cooperation_end, cooperation_doc_file, npwp_nib, bank_name, bank_account_no, bank_account_name, payment_due_type, payment_due_value, cashier_deposit_min, cashier_deposit_initial, kso_value, kso_type (percentage/nominal), other_deductions (array of {name, value, type})
  - Tampil (list): KPI grid, DataTable dengan kolom kode, nama mitra, perusahaan, wilayah, jumlah pengguna, status, tombol Edit.
  - Tampil (form): Informasi Mitra, Kerja Sama B2B, Konfigurasi Keuangan (Jatuh Tempo, Settlement/Rekening, Deposit Kasir, Potongan KSO & Lainnya)
- **Ketergantungan**: `DataTable`, `renderKPIs`, `fieldsHTML`, `renderMitraForm`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 6 mitra dummy data
  - 2026-07-29 — Tambah tombol "Tambah Mitra" (toolbar) dan "Edit" per baris, khusus Super User. Form mitra diperluas: gabung Rekening Settlement + Jatuh Tempo jadi "Konfigurasi Keuangan". Tambah sub-bagian Deposit Kasir (minimal + nominal awal) dan Potongan (KSO + daftar potongan lainnya, masing-masing bisa persentase/nominal).

#### Manajemen Pengguna (`partnership.pengguna`)
- **Fungsi**: Menampilkan daftar akun pengguna per mitra. Read-only — tidak ada tombol Tambah/Edit/Reset.
- **Lokasi file**: `app-modules.js` (list view), data di `app-data.js` (`DB.users`, `DB.roles`)
- **Data yang dibutuhkan**:
  - Input: partner_id (FK ke partners), user_name, username, role_name, user_status
  - Tampil: DataTable dengan kolom nama pengguna, username, role (badge), status, login terakhir.
- **Ketergantungan**: `DB.partners` (untuk referensi nama mitra), `DataTable`, `badge`
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

---

### Admin User — Grup Pelanggan, Keuangan & Jaringan

#### Data Pelanggan (`customer.pelanggan`)
- **Fungsi**: Mengelola data pelanggan akhir (end-user) termasuk kredensial PPPoE, informasi perangkat (modem, OLT port, ONU), koordinat lokasi, dan status langganan. Pelanggan Unregistered memiliki tombol "Registrasi" yang mengarah ke `#customer.registrasi?id={customer_id}` (halaman registrasi penuh).
- **Lokasi file**: `app-modules.js:448-619`, data di `app-data.js` (`DB.customers`)
- **Data yang dibutuhkan**:
  - Input: partner_id, pppoe_secret, radius_username, customer_name, phone_number, customer_type (Reguler/Fasum), subscribe_date, expired_date, installation_address, package_id, modem_serial_number, latitude, longitude, olt_port, onu_number, access_name, access_port
  - Tampil: Banner peringatan untuk pelanggan Unregistered, KPI grid 5 kolom (total, active, isolir, terminate, unregistered), DataTable dengan kolom PPPoE secret, nama, telepon, expired, paket, status
- **Ketergantungan**: `DB.packages` (lookup nama & harga paket), `DB.partners`, `DataTable`, `renderKPIs`, `openModal`, `fieldsHTML`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 10 pelanggan dummy (2 Unregistered)

#### Registrasi Pelanggan (`customer.registrasi`)
- **Fungsi**: Dua mode: (1) Antrean registrasi ONU untuk pelanggan berstatus Unregistered — menampilkan daftar pelanggan dengan KPI, filter, dan tombol Registrasi. (2) Halaman registrasi penuh (bukan modal) — dipanggil via hash `#customer.registrasi?id={customer_id}` — menampilkan info pelanggan, konfigurasi perangkat (SN Modem, Port ODP, No. ONU, Port Pelanggan), generate script CLI per vendor dengan tombol copy. Port ODP menampilkan daftar splitter yang ditandai sebagai ODP dari seluruh topologi infrastruktur.
- **Lokasi file**: `app-modules.js:786-866` (queue), `app-modules.js:580-729` (`renderRegistrationPage`), data dari `DB.customers` (filter `Unregistered`)
- **Data yang dibutuhkan**:
  - Input: customer_id, modem_serial_number, olt_odp_id, onu_number (text input), access_port (dropdown 1-16), olt_slot, olt_pon
  - Tampil (Queue): KPI (ukuran antrean, mitra terlibat, menunggu >3 hari), DataTable dengan tombol Registrasi → navigasi ke `#customer.registrasi?id=...`
  - Tampil (Page): Info pelanggan card, konfigurasi perangkat card (SN Modem, Port ODP dropdown dari `allOdps()`, No. ONU text input, Port Pelanggan dropdown 1-16), script CLI (Huawei MA5800, ZTE C320, Fiberhome AN5516) dengan copy button
- **Ketergantungan**: `DB.customers`, `DB.infrastructure`, `allOdps()`, `findOdpNode()`, `findOltNode()`, `genOnuScripts()`, `pushActivity()`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, flow registrasi ONU dengan generate script CLI
  - 2026-07-28 — Konversi dari modal (`openRegistrationModal`) ke halaman penuh (`renderRegistrationPage`). Hash-based navigation: `#customer.registrasi?id=CUS-XXXX`. Cascading dropdown OLT → Input Splitter → Output Splitter.
  - 2026-07-29 — Sederhanakan konfigurasi perangkat: hapus cascading OLT/Input/Output, ganti dengan Port ODP (pilih dari daftar ODP) dan ONU Pelanggan. Data pelanggan gunakan `olt_odp_id`.
  - 2026-07-29 — Pisahkan field "ONU Pelanggan" (dropdown 1-16) menjadi dua field terpisah: "No. ONU" (text input) untuk nomor ONU aktual dan "Port Pelanggan" (dropdown 1-16) untuk port ODP. Nomor ONU tidak lagi digenerate otomatis.

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

#### Dashboard Deposit (`deposit.dashboard`)
- **Fungsi**: Mengelola saldo deposit kasir mitra, histori transaksi deposit, dan penerimaan pembayaran tunai dari customer. Menampilkan KPI saldo, total deposit masuk/keluar, total pembayaran customer, status deposit (Aman/Perlu Top Up berdasarkan minimal deposit). Terdapat dua submenu tab: Riwayat Deposit dan Pembayaran Customer.
- **Lokasi file**: `app-modules.js` (view `deposit.dashboard`), data di `app-data.js` (`DB.partners`, `DB.depositHistory`, `DB.invoices`, `DB.customers`, `DB.packages`, `DB.payments`)
- **Data yang dibutuhkan**:
  - Input: partner_id (FK), ref, type (Deposit Masuk/Deposit Keluar), date, amount, balance_before, balance_after, note, status
  - Tampil (KPI): Saldo Deposit, Total Deposit Masuk, Total Deposit Keluar, Total Pembayaran Customer, Status Deposit
  - Tampil (Riwayat Deposit): DataTable dengan kolom nomor transaksi, jenis transaksi, tanggal, nominal, saldo sebelum/sesudah, keterangan, status
  - Tampil (Pembayaran Customer): Form pilih customer → tampil detail invoice + biaya tambahan (berdasarkan konfigurasi mitra) → konfirmasi bayar tunai → update invoice status Lunas, potong deposit mitra, catat ke depositHistory & payments
- **Ketergantungan**: `DataTable`, `renderKPIs`, `badge`, `statusBadge`, `Modal`, `toast`, `pushActivity`, `nextId`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-29 — Modul baru menggantikan Billing Customer: Dashboard Deposit dengan submenu Riwayat Deposit & Pembayaran Customer. Kalkulasi biaya tambahan otomatis dari other_deductions mitra. Integrasi deposit→invoice→payment→settlement flow.

#### Dashboard Settlement (`settlement.dashboard`)
- **Fungsi**: Menampilkan rekap hasil transaksi customer dalam satu periode settlement: Pendapatan Kotor (Gross), Total Potongan (KSO, Payment Gateway Fee, Biaya Admin/Lainnya), Pendapatan Bersih (Net), Saldo Siap Settlement, dan Jadwal Settlement Berikutnya. Terdapat tombol Ajukan Pencairan Settlement dan submenu Riwayat Settlement.
- **Lokasi file**: `app-modules.js` (view `settlement.dashboard`), data di `app-data.js` (`DB.settlements`, `DB.invoices`, `DB.payments`, `DB.partners`)
- **Data yang dibutuhkan**:
  - Input: partner_id, ref, period, tx_count, gross_revenue, total_deduction, net_revenue, bank_account, status, date
  - Tampil (KPI): Gross Revenue, Total Potongan, Net Revenue, Saldo Siap Settlement, Jadwal Berikutnya
  - Tampil (Riwayat Settlement): DataTable dengan kolom nomor settlement, periode, jumlah transaksi, pendapatan kotor, total potongan, pendapatan bersih, rekening tujuan, status, tanggal
  - Aksi: Ajukan Pencairan Settlement → membuat record DB.settlements, menandai invoice settled=true, catat activity log
- **Ketergantungan**: `DataTable`, `renderKPIs`, `badge`, `statusBadge`, `Modal`, `toast`, `pushActivity`, `nextId`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-29 — Modul baru menggantikan Riwayat Settlement: Dashboard Settlement dengan kalkulasi potongan dinamis (KSO %, PG Fee Rp 3.000/transaksi non-cash, other_deductions %) dan pencairan otomatis.

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

#### Radius & Control Gateway (`radius.monitoring`)
- **Fungsi**: Monitoring layanan pelanggan — status ONU, redaman OLT (RX power), dan kendali layanan (isolir/aktivasi ulang). Data ditampilkan per ONU dengan 10 kolom utama: Nama, Customer ID (PPPoE), No ONU, Status Berlangganan, Start Subscribe, ODP, Port Access, OLT RX Regist, OLT RX Now, Status OLT.
- **Lokasi file**: `app-modules.js:1095-1198`, data di `app-data.js` (`DB.radius`, derived dari `DB.customers`)
- **Data yang dibutuhkan**:
  - Input: customer_id, bandwidth (dari package), customer_status, radius_status, isolation_date, activation_date, last_update, olt_rx_now (derived dengan variasi ±0.8 dB dari olt_rx_register), olt_status (Online/Offline/Isolir dari customer_status)
  - Tampil: KPI (ONU Online, Isolir, Pelanggan Aktif, Total Pelanggan), DataTable dengan kolom Nama, Customer ID (PPPoE), No ONU, Status Berlangganan, Start Subscribe, ODP, Port Access, OLT RX Regist, OLT RX Now, Status OLT. Filter: Status Berlangganan (Aktif/Isolir/Terminate/Unregistered) dan Status OLT (Online/Offline/Isolir). Search mencakup nama, PPPoE, dan No ONU. Modal detail menampilkan semua field plus Paket Layanan, Bandwidth, Tanggal Isolir/Aktivasi, Tipe Pelanggan, dan tombol "Isolir Manual" / "Aktivasi Ulang" (kontekstual). Pelanggan Fasum tidak bisa diisolir.
- **Ketergantungan**: `DB.customers`, `DB.packages`, `DB.radius` (derived), `DB.infrastructure` (lookup ODP label via `findOdpNode`), `DataTable`, `renderKPIs`, `openModal`, `pushActivity()`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, status sync antara radius dan customers
  - 2026-07-29 — Overhaul tabel: ganti kolom dengan 10 kolom ERP Griya (Nama, PPPoE, No ONU, Status Berlangganan, Start Subscribe, ODP, Port Access, OLT RX Regist, OLT RX Now, Status OLT). Tambah field olt_rx_now dan olt_status di DB.radius. Rename modul dari "Radius & Status" menjadi "Radius & Control Gateway". KPI diubah ke ONU Online / Isolir / Pelanggan Aktif / Total Pelanggan.

#### Topologi Infrastruktur (`infra.topologi`)
- **Fungsi**: Menampilkan pohon topologi infrastruktur jaringan: OLT → Input Splitter → Output Splitter. Mendukung expand/collapse, seleksi node, panel detail (lat/lng, kapasitas, progress bar), serta badge ODP pada node yang bertipe ODP (Optical Distribution Point). Tiga tombol terpisah: "Tambah OLT" (Super User), "Tambah Input Splitter", "Tambah Output Splitter" (Admin User). Modal Tambah/Edit Input/Output Splitter memiliki toggle "Jadikan sebagai ODP". ODP adalah splitter paling bawah yang langsung menyambung ke modem pelanggan dan tidak bisa ditambahi Output Splitter turunan. Port ODP dipilih saat registrasi pelanggan. Modal Output Splitter menggunakan cascading OLT → Input Splitter (Input Splitter dengan status ODP tidak muncul sebagai opsi induk). Node dapat diedit dan dihapus melalui panel detail (hanya Admin User, semua tipe node).
- **Lokasi file**: `app-modules.js:1208-1628`, data di `app-data.js` (`DB.infrastructure`)
- **Data yang dibutuhkan**:
  - Input (OLT): id, label, partner_id, olt_type (Huawei MA5800/ZTE C320/Fiberhome AN5516), lat, lng, address
  - Input (Input Splitter): lat, lng, address, capacity, connected, isOdp (toggle)
  - Input (Output Splitter): lat, lng, address, capacity (2/8/16), connected, status (Aktif/Penuh), isOdp (toggle, default true)
  - Tampil: KPI (total OLT, total splitter, titik tersedia, total pelanggan), pohon interaktif dengan badge ODP, panel detail node dengan lat/lng editor, progress bar kapasitas, serta tombol Edit dan Hapus (berdasarkan role permission)
- **Ketergantungan**: `DB.infrastructure`, `DB.customers`, `allInputSplitters()`, `allOutputSplitters()`, `allOdps()`, `findOltNode()`, `renderKPIs`, `Modal`
- **Status**: Selesai
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, 3 OLT nodes dengan tree interaktif
  - 2026-07-28 — Pecah tombol "Tambah Titik" menjadi 3 tombol terpisah. Tambah OLT hanya untuk Super User. Input Splitter menambahkan field lat/lng/address. Output Splitter modal menambahkan selector OLT induk → cascading Input Splitter.
  - 2026-07-28 — Tambah fitur Edit & Hapus node pada topologi dengan role-based access control (RBAC). Super User untuk semua tipe, Admin User hanya untuk tipe Splitter.
  - 2026-07-29 — Konsep ODP: toggle ODP pada add/edit Input/Output Splitter. Badge ODP di pohon & panel. Input Splitter ODP tidak bisa ditambahi Output Splitter. Data registrasi pelanggan gunakan `olt_odp_id`.

#### ~~Data Perangkat (`infra.perangkat`)~~ (Dihapus)
- ~~**Fungsi**: Menampilkan daftar flat (rata) dari seluruh perangkat dalam topologi infrastruktur — OLT, Input Splitter, dan Output Splitter — dalam satu tabel.~~
- ~~**Lokasi file**: `app-modules.js:1385-1463`, data dari `DB.infrastructure` (diflatten via `allOltNodes()`)~~
- ~~**Data yang dibutuhkan**: Input dari tree DB.infrastructure~~
- ~~**Ketergantungan**: `DB.infrastructure`, ~~`allOltNodes()`~~, ~~`findOltNode()`~~, `DataTable`, `badge`, `openModal`~~
- **Status**: ~~Selesai~~ **Dihapus**
- **Catatan Perubahan**:
  - 2026-07-28 — Initial prototype, flatten view dari tree infrastructure
  - 2026-07-29 — Dihapus karena fungsinya sudah tercover oleh Topologi Infrastruktur. `flattenInfra()` dan `Views['infra.perangkat']` dihapus dari `app-modules.js`. Entry NAV_CONFIG dihapus dari `app-main.js`.

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

infra.topologi ──→ customer.registrasi (OLT nodes untuk registrasi)
```

---

## Struktur Data / Entitas Kunci

| Entitas | Field Kunci | Dipakai di Modul |
| :---- | :---- | :---- |
| Partner | id, partner_code, partner_name, company_name, operational_area, status, bank_name, bank_account_no, bank_account_name, payment_due_type, payment_due_value, cashier_deposit_min, cashier_deposit_initial, deposit_balance, kso_value, kso_type, other_deductions[] | Data Mitra, Manajemen Pengguna, Dashboard Pendapatan, Data Pelanggan, Paket Layanan, Radius Monitoring, Dashboard Deposit, Dashboard Settlement |
| User | id, partner_id, user_name, username, role_name, user_status | Manajemen Pengguna |
| Customer | id, partner_id, pppoe_secret, radius_username, customer_name, package_id, customer_status, olt_odp_id, olt_port, onu_number | Data Pelanggan, Registrasi, Billing, Payment Gateway, Radius Monitoring |
| Package | id, partner_id, package_name, bandwidth, price, status | Paket Layanan, Data Pelanggan (lookup), Radius Monitoring (lookup) |
| Invoice | id, customer_id, invoice_number, billing_period, billing_amount, billing_status, extra_charge, total_paid, settled | Dashboard Deposit, Dashboard Settlement, Payment Gateway |
| Payment | id, invoice_id, payment_reference, virtual_account, billing_amount, payment_status | Payment Gateway, Dashboard Deposit |
| Settlement | id, partner_id, ref, type, amount, balance_before, balance_after | Dashboard Pendapatan, Riwayat Settlement |
| DepositHistory | id, partner_id, ref, type, date, amount, balance_before, balance_after, note, status | Dashboard Deposit |
| SettlementRecord | id, partner_id, ref, period, tx_count, gross_revenue, total_deduction, net_revenue, bank_account, status, date | Dashboard Settlement |
| Infrastructure | id, type, label, partner_id, isOdp, children (tree: OLT → Input Splitter → Output Splitter) | Topologi Infrastruktur, Registrasi (ODP nodes) |
| Radius | id, customer_id, customer_name, pppoe_secret, onu_number, bandwidth, customer_status, radius_status, isolation_date, activation_date, last_update, olt_rx_now, olt_status | Radius & Control Gateway |
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
| `openRegistrationModal()` | Modal registrasi ONU dengan generate CLI script (DEPRECATED — diganti `renderRegistrationPage`) | `app-modules.js` |
| `renderRegistrationPage(root, customer, onDone)` | Halaman penuh registrasi ONU dengan Port ODP (daftar ODP) dan ONU Pelanggan | `app-modules.js` |

---

## Catatan Teknis & Batasan Prototype

- **Tidak ada persistensi**: Semua data in-memory di objek `DB` global. Reload browser = reset data. Tombol "Reset data" hanya `location.reload()`.
- **Hanya 1 data mitra awal (PTR-0001)** beserta data terkait lainnya untuk menyederhanakan prototipe. Data baru terikat secara otomatis ke mitra yang baru dibuat (saat registrasi, otomatis dibuatkan 1 admin user).
- **Tidak ada autentikasi**: User Super Admin dan Admin Mitra dipilih via dropdown switcher di sidebar. Role ditegakkan via `isSuperUser()` — Super User hanya mengakses grup menu **Kemitraan** (bisa tambah/edit mitra, lihat pengguna & pendapatan). Admin Mitra mengakses grup **Pelanggan**, **Keuangan**, dan **Jaringan** — termasuk kelola infrastruktur (tambah Input/Output Splitter, edit/hapus semua tipe node). Pengecualian: tombol "Tambah OLT" di Topologi Infrastruktur hanya muncul untuk Super User.
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
| 2026-07-28 | User switcher dropdown, role-based navigation (Super Admin / Admin Mitra) | `app-ui.js`, `app-main.js`, `app-data.js` |
| 2026-07-28 | Registrasi ONU dikonversi dari modal ke halaman penuh (hash-based nav) | `customer.registrasi`, `customer.pelanggan` |
| 2026-07-28 | Topologi: 3 tombol terpisah (OLT/Input/Output), cascading selector pada modal Output Splitter | `infra.topologi` |
| 2026-07-29 | Role split navigasi — Super User hanya melihat grup Kemitraan, Admin User melihat grup Pelanggan/Keuangan/Jaringan. Form mitra dikonversi dari modal ke full page. | `app-main.js`, `app-modules.js` |
| 2026-07-29 | Konsep ODP: toggle ODP pada add/edit splitter, badge ODP di tree & panel, Input ODP tidak bisa ditambah Output. Registrasi pelanggan sederhana: Port ODP + ONU Pelanggan (hapus cascading OLT/Input/Output). | `app-data.js`, `app-modules.js`, `erp-mitra-prototype.html` |
| 2026-07-29 | Radius & Control Gateway: overhaul tabel ke 10 kolom ERP Griya (Nama, PPPoE, No ONU, Status Berlangganan, Start Subscribe, ODP, Port Access, OLT RX Regist, OLT RX Now, Status OLT). Tambah olt_rx_now, olt_status di DB.radius. Rename modul dari "Radius & Status". Hapus Data Perangkat (`infra.perangkat`, `flattenInfra`, NAV_CONFIG entry). Perbaiki field registrasi: pisahkan No. ONU (text) dan Port Pelanggan (dropdown). | `app-data.js`, `app-modules.js`, `app-main.js`, `PRD.md` |
| 2026-07-29 | Data Mitra: tambah tombol "Tambah Mitra" (toolbar) dan "Edit" per baris, khusus Super User. Form mitra diperluas: gabung Rekening Settlement + Jatuh Tempo jadi "Konfigurasi Keuangan" dengan 4 sub-bagian (Jatuh Tempo, Settlement, Deposit Kasir, Potongan KSO + Lainnya). | `app-data.js`, `app-modules.js`, `PRD.md` |
| 2026-07-29 | Modul Keuangan Mitra: ganti Billing Customer & Riwayat Settlement dengan Dashboard Deposit & Dashboard Settlement. Deposit: KPI saldo, histori, pembayaran tunai customer (biaya tambahan otomatis dari other_deductions). Settlement: Gross/Net, potongan dinamis (KSO, PG Fee, admin), ajukan pencairan. Data layer: deposit_balance, DB.depositHistory, DB.settlements, invoice extra_charge/total_paid/settled. | `app-data.js`, `app-modules.js`, `app-main.js`, `PRD.md` |
