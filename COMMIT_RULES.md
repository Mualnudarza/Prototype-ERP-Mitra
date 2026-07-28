# Aturan Commit — Prototype ERP Mitra

File ini mendokumentasikan konvensi commit yang digunakan pada proyek ini. **Wajib diikuti oleh semua contributor.**

---

## Format Commit

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

| Type | Keterangan | Kapan Digunakan |
| :--- | :--- | :--- |
| `feat` | Fitur baru | Menambahkan modul, komponen, atau fungsi baru |
| `fix` | Perbaikan bug | Memperbaiki logic, tampilan, atau data yang salah |
| `refactor` | Refaktor tanpa ubah fungsi | Restructure kode, optimasi, pembersihan |
| `style` | Perubahan tampilan | CSS, layout, spacing, warna, font |
| `docs` | Dokumentasi | README, RULES, PRD, commit rules |
| `chore` | Maintenance | Update config, dependencies, cleanup |
| `test` | Testing | Menambah atau memperbaiki test |

### Scope (Opsional)

Scope merujuk pada area modul yang terdampak:

| Scope | Keterangan |
| :--- | :--- |
| `partnership` | Modul Kemitraan (Mitra, Pengguna, Pendapatan) |
| `customer` | Modul Pelanggan (Data, Registrasi, Paket) |
| `billing` | Modul Keuangan (Billing, Settlement) |
| `payment` | Modul Payment Gateway |
| `radius` | Modul Radius & Status |
| `infra` | Modul Infrastruktur (Topologi, Perangkat) |
| `ui` | Komponen UI shared (DataTable, Modal, Sidebar) |
| `data` | Layer data / state management |
| `router` | Routing dan navigasi |

### Subject Rules

- Gunakan **Bahasa Indonesia** yang ringkas
- **Huruf kecil** di awal (kecuali nama modul/proper noun)
- **Tidak diakhiri** titik
- Maksimal **72 karakter**

### Body (Opsional)

- Gunakan untuk menjelaskan **apa yang berubah** dan **mengapa**
- Pisahkan subject dan body dengan baris kosong
- Gunakan bullet point jika perlu

---

## Contoh Commit

### Penambahan Fitur

```
feat(ui): tambah dropdown switcher user di sidebar footer

- Tambah USERS array dan CURRENT_USER global di app-data.js
- Tambah CSS dropdown dengan animasi open/close
- Modifikasi renderSidebar() untuk render dropdown
- Handle click-outside untuk tutup dropdown
```

### Perubahan Logic

```
feat(router): filter modul Kemitraan berdasarkan role user

- Partnership group hanya tampil untuk Super User
- Admin Mitra otomatis redirect ke Data Pelanggan
- Handle hash redirect saat switch user
```

### Perbaikan Bug

```
fix(billing): koreksi perhitungan total tagihan belum dibayar
```

### Refaktor

```
refactor(data): pisahkan常量 users ke variabel terpisah
```

### Dokumentasi

```
docs: tambah COMMIT_RULES.md untuk konvensi commit
```

---

## Branch Naming

| Pattern | Keterangan |
| :--- | :--- |
| `feat/<name>` | Fitur baru |
| `fix/<name>` | Perbaikan bug |
| `refactor/<name>` | Refaktor |
| `chore/<name>` | Maintenance |

Contoh: `feat/user-switcher`, `fix/billing-calc`, `refactor/sidebar-nav`

---

## Checklist Sebelum Commit

- [ ] Pastikan semua file yang relevan sudah di-stage
- [ ] Gunakan format commit yang benar (`type(scope): subject`)
- [ ] Subject commit ringkas dan jelas
- [ ] Body commit menjelaskan apa yang berubah (jika perlu)
- [ ] Tidak ada file rahasia atau kredensial yang ikut ter-commit
- [ ] Pastikan kode berfungsi sebelum commit

---

**Catatan:** File ini bersifat hidup. Perbarui jika ada konvensi baru yang disepakati.
