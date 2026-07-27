/* ============================================================
   ERP Data Layer — Mitra, Package, Customer, Billing, Payment,
   Settlement, Radius, Base Package
   localStorage-based "database" for prototype persistence.
   ============================================================ */

(function (global) {
  const STORAGE = {
    CUSTOMERS:    "erp_customers_v1",
    SERVICES:     "erp_service_packages_v1",
    MITRAS:       "erp_mitras_v2",
    BASE_PACKAGES:"erp_base_packages_v1",
    INVOICES:     "erp_invoices_v1",
    PAYMENTS:     "erp_payments_v1",
    SETTLEMENTS:  "erp_settlements_v1",
    PAYOUTS:      "erp_payouts_v1",
    RADIUS_LOGS:  "erp_radius_logs_v1",
    ROLE:         "erp_role_v1",
  };
  const ROLES = { SUPER_ADMIN:"Super Admin", ADMIN_MITRA:"Admin Mitra" };
  const ACTOR = "Admin Mitra";

  const STATUS = { ACTIVE: "Active", ISOLIR: "Isolir", TERMINATE: "Terminate", EXPIRED: "Expired" };
  const PKG_STATUS = { ACTIVE: "Aktif", INACTIVE: "Nonaktif" };
  const MITRA_STATUS = { ACTIVE: "Aktif", INACTIVE: "Nonaktif" };
  const INV_STATUS = { UNPAID: "unpaid", PAID: "paid", EXPIRED: "expired", CANCELLED: "cancelled" };
  const PAY_STATUS = { RECEIVED: "received", VALIDATED: "validated", PROCESSED: "processed", REJECTED: "rejected" };
  const SETTLE_STATUS = { PENDING: "pending", SETTLED: "settled", CANCELLED: "cancelled" };
  const PAYOUT_STATUS = { REQUESTED: "requested", APPROVED: "approved", PAID: "paid", REJECTED: "rejected" };
  const RADIUS_STATUS = { PENDING: "pending", SUCCESS: "success", FAILED: "failed" };

  function uid(prefix){ return (prefix+"-"+Date.now().toString(36).slice(-5)+Math.random().toString(36).slice(2,6)).toUpperCase(); }
  function nowISO(){ return new Date().toISOString(); }

  function loadList(key, seedFn){
    const raw = localStorage.getItem(key);
    if(!raw){ const s=seedFn(); localStorage.setItem(key,JSON.stringify(s)); return s; }
    try{ return JSON.parse(raw); }catch(e){ const s=seedFn(); localStorage.setItem(key,JSON.stringify(s)); return s; }
  }
  function saveList(key,list){ localStorage.setItem(key,JSON.stringify(list)); }

  function addDays(dateStr,d){ const t=new Date(dateStr); t.setDate(t.getDate()+d); return t.toISOString().slice(0,10); }
  function todayStr(){ return new Date().toISOString().slice(0,10); }

  /* ---------- Seed: Mitras ---------- */
  function seedMitras(){
    return [
      { id: uid("MTR"), code:"DSR", name:"Dasarata Net", legal_name:"PT Dasarata Network", pic_name:"Pak Joko", phone:"081234500001", email:"joko@dasarata.id", bank_name:"BCA", bank_account_number:"1234567890", bank_account_name:"PT Dasarata Network", default_due_date_rule:{type:"fixed_day",value:15}, status:MITRA_STATUS.ACTIVE, coverage_areas:[{ id: uid("COV"), name:"Batu Center", olt_name:"OLT-BTU-01", status:MITRA_STATUS.ACTIVE }, { id: uid("COV"), name:"Batu Selatan", olt_name:"OLT-BTU-01", status:MITRA_STATUS.ACTIVE }], created_at: nowISO(), updated_at: nowISO(), activity_log:[{timestamp:nowISO(),action:"Mitra Dibuat",detail:"Mitra Dasarata Net didaftarkan.",actor:"Super Admin"}] },
      { id: uid("MTR"), code:"KIO", name:"Kiosnet", legal_name:"CV Kiosnet Solusi", pic_name:"Bu Rina", phone:"081234500002", email:"rina@kiosnet.id", bank_name:"Mandiri", bank_account_number:"0987654321", bank_account_name:"CV Kiosnet Solusi", default_due_date_rule:{type:"plus_30_days",value:30}, status:MITRA_STATUS.ACTIVE, coverage_areas:[{ id: uid("COV"), name:"Malang Utara", olt_name:"OLT-MLG-02", status:MITRA_STATUS.ACTIVE }, { id: uid("COV"), name:"Malang Timur", olt_name:"OLT-MLG-02", status:MITRA_STATUS.ACTIVE }], created_at: nowISO(), updated_at: nowISO(), activity_log:[{timestamp:nowISO(),action:"Mitra Dibuat",detail:"Mitra Kiosnet didaftarkan.",actor:"Super Admin"}] },
      { id: uid("MTR"), code:"MJA", name:"Media Jaya", legal_name:"PT Media Jaya Abadi", pic_name:"Pak Andi", phone:"081234500003", email:"andi@mediajaya.id", bank_name:"BNI", bank_account_number:"5555666777", bank_account_name:"PT Media Jaya Abadi", default_due_date_rule:{type:"activation_date_cycle",value:""}, status:MITRA_STATUS.INACTIVE, coverage_areas:[{ id: uid("COV"), name:"Kediri Kota", olt_name:"-", status:MITRA_STATUS.INACTIVE }], created_at: nowISO(), updated_at: nowISO(), activity_log:[{timestamp:nowISO(),action:"Mitra Dibuat",detail:"Mitra Media Jaya didaftarkan.",actor:"Super Admin"}] },
    ];
  }

  /* ---------- Seed: Base Packages ---------- */
  function seedBasePackages(){
    return [
      { id: uid("BSP"), name:"Home 10 Mbps", bandwidth_down:10, bandwidth_up:2, base_price:100000, radius_profile_name:"rp-home-10", status:PKG_STATUS.ACTIVE, created_at: nowISO(), updated_at: nowISO() },
      { id: uid("BSP"), name:"Home 20 Mbps", bandwidth_down:20, bandwidth_up:5, base_price:130000, radius_profile_name:"rp-home-20", status:PKG_STATUS.ACTIVE, created_at: nowISO(), updated_at: nowISO() },
      { id: uid("BSP"), name:"Home 50 Mbps", bandwidth_down:50, bandwidth_up:10, base_price:250000, radius_profile_name:"rp-home-50", status:PKG_STATUS.ACTIVE, created_at: nowISO(), updated_at: nowISO() },
      { id: uid("BSP"), name:"Business 100 Mbps", bandwidth_down:100, bandwidth_up:20, base_price:500000, radius_profile_name:"rp-biz-100", status:PKG_STATUS.ACTIVE, created_at: nowISO(), updated_at: nowISO() },
      { id: uid("BSP"), name:"Business 200 Mbps", bandwidth_down:200, bandwidth_up:50, base_price:900000, radius_profile_name:"rp-biz-200", status:PKG_STATUS.INACTIVE, created_at: nowISO(), updated_at: nowISO() },
    ];
  }

  /* ---------- Seed: Customers ---------- */
  function seedCustomers(){
    const t = new Date();
    const addD = (d) => { const x=new Date(t); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };
    return [
      { customer_name:"Budi Santoso", pppoe_secret:"budi.santoso@mitra", pppoe_password:"budi123", phone_number:"081234500011", subscribe_date:addD(-420), expired_date:addD(18), installation_address:"Jl. Diponegoro No. 12, Batu, Jawa Timur", package_name:"Home 20 Mbps", customer_status:STATUS.ACTIVE, customer_type:"regular", modem_serial_number:"SN-ONT-88213", latitude:-7.8713, longitude:112.5240, olt_port:"OLT-BTU-01/1/2", onu_number:"ONU-0231", access_name:"Access-Batu-Center", access_port:"AP-04", package_history:[{package_name:"Home 20 Mbps",changed_at:addD(-420)+"T00:00:00.000Z",note:"Paket awal saat registrasi"}], activity_log:[{timestamp:addD(-420)+"T00:00:00.000Z",action:"Registrasi",detail:"Pelanggan Budi Santoso didaftarkan dengan paket Home 20 Mbps.",actor:ACTOR}] },
      { customer_name:"Siti Rahmawati", pppoe_secret:"siti.rahma@mitra", pppoe_password:"siti123", phone_number:"082199912233", subscribe_date:addD(-260), expired_date:addD(6), installation_address:"Jl. Ir. Soekarno No. 45, Malang, Jawa Timur", package_name:"Home 50 Mbps", customer_status:STATUS.ACTIVE, customer_type:"regular", modem_serial_number:"SN-ONT-77410", latitude:-7.9316, longitude:112.6100, olt_port:"OLT-MLG-02/1/4", onu_number:"ONU-0455", access_name:"Access-Malang-Utara", access_port:"AP-11", package_history:[{package_name:"Home 50 Mbps",changed_at:addD(-260)+"T00:00:00.000Z",note:"Paket awal saat registrasi"}], activity_log:[{timestamp:addD(-260)+"T00:00:00.000Z",action:"Registrasi",detail:"Pelanggan Siti Rahmawati didaftarkan dengan paket Home 50 Mbps.",actor:ACTOR}] },
      { customer_name:"Agus Wijaya", pppoe_secret:"agus.wijaya@mitra", pppoe_password:"agus123", phone_number:"085711122334", subscribe_date:addD(-90), expired_date:addD(-3), installation_address:"Jl. Panglima Sudirman No. 8, Batu, Jawa Timur", package_name:"Business 100 Mbps", customer_status:STATUS.ISOLIR, customer_type:"regular", modem_serial_number:"SN-ONT-91002", latitude:-7.8676, longitude:112.5320, olt_port:"OLT-BTU-01/1/6", onu_number:"ONU-0902", access_name:"Access-Batu-Center", access_port:"AP-02", package_history:[{package_name:"Business 100 Mbps",changed_at:addD(-90)+"T00:00:00.000Z",note:"Paket awal saat registrasi"}], activity_log:[{timestamp:addD(-90)+"T00:00:00.000Z",action:"Registrasi",detail:"Pelanggan Agus Wijaya didaftarkan dengan paket Business 100 Mbps.",actor:ACTOR}] },
      { customer_name:"Masjid Al-Falah", pppoe_secret:"masjid.alfalah@mitra", pppoe_password:"masjid123", phone_number:"081234500099", subscribe_date:addD(-200), expired_date:addD(-5), installation_address:"Jl. Masjid No. 1, Batu, Jawa Timur", package_name:"Home 10 Mbps", customer_status:STATUS.ACTIVE, customer_type:"fasum", modem_serial_number:"SN-ONT-88001", latitude:-7.8700, longitude:112.5250, olt_port:"OLT-BTU-01/1/3", onu_number:"ONU-0500", access_name:"Access-Batu-Center", access_port:"AP-05", package_history:[{package_name:"Home 10 Mbps",changed_at:addD(-200)+"T00:00:00.000Z",note:"Paket awal saat registrasi Fasum"}], activity_log:[{timestamp:addD(-200)+"T00:00:00.000Z",action:"Registrasi",detail:"Pelanggan Fasum Masjid Al-Falah didaftarkan.",actor:ACTOR}] },
    ].map((c)=>({ id: uid("CUST"), ...c, address_history:[] }));
  }

  /* ---------- Seed: Service Packages (Mitra) ---------- */
  function seedServicePackages(){
    return [
      { package_code:"PKG-001", package_name:"Home 10 Mbps", bandwidth:"10 Mbps", selling_price:150000, package_status:PKG_STATUS.ACTIVE, base_package_id:null, base_price:100000, radius_profile_name:"rp-home-10" },
      { package_code:"PKG-002", package_name:"Home 20 Mbps", bandwidth:"20 Mbps", selling_price:200000, package_status:PKG_STATUS.ACTIVE, base_package_id:null, base_price:130000, radius_profile_name:"rp-home-20" },
      { package_code:"PKG-003", package_name:"Home 50 Mbps", bandwidth:"50 Mbps", selling_price:325000, package_status:PKG_STATUS.ACTIVE, base_package_id:null, base_price:250000, radius_profile_name:"rp-home-50" },
      { package_code:"PKG-004", package_name:"Business 100 Mbps", bandwidth:"100 Mbps", selling_price:700000, package_status:PKG_STATUS.ACTIVE, base_package_id:null, base_price:500000, radius_profile_name:"rp-biz-100" },
      { package_code:"PKG-005", package_name:"Business 200 Mbps", bandwidth:"200 Mbps", selling_price:1200000, package_status:PKG_STATUS.INACTIVE, base_package_id:null, base_price:900000, radius_profile_name:"rp-biz-200" },
    ].map((p)=>({ id: uid("SRV"), ...p, activity_log:[{timestamp:nowISO(),action:"Seed",detail:"Paket "+p.package_name+" disiapkan.",actor:ACTOR}] }));
  }

  /* ---------- Seed: Invoices ---------- */
  function seedInvoices(){
    const t = new Date();
    const addD = (d) => { const x=new Date(t); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };
    return [
      { id:uid("INV"), invoice_number:"INV-2026-0001", customer_name:"Budi Santoso", pppoe_secret:"budi.santoso@mitra", package_name:"Home 20 Mbps", period_start:addD(-30), period_end:addD(0), issue_date:addD(-30), due_date:addD(18), amount:200000, status:INV_STATUS.UNPAID, virtual_account:"8800"+Math.floor(Math.random()*1000000), created_at:addD(-30)+"T00:00:00.000Z" },
      { id:uid("INV"), invoice_number:"INV-2026-0002", customer_name:"Siti Rahmawati", pppoe_secret:"siti.rahma@mitra", package_name:"Home 50 Mbps", period_start:addD(-30), period_end:addD(0), issue_date:addD(-30), due_date:addD(6), amount:325000, status:INV_STATUS.UNPAID, virtual_account:"8800"+Math.floor(Math.random()*1000000), created_at:addD(-30)+"T00:00:00.000Z" },
      { id:uid("INV"), invoice_number:"INV-2026-0003", customer_name:"Agus Wijaya", pppoe_secret:"agus.wijaya@mitra", package_name:"Business 100 Mbps", period_start:addD(-30), period_end:addD(0), issue_date:addD(-30), due_date:addD(-3), amount:700000, status:INV_STATUS.EXPIRED, virtual_account:"8800"+Math.floor(Math.random()*1000000), created_at:addD(-30)+"T00:00:00.000Z" },
      { id:uid("INV"), invoice_number:"INV-2026-0004", customer_name:"Masjid Al-Falah", pppoe_secret:"masjid.alfalah@mitra", package_name:"Home 10 Mbps", period_start:addD(-30), period_end:addD(0), issue_date:addD(-30), due_date:addD(-5), amount:150000, status:INV_STATUS.EXPIRED, virtual_account:"8800"+Math.floor(Math.random()*1000000), created_at:addD(-30)+"T00:00:00.000Z" },
      { id:uid("INV"), invoice_number:"INV-2025-0099", customer_name:"Budi Santoso", pppoe_secret:"budi.santoso@mitra", package_name:"Home 20 Mbps", period_start:addD(-60), period_end:addD(-30), issue_date:addD(-60), due_date:addD(-30), amount:200000, status:INV_STATUS.PAID, virtual_account:"8800"+Math.floor(Math.random()*1000000), created_at:addD(-60)+"T00:00:00.000Z", paid_at:addD(-35)+"T10:00:00.000Z" },
    ];
  }

  /* ---------- Seed: Payments ---------- */
  function seedPayments(){
    const t = new Date();
    const addD = (d) => { const x=new Date(t); x.setDate(x.getDate()+d); return x.toISOString(); };
    return [
      { id:uid("PAY"), transaction_id:"TXN-PASPE-0001", invoice_number:"INV-2025-0099", virtual_account:"8800123456", customer_name:"Budi Santoso", amount:200000, paid_at:addD(-35), status:PAY_STATUS.PROCESSED, payment_channel:"BCA VA", created_at:addD(-35) },
    ];
  }

  /* ---------- Seed: Settlements ---------- */
  function seedSettlements(){
    return [
      { id:uid("STL"), invoice_number:"INV-2025-0099", payment_id:"TXN-PASPE-0001", customer_name:"Budi Santoso", selling_price:200000, base_price:130000, gateway_fee:2000, adjustment_amount:0, mitra_amount:68000, isp_amount:130000, status:SETTLE_STATUS.PENDING, created_at:nowISO() },
    ];
  }

  /* ---------- Seed: Payouts ---------- */
  function seedPayouts(){
    return [];
  }

  /* ---------- Seed: Radius Logs ---------- */
  function seedRadiusLogs(){
    const t = new Date();
    const addD = (d) => { const x=new Date(t); x.setDate(x.getDate()+d); return x.toISOString(); };
    return [
      { id:uid("RAD"), customer_name:"Budi Santoso", pppoe_username:"budi.santoso@mitra", action:"provision", status:RADIUS_STATUS.SUCCESS, detail:"Provisioning PPPoE berhasil, profile rp-home-20", created_at:addD(-420) },
      { id:uid("RAD"), customer_name:"Agus Wijaya", pppoe_username:"agus.wijaya@mitra", action:"suspend", status:RADIUS_STATUS.SUCCESS, detail:"Suspend berhasil, profile 0 Mbps, CoA port 3799", created_at:addD(-3) },
      { id:uid("RAD"), customer_name:"Masjid Al-Falah", pppoe_username:"masjid.alfalah@mitra", action:"provision", status:RADIUS_STATUS.SUCCESS, detail:"Provisioning PPPoE Fasum berhasil, profile rp-home-10", created_at:addD(-200) },
    ];
  }

  /* ============================================================
     DB Objects
     ============================================================ */
  const CustomerDB = {
    STATUS,
    getAll(){ return loadList(STORAGE.CUSTOMERS, seedCustomers); },
    getById(id){ return this.getAll().find(c=>c.id===id)||null; },
    isPppoeTaken(pppoe, excludeId){ return this.getAll().some(c=>c.pppoe_secret===pppoe && c.id!==excludeId); },
    summary(){ const l=this.getAll(); return { total:l.length, active:l.filter(c=>c.customer_status===STATUS.ACTIVE).length, isolir:l.filter(c=>c.customer_status===STATUS.ISOLIR).length, terminate:l.filter(c=>c.customer_status===STATUS.TERMINATE).length }; },
    create(data){
      const list=this.getAll();
      if(this.isPppoeTaken(data.pppoe_secret)) throw new Error("PPPoE Secret sudah digunakan pelanggan lain.");
      const record={ id:uid("CUST"), ...data, customer_status:STATUS.ACTIVE, latitude:parseFloat(data.latitude), longitude:parseFloat(data.longitude), package_history:[{package_name:data.package_name,changed_at:nowISO(),note:"Paket awal saat registrasi"}], address_history:[], activity_log:[{timestamp:nowISO(),action:"Registrasi",detail:"Pelanggan "+data.customer_name+" didaftarkan dengan paket "+data.package_name+".",actor:ACTOR}] };
      list.push(record); saveList(STORAGE.CUSTOMERS,list); return record;
    },
    update(id,data){
      const list=this.getAll(); const idx=list.findIndex(c=>c.id===id);
      if(idx===-1) throw new Error("Pelanggan tidak ditemukan.");
      const current=list[idx];
      if(data.pppoe_secret!==current.pppoe_secret && this.isPppoeTaken(data.pppoe_secret,id)) throw new Error("PPPoE Secret sudah digunakan pelanggan lain.");
      if(data.package_name!==current.package_name){ current.package_history.push({package_name:data.package_name,changed_at:nowISO(),note:"Perubahan dari "+current.package_name+" ke "+data.package_name}); current.activity_log.push({timestamp:nowISO(),action:"Perubahan Paket",detail:"Paket layanan diubah dari "+current.package_name+" menjadi "+data.package_name+".",actor:ACTOR}); }
      if(data.installation_address!==current.installation_address){ current.address_history.push({address:current.installation_address,changed_at:nowISO()}); current.activity_log.push({timestamp:nowISO(),action:"Relokasi",detail:"Alamat diubah dari "+current.installation_address+" ke "+data.installation_address+".",actor:ACTOR}); }
      Object.assign(current, data, {latitude:parseFloat(data.latitude), longitude:parseFloat(data.longitude)});
      list[idx]=current; saveList(STORAGE.CUSTOMERS,list); return current;
    },
    suspend(id){ const list=this.getAll(); const c=list.find(c=>c.id===id); if(!c) throw new Error("Pelanggan tidak ditemukan."); c.customer_status=STATUS.ISOLIR; c.activity_log.push({timestamp:nowISO(),action:"Suspend",detail:"Layanan disuspend (Isolir).",actor:ACTOR}); saveList(STORAGE.CUSTOMERS,list); },
    reactivate(id){ const list=this.getAll(); const c=list.find(c=>c.id===id); if(!c) throw new Error("Pelanggan tidak ditemukan."); c.customer_status=STATUS.ACTIVE; c.activity_log.push({timestamp:nowISO(),action:"Aktivasi Ulang",detail:"Layanan diaktifkan kembali.",actor:ACTOR}); saveList(STORAGE.CUSTOMERS,list); },
    terminate(id){ const list=this.getAll(); const c=list.find(c=>c.id===id); if(!c) throw new Error("Pelanggan tidak ditemukan."); c.customer_status=STATUS.TERMINATE; c.activity_log.push({timestamp:nowISO(),action:"Terminate",detail:"Layanan diterminasi permanen.",actor:ACTOR}); saveList(STORAGE.CUSTOMERS,list); },
  };

  const ServiceDB = {
    STATUS:PKG_STATUS,
    getAll(){ return loadList(STORAGE.SERVICES, seedServicePackages); },
    getById(id){ return this.getAll().find(p=>p.id===id)||null; },
    activeOptions(){ return this.getAll().filter(p=>p.package_status===PKG_STATUS.ACTIVE); },
    summary(){ const l=this.getAll(); return { total:l.length, active:l.filter(p=>p.package_status===PKG_STATUS.ACTIVE).length, inactive:l.filter(p=>p.package_status===PKG_STATUS.INACTIVE).length }; },
    isCodeTaken(code, excludeId){ return this.getAll().some(p=>p.package_code===code && p.id!==excludeId); },
    create(data){ const list=this.getAll(); if(this.isCodeTaken(data.package_code)) throw new Error("Kode Paket sudah digunakan."); const record={ id:uid("SRV"), ...data, selling_price:Number(data.selling_price), activity_log:[{timestamp:nowISO(),action:"Tambah Paket",detail:"Paket "+data.package_name+" dibuat.",actor:ACTOR}] }; list.push(record); saveList(STORAGE.SERVICES,list); return record; },
    update(id,data){ const list=this.getAll(); const idx=list.findIndex(p=>p.id===id); if(idx===-1) throw new Error("Paket tidak ditemukan."); const current=list[idx]; if(data.package_code!==current.package_code && this.isCodeTaken(data.package_code,id)) throw new Error("Kode Paket sudah digunakan."); Object.assign(current,{package_code:data.package_code,package_name:data.package_name,bandwidth:data.bandwidth,selling_price:Number(data.selling_price),package_status:data.package_status}); current.activity_log.push({timestamp:nowISO(),action:"Ubah Paket",detail:"Paket diperbarui.",actor:ACTOR}); list[idx]=current; saveList(STORAGE.SERVICES,list); return current; },
    setStatus(id,status){ const list=this.getAll(); const c=list.find(p=>p.id===id); if(!c) throw new Error("Paket tidak ditemukan."); c.package_status=status; c.activity_log.push({timestamp:nowISO(),action:"Ubah Status",detail:"Status paket: "+status+".",actor:ACTOR}); saveList(STORAGE.SERVICES,list); },
  };

  const MitraDB = {
    STATUS:MITRA_STATUS,
    getAll(){ return loadList(STORAGE.MITRAS, seedMitras); },
    getById(id){ return this.getAll().find(m=>m.id===id)||null; },
    activeOptions(){ return this.getAll().filter(m=>m.status===MITRA_STATUS.ACTIVE); },
    summary(){ const l=this.getAll(); return { total:l.length, active:l.filter(m=>m.status===MITRA_STATUS.ACTIVE).length, inactive:l.filter(m=>m.status===MITRA_STATUS.INACTIVE).length }; },
    create(data){ const list=this.getAll(); const record={ id:uid("MTR"), ...data, status:MITRA_STATUS.ACTIVE, coverage_areas:data.coverage_areas||[], created_at:nowISO(), updated_at:nowISO(), activity_log:[{timestamp:nowISO(),action:"Mitra Dibuat",detail:"Mitra "+data.name+" didaftarkan.",actor:"Super Admin"}] }; list.push(record); saveList(STORAGE.MITRAS,list); return record; },
    update(id,data){ const list=this.getAll(); const idx=list.findIndex(m=>m.id===id); if(idx===-1) throw new Error("Mitra tidak ditemukan."); Object.assign(list[idx],data,{updated_at:nowISO()}); list[idx].activity_log.push({timestamp:nowISO(),action:"Mitra Diperbarui",detail:"Data mitra diperbarui.",actor:"Super Admin"}); saveList(STORAGE.MITRAS,list); return list[idx]; },
    setStatus(id,status){ const list=this.getAll(); const m=list.find(m=>m.id===id); if(!m) throw new Error("Mitra tidak ditemukan."); m.status=status; m.updated_at=nowISO(); m.activity_log.push({timestamp:nowISO(),action:"Ubah Status",detail:"Status mitra: "+status+".",actor:"Super Admin"}); saveList(STORAGE.MITRAS,list); },
    coverageCount(m){ return (m.coverage_areas||[]).length; },
    allCoverage(){ return this.getAll().flatMap(m=>(m.coverage_areas||[]).map(c=>({...c, mitra_id:m.id, mitra_name:m.name, mitra_code:m.code}))); },
    coverageSummary(){ const c=this.allCoverage(); return { total:c.length, active:c.filter(x=>x.status===MITRA_STATUS.ACTIVE).length, inactive:c.filter(x=>x.status===MITRA_STATUS.INACTIVE).length }; },
    addCoverage(mitraId,data){ const list=this.getAll(); const m=list.find(m=>m.id===mitraId); if(!m) throw new Error("Mitra tidak ditemukan."); m.coverage_areas=m.coverage_areas||[]; if(m.coverage_areas.some(c=>c.name===data.name)) throw new Error("Coverage area sudah ada pada Mitra ini."); m.coverage_areas.push({ id:uid("COV"), name:data.name, olt_name:data.olt_name||"-", status:data.status||MITRA_STATUS.ACTIVE }); m.updated_at=nowISO(); m.activity_log.push({timestamp:nowISO(),action:"Coverage Ditambah",detail:"Coverage area "+data.name+" ditambahkan.",actor:"Super Admin"}); saveList(STORAGE.MITRAS,list); return m; },
    removeCoverage(mitraId,coverageId){ const list=this.getAll(); const m=list.find(m=>m.id===mitraId); if(!m) throw new Error("Mitra tidak ditemukan."); const cov=(m.coverage_areas||[]).find(c=>c.id===coverageId); m.coverage_areas=(m.coverage_areas||[]).filter(c=>c.id!==coverageId); m.updated_at=nowISO(); m.activity_log.push({timestamp:nowISO(),action:"Coverage Dihapus",detail:"Coverage area "+(cov?cov.name:coverageId)+" dihapus.",actor:"Super Admin"}); saveList(STORAGE.MITRAS,list); return m; },
  };

  const BasePackageDB = {
    STATUS:PKG_STATUS,
    getAll(){ return loadList(STORAGE.BASE_PACKAGES, seedBasePackages); },
    getById(id){ return this.getAll().find(p=>p.id===id)||null; },
    activeOptions(){ return this.getAll().filter(p=>p.status===PKG_STATUS.ACTIVE); },
    summary(){ const l=this.getAll(); return { total:l.length, active:l.filter(p=>p.status===PKG_STATUS.ACTIVE).length, inactive:l.filter(p=>p.status===PKG_STATUS.INACTIVE).length }; },
    create(data){ const list=this.getAll(); const record={ id:uid("BSP"), ...data, base_price:Number(data.base_price), bandwidth_down:Number(data.bandwidth_down), bandwidth_up:data.bandwidth_up?Number(data.bandwidth_up):0, status:data.status||PKG_STATUS.ACTIVE, created_at:nowISO(), updated_at:nowISO() }; list.push(record); saveList(STORAGE.BASE_PACKAGES,list); return record; },
    update(id,data){ const list=this.getAll(); const idx=list.findIndex(p=>p.id===id); if(idx===-1) throw new Error("Paket dasar tidak ditemukan."); Object.assign(list[idx],data,{base_price:Number(data.base_price),bandwidth_down:Number(data.bandwidth_down),updated_at:nowISO()}); saveList(STORAGE.BASE_PACKAGES,list); return list[idx]; },
    setStatus(id,status){ const list=this.getAll(); const p=list.find(p=>p.id===id); if(!p) throw new Error("Paket dasar tidak ditemukan."); p.status=status; p.updated_at=nowISO(); saveList(STORAGE.BASE_PACKAGES,list); },
  };

  const InvoiceDB = {
    STATUS:INV_STATUS,
    getAll(){ return loadList(STORAGE.INVOICES, seedInvoices); },
    getById(id){ return this.getAll().find(i=>i.id===id)||null; },
    summary(){ const l=this.getAll(); return { total:l.length, unpaid:l.filter(i=>i.status===INV_STATUS.UNPAID).length, paid:l.filter(i=>i.status===INV_STATUS.PAID).length, expired:l.filter(i=>i.status===INV_STATUS.EXPIRED).length, totalUnpaidAmount:l.filter(i=>i.status===INV_STATUS.UNPAID||i.status===INV_STATUS.EXPIRED).reduce((s,i)=>s+i.amount,0), totalPaidAmount:l.filter(i=>i.status===INV_STATUS.PAID).reduce((s,i)=>s+i.amount,0) }; },
    create(data){ const list=this.getAll(); const record={ id:uid("INV"), ...data, status:INV_STATUS.UNPAID, created_at:nowISO() }; list.push(record); saveList(STORAGE.INVOICES,list); return record; },
    markPaid(id, paidAt){ const list=this.getAll(); const inv=list.find(i=>i.id===id); if(!inv) throw new Error("Invoice tidak ditemukan."); if(inv.status===INV_STATUS.PAID) throw new Error("Invoice sudah lunas."); inv.status=INV_STATUS.PAID; inv.paid_at=paidAt||nowISO(); saveList(STORAGE.INVOICES,list); return inv; },
    markExpired(id){ const list=this.getAll(); const inv=list.find(i=>i.id===id); if(!inv) throw new Error("Invoice tidak ditemukan."); if(inv.status===INV_STATUS.PAID) throw new Error("Invoice sudah lunas, tidak bisa expired."); inv.status=INV_STATUS.EXPIRED; saveList(STORAGE.INVOICES,list); return inv; },
  };

  const PaymentDB = {
    STATUS:PAY_STATUS,
    getAll(){ return loadList(STORAGE.PAYMENTS, seedPayments); },
    getById(id){ return this.getAll().find(p=>p.id===id)||null; },
    isTransactionTaken(txnId){ return this.getAll().some(p=>p.transaction_id===txnId); },
    summary(){ const l=this.getAll(); return { total:l.length, processed:l.filter(p=>p.status===PAY_STATUS.PROCESSED).length, rejected:l.filter(p=>p.status===PAY_STATUS.REJECTED).length, totalAmount:l.filter(p=>p.status===PAY_STATUS.PROCESSED).reduce((s,p)=>s+p.amount,0) }; },
    create(data){ const list=this.getAll(); if(this.isTransactionTaken(data.transaction_id)) throw new Error("Transaction ID sudah diproses."); const record={ id:uid("PAY"), ...data, status:PAY_STATUS.PROCESSED, created_at:nowISO() }; list.push(record); saveList(STORAGE.PAYMENTS,list); return record; },
    simulateCallback(data){ if(this.isTransactionTaken(data.transaction_id)) throw new Error("Transaction ID sudah diproses (idempotent)."); const inv=InvoiceDB.getAll().find(i=>i.virtual_account===data.virtual_account); if(!inv) throw new Error("Virtual Account tidak ditemukan."); if(inv.status===INV_STATUS.PAID) throw new Error("Invoice sudah lunas."); if(Number(data.amount)!==inv.amount) throw new Error("Nominal tidak sesuai: "+data.amount+" vs "+inv.amount); InvoiceDB.markPaid(inv.id, data.paid_at); const pay=this.create({...data, invoice_number:inv.invoice_number, customer_name:inv.customer_name, status:PAY_STATUS.PROCESSED}); return { payment:pay, invoice:inv }; },
  };

  const SettlementDB = {
    STATUS:SETTLE_STATUS,
    getAll(){ return loadList(STORAGE.SETTLEMENTS, seedSettlements); },
    summary(){ const l=this.getAll(); return { total:l.length, pending:l.filter(s=>s.status===SETTLE_STATUS.PENDING).length, settled:l.filter(s=>s.status===SETTLE_STATUS.SETTLED).length, totalPendingAmount:l.filter(s=>s.status===SETTLE_STATUS.PENDING).reduce((s,x)=>s+x.mitra_amount,0), totalSettledAmount:l.filter(s=>s.status===SETTLE_STATUS.SETTLED).reduce((s,x)=>s+x.mitra_amount,0) }; },
    create(data){ const list=this.getAll(); const record={ id:uid("STL"), ...data, status:SETTLE_STATUS.PENDING, created_at:nowISO() }; list.push(record); saveList(STORAGE.SETTLEMENTS,list); return record; },
    markSettled(id){ const list=this.getAll(); const s=list.find(x=>x.id===id); if(!s) throw new Error("Settlement tidak ditemukan."); s.status=SETTLE_STATUS.SETTLED; saveList(STORAGE.SETTLEMENTS,list); },
  };

  const PayoutDB = {
    STATUS:PAYOUT_STATUS,
    getAll(){ return loadList(STORAGE.PAYOUTS, seedPayouts); },
    summary(){ const l=this.getAll(); return { total:l.length, requested:l.filter(p=>p.status===PAYOUT_STATUS.REQUESTED).length, approved:l.filter(p=>p.status===PAYOUT_STATUS.APPROVED).length, paid:l.filter(p=>p.status===PAYOUT_STATUS.PAID).length, totalAmount:l.filter(p=>p.status===PAYOUT_STATUS.PAID).reduce((s,x)=>s+x.amount,0) }; },
    create(data){ const list=this.getAll(); const record={ id:uid("POU"), ...data, status:PAYOUT_STATUS.REQUESTED, created_at:nowISO() }; list.push(record); saveList(STORAGE.PAYOUTS,list); return record; },
    approve(id){ const list=this.getAll(); const p=list.find(x=>x.id===id); if(!p) throw new Error("Payout tidak ditemukan."); p.status=PAYOUT_STATUS.APPROVED; saveList(STORAGE.PAYOUTS,list); },
    markPaid(id, proofFile){ const list=this.getAll(); const p=list.find(x=>x.id===id); if(!p) throw new Error("Payout tidak ditemukan."); p.status=PAYOUT_STATUS.PAID; p.proof_file=proofFile; p.paid_at=nowISO(); saveList(STORAGE.PAYOUTS,list); },
    reject(id, reason){ const list=this.getAll(); const p=list.find(x=>x.id===id); if(!p) throw new Error("Payout tidak ditemukan."); p.status=PAYOUT_STATUS.REJECTED; p.reject_reason=reason; saveList(STORAGE.PAYOUTS,list); },
  };

  const RadiusLogDB = {
    STATUS:RADIUS_STATUS,
    getAll(){ return loadList(STORAGE.RADIUS_LOGS, seedRadiusLogs); },
    summary(){ const l=this.getAll(); return { total:l.length, success:l.filter(r=>r.status===RADIUS_STATUS.SUCCESS).length, failed:l.filter(r=>r.status===RADIUS_STATUS.FAILED).length }; },
    create(data){ const list=this.getAll(); const record={ id:uid("RAD"), ...data, created_at:nowISO() }; list.push(record); saveList(STORAGE.RADIUS_LOGS,list); return record; },
  };

  global.CustomerDB = CustomerDB;
  global.ServiceDB = ServiceDB;
  global.MitraDB = MitraDB;
  global.BasePackageDB = BasePackageDB;
  global.InvoiceDB = InvoiceDB;
  global.PaymentDB = PaymentDB;
  global.SettlementDB = SettlementDB;
  global.PayoutDB = PayoutDB;
  global.RadiusLogDB = RadiusLogDB;

  global.AppRole = {
    all(){ return Object.values(ROLES); },
    get(){ return localStorage.getItem(STORAGE.ROLE) || ROLES.ADMIN_MITRA; },
    set(role){ localStorage.setItem(STORAGE.ROLE, this.all().includes(role) ? role : ROLES.ADMIN_MITRA); }
  };

  const ICONS = {
    dashboard:"<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1.5\"/>",
    users:"<path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>",
    box:"<path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"/><polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"/>",
    customer:"<circle cx=\"12\" cy=\"8\" r=\"3.4\"/><path d=\"M4.5 20c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6\"/>",
    customerPackage:"<path d=\"M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"8.5\" cy=\"7\" r=\"4\"/><polyline points=\"17 11 19 13 23 9\"/>",
    invoice:"<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/><polyline points=\"14 2 14 8 20 8\"/><line x1=\"9\" y1=\"13\" x2=\"15\" y2=\"13\"/><line x1=\"9\" y1=\"17\" x2=\"15\" y2=\"17\"/>",
    payment:"<rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"2\"/><line x1=\"1\" y1=\"10\" x2=\"23\" y2=\"10\"/>",
    money:"<path d=\"M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/>",
    olt:"<rect x=\"2\" y=\"6\" width=\"20\" height=\"5\" rx=\"1.5\"/><rect x=\"2\" y=\"14\" width=\"20\" height=\"5\" rx=\"1.5\"/><line x1=\"6\" y1=\"8.5\" x2=\"6\" y2=\"8.5\"/><line x1=\"6\" y1=\"16.5\" x2=\"6\" y2=\"16.5\"/>",
    odp:"<circle cx=\"6\" cy=\"12\" r=\"2.5\"/><circle cx=\"18\" cy=\"6\" r=\"2.5\"/><circle cx=\"18\" cy=\"18\" r=\"2.5\"/><path d=\"M8.5 11 15.5 7M8.5 13l7 4\"/>",
    monitor:"<path d=\"M3 12h4l2 7 4-14 2 7h5\"/>",
    radius:"<path d=\"M12 20v-6M6 20v-3M18 20v-9\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"4\" rx=\"1.5\"/>"
  };

  const SIDEBAR_MENU_SUPER_ADMIN = [
    { section:"Utama", items:[{ label:"Dashboard", href:"/index.html", icon:ICONS.dashboard }]},
    { section:"Administrasi", items:[
      { label:"Mitra Management", href:"/pages/mitra-management/index.html", icon:ICONS.users },
    ]},
    { section:"Modul Billing & Payment", items:[
      { label:"Payment", href:"/pages/payment/index.html", icon:ICONS.payment },
      { label:"Settlement", href:"/pages/settlement/index.html", icon:ICONS.money },
    ]},
    { section:"Modul Jaringan & NOC", items:[
      { label:"OLT Management", href:"/pages/olt-management/index.html", icon:ICONS.olt },
      { label:"ODP / Splitter", href:"/pages/odp-management/index.html", icon:ICONS.odp },
      { label:"Monitoring OLT", href:"/pages/monitoring-olt/index.html", icon:ICONS.monitor },
      { label:"Radius Logs", href:"/pages/radius/index.html", icon:ICONS.radius },
    ]},
  ];

  const SIDEBAR_MENU_ADMIN_MITRA = [
    { section:"Utama", items:[{ label:"Dashboard", href:"/index.html", icon:ICONS.dashboard }]},
    { section:"Modul Customer Management", items:[{ label:"Customer Management", href:"/pages/customer-management/index.html", icon:ICONS.customer }]},
    { section:"Modul Penjualan & Layanan", items:[
      { label:"Paket Layanan", href:"/pages/sales-service-management/packages.html", icon:ICONS.box },
      { label:"Paket Pelanggan", href:"/pages/sales-service-management/customer-packages.html", icon:ICONS.customerPackage }
    ]},
    { section:"Modul Billing & Payment", items:[
      { label:"Invoice / Billing", href:"/pages/billing/index.html", icon:ICONS.invoice },
      { label:"Payment", href:"/pages/payment/index.html", icon:ICONS.payment },
      { label:"Settlement", href:"/pages/settlement/index.html", icon:ICONS.money },
    ]},
  ];

  global.SIDEBAR_MENUS = {
    [ROLES.SUPER_ADMIN]: SIDEBAR_MENU_SUPER_ADMIN,
    [ROLES.ADMIN_MITRA]: SIDEBAR_MENU_ADMIN_MITRA,
  };
  global.SIDEBAR_MENU = SIDEBAR_MENU_ADMIN_MITRA;
})(window);
