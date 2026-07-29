/* ==========================================================================
   ERP MITRA — MODULE VIEWS
   Setiap fungsi view(root) merender satu halaman/menu ke dalam #pageRoot.
   ========================================================================== */

function moduleCard(bodyHTML, headHTML){
  return `<div class="card">${headHTML||''}${bodyHTML}</div>`;
}
function pageIntro(text){
  return `<div class="page-intro"><p>${text}</p></div>`;
}
function fieldsHTML(fields){
  // fields: [{label, id, type, value, placeholder, options, hint, span}]
  return fields.map(f=>{
    if(f.type === 'select'){
      return `<div class="field"><label for="${f.id}">${f.label}</label>
        <select class="input" id="${f.id}">${f.options.map(o=>`<option value="${o.value}" ${String(o.value)===String(f.value)?'selected':''}>${o.label}</option>`).join('')}</select>
        ${f.hint?`<div class="hint">${f.hint}</div>`:''}</div>`;
    }
    if(f.type === 'textarea'){
      return `<div class="field"><label for="${f.id}">${f.label}</label>
        <textarea class="input" id="${f.id}" rows="2" placeholder="${f.placeholder||''}">${f.value||''}</textarea>
        ${f.hint?`<div class="hint">${f.hint}</div>`:''}</div>`;
    }
    return `<div class="field"><label for="${f.id}">${f.label}</label>
      <input class="input" id="${f.id}" type="${f.type||'text'}" value="${f.value ?? ''}" placeholder="${f.placeholder||''}">
      ${f.hint?`<div class="hint">${f.hint}</div>`:''}</div>`;
  }).join('');
}
function rowWrap(html){ return `<div class="field-row">${html}</div>`; }
function row3Wrap(html){ return `<div class="field-row3">${html}</div>`; }

function activityTimeline(entries){
  if(!entries.length) return `<div class="empty-state">${ic('history')}<div class="es-title">Belum ada aktivitas</div></div>`;
  return `<div class="timeline">${entries.map(e=>`
    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-body">
        <div class="tl-title"><strong>${e.actor}</strong> ${e.action}</div>
        <div class="tl-time">${Fmt.datetime(e.time)}</div>
      </div>
    </div>`).join('')}</div>`;
}
function pushActivity(actor, action){
  DB.activityLog.unshift({actor, action, time:new Date().toISOString()});
}

/* ========================================================================
   1. PARTNERSHIP MANAGEMENT
   ======================================================================== */

const Views = {};

function renderMitraForm(root, existing){
  const isEdit = !!existing;
  
  if(!isEdit){
    document.getElementById('topbarTitle').textContent = 'Tambah Mitra Baru';
  } else {
    document.getElementById('topbarTitle').textContent = 'Edit Mitra';
  }

  root.innerHTML = `
    <div class="page-intro" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <p style="margin:0;">${isEdit ? `Memperbarui data ${existing.partner_name}` : 'Registrasi entitas mitra baru ke ERP Mitra'}</p>
      <button class="btn btn-secondary btn-sm" id="btnBackMitra">${ic('chevronLeft')}Kembali ke Daftar Mitra</button>
    </div>
    <div id="mitraFormContent"></div>
  `;

  root.querySelector('#btnBackMitra')?.addEventListener('click', ()=>{ window.location.hash='partnership.mitra'; });

  const content = root.querySelector('#mitraFormContent');
  content.innerHTML = `
    <div class="card card-pad" style="max-width:900px;">
      <div class="section-head" style="padding:0 0 14px 0;"><h3>Informasi Mitra</h3></div>
      ${rowWrap(fieldsHTML([
        {label:'Kode Mitra', id:'f_code', value:existing?.partner_code, placeholder:'DSR-XXX-01', hint: isEdit?'':'Dibuat otomatis jika dikosongkan'},
        {label:'Nama Mitra / Brand', id:'f_name', value:existing?.partner_name, placeholder:'Mitra Nusantara Net'},
      ]))}
      ${fieldsHTML([{label:'Nama Badan Hukum', id:'f_company', value:existing?.company_name, placeholder:'PT Nusantara Net Indonesia'}])}
      ${rowWrap(fieldsHTML([
        {label:'Nama PIC', id:'f_pic', value:existing?.pic_name, placeholder:'Nama Penanggung Jawab'},
        {label:'Status', id:'f_status', type:'select', value:existing?.status||'Aktif', options:[{value:'Aktif',label:'Aktif'},{value:'Nonaktif',label:'Nonaktif'}]},
      ]))}
      ${rowWrap(fieldsHTML([
        {label:'Nomor Telepon', id:'f_phone', value:existing?.phone_number, placeholder:'0812-3456-7890'},
        {label:'Email', id:'f_email', type:'email', value:existing?.email, placeholder:'admin@mitra.id'},
      ]))}

      <div class="section-head" style="padding:20px 0 14px 0;"><h3>Kerja Sama B2B</h3></div>
      ${fieldsHTML([{label:'Nama Kerja Sama', id:'f_coop_name', value:existing?.cooperation_name, placeholder:'Contoh: Kerja Sama Distribusi Fiber'}])}
      ${rowWrap(fieldsHTML([
        {label:'Nomor Dokumen / PKS', id:'f_coop_doc', value:existing?.cooperation_doc_no, placeholder:'PKS/2024/001'},
        {label:'NPWP / NIB', id:'f_npwp', value:existing?.npwp_nib, placeholder:'01.234.567.8-901.000'},
      ]))}
      ${rowWrap(fieldsHTML([
        {label:'Mulai Berlaku', id:'f_coop_start', type:'date', value:existing?.cooperation_start},
        {label:'Aktif Sampai / Berakhir', id:'f_coop_end', type:'date', value:existing?.cooperation_end},
      ]))}
      ${fieldsHTML([{label:'Dokumen Kerja Sama', id:'f_coop_file', value:existing?.cooperation_doc_file, placeholder:'Nama file (contoh: PKS_NetIndo.pdf)'}])}

      <div class="section-head" style="padding:20px 0 14px 0;"><h3>Rekening Settlement</h3></div>
      ${rowWrap(fieldsHTML([
        {label:'Nama Bank', id:'f_bank', value:existing?.bank_name, placeholder:'Bank Mandiri'},
        {label:'Nomor Rekening', id:'f_acc_no', value:existing?.bank_account_no, placeholder:'1230007890123'},
      ]))}
      ${fieldsHTML([{label:'Nama Pemilik Rekening', id:'f_acc_name', value:existing?.bank_account_name, placeholder:'Sesuai nama rekening'}])}

      <div class="section-head" style="padding:20px 0 14px 0;"><h3>Konfigurasi Jatuh Tempo</h3></div>
      ${rowWrap(fieldsHTML([
        {label:'Tipe Jatuh Tempo', id:'f_due_type', type:'select', value:existing?.payment_due_type||'Tanggal Tetap', options:[
          {value:'Tanggal Tetap',label:'Tanggal Tetap'},
          {value:'Jatuh Tempo 30 Hari',label:'Jatuh Tempo 30 Hari'},
          {value:'Rolling Days',label:'Rolling Days'},
        ]},
        {label:'Nilai', id:'f_due_value', value:existing?.payment_due_value, placeholder:'Tanggal (1-28) atau jumlah hari'},
      ]))}

      <div style="margin-top:24px;display:flex;gap:8px;justify-content:flex-end;">
        <button class="btn btn-secondary" id="fCancel">${ic('x')}Batal</button>
        <button class="btn btn-primary" id="fSave">${ic('check')}${isEdit?'Simpan Perubahan':'Registrasi Mitra'}</button>
      </div>
    </div>
  `;

  const selDueType = content.querySelector('#f_due_type');
  const valDue = content.querySelector('#f_due_value');
  
  function updateDuePlaceholder(){
    if(selDueType.value === 'Tanggal Tetap') valDue.placeholder = 'Tanggal (1-28)';
    else if(selDueType.value === 'Jatuh Tempo 30 Hari') valDue.placeholder = 'Otomatis 30 hari dari tanggal tagih';
    else valDue.placeholder = 'Jumlah hari dari tanggal tagih';
  }
  selDueType.addEventListener('change', updateDuePlaceholder);
  updateDuePlaceholder();

  content.querySelector('#fCancel')?.addEventListener('click', ()=>{ window.location.hash='partnership.mitra'; });
  content.querySelector('#fSave')?.addEventListener('click', ()=>{
    const val = id => document.getElementById(id).value.trim();
    const name = val('f_name');
    if(!name){ toast('Nama mitra wajib diisi'); return; }
    
    const data = {
      partner_code: val('f_code') || (isEdit ? existing.partner_code : 'DSR-'+name.slice(0,3).toUpperCase()+'-'+String(DB.partners.length+1).padStart(2,'0')),
      partner_name:name, company_name:val('f_company'), phone_number:val('f_phone'),
      email:val('f_email'), address:'', operational_area: isEdit ? existing.operational_area : 'Jabodetabek',
      business_configuration: isEdit ? existing.business_configuration : 'Revenue Share 70/30',
      status:val('f_status'), pic_name:val('f_pic'),
      cooperation_name:val('f_coop_name'), cooperation_doc_no:val('f_coop_doc'), cooperation_start:val('f_coop_start'),
      cooperation_end:val('f_coop_end'), cooperation_doc_file:val('f_coop_file'), npwp_nib:val('f_npwp'),
      bank_name:val('f_bank'), bank_account_no:val('f_acc_no'), bank_account_name:val('f_acc_name'),
      payment_due_type:selDueType.value, payment_due_value:valDue.value,
    };

    if(isEdit){
      Object.assign(existing, data);
      pushActivity('Super Admin', `memperbarui profil mitra ${name}`);
      toast('Perubahan profil mitra disimpan');
    } else {
      const newP = {id: nextId('PTR'), users_count:0, created_at:new Date().toISOString().slice(0,10), ...data};
      DB.partners.push(newP);
      DB.users.push({id:nextId('USR'), partner_id:newP.id, user_name:name+' Admin', username:(name.split(' ')[0]||'admin').toLowerCase()+'.admin', role_name:'Administrator Mitra', user_status:'Aktif', last_login:new Date().toISOString()});
      pushActivity('Super Admin', `meregistrasikan mitra baru ${name}`);
      toast('Mitra baru berhasil diregistrasikan');
    }
    window.location.hash='partnership.mitra';
  });
}

Views['partnership.mitra'] = function(root){
  const hashParts = window.location.hash.split('?');
  const params = new URLSearchParams(hashParts[1] || '');
  const mitraId = params.get('id');

  if(mitraId === 'add'){
    renderMitraForm(root, null);
    return;
  } else if(mitraId){
    const partner = DB.partners.find(p=>p.id===mitraId);
    if(partner){
      renderMitraForm(root, partner);
      return;
    }
  }

  root.innerHTML = pageIntro('Kelola seluruh entitas mitra yang terdaftar pada ERP Mitra — identitas bisnis, wilayah operasional, dan status keaktifan.');

  function kpis(){
    const total = DB.partners.length;
    const aktif = DB.partners.filter(p=>p.status==='Aktif').length;
    const nonaktif = total - aktif;
    const totalUsers = DB.partners.reduce((s,p)=>s+p.users_count,0);
    root.querySelector('#kpiSlot').outerHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Total Mitra', value:total, icon:'building', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Mitra Aktif', value:aktif, icon:'checkCircle', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)', sub:`${Math.round(aktif/total*100)}% dari total mitra`, subTone:'up'},
      {label:'Mitra Nonaktif', value:nonaktif, icon:'bolt', bg:'var(--badge-gray-bg)', fg:'var(--badge-gray-fg)'},
      {label:'Total Pengguna Mitra', value:Fmt.num(totalUsers), icon:'users', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'},
    ])}</div>`;
  }

  root.insertAdjacentHTML('beforeend', `<div id="kpiSlot"></div>`);
  kpis();

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  const table = DataTable({
    rows:()=>DB.partners,
    rowKey:'id',
    searchPlaceholder:'Cari nama mitra, kode, atau perusahaan…',
    searchFields:['partner_name','partner_code','company_name'],
    filters:[
      {key:'status', label:'Semua Status', options:[{value:'Aktif',label:'Aktif'},{value:'Nonaktif',label:'Nonaktif'}], match:(r,v)=>r.status===v},
      {key:'area', label:'Semua Wilayah', options:WILAYAH_LIST.map(w=>({value:w,label:w})), match:(r,v)=>r.operational_area===v},
    ],
    columns:[
      {key:'partner_code', header:'Kode Mitra', sortable:true, render:r=>`<span class="cell-mono">${r.partner_code}</span>`},
      {key:'partner_name', header:'Nama Mitra', sortable:true, render:r=>`
        <div class="item-cell">
          <div class="thumb" style="background:${colorFor(r.id)}">${Fmt.initials(r.partner_name)}</div>
          <div class="txt"><div class="t1">${r.partner_name}</div><div class="t2">${r.company_name}</div></div>
        </div>`},
      {key:'operational_area', header:'Wilayah Operasional', sortable:true},
      {key:'users_count', header:'Jumlah Pengguna', sortable:true, align:'right', render:r=>`<span class="cell-num">${r.users_count}</span>`},
      {key:'status', header:'Status', sortable:true, render:r=>statusBadge(r.status)},
    ],
  });
  const cardEl = document.createElement('div');
  cardEl.className = 'card';
  cardEl.appendChild(table);
  tableMount.appendChild(cardEl);
};

Views['partnership.pengguna'] = function(root){
  root.innerHTML = pageIntro('Kelola akun pengguna yang berada di bawah setiap mitra beserta peran dan hak akses yang dimiliki.');
  root.insertAdjacentHTML('beforeend', `<div id="kpiSlot"></div>`);

  function kpis(){
    const total = DB.users.length;
    const aktif = DB.users.filter(u=>u.user_status==='Aktif').length;
    root.querySelector('#kpiSlot').outerHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Total Pengguna', value:total, icon:'users', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Pengguna Aktif', value:aktif, icon:'checkCircle', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Pengguna Nonaktif', value:total-aktif, icon:'bolt', bg:'var(--badge-gray-bg)', fg:'var(--badge-gray-fg)'},
      {label:'Total Role', value:DB.roles.length, icon:'key', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'},
    ])}</div>`;
  }
  kpis();

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  const table = DataTable({
    rows:()=>DB.users,
    rowKey:'id',
    searchPlaceholder:'Cari nama pengguna atau username…',
    searchFields:['user_name','username'],
    filters:[
      {key:'role', label:'Semua Role', options:DB.roles.map(r=>({value:r,label:r})), match:(r,v)=>r.role_name===v},
      {key:'status', label:'Semua Status', options:[{value:'Aktif',label:'Aktif'},{value:'Nonaktif',label:'Nonaktif'}], match:(r,v)=>r.user_status===v},
    ],
    columns:[
      {key:'user_name', header:'Nama Pengguna', sortable:true, render:r=>`
        <div class="item-cell">
          <div class="thumb" style="background:${colorFor(r.id)}">${Fmt.initials(r.user_name)}</div>
          <div class="txt"><div class="t1">${r.user_name}</div><div class="t2">${partnerName(r.partner_id)}</div></div>
        </div>`},
      {key:'username', header:'Username', sortable:true, render:r=>`<span class="cell-mono">@${r.username}</span>`},
      {key:'role_name', header:'Role', sortable:true, render:r=>badge(r.role_name,'blue')},
      {key:'user_status', header:'Status', sortable:true, render:r=>statusBadge(r.user_status)},
      {key:'last_login', header:'Last Login', sortable:true, sortValue:r=>r.last_login, render:r=>`<span class="cell-secondary">${Fmt.datetime(r.last_login)}</span>`},
    ],
  });
  const cardEl = document.createElement('div'); cardEl.className='card'; cardEl.appendChild(table);
  tableMount.appendChild(cardEl);
};

