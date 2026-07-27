(function () {
  let sortKey = "paid_at", sortDir = "desc", searchTerm = "", statusFilter = "";
  const tbody = document.getElementById("table-body");
  const resultCount = document.getElementById("result-count");

  function renderSummary() {
    const s = PaymentDB.summary();
    document.getElementById("summary-grid").innerHTML = `
      <div class="summary-card total"><div class="label">Total Transaksi</div><div class="value">${s.total}</div><div class="hint">Seluruh callback diterima</div></div>
      <div class="summary-card active"><div class="label">Processed</div><div class="value">${s.processed}</div><div class="hint">Pembayaran berhasil</div></div>
      <div class="summary-card terminate"><div class="label">Rejected</div><div class="value">${s.rejected}</div><div class="hint">Validasi gagal</div></div>
    `;
  }

  function fmtRupiah(n) { return "Rp" + new Intl.NumberFormat("id-ID").format(n); }

  function badgeFor(status) {
    const map = { processed:"badge-active", rejected:"badge-terminate", received:"badge-isolir", validated:"badge-isolir" };
    return `<span class="badge ${map[status] || ""}">${status}</span>`;
  }

  function getFilteredSorted() {
    let list = PaymentDB.getAll();
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(p => p.transaction_id.toLowerCase().includes(t) || p.invoice_number.toLowerCase().includes(t) || p.customer_name.toLowerCase().includes(t));
    }
    if (statusFilter) list = list.filter(p => p.status === statusFilter);
    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "paid_at") { va = new Date(va).getTime(); vb = new Date(vb).getTime(); }
      else if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }

  function renderTable() {
    const list = getFilteredSorted();
    if (list.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="7">Tidak ada transaksi yang cocok.</td></tr>`;
    } else {
      tbody.innerHTML = list.map(p => `
        <tr>
          <td><span class="package-code-tag">${AppUtils.escapeHtml(p.transaction_id)}</span></td>
          <td>${AppUtils.escapeHtml(p.invoice_number)}</td>
          <td class="cell-strong">${AppUtils.escapeHtml(p.customer_name)}</td>
          <td>${fmtRupiah(p.amount)}</td>
          <td>${AppUtils.formatDateTime(p.paid_at)}</td>
          <td class="cell-muted">${AppUtils.escapeHtml(p.payment_channel || "-")}</td>
          <td>${badgeFor(p.status)}</td>
        </tr>
      `).join("");
    }
    resultCount.textContent = `Menampilkan ${list.length} dari ${PaymentDB.getAll().length} transaksi`;
    document.querySelectorAll("th.sortable").forEach(th => {
      th.classList.toggle("sort-active", th.dataset.key === sortKey);
      const arrow = th.querySelector(".sort-arrow");
      arrow.textContent = th.dataset.key === sortKey ? (sortDir === "asc" ? "↑" : "↓") : "↕";
    });
  }

  function showCallbackModal() {
    const unpaidInvoices = InvoiceDB.getAll().filter(i => i.status === "unpaid" || i.status === "expired");
    const opts = unpaidInvoices.map(i => `<option value="${i.id}">${i.invoice_number} — ${i.customer_name} — Rp${new Intl.NumberFormat("id-ID").format(i.amount)} — VA: ${i.virtual_account}</option>`).join("");
    const modalRoot = document.getElementById("modal-root");
    modalRoot.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-box" style="max-width:560px;">
          <h3>Simulasi Callback Paspe</h3>
          <p>Pilih invoice yang akan disimulasikan pembayarannya. Sistem akan memvalidasi VA, nominal, dan idempotency.</p>
          <div class="form-field" style="margin-top:14px;">
            <label>Pilih Invoice</label>
            <select id="modal-inv-select" style="width:100%;">${opts || "<option disabled>Tidak ada invoice unpaid</option>"}</select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="modal-cancel">Batal</button>
            <button class="btn btn-primary" id="modal-confirm">Kirim Callback</button>
          </div>
        </div>
      </div>`;
    document.getElementById("modal-cancel").onclick = () => { modalRoot.innerHTML = ""; };
    document.getElementById("modal-confirm").onclick = () => {
      const invId = document.getElementById("modal-inv-select").value;
      const inv = InvoiceDB.getById(invId);
      if (!inv) { AppUtils.toast("Invoice tidak ditemukan.", "danger"); return; }
      modalRoot.innerHTML = "";
      const txnId = "TXN-PASPE-" + Date.now().toString(36).toUpperCase();
      try {
        const result = PaymentDB.simulateCallback({
          transaction_id: txnId,
          virtual_account: inv.virtual_account,
          amount: inv.amount,
          paid_at: new Date().toISOString(),
          payment_channel: "BCA VA (Simulasi)",
        });
        const pkg = ServiceDB.getAll().find(p => p.package_name === inv.package_name);
        const basePrice = pkg ? pkg.base_price : 0;
        SettlementDB.create({
          invoice_number: inv.invoice_number,
          payment_id: result.payment.transaction_id,
          customer_name: inv.customer_name,
          selling_price: inv.amount,
          base_price: basePrice,
          gateway_fee: 2000,
          adjustment_amount: 0,
          mitra_amount: inv.amount - basePrice - 2000,
          isp_amount: basePrice,
        });
        const customer = CustomerDB.getAll().find(c => c.pppoe_secret === inv.pppoe_secret);
        if (customer && (customer.customer_status === "Isolir" || customer.customer_status === "Expired")) {
          CustomerDB.reactivate(customer.id);
          RadiusLogDB.create({ customer_name: customer.customer_name, pppoe_username: customer.pppoe_secret, action: "reactivate", status: "success", detail: "Re-aktivasi otomatis setelah pembayaran, profile normal, CoA port 3799" });
        }
        AppUtils.toast(`Callback ${txnId} berhasil diproses. Invoice ${inv.invoice_number} lunas.`, "success");
        renderSummary();
        renderTable();
      } catch (err) { AppUtils.toast(err.message, "danger"); }
    };
  }

  document.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      if (sortKey === key) { sortDir = sortDir === "asc" ? "desc" : "asc"; } else { sortKey = key; sortDir = "asc"; }
      renderTable();
    });
  });
  document.getElementById("search-input").addEventListener("input", AppUtils.debounce(e => { searchTerm = e.target.value.trim(); renderTable(); }, 200));
  document.getElementById("filter-status").addEventListener("change", e => { statusFilter = e.target.value; renderTable(); });
  document.getElementById("btn-reset-filter").addEventListener("click", () => {
    searchTerm = ""; statusFilter = "";
    document.getElementById("search-input").value = "";
    document.getElementById("filter-status").value = "";
    renderTable();
  });
  document.getElementById("btn-simulate-callback").addEventListener("click", showCallbackModal);

  renderSummary();
  renderTable();
})();
