(function () {
  let sortKey = "due_date", sortDir = "asc", searchTerm = "", statusFilter = "";
  const tbody = document.getElementById("table-body");
  const resultCount = document.getElementById("result-count");

  function renderSummary() {
    const s = InvoiceDB.summary();
    document.getElementById("summary-grid").innerHTML = `
      <div class="summary-card total"><div class="label">Total Invoice</div><div class="value">${s.total}</div><div class="hint">Seluruh invoice</div></div>
      <div class="summary-card active"><div class="label">Invoice Lunas</div><div class="value">${s.paid}</div><div class="hint">Status paid</div></div>
      <div class="summary-card isolir"><div class="label">Invoice Unpaid</div><div class="value">${s.unpaid}</div><div class="hint">Belum dibayar</div></div>
      <div class="summary-card terminate"><div class="label">Invoice Expired</div><div class="value">${s.expired}</div><div class="hint">Lewat jatuh tempo</div></div>
    `;
  }

  function fmtRupiah(n) { return "Rp" + new Intl.NumberFormat("id-ID").format(n); }

  function badgeFor(status) {
    const map = { unpaid:"badge-isolir", paid:"badge-active", expired:"badge-terminate", cancelled:"badge-terminate" };
    return `<span class="badge ${map[status] || ""}">${status}</span>`;
  }

  function getFilteredSorted() {
    let list = InvoiceDB.getAll();
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(i => i.invoice_number.toLowerCase().includes(t) || i.customer_name.toLowerCase().includes(t) || i.virtual_account.includes(t));
    }
    if (statusFilter) list = list.filter(i => i.status === statusFilter);
    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "due_date" || sortKey === "period_start") { va = new Date(va).getTime(); vb = new Date(vb).getTime(); }
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
      tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Tidak ada invoice yang cocok.</td></tr>`;
    } else {
      tbody.innerHTML = list.map(i => `
        <tr>
          <td><span class="package-code-tag">${AppUtils.escapeHtml(i.invoice_number)}</span></td>
          <td class="cell-strong">${AppUtils.escapeHtml(i.customer_name)}</td>
          <td class="cell-muted">${AppUtils.formatDate(i.period_start)} → ${AppUtils.formatDate(i.period_end)}</td>
          <td>${AppUtils.formatDate(i.due_date)}</td>
          <td class="cell-strong">${fmtRupiah(i.amount)}</td>
          <td>${badgeFor(i.status)}</td>
          <td class="cell-muted">${AppUtils.escapeHtml(i.virtual_account)}</td>
          <td>
            ${i.status === "unpaid" || i.status === "expired"
              ? `<button class="btn btn-primary btn-sm btn-sim-pay" data-va="${i.virtual_account}" data-amount="${i.amount}" data-inv="${i.id}">Simulasi Bayar</button>`
              : `<span class="cell-muted">—</span>`}
          </td>
        </tr>
      `).join("");
    }
    resultCount.textContent = `Menampilkan ${list.length} dari ${InvoiceDB.getAll().length} invoice`;
    document.querySelectorAll("th.sortable").forEach(th => {
      th.classList.toggle("sort-active", th.dataset.key === sortKey);
      const arrow = th.querySelector(".sort-arrow");
      arrow.textContent = th.dataset.key === sortKey ? (sortDir === "asc" ? "↑" : "↓") : "↕";
    });

    document.querySelectorAll(".btn-sim-pay").forEach(btn => {
      btn.addEventListener("click", () => simulatePayment(btn.dataset.va, Number(btn.dataset.amount), btn.dataset.inv));
    });
  }

  function simulatePayment(va, amount, invId) {
    const txnId = "TXN-PASPE-" + Date.now().toString(36).toUpperCase();
    try {
      const result = PaymentDB.simulateCallback({
        transaction_id: txnId,
        virtual_account: va,
        amount: amount,
        paid_at: new Date().toISOString(),
        payment_channel: "BCA VA (Simulasi)",
      });
      const inv = InvoiceDB.getById(invId);
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
      AppUtils.toast(`Pembayaran ${txnId} berhasil. Invoice ${inv.invoice_number} lunas. Settlement ledger dibuat.`, "success");
      renderSummary();
      renderTable();
    } catch (err) { AppUtils.toast(err.message, "danger"); }
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

  document.getElementById("btn-simulate-generate").addEventListener("click", () => {
    const customers = CustomerDB.getAll().filter(c => c.customer_status === "Active");
    let count = 0;
    customers.forEach(c => {
      const today = new Date();
      const periodStart = today.toISOString().slice(0, 10);
      const periodEnd = new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10);
      const existing = InvoiceDB.getAll().find(i => i.customer_name === c.customer_name && i.period_start === periodStart && i.period_end === periodEnd);
      if (existing) return;
      const pkg = ServiceDB.getAll().find(p => p.package_name === c.package_name);
      const invNum = "INV-" + today.getFullYear() + "-" + String(InvoiceDB.getAll().length + 1).padStart(4, "0");
      InvoiceDB.create({
        invoice_number: invNum,
        customer_name: c.customer_name,
        pppoe_secret: c.pppoe_secret,
        package_name: c.package_name,
        period_start: periodStart,
        period_end: periodEnd,
        issue_date: periodStart,
        due_date: new Date(today.getTime() + 15 * 86400000).toISOString().slice(0, 10),
        amount: pkg ? pkg.selling_price : 0,
        virtual_account: "8800" + Math.floor(Math.random() * 1000000),
      });
      count++;
    });
    AppUtils.toast(`${count} invoice baru dibuat.`, "success");
    renderSummary();
    renderTable();
  });

  renderSummary();
  renderTable();
})();
