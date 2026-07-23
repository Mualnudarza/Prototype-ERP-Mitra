(function () {
  const id = AppUtils.qs("id");
  const isEdit = !!id;
  let current = null;

  const els = {
    pageTitle: document.getElementById("page-title"),
    pageHeading: document.getElementById("page-heading"),
    pageSub: document.getElementById("page-subheading"),
    crumbCurrent: document.getElementById("crumb-current"),
    customerIdLine: document.getElementById("customer-id-line"),
    statusActions: document.getElementById("status-actions"),
    form: document.getElementById("customer-form"),
    btnSave: document.getElementById("btn-save"),
    packageSelect: document.getElementById("f-package"),
    techToggle: document.getElementById("toggle-tech-access"),
    lockNote: document.getElementById("lock-note"),
    mapFrame: document.getElementById("map-frame"),
    coordRow: document.getElementById("coord-row"),
    historyCard: document.getElementById("history-card"),
    activityCard: document.getElementById("activity-card"),
    packageHistory: document.getElementById("package-history"),
    addressHistory: document.getElementById("address-history"),
    activityList: document.getElementById("activity-list"),
    modalRoot: document.getElementById("modal-root"),
  };

  const fields = {
    name: document.getElementById("f-name"),
    phone: document.getElementById("f-phone"),
    subscribe: document.getElementById("f-subscribe"),
    expired: document.getElementById("f-expired"),
    address: document.getElementById("f-address"),
    pppoe: document.getElementById("f-pppoe"),
    modem: document.getElementById("f-modem"),
    lat: document.getElementById("f-lat"),
    lng: document.getElementById("f-lng"),
    olt: document.getElementById("f-olt"),
    onu: document.getElementById("f-onu"),
    access: document.getElementById("f-access"),
    accessPort: document.getElementById("f-access-port"),
  };

  const TECH_FIELD_IDS = ["field-pppoe", "field-modem", "field-olt", "field-onu", "field-access", "field-access-port"];
  const TECH_INPUTS = [fields.pppoe, fields.modem, fields.olt, fields.onu, fields.access, fields.accessPort];

  /* ---------- populate package options ---------- */
  CustomerDB.PACKAGES.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    els.packageSelect.appendChild(opt);
  });

  /* ---------- technical access toggle (Rule #11) ---------- */
  els.techToggle.addEventListener("change", () => {
    const unlocked = els.techToggle.checked;
    TECH_INPUTS.forEach((inp) => (inp.disabled = !unlocked));
    els.lockNote.textContent = unlocked
      ? "🔓 Akses teknis aktif — field teknis dapat diubah."
      : '🔒 Aktifkan "Akses Teknis" di atas untuk mengubah field teknis.';
  });

  /* ---------- map ---------- */
  function updateMap() {
    const lat = fields.lat.value.trim();
    const lng = fields.lng.value.trim();
    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      els.mapFrame.src = `https://www.google.com/maps?q=${lat},${lng}&hl=id&z=16&output=embed`;
      els.mapFrame.style.display = "block";
      els.coordRow.innerHTML = `<span>Lat: <b>${AppUtils.escapeHtml(lat)}</b></span><span>Long: <b>${AppUtils.escapeHtml(lng)}</b></span>`;
    } else {
      els.mapFrame.style.display = "none";
      els.coordRow.innerHTML = `<span>Isi Latitude &amp; Longitude untuk menampilkan peta.</span>`;
    }
  }
  fields.lat.addEventListener("input", AppUtils.debounce(updateMap, 400));
  fields.lng.addEventListener("input", AppUtils.debounce(updateMap, 400));

  /* ---------- modal confirm ---------- */
  function confirmModal({ title, message, confirmText, danger }) {
    return new Promise((resolve) => {
      els.modalRoot.innerHTML = `
        <div class="modal-overlay">
          <div class="modal-box">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-actions">
              <button class="btn btn-secondary" id="modal-cancel">Batal</button>
              <button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="modal-confirm">${confirmText}</button>
            </div>
          </div>
        </div>`;
      document.getElementById("modal-cancel").onclick = () => {
        els.modalRoot.innerHTML = "";
        resolve(false);
      };
      document.getElementById("modal-confirm").onclick = () => {
        els.modalRoot.innerHTML = "";
        resolve(true);
      };
    });
  }

  /* ---------- render status action buttons ---------- */
  function renderStatusActions() {
    if (!isEdit || !current) {
      els.statusActions.innerHTML = "";
      return;
    }
    const s = current.customer_status;
    let html = "";
    if (s === CustomerDB.STATUS.ACTIVE) {
      html += `<button class="btn btn-secondary btn-sm" id="btn-suspend">Suspend Pelanggan</button>`;
      html += `<button class="btn btn-danger btn-sm" id="btn-terminate">Terminate</button>`;
    } else if (s === CustomerDB.STATUS.ISOLIR) {
      html += `<button class="btn btn-primary btn-sm" id="btn-reactivate">Aktifkan Kembali</button>`;
      html += `<button class="btn btn-danger btn-sm" id="btn-terminate">Terminate</button>`;
    } else {
      html += `<span class="badge badge-terminate">Diarsipkan · Tidak dapat diubah statusnya</span>`;
    }
    els.statusActions.innerHTML = html;

    const suspendBtn = document.getElementById("btn-suspend");
    if (suspendBtn) {
      suspendBtn.addEventListener("click", async () => {
        const ok = await confirmModal({
          title: "Suspend Pelanggan?",
          message: `Layanan ${current.customer_name} akan dihentikan sementara (Isolir). Data pelanggan tidak dihapus.`,
          confirmText: "Ya, Suspend",
          danger: false,
        });
        if (ok) {
          CustomerDB.suspend(current.id);
          AppUtils.toast("Pelanggan berhasil di-suspend (Isolir).", "success");
          reload();
        }
      });
    }
    const reactivateBtn = document.getElementById("btn-reactivate");
    if (reactivateBtn) {
      reactivateBtn.addEventListener("click", async () => {
        const ok = await confirmModal({
          title: "Aktifkan Kembali?",
          message: `Status ${current.customer_name} akan dikembalikan menjadi Active.`,
          confirmText: "Ya, Aktifkan",
          danger: false,
        });
        if (ok) {
          CustomerDB.reactivate(current.id);
          AppUtils.toast("Pelanggan berhasil diaktifkan kembali.", "success");
          reload();
        }
      });
    }
    const terminateBtn = document.getElementById("btn-terminate");
    if (terminateBtn) {
      terminateBtn.addEventListener("click", async () => {
        const ok = await confirmModal({
          title: "Terminasi Pelanggan?",
          message: `Layanan ${current.customer_name} akan dihentikan permanen. Data tetap tersimpan sebagai arsip.`,
          confirmText: "Ya, Terminate",
          danger: true,
        });
        if (ok) {
          CustomerDB.terminate(current.id);
          AppUtils.toast("Pelanggan berhasil diterminasi.", "success");
          reload();
        }
      });
    }
  }

  /* ---------- render histories ---------- */
  function renderHistories() {
    if (!isEdit || !current) {
      els.historyCard.style.display = "none";
      return;
    }
    els.packageHistory.innerHTML =
      `<div class="cell-muted mb-0" style="margin-bottom:6px;">Paket:</div>` +
      current.package_history
        .slice()
        .reverse()
        .map(
          (h) =>
            `<span class="history-chip"><b>${AppUtils.escapeHtml(h.package_name)}</b> · ${AppUtils.formatDate(h.changed_at)}</span>`
        )
        .join("");
    els.addressHistory.innerHTML =
      `<div class="cell-muted mb-0" style="margin:8px 0 6px;">Alamat:</div>` +
      current.address_history
        .slice()
        .reverse()
        .map(
          (h) =>
            `<span class="history-chip">${AppUtils.escapeHtml(h.address)} · ${AppUtils.formatDate(h.changed_at)}</span>`
        )
        .join("");
  }

  /* ---------- render activity log ---------- */
  function renderActivity() {
    if (!isEdit || !current) {
      els.activityCard.style.display = "none";
      return;
    }
    const logs = current.activity_log.slice().reverse();
    els.activityList.innerHTML = logs
      .map(
        (a) => `
      <li class="activity-item">
        <span class="activity-dot"></span>
        <div class="activity-body">
          <div class="act-title">${AppUtils.escapeHtml(a.action)}</div>
          <div class="act-detail">${AppUtils.escapeHtml(a.detail)}</div>
          <div class="act-time">${AppUtils.formatDateTime(a.timestamp)} · ${AppUtils.escapeHtml(a.actor)}</div>
        </div>
      </li>`
      )
      .join("");
  }

  /* ---------- fill form from record ---------- */
  function fillForm(c) {
    fields.name.value = c.customer_name;
    fields.phone.value = c.phone_number;
    fields.subscribe.value = c.subscribe_date;
    fields.expired.value = c.expired_date;
    fields.address.value = c.installation_address;
    els.packageSelect.value = c.package_name;
    fields.pppoe.value = c.pppoe_secret;
    fields.modem.value = c.modem_serial_number;
    fields.lat.value = c.latitude;
    fields.lng.value = c.longitude;
    fields.olt.value = c.olt_port;
    fields.onu.value = c.onu_number;
    fields.access.value = c.access_name;
    fields.accessPort.value = c.access_port;
    updateMap();
  }

  /* ---------- lock whole form if Terminate ---------- */
  function applyTerminateLock() {
    if (current && current.customer_status === CustomerDB.STATUS.TERMINATE) {
      Array.from(els.form.querySelectorAll("input, select, button[type=submit]")).forEach(
        (el) => (el.disabled = true)
      );
      els.techToggle.disabled = true;
      els.btnSave.style.display = "none";
      const note = document.createElement("div");
      note.className = "section-note";
      note.style.margin = "0 20px 16px";
      note.textContent =
        "Pelanggan berstatus Terminate. Data ditampilkan sebagai arsip dan tidak dapat diubah.";
      els.form.insertBefore(note, els.form.firstChild);
    }
  }

  /* ---------- load / init ---------- */
  function reload() {
    if (isEdit) {
      current = CustomerDB.getById(id);
      if (!current) {
        AppUtils.toast("Data pelanggan tidak ditemukan.", "danger");
        window.location.href = "index.html";
        return;
      }
      els.pageTitle.textContent = `Edit ${current.customer_name} · Dasaria ERP`;
      els.pageHeading.textContent = `Edit Pelanggan — ${current.customer_name}`;
      els.pageSub.textContent =
        "Perbarui data administrasi maupun teknis. Setiap perubahan tercatat otomatis pada Activity Log.";
      els.crumbCurrent.textContent = current.customer_name;
      els.customerIdLine.textContent = `ID Internal: ${current.id} · Status saat ini: ${current.customer_status}`;
      fillForm(current);
      renderStatusActions();
      renderHistories();
      renderActivity();
      applyTerminateLock();
    } else {
      els.pageTitle.textContent = "Registrasi Pelanggan · Dasaria ERP";
      els.pageHeading.textContent = "Registrasi Pelanggan Baru";
      els.pageSub.textContent =
        "Lengkapi data administrasi dan data teknis sebelum pelanggan dapat diaktifkan.";
      els.crumbCurrent.textContent = "Registrasi Pelanggan";
      els.customerIdLine.textContent = "";
      els.historyCard.style.display = "none";
      els.activityCard.style.display = "none";
      // saat registrasi baru, akses teknis otomatis terbuka karena data teknis wajib diisi (Rule #3)
      els.techToggle.checked = true;
      TECH_INPUTS.forEach((inp) => (inp.disabled = false));
      els.lockNote.textContent =
        "Data teknis wajib diisi saat registrasi (Rule #3).";
      updateMap();
    }
  }

  /* ---------- submit ---------- */
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();

    const lat = parseFloat(fields.lat.value);
    const lng = parseFloat(fields.lng.value);
    if (isNaN(lat) || isNaN(lng)) {
      AppUtils.toast("Latitude / Longitude harus berupa angka.", "danger");
      return;
    }

    const payload = {
      customer_name: fields.name.value.trim(),
      phone_number: fields.phone.value.trim(),
      subscribe_date: fields.subscribe.value,
      expired_date: fields.expired.value,
      installation_address: fields.address.value.trim(),
      package_name: els.packageSelect.value,
      pppoe_secret: fields.pppoe.value.trim(),
      modem_serial_number: fields.modem.value.trim(),
      latitude: lat,
      longitude: lng,
      olt_port: fields.olt.value.trim(),
      onu_number: fields.onu.value.trim(),
      access_name: fields.access.value.trim(),
      access_port: fields.accessPort.value.trim(),
    };

    try {
      if (isEdit) {
        CustomerDB.update(current.id, payload);
        AppUtils.toast("Data pelanggan berhasil diperbarui.", "success");
        reload();
      } else {
        const created = CustomerDB.create(payload);
        AppUtils.toast("Pelanggan baru berhasil diregistrasi.", "success");
        window.location.href = `edit.html?id=${created.id}`;
      }
    } catch (err) {
      AppUtils.toast(err.message, "danger");
    }
  });

  reload();
})();
