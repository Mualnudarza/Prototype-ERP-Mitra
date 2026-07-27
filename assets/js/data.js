/* ============================================================
   ERP Data Layer — Customer Management + Sales & Service + Infrastructure Monitoring
   Menyimpan data menggunakan localStorage sehingga prototype
   ini punya "database" yang persist di browser tanpa backend.
   ============================================================ */

(function (global) {
  const CUSTOMER_STORAGE_KEY = "erp_customers_v1";
  const SERVICE_STORAGE_KEY = "erp_service_packages_v1";
  const PARTNER_STORAGE_KEY = "erp_partners_v1";
  const USER_STORAGE_KEY = "erp_users_v1";
  const SETTLEMENT_STORAGE_KEY = "erp_settlements_v1";
  let ACTOR = localStorage.getItem("erp_active_role") || "Admin Mitra";

  const PACKAGES = [
    "Home 10 Mbps",
    "Home 20 Mbps",
    "Home 50 Mbps",
    "Business 100 Mbps",
    "Business 200 Mbps",
  ];

  const STATUS = {
    PENDING_REG: "Belum Diregistrasi",
    ACTIVE: "Active",
    ISOLIR: "Isolir",
    TERMINATE: "Terminate",
  };

  const PACKAGE_STATUS = {
    ACTIVE: "Aktif",
    INACTIVE: "Nonaktif",
  };

  const OLT_STATUS = {
    WORKING: "Working",
    WARNING: "Warning",
    OFFLINE: "Offline",
  };

  const OLT_TYPES = [
    "Huawei MA5800",
    "ZTE C320",
    "Fiberhome AN5516",
  ];

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
      { customer_name: "Budi Santoso", pppoe_secret: "budi.santoso@mitra", phone_number: "081234500011", subscribe_date: addDays(-420), expired_date: addDays(18), installation_address: "Jl. Diponegoro No. 12, Batu, Jawa Timur", package_name: "Home 20 Mbps", customer_status: STATUS.ACTIVE, modem_serial_number: "SN-ONT-88213", latitude: -7.8713, longitude: 112.5240, olt_port: "OLT-BTU-01/1/2", onu_number: "ONU-0231", access_name: "Access-Batu-Center", access_port: "AP-04", odp_name: "ODP-Batu-01", customer_id: "CUST-0001", olt_type: "Huawei MA5800", olt_slot: "1", olt_pon: "2", olt_rx_register: -22.5, olt_rx_current: -23.1, olt_status: OLT_STATUS.WORKING },
      { customer_name: "Siti Rahmawati", pppoe_secret: "siti.rahma@mitra", phone_number: "082199912233", subscribe_date: addDays(-260), expired_date: addDays(6), installation_address: "Jl. Ir. Soekarno No. 45, Malang, Jawa Timur", package_name: "Home 50 Mbps", customer_status: STATUS.ACTIVE, modem_serial_number: "SN-ONT-77410", latitude: -7.9316, longitude: 112.6100, olt_port: "OLT-MLG-02/1/4", onu_number: "ONU-0455", access_name: "Access-Malang-Utara", access_port: "AP-11", odp_name: "ODP-Malang-02", customer_id: "CUST-0002", olt_type: "ZTE C320", olt_slot: "1", olt_pon: "4", olt_rx_register: -24.0, olt_rx_current: -26.8, olt_status: OLT_STATUS.WARNING },
      { customer_name: "Agus Wijaya", pppoe_secret: "agus.wijaya@mitra", phone_number: "085711122334", subscribe_date: addDays(-90), expired_date: addDays(-3), installation_address: "Jl. Panglima Sudirman No. 8, Batu, Jawa Timur", package_name: "Business 100 Mbps", customer_status: STATUS.ISOLIR, modem_serial_number: "SN-ONT-91002", latitude: -7.8676, longitude: 112.5320, olt_port: "OLT-BTU-01/1/6", onu_number: "ONU-0902", access_name: "Access-Batu-Center", access_port: "AP-02", odp_name: "ODP-Batu-01", customer_id: "CUST-0003", olt_type: "Huawei MA5800", olt_slot: "1", olt_pon: "6", olt_rx_register: -21.8, olt_rx_current: -29.5, olt_status: OLT_STATUS.OFFLINE },
      { customer_name: "Dewi Lestari", pppoe_secret: "dewi.lestari@mitra", phone_number: "081333344556", subscribe_date: addDays(-5), expired_date: addDays(25), installation_address: "Jl. Soekarno-Hatta No. 100, Malang, Jawa Timur", package_name: "Home 10 Mbps", customer_status: STATUS.PENDING_REG, modem_serial_number: "SN-ONT-55678", latitude: -7.9450, longitude: 112.6300, olt_port: "OLT-MLG-02/2/1", onu_number: "", access_name: "Access-Malang-Selatan", access_port: "AP-07", odp_name: "ODP-Malang-03", customer_id: "CUST-0004", olt_type: "ZTE C320", olt_slot: "2", olt_pon: "1", olt_rx_register: null, olt_rx_current: null, olt_status: OLT_STATUS.OFFLINE },
      { customer_name: "Eko Prasetyo", pppoe_secret: "eko.prasetyo@mitra", phone_number: "087812345678", subscribe_date: addDays(-2), expired_date: addDays(28), installation_address: "Jl. Ahmad Yani No. 55, Batu, Jawa Timur", package_name: "Business 200 Mbps", customer_status: STATUS.PENDING_REG, modem_serial_number: "SN-ONT-99887", latitude: -7.8800, longitude: 112.5400, olt_port: "OLT-BTU-01/2/3", onu_number: "", access_name: "Access-Batu-Barat", access_port: "AP-15", odp_name: "ODP-Batu-02", customer_id: "CUST-0005", olt_type: "Huawei MA5800", olt_slot: "2", olt_pon: "3", olt_rx_register: null, olt_rx_current: null, olt_status: OLT_STATUS.OFFLINE },
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

  const CustomerDB = {
    STATUS, PACKAGES,
    getAll() { return loadList(CUSTOMER_STORAGE_KEY, seedCustomers); },
    getById(id) { return this.getAll().find((c) => c.id === id) || null; },
    isPppoeTaken(pppoe, excludeId) { return this.getAll().some((c) => c.pppoe_secret === pppoe && c.id !== excludeId); },
    summary() { const list = this.getAll(); return { total: list.length, active: list.filter((c) => c.customer_status === STATUS.ACTIVE).length, isolir: list.filter((c) => c.customer_status === STATUS.ISOLIR).length, terminate: list.filter((c) => c.customer_status === STATUS.TERMINATE).length, pending_reg: list.filter((c) => c.customer_status === STATUS.PENDING_REG).length }; },
    create(data) { const list = this.getAll(); if (this.isPppoeTaken(data.pppoe_secret)) throw new Error("PPPoE Secret sudah digunakan pelanggan lain."); const record = { id: uid("CUST"), ...data, customer_status: STATUS.PENDING_REG, latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude), package_history: [{ package_name: data.package_name, changed_at: nowISO(), note: "Paket awal saat registrasi" }], activity_log: [{ timestamp: nowISO(), action: "Registrasi Awal", detail: `Pelanggan ${data.customer_name} ditambahkan dengan paket ${data.package_name}. Menunggu registrasi ONU.`, actor: ACTOR }] }; list.push(record); saveList(CUSTOMER_STORAGE_KEY, list); return record; },
    update(id, data) { const list = this.getAll(); const idx = list.findIndex((c) => c.id === id); if (idx === -1) throw new Error("Pelanggan tidak ditemukan."); const current = list[idx]; if (data.pppoe_secret !== current.pppoe_secret && this.isPppoeTaken(data.pppoe_secret, id)) throw new Error("PPPoE Secret sudah digunakan pelanggan lain."); if (data.package_name !== current.package_name) { current.package_history.push({ package_name: data.package_name, changed_at: nowISO(), note: `Perubahan dari ${current.package_name} ke ${data.package_name}` }); current.activity_log.push({ timestamp: nowISO(), action: "Perubahan Paket", detail: `Paket layanan diubah dari ${current.package_name} menjadi ${data.package_name}.`, actor: ACTOR }); } if (data.installation_address !== current.installation_address) { current.address_history = current.address_history || []; current.address_history.push({ address: data.installation_address, changed_at: nowISO(), note: `Perubahan alamat dari ${current.installation_address}` }); current.activity_log.push({ timestamp: nowISO(), action: "Relokasi", detail: `Alamat pemasangan diubah ke ${data.installation_address}.`, actor: ACTOR }); } Object.assign(current, { customer_name: data.customer_name, phone_number: data.phone_number, subscribe_date: data.subscribe_date, expired_date: data.expired_date, installation_address: data.installation_address, package_name: data.package_name, pppoe_secret: data.pppoe_secret, modem_serial_number: data.modem_serial_number, latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude), olt_port: data.olt_port, onu_number: data.onu_number, access_name: data.access_name, access_port: data.access_port, odp_name: data.odp_name, customer_id: data.customer_id, olt_type: data.olt_type, olt_slot: data.olt_slot, olt_pon: data.olt_pon, olt_rx_register: data.olt_rx_register === "" ? null : data.olt_rx_register, olt_rx_current: data.olt_rx_current === "" ? null : data.olt_rx_current, olt_status: data.olt_status }); current.activity_log.push({ timestamp: nowISO(), action: "Update Data", detail: "Data pelanggan diperbarui.", actor: ACTOR }); list[idx] = current; saveList(CUSTOMER_STORAGE_KEY, list); return current; },
    suspend(id) { const list = this.getAll(); const current = list.find((c) => c.id === id); if (!current) throw new Error("Pelanggan tidak ditemukan."); current.customer_status = STATUS.ISOLIR; current.activity_log.push({ timestamp: nowISO(), action: "Suspend", detail: "Layanan disuspend (Isolir).", actor: ACTOR }); saveList(CUSTOMER_STORAGE_KEY, list); return current; },
    reactivate(id) { const list = this.getAll(); const current = list.find((c) => c.id === id); if (!current) throw new Error("Pelanggan tidak ditemukan."); current.customer_status = STATUS.ACTIVE; current.activity_log.push({ timestamp: nowISO(), action: "Aktifkan Kembali", detail: "Layanan diaktifkan kembali.", actor: ACTOR }); saveList(CUSTOMER_STORAGE_KEY, list); return current; },
    terminate(id) { const list = this.getAll(); const current = list.find((c) => c.id === id); if (!current) throw new Error("Pelanggan tidak ditemukan."); current.customer_status = STATUS.TERMINATE; current.activity_log.push({ timestamp: nowISO(), action: "Terminasi", detail: "Layanan dihentikan permanen.", actor: ACTOR }); saveList(CUSTOMER_STORAGE_KEY, list); return current; },
    completeRegistration(id, registrationData) { const list = this.getAll(); const idx = list.findIndex((c) => c.id === id); if (idx === -1) throw new Error("Pelanggan tidak ditemukan."); const current = list[idx]; current.customer_status = STATUS.ACTIVE; current.onu_number = registrationData.onu_number; current.olt_rx_register = registrationData.olt_rx_register; current.olt_rx_current = registrationData.olt_rx_register; current.olt_status = OLT_STATUS.WORKING; current.register_date = nowISO(); current.activity_log.push({ timestamp: nowISO(), action: "Registrasi ONU", detail: `ONU ${registrationData.onu_number} diregistrasi ke OLT Slot ${registrationData.olt_slot} PON ${registrationData.olt_pon}. RX: ${registrationData.olt_rx_register} dBm`, actor: ACTOR }); list[idx] = current; saveList(CUSTOMER_STORAGE_KEY, list); return current; },
  };

  const ServiceDB = {
    STATUS: PACKAGE_STATUS,
    getAll() { return loadList(SERVICE_STORAGE_KEY, seedServicePackages); },
    getById(id) { return this.getAll().find((p) => p.id === id) || null; },
    summary() { const list = this.getAll(); return { total: list.length, active: list.filter((p) => p.package_status === PACKAGE_STATUS.ACTIVE).length, inactive: list.filter((p) => p.package_status === PACKAGE_STATUS.INACTIVE).length }; },
    isCodeTaken(code, excludeId) { return this.getAll().some((p) => p.package_code === code && p.id !== excludeId); },
    create(data) { const list = this.getAll(); if (this.isCodeTaken(data.package_code)) throw new Error("Kode Paket sudah digunakan."); const record = { id: uid("SRV"), package_code: data.package_code, package_name: data.package_name, bandwidth: data.bandwidth, selling_price: Number(data.selling_price), package_status: data.package_status || PACKAGE_STATUS.ACTIVE, activity_log: [{ timestamp: nowISO(), action: "Tambah Paket", detail: `Paket ${data.package_name} dibuat.`, actor: ACTOR }] }; list.push(record); saveList(SERVICE_STORAGE_KEY, list); return record; },
    update(id, data) { const list = this.getAll(); const idx = list.findIndex((p) => p.id === id); if (idx === -1) throw new Error("Paket tidak ditemukan."); const current = list[idx]; if (data.package_code !== current.package_code && this.isCodeTaken(data.package_code, id)) throw new Error("Kode Paket sudah digunakan."); Object.assign(current, { package_code: data.package_code, package_name: data.package_name, bandwidth: data.bandwidth, selling_price: Number(data.selling_price), package_status: data.package_status }); current.activity_log.push({ timestamp: nowISO(), action: "Ubah Paket", detail: `Paket ${current.package_name} diperbarui.`, actor: ACTOR }); list[idx] = current; saveList(SERVICE_STORAGE_KEY, list); return current; },
    setStatus(id, package_status) { const list = this.getAll(); const current = list.find((p) => p.id === id); if (!current) throw new Error("Paket tidak ditemukan."); current.package_status = package_status; current.activity_log.push({ timestamp: nowISO(), action: "Ubah Status", detail: `Status paket diubah ke ${package_status}.`, actor: ACTOR }); saveList(SERVICE_STORAGE_KEY, list); return current; },
  };

  function seedPartners() {
    return [
      { id: uid("PTR"), partner_code: "MTR-001", partner_name: "Mitra Batu Net", company_name: "PT Mitra Batu Digital", phone_number: "0341-551100", email: "admin@mitrabatu.id", address: "Jl. Diponegoro No. 12, Batu", operational_area: "Batu", business_configuration: "Retail Broadband", minimum_price_rule: "10 Mbps ≥ Rp150.000; 20 Mbps ≥ Rp200.000; 50 Mbps ≥ Rp325.000", billing_scheme: "Tanggal tetap: 25 setiap bulan", status: "Aktif", user_count: 8, monthly_revenue: 18500000, unpaid_invoice_total: 4250000, active_customers: 124, settlement_status: "Selesai" },
      { id: uid("PTR"), partner_code: "MTR-002", partner_name: "Mitra Malang Fiber", company_name: "CV Malang Fiber Media", phone_number: "0341-778899", email: "support@malangfiber.id", address: "Jl. Soekarno-Hatta No. 45, Malang", operational_area: "Malang", business_configuration: "Retail & Business Broadband", minimum_price_rule: "20 Mbps ≥ Rp210.000; 50 Mbps ≥ Rp350.000; 100 Mbps ≥ Rp700.000", billing_scheme: "Rentang hari berjalan: 1-10", status: "Aktif", user_count: 12, monthly_revenue: 32750000, unpaid_invoice_total: 8900000, active_customers: 218, settlement_status: "Proses" },
      { id: uid("PTR"), partner_code: "MTR-003", partner_name: "Mitra Kediri Online", company_name: "PT Kediri Online Nusantara", phone_number: "0354-223344", email: "halo@kediri-online.id", address: "Jl. Dhoho No. 20, Kediri", operational_area: "Kediri", business_configuration: "Retail Broadband", minimum_price_rule: "10 Mbps ≥ Rp145.000; 20 Mbps ≥ Rp195.000", billing_scheme: "Plus 30 hari", status: "Nonaktif", user_count: 4, monthly_revenue: 0, unpaid_invoice_total: 1300000, active_customers: 0, settlement_status: "Tertunda" },
    ];
  }

  function seedPartnerUsers() {
    return [
      { id: uid("USR"), user_name: "Andi Pratama", username: "andi.admin", partner_name: "Mitra Batu Net", role_name: "Administrator Mitra", user_status: "Aktif", last_login: "2026-07-26T09:30:00.000Z" },
      { id: uid("USR"), user_name: "Rina Wulandari", username: "rina.ops", partner_name: "Mitra Malang Fiber", role_name: "Operator Customer", user_status: "Aktif", last_login: "2026-07-25T14:15:00.000Z" },
      { id: uid("USR"), user_name: "Dimas Saputra", username: "dimas.billing", partner_name: "Mitra Malang Fiber", role_name: "Billing Staff", user_status: "Nonaktif", last_login: "2026-06-18T10:05:00.000Z" },
    ];
  }

  function seedSettlements() {
    return [
      { id: uid("SET"), reference_no: "SET-202607-001", period: "Juli 2026", amount: 14250000, settlement_status: "Selesai", settlement_date: "2026-07-25" },
      { id: uid("SET"), reference_no: "SET-202606-001", period: "Juni 2026", amount: 13100000, settlement_status: "Selesai", settlement_date: "2026-06-25" },
      { id: uid("SET"), reference_no: "SET-202605-001", period: "Mei 2026", amount: 12800000, settlement_status: "Tertunda", settlement_date: "2026-05-30" },
    ];
  }

  const PartnerDB = {
    getAll() { return loadList(PARTNER_STORAGE_KEY, seedPartners); },
    getUsers() { return loadList(USER_STORAGE_KEY, seedPartnerUsers); },
    getSettlements() { return loadList(SETTLEMENT_STORAGE_KEY, seedSettlements); },
    summary() { const partners = this.getAll(); const users = this.getUsers(); return { total: partners.length, active: partners.filter(p => p.status === "Aktif").length, inactive: partners.filter(p => p.status === "Nonaktif").length, users: users.length, userActive: users.filter(u => u.user_status === "Aktif").length, userInactive: users.filter(u => u.user_status === "Nonaktif").length, roles: new Set(users.map(u => u.role_name)).size }; },
    performance() { const partners = this.getAll(); return { monthly_revenue: partners.reduce((n, p) => n + p.monthly_revenue, 0), unpaid_invoice_total: partners.reduce((n, p) => n + p.unpaid_invoice_total, 0), active_customers: partners.reduce((n, p) => n + p.active_customers, 0), settlement_status: "Proses" }; },
  };

  const InfraDB = {
    OLT_STATUS, OLT_TYPES,
    getMonitoringData() {
      const list = CustomerDB.getAll();
      return list.filter(c => c.customer_status !== STATUS.PENDING_REG || c.onu_number).map(c => ({
        ...c,
        olt_rx_register: c.olt_rx_register !== null ? c.olt_rx_register : "-",
        olt_rx_current: c.olt_rx_current !== null ? c.olt_rx_current : "-",
        olt_status: c.olt_status || OLT_STATUS.OFFLINE,
      }));
    },
    getRegistrableCustomers() {
      const list = CustomerDB.getAll();
      return list.filter(c => c.customer_status === STATUS.PENDING_REG && c.olt_type && c.olt_slot && c.olt_pon);
    },
    generateRegistrationScripts(customer, selectedSlot, selectedPon) {
      const slot = selectedSlot || customer.olt_slot;
      const pon = selectedPon || customer.olt_pon;
      const type = customer.olt_type || "Huawei MA5800";
      const isHuawei = type.includes("Huawei");
      const isZTE = type.includes("ZTE");
      const isFiberhome = type.includes("Fiberhome");

      const sn = customer.modem_serial_number || "AUTO-DETECT";
      const onuId = parseInt(pon) * 128 + (parseInt(slot) - 1) * 16;
      const pppoeUser = customer.pppoe_secret;
      const vlan = 100 + parseInt(slot);

      let scripts = [];

      if (isHuawei) {
        scripts = [
          { title: "Script Scan Modem", code: `display ont autofind ${slot} ${pon}\n` },
          { title: "Script Registrasi Modem", code: `interface gpon ${slot}/${pon}\n ont add ${onuId} sn-auth ${sn} omci ont-lineprofile-id 10 ont-srvprofile-id 10 desc "${customer.customer_name}"\n ont confirm ${onuId}\n quit\n` },
          { title: "Script Pemeriksaan Redaman", code: `display ont optical-info ${slot} ${pon} ${onuId}\n` },
          { title: "Script Konfigurasi Profile ONU", code: `interface gpon ${slot}/${pon}\n ont modify ${onuId} ont-lineprofile-id 10 ont-srvprofile-id 10\n quit\n` },
          { title: "Script Konfigurasi PPPoE", code: `service-port vlan ${vlan} gpon ${slot}/${pon} ont ${onuId} gemport 1 multi-service user-vlan ${vlan} tag-transform translate\n` },
        ];
      } else if (isZTE) {
        scripts = [
          { title: "Script Scan Modem", code: `show pon onu-unregister gpon_olt-${slot}/${pon}\n` },
          { title: "Script Registrasi Modem", code: `configure terminal\n interface gpon_olt-${slot}/${pon}\n  onu ${onuId} type ZTE-F660 sn ${sn}\n  onu ${onuId} profile lineprofile ${onuId} create\n  onu ${onuId} tcont 1 profile 10\n  onu ${onuId} gemport 1 tcont 1\n  onu ${onuId} service 1 gemport 1 vlan ${vlan} translate\n exit\n exit\n` },
          { title: "Script Pemeriksaan Redaman", code: `show pon power attenuation gpon_olt-${slot}/${pon} onu_id ${onuId}\n` },
          { title: "Script Konfigurasi Profile ONU", code: `configure terminal\n interface gpon_olt-${slot}/${pon}\n  onu ${onuId} lineprofile 10\n  onu ${onuId} srvprofile 10\n exit\n exit\n` },
          { title: "Script Konfigurasi PPPoE", code: `configure terminal\n interface gpon_olt-${slot}/${pon}\n  onu ${onuId} pppoe 1 user ${pppoeUser} password ${customer.customer_name.replace(/\s+/g, '')}123\n exit\n exit\n` },
        ];
      } else {
        scripts = [
          { title: "Script Scan Modem", code: `show pon onu unregister interface gpon ${slot}/${pon}\n` },
          { title: "Script Registrasi Modem", code: `configure terminal\n interface gpon ${slot}/${pon}\n  onu ${onuId} sn ${sn}\n  onu ${onuId} line profile 10\n  onu ${onuId} service profile 10\n  onu ${onuId} vlan mode tag ${vlan}\n exit\n exit\n` },
          { title: "Script Pemeriksaan Redaman", code: `show pon optical-rx interface gpon ${slot}/${pon} onu ${onuId}\n` },
          { title: "Script Konfigurasi Profile ONU", code: `configure terminal\n interface gpon ${slot}/${pon}\n  onu ${onuId} line profile 10\n  onu ${onuId} service profile 10\n exit\n exit\n` },
          { title: "Script Konfigurasi PPPoE", code: `configure terminal\n interface gpon ${slot}/${pon}\n  onu ${onuId} pppoe username ${pppoeUser} password ${customer.customer_name.replace(/\s+/g, '')}123\n exit\n exit\n` },
        ];
      }

      return scripts.map(s => ({ ...s, type }));
    },
  };

  global.CustomerDB = CustomerDB;
  global.ServiceDB = ServiceDB;
  global.InfraDB = InfraDB;
  global.PartnerDB = PartnerDB;

  global.SIDEBAR_MENU = [
    { section: "Utama", items: [
      { label: "Dashboard", href: "/index.html", icon: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/>" }
    ]},
    { section: "Modul Customer Management", items: [
      { label: "Customer Management", href: "/pages/customer-management/index.html", icon: "<circle cx=\"12\" cy=\"8\" r=\"3.4\"/><path d=\"M4.5 20c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6\"/>" }
    ]},
    { section: "Modul Partnership Management", superUserOnly: true, items: [
      { label: "Data Mitra", href: "/pages/partnership-management/index.html", icon: "<path d=\"M4 20V8l8-4 8 4v12\"/><path d=\"M9 20v-6h6v6\"/><path d=\"M7 12h10\"/>" },
      { label: "Manajemen Pengguna", href: "/pages/partnership-management/users.html", icon: "<circle cx=\"12\" cy=\"8\" r=\"3.2\"/><path d=\"M4.5 20c1.3-3.8 4.1-5.8 7.5-5.8s6.2 2 7.5 5.8\"/>" },
      { label: "Performa Mitra", href: "/pages/partnership-management/performance.html", icon: "<path d=\"M4 19V5\"/><path d=\"M4 19h16\"/><path d=\"M7 15l4-4 3 2 5-6\"/>" }
    ]},
    { section: "Modul Penjualan & Layanan", items: [
      { label: "Paket Layanan", href: "/pages/sales-service-management/packages.html", icon: "<path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"/><polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"/>" },
      { label: "Paket Pelanggan", href: "/pages/sales-service-management/customer-packages.html", icon: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"8.5\" cy=\"7\" r=\"4\"/><polyline points=\"17 11 19 13 23 9\"/>" }
    ]},
    { section: "Modul Monitoring Infrastruktur", items: [
      { label: "Monitoring OLT", href: "/pages/infrastructure-monitoring/monitoring.html", icon: "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/><path d=\"M12 16a4 4 0 0 0-4-4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4 4z\"/>" },
      { label: "Registrasi ONU", href: "/pages/infrastructure-monitoring/register.html", icon: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"11\"/><line x1=\"9\" y1=\"14\" x2=\"15\" y2=\"14\"/>" }
    ]}
  ];
})(window);