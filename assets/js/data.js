/* ============================================================
   ERP Data Layer — Customer Management + Sales & Service
   Menyimpan data menggunakan localStorage sehingga prototype
   ini punya "database" yang persist di browser tanpa backend.
   ============================================================ */

(function (global) {
  const CUSTOMER_STORAGE_KEY = "erp_customers_v1";
  const SERVICE_STORAGE_KEY = "erp_service_packages_v1";
  const ACTOR = "Admin Mitra";

  const PACKAGES = [
    "Home 10 Mbps",
    "Home 20 Mbps",
    "Home 50 Mbps",
    "Business 100 Mbps",
    "Business 200 Mbps",
  ];

  const STATUS = {
    ACTIVE: "Active",
    ISOLIR: "Isolir",
    TERMINATE: "Terminate",
  };

  const PACKAGE_STATUS = {
    ACTIVE: "Aktif",
    INACTIVE: "Nonaktif",
  };

  function uid(prefix) {
    return (prefix + "-" + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 6)).toUpperCase();
  }

  function nowISO() { return new Date().toISOString(); }

  function loadList(key, seedFn) {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const seeded = seedFn();
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
    try { return JSON.parse(raw); } catch (e) {
      const seeded = seedFn();
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
  }

  function saveList(key, list) { localStorage.setItem(key, JSON.stringify(list)); }

  function seedCustomers() {
    const today = new Date();
    const addDays = (d) => { const t = new Date(today); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
    return [
      { customer_name: "Budi Santoso", pppoe_secret: "budi.santoso@mitra", phone_number: "081234500011", subscribe_date: addDays(-420), expired_date: addDays(18), installation_address: "Jl. Diponegoro No. 12, Batu, Jawa Timur", package_name: "Home 20 Mbps", customer_status: STATUS.ACTIVE, modem_serial_number: "SN-ONT-88213", latitude: -7.8713, longitude: 112.5240, olt_port: "OLT-BTU-01/1/2", onu_number: "ONU-0231", access_name: "Access-Batu-Center", access_port: "AP-04" },
      { customer_name: "Siti Rahmawati", pppoe_secret: "siti.rahma@mitra", phone_number: "082199912233", subscribe_date: addDays(-260), expired_date: addDays(6), installation_address: "Jl. Ir. Soekarno No. 45, Malang, Jawa Timur", package_name: "Home 50 Mbps", customer_status: STATUS.ACTIVE, modem_serial_number: "SN-ONT-77410", latitude: -7.9316, longitude: 112.6100, olt_port: "OLT-MLG-02/1/4", onu_number: "ONU-0455", access_name: "Access-Malang-Utara", access_port: "AP-11" },
      { customer_name: "Agus Wijaya", pppoe_secret: "agus.wijaya@mitra", phone_number: "085711122334", subscribe_date: addDays(-90), expired_date: addDays(-3), installation_address: "Jl. Panglima Sudirman No. 8, Batu, Jawa Timur", package_name: "Business 100 Mbps", customer_status: STATUS.ISOLIR, modem_serial_number: "SN-ONT-91002", latitude: -7.8676, longitude: 112.5320, olt_port: "OLT-BTU-01/1/6", onu_number: "ONU-0902", access_name: "Access-Batu-Center", access_port: "AP-02" },
    ].map((c) => ({ id: uid("CUST"), ...c, package_history: [{ package_name: c.package_name, changed_at: c.subscribe_date + "T00:00:00.000Z", note: "Paket awal saat registrasi" }], activity_log: [{ timestamp: c.subscribe_date + "T00:00:00.000Z", action: "Registrasi", detail: `Pelanggan ${c.customer_name} didaftarkan dengan paket ${c.package_name}.`, actor: ACTOR }] }));
  }

  function seedServicePackages() {
    const base = [
      { package_code: "PKG-001", package_name: "Home 10 Mbps", bandwidth: "10 Mbps", selling_price: 150000, package_status: PACKAGE_STATUS.ACTIVE },
      { package_code: "PKG-002", package_name: "Home 20 Mbps", bandwidth: "20 Mbps", selling_price: 200000, package_status: PACKAGE_STATUS.ACTIVE },
      { package_code: "PKG-003", package_name: "Home 50 Mbps", bandwidth: "50 Mbps", selling_price: 325000, package_status: PACKAGE_STATUS.ACTIVE },
      { package_code: "PKG-004", package_name: "Business 100 Mbps", bandwidth: "100 Mbps", selling_price: 700000, package_status: PACKAGE_STATUS.ACTIVE },
      { package_code: "PKG-005", package_name: "Business 200 Mbps", bandwidth: "200 Mbps", selling_price: 1200000, package_status: PACKAGE_STATUS.INACTIVE },
    ];
    return base.map((p) => ({ id: uid("SRV"), ...p, activity_log: [{ timestamp: nowISO(), action: "Seed", detail: `Paket ${p.package_name} disiapkan.`, actor: ACTOR }] }));
  }

  const CustomerDB = { STATUS, PACKAGES, getAll() { return loadList(CUSTOMER_STORAGE_KEY, seedCustomers); }, getById(id) { return this.getAll().find((c) => c.id === id) || null; }, isPppoeTaken(pppoe, excludeId) { return this.getAll().some((c) => c.pppoe_secret === pppoe && c.id !== excludeId); }, summary() { const list = this.getAll(); return { total: list.length, active: list.filter((c) => c.customer_status === STATUS.ACTIVE).length, isolir: list.filter((c) => c.customer_status === STATUS.ISOLIR).length, terminate: list.filter((c) => c.customer_status === STATUS.TERMINATE).length }; }, create(data) { const list = this.getAll(); if (this.isPppoeTaken(data.pppoe_secret)) throw new Error("PPPoE Secret sudah digunakan pelanggan lain."); const record = { id: uid("CUST"), ...data, customer_status: STATUS.ACTIVE, latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude), package_history: [{ package_name: data.package_name, changed_at: nowISO(), note: "Paket awal saat registrasi" }], activity_log: [{ timestamp: nowISO(), action: "Registrasi", detail: `Pelanggan ${data.customer_name} berhasil didaftarkan dengan paket ${data.package_name}.`, actor: ACTOR }] }; list.push(record); saveList(CUSTOMER_STORAGE_KEY, list); return record; }, update(id, data) { const list = this.getAll(); const idx = list.findIndex((c) => c.id === id); if (idx === -1) throw new Error("Pelanggan tidak ditemukan."); const current = list[idx]; if (data.pppoe_secret !== current.pppoe_secret && this.isPppoeTaken(data.pppoe_secret, id)) throw new Error("PPPoE Secret sudah digunakan pelanggan lain."); if (data.package_name !== current.package_name) { current.package_history.push({ package_name: data.package_name, changed_at: nowISO(), note: `Perubahan dari ${current.package_name} ke ${data.package_name}` }); current.activity_log.push({ timestamp: nowISO(), action: "Perubahan Paket", detail: `Paket layanan diubah dari ${current.package_name} menjadi ${data.package_name}.`, actor: ACTOR }); } Object.assign(current, { ...data, latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) }); list[idx] = current; saveList(CUSTOMER_STORAGE_KEY, list); return current; }, suspend(id) { const list = this.getAll(); const c = list.find((x) => x.id === id); if (!c) throw new Error("Pelanggan tidak ditemukan."); c.customer_status = STATUS.ISOLIR; c.activity_log.push({ timestamp: nowISO(), action: "Suspend", detail: "Layanan disuspend (Isolir).", actor: ACTOR }); saveList(CUSTOMER_STORAGE_KEY, list); return c; }, reactivate(id) { const list = this.getAll(); const c = list.find((x) => x.id === id); if (!c) throw new Error("Pelanggan tidak ditemukan."); c.customer_status = STATUS.ACTIVE; c.activity_log.push({ timestamp: nowISO(), action: "Aktivasi Kembali", detail: "Status pelanggan dikembalikan menjadi Active.", actor: ACTOR }); saveList(CUSTOMER_STORAGE_KEY, list); return c; }, terminate(id) { const list = this.getAll(); const c = list.find((x) => x.id === id); if (!c) throw new Error("Pelanggan tidak ditemukan."); c.customer_status = STATUS.TERMINATE; c.activity_log.push({ timestamp: nowISO(), action: "Terminate", detail: "Layanan dihentikan permanen.", actor: ACTOR }); saveList(CUSTOMER_STORAGE_KEY, list); return c; }, resetSeed() { const seeded = seedCustomers(); saveList(CUSTOMER_STORAGE_KEY, seeded); return seeded; } };

  const ServiceDB = { STATUS: PACKAGE_STATUS, getAll() { return loadList(SERVICE_STORAGE_KEY, seedServicePackages); }, getById(id) { return this.getAll().find((p) => p.id === id) || null; }, summary() { const list = this.getAll(); return { total: list.length, active: list.filter((p) => p.package_status === PACKAGE_STATUS.ACTIVE).length, inactive: list.filter((p) => p.package_status === PACKAGE_STATUS.INACTIVE).length }; }, isCodeTaken(code, excludeId) { return this.getAll().some((p) => p.package_code === code && p.id !== excludeId); }, create(data) { const list = this.getAll(); if (this.isCodeTaken(data.package_code)) throw new Error("Kode Paket sudah digunakan."); const record = { id: uid("SRV"), package_code: data.package_code, package_name: data.package_name, bandwidth: data.bandwidth, selling_price: Number(data.selling_price), package_status: data.package_status || PACKAGE_STATUS.ACTIVE, activity_log: [{ timestamp: nowISO(), action: "Tambah Paket", detail: `Paket ${data.package_name} dibuat.`, actor: ACTOR }] }; list.push(record); saveList(SERVICE_STORAGE_KEY, list); return record; }, update(id, data) { const list = this.getAll(); const idx = list.findIndex((p) => p.id === id); if (idx === -1) throw new Error("Paket tidak ditemukan."); const current = list[idx]; if (data.package_code !== current.package_code && this.isCodeTaken(data.package_code, id)) throw new Error("Kode Paket sudah digunakan."); Object.assign(current, { package_code: data.package_code, package_name: data.package_name, bandwidth: data.bandwidth, selling_price: Number(data.selling_price), package_status: data.package_status }); current.activity_log.push({ timestamp: nowISO(), action: "Ubah Paket", detail: `Paket ${current.package_name} diperbarui.`, actor: ACTOR }); list[idx] = current; saveList(SERVICE_STORAGE_KEY, list); return current; }, setStatus(id, package_status) { const list = this.getAll(); const current = list.find((p) => p.id === id); if (!current) throw new Error("Paket tidak ditemukan."); current.package_status = package_status; current.activity_log.push({ timestamp: nowISO(), action: "Ubah Status", detail: `Status paket diubah menjadi ${package_status}.`, actor: ACTOR }); saveList(SERVICE_STORAGE_KEY, list); return current; }, activeOptions() { return this.getAll().filter((p) => p.package_status === PACKAGE_STATUS.ACTIVE); }, resetSeed() { const seeded = seedServicePackages(); saveList(SERVICE_STORAGE_KEY, seeded); return seeded; } };

  global.CustomerDB = CustomerDB;
  global.ServiceDB = ServiceDB;

  global.SIDEBAR_MENU = [
    { section: "Utama", items: [
      { label: "Dashboard", href: "/index.html", icon: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/>" }
    ]},
    { section: "Modul Customer Management", items: [
      { label: "Customer Management", href: "/pages/customer-management/index.html", icon: "<circle cx=\"12\" cy=\"8\" r=\"3.4\"/><path d=\"M4.5 20c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6\"/>" }
    ]},
    { section: "Modul Penjualan & Layanan", items: [
      { label: "Paket Layanan", href: "/pages/sales-service-management/packages.html", icon: "<path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"/><polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"/>" },
      { label: "Paket Pelanggan", href: "/pages/sales-service-management/customer-packages.html", icon: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"8.5\" cy=\"7\" r=\"4\"/><polyline points=\"17 11 19 13 23 9\"/>" }
    ]}
  ];
})(window);