Views['partnership.pendapatan'] = function(root){
  root.innerHTML = pageIntro('Pantau kondisi bisnis mitra: pendapatan berjalan, tagihan pelanggan yang belum dibayar, dan status settlement dari Dasaria.');

  const filterBar = document.createElement('div');
  filterBar.className = 'card card-pad';
  filterBar.style.marginBottom = '16px';
  filterBar.innerHTML = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
      <div class="field" style="margin:0;min-width:220px;">
        <label>Pilih Mitra</label>
        <select class="input" id="revPartner" style="width:100%;">${DB.partners.map(p=>`<option value="${p.id}">${p.partner_name}</option>`).join('')}</select>
      </div>
      <div class="field" style="margin:0;">
        <label>Periode</label>
        <select class="input" id="revPeriod"><option>Juli 2026</option><option>Juni 2026</option><option>Mei 2026</option></select>
      </div>
      <div class="field" style="margin:0;">
        <label>Status Settlement</label>
        <select class="input" id="revStlStatus"><option value="">Semua</option><option>Settlement</option><option>Top Up</option><option>Auto Deduction</option></select>
      </div>
    </div>`;
  root.appendChild(filterBar);

  const kpiSlot = document.createElement('div'); root.appendChild(kpiSlot);

  const chartsRow = document.createElement('div');
  chartsRow.style.cssText = 'display:grid;grid-template-columns:2fr 1fr;gap:12px;margin-bottom:16px;';
  root.appendChild(chartsRow);

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  let table;

  function paint(){
    const partnerId = document.getElementById('revPartner')?.value || DB.partners[0].id;
    const custIds = DB.customers.filter(c=>c.partner_id===partnerId).map(c=>c.id);
    const invs = DB.invoices.filter(i=>custIds.includes(i.customer_id));
    const monthlyRevenue = invs.filter(i=>i.billing_status==='Lunas').reduce((s,i)=>s+i.billing_amount,0);
    const unpaid = invs.filter(i=>i.billing_status!=='Lunas').reduce((s,i)=>s+i.billing_amount,0);
    const activeCust = DB.customers.filter(c=>c.partner_id===partnerId && c.customer_status==='Active').length;
    const stl = DB.settlementHistory.filter(s=>s.partner_id===partnerId);
    const lastStl = stl[0];

    kpiSlot.innerHTML = renderKPIs([
      {label:'Pendapatan Bulan Berjalan', value:Fmt.rupiah(monthlyRevenue), icon:'wallet', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)', sub:'Dari tagihan berstatus lunas', },
      {label:'Total Tagihan Belum Dibayar', value:Fmt.rupiah(unpaid), icon:'receipt', bg:'var(--badge-orange-bg)', fg:'var(--badge-orange-fg)'},
      {label:'Total Pelanggan Aktif', value:activeCust, icon:'users', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Status Settlement Terakhir', value: lastStl ? lastStl.type : '-', icon:'history', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)', sub: lastStl ? Fmt.date(lastStl.date) : ''},
    ]);

    const months = ['Feb','Mar','Apr','Mei','Jun','Jul'];
    const seed = partnerId.charCodeAt(partnerId.length-1);
    const chartData = months.map((m,i)=>({label:m, value: Math.max(4, ((seed*(i+3))%17)+ (i===5?14:6))}));
    const paidCount = invs.filter(i=>i.billing_status==='Lunas').length;
    const unpaidCount = invs.length - paidCount;

    chartsRow.innerHTML = `
      <div class="card">
        <div class="section-head"><h3>Grafik Pendapatan Bulanan</h3><span class="muted-link">6 bulan terakhir</span></div>
        <div style="padding:14px 18px 18px 18px;">${barChart(chartData,{fmt:v=>v+' jt'})}</div>
      </div>
      <div class="card card-pad">
        <h3 style="margin:0 0 14px 0;font-size:14.5px;">Status Tagihan Pelanggan</h3>
        <div class="donut-legend">
          <div class="li"><span class="dot" style="background:var(--badge-green-fg)"></span>Lunas<span class="val">${paidCount}</span></div>
          <div class="li"><span class="dot" style="background:var(--badge-orange-fg)"></span>Belum Dibayar<span class="val">${unpaidCount}</span></div>
        </div>
        <div style="margin-top:16px;height:8px;border-radius:99px;overflow:hidden;background:var(--color-background-muted);display:flex;">
          <span style="width:${invs.length?paidCount/invs.length*100:0}%;background:var(--badge-green-fg);"></span>
          <span style="width:${invs.length?unpaidCount/invs.length*100:0}%;background:var(--badge-orange-fg);"></span>
        </div>
      </div>`;

    tableMount.innerHTML = '';
    table = DataTable({
      rows:()=>DB.settlementHistory.filter(s=>s.partner_id===partnerId && (!document.getElementById('revStlStatus').value || s.type===document.getElementById('revStlStatus').value)),
      rowKey:'id',
      searchPlaceholder:'Cari nomor referensi…',
      searchFields:['ref'],
      pageSize:5,
      columns:[
        {key:'ref', header:'Nomor Referensi', sortable:true, render:r=>`<span class="cell-mono">${r.ref}</span>`},
        {key:'date', header:'Periode Settlement', sortable:true, render:r=>Fmt.date(r.date)},
        {key:'amount', header:'Nominal Settlement', sortable:true, align:'right', render:r=>`<span class="cell-num" style="color:${r.amount<0?'var(--badge-red-fg)':'var(--badge-green-fg)'}">${Fmt.rupiah(r.amount)}</span>`},
        {key:'type', header:'Status Settlement', sortable:true, render:r=>badge(r.type, r.type==='Settlement'?'green':r.type==='Top Up'?'blue':'orange')},
        {key:'date2', header:'Tanggal Settlement', render:r=>Fmt.date(r.date)},
        {key:'actions', header:'', align:'right', render:()=>`<button class="btn btn-ghost btn-sm act-detail">${ic('eye')}Detail</button>`},
      ],
      afterRender(wrap, rows){
        wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
          const s = rows.find(r=>r.id===tr.dataset.id);
          tr.querySelector('.act-detail')?.addEventListener('click', ()=>{
            Modal.open({
              title:'Detail Transaksi Settlement', subtitle:s.ref,
              bodyHTML:`<div class="detail-grid">
                <div class="detail-item"><span class="dl">Jenis Transaksi</span><span class="dv">${badge(s.type,'blue')}</span></div>
                <div class="detail-item"><span class="dl">Nominal</span><span class="dv">${Fmt.rupiah(s.amount)}</span></div>
                <div class="detail-item"><span class="dl">Saldo Sebelum</span><span class="dv">${Fmt.rupiah(s.balance_before)}</span></div>
                <div class="detail-item"><span class="dl">Saldo Sesudah</span><span class="dv">${Fmt.rupiah(s.balance_after)}</span></div>
                <div class="detail-item"><span class="dl">Tanggal</span><span class="dv">${Fmt.date(s.date)}</span></div>
                <div class="detail-item"><span class="dl">Keterangan</span><span class="dv">${s.note}</span></div>
              </div>`,
              footHTML:`<button class="btn btn-primary" id="mClose4">Tutup</button>`,
              onOpen(b,f){ f.querySelector('#mClose4').addEventListener('click', Modal.close); }
            });
          });
        });
      }
    });
    const cardEl = document.createElement('div'); cardEl.className='card';
    cardEl.appendChild((()=>{ const h=document.createElement('div'); h.innerHTML=`<div class="section-head"><h3>Riwayat Settlement</h3></div>`; return h.firstElementChild; })());
    cardEl.appendChild(table);
    tableMount.appendChild(cardEl);
  }

  paint();
  filterBar.querySelectorAll('select').forEach(s=>s.addEventListener('change', paint));
};

/* ========================================================================
   2. CUSTOMER & PACKAGE MANAGEMENT
   ======================================================================== */

Views['customer.pelanggan'] = function(root){
  root.innerHTML = pageIntro('Kelola data pelanggan mitra mulai dari registrasi, perubahan paket, relokasi, suspend, hingga terminasi layanan.');

  const unregCount = () => DB.customers.filter(c=>c.customer_status==='Unregistered').length;
  const bannerSlot = document.createElement('div');
  root.appendChild(bannerSlot);
  root.insertAdjacentHTML('beforeend', `<div id="kpiSlot"></div>`);

  function paintBanner(){
    const n = unregCount();
    bannerSlot.innerHTML = n > 0 ? `
      <div class="notice-banner">
        <span class="nb-ico">${ic('clipboardList')}</span>
        <div class="nb-text">
          <div class="nb-title">${n} pelanggan menunggu registrasi ONU</div>
          <div class="nb-sub">Pelanggan baru berstatus <strong>Unregistered</strong> perlu diregistrasikan ke OLT sebelum layanan internetnya aktif.</div>
        </div>
        <button class="btn btn-secondary btn-sm" id="btnGoRegistrasi">${ic('chevronRight')}Lihat Antrian Registrasi</button>
      </div>` : '';
    bannerSlot.querySelector('#btnGoRegistrasi')?.addEventListener('click', ()=>{ window.location.hash = 'customer.registrasi'; });
  }

  function kpis(){
    const total = DB.customers.length;
    const active = DB.customers.filter(c=>c.customer_status==='Active').length;
    const isolir = DB.customers.filter(c=>c.customer_status==='Isolir').length;
    const term = DB.customers.filter(c=>c.customer_status==='Terminate').length;
    const unreg = unregCount();
    root.querySelector('#kpiSlot').outerHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Total Pelanggan', value:total, icon:'users', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Pelanggan Aktif', value:active, icon:'checkCircle', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Menunggu Registrasi', value:unreg, icon:'clipboardList', bg:'var(--badge-yellow-bg)', fg:'var(--badge-yellow-fg)'},
      {label:'Total Pelanggan Isolir', value:isolir, icon:'bolt', bg:'var(--badge-orange-bg)', fg:'var(--badge-orange-fg)'},
      {label:'Total Pelanggan Terminate', value:term, icon:'trash', bg:'var(--badge-red-bg)', fg:'var(--badge-red-fg)'},
    ])}</div>`;
    root.querySelector('#kpiSlot .kpi-grid').classList.add('cols-5');
  }
  paintBanner();
  kpis();

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  const table = DataTable({
    rows:()=>DB.customers,
    rowKey:'id',
    searchPlaceholder:'Cari PPPoE Secret, nama, atau nomor WA…',
    searchFields:['pppoe_secret','customer_name','phone_number'],
    filters:[
      {key:'status', label:'Semua Status', options:[{value:'Unregistered',label:'Unregistered'},{value:'Active',label:'Active'},{value:'Isolir',label:'Isolir'},{value:'Terminate',label:'Terminate'}], match:(r,v)=>r.customer_status===v},
      {key:'type', label:'Semua Tipe', options:[{value:'Reguler',label:'Reguler'},{value:'Fasum',label:'Fasum'}], match:(r,v)=>r.customer_type===v},
    ],
    toolbarRight:`<button class="btn btn-primary btn-sm" id="btnAddCust">${ic('plus')}Tambah Pelanggan</button>`,
    columns:[
      {key:'pppoe_secret', header:'PPPoE Secret', sortable:true, render:r=>`<span class="cell-mono">${r.pppoe_secret}</span>`},
      {key:'customer_name', header:'Nama Lengkap', sortable:true, render:r=>`
        <div class="item-cell">
          <div class="thumb" style="background:${colorFor(r.id)}">${Fmt.initials(r.customer_name)}</div>
          <div class="txt"><div class="t1">${r.customer_name}</div><div class="t2">${badge(r.customer_type, r.customer_type==='Fasum'?'purple':'blue')}</div></div>
        </div>`},
      {key:'phone_number', header:'Nomor WhatsApp', sortable:true},
      {key:'expired_date', header:'Expired Date', sortable:true, sortValue:r=>r.expired_date, render:r=>Fmt.date(r.expired_date)},
      {key:'package_id', header:'Paket Layanan', sortable:true, sortValue:r=>pkgName(r.package_id), render:r=>pkgName(r.package_id)},
      {key:'customer_status', header:'Status', sortable:true, render:r=>statusBadge(r.customer_status)},
      {key:'actions', header:'', align:'right', render:r=>r.customer_status==='Unregistered'
        ? `<button class="btn btn-secondary btn-sm act-reg">${ic('clipboardList')}Registrasi</button>`
        : `<button class="btn btn-secondary btn-sm act-edit">${ic('edit')}Edit</button>`},
    ],
    afterRender(wrap){
      wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
        const c = DB.customers.find(x=>x.id===tr.dataset.id);
        tr.querySelector('.act-edit')?.addEventListener('click', ()=>openCustomerForm(c));
        tr.querySelector('.act-reg')?.addEventListener('click', ()=>{ window.location.hash = `customer.registrasi?id=${c.id}`; });
      });
      wrap.querySelector('#btnAddCust')?.addEventListener('click', ()=>openCustomerForm(null));
    }
  });
  const cardEl = document.createElement('div'); cardEl.className='card'; cardEl.appendChild(table);
  tableMount.appendChild(cardEl);

  function openCustomerForm(existing){
    const isEdit = !!existing;
    const lat = existing?.latitude ?? -6.2, lng = existing?.longitude ?? 106.8;
    Modal.open({
      title: isEdit ? `Edit Pelanggan — ${existing.customer_name}` : 'Tambah Pelanggan Baru',
      subtitle: isEdit ? 'Perbarui data administrasi & informasi teknis pelanggan' : 'Lengkapi identitas, alamat, dan paket layanan pelanggan',
      size:'lg',
      bodyHTML:`
        ${rowWrap(fieldsHTML([
          {label:'Nama Lengkap', id:'c_name', value:existing?.customer_name, placeholder:'Nama pelanggan'},
          {label:'Nomor WhatsApp', id:'c_phone', value:existing?.phone_number, placeholder:'0812-xxxx-xxxx'},
        ]))}
        ${row3Wrap(fieldsHTML([
          {label:'Tipe Pelanggan', id:'c_type', type:'select', value:existing?.customer_type||'Reguler', options:[{value:'Reguler',label:'Reguler'},{value:'Fasum',label:'Fasilitas Umum (Fasum)'}]},
          {label:'Mulai Berlangganan', id:'c_start', type:'date', value:existing?.subscribe_date},
          {label:'Expired Date', id:'c_exp', type:'date', value:existing?.expired_date},
        ]))}
        ${fieldsHTML([{label:'Alamat Pemasangan', id:'c_addr', type:'textarea', value:existing?.installation_address, placeholder:'Alamat lengkap instalasi'}])}
        ${rowWrap(fieldsHTML([
          {label:'Mitra', id:'c_partner', type:'select', value:existing?.partner_id||DB.partners[0].id, options:DB.partners.map(p=>({value:p.id,label:p.partner_name}))},
          {label:'Paket Layanan', id:'c_pkg', type:'select', value:existing?.package_id, options:DB.packages.filter(p=>p.status==='Aktif').map(p=>({value:p.id,label:`${p.package_name} — ${Fmt.rupiah(p.price)}`}))},
        ]))}
        ${!isEdit ? `<div class="field"><div class="hint">Informasi teknis (PPPoE Secret, SN Modem, OLT/ONU) akan dilengkapi otomatis saat proses <strong>Registrasi</strong> di menu Registrasi Pelanggan.</div></div>` : `
        <div class="section-head" style="padding:4px 0 8px 0;"><h3 style="font-size:13px;">Informasi Teknis</h3></div>
        ${row3Wrap(fieldsHTML([
          {label:'PPPoE Secret', id:'c_pppoe', value:existing?.pppoe_secret, placeholder:'mitra-kota-00001'},
          {label:'SN Modem', id:'c_modem', value:existing?.modem_serial_number, placeholder:'ZTE-XXXXXXX'},
          {label:'Port OLT', id:'c_olt', value:existing?.olt_port, placeholder:'OLT-01/PON-01'},
        ]))}
        ${row3Wrap(fieldsHTML([
          {label:'Nomor ONU', id:'c_onu', value:existing?.onu_number, placeholder:'ONU-0001'},
          {label:'Access', id:'c_access', value:existing?.access_name, placeholder:'Access-Kota-01'},
          {label:'Port Access', id:'c_accessport', value:existing?.access_port, placeholder:'01'},
        ]))}`}
        ${rowWrap(fieldsHTML([
          {label:'Latitude', id:'c_lat', type:'number', value:lat},
          {label:'Longitude', id:'c_lng', type:'number', value:lng},
        ]))}
        <div class="field">
          <label>Lokasi Pelanggan</label>
          <div class="map-placeholder">
            ${ic('mapPin','pin')}
            <span>Pratinjau peta (Google Maps Embed)</span>
            <span style="font-family:var(--font-family-mono);font-size:11px;">${lat.toFixed?lat.toFixed(4):lat}, ${lng.toFixed?lng.toFixed(4):lng}</span>
          </div>
        </div>
      `,
      footHTML:`<button class="btn btn-secondary" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">${ic('check')}${isEdit?'Simpan Perubahan':'Simpan Pelanggan'}</button>`,
      onOpen(body, foot){
        foot.querySelector('#mCancel').addEventListener('click', Modal.close);
        foot.querySelector('#mSave').addEventListener('click', ()=>{
          const val = id => document.getElementById(id).value.trim();
          const name = val('c_name');
          if(!name){ toast('Nama pelanggan wajib diisi'); return; }
          if(isEdit){
            const data = {
              customer_name:name, phone_number:val('c_phone'), customer_type:val('c_type'),
              subscribe_date:val('c_start'), expired_date:val('c_exp'), installation_address:val('c_addr'),
              partner_id:val('c_partner'), package_id:val('c_pkg'),
              pppoe_secret:val('c_pppoe'), modem_serial_number:val('c_modem'), olt_port:val('c_olt'),
              onu_number:val('c_onu'), access_name:val('c_access'), access_port:val('c_accessport'),
              latitude:parseFloat(val('c_lat'))||0, longitude:parseFloat(val('c_lng'))||0,
            };
            Object.assign(existing, data);
            toast('Perubahan data pelanggan disimpan');
            pushActivity('Administrator Mitra', `memperbarui data pelanggan ${name}`);
          } else {
            const partnerId = val('c_partner') || DB.partners[0].id;
            const partnerCode = (DB.partners.find(p=>p.id===partnerId)||{}).partner_code || 'MTR';
            const pppoe = partnerCode.toLowerCase().replace(/[^a-z0-9]/g,'-') + '-' + Math.floor(Math.random()*90000+10000);
            const newC = {
              id:nextId('CUS'), radius_username:'rd'+Math.floor(Math.random()*90000+10000),
              customer_status:'Unregistered', pppoe_secret:pppoe,
              customer_name:name, phone_number:val('c_phone'), customer_type:val('c_type'),
              subscribe_date:val('c_start')||new Date().toISOString().slice(0,10), expired_date:val('c_exp'),
              installation_address:val('c_addr'), partner_id:partnerId, package_id:val('c_pkg'),
              modem_serial_number:'', olt_port:'', onu_number:'', access_name:'', access_port:'',
              latitude:parseFloat(val('c_lat'))||0, longitude:parseFloat(val('c_lng'))||0,
              olt_id:null, olt_input_id:null, olt_output_id:null, olt_slot:null, olt_pon:null, olt_rx_register:null,
            };
            DB.customers.push(newC);
            DB.radius.push({id:'RAD-'+newC.id, customer_id:newC.id, bandwidth:(DB.packages.find(p=>p.id===newC.package_id)||{}).bandwidth||'-', customer_status:'Unregistered', radius_status:'Offline', isolation_date:null, activation_date:null, last_update:new Date().toISOString()});
            toast('Pelanggan baru tersimpan · menunggu Registrasi ONU');
            pushActivity('Administrator Mitra', `menambahkan pelanggan baru ${name} (menunggu registrasi ONU)`);
          }
          Modal.close();
          paintBanner(); kpis(); table.refresh(); syncNavBadge();
        });
      }
    });
  }
};


