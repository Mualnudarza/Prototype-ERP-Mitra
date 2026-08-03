/* ==========================================================================
   ERP MITRA — UI TOOLKIT
   Komponen generik: ikon, badge, KPI card, DataTable, Modal, Toast, Sidebar.
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* ICONS (inline SVG strings, stroke-based, 24x24 viewBox)                */
/* ---------------------------------------------------------------------- */
const ICONS = {
  building:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 22V4a1 1 0 011-1h10a1 1 0 011 1v18" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22V17h6v5M9 8h1M14 8h1M9 12h1M14 12h1" stroke-linecap="round"/></svg>`,
  users:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-linecap="round"/></svg>`,
  wallet:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5h-4a2 2 0 010-4h4z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  wifi:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/></svg>`,
  server:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="7" rx="1.5"/><rect x="2" y="14" width="20" height="7" rx="1.5"/><path d="M6 6.5h.01M6 17.5h.01" stroke-linecap="round"/></svg>`,
  receipt:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3h16v18l-2.5-1.5L15 21l-2.5-1.5L10 21l-2.5-1.5L5 21l-1-18z" stroke-linejoin="round"/><path d="M8 8h8M8 12h8M8 16h5" stroke-linecap="round"/></svg>`,
  creditCard:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1.5" y="4.5" width="21" height="15" rx="2"/><path d="M1.5 9.5h21" stroke-linecap="round"/></svg>`,
  mapPin:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z" stroke-linejoin="round"/><circle cx="12" cy="10" r="3"/></svg>`,
  search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>`,
  edit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9" stroke-linecap="round"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" stroke-linejoin="round"/></svg>`,
  eye:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3"/></svg>`,
  key:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3M19 4l1 1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevronUp:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevronDown:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevronRight:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevronsUpDown:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 9l4-4 4 4M8 15l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  inbox:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M22 12h-6l-2 3h-4l-2-3H2" stroke-linejoin="round"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" stroke-linejoin="round"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  checkCircle:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke-linecap="round"/><path d="M22 4L12 14.01l-3-3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  network:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5V13M12 13L6.5 17M12 13l5.5 4" stroke-linecap="round"/></svg>`,
  splitter:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h4M17 12h4M7 12l4-5h2M7 12l4 5h2M13 7h4M13 17h4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  odp:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 8h8M8 12h8M8 16h4" stroke-linecap="round"/></svg>`,
  history:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 3v5h5M12 7v5l4 2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  gauge:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 019 9M12 3a9 9 0 00-9 9m9-9v3M4 15h1.5M18.5 15H20M6.34 6.34l1.06 1.06m9.2-1.06l-1.06 1.06" stroke-linecap="round"/><path d="M12 12l4-3" stroke-linecap="round"/></svg>`,
  more:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  trash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0l-.8 13.2A2 2 0 0117.2 21H6.8a2 2 0 01-2-1.8L4 6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bolt:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke-linejoin="round"/></svg>`,
  home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  copy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  clipboardList:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3v2h6V3M8 10h8M8 14h8M8 18h5" stroke-linecap="round"/></svg>`,
  lock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="13" rx="2"/><path d="M8 11V7a4 4 0 014-4h1a4 4 0 014 4v4" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/></svg>`,
  info:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-linecap="round"/><path d="M12 16v-4M12 8h.01" stroke-linecap="round"/></svg>`,
};
function ic(name, cls){ return (ICONS[name]||'').replace('<svg ', `<svg class="${cls||''}" `); }

/* ---------------------------------------------------------------------- */
/* BADGES                                                                  */
/* ---------------------------------------------------------------------- */
function badge(text, variant, opts){
  opts = opts || {};
  const dotClass = opts.noDot ? ' no-dot' : '';
  return `<span class="badge badge-${variant}${dotClass}">${text}</span>`;
}
const STATUS_VARIANT = {
  'Aktif':'green', 'Active':'green', 'Berhasil':'green', 'Lunas':'green', 'Online':'green',
  'Nonaktif':'gray', 'Offline':'gray',
  'Isolir':'orange', 'Jatuh Tempo':'orange', 'Pending':'yellow',
  'Terminate':'red', 'Gagal':'red',
  'Belum Dibayar':'blue', 'Menunggu Verifikasi':'yellow', 'Penuh':'red',
  'Reguler':'blue', 'Fasum':'purple',
  'Unregistered':'yellow',
};
function statusBadge(text){
  return badge(text, STATUS_VARIANT[text] || 'gray');
}

