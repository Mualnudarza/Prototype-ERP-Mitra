/* ==========================================================================
   ERP MITRA — DASARIA · MOCK DATA LAYER
   Semua data di file ini disimpan di memori (bukan backend sungguhan).
   Setiap perubahan lewat UI (tambah/edit/nonaktifkan) langsung memutasi
   array di bawah lalu memicu render ulang — cocok untuk kebutuhan prototipe.
   ========================================================================== */

const Fmt = {
  rupiah(n){
    if(n === null || n === undefined) return '-';
    const neg = n < 0;
    const v = Math.abs(Math.round(n)).toLocaleString('id-ID');
    return (neg? '-Rp ' : 'Rp ') + v;
  },
  num(n){ return Number(n).toLocaleString('id-ID'); },
  date(d){
    if(!d) return '-';
    const dt = (d instanceof Date) ? d : new Date(d);
    if(isNaN(dt)) return d;
    return dt.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
  },
  datetime(d){
    if(!d) return '-';
    const dt = (d instanceof Date) ? d : new Date(d);
    if(isNaN(dt)) return d;
    return dt.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) + ', ' +
           dt.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  },
  daysFromNow(n){
    const d = new Date();
    d.setDate(d.getDate()+n);
    return d.toISOString();
  },
  initials(name){
    return (name||'?').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  }
};

let __uid = 1000;
function nextId(prefix){ __uid += 1; return prefix + '-' + __uid; }

const USERS = [
  { id:'super', name:'Super Admin', email:'admin@dasaria.id', initials:'SA', role:'Super User', partner_id:null },
  { id:'mitra', name:'Admin Mitra', email:'mitra@dasaria.id', initials:'AM', role:'Admin User', partner_id:'PTR-0001' },
];
let CURRENT_USER = USERS[0];