/* ------------------------------------------------------------------------
   REGISTRASI ONU — halaman penuh (dipanggil dari antrian registrasi)
   ------------------------------------------------------------------------ */
function renderRegistrationPage(root, customer, onDone){
  const olts = allOltNodes();
  const defaultOlt = olts.find(o=>o.id===customer.olt_id) || olts[0];

  root.innerHTML = `
    <div class="page-intro" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <p style="margin:0;">Registrasi ONU untuk pelanggan <strong>${customer.customer_name}</strong> — lengkapi data perangkat untuk mengaktifkan layanan.</p>
      <button class="btn btn-secondary btn-sm" id="btnBackQueue">${ic('chevronLeft')}Kembali ke Antrian</button>
    </div>
    <div id="regPageContent"></div>
  `;

  root.querySelector('#btnBackQueue')?.addEventListener('click', ()=>{ window.location.hash='customer.registrasi'; });

  function inputOptions(oltId){
    const inputs = allInputSplitters(oltId);
    return inputs.length ? inputs.map(i=>({value:i.id, label:i.label})) : [{value:'',label:'-- Belum ada Input Splitter --'}];
  }
  function outputOptions(oltId, inputId){
    const outputs = allOutputSplitters(oltId, inputId);
    return outputs.length ? outputs.map(o=>({value:o.id, label:`${o.label} (${o.connected}/${o.capacity})`})) : [{value:'',label:'-- Belum ada Output Splitter --'}];
  }

  function scriptsHTML(oltId, slot, pon, snOverride){
    const node = findOltNode(oltId);
    if(!node || !slot || !pon){
      return `<div class="empty-state" style="padding:26px 8px;">${ic('clipboardList')}<div class="es-sub">Pilih OLT, Slot, dan PON untuk melihat script registrasi.</div></div>`;
    }
    const custForScript = snOverride ? {...customer, modem_serial_number: snOverride} : customer;
    const scripts = genOnuScripts(custForScript, node, slot, pon);
    return scripts.map((s,idx)=>`
      <div class="script-box">
        <div class="script-header">
          <div class="script-title">${s.title}</div>
          <button type="button" class="copy-btn" data-copy-idx="${idx}">${ic('copy')}Copy</button>
        </div>
        <div class="script-code" id="regScriptCode${idx}">${s.code}</div>
      </div>`).join('');
  }

  const content = root.querySelector('#regPageContent');
  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">
      <div class="card card-pad">
        <div class="section-head" style="padding:0 0 14px 0;"><h3>Informasi Pelanggan</h3></div>
        <div class="detail-grid" style="margin-bottom:16px;">
          <div class="detail-item"><span class="dl">Nama Pelanggan</span><span class="dv">${customer.customer_name}</span></div>
          <div class="detail-item"><span class="dl">Paket Layanan</span><span class="dv">${pkgName(customer.package_id)}</span></div>
          <div class="detail-item" style="grid-column:1 / -1;"><span class="dl">Alamat Pemasangan</span><span class="dv">${customer.installation_address}</span></div>
          <div class="detail-item"><span class="dl">Mitra</span><span class="dv">${partnerName(customer.partner_id)}</span></div>
          <div class="detail-item"><span class="dl">PPPoE Secret</span><span class="dv" style="font-family:var(--font-family-mono);">${customer.pppoe_secret}</span></div>
        </div>
        <div class="section-head" style="padding:0 0 14px 0;"><h3>Konfigurasi Perangkat</h3></div>
        ${fieldsHTML([{label:'SN Modem', id:'r_sn', value:customer.modem_serial_number, placeholder:'ZTE-XXXXXXX (scan / input manual)'}])}
        ${fieldsHTML([{label:'Port OLT', id:'r_olt', type:'select', value:customer.olt_id||(defaultOlt&&defaultOlt.id), options:olts.map(o=>({value:o.id, label:`${o.label} (${o.olt_type})`}))}])}
        ${fieldsHTML([{label:'Input Splitter', id:'r_input', type:'select', value:customer.olt_input_id||'', options:inputOptions(customer.olt_id||(defaultOlt&&defaultOlt.id))}])}
        ${fieldsHTML([{label:'Output Splitter', id:'r_output', type:'select', value:customer.olt_output_id||'', options:outputOptions(customer.olt_id||(defaultOlt&&defaultOlt.id), customer.olt_input_id||'')}])}
        ${rowWrap(fieldsHTML([
          {label:'Slot OLT', id:'r_slot', type:'select', value:customer.olt_slot, options:Array.from({length:16},(_,i)=>({value:String(i+1), label:'Slot '+(i+1)}))},
          {label:'Terminal (PON)', id:'r_pon', type:'select', value:customer.olt_pon, options:Array.from({length:16},(_,i)=>({value:String(i+1), label:'PON '+(i+1)}))},
        ]))}
        <div class="hint">Script registrasi di sebelah kanan diperbarui otomatis mengikuti konfigurasi yang dipilih.</div>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-secondary" id="rCancel">${ic('x')}Batal</button>
          <button class="btn btn-primary" id="rSave">${ic('check')}Proses Registrasi ONU</button>
        </div>
      </div>
      <div class="card card-pad">
        <div class="section-head" style="padding:0 0 14px 0;"><h3>Panduan Registrasi ONU</h3></div>
        <div id="regScriptsContainer">${scriptsHTML(customer.olt_id||(defaultOlt&&defaultOlt.id), customer.olt_slot, customer.olt_pon)}</div>
      </div>
    </div>
  `;

  const selOlt = content.querySelector('#r_olt');
  const selInput = content.querySelector('#r_input');
  const selOutput = content.querySelector('#r_output');
  const selSlot = content.querySelector('#r_slot');
  const selPon = content.querySelector('#r_pon');
  const snInput = content.querySelector('#r_sn');
  const scriptContainer = content.querySelector('#regScriptsContainer');

  function refreshInputOptions(){
    selInput.innerHTML = inputOptions(selOlt.value).map(o=>`<option value="${o.value}" ${o.value===selInput.value?'selected':''}>${o.label}</option>`).join('');
    refreshOutputOptions();
  }
  function refreshOutputOptions(){
    selOutput.innerHTML = outputOptions(selOlt.value, selInput.value).map(o=>`<option value="${o.value}" ${o.value===selOutput.value?'selected':''}>${o.label}</option>`).join('');
    refreshScripts();
  }
  function refreshScripts(){
    scriptContainer.innerHTML = scriptsHTML(selOlt.value, selSlot.value, selPon.value, snInput.value.trim());
    wireCopyButtons();
  }
  function wireCopyButtons(){
    scriptContainer.querySelectorAll('.copy-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = btn.dataset.copyIdx;
        const code = document.getElementById('regScriptCode'+idx).textContent;
        navigator.clipboard.writeText(code).then(()=>{
          toast('Script berhasil disalin ke clipboard');
          btn.classList.add('copied');
          setTimeout(()=>btn.classList.remove('copied'), 1200);
        }).catch(()=>{ toast('Gagal menyalin script'); });
      });
    });
  }
  wireCopyButtons();
  refreshScripts();
  selOlt.addEventListener('change', refreshInputOptions);
  selInput.addEventListener('change', refreshOutputOptions);
  selSlot.addEventListener('change', refreshScripts);
  selPon.addEventListener('change', refreshScripts);
  snInput.addEventListener('input', refreshScripts);

  content.querySelector('#rCancel')?.addEventListener('click', ()=>{ window.location.hash='customer.registrasi'; });
  content.querySelector('#rSave')?.addEventListener('click', ()=>{
    const oltId = selOlt.value, inputId = selInput.value, outputId = selOutput.value, slot = selSlot.value, pon = selPon.value, sn = snInput.value.trim();
    if(!oltId || !slot || !pon){ toast('Pilih Port OLT, Slot, dan PON terlebih dahulu'); return; }
    if(!sn){ toast('SN Modem wajib diisi'); return; }
    const node = findOltNode(oltId);
    const outputNode = outputId ? findOutputSplitter(oltId, inputId, outputId) : null;
    const locationLabel = outputNode ? outputNode.label : node.label;
    const ok = window.confirm(`Selesaikan registrasi ONU untuk ${customer.customer_name} pada ${locationLabel}, Slot ${slot}, PON ${pon}?`);
    if(!ok) return;

    const onuNumber = 'ONU-' + String(Math.floor(Math.random()*9000+1000));
    const rx = (Math.random() * (-18 - (-24)) + (-24)).toFixed(1);

    customer.modem_serial_number = sn;
    customer.olt_id = oltId;
    customer.olt_input_id = inputId || null;
    customer.olt_output_id = outputId || null;
    customer.olt_slot = slot;
    customer.olt_pon = pon;
    customer.olt_port = `${oltId}/Slot-${slot}/PON-${pon}`;
    customer.onu_number = onuNumber;
    customer.olt_rx_register = parseFloat(rx);
    customer.access_name = locationLabel;
    customer.access_port = String(slot);
    customer.customer_status = 'Active';

    if(outputNode){
      outputNode.connected = (outputNode.connected||0) + 1;
      if(outputNode.connected >= outputNode.capacity) outputNode.status = 'Penuh';
    }

    const rad = DB.radius.find(r=>r.customer_id===customer.id);
    if(rad){
      rad.radius_status = 'Online';
      rad.customer_status = 'Active';
      rad.activation_date = new Date().toISOString().slice(0,10);
      rad.last_update = new Date().toISOString();
    }
    pushActivity('Sistem', `menyelesaikan registrasi ONU ${onuNumber} untuk pelanggan ${customer.customer_name} pada ${locationLabel} Slot ${slot} PON ${pon}`);
    toast('Registrasi ONU berhasil diselesaikan · layanan pelanggan kini Aktif');
    if(onDone) onDone();
    window.location.hash='customer.registrasi';
  });
}

Views['customer.registrasi'] = function(root){
  const hashParts = window.location.hash.split('?');
  const params = new URLSearchParams(hashParts[1] || '');
  const customerId = params.get('id');

  if(customerId){
    const customer = DB.customers.find(c=>c.id===customerId);
    if(customer && customer.customer_status==='Unregistered'){
      renderRegistrationPage(root, customer, ()=>{ syncNavBadge(); });
      return;
    }
    window.location.hash = 'customer.registrasi';
    return;
  }

  root.innerHTML = pageIntro('Daftar pelanggan baru yang telah terdaftar namun belum diregistrasi ke jaringan OLT. Lengkapi Port OLT, Slot, PON, dan SN Modem untuk mengaktifkan layanan.');

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  function paint(){
    const queue = DB.customers.filter(c=>c.customer_status==='Unregistered');
    tableMount.innerHTML = '';

    if(queue.length === 0){
      tableMount.innerHTML = `
        <div class="card card-pad" style="text-align:center;padding:56px 20px;">
          <div style="width:52px;height:52px;border-radius:50%;background:var(--badge-green-bg);color:var(--badge-green-fg);display:flex;align-items:center;justify-content:center;margin:0 auto 16px auto;">
            ${ic('checkCircle')}
          </div>
          <h3 style="margin:0 0 6px 0;font-size:15px;">Semua Pelanggan Sudah Diregistrasi</h3>
          <p style="color:var(--color-text-secondary);font-size:13px;margin:0 0 18px 0;">Tidak ada pelanggan baru yang menunggu antrian registrasi ONU saat ini.</p>
          <button class="btn btn-secondary" id="btnBackCust">${ic('users')}Kembali ke Data Pelanggan</button>
        </div>`;
      tableMount.querySelector('#btnBackCust')?.addEventListener('click', ()=>{ window.location.hash='customer.pelanggan'; });
      return;
    }

    const kpiWrap = document.createElement('div');
    kpiWrap.id = 'kpiSlot';
    kpiWrap.innerHTML = renderKPIs([
      {label:'Menunggu Registrasi', value:queue.length, icon:'clipboardList', bg:'var(--badge-yellow-bg)', fg:'var(--badge-yellow-fg)'},
      {label:'Mitra Terlibat', value:new Set(queue.map(c=>c.partner_id)).size, icon:'building', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Menunggu Lebih dari 3 Hari', value:queue.filter(c=>{ const d=(Date.now()-new Date(c.subscribe_date).getTime())/86400000; return d>3; }).length, icon:'bolt', bg:'var(--badge-orange-bg)', fg:'var(--badge-orange-fg)'},
    ]);
    tableMount.appendChild(kpiWrap);

    const table = DataTable({
      rows:()=>DB.customers.filter(c=>c.customer_status==='Unregistered'),
      rowKey:'id',
      searchPlaceholder:'Cari nama pelanggan…',
      searchFields:['customer_name','pppoe_secret'],
      filters:[
        {key:'partner', label:'Semua Mitra', options:DB.partners.map(p=>({value:p.id,label:p.partner_name})), match:(r,v)=>r.partner_id===v},
      ],
      columns:[
        {key:'customer_name', header:'Nama Pelanggan', sortable:true, render:r=>`
          <div class="item-cell">
            <div class="thumb" style="background:${colorFor(r.id)}">${Fmt.initials(r.customer_name)}</div>
            <div class="txt"><div class="t1">${r.customer_name}</div><div class="t2">${partnerName(r.partner_id)}</div></div>
          </div>`},
        {key:'package_id', header:'Paket Layanan', sortable:true, sortValue:r=>pkgName(r.package_id), render:r=>pkgName(r.package_id)},
        {key:'installation_address', header:'Alamat Pemasangan', render:r=>`<span class="cell-secondary">${r.installation_address}</span>`},
        {key:'subscribe_date', header:'Tgl Terdaftar', sortable:true, sortValue:r=>r.subscribe_date, render:r=>Fmt.date(r.subscribe_date)},
        {key:'actions', header:'', align:'right', render:()=>`<button class="btn btn-primary btn-sm act-reg">${ic('clipboardList')}Registrasi</button>`},
      ],
      afterRender(wrap, rows){
        wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
          const c = rows.find(x=>x.id===tr.dataset.id);
          tr.querySelector('.act-reg')?.addEventListener('click', ()=>{ window.location.hash = `customer.registrasi?id=${c.id}`; });
        });
      }
    });
    const cardEl = document.createElement('div'); cardEl.className='card';
    cardEl.insertAdjacentHTML('beforeend', `<div class="section-head"><h3>Antrian Registrasi ONU</h3></div>`);
    cardEl.appendChild(table);
    tableMount.appendChild(cardEl);
  }

  paint();
};

Views['customer.paket'] = function(root){
  root.innerHTML = pageIntro('Kelola daftar paket layanan internet yang tersedia untuk setiap mitra — bandwidth, harga jual, dan status paket.');

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  const table = DataTable({
    rows:()=>DB.packages,
    rowKey:'id',
    searchPlaceholder:'Cari nama paket…',
    searchFields:['package_name'],
    filters:[
      {key:'partner', label:'Semua Mitra', options:DB.partners.map(p=>({value:p.id,label:p.partner_name})), match:(r,v)=>r.partner_id===v},
      {key:'status', label:'Semua Status', options:[{value:'Aktif',label:'Aktif'},{value:'Nonaktif',label:'Nonaktif'}], match:(r,v)=>r.status===v},
    ],
    toolbarRight:`<button class="btn btn-primary btn-sm" id="btnAddPkg">${ic('plus')}Tambah Paket</button>`,
    columns:[
      {key:'package_name', header:'Nama Paket', sortable:true, render:r=>`<span class="cell-strong">${r.package_name}</span>`},
      {key:'partner_id', header:'Mitra', sortable:true, sortValue:r=>partnerName(r.partner_id), render:r=>partnerName(r.partner_id)},
      {key:'bandwidth', header:'Bandwidth', sortable:true, render:r=>badge(r.bandwidth,'cyan')},
      {key:'price', header:'Harga Jual', sortable:true, align:'right', render:r=>`<span class="cell-num">${Fmt.rupiah(r.price)}</span>`},
      {key:'status', header:'Status', sortable:true, render:r=>statusBadge(r.status)},
      {key:'actions', header:'', align:'right', render:()=>`<button class="btn btn-secondary btn-sm act-edit">${ic('edit')}Edit</button>`},
    ],
    afterRender(wrap){
      wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
        const p = DB.packages.find(x=>x.id===tr.dataset.id);
        tr.querySelector('.act-edit')?.addEventListener('click', ()=>openPkgForm(p));
      });
      wrap.querySelector('#btnAddPkg')?.addEventListener('click', ()=>openPkgForm(null));
    }
  });
  const cardEl = document.createElement('div'); cardEl.className='card'; cardEl.appendChild(table);
  tableMount.appendChild(cardEl);

  function openPkgForm(existing){
    const isEdit = !!existing;
    Modal.open({
      title:isEdit?'Edit Paket Layanan':'Tambah Paket Layanan',
      bodyHTML:`
        ${fieldsHTML([{label:'Nama Paket', id:'p_name', value:existing?.package_name, placeholder:'Home 50 Mbps'}])}
        ${rowWrap(fieldsHTML([
          {label:'Bandwidth', id:'p_bw', value:existing?.bandwidth, placeholder:'50 Mbps'},
          {label:'Harga Jual (Rp)', id:'p_price', type:'number', value:existing?.price},
        ]))}
        ${rowWrap(fieldsHTML([
          {label:'Mitra', id:'p_partner', type:'select', value:existing?.partner_id||DB.partners[0].id, options:DB.partners.map(p=>({value:p.id,label:p.partner_name}))},
          {label:'Status', id:'p_status', type:'select', value:existing?.status||'Aktif', options:[{value:'Aktif',label:'Aktif'},{value:'Nonaktif',label:'Nonaktif'}]},
        ]))}
      `,
      footHTML:`<button class="btn btn-secondary" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">${ic('check')}Simpan</button>`,
      onOpen(body, foot){
        foot.querySelector('#mCancel').addEventListener('click', Modal.close);
        foot.querySelector('#mSave').addEventListener('click', ()=>{
          const val = id=>document.getElementById(id).value;
          const name = val('p_name').trim();
          if(!name){ toast('Nama paket wajib diisi'); return; }
          const data = {package_name:name, bandwidth:val('p_bw'), price:parseFloat(val('p_price'))||0, partner_id:val('p_partner'), status:val('p_status')};
          if(isEdit){ Object.assign(existing, data); toast('Paket layanan diperbarui'); }
          else { DB.packages.push({id:nextId('PKG'), ...data}); toast('Paket layanan baru ditambahkan'); }
          Modal.close(); table.refresh();
        });
      }
    });
  }
};

