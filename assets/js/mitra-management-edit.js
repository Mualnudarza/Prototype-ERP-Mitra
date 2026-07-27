(function () {
  const id = AppUtils.qs("id");
  const isEdit = !!id;
  let current = null;

  const els = {
    pageTitle: document.getElementById("page-title"),
    pageHeading: document.getElementById("page-heading"),
    pageSub: document.getElementById("page-subheading"),
    crumbCurrent: document.getElementById("crumb-current"),
    statusActions: document.getElementById("status-actions"),
    form: document.getElementById("mitra-form"),
    btnSave: document.getElementById("btn-save"),
    activityCard: document.getElementById("activity-card"),
    activityList: document.getElementById("activity-list"),
    modalRoot: document.getElementById("modal-root"),
    coverageSection: document.getElementById("coverage-section"),
    coverageBody: document.getElementById("coverage-body"),
    covName: document.getElementById("f-cov-name"),
    covOlt: document.getElementById("f-cov-olt"),
    btnAddCoverage: document.getElementById("btn-add-coverage"),
  };

  const fields = {
    code: document.getElementById("f-code"),
    name: document.getElementById("f-name"),
    legalName: document.getElementById("f-legal-name"),
    pic: document.getElementById("f-pic"),
    phone: document.getElementById("f-phone"),
    email: document.getElementById("f-email"),
    status: document.getElementById("f-status"),
    agreementName: document.getElementById("f-agreement-name"),
    agreementNumber: document.getElementById("f-agreement-number"),
    agreementStart: document.getElementById("f-agreement-start"),
    agreementEnd: document.getElementById("f-agreement-end"),
    agreementDocument: document.getElementById("f-agreement-document"),
    businessType: document.getElementById("f-business-type"),
    taxId: document.getElementById("f-tax-id"),
    commission: document.getElementById("f-commission"),
    mitraNeeds: document.getElementById("f-mitra-needs"),
    bankName: document.getElementById("f-bank-name"),
    bankAccNum: document.getElementById("f-bank-account-number"),
    bankAccName: document.getElementById("f-bank-account-name"),
    dueType: document.getElementById("f-due-type"),
    dueValue: document.getElementById("f-due-value"),
  };

  function confirmModal({ title, message, confirmText, danger }) {
    return new Promise(resolve => {
      els.modalRoot.innerHTML = `
        <div class="modal-overlay"><div class="modal-box">
          <h3>${title}</h3><p>${message}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="modal-cancel">Batal</button>
            <button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="modal-confirm">${confirmText}</button>
          </div>
        </div></div>`;
      document.getElementById("modal-cancel").onclick = () => { els.modalRoot.innerHTML = ""; resolve(false); };
      document.getElementById("modal-confirm").onclick = () => { els.modalRoot.innerHTML = ""; resolve(true); };
    });
  }

  function renderStatusActions() {
    if (!isEdit || !current) { els.statusActions.innerHTML = ""; return; }
    let html = "";
    if (current.status === "Aktif") {
      html += `<button class="btn btn-secondary btn-sm" id="btn-deactivate">Nonaktifkan</button>`;
    } else {
      html += `<button class="btn btn-primary btn-sm" id="btn-activate">Aktifkan</button>`;
    }
    els.statusActions.innerHTML = html;
    const deactivateBtn = document.getElementById("btn-deactivate");
    if (deactivateBtn) deactivateBtn.addEventListener("click", async () => {
      const ok = await confirmModal({ title:"Nonaktifkan Mitra?", message:`Mitra ${current.name} akan dinonaktifkan. Mitra nonaktif tidak dapat membuat customer baru.`, confirmText:"Ya, Nonaktifkan", danger:true });
      if (ok) { MitraDB.setStatus(current.id, "Nonaktif"); AppUtils.toast("Mitra berhasil dinonaktifkan.", "success"); reload(); }
    });
    const activateBtn = document.getElementById("btn-activate");
    if (activateBtn) activateBtn.addEventListener("click", async () => {
      const ok = await confirmModal({ title:"Aktifkan Mitra?", message:`Mitra ${current.name} akan diaktifkan kembali.`, confirmText:"Ya, Aktifkan" });
      if (ok) { MitraDB.setStatus(current.id, "Aktif"); AppUtils.toast("Mitra berhasil diaktifkan.", "success"); reload(); }
    });
  }

  function renderActivity() {
    if (!isEdit || !current) { els.activityCard.style.display = "none"; return; }
    const logs = (current.activity_log || []).slice().reverse();
    els.activityList.innerHTML = logs.map(a => `
      <li class="activity-item">
        <span class="activity-dot"></span>
        <div class="activity-body">
          <div class="act-title">${AppUtils.escapeHtml(a.action)}</div>
          <div class="act-detail">${AppUtils.escapeHtml(a.detail)}</div>
          <div class="act-time">${AppUtils.formatDateTime(a.timestamp)} · ${AppUtils.escapeHtml(a.actor)}</div>
        </div>
      </li>`).join("");
  }

  function renderCoverage() {
    if (!isEdit || !current) { els.coverageSection.style.display = "none"; return; }
    const cov = current.coverage_areas || [];
    if (cov.length === 0) {
      els.coverageBody.innerHTML = `<tr class="empty-row"><td colspan="4">Belum ada coverage area. Tambahkan minimal satu agar Mitra dapat registrasi customer.</td></tr>`;
    } else {
      els.coverageBody.innerHTML = cov.map(c => `
        <tr>
          <td class="cell-strong">${AppUtils.escapeHtml(c.name)}</td>
          <td>${AppUtils.escapeHtml(c.olt_name || "-")}</td>
          <td><span class="badge ${c.status === "Aktif" ? "badge-active" : "badge-terminate"}">${AppUtils.escapeHtml(c.status)}</span></td>
          <td><button type="button" class="btn btn-danger btn-sm btn-del-cov" data-id="${c.id}">Hapus</button></td>
        </tr>
      `).join("");
    }
    els.coverageBody.querySelectorAll(".btn-del-cov").forEach(btn => {
      btn.addEventListener("click", async () => {
        const ok = await confirmModal({ title:"Hapus Coverage Area?", message:"Coverage area akan dihapus dari Mitra ini. Customer existing tidak otomatis berpindah.", confirmText:"Ya, Hapus", danger:true });
        if (ok) {
          MitraDB.removeCoverage(current.id, btn.dataset.id);
          AppUtils.toast("Coverage area dihapus.", "success");
          reload();
        }
      });
    });
  }

  if (els.btnAddCoverage) {
    els.btnAddCoverage.addEventListener("click", () => {
      if (!isEdit || !current) { AppUtils.toast("Simpan Mitra terlebih dahulu sebelum menambah coverage.", "danger"); return; }
      const name = els.covName.value.trim();
      if (!name) { AppUtils.toast("Nama coverage wajib diisi.", "danger"); return; }
      try {
        MitraDB.addCoverage(current.id, { name, olt_name: els.covOlt.value.trim() || "-" });
        els.covName.value = ""; els.covOlt.value = "";
        AppUtils.toast("Coverage area ditambahkan.", "success");
        reload();
      } catch (err) { AppUtils.toast(err.message, "danger"); }
    });
  }

  function fillForm(m) {
    fields.code.value = m.code || "";
    fields.name.value = m.name || "";
    fields.legalName.value = m.legal_name || "";
    fields.pic.value = m.pic_name || "";
    fields.phone.value = m.phone || "";
    fields.email.value = m.email || "";
    fields.status.value = m.status || "Aktif";
    fields.agreementName.value = m.agreement_name || "";
    fields.agreementNumber.value = m.agreement_number || "";
    fields.agreementStart.value = m.agreement_start || "";
    fields.agreementEnd.value = m.agreement_end || "";
    fields.agreementDocument.value = m.agreement_document || "";
    fields.businessType.value = m.business_type || "Reseller";
    fields.taxId.value = m.tax_id || "";
    fields.commission.value = m.commission_scheme || "";
    fields.mitraNeeds.value = m.mitra_needs || "";
    fields.bankName.value = m.bank_name || "";
    fields.bankAccNum.value = m.bank_account_number || "";
    fields.bankAccName.value = m.bank_account_name || "";
    if (m.default_due_date_rule) { fields.dueType.value = m.default_due_date_rule.type || "fixed_day"; fields.dueValue.value = m.default_due_date_rule.value || ""; }
  }

  function reload() {
    if (isEdit) {
      current = MitraDB.getById(id);
      if (!current) { AppUtils.toast("Data Mitra tidak ditemukan.", "danger"); window.location.href = "index.html"; return; }
      els.pageTitle.textContent = `Edit ${current.name} · Dasaria ERP`;
      els.pageHeading.textContent = `Edit Mitra — ${current.name}`;
      els.pageSub.textContent = "Perbarui data Mitra, rekening, dan konfigurasi jatuh tempo.";
      els.crumbCurrent.textContent = current.name;
      fillForm(current);
      renderStatusActions();
      renderActivity();
      renderCoverage();
    } else {
      els.activityCard.style.display = "none";
      els.coverageSection.style.display = "none";
    }
  }

  els.form.addEventListener("submit", e => {
    e.preventDefault();
    if (fields.agreementStart.value && fields.agreementEnd.value && fields.agreementEnd.value < fields.agreementStart.value) {
      AppUtils.toast("Tanggal berakhir tidak boleh sebelum mulai berlaku.", "danger");
      return;
    }
    const payload = {
      code: fields.code.value.trim().toUpperCase(),
      name: fields.name.value.trim(),
      legal_name: fields.legalName.value.trim(),
      pic_name: fields.pic.value.trim(),
      phone: fields.phone.value.trim(),
      email: fields.email.value.trim(),
      status: fields.status.value,
      agreement_name: fields.agreementName.value.trim(),
      agreement_number: fields.agreementNumber.value.trim(),
      agreement_start: fields.agreementStart.value,
      agreement_end: fields.agreementEnd.value,
      agreement_document: fields.agreementDocument.value.trim(),
      business_type: fields.businessType.value,
      tax_id: fields.taxId.value.trim(),
      commission_scheme: fields.commission.value.trim(),
      mitra_needs: fields.mitraNeeds.value.trim(),
      bank_name: fields.bankName.value.trim(),
      bank_account_number: fields.bankAccNum.value.trim(),
      bank_account_name: fields.bankAccName.value.trim(),
      default_due_date_rule: { type: fields.dueType.value, value: fields.dueValue.value.trim() },
    };
    try {
      if (isEdit) { MitraDB.update(current.id, payload); AppUtils.toast("Data Mitra berhasil diperbarui.", "success"); reload(); }
      else { const created = MitraDB.create(payload); AppUtils.toast("Mitra baru berhasil dibuat.", "success"); window.location.href = `edit.html?id=${created.id}`; }
    } catch (err) { AppUtils.toast(err.message, "danger"); }
  });

  reload();
})();
