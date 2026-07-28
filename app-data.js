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
  { id:'mitra', name:'Admin Mitra', email:'mitra@dasaria.id', initials:'AM', role:'Admin User', partner_id:'P-1001' },
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
  {id:'PTR-0001', partner_code:'DSR-JKT-01', partner_name:'Mitra Nusantara Net', company_name:'PT Nusantara Net Indonesia', phone_number:'0812-3456-7810', email:'admin@nusantaranet.id', address:'Jl. Sudirman Kav. 21, Jakarta Selatan', operational_area:'Jabodetabek', business_configuration:'Revenue Share 70/30', status:'Aktif', users_count:8, created_at:'2024-02-11'},
  {id:'PTR-0002', partner_code:'DSR-BDG-01', partner_name:'Priangan Fiber', company_name:'CV Priangan Fiber Optik', phone_number:'0813-2211-9087', email:'ops@prianganfiber.co.id', address:'Jl. Asia Afrika No. 88, Bandung', operational_area:'Jawa Barat', business_configuration:'Revenue Share 65/35', status:'Aktif', users_count:5, created_at:'2024-05-02'},
  {id:'PTR-0003', partner_code:'DSR-SMG-01', partner_name:'Semarang Konek', company_name:'PT Semarang Konek Digital', phone_number:'0857-4433-2201', email:'cs@semarangkonek.id', address:'Jl. Pandanaran No. 12, Semarang', operational_area:'Jawa Tengah', business_configuration:'Revenue Share 70/30', status:'Aktif', users_count:4, created_at:'2024-06-19'},
  {id:'PTR-0004', partner_code:'DSR-SBY-01', partner_name:'Surya Broadband', company_name:'PT Surya Broadband Timur', phone_number:'0821-9988-1234', email:'admin@suryabb.id', address:'Jl. Raya Darmo No. 45, Surabaya', operational_area:'Jawa Timur', business_configuration:'Flat Fee Bulanan', status:'Aktif', users_count:11, created_at:'2023-11-08'},
  {id:'PTR-0005', partner_code:'DSR-DPS-01', partner_name:'Bali Cepat Internet', company_name:'PT Bali Cepat Internet', phone_number:'0817-6655-3321', email:'hello@balicepat.id', address:'Jl. Sunset Road No. 9, Denpasar', operational_area:'Bali & Nusra', business_configuration:'Revenue Share 60/40', status:'Nonaktif', users_count:2, created_at:'2023-08-14'},
  {id:'PTR-0006', partner_code:'DSR-MDN-01', partner_name:'Medan Fiber Jaya', company_name:'PT Medan Fiber Jaya Abadi', phone_number:'0852-1122-3344', email:'info@medanfiberjaya.id', address:'Jl. Gatot Subroto No. 210, Medan', operational_area:'Sumatera Utara', business_configuration:'Revenue Share 70/30', status:'Aktif', users_count:6, created_at:'2024-09-01'},
];

DB.users = [
  {id:'USR-1001', partner_id:'PTR-0001', user_name:'Dimas Prasetyo', username:'dimas.p', role_name:'Administrator Mitra', user_status:'Aktif', last_login:'2026-07-25T09:12:00'},
  {id:'USR-1002', partner_id:'PTR-0001', user_name:'Retno Wulandari', username:'retno.w', role_name:'Staf Billing', user_status:'Aktif', last_login:'2026-07-24T14:03:00'},
  {id:'USR-1003', partner_id:'PTR-0001', user_name:'Agus Salim', username:'agus.s', role_name:'Teknisi', user_status:'Nonaktif', last_login:'2026-06-30T08:47:00'},
  {id:'USR-1004', partner_id:'PTR-0002', user_name:'Hendra Gunawan', username:'hendra.g', role_name:'Administrator Mitra', user_status:'Aktif', last_login:'2026-07-25T07:55:00'},
  {id:'USR-1005', partner_id:'PTR-0002', user_name:'Siti Marlina', username:'siti.m', role_name:'Staf Customer Service', user_status:'Aktif', last_login:'2026-07-23T11:20:00'},
  {id:'USR-1006', partner_id:'PTR-0003', user_name:'Yusuf Hidayat', username:'yusuf.h', role_name:'Administrator Mitra', user_status:'Aktif', last_login:'2026-07-22T16:40:00'},
  {id:'USR-1007', partner_id:'PTR-0004', user_name:'Fitriani Anggraini', username:'fitriani.a', role_name:'Administrator Mitra', user_status:'Aktif', last_login:'2026-07-25T10:02:00'},
  {id:'USR-1008', partner_id:'PTR-0004', user_name:'Bayu Nugroho', username:'bayu.n', role_name:'Teknisi', user_status:'Aktif', last_login:'2026-07-21T13:11:00'},
];

