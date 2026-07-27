(function () {
  let sortKey = "created_at", sortDir = "desc", searchTerm = "", actionFilter = "", statusFilter = "";
  const tbody = document.getElementById("table-body");
  const resultCount = document.getElementById("result-count");

  function renderSummary() {
    const s = RadiusLogDB.summary();
    document.getElementById("summary-grid").innerHTML = `
      <div class="summary-card total"><div class="label">Total Actions</div><div class="value">${s.total}</div><div class="hint">Seluruh aksi Radius</div></div>
      <div class="summary-card active"><div class="label">Success</div><div class="value">${s.success}</div><div class="hint">Aksi berhasil</div></div>
      <div class="summary-card terminate"><div class="label">Failed</div><div class="value">${s.failed}</div><div class="hint">Aksi gagal</div></div>
    `;
  }

  function badgeFor(status) {
    const map = { success:"badge-active", failed:"badge-terminate", pending:"badge-isolir" };
    return `<span class="badge ${map[status] || ""}">${status}</span>`;
  }

  function actionLabel(action) {
    const map = { provision:"Provision", suspend:"Suspend", reactivate:"Reactivate", change_package:"Change Package", terminate:"Terminate" };
    return map[action] || action;
  }

  function getFilteredSorted() {
    let list = RadiusLogDB.getAll();
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(r => r.customer_name.toLowerCase().includes(t) || r.pppoe_username.toLowerCase().includes(t) || r.action.toLowerCase().includes(t));
    }
    if (actionFilter) list = list.filter(r => r.action === actionFilter);
    if (statusFilter) list = list.filter(r => r.status === statusFilter);
    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "created_at") { va = new Date(va).getTime(); vb = new Date(vb).getTime(); }
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
      tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Tidak ada log Radius yang cocok.</td></tr>`;
    } else {
      tbody.innerHTML = list.map(r => `
        <tr>
          <td class="cell-muted">${AppUtils.formatDateTime(r.created_at)}</td>
          <td class="cell-strong">${AppUtils.escapeHtml(r.customer_name)}</td>
          <td><span class="pppoe-tag">${AppUtils.escapeHtml(r.pppoe_username)}</span></td>
          <td>${actionLabel(r.action)}</td>
          <td>${badgeFor(r.status)}</td>
          <td class="cell-muted">${AppUtils.escapeHtml(r.detail || "-")}</td>
        </tr>
      `).join("");
    }
    resultCount.textContent = `Menampilkan ${list.length} dari ${RadiusLogDB.getAll().length} log`;
    document.querySelectorAll("th.sortable").forEach(th => {
      th.classList.toggle("sort-active", th.dataset.key === sortKey);
      const arrow = th.querySelector(".sort-arrow");
      arrow.textContent = th.dataset.key === sortKey ? (sortDir === "asc" ? "↑" : "↓") : "↕";
    });
  }

  document.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      if (sortKey === key) { sortDir = sortDir === "asc" ? "desc" : "asc"; } else { sortKey = key; sortDir = "asc"; }
      renderTable();
    });
  });
  document.getElementById("search-input").addEventListener("input", AppUtils.debounce(e => { searchTerm = e.target.value.trim(); renderTable(); }, 200));
  document.getElementById("filter-action").addEventListener("change", e => { actionFilter = e.target.value; renderTable(); });
  document.getElementById("filter-status").addEventListener("change", e => { statusFilter = e.target.value; renderTable(); });
  document.getElementById("btn-reset-filter").addEventListener("click", () => {
    searchTerm = ""; actionFilter = ""; statusFilter = "";
    document.getElementById("search-input").value = "";
    document.getElementById("filter-action").value = "";
    document.getElementById("filter-status").value = "";
    renderTable();
  });

  document.getElementById("btn-simulate-isolir").addEventListener("click", () => {
    const overdueCustomers = CustomerDB.getAll().filter(c => c.customer_status === "Active" && c.customer_type !== "fasum");
    const expiredInvoices = InvoiceDB.getAll().filter(i => i.status === "expired");
    const overdueCustomerNames = expiredInvoices.map(i => i.customer_name);
    const targets = overdueCustomers.filter(c => overdueCustomerNames.includes(c.customer_name));
    if (targets.length === 0) { AppUtils.toast("Tidak ada customer overdue non-Fasum untuk diisolir.", "danger"); return; }
    let count = 0;
    targets.forEach(c => {
      CustomerDB.suspend(c.id);
      RadiusLogDB.create({ customer_name: c.customer_name, pppoe_username: c.pppoe_secret, action: "suspend", status: "success", detail: "Suspend otomatis overdue, profile 0 Mbps, CoA port 3799" });
      count++;
    });
    AppUtils.toast(`${count} customer diisolir otomatis.`, "success");
    renderSummary();
    renderTable();
  });

  renderSummary();
  renderTable();
})();