const AVATAR_PALETTE = ['#3b5bdb','#0f8f6f','#b25b12','#c22a79','#6d3fc4','#127489','#c62c2c','#52525b'];
function colorFor(seed){
  let h = 0;
  for(const ch of String(seed)) h = (h*31 + ch.charCodeAt(0)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[h];
}

/* ---------------------------------------------------------------------- */
/* 1. PARTNERSHIP MANAGEMENT                                              */
/* ---------------------------------------------------------------------- */

const WILAYAH_LIST = ['Jabodetabek','Jawa Barat','Jawa Tengah','Jawa Timur','Bali & Nusra','Sumatera Utara','Kalimantan Timur'];

const DB = {};

DB.partners = [
  {id:'PTR-0001', partner_code:'DSR-JKT-01', partner_name:'Mitra Nusantara Net', company_name:'PT Nusantara Net Indonesia', phone_number:'0812-3456-7810', email:'admin@nusantaranet.id', address:'Jl. Sudirman Kav. 21, Jakarta Selatan', operational_area:'Jabodetabek', business_configuration:'Revenue Share 70/30', status:'Aktif', users_count:3, created_at:'2024-02-11', pic_name:'Budi Santoso', cooperation_name:'Kerja Sama Distribusi Fiber', cooperation_doc_no:'PKS/2024/001', cooperation_start:'2024-02-11', cooperation_end:'2027-02-11', cooperation_doc_file:'PKS_NetIndo_2024.pdf', npwp_nib:'01.234.567.8-901.000', bank_name:'Bank Mandiri', bank_account_no:'1230007890123', bank_account_name:'PT Nusantara Net Indonesia', payment_due_type:'Tanggal Tetap', payment_due_value:'10', cashier_deposit_min:500000, cashier_deposit_initial:5000000, deposit_balance:4701000, kso_value:30, kso_type:'percentage', other_deductions:[{name:'Biaya Administrasi',value:2,type:'percentage'}]},
];

DB.users = [
  {id:'USR-1001', partner_id:'PTR-0001', user_name:'Dimas Prasetyo', username:'dimas.p', role_name:'Administrator Mitra', user_status:'Aktif', last_login:'2026-07-25T09:12:00'},
  {id:'USR-1002', partner_id:'PTR-0001', user_name:'Retno Wulandari', username:'retno.w', role_name:'Staf Billing', user_status:'Aktif', last_login:'2026-07-24T14:03:00'},
  {id:'USR-1003', partner_id:'PTR-0001', user_name:'Agus Salim', username:'agus.s', role_name:'Teknisi', user_status:'Nonaktif', last_login:'2026-06-30T08:47:00'},
];

DB.roles = ['Administrator Mitra','Staf Billing','Staf Customer Service','Teknisi'];

DB.depositHistory = [
  {id:'DEP-0001', partner_id:'PTR-0001', ref:'DEP/2026/07/0001', type:'Deposit Masuk', date:'2026-07-28', amount:5000000, balance_before:0, balance_after:5000000, note:'Setoran awal kasir mitra', status:'Berhasil'},
  {id:'DEP-0002', partner_id:'PTR-0001', ref:'DEP/2026/07/0002', type:'Deposit Keluar', date:'2026-07-29', amount:-299000, balance_before:5000000, balance_after:4701000, note:'Pembayaran tunai CUS-2001 (Andi Wijaya)', status:'Berhasil'}
];

DB.settlements = [
  {id:'SET-0001', partner_id:'PTR-0001', ref:'SET/2026/07/0001', period:'Juli 2026', tx_count:1, gross_revenue:299000, total_deduction:95680, net_revenue:203320, bank_account:'Bank Mandiri - 1230007890123', status:'Selesai', date:'2026-07-29'},
];

DB.settlementHistory = [
  {id:'STL-500231', partner_id:'PTR-0001', ref:'STL/2026/07/0231', type:'Settlement', amount:14250000, balance_before:2100000, balance_after:16350000, date:'2026-07-20', note:'Settlement periode Juli 2026'},
  {id:'STL-500198', partner_id:'PTR-0001', ref:'TOP/2026/07/0198', type:'Top Up', amount:5000000, balance_before:-2900000, balance_after:2100000, date:'2026-07-15', note:'Top up saldo manual'},
  {id:'STL-500177', partner_id:'PTR-0001', ref:'DED/2026/07/0177', type:'Auto Deduction', amount:-1200000, balance_before:-1700000, balance_after:-2900000, date:'2026-07-10', note:'Potongan biaya operasional'},
  {id:'STL-500122', partner_id:'PTR-0001', ref:'STL/2026/06/0122', type:'Settlement', amount:12980000, balance_before:-14680000, balance_after:-1700000, date:'2026-06-20', note:'Settlement periode Juni 2026'},
];

/* ---------------------------------------------------------------------- */
/* 2. CUSTOMER & PACKAGE MANAGEMENT                                       */
/* ---------------------------------------------------------------------- */

DB.packages = [
  {id:'PKG-01', partner_id:'PTR-0001', package_name:'Home 20 Mbps', bandwidth:'20 Mbps', price:199000, status:'Aktif'},
  {id:'PKG-02', partner_id:'PTR-0001', package_name:'Home 50 Mbps', bandwidth:'50 Mbps', price:299000, status:'Aktif'},
  {id:'PKG-03', partner_id:'PTR-0001', package_name:'Home 100 Mbps', bandwidth:'100 Mbps', price:429000, status:'Aktif'},
];

DB.customers = [
  {id:'CUS-2001', partner_id:'PTR-0001', pppoe_secret:'nn-jkt-00231', radius_username:'nn00231', customer_name:'Andi Wijaya', phone_number:'0813-7788-2201', customer_type:'Reguler', subscribe_date:'2025-01-14', expired_date:'2026-08-14', installation_address:'Jl. Kemang Raya No. 12A, Jakarta Selatan', package_id:'PKG-02', customer_status:'Active', modem_serial_number:'ZTE-887231AA', latitude:-6.2608, longitude:106.8133, olt_port:'OLT-01/ODP-1', onu_number:'ONU-0231', access_name:'ODP 1:8 — Kemang Raya A', access_port:'12', olt_id:'OLT-01', olt_odp_id:'SPL-01-OUT-A', olt_slot:'1', olt_pon:'1', olt_rx_register:-21.2},
  {id:'CUS-2002', partner_id:'PTR-0001', pppoe_secret:'nn-jkt-00187', radius_username:'nn00187', customer_name:'Maria Angelina', phone_number:'0857-1122-9034', customer_type:'Reguler', subscribe_date:'2024-11-02', expired_date:'2026-07-30', installation_address:'Jl. Cipete Utara No. 7, Jakarta Selatan', package_id:'PKG-01', customer_status:'Isolir', modem_serial_number:'ZTE-887214BC', latitude:-6.2717, longitude:106.7999, olt_port:'OLT-01/ODP-2', onu_number:'ONU-0187', access_name:'ODP 1:16 — Cipete Utara B', access_port:'05', olt_id:'OLT-01', olt_odp_id:'SPL-01-OUT-B', olt_slot:'2', olt_pon:'1', olt_rx_register:-22.5},
  {id:'CUS-2003', partner_id:'PTR-0001', pppoe_secret:'nn-jkt-00305', radius_username:'nn00305', customer_name:'Balai RW 04 Kemang', phone_number:'0812-0000-1111', customer_type:'Fasum', subscribe_date:'2024-06-01', expired_date:'2027-06-01', installation_address:'Balai Warga RW 04, Kemang, Jakarta Selatan', package_id:'PKG-01', customer_status:'Active', modem_serial_number:'ZTE-887299FF', latitude:-6.2630, longitude:106.8150, olt_port:'OLT-01/ODP-3', onu_number:'ONU-0305', access_name:'ODP 1:8 — Kemang Raya A', access_port:'16', olt_id:'OLT-01', olt_odp_id:'SPL-01-OUT-A', olt_slot:'3', olt_pon:'1', olt_rx_register:-19.8},
  {id:'CUS-2004', partner_id:'PTR-0001', pppoe_secret:'nn-jkt-00412', radius_username:'nn00412', customer_name:'Robert Simanjuntak', phone_number:'0821-4455-8890', customer_type:'Reguler', subscribe_date:'2025-09-10', expired_date:'2026-06-10', installation_address:'Jl. Fatmawati No. 90, Jakarta Selatan', package_id:'PKG-03', customer_status:'Terminate', modem_serial_number:'ZTE-887302GH', latitude:-6.2921, longitude:106.7970, olt_port:'OLT-01/ODP-3', onu_number:'ONU-0412', access_name:'ODP 1:8 — Fatmawati C', access_port:'02', olt_id:'OLT-01', olt_odp_id:'SPL-02-OUT-A', olt_slot:'1', olt_pon:'1', olt_rx_register:-20.1},
  /* Pelanggan baru — belum diregistrasi ke OLT, menunggu di antrian Registrasi Pelanggan */
  {id:'CUS-2009', partner_id:'PTR-0001', pppoe_secret:'nn-jkt-00489', radius_username:'nn00489', customer_name:'Yoga Ramadhan', phone_number:'0812-5566-7788', customer_type:'Reguler', subscribe_date:'2026-07-24', expired_date:'2026-08-24', installation_address:'Jl. Kemang Selatan No. 30, Jakarta Selatan', package_id:'PKG-02', customer_status:'Unregistered', modem_serial_number:'', latitude:-6.2650, longitude:106.8110, olt_port:'', onu_number:'', access_name:'', access_port:'', olt_id:null, olt_odp_id:null, olt_slot:null, olt_pon:null, olt_rx_register:null},
  {id:'CUS-2010', partner_id:'PTR-0002', pppoe_secret:'pf-bdg-00201', radius_username:'pf00201', customer_name:'Nurul Fadhila', phone_number:'0857-3344-5566', customer_type:'Reguler', subscribe_date:'2026-07-25', expired_date:'2026-08-25', installation_address:'Jl. Ir. H. Juanda No. 60, Bandung', package_id:'PKG-04', customer_status:'Unregistered', modem_serial_number:'', latitude:-6.8930, longitude:107.6090, olt_port:'', onu_number:'', access_name:'', access_port:'', olt_id:null, olt_odp_id:null, olt_slot:null, olt_pon:null, olt_rx_register:null},
];

/* ---------------------------------------------------------------------- */
/* 3. BILLING & SETTLEMENT                                                */
/* ---------------------------------------------------------------------- */

function pkgPrice(pkgId){ const p = DB.packages.find(x=>x.id===pkgId); return p? p.price : 0; }
function pkgName(pkgId){ const p = DB.packages.find(x=>x.id===pkgId); return p? p.package_name : '-'; }
function custName(id){ const c = DB.customers.find(x=>x.id===id); return c? c.customer_name : '-'; }
function partnerName(id){ const p = DB.partners.find(x=>x.id===id); return p? p.partner_name : '-'; }

DB.invoices = [
  {id:'INV-880231', customer_id:'CUS-2001', invoice_number:'INV/2026/07/00231', billing_period:'Juli 2026', billing_amount:299000, generated_date:'2026-07-01', due_date:'2026-07-15', billing_status:'Lunas', extra_charge:5980, total_paid:304980, settled:false},
  {id:'INV-880187', customer_id:'CUS-2002', invoice_number:'INV/2026/07/00187', billing_period:'Juli 2026', billing_amount:199000, generated_date:'2026-07-01', due_date:'2026-07-10', billing_status:'Jatuh Tempo'},
  {id:'INV-880305', customer_id:'CUS-2003', invoice_number:'INV/2026/07/00305', billing_period:'Juli 2026', billing_amount:199000, generated_date:'2026-07-01', due_date:'2026-07-15', billing_status:'Belum Dibayar'},
  {id:'INV-880412', customer_id:'CUS-2004', invoice_number:'INV/2026/06/00412', billing_period:'Juni 2026', billing_amount:429000, generated_date:'2026-06-01', due_date:'2026-06-15', billing_status:'Jatuh Tempo'},
];

/* ---------------------------------------------------------------------- */
/* 4. PAYMENT GATEWAY (PASPE)                                             */
/* ---------------------------------------------------------------------- */

DB.payments = [
  {id:'PAY-90001', invoice_id:'INV-880231', payment_reference:'PSP-20260720-88231', virtual_account:'88808 2231 0091', billing_amount:299000, payment_date:'2026-07-20T10:14:00', payment_status:'Berhasil'},
  {id:'PAY-90003', invoice_id:'INV-880187', payment_reference:'PSP-20260726-00187', virtual_account:'88808 0187 0072', billing_amount:199000, payment_date:'2026-07-26T08:05:00', payment_status:'Pending'},
  {id:'PAY-90004', invoice_id:'INV-880412', payment_reference:'PSP-20260625-00412', virtual_account:'88808 0412 0018', billing_amount:429000, payment_date:'2026-06-25T19:33:00', payment_status:'Gagal'},
];

/* ---------------------------------------------------------------------- */
/* 5. RADIUS & CONTROL GATEWAY                                            */
/* ---------------------------------------------------------------------- */

DB.radius = DB.customers.map(c => {
  const statusMap = {Active:'Active', Isolir:'Isolir', Terminate:'Terminate'};
  const radiusMap = {Active:'Online', Isolir:'Isolir', Terminate:'Offline'};
  const rxRegist = c.olt_rx_register;
  return {
    id:'RAD-'+c.id,
    customer_id:c.id,
    customer_name: c.customer_name,
    pppoe_secret: c.pppoe_secret,
    onu_number: c.onu_number,
    bandwidth:(DB.packages.find(p=>p.id===c.package_id)||{}).bandwidth || '-',
    customer_status:statusMap[c.customer_status] || c.customer_status,
    radius_status:radiusMap[c.customer_status] || 'Offline',
    isolation_date: c.customer_status==='Isolir' ? '2026-07-11' : null,
    activation_date: c.customer_status==='Active' ? '2026-07-01' : null,
    last_update:'2026-07-26T0'+((Math.floor(Math.random()*8)+1))+':1'+(Math.floor(Math.random()*5))+':00',
    olt_rx_now: rxRegist != null ? Math.round((rxRegist + (Math.random()*1.6-0.8)) * 10) / 10 : null,
    olt_status: radiusMap[c.customer_status] === 'Online' ? 'Online' : (radiusMap[c.customer_status] === 'Isolir' ? 'Isolir' : 'Offline'),
  };
});

/* ---------------------------------------------------------------------- */
/* 6. INFRASTRUCTURE / ODP                                                */
/* ---------------------------------------------------------------------- */

DB.infrastructure = [
  {
    id:'OLT-01', type:'olt', label:'OLT-01 · Kemang Sudirman', partner_id:'PTR-0001', olt_type:'Huawei MA5800', address:'Gedung Sentral Komunikasi, Jl. Sudirman Kav. 52, Jakarta Selatan', lat:-6.2297, lng:106.8196,
    children:[
      {
        id:'SPL-01-IN', type:'input', label:'Input Splitter 1:2 — SPL-01-IN', olt:'OLT-01', capacity:2, connected:2, isOdp:false, address:'Jl. Kemang Raya No. 1, Jakarta Selatan', lat:-6.2608, lng:106.8133,
        children:[
          {id:'SPL-01-OUT-A', type:'output', label:'ODP 1:8 — Kemang Raya A', isOdp:true, lat:-6.2608, lng:106.8133, address:'Jl. Kemang Raya No. 12, Jakarta Selatan', capacity:8, connected:6, status:'Aktif'},
          {id:'SPL-01-OUT-B', type:'output', label:'ODP 1:16 — Cipete Utara B', isOdp:true, lat:-6.2717, lng:106.7999, address:'Jl. Cipete Utara No. 5, Jakarta Selatan', capacity:16, connected:11, status:'Aktif'},
        ]
      },
      {
        id:'SPL-02-IN', type:'input', label:'Input Splitter 1:8 — SPL-02-IN', olt:'OLT-01', capacity:8, connected:3, isOdp:false, address:'Jl. Fatmawati No. 50, Jakarta Selatan', lat:-6.2921, lng:106.7970,
        children:[
          {id:'SPL-02-OUT-A', type:'output', label:'ODP 1:8 — Fatmawati C', isOdp:true, lat:-6.2921, lng:106.7970, address:'Jl. Fatmawati No. 88, Jakarta Selatan', capacity:8, connected:3, status:'Aktif'},
        ]
      }
    ]
  }
];

/* Activity log — shared timeline used by "Activity Log" fields */
DB.activityLog = [
  {actor:'Dimas Prasetyo', action:'memperbarui paket layanan pelanggan Andi Wijaya', time:'2026-07-25T09:12:00'},
  {actor:'Sistem', action:'membuat tagihan otomatis untuk 8 pelanggan periode Juli 2026', time:'2026-07-01T00:05:00'},
  {actor:'Payment Gateway', action:'mengonfirmasi pembayaran INV/2026/07/00231', time:'2026-07-20T10:14:00'},
  {actor:'Sistem', action:'mengisolir layanan Maria Angelina karena melewati jatuh tempo', time:'2026-07-11T00:10:00'},
  {actor:'Hendra Gunawan', action:'menambahkan pelanggan baru Fajar Ramadhan', time:'2026-05-30T11:02:00'},
];

/* ---------------------------------------------------------------------- */
/* ONU REGISTRATION — script generator per vendor OLT                     */
/* ---------------------------------------------------------------------- */
function genOnuScripts(customer, oltNode, slot, pon){
  const type = (oltNode && oltNode.olt_type) || 'Huawei MA5800';
  const sn = customer.modem_serial_number || 'AUTO-DETECT';
  const onuId = (parseInt(pon,10)||0) * 8 + ((parseInt(slot,10)||1) - 1);
  const pppoeUser = customer.pppoe_secret;
  const vlan = 100 + (parseInt(slot,10)||1);
  const custPass = String(customer.customer_name||'pelanggan').replace(/\s+/g,'') + '123';

  if(type.includes('Huawei')){
    return [
      {title:'Script Scan Modem', code:`display ont autofind ${slot}/${pon}`},
      {title:'Script Registrasi Modem', code:`interface gpon ${slot}/${pon}\n ont add ${onuId} sn-auth ${sn} omci ont-lineprofile-id 10 ont-srvprofile-id 10 desc "${customer.customer_name}"\n ont confirm ${onuId}\n quit`},
      {title:'Script Pemeriksaan Redaman', code:`display ont optical-info ${slot}/${pon} ${onuId}`},
      {title:'Script Konfigurasi Profile ONU', code:`interface gpon ${slot}/${pon}\n ont modify ${onuId} ont-lineprofile-id 10 ont-srvprofile-id 10\n quit`},
      {title:'Script Konfigurasi PPPoE', code:`service-port vlan ${vlan} gpon ${slot}/${pon} ont ${onuId} gemport 1 multi-service user-vlan ${vlan} tag-transform translate`},
    ];
  }
  if(type.includes('ZTE')){
    return [
      {title:'Script Scan Modem', code:`show pon onu-unregister gpon_olt-${slot}/${pon}`},
      {title:'Script Registrasi Modem', code:`configure terminal\n interface gpon_olt-${slot}/${pon}\n  onu ${onuId} type ZTE-F660 sn ${sn}\n  onu ${onuId} profile lineprofile ${onuId} create\n  onu ${onuId} tcont 1 profile 10\n  onu ${onuId} gemport 1 tcont 1\n  onu ${onuId} service 1 gemport 1 vlan ${vlan} translate\n exit\n exit`},
      {title:'Script Pemeriksaan Redaman', code:`show pon power attenuation gpon_olt-${slot}/${pon} onu_id ${onuId}`},
      {title:'Script Konfigurasi Profile ONU', code:`configure terminal\n interface gpon_olt-${slot}/${pon}\n  onu ${onuId} lineprofile 10\n  onu ${onuId} srvprofile 10\n exit\n exit`},
      {title:'Script Konfigurasi PPPoE', code:`configure terminal\n interface gpon_olt-${slot}/${pon}\n  onu ${onuId} pppoe 1 user ${pppoeUser} password ${custPass}\n exit\n exit`},
    ];
  }
  // Fiberhome (default fallback)
  return [
    {title:'Script Scan Modem', code:`show pon onu unregister interface gpon ${slot}/${pon}`},
    {title:'Script Registrasi Modem', code:`configure terminal\n interface gpon ${slot}/${pon}\n  onu ${onuId} sn ${sn}\n  onu ${onuId} line profile 10\n  onu ${onuId} service profile 10\n  onu ${onuId} vlan mode tag ${vlan}\n exit\n exit`},
    {title:'Script Pemeriksaan Redaman', code:`show pon optical-rx interface gpon ${slot}/${pon} onu ${onuId}`},
    {title:'Script Konfigurasi Profile ONU', code:`configure terminal\n interface gpon ${slot}/${pon}\n  onu ${onuId} line profile 10\n  onu ${onuId} service profile 10\n exit\n exit`},
    {title:'Script Konfigurasi PPPoE', code:`configure terminal\n interface gpon ${slot}/${pon}\n  onu ${onuId} pppoe username ${pppoeUser} password ${custPass}\n exit\n exit`},
  ];
}
function allOltNodes(){
  return DB.infrastructure.map(o=>({id:o.id, label:o.label, olt_type:o.olt_type, partner_id:o.partner_id}));
}
function findOltNode(id){
  return DB.infrastructure.find(o=>o.id===id) || null;
}
function allInputSplitters(oltId){
  const olt = findOltNode(oltId);
  if(!olt) return [];
  return (olt.children||[]).map(c=>({id:c.id, label:c.label, olt_id:oltId, isOdp:c.isOdp}));
}
function allOutputSplitters(oltId, inputId){
  const olt = findOltNode(oltId);
  if(!olt) return [];
  const inp = (olt.children||[]).find(c=>c.id===inputId);
  if(!inp) return [];
  return (inp.children||[]).map(c=>({id:c.id, label:c.label, connected:c.connected, capacity:c.capacity, status:c.status}));
}
function findInputSplitter(oltId, inputId){
  const olt = findOltNode(oltId);
  if(!olt) return null;
  return (olt.children||[]).find(c=>c.id===inputId) || null;
}
function findOutputSplitter(oltId, inputId, outputId){
  const inp = findInputSplitter(oltId, inputId);
  if(!inp) return null;
  return (inp.children||[]).find(c=>c.id===outputId) || null;
}
function allOdps(){
  const results = [];
  DB.infrastructure.forEach(olt => {
    (olt.children||[]).forEach(inp => {
      (inp.children||[]).forEach(out => {
        if(out.isOdp) results.push({...out, oltId: olt.id, oltLabel: olt.label, parentLabel: inp.label});
      });
      if(inp.isOdp) results.push({...inp, oltId: olt.id, oltLabel: olt.label});
    });
  });
  return results;
}
function findOdpNode(id){
  for(const olt of DB.infrastructure){
    for(const inp of (olt.children||[])){
      for(const out of (inp.children||[])){
        if(out.id === id) return {node:out, oltId:olt.id, parentId:inp.id, type:'output'};
      }
      if(inp.id === id && inp.isOdp) return {node:inp, oltId:olt.id, parentId:null, type:'input'};
    }
  }
  return null;
}