/* ========================================================================
   3. BILLING & SETTLEMENT
   ======================================================================== */

Views['billing.tagihan'] = function(root){
  root.innerHTML = pageIntro('Tagihan pelanggan dibentuk otomatis (accrual billing) pada setiap awal periode untuk seluruh pelanggan berstatus aktif.');
  root.insertAdjacentHTML('beforeend', `<div id="kpiSlot"></div>`);

  function kpis(){
    const bulanIni = DB.invoices.filter(i=>i.billing_period==='Juli 2026');
    const belumBayar = DB.invoices.filter(i=>i.billing_status!=='Lunas').length;
    const lunas = DB.invoices.filter(i=>i.billing_status==='Lunas').length;
    const totalNilai = bulanIni.reduce((s,i)=>s+i.billing_amount,0);
    root.querySelector('#kpiSlot').outerHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Total Tagihan Bulan Berjalan', value:bulanIni.length, icon:'receipt', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Tagihan Belum Dibayar', value:belumBayar, icon:'bolt', bg:'var(--badge-orange-bg)', fg:'var(--badge-orange-fg)'},
      {label:'Total Tagihan Lunas', value:lunas, icon:'checkCircle', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Total Nilai Tagihan Bulan Berjalan', value:Fmt.rupiah(totalNilai), icon:'wallet', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'},
    ])}</div>`;
  }
  kpis();

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  const table = DataTable({
    rows:()=>DB.invoices,
    rowKey:'id',
    searchPlaceholder:'Cari nomor tagihan, nama, atau PPPoE Secret…',
    searchFields:['invoice_number'],
    filters:[
      {key:'status', label:'Semua Status', options:[{value:'Belum Dibayar',label:'Belum Dibayar'},{value:'Lunas',label:'Lunas'},{value:'Jatuh Tempo',label:'Jatuh Tempo'}], match:(r,v)=>r.billing_status===v},
      {key:'period', label:'Semua Periode', options:[{value:'Juli 2026',label:'Juli 2026'},{value:'Juni 2026',label:'Juni 2026'}], match:(r,v)=>r.billing_period===v},
    ],
    columns:[
      {key:'invoice_number', header:'Nomor Tagihan', sortable:true, render:r=>`<span class="cell-mono">${r.invoice_number}</span>`},
      {key:'customer_id', header:'Nama Pelanggan', sortable:true, sortValue:r=>custName(r.customer_id), render:r=>`<span class="cell-strong">${custName(r.customer_id)}</span>`},
      {key:'package', header:'Paket Layanan', render:r=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return c?pkgName(c.package_id):'-'; }},
      {key:'billing_period', header:'Periode Billing', sortable:true},
      {key:'billing_amount', header:'Nominal Tagihan', sortable:true, align:'right', render:r=>`<span class="cell-num">${Fmt.rupiah(r.billing_amount)}</span>`},
      {key:'due_date', header:'Jatuh Tempo', sortable:true, sortValue:r=>r.due_date, render:r=>Fmt.date(r.due_date)},
      {key:'billing_status', header:'Status', sortable:true, render:r=>statusBadge(r.billing_status)},
      {key:'actions', header:'', align:'right', render:()=>`<button class="btn btn-ghost btn-sm act-detail">${ic('eye')}Detail</button>`},
    ],
    afterRender(wrap, rows){
      wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
        const inv = rows.find(r=>r.id===tr.dataset.id);
        tr.querySelector('.act-detail')?.addEventListener('click', ()=>{
          const c = DB.customers.find(x=>x.id===inv.customer_id);
          Modal.open({
            title:'Detail Tagihan', subtitle:inv.invoice_number,
            bodyHTML:`<div class="detail-grid">
              <div class="detail-item"><span class="dl">Nama Pelanggan</span><span class="dv">${custName(inv.customer_id)}</span></div>
              <div class="detail-item"><span class="dl">PPPoE Secret</span><span class="dv" style="font-family:var(--font-family-mono);">${c?.pppoe_secret||'-'}</span></div>
              <div class="detail-item"><span class="dl">Periode Billing</span><span class="dv">${inv.billing_period}</span></div>
              <div class="detail-item"><span class="dl">Nominal Tagihan</span><span class="dv">${Fmt.rupiah(inv.billing_amount)}</span></div>
              <div class="detail-item"><span class="dl">Tanggal Dibuat</span><span class="dv">${Fmt.date(inv.generated_date)}</span></div>
              <div class="detail-item"><span class="dl">Jatuh Tempo</span><span class="dv">${Fmt.date(inv.due_date)}</span></div>
              <div class="detail-item"><span class="dl">Status Pembayaran</span><span class="dv">${statusBadge(inv.billing_status)}</span></div>
            </div>`,
            footHTML:`<button class="btn btn-primary" id="mClose5">Tutup</button>`,
            onOpen(b,f){ f.querySelector('#mClose5').addEventListener('click', Modal.close); }
          });
        });
      });
    }
  });
  const cardEl = document.createElement('div'); cardEl.className='card'; cardEl.appendChild(table);
  tableMount.appendChild(cardEl);
};

Views['billing.settlement'] = function(root){
  root.innerHTML = pageIntro('Riwayat settlement, top up, dan auto deduction saldo antara Dasaria dan seluruh mitra.');
  root.insertAdjacentHTML('beforeend', `<div id="kpiSlot"></div>`);

  function kpis(){
    const bulanIni = DB.settlementHistory.filter(s=>s.date.startsWith('2026-07'));
    const totalStl = bulanIni.filter(s=>s.type==='Settlement').reduce((s,x)=>s+x.amount,0);
    const totalTop = bulanIni.filter(s=>s.type==='Top Up').reduce((s,x)=>s+x.amount,0);
    const totalDed = bulanIni.filter(s=>s.type==='Auto Deduction').reduce((s,x)=>s+Math.abs(x.amount),0);
    const lastBalance = DB.settlementHistory[0]?.balance_after ?? 0;
    root.querySelector('#kpiSlot').outerHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Saldo Mitra Saat Ini', value:Fmt.rupiah(lastBalance), icon:'wallet', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Total Settlement Bulan Berjalan', value:Fmt.rupiah(totalStl), icon:'history', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Top Up Saldo', value:Fmt.rupiah(totalTop), icon:'plus', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'},
      {label:'Total Auto Deduction', value:Fmt.rupiah(totalDed), icon:'bolt', bg:'var(--badge-orange-bg)', fg:'var(--badge-orange-fg)'},
    ])}</div>`;
  }
  kpis();

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  const table = DataTable({
    rows:()=>DB.settlementHistory,
    rowKey:'id',
    searchPlaceholder:'Cari nomor referensi transaksi…',
    searchFields:['ref'],
    filters:[
      {key:'type', label:'Semua Jenis Transaksi', options:[{value:'Settlement',label:'Settlement'},{value:'Top Up',label:'Top Up'},{value:'Auto Deduction',label:'Auto Deduction'}], match:(r,v)=>r.type===v},
      {key:'partner', label:'Semua Mitra', options:DB.partners.map(p=>({value:p.id,label:p.partner_name})), match:(r,v)=>r.partner_id===v},
    ],
    columns:[
      {key:'ref', header:'Nomor Referensi', sortable:true, render:r=>`<span class="cell-mono">${r.ref}</span>`},
      {key:'type', header:'Jenis Transaksi', sortable:true, render:r=>badge(r.type, r.type==='Settlement'?'green':r.type==='Top Up'?'blue':'orange')},
      {key:'amount', header:'Nominal Transaksi', sortable:true, align:'right', render:r=>`<span class="cell-num" style="color:${r.amount<0?'var(--badge-red-fg)':'var(--badge-green-fg)'}">${Fmt.rupiah(r.amount)}</span>`},
      {key:'balance_before', header:'Saldo Sebelum', align:'right', render:r=>Fmt.rupiah(r.balance_before)},
      {key:'balance_after', header:'Saldo Sesudah', align:'right', render:r=>Fmt.rupiah(r.balance_after)},
      {key:'date', header:'Tanggal Transaksi', sortable:true, render:r=>Fmt.date(r.date)},
      {key:'note', header:'Keterangan', render:r=>`<span class="cell-secondary">${r.note}</span>`},
      {key:'actions', header:'', align:'right', render:()=>`<button class="btn btn-ghost btn-sm act-detail">${ic('eye')}</button>`},
    ],
    afterRender(wrap, rows){
      wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
        const s = rows.find(r=>r.id===tr.dataset.id);
        tr.querySelector('.act-detail')?.addEventListener('click', ()=>{
          Modal.open({
            title:'Detail Transaksi Settlement', subtitle:`${partnerName(s.partner_id)} · ${s.ref}`,
            bodyHTML:`<div class="detail-grid">
              <div class="detail-item"><span class="dl">Jenis Transaksi</span><span class="dv">${badge(s.type,'blue')}</span></div>
              <div class="detail-item"><span class="dl">Nominal</span><span class="dv">${Fmt.rupiah(s.amount)}</span></div>
              <div class="detail-item"><span class="dl">Saldo Sebelum</span><span class="dv">${Fmt.rupiah(s.balance_before)}</span></div>
              <div class="detail-item"><span class="dl">Saldo Sesudah</span><span class="dv">${Fmt.rupiah(s.balance_after)}</span></div>
              <div class="detail-item"><span class="dl">Tanggal</span><span class="dv">${Fmt.date(s.date)}</span></div>
              <div class="detail-item"><span class="dl">Keterangan</span><span class="dv">${s.note}</span></div>
            </div>`,
            footHTML:`<button class="btn btn-primary" id="mClose6">Tutup</button>`,
            onOpen(b,f){ f.querySelector('#mClose6').addEventListener('click', Modal.close); }
          });
        });
      });
    }
  });
  const cardEl = document.createElement('div'); cardEl.className='card'; cardEl.appendChild(table);
  tableMount.appendChild(cardEl);
};

