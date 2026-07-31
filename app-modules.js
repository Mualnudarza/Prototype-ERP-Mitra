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

function openBulkPaymentModal(selectedRows, partner){
  const totalAmount = selectedRows.reduce((s, r) => s + r.totalPayable, 0);
  const totalDeposit = partner.deposit_balance;
  const totalExtra = selectedRows.reduce((s, r) => s + r.extraCharge, 0);
  const totalPackage = selectedRows.reduce((s, r) => s + r.invoice.billing_amount, 0);

  // Build detail rows for each selected invoice
  let detailRows = '';
  selectedRows.forEach((r, idx) => {
    // Calculate deductions breakdown
    const packagePrice = r.invoice.billing_amount;
    let ksoAmt = 0, pgFee = 0, adminFee = 0, otherDed = 0;
    if(partner.kso_type === 'percentage'){
      ksoAmt = Math.round(packagePrice * (partner.kso_value / 100));
    } else {
      ksoAmt = partner.kso_value || 0;
    }
    if(r.invoice.payment_method !== 'TUNAI/KASIR') pgFee = 3000; // conceptual
    if(partner.other_deductions && partner.other_deductions.length > 0){
      partner.other_deductions.forEach(d => {
        if(d.type === 'percentage'){
          adminFee += Math.round(packagePrice * (d.value / 100));
        } else {
          adminFee += d.value;
        }
      });
    } else if(r.extraCharge > 0) {
      adminFee = r.extraCharge;
    }

    detailRows += `
      <div style="border:1px solid var(--color-border);border-radius:8px;padding:12px;margin-bottom:8px;background:var(--color-background-muted);">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-weight:600;">
          <span>${idx+1}. ${r.customer.customer_name}</span>
          <span class="cell-mono">${r.invoice.invoice_number}</span>
        </div>
        <div style="font-size:13px;color:var(--color-text-secondary);margin-bottom:8px;">
          Paket: ${r.pkg ? r.pkg.package_name + ' (' + r.pkg.bandwidth + ')' : '-'} | Periode: ${r.invoice.billing_period}
        </div>
        <table style="width:100%;font-size:12px;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:var(--color-text-secondary);">Harga Paket (Termasuk Potongan)</td><td style="padding:4px 0;text-align:right;font-weight:600;">${Fmt.rupiah(r.invoice.billing_amount)}</td></tr>
          <tr><td style="padding:4px 0;color:var(--color-text-secondary);">Biaya Tambahan</td><td style="padding:4px 0;text-align:right;">${Fmt.rupiah(r.extraCharge)}</td></tr>
          <tr style="border-top:1px solid var(--color-border);"><td style="padding:4px 0;font-weight:600;">Total Bayar</td><td style="padding:4px 0;text-align:right;font-weight:700;color:var(--color-accent);">${Fmt.rupiah(r.totalPayable)}</td></tr>
        </table>
        <div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--color-border);font-size:12px;color:var(--color-text-secondary);">
          <strong>Rincian Potongan (Konseptual):</strong><br>
          KSO: ${Fmt.rupiah(ksoAmt)} | PG Fee: ${Fmt.rupiah(pgFee)} | Admin: ${Fmt.rupiah(adminFee)} | Lainnya: ${Fmt.rupiah(otherDed)}<br>
          <em>Catatan: Harga paket di atas sudah termasuk potongan yang disepakati. Rincian di atas untuk referensi perhitungan laba bersih.</em>
        </div>
      </div>
    `;
  });

  Modal.open({
    title:'Konfirmasi Pembayaran Bulk', subtitle:`${selectedRows.length} customer dipilih`,
    bodyHTML:`<div style="max-height:50vh;overflow-y:auto;">
      <div class="detail-grid" style="margin-bottom:16px;">
        <div class="detail-item"><span class="dl">Total Customer</span><span class="dv">${selectedRows.length}</span></div>
        <div class="detail-item"><span class="dl">Total Harga Paket</span><span class="dv">${Fmt.rupiah(selectedRows.reduce((s,r)=>s+r.invoice.billing_amount,0))}</span></div>
        <div class="detail-item"><span class="dl">Total Biaya Tambahan</span><span class="dv">${Fmt.rupiah(selectedRows.reduce((s,r)=>s+r.extraCharge,0))}</span></div>
        <div class="detail-item" style="font-weight:700;font-size:15px;color:var(--color-accent);"><span class="dl">Total Bayar</span><span class="dv">${Fmt.rupiah(selectedRows.reduce((s,r)=>s+r.totalPayable,0))}</span></div>
        <div class="detail-item" style="font-size:12px;color:var(--color-text-secondary);"><span class="dl">Saldo Deposit Saat Ini</span><span class="dv">${Fmt.rupiah(partner.deposit_balance)}</span></div>
      </div>
      <div style="border-top:1px solid var(--color-border);padding-top:12px;margin-bottom:12px;">
        <strong style="font-size:13px;">Rincian Per Customer:</strong>
        <div style="margin-top:8px;">${detailRows}</div>
      </div>
    </div>`,
    footHTML:`<button class="btn btn-secondary" id="mCloseBulk">${ic('x')} Batal</button> <button class="btn btn-primary" id="mConfirmBulk">${ic('check')} Konfirmasi Bayar Bulk</button>`,
    onOpen(b, f){
      f.querySelector('#mCloseBulk').addEventListener('click', Modal.close);
      f.querySelector('#mConfirmBulk').addEventListener('click', () => {
        const totalAmount = selectedRows.reduce((s, r) => s + r.totalPayable, 0);
        if(partner.deposit_balance < totalAmount) {
          toast('Saldo deposit tidak mencukupi untuk pembayaran bulk ini.');
          return;
        }
        const oldBalance = partner.deposit_balance;
        partner.deposit_balance -= totalAmount;
        let successCount = 0;
        selectedRows.forEach(r => {
          const inv = r.invoice;
          inv.billing_status = 'Lunas';
          inv.extra_charge = r.extraCharge;
          inv.total_paid = r.totalPayable;
          inv.settled = false;
          const depId = nextId('DEP');
          DB.depositHistory.push({
            id: depId,
            partner_id: partner.id,
            ref: 'DEP/2026/07/' + String(DB.depositHistory.length+1).padStart(4,'0'),
            type: 'Deposit Keluar',
            date: new Date().toISOString().slice(0,10),
            amount: -r.totalPayable,
            balance_before: oldBalance,
            balance_after: partner.deposit_balance,
            note: `Pembayaran bulk ${r.customer.customer_name} (${inv.invoice_number})`,
            status: 'Berhasil'
          });
          DB.payments.push({
            id: nextId('PAY'),
            invoice_id: inv.id,
            payment_reference: 'CSH-BULK-' + Date.now() + '-' + successCount,
            virtual_account: 'TUNAI/KASIR',
            billing_amount: r.totalPayable,
            payment_date: new Date().toISOString(),
            payment_status: 'Berhasil'
          });
          successCount++;
        });
        pushActivity(CURRENT_USER.name, `menerima pembayaran bulk ${selectedRows.length} customer sebesar ${Fmt.rupiah(totalAmount)}`);
        toast(`Pembayaran bulk ${selectedRows.length} customer berhasil dikonfirmasi!`);
        window.dispatchEvent(new CustomEvent('keuangan-refresh'));
        Modal.close();
      });
    }
  });
}