DB.roles = ['Administrator Mitra','Staf Billing','Staf Customer Service','Teknisi'];

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
  {id:'PKG-04', partner_id:'PTR-0002', package_name:'Fiber Lite 15 Mbps', bandwidth:'15 Mbps', price:175000, status:'Aktif'},
  {id:'PKG-05', partner_id:'PTR-0002', package_name:'Fiber Pro 75 Mbps', bandwidth:'75 Mbps', price:349000, status:'Aktif'},
  {id:'PKG-06', partner_id:'PTR-0004', package_name:'Surya Ultra 150 Mbps', bandwidth:'150 Mbps', price:499000, status:'Nonaktif'},
];

DB.customers = [
  {id:'CUS-2001', partner_id:'PTR-0001', pppoe_secret:'nn-jkt-00231', radius_username:'nn00231', customer_name:'Andi Wijaya', phone_number:'0813-7788-2201', customer_type:'Reguler', subscribe_date:'2025-01-14', expired_date:'2026-08-14', installation_address:'Jl. Kemang Raya No. 12A, Jakarta Selatan', package_id:'PKG-02', customer_status:'Active', modem_serial_number:'ZTE-887231AA', latitude:-6.2608, longitude:106.8133, olt_port:'OLT-01/PON-03', onu_number:'ONU-0231', access_name:'Access-Kemang-02', access_port:'12'},
  {id:'CUS-2002', partner_id:'PTR-0001', pppoe_secret:'nn-jkt-00187', radius_username:'nn00187', customer_name:'Maria Angelina', phone_number:'0857-1122-9034', customer_type:'Reguler', subscribe_date:'2024-11-02', expired_date:'2026-07-30', installation_address:'Jl. Cipete Utara No. 7, Jakarta Selatan', package_id:'PKG-01', customer_status:'Isolir', modem_serial_number:'ZTE-887214BC', latitude:-6.2717, longitude:106.7999, olt_port:'OLT-01/PON-02', onu_number:'ONU-0187', access_name:'Access-Cipete-01', access_port:'05'},
  {id:'CUS-2003', partner_id:'PTR-0001', pppoe_secret:'nn-jkt-00305', radius_username:'nn00305', customer_name:'Balai RW 04 Kemang', phone_number:'0812-0000-1111', customer_type:'Fasum', subscribe_date:'2024-06-01', expired_date:'2027-06-01', installation_address:'Balai Warga RW 04, Kemang, Jakarta Selatan', package_id:'PKG-01', customer_status:'Active', modem_serial_number:'ZTE-887299FF', latitude:-6.2630, longitude:106.8150, olt_port:'OLT-01/PON-03', onu_number:'ONU-0305', access_name:'Access-Kemang-02', access_port:'16'},
  {id:'CUS-2004', partner_id:'PTR-0001', pppoe_secret:'nn-jkt-00412', radius_username:'nn00412', customer_name:'Robert Simanjuntak', phone_number:'0821-4455-8890', customer_type:'Reguler', subscribe_date:'2025-09-10', expired_date:'2026-06-10', installation_address:'Jl. Fatmawati No. 90, Jakarta Selatan', package_id:'PKG-03', customer_status:'Terminate', modem_serial_number:'ZTE-887302GH', latitude:-6.2921, longitude:106.7970, olt_port:'OLT-02/PON-01', onu_number:'ONU-0412', access_name:'Access-Fatmawati-01', access_port:'02'},
  {id:'CUS-2005', partner_id:'PTR-0002', pppoe_secret:'pf-bdg-00088', radius_username:'pf00088', customer_name:'Dewi Lestari', phone_number:'0813-9900-2231', customer_type:'Reguler', subscribe_date:'2025-03-21', expired_date:'2026-08-21', installation_address:'Jl. Dago No. 55, Bandung', package_id:'PKG-05', customer_status:'Active', modem_serial_number:'HW-9982JK', latitude:-6.8951, longitude:107.6134, olt_port:'OLT-05/PON-01', onu_number:'ONU-0088', access_name:'Access-Dago-01', access_port:'09'},
  {id:'CUS-2006', partner_id:'PTR-0002', pppoe_secret:'pf-bdg-00120', radius_username:'pf00120', customer_name:'Fajar Ramadhan', phone_number:'0857-6677-1290', customer_type:'Reguler', subscribe_date:'2025-05-30', expired_date:'2026-07-28', installation_address:'Jl. Setiabudi No. 33, Bandung', package_id:'PKG-04', customer_status:'Isolir', modem_serial_number:'HW-9991LM', latitude:-6.8551, longitude:107.5980, olt_port:'OLT-05/PON-02', onu_number:'ONU-0120', access_name:'Access-Setiabudi-01', access_port:'14'},
  {id:'CUS-2007', partner_id:'PTR-0004', pppoe_secret:'sb-sby-00551', radius_username:'sb00551', customer_name:'Nadia Kusuma', phone_number:'0812-3300-7788', customer_type:'Reguler', subscribe_date:'2024-12-19', expired_date:'2026-08-05', installation_address:'Jl. Darmo Permai No. 18, Surabaya', package_id:'PKG-06', customer_status:'Active', modem_serial_number:'ZTE-770021QW', latitude:-7.2777, longitude:112.7183, olt_port:'OLT-09/PON-01', onu_number:'ONU-0551', access_name:'Access-Darmo-01', access_port:'03'},
  {id:'CUS-2008', partner_id:'PTR-0004', pppoe_secret:'sb-sby-00602', radius_username:'sb00602', customer_name:'Panti Asuhan Kasih Bunda', phone_number:'0812-0000-2222', customer_type:'Fasum', subscribe_date:'2024-02-14', expired_date:'2027-02-14', installation_address:'Jl. Kertajaya No. 200, Surabaya', package_id:'PKG-06', customer_status:'Active', modem_serial_number:'ZTE-770099RT', latitude:-7.2704, longitude:112.7772, olt_port:'OLT-09/PON-02', onu_number:'ONU-0602', access_name:'Access-Kertajaya-01', access_port:'11'},
  /* Pelanggan baru — belum diregistrasi ke OLT, menunggu di antrian Registrasi Pelanggan */
  {id:'CUS-2009', partner_id:'PTR-0001', pppoe_secret:'nn-jkt-00489', radius_username:'nn00489', customer_name:'Yoga Ramadhan', phone_number:'0812-5566-7788', customer_type:'Reguler', subscribe_date:'2026-07-24', expired_date:'2026-08-24', installation_address:'Jl. Kemang Selatan No. 30, Jakarta Selatan', package_id:'PKG-02', customer_status:'Unregistered', modem_serial_number:'', latitude:-6.2650, longitude:106.8110, olt_port:'', onu_number:'', access_name:'', access_port:'', olt_id:null, olt_slot:null, olt_pon:null, olt_rx_register:null},
  {id:'CUS-2010', partner_id:'PTR-0002', pppoe_secret:'pf-bdg-00201', radius_username:'pf00201', customer_name:'Nurul Fadhila', phone_number:'0857-3344-5566', customer_type:'Reguler', subscribe_date:'2026-07-25', expired_date:'2026-08-25', installation_address:'Jl. Ir. H. Juanda No. 60, Bandung', package_id:'PKG-04', customer_status:'Unregistered', modem_serial_number:'', latitude:-6.8930, longitude:107.6090, olt_port:'', onu_number:'', access_name:'', access_port:'', olt_id:null, olt_slot:null, olt_pon:null, olt_rx_register:null},
];

