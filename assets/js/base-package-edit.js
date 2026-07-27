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
  };

  const fields = {
    name: document.getElementById("f-name"),
    bandwidthDown: document.getElementById("f-bandwidth-down"),
    bandwidthUp: document.getElementById("f-bandwidth-up"),
    basePrice: document.getElementById("f-base-price"),
    radiusProfile: document.getElementById("f-radius-profile"),
    status: document.getElementById("f-status"),
  };

  function reload() {
    if (isEdit) {
      const current = BasePackageDB.getById(id);
      if (!current) { AppUtils.toast("Paket dasar tidak ditemukan.", "danger"); window.location.href = "index.html"; return; }
      els.pageTitle.textContent = `Edit ${current.name} · Dasaria ERP`;
      els.pageHeading.textContent = `Edit Paket Dasar — ${current.name}`;
      els.pageSub.textContent = "Perbarui data paket dasar ISP.";
      els.crumbCurrent.textContent = current.name;
      fields.name.value = current.name;
      fields.bandwidthDown.value = current.bandwidth_down;
      fields.bandwidthUp.value = current.bandwidth_up || "";
      fields.basePrice.value = current.base_price;
      fields.radiusProfile.value = current.radius_profile_name;
      fields.status.value = current.status;
    }
  }

  els.form.addEventListener("submit", e => {
    e.preventDefault();
    const payload = {
      name: fields.name.value.trim(),
      bandwidth_down: Number(fields.bandwidthDown.value),
      bandwidth_up: Number(fields.bandwidthUp.value) || 0,
      base_price: Number(fields.basePrice.value),
      radius_profile_name: fields.radiusProfile.value.trim(),
      status: fields.status.value,
    };
    if (payload.bandwidth_down <= 0) { AppUtils.toast("Bandwidth download harus > 0.", "danger"); return; }
    if (payload.base_price < 0) { AppUtils.toast("Harga dasar tidak boleh negatif.", "danger"); return; }
    if (!payload.radius_profile_name) { AppUtils.toast("Radius profile wajib diisi.", "danger"); return; }
    try {
      if (isEdit) { BasePackageDB.update(id, payload); AppUtils.toast("Paket dasar berhasil diperbarui.", "success"); }
      else { BasePackageDB.create(payload); AppUtils.toast("Paket dasar berhasil dibuat.", "success"); }
      window.location.href = "index.html";
    } catch (err) { AppUtils.toast(err.message, "danger"); }
  });

  reload();
})();
