(function () {
  const id = AppUtils.qs("id");
  if (!id) { AppUtils.toast("Parameter pelanggan tidak ditemukan.", "danger"); window.location.href = "customer-packages.html"; return; }

  const customer = CustomerDB.getById(id);
  if (!customer) { AppUtils.toast("Data pelanggan tidak ditemukan.", "danger"); window.location.href = "customer-packages.html"; return; }

  const els = {
    form: document.getElementById("change-form"),
    currentPppoe: document.getElementById("current-pppoe"),
    currentName: document.getElementById("current-name"),
    currentPackage: document.getElementById("current-package"),
    newPackage: document.getElementById("new-package"),
    effectiveDate: document.getElementById("effective-date"),
    activityCard: document.getElementById("activity-card"),
    activityList: document.getElementById("activity-list"),
  };

  els.currentPppoe.textContent = customer.pppoe_secret;
  els.currentName.textContent = customer.customer_name;
  els.currentPackage.textContent = customer.package_name;
  els.effectiveDate.value = new Date().toISOString().slice(0, 10);

  ServiceDB.activeOptions().forEach((p) => {
    if (p.package_name !== customer.package_name) {
      const opt = document.createElement("option");
      opt.value = p.package_name;
      opt.textContent = `${p.package_name} — ${p.bandwidth} — Rp${new Intl.NumberFormat("id-ID").format(p.selling_price)}`;
      els.newPackage.appendChild(opt);
    }
  });

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
  renderActivity(customer.activity_log);

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newPkg = els.newPackage.value;
    const effectiveDate = els.effectiveDate.value;
    if (!newPkg) { AppUtils.toast("Pilih paket layanan baru.", "danger"); return; }
    if (!effectiveDate) { AppUtils.toast("Tanggal berlaku wajib diisi.", "danger"); return; }
    try {
      CustomerDB.update(id, { ...customer, package_name: newPkg, subscribe_date: effectiveDate });
      AppUtils.toast(`Paket ${customer.customer_name} berhasil diubah ke ${newPkg}.`, "success");
      window.location.href = "customer-packages.html";
    } catch (err) { AppUtils.toast(err.message, "danger"); }
  });
})();