/* ---------------------------------------------------------------------- */
/* KPI CARDS                                                               */
/* ---------------------------------------------------------------------- */
function renderKPIs(items){
  return `<div class="kpi-grid">${items.map(it => `
    <div class="kpi-card">
      <div class="kpi-label">
        <span>${it.label}</span>
        <span class="kpi-ico" style="background:${it.bg||'var(--color-background-muted)'};color:${it.fg||'var(--color-text-secondary)'}">${ic(it.icon||'gauge')}</span>
      </div>
      <div class="kpi-value">${it.value}</div>
      ${it.sub ? `<div class="kpi-sub ${it.subTone||''}">${it.sub}</div>` : ''}
    </div>`).join('')}</div>`;
}

/* ---------------------------------------------------------------------- */
/* TOAST                                                                   */
/* ---------------------------------------------------------------------- */
function toast(msg){
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${ic('checkCircle')}<span>${msg}</span>`;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(6px)'; el.style.transition='all .18s ease'; setTimeout(()=>el.remove(),200); }, 2600);
}

/* ---------------------------------------------------------------------- */
/* MODAL                                                                   */
/* ---------------------------------------------------------------------- */
const Modal = {
  open({title, subtitle, bodyHTML, footHTML, size, onOpen}){
    document.getElementById('modalTitle').textContent = title || '';
    document.getElementById('modalSubtitle').textContent = subtitle || '';
    document.getElementById('modalBody').innerHTML = bodyHTML || '';
    document.getElementById('modalFoot').innerHTML = footHTML || '';
    const box = document.getElementById('modalBox');
    box.classList.toggle('modal-lg', size === 'lg');
    document.getElementById('modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    if(onOpen) onOpen(document.getElementById('modalBody'), document.getElementById('modalFoot'));
  },
  close(){
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
};
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('modalClose').addEventListener('click', Modal.close);
  document.getElementById('modalOverlay').addEventListener('click', (e)=>{
    if(e.target.id === 'modalOverlay') Modal.close();
  });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') Modal.close(); });
});

/* ---------------------------------------------------------------------- */
/* GENERIC DATATABLE                                                       */
/* columns: [{key, header, sortable, align, render(row)}]                  */
/* filters: [{key,label,options:[{value,label}],match(row,val)}]           */
/* ---------------------------------------------------------------------- */
function DataTable(opts){
  const state = {
    search:'', sort:opts.defaultSort || null, sortDir: 1,
    filters:{}, page:1, pageSize: opts.pageSize || 6,
  };
  (opts.filters||[]).forEach(f => state.filters[f.key] = '');

  const wrap = document.createElement('div');

  function getRows(){
    let rows = opts.rows();
    if(state.search){
      const q = state.search.toLowerCase();
      rows = rows.filter(r => (opts.searchFields||[]).some(f => String(r[f]||'').toLowerCase().includes(q)));
    }
    (opts.filters||[]).forEach(f => {
      const val = state.filters[f.key];
      if(val) rows = rows.filter(r => f.match(r, val));
    });
    if(state.sort){
      const col = opts.columns.find(c=>c.key===state.sort);
      rows = [...rows].sort((a,b)=>{
        const av = col && col.sortValue ? col.sortValue(a) : a[state.sort];
        const bv = col && col.sortValue ? col.sortValue(b) : b[state.sort];
        if(av === bv) return 0;
        if(av === null || av === undefined) return 1;
        if(bv === null || bv === undefined) return -1;
        return (av > bv ? 1 : -1) * state.sortDir;
      });
    }
    return rows;
  }

  function render(){
    const allRows = getRows();
    const totalPages = Math.max(1, Math.ceil(allRows.length / state.pageSize));
    if(state.page > totalPages) state.page = totalPages;
    const startIdx = (state.page-1)*state.pageSize;
    const pageRows = allRows.slice(startIdx, startIdx+state.pageSize);

    const filterHTML = (opts.filters||[]).map(f => `
      <select class="input dt-filter" data-key="${f.key}" style="min-width:132px;">
        <option value="">${f.label}</option>
        ${f.options.map(o=>`<option value="${o.value}" ${state.filters[f.key]===o.value?'selected':''}>${o.label}</option>`).join('')}
      </select>`).join('');

    const theadHTML = `<tr>
      ${opts.selectable ? `<th class="no-sort" style="width:36px;"><input type="checkbox" class="chk"></th>` : ''}
      ${opts.columns.map(c => `
        <th data-key="${c.key}" class="${c.sortable? '' : 'no-sort'} ${state.sort===c.key?'sorted':''}" style="${c.width?`width:${c.width};`:''}${c.align?`text-align:${c.align};`:''}">
          <span class="th-inner" style="${c.align==='right'?'justify-content:flex-end;':''}">
            ${c.header}
            ${c.sortable ? `<span class="sort-ico">${state.sort===c.key ? (state.sortDir===1?ic('chevronUp'):ic('chevronDown')) : ic('chevronsUpDown')}</span>` : ''}
          </span>
        </th>`).join('')}
    </tr>`;

    const tbodyHTML = pageRows.length ? pageRows.map(row => `
      <tr data-id="${row[opts.rowKey]}">
        ${opts.selectable ? `<td><input type="checkbox" class="chk row-chk"></td>` : ''}
        ${opts.columns.map(c => `<td style="${c.align?`text-align:${c.align};`:''}">${c.render ? c.render(row) : (row[c.key] ?? '-')}</td>`).join('')}
      </tr>`).join('') :
      `<tr><td colspan="${opts.columns.length + (opts.selectable?1:0)}">
        <div class="empty-state">
          ${ic('inbox')}
          <div class="es-title">Tidak ada data ditemukan</div>
          <div class="es-sub">Coba ubah kata kunci pencarian atau filter.</div>
        </div>
      </td></tr>`;

    let pagerHTML = '';
    for(let p=1;p<=totalPages;p++){
      if(totalPages > 6 && p!==1 && p!==totalPages && Math.abs(p-state.page)>1){
        if(p === 2 || p === totalPages-1) pagerHTML += `<span style="padding:0 2px;color:var(--color-text-tertiary);">…</span>`;
        continue;
      }
      pagerHTML += `<button data-page="${p}" class="${p===state.page?'active':''}">${p}</button>`;
    }

    wrap.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-wrap">${ic('search')}<input type="text" class="input dt-search" placeholder="${opts.searchPlaceholder||'Cari...'}" value="${state.search}"></div>
          ${filterHTML}
        </div>
        <div class="toolbar-right">${opts.toolbarRight || ''}</div>
      </div>
      <div class="table-wrap">
        <table class="dtable">
          <thead>${theadHTML}</thead>
          <tbody>${tbodyHTML}</tbody>
        </table>
      </div>
      <div class="footer-bar">
        <span>${allRows.length} data ditemukan · ${opts.rows().length} total</span>
        <div class="pager">${pagerHTML}</div>
      </div>
    `;

    // wire events
    const searchInput = wrap.querySelector('.dt-search');
    searchInput.addEventListener('input', (e)=>{ state.search = e.target.value; state.page=1; render(); preserveFocus(searchInput); });
    wrap.querySelectorAll('.dt-filter').forEach(sel=>{
      sel.addEventListener('change', (e)=>{ state.filters[sel.dataset.key] = e.target.value; state.page=1; render(); });
    });
    wrap.querySelectorAll('thead th[data-key]:not(.no-sort)').forEach(th=>{
      th.addEventListener('click', ()=>{
        const key = th.dataset.key;
        if(state.sort === key) state.sortDir *= -1; else { state.sort = key; state.sortDir = 1; }
        render();
      });
    });
    wrap.querySelectorAll('.pager button').forEach(btn=>{
      btn.addEventListener('click', ()=>{ state.page = parseInt(btn.dataset.page,10); render(); });
    });
    if(opts.onRowClick){
      wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
        tr.addEventListener('click', (e)=>{
          if(e.target.closest('button') || e.target.closest('input')) return;
          const row = allRows.find(r=>String(r[opts.rowKey])===tr.dataset.id);
          opts.onRowClick(row);
        });
      });
    }
    if(opts.afterRender) opts.afterRender(wrap, allRows);
  }

  function preserveFocus(input){
    // keep focus + caret after re-render triggered by typing
    requestAnimationFrame(()=>{
      const el = wrap.querySelector('.dt-search');
      if(el){ el.focus(); const v = el.value; el.value=''; el.value=v; }
    });
  }

  wrap.refresh = render;
  render();
  return wrap;
}

