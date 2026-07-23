(function () {
  const id = AppUtils.qs("id");
  const isEdit = !!id;

  const els = {
    pageTitle: document.getElementById("page-title"),
    pageHeading: document.getElementById("page-heading"),
    pageSub: document.getElementById("page-subheading"),
    crumbCurrent: document.getElementById("crumb-current"),
    form: document.getElementById("package-form"),
    btnSave: document.getElementById("btn-save"),
    activityCard: document.getElementById("activity-card"),
    activityList: document.getElementById("activity-list"),
  };

  const fields = {
    code: document.getElementById("f-code"),
    name: document.getElementById("f-name"),
    bandwidth: document.getElementById("f-bandwidth"),
    price: document.getElementById("f-price"),
    status: document.getElementById("f-status"),
  };

  function formatPrice(n) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  }

  function renderActivity(logs) {
    els.activityList.innerHTML = logs.slice().reverse().map((a) => `
      <li class="activity-item">
        <span class="activity-dot"></span>
        <div class="activity-body">
          <div class="act-title">${AppUtils.escapeHtml(a.action)}</div>
          <div class="act-detail">${AppUtils.escapeHtml(a.detail)}</div>
          <div class="act-time">${AppUtils.formatDateTime(a.timestamp)} · ${AppUtils.escapeHtml(a.actor)}</div>
        </div>
      </li>
    `).join("");
  }

  function fillForm(p) {
    fields.code.value = p.package_code;
    fields.name.value = p.package_name;
    fields.bandwidth.value = p.bandwidth;
    fields.price.value = p.selling_price;
    fields.status.value = p.package_status;
  }

  function reload() {
    if (isEdit) {
      const pkg = ServiceDB.getById(id);
      if (!pkg) { AppUtils.toast("Paket tidak ditemukan.", "danger"); window.location.href = "packages.html"; return; }
      els.pageTitle.textContent = `Edit ${pkg.package_name} · Dasaria ERP`;
      els.pageHeading.textContent = `Edit Paket Layanan — ${pkg.package_name}`;
      els.pageSub.textContent = "Perbarui informasi paket layanan. Setiap perubahan tercatat pada Activity Log.";
      els.crumbCurrent.textContent = pkg.package_name;
      fillForm(pkg);
      renderActivity(pkg.activity_log);
    } else {
      els.pageTitle.textContent = "Tambah Paket Layanan · Dasaria ERP";
      els.pageHeading.textContent = "Tambah Paket Layanan Baru";
      els.pageSub.textContent = "Lengkapi data paket layanan yang akan ditawarkan kepada pelanggan.";
      els.crumbCurrent.textContent = "Tambah Paket";
      els.activityCard.style.display = "none";
    }
  }

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = {
      package_code: fields.code.value.trim(),
      package_name: fields.name.value.trim(),
      bandwidth: fields.bandwidth.value.trim(),
      selling_price: Number(fields.price.value),
      package_status: fields.status.value,
    };
    if (!payload.package_code || !payload.package_name || !payload.bandwidth) { AppUtils.toast("Semua field wajib diisi.", "danger"); return; }
    if (!payload.selling_price || payload.selling_price < 0) { AppUtils.toast("Harga jual harus valid.", "danger"); return; }
    try {
      if (isEdit) { ServiceDB.update(id, payload); AppUtils.toast("Paket layanan berhasil diperbarui.", "success"); }
      else { ServiceDB.create(payload); AppUtils.toast("Paket layanan berhasil ditambahkan.", "success"); }
      window.location.href = "packages.html";
    } catch (err) { AppUtils.toast(err.message, "danger"); }
  });

  reload();
})();