/* ========================================================================
   4. PAYMENT GATEWAY (PASPE)
   ======================================================================== */

Views['payment.gateway'] = function(root){
  root.innerHTML = pageIntro('Monitoring integrasi pembayaran pelanggan melalui Virtual Account yang diproses oleh Payment Gateway (Paspe).');
  root.insertAdjacentHTML('beforeend', `<div id="kpiSlot"></div>`);

  function kpis(){
    const today = DB.payments;
    const berhasil = today.filter(p=>p.payment_status==='Berhasil').length;
    const gagal = today.filter(p=>p.payment_status==='Gagal').length;
    const totalNilai = today.filter(p=>p.payment_status==='Berhasil').reduce((s,p)=>s+p.billing_amount,0);
    root.querySelector('#kpiSlot').outerHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Total Transaksi Hari Ini', value:today.length, icon:'creditCard', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Pembayaran Berhasil', value:berhasil, icon:'checkCircle', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Total Pembayaran Gagal', value:gagal, icon:'bolt', bg:'var(--badge-red-bg)', fg:'var(--badge-red-fg)'},
      {label:'Total Nilai Pembayaran Hari Ini', value:Fmt.rupiah(totalNilai), icon:'wallet', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'},
    ])}</div>`;
  }
  kpis();

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  const table = DataTable({
    rows:()=>DB.payments,
    rowKey:'id',
    searchPlaceholder:'Cari referensi, tagihan, atau nama pelanggan…',
    searchFields:['payment_reference'],
    filters:[
      {key:'status', label:'Semua Status', options:[{value:'Berhasil',label:'Berhasil'},{value:'Pending',label:'Pending'},{value:'Gagal',label:'Gagal'}], match:(r,v)=>r.payment_status===v},
    ],
    columns:[
      {key:'payment_reference', header:'Nomor Referensi', sortable:true, render:r=>`<span class="cell-mono">${r.payment_reference}</span>`},
      {key:'invoice_id', header:'Nomor Tagihan', sortable:true, render:r=>{ const inv=DB.invoices.find(i=>i.id===r.invoice_id); return `<span class="cell-mono">${inv?inv.invoice_number:'-'}</span>`; }},
      {key:'customer', header:'Nama Pelanggan', render:r=>{ const inv=DB.invoices.find(i=>i.id===r.invoice_id); return inv?custName(inv.customer_id):'-'; }},
      {key:'virtual_account', header:'Virtual Account', render:r=>`<span class="cell-mono">${r.virtual_account}</span>`},
      {key:'billing_amount', header:'Nominal Pembayaran', sortable:true, align:'right', render:r=>`<span class="cell-num">${Fmt.rupiah(r.billing_amount)}</span>`},
      {key:'payment_date', header:'Tanggal Pembayaran', sortable:true, sortValue:r=>r.payment_date, render:r=>Fmt.datetime(r.payment_date)},
      {key:'payment_status', header:'Status', sortable:true, render:r=>statusBadge(r.payment_status)},
      {key:'actions', header:'', align:'right', render:()=>`<button class="btn btn-ghost btn-sm act-detail">${ic('eye')}Detail</button>`},
    ],
    afterRender(wrap, rows){
      wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
        const p = rows.find(r=>r.id===tr.dataset.id);
        tr.querySelector('.act-detail')?.addEventListener('click', ()=>{
          const inv = DB.invoices.find(i=>i.id===p.invoice_id);
          Modal.open({
            title:'Detail Transaksi Pembayaran', subtitle:p.payment_reference,
            bodyHTML:`<div class="detail-grid">
              <div class="detail-item"><span class="dl">Pelanggan</span><span class="dv">${inv?custName(inv.customer_id):'-'}</span></div>
              <div class="detail-item"><span class="dl">Nomor Tagihan</span><span class="dv">${inv?inv.invoice_number:'-'}</span></div>
              <div class="detail-item"><span class="dl">Virtual Account</span><span class="dv" style="font-family:var(--font-family-mono);">${p.virtual_account}</span></div>
              <div class="detail-item"><span class="dl">Nominal</span><span class="dv">${Fmt.rupiah(p.billing_amount)}</span></div>
              <div class="detail-item"><span class="dl">Waktu Pembayaran</span><span class="dv">${Fmt.datetime(p.payment_date)}</span></div>
              <div class="detail-item"><span class="dl">Status</span><span class="dv">${statusBadge(p.payment_status)}</span></div>
            </div>
            <div class="section-head" style="padding:16px 0 8px 0;"><h3>Riwayat Notifikasi (Callback)</h3></div>
            ${activityTimeline([
              {actor:'Payment Gateway', action:`mengirim permintaan validasi untuk ${p.payment_reference}`, time:p.payment_date},
              {actor:'ERP Mitra', action:'memvalidasi tagihan terhadap data billing', time:p.payment_date},
              {actor:'Payment Gateway', action:`callback status "${p.payment_status}" diterima`, time:p.payment_date},
            ])}`,
            footHTML:`<button class="btn btn-primary" id="mClose7">Tutup</button>`,
            onOpen(b,f){ f.querySelector('#mClose7').addEventListener('click', Modal.close); }
          });
        });
      });
    }
  });
  const cardEl = document.createElement('div'); cardEl.className='card'; cardEl.appendChild(table);
  tableMount.appendChild(cardEl);
};

/* ========================================================================
   5. RADIUS & CONTROL GATEWAY
   ======================================================================== */

Views['radius.monitoring'] = function(root){
  root.innerHTML = pageIntro('Status autentikasi dan kondisi layanan pelanggan pada server FreeRADIUS — isolir dan aktivasi berjalan otomatis mengikuti status billing.');
  root.insertAdjacentHTML('beforeend', `<div id="kpiSlot"></div>`);

  function kpis(){
    const online = DB.radius.filter(r=>r.radius_status==='Online').length;
    const isolir = DB.radius.filter(r=>r.radius_status==='Isolir').length;
    const active = DB.radius.filter(r=>r.customer_status==='Active').length;
    root.querySelector('#kpiSlot').outerHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Total Pelanggan Online', value:online, icon:'wifi', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Total Pelanggan Isolir', value:isolir, icon:'bolt', bg:'var(--badge-orange-bg)', fg:'var(--badge-orange-fg)'},
      {label:'Total Pelanggan Aktif', value:active, icon:'checkCircle', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Sinkronisasi Berhasil', value:DB.radius.length, icon:'server', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'},
    ])}</div>`;
  }
  kpis();

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  const table = DataTable({
    rows:()=>DB.radius,
    rowKey:'id',
    searchPlaceholder:'Cari PPPoE Secret, username, atau nama…',
    searchFields:[],
    filters:[
      {key:'status', label:'Semua Status Layanan', options:[{value:'Active',label:'Active'},{value:'Isolir',label:'Isolir'},{value:'Terminate',label:'Terminate'}], match:(r,v)=>r.customer_status===v},
      {key:'radius', label:'Semua Status Radius', options:[{value:'Online',label:'Online'},{value:'Offline',label:'Offline'},{value:'Isolir',label:'Isolir'}], match:(r,v)=>r.radius_status===v},
    ],
    columns:[
      {key:'pppoe', header:'PPPoE Secret', sortable:true, sortValue:r=>{const c=DB.customers.find(x=>x.id===r.customer_id); return c?c.pppoe_secret:'';}, render:r=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return `<span class="cell-mono">${c?c.pppoe_secret:'-'}</span>`; }},
      {key:'name', header:'Nama Pelanggan', sortValue:r=>custName(r.customer_id), sortable:true, render:r=>`<span class="cell-strong">${custName(r.customer_id)}</span>`},
      {key:'radius_username', header:'Username Radius', render:r=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return `<span class="cell-mono">${c?c.radius_username:'-'}</span>`; }},
      {key:'bandwidth', header:'Bandwidth', render:r=>badge(r.bandwidth,'cyan')},
      {key:'customer_status', header:'Status Pelanggan', sortable:true, render:r=>statusBadge(r.customer_status)},
      {key:'radius_status', header:'Status Radius', sortable:true, render:r=>statusBadge(r.radius_status)},
      {key:'last_update', header:'Last Update', sortable:true, sortValue:r=>r.last_update, render:r=>`<span class="cell-secondary">${Fmt.datetime(r.last_update)}</span>`},
      {key:'actions', header:'', align:'right', render:()=>`<button class="btn btn-ghost btn-sm act-detail">${ic('eye')}Detail</button>`},
    ],
    afterRender(wrap, rows){
      wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
        const r = rows.find(x=>x.id===tr.dataset.id);
        tr.querySelector('.act-detail')?.addEventListener('click', ()=>openDetail(r));
      });
    }
  });
  const cardEl = document.createElement('div'); cardEl.className='card'; cardEl.appendChild(table);
  tableMount.appendChild(cardEl);

  function openDetail(r){
    const c = DB.customers.find(x=>x.id===r.customer_id);
    const canIsolir = r.customer_status !== 'Terminate' && c.customer_type !== 'Fasum' && r.radius_status !== 'Isolir';
    const canActivate = r.radius_status === 'Isolir';
    Modal.open({
      title:custName(r.customer_id), subtitle:`${c?.pppoe_secret||'-'} · ${partnerName(c?.partner_id)}`,
      bodyHTML:`<div class="detail-grid">
        <div class="detail-item"><span class="dl">Username Radius</span><span class="dv" style="font-family:var(--font-family-mono);">${c?.radius_username}</span></div>
        <div class="detail-item"><span class="dl">Paket Layanan</span><span class="dv">${pkgName(c?.package_id)}</span></div>
        <div class="detail-item"><span class="dl">Bandwidth Aktif</span><span class="dv">${r.bandwidth}</span></div>
        <div class="detail-item"><span class="dl">Status Pelanggan</span><span class="dv">${statusBadge(r.customer_status)}</span></div>
        <div class="detail-item"><span class="dl">Status Radius</span><span class="dv">${statusBadge(r.radius_status)}</span></div>
        <div class="detail-item"><span class="dl">Tanggal Isolir Terakhir</span><span class="dv">${r.isolation_date?Fmt.date(r.isolation_date):'-'}</span></div>
        <div class="detail-item"><span class="dl">Tanggal Aktivasi Terakhir</span><span class="dv">${r.activation_date?Fmt.date(r.activation_date):'-'}</span></div>
        <div class="detail-item"><span class="dl">Tipe Pelanggan</span><span class="dv">${badge(c?.customer_type,'purple')}</span></div>
      </div>
      ${c?.customer_type==='Fasum' ? `<div style="margin-top:14px;"><span class="hint">Pelanggan Fasum tidak mengikuti mekanisme Auto Isolir — layanan tetap aktif walaupun ada tagihan belum dibayar.</span></div>` : ''}`,
      footHTML:`
        <button class="btn btn-secondary" id="mClose8">Tutup</button>
        ${canIsolir ? `<button class="btn btn-danger" id="mIsolir">${ic('bolt')}Isolir Manual</button>`:''}
        ${canActivate ? `<button class="btn btn-primary" id="mActivate">${ic('check')}Aktivasi Ulang</button>`:''}
      `,
      onOpen(b,f){
        f.querySelector('#mClose8').addEventListener('click', Modal.close);
        f.querySelector('#mIsolir')?.addEventListener('click', ()=>{
          r.radius_status='Isolir'; r.customer_status='Isolir'; r.isolation_date=new Date().toISOString().slice(0,10); r.last_update=new Date().toISOString();
          c.customer_status='Isolir';
          pushActivity('Radius Control Gateway', `mengisolir layanan pelanggan ${custName(r.customer_id)}`);
          toast('Layanan pelanggan berhasil diisolir'); Modal.close(); kpis(); table.refresh();
        });
        f.querySelector('#mActivate')?.addEventListener('click', ()=>{
          r.radius_status='Online'; r.customer_status='Active'; r.activation_date=new Date().toISOString().slice(0,10); r.last_update=new Date().toISOString();
          c.customer_status='Active';
          pushActivity('Radius Control Gateway', `mengaktifkan kembali layanan pelanggan ${custName(r.customer_id)}`);
          toast('Layanan pelanggan berhasil diaktifkan kembali'); Modal.close(); kpis(); table.refresh();
        });
      }
    });
  }
};