/* ---------------------------------------------------------------------- */
/* 3. BILLING & SETTLEMENT                                                */
/* ---------------------------------------------------------------------- */

function pkgPrice(pkgId){ const p = DB.packages.find(x=>x.id===pkgId); return p? p.price : 0; }
function pkgName(pkgId){ const p = DB.packages.find(x=>x.id===pkgId); return p? p.package_name : '-'; }
function custName(id){ const c = DB.customers.find(x=>x.id===id); return c? c.customer_name : '-'; }
function partnerName(id){ const p = DB.partners.find(x=>x.id===id); return p? p.partner_name : '-'; }

DB.invoices = [
  {id:'INV-880231', customer_id:'CUS-2001', invoice_number:'INV/2026/07/00231', billing_period:'Juli 2026', billing_amount:299000, generated_date:'2026-07-01', due_date:'2026-07-15', billing_status:'Lunas'},
  {id:'INV-880187', customer_id:'CUS-2002', invoice_number:'INV/2026/07/00187', billing_period:'Juli 2026', billing_amount:199000, generated_date:'2026-07-01', due_date:'2026-07-10', billing_status:'Jatuh Tempo'},
  {id:'INV-880305', customer_id:'CUS-2003', invoice_number:'INV/2026/07/00305', billing_period:'Juli 2026', billing_amount:199000, generated_date:'2026-07-01', due_date:'2026-07-15', billing_status:'Belum Dibayar'},
  {id:'INV-880412', customer_id:'CUS-2004', invoice_number:'INV/2026/06/00412', billing_period:'Juni 2026', billing_amount:429000, generated_date:'2026-06-01', due_date:'2026-06-15', billing_status:'Jatuh Tempo'},
  {id:'INV-880088', customer_id:'CUS-2005', invoice_number:'INV/2026/07/00088', billing_period:'Juli 2026', billing_amount:349000, generated_date:'2026-07-01', due_date:'2026-07-20', billing_status:'Lunas'},
  {id:'INV-880120', customer_id:'CUS-2006', invoice_number:'INV/2026/07/00120', billing_period:'Juli 2026', billing_amount:175000, generated_date:'2026-07-01', due_date:'2026-07-08', billing_status:'Jatuh Tempo'},
  {id:'INV-880551', customer_id:'CUS-2007', invoice_number:'INV/2026/07/00551', billing_period:'Juli 2026', billing_amount:499000, generated_date:'2026-07-01', due_date:'2026-07-18', billing_status:'Belum Dibayar'},
  {id:'INV-880602', customer_id:'CUS-2008', invoice_number:'INV/2026/07/00602', billing_period:'Juli 2026', billing_amount:499000, generated_date:'2026-07-01', due_date:'2026-07-14', billing_status:'Belum Dibayar'},
];

