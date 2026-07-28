/* ==========================================================================
   ERP MITRA — APP ENTRY / ROUTER
   ========================================================================== */

const NAV_CONFIG = [
  {
    group:'Kemitraan',
    items:[
      {key:'partnership.mitra', label:'Data Mitra', icon:'building', eyebrow:'Pengelolaan Kemitraan', title:'Data Mitra'},
      {key:'partnership.pengguna', label:'Manajemen Pengguna', icon:'users', eyebrow:'Pengelolaan Kemitraan', title:'Manajemen Pengguna'},
      {key:'partnership.pendapatan', label:'Dashboard Pendapatan', icon:'wallet', eyebrow:'Pengelolaan Kemitraan', title:'Dashboard Pendapatan'},
    ]
  },
  {
    group:'Pelanggan',
    items:[
      {key:'customer.pelanggan', label:'Data Pelanggan', icon:'users', eyebrow:'Customer & Package Management', title:'Data Pelanggan'},
      {key:'customer.registrasi', label:'Registrasi Pelanggan', icon:'clipboardList', eyebrow:'Customer & Package Management', title:'Registrasi Pelanggan', badgeFn:()=>DB.customers.filter(c=>c.customer_status==='Unregistered').length},
      {key:'customer.paket', label:'Paket Layanan', icon:'wifi', eyebrow:'Customer & Package Management', title:'Paket Layanan'},
    ]
  },
  {
    group:'Keuangan',
    items:[
      {key:'billing.tagihan', label:'Billing Customer', icon:'receipt', eyebrow:'Billing & Settlement', title:'Billing Customer'},
      {key:'billing.settlement', label:'Riwayat Settlement', icon:'history', eyebrow:'Billing & Settlement', title:'Riwayat Settlement'},
      {key:'payment.gateway', label:'Payment Gateway', icon:'creditCard', eyebrow:'Payment Gateway (Paspe)', title:'Monitoring Pembayaran'},
    ]
  },
  {
    group:'Jaringan',
    items:[
      {key:'radius.monitoring', label:'Radius & Status', icon:'bolt', eyebrow:'Radius & Control Gateway', title:'Radius & Status Layanan'},
      {key:'infra.topologi', label:'Topologi Infrastruktur', icon:'network', eyebrow:'Infrastruktur / ODP', title:'Topologi Infrastruktur'},
      {key:'infra.perangkat', label:'Data Perangkat', icon:'odp', eyebrow:'Infrastruktur / ODP', title:'Data Perangkat'},
    ]
  },
];

const ALL_ITEMS = NAV_CONFIG.flatMap(g=>g.items);
const DEFAULT_ROUTE = 'partnership.mitra';

function currentRoute(){
  const hash = window.location.hash.replace('#','');
  return ALL_ITEMS.some(i=>i.key===hash) ? hash : DEFAULT_ROUTE;
}

function navWithBadges(){
  return NAV_CONFIG.map(group => ({
    group: group.group,
    items: group.items.map(item => ({...item, badge: item.badgeFn ? item.badgeFn() : undefined}))
  }));
}

function syncNavBadge(){
  renderSidebar(navWithBadges(), currentRoute());
}

function renderRoute(){
  const key = currentRoute();
  const meta = ALL_ITEMS.find(i=>i.key===key);
  document.getElementById('topbarEyebrow').textContent = meta.eyebrow;
  document.getElementById('topbarTitle').textContent = meta.title;
  document.title = `${meta.title} · ERP Mitra — Dasaria`;

  renderSidebar(navWithBadges(), key);

  const root = document.getElementById('pageRoot');
  root.innerHTML = '';
  const view = Views[key];
  if(view){ view(root); }
  else {
    root.innerHTML = `<div class="card card-pad"><div class="empty-state">${ic('inbox')}<div class="es-title">Halaman belum tersedia</div></div></div>`;
  }
  window.scrollTo({top:0, behavior:'instant' in document.documentElement.style ? 'instant' : 'auto'});
}

window.addEventListener('hashchange', renderRoute);

document.addEventListener('DOMContentLoaded', ()=>{
  if(!window.location.hash) window.location.hash = DEFAULT_ROUTE;
  renderRoute();

  document.getElementById('menuToggle').addEventListener('click', ()=>{
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('resetDataBtn').addEventListener('click', ()=>{
    if(confirm('Reset seluruh data prototipe ke kondisi awal? Perubahan yang belum disimpan akan hilang.')){
      window.location.reload();
    }
  });
});