function openPaymentModal(customer, invoice, pkg, extraCharge, totalPayable, partner){
  const breakdownHTML = extraCharge > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:var(--color-text-secondary);">
          <span>Biaya Tambahan</span>
          <span>+ ${Fmt.rupiah(extraCharge)}</span>
        </div>` : '';
  Modal.open({
    title:'Konfirmasi Pembayaran Tunai', subtitle:customer.customer_name,
    bodyHTML:`<div class="detail-grid">
      <div class="detail-item"><span class="dl">Nomor Tagihan</span><span class="dv cell-mono font-bold">${invoice.invoice_number}</span></div>
      <div class="detail-item"><span class="dl">Paket Layanan</span><span class="dv">${pkg ? pkg.package_name + ' (' + pkg.bandwidth + ')' : '-'}</span></div>
      <div class="detail-item"><span class="dl">Periode Billing</span><span class="dv">${invoice.billing_period}</span></div>
      <div class="detail-item"><span class="dl">Nominal Paket</span><span class="dv">${Fmt.rupiah(invoice.billing_amount)}</span></div>
      ${breakdownHTML}
      <div class="detail-item" style="display:flex;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid var(--color-border);font-weight:700;font-size:15px;color:var(--color-text-primary);">
        <span>Total yang Harus Dibayar</span>
        <span style="color:var(--color-accent);">${Fmt.rupiah(totalPayable)}</span>
      </div>
      <div class="detail-item" style="font-size:12px;color:var(--color-text-secondary);margin-top:8px;">Saldo deposit mitra saat ini: ${Fmt.rupiah(partner.deposit_balance)}</div>
    </div>`,
    footHTML:`<button class="btn btn-secondary" id="mClosePay">${ic('x')} Batal</button> <button class="btn btn-primary" id="mConfirmPay">${ic('check')} Konfirmasi Bayar</button>`,
    onOpen(b, f){
      f.querySelector('#mClosePay').addEventListener('click', Modal.close);
      f.querySelector('#mConfirmPay').addEventListener('click', () => {
        if(partner.deposit_balance < totalPayable) {
          toast('Saldo deposit tidak mencukupi untuk melakukan pembayaran ini.');
          return;
        }
        const oldBalance = partner.deposit_balance;
        partner.deposit_balance -= totalPayable;
        invoice.billing_status = 'Lunas';
        invoice.extra_charge = extraCharge;
        invoice.total_paid = totalPayable;
        invoice.settled = false;
        const depId = nextId('DEP');
        DB.depositHistory.push({
          id: depId,
          partner_id: partner.id,
          ref: 'DEP/2026/07/' + String(DB.depositHistory.length+1).padStart(4,'0'),
          type: 'Deposit Keluar',
          date: new Date().toISOString().slice(0,10),
          amount: -totalPayable,
          balance_before: oldBalance,
          balance_after: partner.deposit_balance,
          note: `Pembayaran tunai ${customer.customer_name} (${invoice.invoice_number})`,
          status: 'Berhasil'
        });
        DB.payments.push({
          id: nextId('PAY'),
          invoice_id: invoice.id,
          payment_reference: 'CSH-' + Date.now(),
          virtual_account: 'TUNAI/KASIR',
          billing_amount: totalPayable,
          payment_date: new Date().toISOString(),
          payment_status: 'Berhasil'
        });
        pushActivity(CURRENT_USER.name, `menerima pembayaran tunai ${customer.customer_name} sebesar ${Fmt.rupiah(totalPayable)}`);
        toast('Pembayaran berhasil dikonfirmasi & saldo deposit diperbarui!');
        window.dispatchEvent(new CustomEvent('keuangan-refresh'));
        Modal.close();
      });
    }
  });
}

/* ========================================================================
   1. PARTNERSHIP MANAGEMENT
   ======================================================================== */

const Views = {};

function renderMitraForm(root, existing){
  if(!isSuperUser()){ window.location.hash='partnership.mitra'; return; }
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

      <div class="section-head" style="padding:20px 0 14px 0;"><h3>Konfigurasi Keuangan</h3></div>

      <div style="padding:0 0 10px 0;font-size:12.5px;font-weight:600;color:var(--color-text-secondary);">Konfigurasi Jatuh Tempo</div>
      ${rowWrap(fieldsHTML([
        {label:'Tipe Jatuh Tempo', id:'f_due_type', type:'select', value:existing?.payment_due_type||'Tanggal Tetap', options:[
          {value:'Tanggal Tetap',label:'Tanggal Tetap'},
          {value:'Jatuh Tempo 30 Hari',label:'Jatuh Tempo 30 Hari'},
          {value:'Rolling Days',label:'Rolling Days'},
        ]},
        {label:'Nilai', id:'f_due_value', value:existing?.payment_due_value, placeholder:'Tanggal (1-28) atau jumlah hari'},
      ]))}

      <div style="padding:14px 0 10px 0;font-size:12.5px;font-weight:600;color:var(--color-text-secondary);">Konfigurasi Settlement</div>
      ${rowWrap(fieldsHTML([
        {label:'Nama Bank', id:'f_bank', value:existing?.bank_name, placeholder:'Bank Mandiri'},
        {label:'Nomor Rekening', id:'f_acc_no', value:existing?.bank_account_no, placeholder:'1230007890123'},
      ]))}
      ${fieldsHTML([{label:'Nama Pemilik Rekening', id:'f_acc_name', value:existing?.bank_account_name, placeholder:'Sesuai nama rekening'}])}

      <div style="padding:14px 0 10px 0;font-size:12.5px;font-weight:600;color:var(--color-text-secondary);">Konfigurasi Deposit Kasir</div>
      ${rowWrap(fieldsHTML([
        {label:'Minimal Deposit', id:'f_deposit_min', type:'number', value:existing?.cashier_deposit_min, placeholder:'0'},
        {label:'Deposit Awal', id:'f_deposit_init', type:'number', value:existing?.cashier_deposit_initial, placeholder:'0'},
      ]))}

      <div style="padding:14px 0 10px 0;font-size:12.5px;font-weight:600;color:var(--color-text-secondary);">Konfigurasi Potongan</div>
      <div style="background:var(--color-background-muted);border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px;">KSO (Kerja Sama Operasi)</div>
        ${rowWrap(fieldsHTML([
          {label:'Nilai KSO', id:'f_kso_value', type:'number', value:existing?.kso_value, placeholder:'0'},
          {label:'Tipe', id:'f_kso_type', type:'select', value:existing?.kso_type||'percentage', options:[{value:'percentage',label:'Persentase'},{value:'nominal',label:'Nominal'}]},
        ]))}
      </div>
      <div style="background:var(--color-background-muted);border-radius:8px;padding:12px;">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px;">Potongan Lainnya</div>
        <div id="otherDeductionsList">
          ${(existing?.other_deductions||[{name:'',value:'',type:'percentage'}]).map((d,i)=>`
            <div class="ded-row" style="display:flex;gap:6px;align-items:end;margin-bottom:6px;">
              <div class="field" style="flex:2;margin:0;"><label style="font-size:10px;">Nama</label><input class="input ded-name" value="${d.name}" placeholder="Biaya Admin" style="font-size:12px;"></div>
              <div class="field" style="flex:1;margin:0;"><label style="font-size:10px;">Nilai</label><input class="input ded-value" type="number" value="${d.value}" placeholder="0" style="font-size:12px;"></div>
              <div class="field" style="flex:1;margin:0;"><label style="font-size:10px;">Tipe</label><select class="input ded-type" style="font-size:12px;"><option value="percentage" ${d.type==='percentage'?'selected':''}>%</option><option value="nominal" ${d.type==='nominal'?'selected':''}>Rp</option></select></div>
              <button type="button" class="btn btn-ghost btn-sm ded-remove" style="margin-bottom:2px;flex-shrink:0;">${ic('x')}</button>
            </div>`).join('')}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="addDedRow" style="margin-top:4px;">${ic('plus')}Tambah Potongan</button>
      </div>

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

  function collectDeductions(){
    const rows = content.querySelectorAll('#otherDeductionsList .ded-row');
    const list = [];
    rows.forEach(row=>{
      const name = row.querySelector('.ded-name').value.trim();
      const value = row.querySelector('.ded-value').value;
      const type = row.querySelector('.ded-type').value;
      if(name) list.push({name, value, type});
    });
    return list;
  }

  function wireDedRow(cont){
    cont.querySelector('#addDedRow')?.addEventListener('click', ()=>{
      const list = cont.querySelector('#otherDeductionsList');
      const div = document.createElement('div');
      div.className = 'ded-row';
      div.style.cssText = 'display:flex;gap:6px;align-items:end;margin-bottom:6px;';
      div.innerHTML = `
        <div class="field" style="flex:2;margin:0;"><label style="font-size:10px;">Nama</label><input class="input ded-name" placeholder="Biaya Admin" style="font-size:12px;"></div>
        <div class="field" style="flex:1;margin:0;"><label style="font-size:10px;">Nilai</label><input class="input ded-value" type="number" placeholder="0" style="font-size:12px;"></div>
        <div class="field" style="flex:1;margin:0;"><label style="font-size:10px;">Tipe</label><select class="input ded-type" style="font-size:12px;"><option value="percentage">%</option><option value="nominal">Rp</option></select></div>
        <button type="button" class="btn btn-ghost btn-sm ded-remove" style="margin-bottom:2px;flex-shrink:0;">${ic('x')}</button>`;
      list.appendChild(div);
      div.querySelector('.ded-remove')?.addEventListener('click', ()=>{ div.remove(); });
    });
    cont.querySelectorAll('.ded-remove').forEach(btn=>{
      btn.addEventListener('click', ()=>{ btn.closest('.ded-row').remove(); });
    });
  }
  wireDedRow(content);

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
      cashier_deposit_min: parseFloat(val('f_deposit_min'))||0,
      cashier_deposit_initial: parseFloat(val('f_deposit_init'))||0,
      kso_value: parseFloat(val('f_kso_value'))||0,
      kso_type: document.getElementById('f_kso_type').value,
      other_deductions: collectDeductions(),
    };

    if(isEdit){
      Object.assign(existing, data);
      pushActivity('Super Admin', `memperbarui profil mitra ${name}`);
      toast('Perubahan profil mitra disimpan');
    } else {
      const newP = {id: nextId('PTR'), users_count:1, created_at:new Date().toISOString().slice(0,10), ...data};
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
    toolbarRight: isSuperUser() ? `<button class="btn btn-primary btn-sm" id="btnAddMitra">${ic('plus')}Tambah Mitra</button>` : '',
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
      ...(isSuperUser() ? [{key:'actions', header:'', align:'right', render:r=>`<button class="btn btn-secondary btn-sm act-edit-mitra" data-id="${r.id}">${ic('edit')}Edit</button>`}] : []),
    ],
    afterRender(wrap){
      wrap.querySelector('#btnAddMitra')?.addEventListener('click', ()=>{ window.location.hash='partnership.mitra?id=add'; });
      wrap.querySelectorAll('.act-edit-mitra').forEach(btn=>{
        btn.addEventListener('click', ()=>{ window.location.hash='partnership.mitra?id='+btn.dataset.id; });
      });
    }
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
              olt_id:null, olt_odp_id:null, olt_slot:null, olt_pon:null, olt_rx_register:null,
            };
            DB.customers.push(newC);
            DB.radius.push({id:'RAD-'+newC.id, customer_id:newC.id, customer_name:name, pppoe_secret:newC.pppoe_secret, onu_number:newC.onu_number, bandwidth:(DB.packages.find(p=>p.id===newC.package_id)||{}).bandwidth||'-', customer_status:'Unregistered', radius_status:'Offline', isolation_date:null, activation_date:null, last_update:new Date().toISOString(), olt_rx_now:null, olt_status:'Offline'});
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

  root.innerHTML = `
    <div class="page-intro" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <p style="margin:0;">Registrasi ONU untuk pelanggan <strong>${customer.customer_name}</strong> — lengkapi data perangkat untuk mengaktifkan layanan.</p>
      <button class="btn btn-secondary btn-sm" id="btnBackQueue">${ic('chevronLeft')}Kembali ke Antrian</button>
    </div>
    <div id="regPageContent"></div>
  `;

  root.querySelector('#btnBackQueue')?.addEventListener('click', ()=>{ window.location.hash='customer.registrasi'; });

  function odpOptions(){
    const odps = allOdps();
    return odps.length
      ? odps.map(o=>({value:o.id, label:`${o.oltLabel} → ${o.parentLabel?o.parentLabel+' → ':''}${o.label}`}))
      : [{value:'',label:'-- Belum ada ODP — tambah di Topologi Infrastruktur --'}];
  }

  function scriptsHTML(oltId, slot, pon, snOverride){
    const node = findOltNode(oltId);
    if(!node || !slot || !pon){
      return `<div class="empty-state" style="padding:26px 8px;">${ic('clipboardList')}<div class="es-sub">Pilih Port ODP dan ONU Pelanggan untuk melihat script registrasi.</div></div>`;
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
        ${fieldsHTML([{label:'Port ODP', id:'r_odp', type:'select', value:customer.olt_odp_id||'', options:odpOptions()}])}
        ${rowWrap(fieldsHTML([
          {label:'No. ONU', id:'r_onu', value:customer.onu_number||'', placeholder:'ONU-XXXX'},
          {label:'Port Pelanggan', id:'r_port', type:'select', value:customer.access_port||'1', options:Array.from({length:16},(_,i)=>({value:String(i+1), label:'Port '+(i+1)}))},
        ]))}
        <div class="hint">Script registrasi di sebelah kanan diperbarui otomatis mengikuti konfigurasi yang dipilih.</div>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-secondary" id="rCancel">${ic('x')}Batal</button>
          <button class="btn btn-primary" id="rSave">${ic('check')}Proses Registrasi ONU</button>
        </div>
      </div>
      <div class="card card-pad">
        <div class="section-head" style="padding:0 0 14px 0;"><h3>Panduan Registrasi ONU</h3></div>
        <div id="regScriptsContainer">${scriptsHTML(null, null, null)}</div>
      </div>
    </div>
  `;

  const selOdp = content.querySelector('#r_odp');
  const selPort = content.querySelector('#r_port');
  const snInput = content.querySelector('#r_sn');
  const scriptContainer = content.querySelector('#regScriptsContainer');

  function getOltIdFromOdp(odpId){
    const found = findOdpNode(odpId);
    return found ? found.oltId : null;
  }

  function refreshScripts(){
    const oltId = getOltIdFromOdp(selOdp.value);
    scriptContainer.innerHTML = scriptsHTML(oltId, '1', selPort.value, snInput.value.trim());
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

  selOdp.addEventListener('change', refreshScripts);
  selPort.addEventListener('change', refreshScripts);
  snInput.addEventListener('input', refreshScripts);

  content.querySelector('#rCancel')?.addEventListener('click', ()=>{ window.location.hash='customer.registrasi'; });
  content.querySelector('#rSave')?.addEventListener('click', ()=>{
    const odpId = selOdp.value;
    const onuPort = selPort.value;
    const sn = snInput.value.trim();
    const onuNumber = content.querySelector('#r_onu').value.trim();
    if(!odpId){ toast('Pilih Port ODP terlebih dahulu'); return; }
    if(!sn){ toast('SN Modem wajib diisi'); return; }
    if(!onuNumber){ toast('No. ONU wajib diisi'); return; }
    const odpInfo = findOdpNode(odpId);
    if(!odpInfo){ toast('ODP tidak ditemukan'); return; }
    const odpNode = odpInfo.node;
    const oltId = odpInfo.oltId;
    const oltNode = findOltNode(oltId);
    if(!oltNode){ toast('OLT induk tidak ditemukan'); return; }

    const ok = window.confirm(`Selesaikan registrasi ONU untuk ${customer.customer_name} pada ${odpNode.label}, Port ${onuPort}?`);
    if(!ok) return;

    const rx = (Math.random() * (-18 - (-24)) + (-24)).toFixed(1);

    customer.modem_serial_number = sn;
    customer.olt_id = oltId;
    customer.olt_odp_id = odpId;
    customer.olt_slot = '1';
    customer.olt_pon = onuPort;
    customer.olt_port = `${oltId}/ODP-${onuPort}`;
    customer.onu_number = onuNumber;
    customer.olt_rx_register = parseFloat(rx);
    customer.access_name = odpNode.label;
    customer.access_port = onuPort;
    customer.customer_status = 'Active';

    odpNode.connected = (odpNode.connected||0) + 1;
    if(odpNode.connected >= odpNode.capacity) odpNode.status = 'Penuh';

    const rad = DB.radius.find(r=>r.customer_id===customer.id);
    if(rad){
      rad.radius_status = 'Online';
      rad.customer_status = 'Active';
      rad.onu_number = onuNumber;
      rad.activation_date = new Date().toISOString().slice(0,10);
      rad.last_update = new Date().toISOString();
    }
    pushActivity('Sistem', `menyelesaikan registrasi ONU ${onuNumber} untuk pelanggan ${customer.customer_name} pada ${odpNode.label} Port ${onuPort}`);
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

Views['deposit.dashboard'] = function(root){
  const partnerId = CURRENT_USER.partner_id || 'PTR-0001';
  const partner = DB.partners.find(p => p.id === partnerId) || DB.partners[0];

  root.innerHTML = pageIntro('Kelola saldo deposit kasir mitra, histori transaksi deposit, dan penerimaan pembayaran tunai dari customer.');
  root.insertAdjacentHTML('beforeend', `<div id="kpiSlot"></div>`);

  function kpis(){
    const history = DB.depositHistory.filter(d => d.partner_id === partner.id);
    const masuk = history.filter(d => d.type === 'Deposit Masuk' && d.status === 'Berhasil').reduce((s,d)=>s+d.amount, 0);
    const keluar = history.filter(d => d.type === 'Deposit Keluar' && d.status === 'Berhasil').reduce((s,d)=>s+Math.abs(d.amount), 0);

    root.querySelector('#kpiSlot').outerHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Saldo Deposit Saat Ini', value:Fmt.rupiah(partner.deposit_balance), icon:'wallet', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Deposit Masuk', value:Fmt.rupiah(masuk), icon:'plus', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Total Deposit Keluar', value:Fmt.rupiah(keluar), icon:'minus', bg:'var(--badge-orange-bg)', fg:'var(--badge-orange-fg)'},
      {label:'Total Pembayaran Customer', value:Fmt.rupiah(keluar), icon:'users', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'}
    ])}</div>`;
  }
  kpis();

  const tabWrapper = document.createElement('div');
  tabWrapper.innerHTML = `
    <div class="subtabs">
      <button class="subtab active" id="btnTabHistory">Riwayat Deposit</button>
      <button class="subtab" id="btnTabPayment">Pembayaran Customer</button>
    </div>
    <div id="tabContent"></div>
  `;
  root.appendChild(tabWrapper);

  const tabContent = tabWrapper.querySelector('#tabContent');
  const btnTabHistory = tabWrapper.querySelector('#btnTabHistory');
  const btnTabPayment = tabWrapper.querySelector('#btnTabPayment');

  function showHistoryTab(){
    btnTabHistory.classList.add('active');
    btnTabPayment.classList.remove('active');
    tabContent.innerHTML = '';
    const table = DataTable({
      rows: () => DB.depositHistory.filter(d => d.partner_id === partner.id),
      rowKey: 'id',
      searchPlaceholder: 'Cari nomor transaksi / keterangan…',
      searchFields: ['ref', 'note'],
      columns: [
        {key:'ref', header:'Nomor Transaksi', sortable:true, render:r=>`<span class="cell-mono">${r.ref}</span>`},
        {key:'type', header:'Jenis Transaksi', sortable:true, render:r=>badge(r.type, r.type==='Deposit Masuk'?'green':'orange')},
        {key:'date', header:'Tanggal', sortable:true, render:r=>Fmt.date(r.date)},
        {key:'amount', header:'Nominal', sortable:true, align:'right', render:r=>`<span class="cell-num" style="color:${r.amount<0?'var(--badge-red-fg)':'var(--badge-green-fg)'}">${Fmt.rupiah(r.amount)}</span>`},
        {key:'balance_before', header:'Saldo Sebelum', align:'right', render:r=>Fmt.rupiah(r.balance_before)},
        {key:'balance_after', header:'Saldo Sesudah', align:'right', render:r=>Fmt.rupiah(r.balance_after)},
        {key:'note', header:'Keterangan', render:r=>`<span class="cell-secondary">${r.note}</span>`},
        {key:'status', header:'Status', render:r=>statusBadge(r.status)}
      ]
    });
    const card = document.createElement('div'); card.className = 'card'; card.appendChild(table);
    tabContent.appendChild(card);
  }

  function openPaymentModal(customer, invoice, pkg, extraCharge, totalPayable){
    const breakdownHTML = extraCharge > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:var(--color-text-secondary);">
          <span>Biaya Tambahan</span>
          <span>+ ${Fmt.rupiah(extraCharge)}</span>
        </div>` : '';
    Modal.open({
      title:'Konfirmasi Pembayaran Tunai', subtitle:customer.customer_name,
      bodyHTML:`<div class="detail-grid">
        <div class="detail-item"><span class="dl">Nomor Tagihan</span><span class="dv cell-mono font-bold">${invoice.invoice_number}</span></div>
        <div class="detail-item"><span class="dl">Paket Layanan</span><span class="dv">${pkg ? pkg.package_name + ' (' + pkg.bandwidth + ')' : '-'}</span></div>
        <div class="detail-item"><span class="dl">Periode Billing</span><span class="dv">${invoice.billing_period}</span></div>
        <div class="detail-item"><span class="dl">Nominal Paket</span><span class="dv">${Fmt.rupiah(invoice.billing_amount)}</span></div>
        ${breakdownHTML}
        <div class="detail-item" style="display:flex;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid var(--color-border);font-weight:700;font-size:15px;color:var(--color-text-primary);">
          <span>Total yang Harus Dibayar</span>
          <span style="color:var(--color-accent);">${Fmt.rupiah(totalPayable)}</span>
        </div>
        <div class="detail-item" style="font-size:12px;color:var(--color-text-secondary);margin-top:8px;">Saldo deposit mitra saat ini: ${Fmt.rupiah(partner.deposit_balance)}</div>
      </div>`,
      footHTML:`<button class="btn btn-secondary" id="mClosePay">${ic('x')} Batal</button> <button class="btn btn-primary" id="mConfirmPay">${ic('check')} Konfirmasi Bayar</button>`,
      onOpen(b, f){
        f.querySelector('#mClosePay').addEventListener('click', Modal.close);
        f.querySelector('#mConfirmPay').addEventListener('click', () => {
          if(partner.deposit_balance < totalPayable) {
            toast('Saldo deposit tidak mencukupi untuk melakukan pembayaran ini.');
            return;
          }
          const oldBalance = partner.deposit_balance;
          partner.deposit_balance -= totalPayable;
          invoice.billing_status = 'Lunas';
          invoice.extra_charge = extraCharge;
          invoice.total_paid = totalPayable;
          invoice.settled = false;
          const depId = nextId('DEP');
          DB.depositHistory.push({
            id: depId,
            partner_id: partner.id,
            ref: 'DEP/2026/07/' + String(DB.depositHistory.length+1).padStart(4,'0'),
            type: 'Deposit Keluar',
            date: new Date().toISOString().slice(0,10),
            amount: -totalPayable,
            balance_before: oldBalance,
            balance_after: partner.deposit_balance,
            note: `Pembayaran tunai ${customer.customer_name} (${invoice.invoice_number})`,
            status: 'Berhasil'
          });
          DB.payments.push({
            id: nextId('PAY'),
            invoice_id: invoice.id,
            payment_reference: 'CSH-' + Date.now(),
            virtual_account: 'TUNAI/KASIR',
            billing_amount: totalPayable,
            payment_date: new Date().toISOString(),
            payment_status: 'Berhasil'
          });
          pushActivity(CURRENT_USER.name, `menerima pembayaran tunai ${customer.customer_name} sebesar ${Fmt.rupiah(totalPayable)}`);
          toast('Pembayaran berhasil dikonfirmasi & saldo deposit diperbarui!');
          kpis();
          showHistoryTab();
          Modal.close();
        });
      }
    });
  }

  function showPaymentTab(){
    btnTabHistory.classList.remove('active');
    btnTabPayment.classList.add('active');

    const customersWithInvoices = DB.customers
      .filter(c => c.partner_id === partner.id)
      .map(c => {
        const invoice = DB.invoices.find(i => i.customer_id === c.id);
        const pkg = DB.packages.find(p => p.id === c.package_id);
        if(!invoice) return null;
        let extraCharge = 0;
        if(partner.other_deductions && partner.other_deductions.length > 0){
          partner.other_deductions.forEach(d => {
            extraCharge += d.type === 'percentage' ? Math.round(invoice.billing_amount * (d.value / 100)) : d.value;
          });
        } else if(invoice.billing_status !== 'Lunas') {
          extraCharge = 5000;
        }
        const totalPayable = invoice.billing_amount + extraCharge;
        return { customer: c, invoice, pkg, extraCharge, totalPayable, status: invoice.billing_status === 'Lunas' ? 'Lunas' : 'Belum Dibayar' };
      })
      .filter(x => x !== null);

    tabContent.innerHTML = `
      <div class="card card-pad">
        <h3 style="margin-top:0;margin-bottom:16px;">Terima Pembayaran Tunai Customer</h3>
        <div id="paymentTableSlot"></div>
      </div>
    `;

    const tableSlot = tabContent.querySelector('#paymentTableSlot');

    const table = DataTable({
      rows: () => customersWithInvoices,
      rowKey: 'invoice.id',
      searchPlaceholder: 'Cari nama customer, PPPoE, atau paket…',
      searchFields: ['customer.customer_name', 'customer.pppoe_secret', 'pkg.package_name'],
      columns: [
        {key:'customer.customer_name', header:'Nama Customer', sortable:true, render:r=>`<span class="cell-strong">${r.customer.customer_name}</span>`},
        {key:'customer.pppoe_secret', header:'PPPoE Secret', sortable:true, render:r=>`<span class="cell-mono">${r.customer.pppoe_secret}</span>`},
        {key:'pkg.package_name', header:'Paket', sortable:true, render:r=>r.pkg ? `${r.pkg.package_name} (${r.pkg.bandwidth})` : '-'},
        {key:'invoice.billing_period', header:'Periode', sortable:true},
        {key:'invoice.billing_amount', header:'Nominal Paket', sortable:true, align:'right', render:r=>Fmt.rupiah(r.invoice.billing_amount)},
        {key:'extraCharge', header:'Biaya Tambahan', align:'right', render:r=>Fmt.rupiah(r.extraCharge)},
        {key:'totalPayable', header:'Total Bayar', sortable:true, align:'right', render:r=>`<span class="cell-num" style="color:var(--color-accent);font-weight:700;">${Fmt.rupiah(r.totalPayable)}</span>`},
        {key:'status', header:'Status', sortable:true, render:r=>statusBadge(r.status)},
        {key:'actions', header:'', align:'right', render:r=> r.status === 'Lunas' 
          ? `<span class="cell-secondary">Sudah bayar</span>` 
          : `<button class="btn btn-primary btn-sm act-pay" data-invoice="${r.invoice.id}" data-customer="${r.customer.id}">${ic('check')} Bayar</button>`}
      ],
      afterRender(wrap, rows){
        wrap.querySelectorAll('.act-pay').forEach(btn=>{
          btn.addEventListener('click', ()=>{
            const invoiceId = btn.dataset.invoice;
            const custId = btn.dataset.customer;
            const row = rows.find(r=>r.invoice.id===invoiceId);
            if(!row) return;
            openPaymentModal(row.customer, row.invoice, row.pkg, row.extraCharge, row.totalPayable);
          });
        });
      }
    });
    const card = document.createElement('div'); card.className='card'; card.appendChild(table);
    tableSlot.appendChild(card);
}
 
btnTabHistory.addEventListener('click', showHistoryTab);
  btnTabPayment.addEventListener('click', showPaymentTab);
  showHistoryTab();
};
 
/* ========================================================================
   KEUANGAN MITRA — Unified View
   ======================================================================== */

function matchFilter(f, st){
  if(st.jenis && f.jenis !== st.jenis) return false;
  if(st.status && f.status !== st.status) return false;
  if(st.periode === 'tanggal' && st.tanggal && f.date !== st.tanggal) return false;
  if(st.periode === 'bulan' && st.bulan && f.date.slice(0,7) !== st.bulan) return false;
  if(st.periode === 'tahun' && st.tahun && f.date.slice(0,4) !== st.tahun) return false;
  return true;
}

function buildFilterPanel(cfg){
  const st = {jenis:'', periode:'tanggal', tanggal:'', bulan:'', tahun:'', status:''};
  const years = [...new Set(cfg.baseRows.map(r => cfg.getDate(r).slice(0,4)))].sort().reverse();

  const el = document.createElement('div');
  el.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;align-items:center;padding:12px 16px;border-bottom:1px solid var(--color-border);';
  el.innerHTML = `
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
      <span style="font-size:12.5px;font-weight:600;color:var(--color-text-secondary);">${cfg.jenisLabel}:</span>
      ${cfg.jenisOptions.map(o=>`<button type="button" class="btn btn-secondary btn-sm f-jenis" data-value="${o.value}">${o.label}</button>`).join('')}
    </div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
      <span style="font-size:12.5px;font-weight:600;color:var(--color-text-secondary);">Periode:</span>
      <select class="input f-periode" style="min-width:130px;">
        <option value="tanggal">Per Tanggal</option>
        <option value="bulan">Per Bulan</option>
        <option value="tahun">Per Tahun</option>
      </select>
      <input type="date" class="input f-tanggal" style="width:150px;">
      <input type="month" class="input f-bulan" style="width:150px;display:none;">
      <select class="input f-tahun" style="min-width:130px;display:none;">
        <option value="">Semua Tahun</option>
        ${years.map(y=>`<option value="${y}">${y}</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
      <span style="font-size:12.5px;font-weight:600;color:var(--color-text-secondary);">Status:</span>
      <select class="input f-status" style="min-width:140px;">
        <option value="">Semua Status</option>
        ${cfg.statusOptions.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}
      </select>
    </div>`;

  const btnList = [...el.querySelectorAll('.f-jenis')];
  const selPeriode = el.querySelector('.f-periode');
  const fTanggal = el.querySelector('.f-tanggal');
  const fBulan = el.querySelector('.f-bulan');
  const fTahun = el.querySelector('.f-tahun');
  const selStatus = el.querySelector('.f-status');

  function renderButtons(){
    btnList.forEach(b=>{
      const active = b.dataset.value === st.jenis;
      b.classList.toggle('btn-primary', active);
      b.classList.toggle('btn-secondary', !active);
    });
  }

  function togglePeriode(){
    fTanggal.style.display = selPeriode.value === 'tanggal' ? '' : 'none';
    fBulan.style.display = selPeriode.value === 'bulan' ? '' : 'none';
    fTahun.style.display = selPeriode.value === 'tahun' ? '' : 'none';
  }

  function collect(){
    st.periode = selPeriode.value;
    st.tanggal = fTanggal.value;
    st.bulan = fBulan.value;
    st.tahun = fTahun.value;
    st.status = selStatus.value;
  }
  function apply(){
    collect();
    cfg.onApply();
  }

  btnList.forEach(b=>{
    b.addEventListener('click', ()=>{
      if(st.jenis === b.dataset.value) st.jenis = '';
      else st.jenis = b.dataset.value;
      renderButtons();
      cfg.onApply();
    });
  });
  selPeriode.addEventListener('change', ()=>{ togglePeriode(); apply(); });
  fTanggal.addEventListener('change', apply);
  fBulan.addEventListener('change', apply);
  fTahun.addEventListener('change', apply);
  selStatus.addEventListener('change', apply);

  return {
    el,
    getState: ()=>st,
  };
}

Views['keuangan.mitra'] = function(root){
  const partnerId = CURRENT_USER.partner_id || 'PTR-0001';
  const partner = DB.partners.find(p => p.id === partnerId) || DB.partners[0];
 
  root.innerHTML = `
    ${pageIntro('Manajemen keuangan mitra: deposit kasir, settlement, dan monitoring payment gateway.')}
    <div class="subtabs" id="keuanganTabs">
      <button class="subtab active" data-tab="deposit">${ic('wallet')}Dashboard Deposit</button>
      <button class="subtab" data-tab="settlement">${ic('history')}Dashboard Settlement</button>
    </div>
    <div id="keuanganContent"></div>
  `;
 
  const content = root.querySelector('#keuanganContent');
  const tabs = root.querySelectorAll('#keuanganTabs .subtab');
 
  function renderDeposit(){
    let kpiHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Saldo Deposit Saat Ini', value:Fmt.rupiah(partner.deposit_balance), icon:'wallet', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'}
    ])}</div>`;
 
    // Sub-tabs for deposit
    let html = kpiHTML + `
      <div class="subtabs" style="margin-top:12px;">
        <button class="subtab active" data-subtab="history">${ic('history')}Riwayat Deposit</button>
        <button class="subtab" data-subtab="payment">${ic('check')}Pembayaran Customer</button>
        <button class="subtab" data-subtab="gateway">${ic('creditCard')}Histori Pembayaran</button>
      </div>
      <div id="depositSubContent"></div>
    `;
    content.innerHTML = html;
 
    // Sub-tab handlers
    const subTabs = content.querySelectorAll('.subtab[data-subtab]');
    const subContent = content.querySelector('#depositSubContent');
 
    function showDepositHistory(){
      subTabs.forEach(b=>b.classList.toggle('active', b.dataset.subtab==='history'));
      subContent.innerHTML = '';

      const fpanel = buildFilterPanel({
        jenisLabel: 'Jenis Transaksi',
        jenisOptions: [
          {value: 'Deposit Masuk', label: 'Deposit Masuk'},
          {value: 'Deposit Keluar', label: 'Deposit Keluar'},
        ],
        statusOptions: [
          {value: 'Berhasil', label: 'Berhasil'},
        ],
        baseRows: DB.depositHistory.filter(d => d.partner_id === partner.id),
        getDate: r => r.date,
        onApply: () => { if(table) table.refresh(); },
      });

      let table = DataTable({
        rows: () => DB.depositHistory.filter(d => d.partner_id === partner.id && matchFilter({jenis: d.type, status: d.status, date: d.date}, fpanel.getState())),
        rowKey: 'id',
        searchPlaceholder: 'Cari nomor transaksi / keterangan…',
        searchFields: ['ref', 'note'],
        columns: [
          {key:'ref', header:'Nomor Transaksi', sortable:true, render:r=>`<span class="cell-mono">${r.ref}</span>`},
          {key:'type', header:'Jenis Transaksi', sortable:true, render:r=>badge(r.type, r.type==='Deposit Masuk'?'green':'orange')},
          {key:'date', header:'Tanggal', sortable:true, render:r=>Fmt.date(r.date)},
          {key:'amount', header:'Nominal', sortable:true, align:'right', render:r=>`<span class="cell-num" style="color:${r.amount<0?'var(--badge-red-fg)':'var(--badge-green-fg)'}">${Fmt.rupiah(r.amount)}</span>`},
          {key:'balance_before', header:'Saldo Sebelum', align:'right', render:r=>Fmt.rupiah(r.balance_before)},
          {key:'balance_after', header:'Saldo Sesudah', align:'right', render:r=>Fmt.rupiah(r.balance_after)},
          {key:'note', header:'Keterangan', render:r=>`<span class="cell-secondary">${r.note}</span>`},
          {key:'status', header:'Status', render:r=>statusBadge(r.status)}
        ]
      });
      const card = document.createElement('div'); card.className = 'card';
      card.appendChild(fpanel.el);
      card.appendChild(table);
      subContent.appendChild(card);
    }
 
function showPaymentTab(){
      subTabs.forEach(b=>b.classList.toggle('active', b.dataset.subtab==='payment'));

      const customersWithInvoices = DB.customers
        .filter(c => c.partner_id === partner.id)
        .map(c => {
          const invoice = DB.invoices.find(i => i.customer_id === c.id);
          const pkg = DB.packages.find(p => p.id === c.package_id);
          if(!invoice) return null;
          let extraCharge = 0;
          if(partner.other_deductions && partner.other_deductions.length > 0){
            partner.other_deductions.forEach(d => {
              extraCharge += d.type === 'percentage' ? Math.round(invoice.billing_amount * (d.value / 100)) : d.value;
            });
          } else if(invoice.billing_status !== 'Lunas') {
            extraCharge = 5000;
          }
          const totalPayable = invoice.billing_amount + extraCharge;
          return { customer: c, invoice, pkg, extraCharge, totalPayable, status: invoice.billing_status === 'Lunas' ? 'Lunas' : 'Belum Dibayar' };
        })
        .filter(x => x !== null);

      subContent.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h3 style="margin:0;">Pembayaran Customer (Bulk)</h3>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" id="btnSelectAll">${ic('checkAll')} Pilih Semua</button>
            <button class="btn btn-primary" id="btnBulkPay" style="display:none;">${ic('check')} Bayar Terpilih (<span id="bulkCount">0</span>)</button>
          </div>
        </div>
        <div id="paymentTableSlot"></div>
      `;

      const tableSlot = subContent.querySelector('#paymentTableSlot');
      const btnSelectAll = subContent.querySelector('#btnSelectAll');
      const btnBulkPay = subContent.querySelector('#btnBulkPay');
      const bulkCount = subContent.querySelector('#bulkCount');

      const table = DataTable({
        rows: () => customersWithInvoices,
        rowKey: 'invoice.id',
        searchPlaceholder: 'Cari nama customer, PPPoE, atau paket…',
        searchFields: ['customer.customer_name', 'customer.pppoe_secret', 'pkg.package_name'],
        columns: [
          {key:'select', header:'<input type="checkbox" id="chkAll">', sortable:false, align:'center', render:r=> r.status === 'Lunas' ? '' : `<input type="checkbox" class="row-chk" data-invoice="${r.invoice.id}" data-customer="${r.customer.id}">`},
          {key:'customer.customer_name', header:'Nama Customer', sortable:true, render:r=>`<span class="cell-strong">${r.customer.customer_name}</span>`},
          {key:'customer.pppoe_secret', header:'PPPoE Secret', sortable:true, render:r=>`<span class="cell-mono">${r.customer.pppoe_secret}</span>`},
          {key:'pkg.package_name', header:'Paket', sortable:true, render:r=>r.pkg ? `${r.pkg.package_name} (${r.pkg.bandwidth})` : '-'},
          {key:'invoice.billing_period', header:'Periode', sortable:true},
          {key:'invoice.billing_amount', header:'Harga Paket (Termasuk Potongan)', sortable:true, align:'right', render:r=>Fmt.rupiah(r.invoice.billing_amount)},
          {key:'extraCharge', header:'Biaya Tambahan', align:'right', render:r=>Fmt.rupiah(r.extraCharge)},
          {key:'totalPayable', header:'Total Bayar', sortable:true, align:'right', render:r=>`<span class="cell-num" style="color:var(--color-accent);font-weight:700;">${Fmt.rupiah(r.totalPayable)}</span>`},
          {key:'status', header:'Status', sortable:true, render:r=>statusBadge(r.status)},
          {key:'actions', header:'', align:'right', render:r=> r.status === 'Lunas'
            ? `<span class="cell-secondary">Sudah bayar</span>`
            : `<button class="btn btn-primary btn-sm act-pay" data-invoice="${r.invoice.id}" data-customer="${r.customer.id}">${ic('check')} Bayar</button>`}
        ],
        afterRender(wrap, rows){
          // Header checkbox
          const chkAll = wrap.querySelector('#chkAll');
          if(chkAll){
            chkAll.addEventListener('change', ()=>{
              wrap.querySelectorAll('.row-chk').forEach(cb=>{ cb.checked = chkAll.checked; cb.dispatchEvent(new Event('change')); });
            });
          }
          // Row checkboxes
          wrap.querySelectorAll('.row-chk').forEach(cb=>{
            cb.addEventListener('change', ()=>{
              const checked = wrap.querySelectorAll('.row-chk:checked').length;
              bulkCount.textContent = checked;
              btnBulkPay.style.display = checked > 0 ? 'inline-flex' : 'none';
              btnSelectAll.textContent = checked === wrap.querySelectorAll('.row-chk').length ? ' Batal Pilih' : ' Pilih Semua';
            });
          });
          // Individual pay buttons
          wrap.querySelectorAll('.act-pay').forEach(btn=>{
            btn.addEventListener('click', ()=>{
              const invoiceId = btn.dataset.invoice;
              const custId = btn.dataset.customer;
              const row = rows.find(r=>r.invoice.id===invoiceId);
              if(!row) return;
              openPaymentModal(row.customer, row.invoice, row.pkg, row.extraCharge, row.totalPayable, partner);
            });
          });
        }
      });
      const card = document.createElement('div'); card.className='card'; card.appendChild(table);
      tableSlot.appendChild(card);

      // Bulk pay button
      btnBulkPay.addEventListener('click', ()=>{
        const checked = subContent.querySelectorAll('.row-chk:checked');
        if(checked.length === 0) return;
        const selectedRows = Array.from(checked).map(cb=>{
          const invoiceId = cb.dataset.invoice;
          return customersWithInvoices.find(r=>r.invoice.id===invoiceId);
        }).filter(Boolean);
        openBulkPaymentModal(selectedRows, partner);
      });

      // Select all button
      btnSelectAll.addEventListener('click', ()=>{
        const chkAll = subContent.querySelector('#chkAll');
        if(chkAll){
          chkAll.checked = !chkAll.checked;
          chkAll.dispatchEvent(new Event('change'));
        }
      });
    }
 
    function showGatewayTab(){
      subTabs.forEach(b=>b.classList.toggle('active', b.dataset.subtab==='gateway'));
      subContent.innerHTML = '';

      const fpanel = buildFilterPanel({
        jenisLabel: 'Jenis Transaksi',
        jenisOptions: [
          {value: 'Tunai/Kasir', label: 'Tunai/Kasir'},
          {value: 'Payment Gateway', label: 'Payment Gateway'},
        ],
        statusOptions: [
          {value: 'Berhasil', label: 'Berhasil'},
          {value: 'Pending', label: 'Pending'},
          {value: 'Gagal', label: 'Gagal'},
        ],
        baseRows: DB.payments,
        getDate: r => r.payment_date.slice(0,10),
        onApply: () => { if(table) table.refresh(); },
      });

      let table = DataTable({
        rows:()=>DB.payments.filter(p => matchFilter({jenis: p.virtual_account === 'TUNAI/KASIR' ? 'Tunai/Kasir' : 'Payment Gateway', status: p.payment_status, date: p.payment_date.slice(0,10)}, fpanel.getState())),
        rowKey:'id',
        searchPlaceholder:'Cari referensi, tagihan, atau nama pelanggan…',
        searchFields:['payment_reference'],
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
      const cardEl = document.createElement('div'); cardEl.className='card';
      cardEl.appendChild(fpanel.el);
      cardEl.appendChild(table);
      subContent.appendChild(cardEl);
    }
 
    subTabs.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if(btn.dataset.subtab==='history') showDepositHistory();
        else if(btn.dataset.subtab==='payment') showPaymentTab();
        else showGatewayTab();
      });
    });
    showDepositHistory();
  }
 
  function renderSettlement(){
    // Calculate stats
    const custIds = DB.customers.filter(c => c.partner_id === partner.id).map(c => c.id);
    const unsettledInvoices = DB.invoices.filter(i => custIds.includes(i.customer_id) && i.billing_status === 'Lunas' && i.settled === false);
    const gross = unsettledInvoices.reduce((s, i) => s + (i.total_paid || i.billing_amount), 0);
    let kso = 0;
    if(partner.kso_type === 'percentage'){
      kso = Math.round(gross * (partner.kso_value / 100));
    } else {
      kso = unsettledInvoices.length * (partner.kso_value || 0);
    }
    let pg_fee = 0;
    unsettledInvoices.forEach(inv => {
      const pay = DB.payments.find(p => p.invoice_id === inv.id && p.payment_status === 'Berhasil');
      if (pay && pay.virtual_account !== 'TUNAI/KASIR') pg_fee += 3000;
    });
    let other_deductions_val = 0;
    if(partner.other_deductions && partner.other_deductions.length > 0){
      partner.other_deductions.forEach(d => {
        if(d.type === 'percentage') other_deductions_val += Math.round(gross * (d.value / 100));
        else other_deductions_val += d.value * unsettledInvoices.length;
      });
    }
    const total_potongan = kso + pg_fee + other_deductions_val;
    const net = gross - total_potongan;
 
    let html = `<div id="kpiSlot">${renderKPIs([
      {label:'Pendapatan Kotor (Gross)', value:Fmt.rupiah(gross), icon:'wallet', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Potongan', value:Fmt.rupiah(total_potongan), icon:'minus', bg:'var(--badge-orange-bg)', fg:'var(--badge-orange-fg)', sub:`KSO + PG + Admin`},
      {label:'Pendapatan Bersih (Net)', value:Fmt.rupiah(net), icon:'checkCircle', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Saldo Siap Settlement', value:Fmt.rupiah(net), icon:'wallet', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)', sub:`${unsettledInvoices.length} transaksi`}
    ])}</div>`;
 
    html += `
      <div style="display:flex;justify-content:flex-end;margin:16px 0;">
        <button class="btn btn-primary" id="btnRequestSettlement">${ic('history')} Ajukan Pencairan Settlement</button>
      </div>
    `;
 
    // History table
    html += `<div class="section-head"><h3>Riwayat Settlement Mitra</h3></div>
      <div id="settlementTableSlot"></div>`;
 
    content.innerHTML = html;
 
    const tableSlot = content.querySelector('#settlementTableSlot');
    const table = DataTable({
      rows: () => DB.settlements.filter(s => s.partner_id === partner.id),
      rowKey: 'id',
      searchPlaceholder: 'Cari nomor settlement…',
      searchFields: ['ref'],
      columns: [
        {key:'ref', header:'Nomor Settlement', sortable:true, render:r=>`<span class="cell-mono">${r.ref}</span>`},
        {key:'period', header:'Periode', sortable:true},
        {key:'tx_count', header:'Jumlah Transaksi', sortable:true, align:'right'},
        {key:'gross_revenue', header:'Pendapatan Kotor', sortable:true, align:'right', render:r=>Fmt.rupiah(r.gross_revenue)},
        {key:'total_deduction', header:'Total Potongan', sortable:true, align:'right', render:r=>`<span style="color:var(--badge-red-fg);">${Fmt.rupiah(r.total_deduction)}</span>`},
        {key:'net_revenue', header:'Pendapatan Bersih', sortable:true, align:'right', render:r=>`<span class="cell-strong" style="color:var(--badge-green-fg);">${Fmt.rupiah(r.net_revenue)}</span>`},
        {key:'bank_account', header:'Rekening Tujuan', render:r=>`<span class="cell-secondary">${r.bank_account}</span>`},
        {key:'status', header:'Status', render:r=>statusBadge(r.status)},
        {key:'date', header:'Tanggal', sortable:true, render:r=>Fmt.date(r.date)},
        {key:'actions', header:'', align:'right', render:()=>`<button class="btn btn-ghost btn-sm act-detail">${ic('eye')}</button>`}
      ],
      afterRender(wrap, rows){
        wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
          const s = rows.find(r=>r.id===tr.dataset.id);
          tr.querySelector('.act-detail')?.addEventListener('click', ()=>{
            Modal.open({
              title:'Detail Settlement', subtitle:s.ref,
              bodyHTML:`<div class="detail-grid">
                <div class="detail-item"><span class="dl">Periode</span><span class="dv">${s.period}</span></div>
                <div class="detail-item"><span class="dl">Jumlah Transaksi</span><span class="dv">${s.tx_count}</span></div>
                <div class="detail-item"><span class="dl">Pendapatan Kotor</span><span class="dv">${Fmt.rupiah(s.gross_revenue)}</span></div>
                <div class="detail-item"><span class="dl">Total Potongan</span><span class="dv">${Fmt.rupiah(s.total_deduction)}</span></div>
                <div class="detail-item"><span class="dl">Pendapatan Bersih</span><span class="dv" style="font-weight:700;color:var(--badge-green-fg);">${Fmt.rupiah(s.net_revenue)}</span></div>
                <div class="detail-item"><span class="dl">Rekening Tujuan</span><span class="dv">${s.bank_account}</span></div>
                <div class="detail-item"><span class="dl">Status</span><span class="dv">${statusBadge(s.status)}</span></div>
                <div class="detail-item"><span class="dl">Tanggal Settlement</span><span class="dv">${Fmt.date(s.date)}</span></div>
              </div>`,
              footHTML:`<button class="btn btn-primary" id="mCloseSettlement">Tutup</button>`,
              onOpen(b,f){ f.querySelector('#mCloseSettlement').addEventListener('click', Modal.close); }
            });
          });
        });
      }
});
    const card = document.createElement('div'); card.className = 'card'; card.appendChild(table);
    tableSlot.appendChild(card);

    // Settlement modal handler - step 1: input nominal
root.addEventListener('click', function handleSettlementClick(e){
      const btn = e.target.closest('#btnRequestSettlement');
      if(btn){
        if(unsettledInvoices.length === 0) {
          toast('Tidak ada transaksi lunas yang siap dicairkan.');
          return;
        }
        // Step 1: simple modal to input withdrawal amount
        Modal.open({
          title:'Withdraw Settlement', subtitle:`Saldo tersedia: ${Fmt.rupiah(net)} (${unsettledInvoices.length} transaksi)`,
          bodyHTML:`<div class="detail-grid">
            <div class="detail-item"><span class="dl">Jumlah Transaksi</span><span class="dv">${unsettledInvoices.length}</span></div>
            <div class="detail-item"><span class="dl">Gross Revenue</span><span class="dv">${Fmt.rupiah(gross)}</span></div>
            <div class="detail-item"><span class="dl">Total Potongan</span><span class="dv" style="color:var(--badge-red-fg);">-${Fmt.rupiah(total_potongan)}</span></div>
            <div class="detail-item" style="font-weight:700;font-size:15px;color:var(--badge-green-fg);"><span class="dl">Laba Bersih (Net)</span><span class="dv">${Fmt.rupiah(net)}</span></div>
            <div class="detail-item" style="grid-column:1/-1;">
              <label style="font-size:12px;color:var(--color-text-secondary);display:block;margin-bottom:4px;">Nominal Withdraw (Rp)</label>
              <input type="number" id="withdrawAmount" class="input" style="width:100%;font-size:14px;" value="${net}" min="1000" max="${net}" step="1000">
              <div style="font-size:11px;color:var(--color-text-secondary);margin-top:4px;">Min Rp 1.000, Maks ${Fmt.rupiah(net)}</div>
            </div>
            <div class="detail-item" style="grid-column:1/-1;font-size:12px;color:var(--color-text-secondary);">
              Rekening: ${partner.bank_name} - ${partner.bank_account_no} a.n. ${partner.bank_account_name}
            </div>
          </div>`,
          footHTML:`<button class="btn btn-secondary" id="mCloseWithdraw">${ic('x')} Batal</button> <button class="btn btn-primary" id="mConfirmWithdraw">${ic('check')} Withdraw</button>`,
          onOpen(b, f){
            f.querySelector('#mCloseWithdraw').addEventListener('click', Modal.close);
            f.querySelector('#mConfirmWithdraw').addEventListener('click', () => {
              const amount = parseFloat(b.querySelector('#withdrawAmount').value) || 0;
              if(amount <= 0 || amount > net) {
                toast('Nominal tidak valid. Min Rp 1.000, maks ' + Fmt.rupiah(net));
                return;
              }
              // Process settlement
              const setRef = 'SET/2026/07/' + String(DB.settlements.length+1).padStart(4,'0');
              DB.settlements.push({
                id: nextId('SET'),
                partner_id: partner.id,
                ref: setRef,
                period: 'Juli 2026',
                tx_count: unsettledInvoices.length,
                gross_revenue: gross,
                total_deduction: total_potongan,
                net_revenue: amount,
                bank_account: `${partner.bank_name} - ${partner.bank_account_no}`,
                status: 'Selesai',
                date: new Date().toISOString().slice(0,10)
              });
              // Settle invoices FIFO
              let remaining = amount;
              for(const inv of unsettledInvoices) {
                const invoiceTotal = (inv.total_paid || inv.billing_amount) + (inv.extra_charge || 0);
                const alreadySettled = inv.settled_amount || 0;
                const canSettle = Math.min(invoiceTotal - alreadySettled, remaining);
                if(canSettle > 0) {
                  inv.settled_amount = alreadySettled + canSettle;
                  remaining -= canSettle;
                  if(inv.settled_amount >= invoiceTotal) inv.settled = true;
                }
                if(remaining <= 0) break;
              }
              pushActivity(CURRENT_USER.name, `mengajukan pencairan settlement ${setRef} sebesar ${Fmt.rupiah(amount)}`);
              Modal.close();
              // Step 2: show invoice modal
              openSettlementInvoiceModal(unsettledInvoices, partner, gross, total_potongan, amount, setRef);
            });
          }
        });
      }
    });
  }
 
  function renderPayment(){
    const today = DB.payments;
    const berhasil = today.filter(p=>p.payment_status==='Berhasil').length;
    const gagal = today.filter(p=>p.payment_status==='Gagal').length;
    const totalNilai = today.filter(p=>p.payment_status==='Berhasil').reduce((s,p)=>s+p.billing_amount,0);
 
    let html = `<div id="kpiSlot">${renderKPIs([
      {label:'Total Transaksi Hari Ini', value:today.length, icon:'creditCard', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Pembayaran Berhasil', value:berhasil, icon:'checkCircle', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Total Pembayaran Gagal', value:gagal, icon:'bolt', bg:'var(--badge-red-bg)', fg:'var(--badge-red-fg)'},
      {label:'Total Nilai Pembayaran Hari Ini', value:Fmt.rupiah(totalNilai), icon:'wallet', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'}
    ])}</div>`;
 
    html += `<div id="paymentTableSlot"></div>`;
    content.innerHTML = html;
 
    const tableSlot = content.querySelector('#paymentTableSlot');
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
    content.querySelector('#paymentTableSlot').appendChild(cardEl);
  }
 
// Tab switching
  function switchTab(tab){
    tabs.forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
    if(tab==='deposit') renderDeposit();
    else if(tab==='settlement') renderSettlement();
    else renderPayment();
  }

  // Listen for payment confirmation to refresh
  window.addEventListener('keuangan-refresh', () => {
    if(document.getElementById('keuanganTabs')) {
      const activeTab = root.querySelector('#keuanganTabs .subtab.active');
      if(activeTab && activeTab.dataset.tab === 'deposit') {
        renderDeposit();
      }
    }
  });

  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>switchTab(btn.dataset.tab));
  });

  // Default
  renderDeposit();
};
 
Views['settlement.dashboard'] = function(root){
  const partnerId = CURRENT_USER.partner_id || 'PTR-0001';
  const partner = DB.partners.find(p => p.id === partnerId) || DB.partners[0];

  root.innerHTML = `
    ${pageIntro('Informasi rekap hasil transaksi customer dalam satu periode settlement, pemotongan biaya, dan riwayat pencairan dana ke rekening settlement mitra.')}
    <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
      <button class="btn btn-primary" id="btnRequestSettlement">${ic('history')} Ajukan Pencairan Settlement</button>
    </div>
    <div id="kpiSlot"></div>
  `;

  const kpiSlot = root.querySelector('#kpiSlot');
  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  let unsettledInvoices = [];
  let gross = 0;
  let kso = 0;
  let pg_fee = 0;
  let other_deductions_val = 0;
  let total_potongan = 0;
  let net = 0;

  function calculateStats(){
    const custIds = DB.customers.filter(c => c.partner_id === partner.id).map(c => c.id);
    unsettledInvoices = DB.invoices.filter(i => custIds.includes(i.customer_id) && i.billing_status === 'Lunas' && i.settled === false);
    gross = unsettledInvoices.reduce((s, i) => s + (i.total_paid || i.billing_amount), 0);
    if(partner.kso_type === 'percentage'){
      kso = Math.round(gross * (partner.kso_value / 100));
    } else {
      kso = unsettledInvoices.length * (partner.kso_value || 0);
    }
    unsettledInvoices.forEach(inv => {
      const pay = DB.payments.find(p => p.invoice_id === inv.id && p.payment_status === 'Berhasil');
      if (pay && pay.virtual_account !== 'TUNAI/KASIR') {
        pg_fee += 3000;
      }
    });
    if(partner.other_deductions && partner.other_deductions.length > 0){
      partner.other_deductions.forEach(d => {
        if(d.type === 'percentage'){
          other_deductions_val += Math.round(gross * (d.value / 100));
        } else {
          other_deductions_val += d.value * unsettledInvoices.length;
        }
      });
    }
    total_potongan = kso + pg_fee + other_deductions_val;
    net = gross - total_potongan;
  }

  function renderDashboard(){
    calculateStats();
    kpiSlot.innerHTML = renderKPIs([
      {label:'Pendapatan Kotor (Gross)', value:Fmt.rupiah(gross), icon:'wallet', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Potongan', value:Fmt.rupiah(total_potongan), icon:'minus', bg:'var(--badge-orange-bg)', fg:'var(--badge-orange-fg)', sub:`KSO + PG + Admin`},
      {label:'Pendapatan Bersih (Net)', value:Fmt.rupiah(net), icon:'checkCircle', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Saldo Siap Settlement', value:Fmt.rupiah(net), icon:'wallet', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)', sub:`${unsettledInvoices.length} transaksi`}
    ]);

    tableMount.innerHTML = '';
    const table = DataTable({
      rows: () => DB.settlements.filter(s => s.partner_id === partner.id),
      rowKey: 'id',
      searchPlaceholder: 'Cari nomor settlement…',
      searchFields: ['ref'],
      columns: [
        {key:'ref', header:'Nomor Settlement', sortable:true, render:r=>`<span class="cell-mono">${r.ref}</span>`},
        {key:'period', header:'Periode', sortable:true},
        {key:'tx_count', header:'Jumlah Transaksi', sortable:true, align:'right'},
        {key:'gross_revenue', header:'Pendapatan Kotor', sortable:true, align:'right', render:r=>Fmt.rupiah(r.gross_revenue)},
        {key:'total_deduction', header:'Total Potongan', sortable:true, align:'right', render:r=>`<span style="color:var(--badge-red-fg);">${Fmt.rupiah(r.total_deduction)}</span>`},
        {key:'net_revenue', header:'Pendapatan Bersih', sortable:true, align:'right', render:r=>`<span class="cell-strong" style="color:var(--badge-green-fg);">${Fmt.rupiah(r.net_revenue)}</span>`},
        {key:'bank_account', header:'Rekening Tujuan', render:r=>`<span class="cell-secondary">${r.bank_account}</span>`},
        {key:'status', header:'Status', render:r=>statusBadge(r.status)},
        {key:'date', header:'Tanggal', sortable:true, render:r=>Fmt.date(r.date)},
        {key:'actions', header:'', align:'right', render:()=>`<button class="btn btn-ghost btn-sm act-detail">${ic('eye')}</button>`}
      ],
      afterRender(wrap, rows){
        wrap.querySelectorAll('tbody tr[data-id]').forEach(tr=>{
          const s = rows.find(r=>r.id===tr.dataset.id);
          tr.querySelector('.act-detail')?.addEventListener('click', ()=>{
            Modal.open({
              title:'Detail Settlement', subtitle:s.ref,
              bodyHTML:`<div class="detail-grid">
                <div class="detail-item"><span class="dl">Periode</span><span class="dv">${s.period}</span></div>
                <div class="detail-item"><span class="dl">Jumlah Transaksi</span><span class="dv">${s.tx_count}</span></div>
                <div class="detail-item"><span class="dl">Pendapatan Kotor</span><span class="dv">${Fmt.rupiah(s.gross_revenue)}</span></div>
                <div class="detail-item"><span class="dl">Total Potongan</span><span class="dv">${Fmt.rupiah(s.total_deduction)}</span></div>
                <div class="detail-item"><span class="dl">Pendapatan Bersih</span><span class="dv" style="font-weight:700;color:var(--badge-green-fg);">${Fmt.rupiah(s.net_revenue)}</span></div>
                <div class="detail-item"><span class="dl">Rekening Tujuan</span><span class="dv">${s.bank_account}</span></div>
                <div class="detail-item"><span class="dl">Status</span><span class="dv">${statusBadge(s.status)}</span></div>
                <div class="detail-item"><span class="dl">Tanggal Settlement</span><span class="dv">${Fmt.date(s.date)}</span></div>
              </div>`,
              footHTML:`<button class="btn btn-primary" id="mCloseSettlement">Tutup</button>`,
              onOpen(b,f){ f.querySelector('#mCloseSettlement').addEventListener('click', Modal.close); }
            });
          });
        });
      }
    });

    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `<div class="section-head"><h3>Riwayat Settlement Mitra</h3></div>`;
    card.appendChild(table);
    tableMount.appendChild(card);
  }

function openSettlementModal(unsettledInvoices, partner){
  // Calculate totals
  const gross = unsettledInvoices.reduce((s, i) => s + (i.total_paid || i.billing_amount), 0);
  let kso = 0;
  if(partner.kso_type === 'percentage'){
    kso = Math.round(gross * (partner.kso_value / 100));
  } else {
    kso = unsettledInvoices.length * (partner.kso_value || 0);
  }
  let pg_fee = 0;
  unsettledInvoices.forEach(inv => {
    const pay = DB.payments.find(p => p.invoice_id === inv.id && p.payment_status === 'Berhasil');
    if (pay && pay.virtual_account !== 'TUNAI/KASIR') pg_fee += 3000;
  });
  let other_deductions_val = 0;
  if(partner.other_deductions && partner.other_deductions.length > 0){
    partner.other_deductions.forEach(d => {
      if(d.type === 'percentage') other_deductions_val += Math.round(gross * (d.value / 100));
      else other_deductions_val += d.value * unsettledInvoices.length;
    });
  }
  const total_potongan = kso + pg_fee + other_deductions_val;
  const net = gross - total_potongan;

  // Build invoice rows with detailed breakdown
  let invoiceRows = '';
  let totalKSO = 0, totalPgFee = 0, totalAdmin = 0;
  unsettledInvoices.forEach((inv, idx) => {
    const packagePrice = inv.billing_amount;
    let ksoAmt = 0, pgFee = 0, adminFee = 0, otherDed = 0;
    if(partner.kso_type === 'percentage'){
      ksoAmt = Math.round(packagePrice * (partner.kso_value / 100));
    } else {
      ksoAmt = partner.kso_value || 0;
    }
    const pay = DB.payments.find(p => p.invoice_id === inv.id && p.payment_status === 'Berhasil');
    if (pay && pay.virtual_account !== 'TUNAI/KASIR') pgFee = 3000;
    if(partner.other_deductions && partner.other_deductions.length > 0){
      partner.other_deductions.forEach(d => {
        if(d.type === 'percentage'){
          adminFee += Math.round(packagePrice * (d.value / 100));
        } else {
          adminFee += d.value;
        }
      });
    } else if(inv.extra_charge > 0) {
      adminFee = inv.extra_charge;
    }

    const netInv = packagePrice + inv.extra_charge - (ksoAmt + pgFee + adminFee);

invoiceRows += `
      <div style="border:1px solid var(--color-border);border-radius:8px;padding:12px;margin-bottom:8px;background:var(--color-background-muted);">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-weight:600;">
          <span>${idx+1}. ${inv.customer_name || 'Customer'}</span>
          <span class="cell-mono">${inv.invoice_number}</span>
        </div>
        <div style="font-size:13px;color:var(--color-text-secondary);margin-bottom:8px;">
          Paket: ${inv.package_name || 'Paket'} | Periode: ${inv.billing_period}
        </div>
        <table style="width:100%;font-size:12px;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:var(--color-text-secondary);">Harga Paket (Termasuk Potongan)</td><td style="padding:4px 0;text-align:right;font-weight:600;">${Fmt.rupiah(packagePrice)}</td></tr>
          <tr><td style="padding:4px 0;color:var(--color-text-secondary);">Biaya Tambahan</td><td style="padding:4px 0;text-align:right;">${Fmt.rupiah(inv.extra_charge || 0)}</td></tr>
          <tr style="border-top:1px solid var(--color-border);"><td style="padding:4px 0;font-weight:600;">Total Bayar</td><td style="padding:4px 0;text-align:right;font-weight:700;color:var(--color-accent);">${Fmt.rupiah(inv.total_paid || packagePrice + inv.extra_charge)}</td></tr>
        </table>
        <div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--color-border);font-size:12px;color:var(--color-text-secondary);">
          <strong>Rincian Potongan (Konseptual):</strong><br>
          KSO: ${Fmt.rupiah(ksoAmt)} | PG Fee: ${Fmt.rupiah(pgFee)} | Admin: ${Fmt.rupiah(adminFee)} | Lainnya: ${Fmt.rupiah(otherDed)}<br>
          <em>Catatan: Harga paket di atas sudah termasuk potongan yang disepakati. Rincian di atas untuk referensi perhitungan laba bersih.</em>
        </div>
      </div>
    `;
  });
  let pgFeeSum = 0;
  unsettledInvoices.forEach(inv => {
    const pay = DB.payments.find(p => p.invoice_id === inv.id && p.payment_status === 'Berhasil');
    if (pay && pay.virtual_account !== 'TUNAI/KASIR') pgFeeSum += 3000;
});
  let adminSum = 0;
  if(partner.other_deductions && partner.other_deductions.length > 0){
    partner.other_deductions.forEach(d => {
      if(d.type === 'percentage') adminSum += Math.round(gross * (d.value / 100));
      else adminSum += d.value * unsettledInvoices.length;
    });
  }
  const settlementTotalPotongan = totalKSO + pgFeeSum + adminSum;
  const settlementNetAmount = gross - settlementTotalPotongan;

  Modal.open({
    title:'Ajukan Pencairan Settlement', subtitle:`Saldo tersedia: ${Fmt.rupiah(settlementNetAmount)} (Laba Bersih ${unsettledInvoices.length} transaksi)`,
    bodyHTML:`<div style="max-height:70vh;overflow-y:auto;">
      <div class="detail-grid" style="margin-bottom:16px;">
        <div class="detail-item"><span class="dl">Jumlah Transaksi</span><span class="dv">${unsettledInvoices.length} transaksi</span></div>
        <div class="detail-item"><span class="dl">Gross Revenue (Total Harga Paket)</span><span class="dv">${Fmt.rupiah(gross)}</span></div>
        <div class="detail-item"><span class="dl">Total Potongan</span><span class="dv" style="color:var(--badge-red-fg);">-${Fmt.rupiah(settlementTotalPotongan)}</span></div>
        <div class="detail-item" style="font-weight:700;font-size:15px;color:var(--badge-green-fg);"><span class="dl">Laba Bersih (Net)</span><span class="dv">${Fmt.rupiah(settlementNetAmount)}</span></div>
      </div>
      <div style="border-top:1px solid var(--color-border);padding-top:12px;margin-bottom:12px;">
        <strong style="font-size:13px;">Rincian Potongan:</strong>
        <div style="margin-top:8px;font-size:13px;color:var(--color-text-secondary);">
          KSO: ${Fmt.rupiah(totalKSO)} | PG Fee: ${Fmt.rupiah(pgFeeSum)} | Admin/Lainnya: ${Fmt.rupiah(adminSum)}
        </div>
        <div style="margin-top:12px;font-size:12px;color:var(--color-text-secondary);"><em>Catatan: Harga paket di atas sudah termasuk potongan. Rincian di atas untuk referensi perhitungan laba bersih.</em></div>
      </div>
      <div style="border-top:1px solid var(--color-border);padding-top:12px;margin-bottom:12px;">
        <strong style="font-size:13px;">Rincian Per Transaksi:</strong>
        <div style="margin-top:8px;">${invoiceRows}</div>
      </div>
      <div style="border-top:1px solid var(--color-border);padding-top:12px;margin-bottom:12px;">
        <div class="detail-grid">
          <div class="detail-item"><span class="dl">Nominal Pencairan (Rp)</span><span class="dv">
            <input type="number" id="settleAmount" class="input" style="width:100%;font-size:14px;" value="${netAmount}" min="1000" max="${netAmount}" step="1000">
            <div style="font-size:11px;color:var(--color-text-secondary);margin-top:4px;">Minimal Rp 1.000. Maksimal ${Fmt.rupiah(netAmount)}</div>
          </span></div>
          <div class="detail-item" style="grid-column:1/-1;font-size:12px;color:var(--color-text-secondary);">
            Rekening tujuan: ${partner.bank_name} - ${partner.bank_account_no} a.n. ${partner.bank_account_name}
          </div>
        </div>
      </div>
    </div>`,
    footHTML:`<button class="btn btn-secondary" id="mCloseSettle">${ic('x')} Batal</button> <button class="btn btn-primary" id="mConfirmSettle">${ic('check')} Ajukan Pencairan</button>`,
    onOpen(b, f){
      f.querySelector('#mCloseSettle').addEventListener('click', Modal.close);
      f.querySelector('#mConfirmSettle').addEventListener('click', () => {
        const amount = parseFloat(f.querySelector('#settleAmount').value) || 0;
        if(amount <= 0 || amount > settlementNetAmount) {
          toast('Nominal tidak valid. Minimal Rp 1.000, maksimal ' + Fmt.rupiah(settlementNetAmount));
          return;
        }
        const setRef = 'SET/2026/07/' + String(DB.settlements.length+1).padStart(4,'0');
        DB.settlements.push({
          id: nextId('SET'),
          partner_id: partner.id,
          ref: setRef,
          period: 'Juli 2026',
          tx_count: unsettledInvoices.length,
          gross_revenue: gross,
          total_deduction: settlementTotalPotongan,
          net_revenue: amount,
          bank_account: `${partner.bank_name} - ${partner.bank_account_no}`,
          status: 'Selesai',
          date: new Date().toISOString().slice(0,10)
        });
        if(amount === settlementNetAmount) {
          unsettledInvoices.forEach(inv => { inv.settled = true; });
        }
        pushActivity(CURRENT_USER.name, `mengajukan pencairan settlement ${setRef} sebesar ${Fmt.rupiah(amount)}`);
        toast('Pencairan settlement berhasil diajukan!');
        renderSettlement();
        Modal.close();
      });
    }
  });
}

function openSettlementInvoiceModal(unsettledInvoices, partner, gross, totalPotongan, amount, setRef){
  let invoiceRows = '';
  unsettledInvoices.forEach((inv, idx) => {
    const pkg = DB.packages.find(p => p.id === inv.package_id);
    const cust = DB.customers.find(c => c.id === inv.customer_id);
    const paketPrice = inv.billing_amount;
    let ksoAmt = 0, adminFee = 0;
    if(partner.kso_type === 'percentage') ksoAmt = Math.round(paketPrice * (partner.kso_value / 100));
    else ksoAmt = partner.kso_value || 0;
    const pgFee = (DB.payments.find(p => p.invoice_id === inv.id && p.payment_status === 'Berhasil')?.virtual_account !== 'TUNAI/KASIR') ? 3000 : 0;
    if(partner.other_deductions && partner.other_deductions.length > 0){
      partner.other_deductions.forEach(d => {
        if(d.type === 'percentage') adminFee += Math.round(paketPrice * (d.value / 100));
        else adminFee += d.value;
      });
    }
    invoiceRows += `
      <div style="border:1px solid var(--color-border);border-radius:8px;padding:12px;margin-bottom:8px;background:var(--color-background-muted);">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-weight:600;">
          <span>${idx+1}. ${custName(inv.customer_id)}</span>
          <span class="cell-mono">${inv.invoice_number}</span>
        </div>
        <div style="font-size:13px;color:var(--color-text-secondary);margin-bottom:8px;">
          Paket: ${pkg ? pkg.package_name + ' (' + pkg.bandwidth + ')' : '-'} | Periode: ${inv.billing_period}
        </div>
        <table style="width:100%;font-size:12px;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:var(--color-text-secondary);">Harga Paket (Termasuk Potongan)</td><td style="padding:4px 0;text-align:right;font-weight:600;">${Fmt.rupiah(paketPrice)}</td></tr>
          <tr><td style="padding:4px 0;color:var(--color-text-secondary);">KSO</td><td style="padding:4px 0;text-align:right;color:var(--badge-red-fg);">-${Fmt.rupiah(ksoAmt)}</td></tr>
          <tr><td style="padding:4px 0;color:var(--color-text-secondary);">PG Fee</td><td style="padding:4px 0;text-align:right;color:var(--badge-red-fg);">-${Fmt.rupiah(pgFee)}</td></tr>
          <tr><td style="padding:4px 0;color:var(--color-text-secondary);">Admin / Lainnya</td><td style="padding:4px 0;text-align:right;color:var(--badge-red-fg);">-${Fmt.rupiah(adminFee)}</td></tr>
          <tr style="border-top:1px solid var(--color-border);"><td style="padding:4px 0;font-weight:600;">Laba Bersih (Net)</td><td style="padding:4px 0;text-align:right;font-weight:700;color:var(--badge-green-fg);">${Fmt.rupiah(paketPrice - ksoAmt - pgFee - adminFee)}</td></tr>
        </table>
      </div>
    `;
  });
  Modal.open({
    title:'Invoice Withdrawal', subtitle:`${setRef} · ${Fmt.rupiah(amount)}`,
    bodyHTML:`<div style="max-height:70vh;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;padding:12px;border:2px solid var(--badge-green-fg);border-radius:11px;margin-bottom:16px;background:var(--badge-green-bg);">
        <div><strong>Total Withdraw</strong><br><span style="font-size:11px;color:var(--color-text-secondary);">${setRef} · ${Fmt.date(new Date())}</span></div>
        <div style="font-size:18px;font-weight:700;color:var(--badge-green-fg);">${Fmt.rupiah(amount)}</div>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><span class="dl">Periode</span><span class="dv">Juli 2026</span></div>
        <div class="detail-item"><span class="dl">Jumlah Transaksi</span><span class="dv">${unsettledInvoices.length}</span></div>
        <div class="detail-item"><span class="dl">Gross Revenue</span><span class="dv">${Fmt.rupiah(gross)}</span></div>
        <div class="detail-item"><span class="dl">Total Potongan</span><span class="dv" style="color:var(--badge-red-fg);">-${Fmt.rupiah(totalPotongan)}</span></div>
        <div class="detail-item" style="font-weight:700;font-size:15px;color:var(--badge-green-fg);"><span class="dl">Net Revenue (Withdraw)</span><span class="dv">${Fmt.rupiah(amount)}</span></div>
        <div class="detail-item" style="grid-column:1/-1;font-size:12px;color:var(--color-text-secondary);border-top:1px solid var(--color-border);padding-top:8px;">
          Rekening tujuan: ${partner.bank_name} - ${partner.bank_account_no} a.n. ${partner.bank_account_name}
        </div>
      </div>
      <div style="border-top:1px solid var(--color-border);padding-top:12px;margin-top:12px;">
        <strong style="font-size:13px;">Rincian Per Transaksi:</strong>
        <div style="margin-top:8px;">${invoiceRows}</div>
      </div>
    </div>`,
    footHTML:`<button class="btn btn-primary" id="mCloseInvoice">${ic('check')} Tutup & Selesai</button>`,
    onOpen(b, f){
      f.querySelector('#mCloseInvoice').addEventListener('click', ()=>{
        Modal.close();
        renderSettlement();
      });
    }
  });
}

  content.addEventListener('click', function handleSettlementClick(e){
    const btn = e.target.closest('#btnRequestSettlement');
    if(btn){
      if(unsettledInvoices.length === 0) {
        toast('Tidak ada transaksi lunas yang siap dicairkan.');
        return;
      }
      Modal.open({
        title:'Withdraw Settlement', subtitle:`Saldo tersedia: ${Fmt.rupiah(net)} (${unsettledInvoices.length} transaksi)`,
        bodyHTML:`<div class="detail-grid">
          <div class="detail-item"><span class="dl">Jumlah Transaksi</span><span class="dv">${unsettledInvoices.length}</span></div>
          <div class="detail-item"><span class="dl">Gross Revenue</span><span class="dv">${Fmt.rupiah(gross)}</span></div>
          <div class="detail-item"><span class="dl">Total Potongan</span><span class="dv" style="color:var(--badge-red-fg);">-${Fmt.rupiah(total_potongan)}</span></div>
          <div class="detail-item" style="font-weight:700;font-size:15px;color:var(--badge-green-fg);"><span class="dl">Laba Bersih (Net)</span><span class="dv">${Fmt.rupiah(net)}</span></div>
          <div class="detail-item" style="grid-column:1/-1;">
            <label style="font-size:12px;color:var(--color-text-secondary);display:block;margin-bottom:4px;">Nominal Withdraw (Rp)</label>
            <input type="number" id="withdrawAmount" class="input" style="width:100%;font-size:14px;" value="${net}" min="1000" max="${net}" step="1000">
            <div style="font-size:11px;color:var(--color-text-secondary);margin-top:4px;">Min Rp 1.000, Maks ${Fmt.rupiah(net)}</div>
          </div>
          <div class="detail-item" style="grid-column:1/-1;font-size:12px;color:var(--color-text-secondary);">
            Rekening: ${partner.bank_name} - ${partner.bank_account_no} a.n. ${partner.bank_account_name}
          </div>
        </div>`,
        footHTML:`<button class="btn btn-secondary" id="mCloseWithdraw2">${ic('x')} Batal</button> <button class="btn btn-primary" id="mConfirmWithdraw2">${ic('check')} Withdraw</button>`,
        onOpen(b, f){
          f.querySelector('#mCloseWithdraw2').addEventListener('click', Modal.close);
          f.querySelector('#mConfirmWithdraw2').addEventListener('click', () => {
            const amount = parseFloat(b.querySelector('#withdrawAmount').value) || 0;
            if(amount <= 0 || amount > net) {
              toast('Nominal tidak valid. Min Rp 1.000, maks ' + Fmt.rupiah(net));
              return;
            }
            const setRef = 'SET/2026/07/' + String(DB.settlements.length+1).padStart(4,'0');
            DB.settlements.push({
              id: nextId('SET'),
              partner_id: partner.id,
              ref: setRef,
              period: 'Juli 2026',
              tx_count: unsettledInvoices.length,
              gross_revenue: gross,
              total_deduction: total_potongan,
              net_revenue: amount,
              bank_account: `${partner.bank_name} - ${partner.bank_account_no}`,
              status: 'Selesai',
              date: new Date().toISOString().slice(0,10)
            });
            // Settle invoices FIFO
            let remaining = amount;
            for(const inv of unsettledInvoices) {
              const invoiceTotal = (inv.total_paid || inv.billing_amount) + (inv.extra_charge || 0);
              const alreadySettled = inv.settled_amount || 0;
              const canSettle = Math.min(invoiceTotal - alreadySettled, remaining);
              if(canSettle > 0) {
                inv.settled_amount = alreadySettled + canSettle;
                remaining -= canSettle;
                if(inv.settled_amount >= invoiceTotal) inv.settled = true;
              }
              if(remaining <= 0) break;
            }
            pushActivity(CURRENT_USER.name, `mengajukan pencairan settlement ${setRef} sebesar ${Fmt.rupiah(amount)}`);
            Modal.close();
            openSettlementInvoiceModal(unsettledInvoices, partner, gross, total_potongan, amount, setRef);
          });
        }
      });
    }
  });

  renderDashboard();
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
  root.innerHTML = pageIntro('Monitoring layanan pelanggan — status ONU, redaman OLT, dan kendali layanan (isolir/aktivasi).');
  root.insertAdjacentHTML('beforeend', `<div id="kpiSlot"></div>`);

  function kpis(){
    const online = DB.radius.filter(r=>r.olt_status==='Online').length;
    const isolir = DB.radius.filter(r=>r.customer_status==='Isolir').length;
    const active = DB.radius.filter(r=>r.customer_status==='Active').length;
    root.querySelector('#kpiSlot').outerHTML = `<div id="kpiSlot">${renderKPIs([
      {label:'Total ONU Online', value:online, icon:'wifi', bg:'var(--badge-green-bg)', fg:'var(--badge-green-fg)'},
      {label:'Total Isolir', value:isolir, icon:'bolt', bg:'var(--badge-orange-bg)', fg:'var(--badge-orange-fg)'},
      {label:'Total Pelanggan Aktif', value:active, icon:'checkCircle', bg:'var(--badge-blue-bg)', fg:'var(--badge-blue-fg)'},
      {label:'Total Pelanggan', value:DB.customers.length, icon:'users', bg:'var(--badge-purple-bg)', fg:'var(--badge-purple-fg)'},
    ])}</div>`;
  }
  kpis();

  const tableMount = document.createElement('div');
  root.appendChild(tableMount);

  function odpName(cust){
    if(!cust || !cust.olt_odp_id) return '-';
    const found = findOdpNode(cust.olt_odp_id);
    return found ? found.node.label : '-';
  }

  const table = DataTable({
    rows:()=>DB.radius,
    rowKey:'id',
    searchPlaceholder:'Cari nama, PPPoE, atau No ONU…',
    searchFields:['customer_name','pppoe_secret','onu_number'],
    filters:[
      {key:'status', label:'Semua Status Berlangganan', options:[{value:'Active',label:'Aktif'},{value:'Isolir',label:'Isolir'},{value:'Terminate',label:'Terminate'},{value:'Unregistered',label:'Unregistered'}], match:(r,v)=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return c?c.customer_status===v:false; }},
      {key:'olt', label:'Semua Status OLT', options:[{value:'Online',label:'Online'},{value:'Offline',label:'Offline'},{value:'Isolir',label:'Isolir'}], match:(r,v)=>r.olt_status===v},
    ],
    columns:[
      {key:'name', header:'Nama', sortable:true, sortValue:r=>custName(r.customer_id), render:r=>`<span class="cell-strong">${custName(r.customer_id)}</span>`},
      {key:'pppoe', header:'Customer ID (PPPoE)', sortable:true, sortValue:r=>{const c=DB.customers.find(x=>x.id===r.customer_id); return c?c.pppoe_secret:'';}, render:r=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return `<span class="cell-mono">${c?c.pppoe_secret:'-'}</span>`; }},
      {key:'onu', header:'No ONU', sortable:true, sortValue:r=>{const c=DB.customers.find(x=>x.id===r.customer_id); return c?c.onu_number:'';}, render:r=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return `<span class="cell-mono">${c&&c.onu_number?c.onu_number:'-'}</span>`; }},
      {key:'customer_status', header:'Status Berlangganan', sortable:true, render:r=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return c?statusBadge(c.customer_status):statusBadge(r.customer_status); }},
      {key:'subscribe', header:'Start Subscribe', sortable:true, sortValue:r=>{const c=DB.customers.find(x=>x.id===r.customer_id); return c?c.subscribe_date:'';}, render:r=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return `<span class="cell-secondary">${c?Fmt.date(c.subscribe_date):'-'}</span>`; }},
      {key:'odp', header:'ODP', render:r=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return odpName(c); }},
      {key:'port', header:'Port Access', render:r=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return c&&c.access_port?`<span class="cell-mono">${c.access_port}</span>`:'-'; }},
      {key:'olt_rx_regist', header:'OLT RX Regist', render:r=>{ const c=DB.customers.find(x=>x.id===r.customer_id); return c&&c.olt_rx_register!=null?`<span class="cell-mono">${c.olt_rx_register} dBm</span>`:'-'; }},
      {key:'olt_rx_now', header:'OLT RX Now', render:r=>r.olt_rx_now!=null?`<span class="cell-mono">${r.olt_rx_now} dBm</span>`:'-'},
      {key:'olt_status', header:'Status OLT', sortable:true, render:r=>statusBadge(r.olt_status)},
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
    const canIsolir = c && c.customer_status !== 'Terminate' && c.customer_type !== 'Fasum' && r.radius_status !== 'Isolir';
    const canActivate = r.radius_status === 'Isolir';
    Modal.open({
      title:custName(r.customer_id), subtitle:`${c?.pppoe_secret||'-'} · ${partnerName(c?.partner_id)}`,
      bodyHTML:`<div class="detail-grid">
        <div class="detail-item"><span class="dl">Nama / PPPoE</span><span class="dv">${custName(r.customer_id)} · <span class="cell-mono">${c?.pppoe_secret||'-'}</span></span></div>
        <div class="detail-item"><span class="dl">No ONU</span><span class="dv" style="font-family:var(--font-family-mono);">${c?.onu_number||'-'}</span></div>
        <div class="detail-item"><span class="dl">Paket Layanan</span><span class="dv">${pkgName(c?.package_id)}</span></div>
        <div class="detail-item"><span class="dl">Bandwidth Aktif</span><span class="dv">${r.bandwidth}</span></div>
        <div class="detail-item"><span class="dl">ODP</span><span class="dv">${odpName(c)}</span></div>
        <div class="detail-item"><span class="dl">Port Access</span><span class="dv">${c?.access_port||'-'}</span></div>
        <div class="detail-item"><span class="dl">Status Berlangganan</span><span class="dv">${c?statusBadge(c.customer_status):statusBadge(r.customer_status)}</span></div>
        <div class="detail-item"><span class="dl">Start Subscribe</span><span class="dv">${c?Fmt.date(c.subscribe_date):'-'}</span></div>
        <div class="detail-item"><span class="dl">OLT RX Regist</span><span class="dv">${c&&c.olt_rx_register!=null?c.olt_rx_register+' dBm':'-'}</span></div>
        <div class="detail-item"><span class="dl">OLT RX Now</span><span class="dv">${r.olt_rx_now!=null?r.olt_rx_now+' dBm':'-'}</span></div>
        <div class="detail-item"><span class="dl">Status OLT</span><span class="dv">${statusBadge(r.olt_status)}</span></div>
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
          r.radius_status='Isolir'; r.customer_status='Isolir'; r.olt_status='Isolir'; r.isolation_date=new Date().toISOString().slice(0,10); r.last_update=new Date().toISOString();
          if(c) c.customer_status='Isolir';
          pushActivity('Radius Control Gateway', `mengisolir layanan pelanggan ${custName(r.customer_id)}`);
          toast('Layanan pelanggan berhasil diisolir'); Modal.close(); kpis(); table.refresh();
        });
        f.querySelector('#mActivate')?.addEventListener('click', ()=>{
          r.radius_status='Online'; r.customer_status='Active'; r.olt_status='Online'; r.activation_date=new Date().toISOString().slice(0,10); r.last_update=new Date().toISOString();
          if(c) c.customer_status='Active';
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
    const odpBadge = node.isOdp ? `<span class="badge badge-cyan" style="font-size:10px;margin-left:6px;">ODP</span>` : '';
    const meta = node.type==='output' ? `${node.connected}/${node.capacity}` : (node.type==='input' ? `${node.connected||0}/${node.capacity||'?'} · ${(node.children||[]).length} output` : `${(node.children||[]).length} input`);
    return `
      <div class="tree-node">
        <div class="tree-row ${selectedId===node.id?'selected':''}" data-node="${node.id}">
          <span class="tree-toggle ${hasChildren && isOpen ? 'rot':''}" data-toggle="${node.id}">${hasChildren?ic('chevronRight'):''}</span>
          <span class="tree-ico" style="background:${bg};color:${fg};">${ic(ico)}</span>
          <span class="tree-label">${node.label}${odpBadge}</span>
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
        <h3 style="margin:0 0 4px 0;font-size:14.5px;">${node.label}${node.isOdp?` ${badge('ODP','cyan')}`:''}</h3>
        <p style="margin:0 0 14px 0;font-size:12.5px;color:var(--color-text-secondary);">${node.isOdp?'ODP — melayani pelanggan langsung':'Splitter ujung'}</p>
        <div class="detail-grid" style="margin-bottom:14px;">
          <div class="detail-item"><span class="dl">${node.isOdp?'Rasio ODP':'Jenis Splitter'}</span><span class="dv">${node.isOdp?'1:'+node.capacity:'Output 1:'+node.capacity}</span></div>
          <div class="detail-item"><span class="dl">Status</span><span class="dv">${statusBadge(node.status)}</span></div>
          <div class="detail-item"><span class="dl">Kapasitas Terpakai</span><span class="dv">${node.connected}/${node.capacity}</span></div>
          <div class="detail-item"><span class="dl">Alamat</span><span class="dv">${node.address||'-'}</span></div>
        </div>
        <div class="cap-bar" style="width:100%;height:8px;margin-bottom:16px;"><span style="width:${node.connected/node.capacity*100}%;background:${node.connected>=node.capacity?'var(--badge-red-fg)':'var(--color-accent)'}"></span></div>
        <div class="field-row">
          <div class="field"><label>Latitude</label><input class="input" id="pLat" type="number" step="0.0001" value="${node.lat||0}"></div>
          <div class="field"><label>Longitude</label><input class="input" id="pLng" type="number" step="0.0001" value="${node.lng||0}"></div>
        </div>
        <div class="map-placeholder" style="margin-bottom:14px;">${ic('mapPin','pin')}<span>Lokasi ${node.isOdp?'ODP':'splitter'} di peta</span><span style="font-family:var(--font-family-mono);font-size:11px;">${node.lat||0}, ${node.lng||0}</span></div>
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
        <h3 style="margin:0 0 4px 0;font-size:14.5px;">${node.label}${node.isOdp?` ${badge('ODP','cyan')}`:''}</h3>
        <p style="margin:0 0 14px 0;font-size:12.5px;color:var(--color-text-secondary);">${node.isOdp?'ODP — langsung ke pelanggan, tidak bisa ditambahi Output Splitter':`Terhubung ke ${node.olt} · ${(node.children||[]).length} output splitter`}</p>
        <div class="detail-grid" style="margin-bottom:14px;">
          <div class="detail-item"><span class="dl">${node.isOdp?'Rasio':'Jenis Splitter'}</span><span class="dv">${node.isOdp?'1:'+node.capacity:'Input 1:'+node.capacity}</span></div>
          ${node.isOdp?'':`<div class="detail-item"><span class="dl">Total Output</span><span class="dv">${(node.children||[]).length} unit</span></div>
          <div class="detail-item"><span class="dl">Kapasitas Total</span><span class="dv">${inputCapacity} port</span></div>
          <div class="detail-item"><span class="dl">Port Terpakai</span><span class="dv">${inputConnected}/${inputCapacity}</span></div>`}
          <div class="detail-item"><span class="dl">Alamat</span><span class="dv">${node.address||'-'}</span></div>
        </div>
        ${!node.isOdp && inputCapacity > 0 ? `<div class="cap-bar" style="width:100%;height:8px;margin-bottom:16px;"><span style="width:${inputConnected/inputCapacity*100}%;background:${inputConnected>=inputCapacity?'var(--badge-red-fg)':'var(--color-accent)'}"></span></div>` : ''}
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
        ]))}
        <div class="field"><label class="checkbox-label"><input type="checkbox" id="e_odp" ${node.isOdp?'checked':''}> Jadikan sebagai ODP (langsung ke pelanggan)</label></div>`;
    } else {
      title = 'Edit Output Splitter';
      bodyHTML = `
        ${fieldsHTML([{label:'Nama Output Splitter', id:'e_name', value:node.label}])}
        ${rowWrap(fieldsHTML([
          {label:'Kapasitas', id:'e_cap', type:'select', value:String(node.capacity), options:[{value:'2',label:'Splitter 1:2'},{value:'8',label:'ODP 1:8'},{value:'16',label:'ODP 1:16'}]},
          {label:'Status', id:'e_status', type:'select', value:node.status, options:[{value:'Aktif',label:'Aktif'},{value:'Penuh',label:'Penuh'}]},
        ]))}
        ${fieldsHTML([{label:'Alamat / Keterangan', id:'e_addr', type:'textarea', value:node.address, placeholder:'Alamat lokasi ODP'}])}
        ${rowWrap(fieldsHTML([
          {label:'Latitude', id:'e_lat', type:'number', value:node.lat||0},
          {label:'Longitude', id:'e_lng', type:'number', value:node.lng||0},
        ]))}
        <div class="field"><label class="checkbox-label"><input type="checkbox" id="e_odp" ${node.isOdp?'checked':''}> Jadikan sebagai ODP (langsung ke pelanggan)</label></div>`;
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
            const isOdp = document.getElementById('e_odp')?.checked || false;
            if(isOdp && (node.children||[]).length > 0){ toast('Tidak bisa jadikan ODP — Input Splitter masih memiliki Output Splitter turunan'); return; }
            node.isOdp = isOdp;
          } else {
            node.capacity = parseInt(document.getElementById('e_cap').value,10);
            node.status = document.getElementById('e_status').value;
            node.isOdp = document.getElementById('e_odp')?.checked || false;
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
        <div class="field"><label class="checkbox-label"><input type="checkbox" id="n_inp_odp"> Jadikan sebagai ODP (langsung ke pelanggan)</label></div>
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
          const isOdp = document.getElementById('n_inp_odp')?.checked || false;
          const newInput = {id:nextId('SPL'), type:'input', label:name, olt:oltNode.label, capacity:cap, connected:0, isOdp, address:val('n_inp_addr'), lat:parseFloat(val('n_inp_lat'))||0, lng:parseFloat(val('n_inp_lng'))||0, children:[]};
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
      const inputs = allInputSplitters(oltId).filter(i=>!i.isOdp);
      return inputs.length ? inputs.map(i=>({value:i.id,label:i.label})) : [{value:'',label:'-- Belum ada Input Splitter --'}];
    }
    Modal.open({
      title:'Tambah Output Splitter', subtitle:'Tambahkan Output Splitter baru pada Input Splitter terpilih',
      bodyHTML:`
        ${fieldsHTML([{label:'Nama Output Splitter', id:'n_out_name', placeholder:'ODP 1:8 — RT 05'}])}
        ${fieldsHTML([{label:'Port OLT Induk', id:'n_out_olt', type:'select', options:DB.infrastructure.map(o=>({value:o.id,label:`${o.label} (${o.olt_type})`}))}])}
        ${fieldsHTML([{label:'Input Splitter Induk', id:'n_out_parent', type:'select', options:inputOpts(DB.infrastructure[0]?.id||'')}])}
        ${fieldsHTML([{label:'Kapasitas', id:'n_out_cap', type:'select', options:[{value:'2',label:'Splitter 1:2'},{value:'8',label:'ODP 1:8'},{value:'16',label:'ODP 1:16'}]}])}
        ${fieldsHTML([{label:'Alamat / Keterangan', id:'n_out_addr', type:'textarea', placeholder:'Alamat lokasi ODP'}])}
        ${rowWrap(fieldsHTML([
          {label:'Latitude', id:'n_out_lat', type:'number', value:'-6.2'},
          {label:'Longitude', id:'n_out_lng', type:'number', value:'106.8'},
        ]))}
        <div class="field"><label class="checkbox-label"><input type="checkbox" id="n_out_odp" checked> Jadikan sebagai ODP (langsung ke pelanggan)</label></div>
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
          const isOdp = document.getElementById('n_out_odp')?.checked || false;
          const newNode = {id:nextId('SPL'), type:'output', label:name, lat:parseFloat(val('n_out_lat'))||0, lng:parseFloat(val('n_out_lng'))||0, isOdp, address:val('n_out_addr'), capacity:cap, connected:0, status:'Aktif'};
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
 
// Ensure global availability
window.openSettlementModal = openSettlementModal;