/* ---------------------------------------------------------------------- */
/* 4. PAYMENT GATEWAY (PASPE)                                             */
/* ---------------------------------------------------------------------- */

DB.payments = [
  {id:'PAY-90001', invoice_id:'INV-880231', payment_reference:'PSP-20260720-88231', virtual_account:'88808 2231 0091', billing_amount:299000, payment_date:'2026-07-20T10:14:00', payment_status:'Berhasil'},
  {id:'PAY-90002', invoice_id:'INV-880088', payment_reference:'PSP-20260719-00088', virtual_account:'88808 0088 0044', billing_amount:349000, payment_date:'2026-07-19T15:42:00', payment_status:'Berhasil'},
  {id:'PAY-90003', invoice_id:'INV-880187', payment_reference:'PSP-20260726-00187', virtual_account:'88808 0187 0072', billing_amount:199000, payment_date:'2026-07-26T08:05:00', payment_status:'Pending'},
  {id:'PAY-90004', invoice_id:'INV-880412', payment_reference:'PSP-20260625-00412', virtual_account:'88808 0412 0018', billing_amount:429000, payment_date:'2026-06-25T19:33:00', payment_status:'Gagal'},
  {id:'PAY-90005', invoice_id:'INV-880120', payment_reference:'PSP-20260726-00120', virtual_account:'88808 0120 0056', billing_amount:175000, payment_date:'2026-07-26T09:50:00', payment_status:'Berhasil'},
];

/* ---------------------------------------------------------------------- */
/* 5. RADIUS & CONTROL GATEWAY                                            */
/* ---------------------------------------------------------------------- */