/* ---------------------------------------------------------------------- */
/* SIMPLE BAR CHART                                                        */
/* ---------------------------------------------------------------------- */
function barChart(data, opts){
  opts = opts || {};
  const max = Math.max(...data.map(d=>d.value), 1);
  return `<div class="bars">${data.map(d=>`
    <div class="bar-col" title="${d.label}: ${opts.fmt ? opts.fmt(d.value) : d.value}">
      <div class="bar" style="height:${Math.max(4,(d.value/max)*100)}%;${d.color?`background:${d.color};`:''}"></div>
      <div class="bar-lbl">${d.label}</div>
    </div>`).join('')}</div>`;
}

/* ---------------------------------------------------------------------- */
/* SIDEBAR / NAV                                                           */
/* ---------------------------------------------------------------------- */
function renderSidebar(navConfig, activeKey){
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-mark">DM</div>
      <div class="sidebar-brand-text">
        <strong>ERP Mitra</strong>
        <span>by Dasaria</span>
      </div>
    </div>
    <div class="sidebar-scroll">
      ${navConfig.map(group => `
        <div class="nav-group">
          <div class="nav-group-label">${group.group}</div>
          ${group.items.map(item => `
            <div class="nav-item ${activeKey===item.key?'active':''}" data-nav="${item.key}">
              <span class="nav-ico">${ic(item.icon)}</span>
              <span>${item.label}</span>
              ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
            </div>`).join('')}
        </div>`).join('')}
    </div>
    <div class="sidebar-footer">
      <div class="sidebar-user-wrap" id="userSwitcher">
        <div class="sidebar-user" id="userSwitcherTrigger">
          <div class="avatar">${CURRENT_USER.initials}</div>
          <div class="sidebar-user-text">
            <strong>${CURRENT_USER.name}</strong>
            <span>${CURRENT_USER.email}</span>
          </div>
          <svg class="sidebar-user-caret" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
        </div>
        <div class="user-dropdown" id="userDropdown">
          ${USERS.map(u => `
            <div class="user-dropdown-item ${u.id===CURRENT_USER.id?'active':''}" data-user-id="${u.id}">
              <div class="avatar">${u.initials}</div>
              <div class="user-dropdown-info">
                <strong>${u.name}</strong>
                <span>${u.email}</span>
              </div>
              <span class="user-dropdown-role">${u.role}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
  sidebar.querySelectorAll('[data-nav]').forEach(el=>{
    el.addEventListener('click', ()=>{
      window.location.hash = el.dataset.nav;
      if(window.innerWidth <= 960) document.getElementById('sidebar').classList.remove('open');
    });
  });

  const switcher = document.getElementById('userSwitcher');
  const trigger = document.getElementById('userSwitcherTrigger');
  if(trigger){
    trigger.addEventListener('click', (e)=>{
      e.stopPropagation();
      switcher.classList.toggle('open');
    });
  }
   sidebar.querySelectorAll('[data-user-id]').forEach(el=>{
     el.addEventListener('click', ()=>{
       const uid = el.dataset.userId;
       const user = USERS.find(u=>u.id===uid);
       if(user && user.id !== CURRENT_USER.id){
         CURRENT_USER = user;
         const hash = window.location.hash.replace('#','');
         const routeKey = hash.split('?')[0];
         let redirect = null;
         if(user.id==='super' && !SUPER_USER_KEYS.includes(routeKey)){
           redirect = DEFAULT_ROUTE_SUPER;
         } else if(user.id==='fat' && !FAT_KEYS.includes(routeKey)){
           redirect = DEFAULT_ROUTE_FAT;
         } else if(user.id==='mitra' && (PARTNERSHIP_KEYS.includes(routeKey) || FAT_KEYS.includes(routeKey))){
           redirect = DEFAULT_ROUTE_MITRA;
         }
         if(redirect){
           window.location.hash = redirect;
         } else {
           renderRoute();
         }
         toast('Beralih ke: ' + user.name);
       }
       switcher.classList.remove('open');
     });
   });
}
