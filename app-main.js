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
      {key:'radius.monitoring', label:'Radius & Control Gateway', icon:'bolt', eyebrow:'Radius & Control Gateway', title:'Radius & Control Gateway'},
      {key:'infra.topologi', label:'Topologi Infrastruktur', icon:'network', eyebrow:'Infrastruktur / ODP', title:'Topologi Infrastruktur'},
    ]
  },
];

const ALL_ITEMS = NAV_CONFIG.flatMap(g=>g.items);
const PARTNERSHIP_KEYS = NAV_CONFIG[0].items.map(i=>i.key);
const DEFAULT_ROUTE_SUPER = 'partnership.mitra';
const DEFAULT_ROUTE_MITRA = 'customer.pelanggan';

function isSuperUser(){ return CURRENT_USER.id === 'super'; }

function currentRoute(){
  const hash = window.location.hash.replace('#','');
  const routeKey = hash.split('?')[0];
  if(isSuperUser()){
    return PARTNERSHIP_KEYS.some(i=>i===routeKey) ? routeKey : DEFAULT_ROUTE_SUPER;
  }
  return !PARTNERSHIP_KEYS.includes(routeKey) ? routeKey : DEFAULT_ROUTE_MITRA;
}

function navWithBadges(){
  if(isSuperUser()){
    const group = NAV_CONFIG[0];
    return [{
      group: group.group,
      items: group.items.map(item => ({...item, badge: item.badgeFn ? item.badgeFn() : undefined}))
    }];
  }
  return NAV_CONFIG
    .filter(g => g.group !== 'Kemitraan')
    .map(g => ({
      group: g.group,
      items: g.items.map(item => ({...item, badge: item.badgeFn ? item.badgeFn() : undefined}))
    }));
}

function syncNavBadge(){
  renderSidebar(navWithBadges(), currentRoute());
}

function renderRoute(){
  const key = currentRoute();
  const meta = ALL_ITEMS.find(i=>i.key===key);
  if(!meta) return;
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
  const initRoute = isSuperUser() ? DEFAULT_ROUTE_SUPER : DEFAULT_ROUTE_MITRA;
  if(!window.location.hash) window.location.hash = initRoute;
  renderRoute();

  document.getElementById('menuToggle').addEventListener('click', ()=>{
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('resetDataBtn').addEventListener('click', ()=>{
    if(confirm('Reset seluruh data prototipe ke kondisi awal? Perubahan yang belum disimpan akan hilang.')){
      window.location.reload();
    }
  });

  document.addEventListener('click', (e)=>{
    const sw = document.getElementById('userSwitcher');
    if(sw && !sw.contains(e.target)) sw.classList.remove('open');
  });
});