/* ========================================================================
   6. INFRASTRUCTURE / ODP
   ======================================================================== */

function flattenInfra(){
  const rows = [];
  DB.infrastructure.forEach(olt=>{
    rows.push({id:olt.id, name:olt.label, jenis:'Port OLT', olt:olt.id, parent:'-', lat:olt.lat||'-', lng:olt.lng||'-', status:'Aktif', ref:olt});
    (olt.children||[]).forEach(inp=>{
      rows.push({id:inp.id, name:inp.label, jenis:'Input Splitter', olt:olt.id, parent:olt.id, lat:inp.lat||'-', lng:inp.lng||'-', status:'Aktif', ref:inp});
      (inp.children||[]).forEach(out=>{
        rows.push({id:out.id, name:out.label, jenis:'Output Splitter', olt:olt.id, parent:inp.id, lat:out.lat, lng:out.lng, status:out.status, ref:out});
      });
    });
  });
  return rows;
}
function countInfra(){
  let olt=0, splitter=0, titik=0, pelanggan=0;
  DB.infrastructure.forEach(o=>{ olt++; (o.children||[]).forEach(i=>{ splitter++; titik++; (i.children||[]).forEach(x=>{ splitter++; titik++; pelanggan += x.connected||0; }); }); });
  return {olt, splitter, titik, pelanggan};
}