DB.radius = DB.customers.map(c => {
  const statusMap = {Active:'Active', Isolir:'Isolir', Terminate:'Terminate'};
  const radiusMap = {Active:'Online', Isolir:'Isolir', Terminate:'Offline'};
  return {
    id:'RAD-'+c.id,
    customer_id:c.id,
    bandwidth:(DB.packages.find(p=>p.id===c.package_id)||{}).bandwidth || '-',
    customer_status:statusMap[c.customer_status] || c.customer_status,
    radius_status:radiusMap[c.customer_status] || 'Offline',
    isolation_date: c.customer_status==='Isolir' ? '2026-07-11' : null,
    activation_date: c.customer_status==='Active' ? '2026-07-01' : null,
    last_update:'2026-07-26T0'+((Math.floor(Math.random()*8)+1))+':1'+(Math.floor(Math.random()*5))+':00',
  };
});

/* ---------------------------------------------------------------------- */
/* 6. INFRASTRUCTURE / ODP                                                */
/* ---------------------------------------------------------------------- */

DB.infrastructure = [
  {
    id:'OLT-01', type:'olt', label:'OLT-01 · Kemang Sudirman', partner_id:'PTR-0001', olt_type:'Huawei MA5800',
    children:[
      {
        id:'SPL-01-IN', type:'input', label:'Input Splitter 1:2 — SPL-01-IN', olt:'OLT-01',
        children:[
          {id:'SPL-01-OUT-A', type:'output', label:'Output Splitter 1:8 — Kemang Raya A', lat:-6.2608, lng:106.8133, address:'Jl. Kemang Raya No. 12, Jakarta Selatan', capacity:8, connected:6, status:'Aktif'},
          {id:'SPL-01-OUT-B', type:'output', label:'Output Splitter 1:16 — Cipete Utara B', lat:-6.2717, lng:106.7999, address:'Jl. Cipete Utara No. 5, Jakarta Selatan', capacity:16, connected:11, status:'Aktif'},
        ]
      },
      {
        id:'SPL-02-IN', type:'input', label:'Input Splitter 1:2 — SPL-02-IN', olt:'OLT-01',
        children:[
          {id:'SPL-02-OUT-A', type:'output', label:'Output Splitter 1:8 — Fatmawati C', lat:-6.2921, lng:106.7970, address:'Jl. Fatmawati No. 88, Jakarta Selatan', capacity:8, connected:3, status:'Aktif'},
        ]
      }
    ]
  },
  {
    id:'OLT-05', type:'olt', label:'OLT-05 · Dago Bandung', partner_id:'PTR-0002', olt_type:'ZTE C320',
    children:[
      {
        id:'SPL-05-IN', type:'input', label:'Input Splitter 1:2 — SPL-05-IN', olt:'OLT-05',
        children:[
          {id:'SPL-05-OUT-A', type:'output', label:'Output Splitter 1:16 — Dago Atas', lat:-6.8551, lng:107.6134, address:'Jl. Dago Atas No. 20, Bandung', capacity:16, connected:14, status:'Aktif'},
          {id:'SPL-05-OUT-B', type:'output', label:'Output Splitter 1:8 — Setiabudi', lat:-6.8551, lng:107.5980, address:'Jl. Setiabudi No. 40, Bandung', capacity:8, connected:8, status:'Penuh'},
        ]
      }
    ]
  },
  {
    id:'OLT-09', type:'olt', label:'OLT-09 · Darmo Surabaya', partner_id:'PTR-0004', olt_type:'Fiberhome AN5516',
    children:[
      {
        id:'SPL-09-IN', type:'input', label:'Input Splitter 1:2 — SPL-09-IN', olt:'OLT-09',
        children:[
          {id:'SPL-09-OUT-A', type:'output', label:'Output Splitter 1:8 — Darmo Permai', lat:-7.2777, lng:112.7183, address:'Jl. Darmo Permai No. 18, Surabaya', capacity:8, connected:5, status:'Aktif'},
          {id:'SPL-09-OUT-B', type:'output', label:'Output Splitter 1:16 — Kertajaya', lat:-7.2704, lng:112.7772, address:'Jl. Kertajaya No. 200, Surabaya', capacity:16, connected:9, status:'Aktif'},
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
