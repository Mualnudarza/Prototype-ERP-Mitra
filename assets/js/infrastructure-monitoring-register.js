(function () {
  const id = AppUtils.qs("id");
  let customer = id ? CustomerDB.getById(id) : null;

  const els = {
    form: document.getElementById("registration-form"),
    scriptsContainer: document.getElementById("scripts-container"),
    modalRoot: document.getElementById("modal-root"),
  };

  const fields = {
    customerName: document.getElementById("f-customer-name"),
    packageName: document.getElementById("f-package-name"),
    address: document.getElementById("f-installation-address"),
    oltType: document.getElementById("f-olt-type"),
    oltSlot: document.getElementById("f-olt-slot"),
    oltPon: document.getElementById("f-olt-pon"),
  };

  // If no ID, show a table of customers who need registration
  if (!id) {
    renderCustomerSelection();
    return;
  }

  function initFields() {
    if (!customer) {
      AppUtils.toast("Data pelanggan tidak ditemukan.", "danger");
      window.location.href = "monitoring.html";
      return;
    }

    fields.customerName.value = customer.customer_name;
    fields.packageName.value = customer.package_name;
    fields.address.value = customer.installation_address;
    fields.oltType.value = customer.olt_type || "Huawei MA5800";

    // Fill slots 1-16
    for (let i = 1; i <= 16; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `Slot ${i}`;
      if (customer.olt_slot == i) opt.selected = true;
      fields.oltSlot.appendChild(opt);
    }

    // Fill PON 1-16
    for (let i = 1; i <= 16; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `PON ${i}`;
      if (customer.olt_pon == i) opt.selected = true;
      fields.oltPon.appendChild(opt);
    }

    updateScripts();
  }

  function renderCustomerSelection() {
    const list = CustomerDB.getAll().filter(c => c.customer_status === CustomerDB.STATUS.PENDING_REG);
    const mainCol = document.querySelector(".edit-layout");
    
    if (list.length === 0) {
      mainCol.innerHTML = `
        <div class="card" style="padding:40px; text-align:center; width: 100%;">
          <div style="font-size:48px; margin-bottom:16px;">✅</div>
          <h3>Semua Pelanggan Sudah Diregistrasi</h3>
          <p style="color:var(--color-text-muted); margin-bottom:20px;">Tidak ada pelanggan baru yang menunggu antrian registrasi ONU.</p>
          <a class="btn btn-primary" href="monitoring.html">Kembali ke Monitoring</a>
        </div>`;
      return;
    }

    mainCol.innerHTML = `
      <div class="card" style="width: 100%;">
        <div class="form-section">
          <h3>Antrian Registrasi ONU</h3>
          <div class="desc">Daftar pelanggan baru yang telah terdaftar namun belum diregistrasi ke jaringan OLT.</div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nama Pelanggan</th>
                <th>Paket Layanan</th>
                <th>Alamat Pemasangan</th>
                <th>Tgl Terdaftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(c => `
                <tr>
                  <td class="cell-strong">${AppUtils.escapeHtml(c.customer_name)}</td>
                  <td>${AppUtils.escapeHtml(c.package_name)}</td>
                  <td>${AppUtils.escapeHtml(c.installation_address)}</td>
                  <td>${AppUtils.formatDate(c.subscribe_date)}</td>
                  <td>
                    <a class="btn btn-primary btn-sm" href="register.html?id=${c.id}">Registrasi</a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    
    // Hide script card if it exists in initial HTML (it's part of the same .edit-layout)
    const scriptCard = document.getElementById("script-card");
    if (scriptCard) scriptCard.remove();
  }

  function updateScripts() {
    const slot = fields.oltSlot.value;
    const pon = fields.oltPon.value;
    if (!slot || !pon) {
      els.scriptsContainer.innerHTML = '<div class="empty-state">Pilih Slot dan PON untuk melihat script.</div>';
      return;
    }

    const scripts = InfraDB.generateRegistrationScripts(customer, slot, pon);
    els.scriptsContainer.innerHTML = scripts.map((s, idx) => `
      <div class="script-box">
        <div class="script-header">
          <div class="script-title">${s.title}</div>
          <button class="copy-btn" onclick="copyToClipboard('${idx}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
        </div>
        <div class="script-code" id="script-code-${idx}">${s.code}</div>
      </div>
    `).join("");
  }

  window.copyToClipboard = function(idx) {
    const code = document.getElementById(`script-code-${idx}`).textContent;
    navigator.clipboard.writeText(code).then(() => {
      AppUtils.toast("Script berhasil disalin ke clipboard.", "success");
    });
  };

  fields.oltSlot.addEventListener("change", updateScripts);
  fields.oltPon.addEventListener("change", updateScripts);

  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const slot = fields.oltSlot.value;
    const pon = fields.oltPon.value;
    
    const ok = await confirmRegistration(customer.customer_name, slot, pon);
    if (ok) {
      const onu_number = "ONU-" + Math.floor(Math.random() * 1000).toString().padStart(4, "0");
      const rx_val = (Math.random() * (-18 - (-24)) + (-24)).toFixed(1);
      
      try {
        CustomerDB.completeRegistration(customer.id, {
          onu_number: onu_number,
          olt_rx_register: parseFloat(rx_val),
          olt_slot: slot,
          olt_pon: pon
        });
        AppUtils.toast("Registrasi ONU berhasil diselesaikan.", "success");
        setTimeout(() => {
          window.location.href = "monitoring.html";
        }, 1500);
      } catch (err) {
        AppUtils.toast(err.message, "danger");
      }
    }
  });

  function confirmRegistration(name, slot, pon) {
    return new Promise((resolve) => {
      els.modalRoot.innerHTML = `
        <div class="modal-overlay">
          <div class="modal-box">
            <h3>Konfirmasi Registrasi?</h3>
            <p>Selesaikan proses registrasi untuk pelanggan <b>${name}</b> pada OLT Slot ${slot} PON ${pon}?</p>
            <div class="modal-actions">
              <button class="btn btn-secondary" id="modal-cancel">Batal</button>
              <button class="btn btn-primary" id="modal-confirm">Selesaikan</button>
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

  initFields();
})();