Views['infra.topologi'] = function(root){
  root.innerHTML = pageIntro('Visualisasi topologi jaringan mulai dari Port OLT, Input Splitter, hingga Output Splitter yang melayani pelanggan.');
  root.insertAdjacentHTML('beforeend', `<div id="kpiSlot"></div>`);

  function kpis(){
    const c = countInfra();
    root.querySelector('#kpiSlot').outerHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Total Port OLT', value:c.olt, icon:'server', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Splitter', value:c.splitter, icon:'splitter', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'},
      {label:'Total Titik Perangkat', value:c.titik, icon:'network', bg:'var(--badge-cyan-bg)', fg:'var(--badge-cyan-fg)'},
      {label:'Total Pelanggan Terhubung', value:c.pelanggan, icon:'users', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
    ])}</div>`;
  }
  kpis();

  const layout = document.createElement('div');
  layout.style.cssText = 'display:grid;grid-template-columns:1.1fr 1fr;gap:12px;align-items:start;';
  root.appendChild(layout);

  const treeCard = document.createElement('div'); treeCard.className='card';
  const panelCard = document.createElement('div'); panelCard.className='card card-pad';
  layout.appendChild(treeCard); layout.appendChild(panelCard);

  let selectedId = null;
  const expanded = new Set(DB.infrastructure.map(o=>o.id));

  function nodeIcon(type){
    if(type==='olt') return {ico:'server', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'};
    if(type==='input') return {ico:'splitter', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'};
    return {ico:'mapPin', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'};
  }

  function renderNode(node, depth){
    const hasChildren = node.children && node.children.length;
    const isOpen = expanded.has(node.id);
    const {ico, bg, fg} = nodeIcon(node.type);
    const meta = node.type==='output' ? `${node.connected}/${node.capacity}` : (node.type==='input' ? `${node.connected||0}/${node.capacity||'?'} · ${(node.children||[]).length} output` : `${(node.children||[]).length} input`);
    return `
      <div class="tree-node">
        <div class="tree-row ${selectedId===node.id?'selected':''}" data-node="${node.id}">
          <span class="tree-toggle ${hasChildren && isOpen ? 'rot':''}" data-toggle="${node.id}">${hasChildren?ic('chevronRight'):''}</span>
          <span class="tree-ico" style="background:${bg};color:${fg};">${ic(ico)}</span>
          <span class="tree-label">${node.label}</span>
          <span class="tree-meta">${meta}</span>
        </div>
        ${hasChildren && isOpen ? `<div class="tree-children">${node.children.map(ch=>renderNode(ch, depth+1)).join('')}</div>` : ''}
      </div>`;
  }

  function findNode(id, list){
    list = list || DB.infrastructure;
    for(const n of list){
      if(n.id === id) return n;
      if(n.children){ const r = findNode(id, n.children); if(r) return r; }
    }
    return null;
  }
  function findParentArray(id, list){
    list = list || DB.infrastructure;
    for(const n of list){
      if(n.children){
        if(n.children.some(c=>c.id===id)) return n.children;
        const r = findParentArray(id, n.children); if(r) return r;
      }
    }
    return null;
  }

  function paintTree(){
    const addBtns = isSuperUser()
      ? ''
      : `<button class="btn btn-primary btn-sm" id="btnAddOlt">${ic('plus')}Tambah OLT</button>
         <button class="btn btn-secondary btn-sm" id="btnAddInput">${ic('plus')}Tambah Input Splitter</button>
         <button class="btn btn-secondary btn-sm" id="btnAddOutput">${ic('plus')}Tambah Output Splitter</button>`;
    treeCard.innerHTML = `
      <div class="section-head"><h3>Topologi Infrastruktur</h3>
        <div class="btn-group">${addBtns}</div>
      </div>
      <div class="tree" id="treeMount">${DB.infrastructure.map(o=>renderNode(o,0)).join('')}</div>
    `;
    treeCard.querySelectorAll('[data-toggle]').forEach(el=>{
      el.addEventListener('click', (e)=>{
        e.stopPropagation();
        const id = el.dataset.toggle;
        if(expanded.has(id)) expanded.delete(id); else expanded.add(id);
        paintTree();
      });
    });
    treeCard.querySelectorAll('[data-node]').forEach(el=>{
      el.addEventListener('click', ()=>{ selectedId = el.dataset.node; paintTree(); paintPanel(); });
    });
    treeCard.querySelector('#btnAddOlt')?.addEventListener('click', openAddOltForm);
    treeCard.querySelector('#btnAddInput')?.addEventListener('click', openAddInputSplitterForm);
    treeCard.querySelector('#btnAddOutput')?.addEventListener('click', openAddOutputSplitterForm);
  }

  function paintPanel(){
    const node = selectedId ? findNode(selectedId) : null;
    if(!node){
      panelCard.innerHTML = `<div class="empty-state">${ic('network')}<div class="es-title">Pilih titik perangkat</div><div class="es-sub">Klik salah satu node pada topologi untuk melihat detail konfigurasinya.</div></div>`;
      return;
    }

    const canEdit = !isSuperUser();
    const canDelete = !isSuperUser();

    const actionBar = `
      <div style="display:flex;gap:8px;margin-top:16px;">
        ${canEdit ? `<button class="btn btn-secondary" id="pEdit" style="flex:1;">${ic('edit')}Edit</button>` : ''}
        ${canDelete ? `<button class="btn btn-danger" id="pDelete" style="flex:1;">${ic('trash')}Hapus</button>` : ''}
      </div>`;

    if(node.type === 'output'){
      panelCard.innerHTML = `
        <h3 style="margin:0 0 4px 0;font-size:14.5px;">${node.label}</h3>
        <p style="margin:0 0 14px 0;font-size:12.5px;color:var(--color-text-secondary);">Splitter ujung · melayani pelanggan langsung</p>
        <div class="detail-grid" style="margin-bottom:14px;">
          <div class="detail-item"><span class="dl">Jenis Splitter</span><span class="dv">Output 1:${node.capacity}</span></div>
          <div class="detail-item"><span class="dl">Status</span><span class="dv">${statusBadge(node.status)}</span></div>
          <div class="detail-item"><span class="dl">Kapasitas Terpakai</span><span class="dv">${node.connected}/${node.capacity}</span></div>
          <div class="detail-item"><span class="dl">Alamat</span><span class="dv">${node.address||'-'}</span></div>
        </div>
        <div class="cap-bar" style="width:100%;height:8px;margin-bottom:16px;"><span style="width:${node.connected/node.capacity*100}%;background:${node.connected>=node.capacity?'var(--badge-red-fg)':'var(--color-accent)'}"></span></div>
        <div class="field-row">
          <div class="field"><label>Latitude</label><input class="input" id="pLat" type="number" step="0.0001" value="${node.lat||0}"></div>
          <div class="field"><label>Longitude</label><input class="input" id="pLng" type="number" step="0.0001" value="${node.lng||0}"></div>
        </div>
        <div class="map-placeholder" style="margin-bottom:14px;">${ic('mapPin','pin')}<span>Lokasi splitter di peta</span><span style="font-family:var(--font-family-mono);font-size:11px;">${node.lat||0}, ${node.lng||0}</span></div>
        <button class="btn btn-primary" id="pSaveLoc" style="width:100%;">${ic('check')}Simpan Lokasi</button>
        ${actionBar}
      `;
      panelCard.querySelector('#pSaveLoc').addEventListener('click', ()=>{
        node.lat = parseFloat(document.getElementById('pLat').value)||node.lat;
        node.lng = parseFloat(document.getElementById('pLng').value)||node.lng;
        pushActivity(isSuperUser()?'Super Admin':'Administrator Mitra', `memperbarui koordinat lokasi ${node.label}`);
        toast('Koordinat lokasi splitter diperbarui'); paintPanel();
      });
    } else if(node.type === 'input'){
      const inputConnected = (node.children||[]).reduce((s,c)=>s+(c.connected||0),0);
      const inputCapacity = (node.children||[]).reduce((s,c)=>s+(c.capacity||0),0);
      panelCard.innerHTML = `
        <h3 style="margin:0 0 4px 0;font-size:14.5px;">${node.label}</h3>
        <p style="margin:0 0 14px 0;font-size:12.5px;color:var(--color-text-secondary);">Terhubung ke ${node.olt} · ${(node.children||[]).length} output splitter</p>
        <div class="detail-grid" style="margin-bottom:14px;">
          <div class="detail-item"><span class="dl">Jenis Splitter</span><span class="dv">Input 1:${node.capacity||'?'}</span></div>
          <div class="detail-item"><span class="dl">Total Output</span><span class="dv">${(node.children||[]).length} unit</span></div>
          <div class="detail-item"><span class="dl">Kapasitas Total</span><span class="dv">${inputCapacity} port</span></div>
          <div class="detail-item"><span class="dl">Port Terpakai</span><span class="dv">${inputConnected}/${inputCapacity}</span></div>
          <div class="detail-item"><span class="dl">Alamat</span><span class="dv">${node.address||'-'}</span></div>
        </div>
        ${inputCapacity > 0 ? `<div class="cap-bar" style="width:100%;height:8px;margin-bottom:16px;"><span style="width:${inputConnected/inputCapacity*100}%;background:${inputConnected>=inputCapacity?'var(--badge-red-fg)':'var(--color-accent)'}"></span></div>` : ''}
        <div class="field-row">
          <div class="field"><label>Latitude</label><input class="input" id="pLat" type="number" step="0.0001" value="${node.lat||0}"></div>
          <div class="field"><label>Longitude</label><input class="input" id="pLng" type="number" step="0.0001" value="${node.lng||0}"></div>
        </div>
        <div class="map-placeholder" style="margin-bottom:14px;">${ic('mapPin','pin')}<span>Lokasi input splitter di peta</span><span style="font-family:var(--font-family-mono);font-size:11px;">${node.lat||0}, ${node.lng||0}</span></div>
        <button class="btn btn-primary" id="pSaveLoc" style="width:100%;">${ic('check')}Simpan Lokasi</button>
        ${actionBar}
      `;
      panelCard.querySelector('#pSaveLoc').addEventListener('click', ()=>{
        node.lat = parseFloat(document.getElementById('pLat').value)||node.lat;
        node.lng = parseFloat(document.getElementById('pLng').value)||node.lng;
        pushActivity(isSuperUser()?'Super Admin':'Administrator Mitra', `memperbarui koordinat lokasi ${node.label}`);
        toast('Koordinat lokasi input splitter diperbarui'); paintPanel();
      });
    } else {
      panelCard.innerHTML = `
        <h3 style="margin:0 0 4px 0;font-size:14.5px;">${node.label}</h3>
        <p style="margin:0 0 14px 0;font-size:12.5px;color:var(--color-text-secondary);">${partnerName(node.partner_id)} · ${(node.children||[]).length} input splitter</p>
        <div class="detail-grid" style="margin-bottom:14px;">
          <div class="detail-item"><span class="dl">Vendor / Tipe</span><span class="dv">${node.olt_type||'-'}</span></div>
          <div class="detail-item"><span class="dl">Total Input Splitter</span><span class="dv">${(node.children||[]).length} unit</span></div>
          <div class="detail-item"><span class="dl">Alamat</span><span class="dv">${node.address||'-'}</span></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Latitude</label><input class="input" id="pLat" type="number" step="0.0001" value="${node.lat||0}"></div>
          <div class="field"><label>Longitude</label><input class="input" id="pLng" type="number" step="0.0001" value="${node.lng||0}"></div>
        </div>
        <div class="map-placeholder" style="margin-bottom:14px;">${ic('mapPin','pin')}<span>Lokasi OLT di peta</span><span style="font-family:var(--font-family-mono);font-size:11px;">${node.lat||0}, ${node.lng||0}</span></div>
        <button class="btn btn-primary" id="pSaveLoc" style="width:100%;">${ic('check')}Simpan Lokasi</button>
        ${actionBar}
      `;
      panelCard.querySelector('#pSaveLoc').addEventListener('click', ()=>{
        node.lat = parseFloat(document.getElementById('pLat').value)||node.lat;
        node.lng = parseFloat(document.getElementById('pLng').value)||node.lng;
        pushActivity(isSuperUser()?'Super Admin':'Administrator Mitra', `memperbarui koordinat lokasi ${node.label}`);
        toast('Koordinat lokasi OLT diperbarui'); paintPanel();
      });
    }

    panelCard.querySelector('#pEdit')?.addEventListener('click', ()=>openEditNodeForm(node));
    panelCard.querySelector('#pDelete')?.addEventListener('click', ()=>deleteNode(node));
  }

  function openEditNodeForm(node){
    let bodyHTML, title;
    if(node.type === 'olt'){
      title = 'Edit Port OLT';
      bodyHTML = `
        ${fieldsHTML([{label:'Nama Port OLT', id:'e_name', value:node.label}])}
        ${rowWrap(fieldsHTML([
          {label:'Vendor / Tipe OLT', id:'e_olt_type', type:'select', value:node.olt_type, options:[{value:'Huawei MA5800',label:'Huawei MA5800'},{value:'ZTE C320',label:'ZTE C320'},{value:'Fiberhome AN5516',label:'Fiberhome AN5516'}]},
          {label:'Mitra', id:'e_partner', type:'select', value:node.partner_id, options:DB.partners.map(p=>({value:p.id,label:p.partner_name}))},
        ]))}
        ${fieldsHTML([{label:'Alamat / Keterangan', id:'e_addr', type:'textarea', value:node.address, placeholder:'Lokasi pemasangan OLT'}])}
        ${rowWrap(fieldsHTML([
          {label:'Latitude', id:'e_lat', type:'number', value:node.lat||0},
          {label:'Longitude', id:'e_lng', type:'number', value:node.lng||0},
        ]))}`;
    } else if(node.type === 'input'){
      title = 'Edit Input Splitter';
      bodyHTML = `
        ${fieldsHTML([{label:'Nama Input Splitter', id:'e_name', value:node.label}])}
        ${rowWrap(fieldsHTML([
          {label:'Jenis Splitter', id:'e_cap', type:'select', value:String(node.capacity), options:[{value:'2',label:'Splitter 1:2'},{value:'8',label:'Splitter 1:8'},{value:'16',label:'Splitter 1:16'}]},
        ]))}
        ${fieldsHTML([{label:'Alamat / Keterangan', id:'e_addr', type:'textarea', value:node.address, placeholder:'Alamat lokasi input splitter'}])}
        ${rowWrap(fieldsHTML([
          {label:'Latitude', id:'e_lat', type:'number', value:node.lat||0},
          {label:'Longitude', id:'e_lng', type:'number', value:node.lng||0},
        ]))}`;
    } else {
      title = 'Edit Output Splitter';
      bodyHTML = `
        ${fieldsHTML([{label:'Nama Output Splitter', id:'e_name', value:node.label}])}
        ${rowWrap(fieldsHTML([
          {label:'Kapasitas', id:'e_cap', type:'select', value:String(node.capacity), options:[{value:'2',label:'Splitter 1:2'},{value:'8',label:'Output 1:8'},{value:'16',label:'Output 1:16'}]},
          {label:'Status', id:'e_status', type:'select', value:node.status, options:[{value:'Aktif',label:'Aktif'},{value:'Penuh',label:'Penuh'}]},
        ]))}
        ${fieldsHTML([{label:'Alamat / Keterangan', id:'e_addr', type:'textarea', value:node.address, placeholder:'Alamat lokasi splitter ujung'}])}
        ${rowWrap(fieldsHTML([
          {label:'Latitude', id:'e_lat', type:'number', value:node.lat||0},
          {label:'Longitude', id:'e_lng', type:'number', value:node.lng||0},
        ]))}`;
    }
    Modal.open({
      title, subtitle:`Memperbarui data ${node.label}`,
      bodyHTML,
      footHTML:`<button class="btn btn-secondary" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">${ic('check')}Simpan Perubahan</button>`,
      onOpen(b,f){
        f.querySelector('#mCancel').addEventListener('click', Modal.close);
        f.querySelector('#mSave').addEventListener('click', ()=>{
          const val = id=>document.getElementById(id).value.trim();
          const name = val('e_name');
          if(!name){ toast('Nama wajib diisi'); return; }
          node.label = name;
          node.address = val('e_addr');
          node.lat = parseFloat(val('e_lat'))||node.lat;
          node.lng = parseFloat(val('e_lng'))||node.lng;
          if(node.type === 'olt'){
            node.olt_type = document.getElementById('e_olt_type').value;
            node.partner_id = document.getElementById('e_partner').value;
          } else if(node.type === 'input'){
            node.capacity = parseInt(document.getElementById('e_cap').value,10);
          } else {
            node.capacity = parseInt(document.getElementById('e_cap').value,10);
            node.status = document.getElementById('e_status').value;
          }
          pushActivity(isSuperUser()?'Super Admin':'Administrator Mitra', `memperbarui data ${node.label}`);
          toast('Perubahan disimpan');
          Modal.close(); kpis(); paintTree(); paintPanel();
        });
      }
    });
  }

  function deleteNode(node){
    const label = node.label;
    const childCount = node.type === 'olt'
      ? (node.children||[]).length
      : node.type === 'input' ? (node.children||[]).length : 0;
    const warn = childCount > 0
      ? ` Node ini memiliki ${childCount} child yang juga akan ikut dihapus.`
      : '';
    const ok = window.confirm(`Hapus "${label}"?${warn}`);
    if(!ok) return;
    if(node.type === 'olt'){
      const idx = DB.infrastructure.findIndex(o=>o.id===node.id);
      if(idx !== -1) DB.infrastructure.splice(idx, 1);
    } else {
      const arr = findParentArray(node.id);
      if(arr){ const idx = arr.findIndex(n=>n.id===node.id); if(idx !== -1) arr.splice(idx,1); }
    }
    pushActivity(isSuperUser()?'Super Admin':'Administrator Mitra', `menghapus node ${label}`);
    toast(`${label} berhasil dihapus`);
    selectedId = null; kpis(); paintTree(); paintPanel();
  }

  function openAddOltForm(){
    Modal.open({
      title:'Tambah Port OLT', subtitle:'Daftarkan perangkat OLT baru ke topologi jaringan',
      bodyHTML:`
        ${fieldsHTML([{label:'Nama Port OLT', id:'n_olt_name', placeholder:'OLT Huawei MA5800 — Kantor Pusat'}])}
        ${rowWrap(fieldsHTML([
          {label:'Vendor / Tipe OLT', id:'n_olt_type', type:'select', options:[{value:'Huawei MA5800',label:'Huawei MA5800'},{value:'ZTE C320',label:'ZTE C320'},{value:'Fiberhome AN5516',label:'Fiberhome AN5516'}]},
          {label:'Mitra', id:'n_olt_partner', type:'select', options:DB.partners.map(p=>({value:p.id,label:p.partner_name}))},
        ]))}
        ${fieldsHTML([{label:'Alamat / Keterangan', id:'n_olt_addr', type:'textarea', placeholder:'Lokasi pemasangan OLT'}])}
        ${rowWrap(fieldsHTML([
          {label:'Latitude', id:'n_olt_lat', type:'number', value:'-6.2'},
          {label:'Longitude', id:'n_olt_lng', type:'number', value:'106.8'},
        ]))}
      `,
      footHTML:`<button class="btn btn-secondary" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">${ic('check')}Tambah OLT</button>`,
      onOpen(b,f){
        f.querySelector('#mCancel').addEventListener('click', Modal.close);
        f.querySelector('#mSave').addEventListener('click', ()=>{
          const val = id=>document.getElementById(id).value.trim();
          const name = val('n_olt_name');
          if(!name){ toast('Nama Port OLT wajib diisi'); return; }
          const newOlt = {id:nextId('OLT'), type:'olt', label:name, olt_type:val('n_olt_type')||'Huawei MA5800', partner_id:val('n_olt_partner'), address:val('n_olt_addr'), lat:parseFloat(val('n_olt_lat'))||0, lng:parseFloat(val('n_olt_lng'))||0, children:[]};
          DB.infrastructure.push(newOlt);
          expanded.add(newOlt.id);
          pushActivity(isSuperUser()?'Super Admin':'Administrator Mitra', `menambahkan Port OLT baru ${name}`);
          toast('Port OLT baru berhasil ditambahkan');
          Modal.close(); selectedId = newOlt.id; kpis(); paintTree(); paintPanel();
        });
      }
    });
  }

  function openAddInputSplitterForm(){
    if(DB.infrastructure.length === 0){ toast('Belum ada data OLT. Tambahkan OLT terlebih dahulu.'); return; }
    Modal.open({
      title:'Tambah Input Splitter', subtitle:'Tambahkan Input Splitter baru pada Port OLT terpilih',
      bodyHTML:`
        ${fieldsHTML([{label:'Nama Input Splitter', id:'n_inp_name', placeholder:'Input Splitter 1:8 — Blok A'}])}
        ${rowWrap(fieldsHTML([
          {label:'Port OLT Induk', id:'n_inp_olt', type:'select', options:DB.infrastructure.map(o=>({value:o.id,label:`${o.label} (${o.olt_type})`}))},
          {label:'Jenis Splitter', id:'n_inp_type', type:'select', options:[{value:'2',label:'Splitter 1:2'},{value:'8',label:'Splitter 1:8'},{value:'16',label:'Splitter 1:16'}]},
        ]))}
        ${fieldsHTML([{label:'Keterangan / Alamat', id:'n_inp_addr', type:'textarea', placeholder:'Alamat lokasi input splitter'}])}
        ${rowWrap(fieldsHTML([
          {label:'Latitude', id:'n_inp_lat', type:'number', value:'-6.2'},
          {label:'Longitude', id:'n_inp_lng', type:'number', value:'106.8'},
        ]))}
      `,
      footHTML:`<button class="btn btn-secondary" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">${ic('check')}Tambah Input Splitter</button>`,
      onOpen(b,f){
        f.querySelector('#mCancel').addEventListener('click', Modal.close);
        f.querySelector('#mSave').addEventListener('click', ()=>{
          const val = id=>document.getElementById(id).value.trim();
          const name = val('n_inp_name');
          if(!name){ toast('Nama Input Splitter wajib diisi'); return; }
          const oltId = val('n_inp_olt');
          const oltNode = findOltNode(oltId);
          if(!oltNode){ toast('Port OLT induk tidak ditemukan'); return; }
          const cap = parseInt(val('n_inp_type'),10);
          const newInput = {id:nextId('SPL'), type:'input', label:name, olt:oltNode.label, capacity:cap, connected:0, address:val('n_inp_addr'), lat:parseFloat(val('n_inp_lat'))||0, lng:parseFloat(val('n_inp_lng'))||0, children:[]};
          oltNode.children = oltNode.children || [];
          oltNode.children.push(newInput);
          expanded.add(oltId);
          pushActivity(isSuperUser()?'Super Admin':'Administrator Mitra', `menambahkan Input Splitter baru ${name} ke ${oltNode.label}`);
          toast('Input Splitter baru berhasil ditambahkan');
          Modal.close(); selectedId = newInput.id; kpis(); paintTree(); paintPanel();
        });
      }
    });
  }

  function openAddOutputSplitterForm(){
    if(DB.infrastructure.length === 0){ toast('Belum ada data OLT. Tambahkan OLT terlebih dahulu.'); return; }
    function inputOpts(oltId){
      const inputs = allInputSplitters(oltId);
      return inputs.length ? inputs.map(i=>({value:i.id,label:i.label})) : [{value:'',label:'-- Belum ada Input Splitter --'}];
    }
    Modal.open({
      title:'Tambah Output Splitter', subtitle:'Tambahkan Output Splitter baru pada Input Splitter terpilih',
      bodyHTML:`
        ${fieldsHTML([{label:'Nama Output Splitter', id:'n_out_name', placeholder:'Output Splitter 1:8 — RT 05'}])}
        ${fieldsHTML([{label:'Port OLT Induk', id:'n_out_olt', type:'select', options:DB.infrastructure.map(o=>({value:o.id,label:`${o.label} (${o.olt_type})`}))}])}
        ${fieldsHTML([{label:'Input Splitter Induk', id:'n_out_parent', type:'select', options:inputOpts(DB.infrastructure[0]?.id||'')}])}
        ${fieldsHTML([{label:'Kapasitas', id:'n_out_cap', type:'select', options:[{value:'2',label:'Splitter 1:2'},{value:'8',label:'Output 1:8'},{value:'16',label:'Output 1:16'}]}])}
        ${fieldsHTML([{label:'Alamat / Keterangan', id:'n_out_addr', type:'textarea', placeholder:'Alamat lokasi splitter ujung'}])}
        ${rowWrap(fieldsHTML([
          {label:'Latitude', id:'n_out_lat', type:'number', value:'-6.2'},
          {label:'Longitude', id:'n_out_lng', type:'number', value:'106.8'},
        ]))}
      `,
      footHTML:`<button class="btn btn-secondary" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">${ic('check')}Tambah Output Splitter</button>`,
      onOpen(b,f){
        const selOlt = b.querySelector('#n_out_olt');
        const selParent = b.querySelector('#n_out_parent');
        function refreshParentOpts(){
          const opts = inputOpts(selOlt.value);
          const prev = selParent.value;
          selParent.innerHTML = opts.map(o=>`<option value="${o.value}" ${o.value===prev?'selected':''}>${o.label}</option>`).join('');
        }
        selOlt.addEventListener('change', refreshParentOpts);
        f.querySelector('#mCancel').addEventListener('click', Modal.close);
        f.querySelector('#mSave').addEventListener('click', ()=>{
          const val = id=>document.getElementById(id).value;
          const name = val('n_out_name').trim();
          if(!name){ toast('Nama Output Splitter wajib diisi'); return; }
          const parentId = val('n_out_parent');
          if(!parentId){ toast('Pilih Input Splitter induk terlebih dahulu'); return; }
          const parentNode = findNode(parentId);
          if(!parentNode){ toast('Input Splitter induk tidak ditemukan'); return; }
          const cap = parseInt(val('n_out_cap'),10);
          const newNode = {id:nextId('SPL'), type:'output', label:name, lat:parseFloat(val('n_out_lat'))||0, lng:parseFloat(val('n_out_lng'))||0, address:val('n_out_addr'), capacity:cap, connected:0, status:'Aktif'};
          parentNode.children = parentNode.children || [];
          parentNode.children.push(newNode);
          expanded.add(parentId);
          pushActivity(isSuperUser()?'Super Admin':'Administrator Mitra', `menambahkan Output Splitter baru ${name}`);
          toast('Output Splitter baru berhasil ditambahkan');
          Modal.close(); selectedId = newNode.id; kpis(); paintTree(); paintPanel();
        });
      }
    });
  }

  paintTree();
  paintPanel();
};

Views['infra.perangkat'] = function(root){
  root.innerHTML = pageIntro('Seluruh perangkat jaringan yang telah terdaftar pada topologi infrastruktur mitra.');

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  const table = DataTable({
    rows:()=>flattenInfra(),
    rowKey:'id',
    searchPlaceholder:'Cari nama titik, Port OLT, atau jenis splitter…',
    searchFields:['name','olt'],
    filters:[
      {key:'jenis', label:'Semua Jenis Perangkat', options:[{value:'Port OLT',label:'Port OLT'},{value:'Input Splitter',label:'Input Splitter'},{value:'Output Splitter',label:'Output Splitter'}], match:(r,v)=>r.jenis===v},
      {key:'status', label:'Semua Status', options:[{value:'Aktif',label:'Aktif'},{value:'Penuh',label:'Penuh'}], match:(r,v)=>r.status===v},
    ],
    columns:[
      {key:'name', header:'Nama Titik', sortable:true, render:r=>`<span class="cell-strong">${r.name}</span>`},
      {key:'jenis', header:'Jenis Perangkat', sortable:true, render:r=>badge(r.jenis, r.jenis==='Port OLT'?'blue':r.jenis==='Input Splitter'?'purple':'green')},
      {key:'olt', header:'Port OLT', sortable:true, render:r=>`<span class="cell-mono">${r.olt}</span>`},
      {key:'parent', header:'Parent Perangkat', render:r=>`<span class="cell-mono">${r.parent}</span>`},
      {key:'lat', header:'Latitude', render:r=>r.lat},
      {key:'lng', header:'Longitude', render:r=>r.lng},
      {key:'status', header:'Status', sortable:true, render:r=>statusBadge(r.status)},
      {key:'actions', header:'', align:'right', render:()=>`
        <div class="row-actions">
          <button class="btn btn-secondary btn-sm act-edit">${ic('edit')}Edit</button>
          <button class="btn btn-ghost btn-sm act-detail">${ic('eye')}</button>
        </div>`},
    ],
    afterRender(wrap, rows){
      wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
        const r = rows.find(x=>x.id===tr.dataset.id);
        tr.querySelector('.act-detail')?.addEventListener('click', ()=>openDetail(r));
        tr.querySelector('.act-edit')?.addEventListener('click', ()=>openEdit(r));
      });
    }
  });
  const cardEl = document.createElement('div'); cardEl.className='card'; cardEl.appendChild(table);
  tableMount.appendChild(cardEl);

  function openDetail(r){
    Modal.open({
      title:r.name, subtitle:`${r.jenis} · ${r.olt}`,
      bodyHTML:`<div class="detail-grid">
        <div class="detail-item"><span class="dl">Jenis Perangkat</span><span class="dv">${badge(r.jenis,'blue')}</span></div>
        <div class="detail-item"><span class="dl">Parent</span><span class="dv" style="font-family:var(--font-family-mono);">${r.parent}</span></div>
        <div class="detail-item"><span class="dl">Latitude</span><span class="dv">${r.lat}</span></div>
        <div class="detail-item"><span class="dl">Longitude</span><span class="dv">${r.lng}</span></div>
        <div class="detail-item"><span class="dl">Status</span><span class="dv">${statusBadge(r.status)}</span></div>
      </div>`,
      footHTML:`<button class="btn btn-primary" id="mClose9">Tutup</button>`,
      onOpen(b,f){ f.querySelector('#mClose9').addEventListener('click', Modal.close); }
    });
  }
  function openEdit(r){
    if(r.jenis !== 'Output Splitter'){ toast('Hanya Output Splitter yang dapat diedit langsung dari tabel ini'); return; }
    Modal.open({
      title:'Edit Perangkat', subtitle:r.name,
      bodyHTML:`
        ${rowWrap(fieldsHTML([
          {label:'Latitude', id:'e_lat', type:'number', value:r.lat},
          {label:'Longitude', id:'e_lng', type:'number', value:r.lng},
        ]))}
        ${fieldsHTML([{label:'Status', id:'e_status', type:'select', value:r.status, options:[{value:'Aktif',label:'Aktif'},{value:'Penuh',label:'Penuh'}]}])}
      `,
      footHTML:`<button class="btn btn-secondary" id="mCancel">Batal</button><button class="btn btn-primary" id="mSave">${ic('check')}Simpan</button>`,
      onOpen(b,f){
        f.querySelector('#mCancel').addEventListener('click', Modal.close);
        f.querySelector('#mSave').addEventListener('click', ()=>{
          r.ref.lat = parseFloat(document.getElementById('e_lat').value)||r.ref.lat;
          r.ref.lng = parseFloat(document.getElementById('e_lng').value)||r.ref.lng;
          r.ref.status = document.getElementById('e_status').value;
          toast('Data perangkat diperbarui');
          Modal.close(); table.refresh();
        });
      }
    });
  }
};
