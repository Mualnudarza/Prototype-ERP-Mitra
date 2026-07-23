(function () {
  let sortKey = "customer_name";
  let sortDir = "asc";
  let searchTerm = "";
  let packageFilter = "";
  let statusFilter = "";

  const tbody = document.getElementById("table-body");
  const resultCount = document.getElementById("result-count");
  const filterPackage = document.getElementById("filter-package");
  const filterStatus = document.getElementById("filter-status");

  ServiceDB.activeOptions().forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.package_name;
    opt.textContent = p.package_name;
    filterPackage.appendChild(opt);
  });

  function renderSummary() {
    const customers = CustomerDB.getAll();
    const active = customers.filter((c) => c.customer_status === "Active");
    const packages = {};
    active.forEach((c) => { packages[c.package_name] = (packages[c.package_name] || 0) + 1; });
    document.getElementById("summary-grid").innerHTML = `
      <div class="summary-card total">
        <div class="label">Total Pelanggan</div>
        <div class="value">${customers.length}</div>
        <div class="hint">Seluruh pelanggan terdaftar</div>
      </div>
      <div class="summary-card active">
        <div class="label">Pelanggan Aktif</div>
        <div class="value">${active.length}</div>
        <div class="hint">Menggunakan paket layanan</div>
      </div>
    `;
  }

  function badgeFor(status) {
    const map = { Active: "badge-active", Isolir: "badge-isolir", Terminate: "badge-terminate" };
    return `<span class="badge ${map[status] || ""}">${status}</span>`;
  }

  function getFilteredSorted() {
    let list = CustomerDB.getAll();
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter((c) => c.pppoe_secret.toLowerCase().includes(t) || c.customer_name.toLowerCase().includes(t));
    }
    if (packageFilter) { list = list.filter((c) => c.package_name === packageFilter); }
    if (statusFilter) { list = list.filter((c) => c.customer_status === statusFilter); }
    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "subscribe_date" || sortKey === "expired_date") { va = new Date(va).getTime(); vb = new Date(vb).getTime(); }
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
      tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Tidak ada pelanggan yang cocok dengan pencarian/filter.</td></tr>`;
    } else {
      tbody.innerHTML = list.map((c) => `
        <tr>
          <td><span class="pppoe-tag">${AppUtils.escapeHtml(c.pppoe_secret)}</span></td>
          <td class="cell-strong">${AppUtils.escapeHtml(c.customer_name)}</td>
          <td>${AppUtils.escapeHtml(c.package_name)}</td>
          <td>${AppUtils.formatDate(c.subscribe_date)}</td>
          <td>${badgeFor(c.customer_status)}</td>
          <td><a class="btn btn-secondary btn-sm" href="customer-packages-change.html?id=${c.id}">Ubah Paket</a></td>
        </tr>
      `).join("");
    }
    resultCount.textContent = `Menampilkan ${list.length} dari ${CustomerDB.getAll().length} pelanggan`;
    document.querySelectorAll("th.sortable").forEach((th) => {
      th.classList.toggle("sort-active", th.dataset.key === sortKey);
      const arrow = th.querySelector(".sort-arrow");
      arrow.textContent = th.dataset.key === sortKey ? (sortDir === "asc" ? "↑" : "↓") : "↕";
    });
  }

  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      sortKey === key ? (sortDir = sortDir === "asc" ? "desc" : "asc") : (sortKey = key, sortDir = "asc");
      renderTable();
    });
  });

  document.getElementById("search-input").addEventListener("input", AppUtils.debounce((e) => { searchTerm = e.target.value.trim(); renderTable(); }, 200));
  filterPackage.addEventListener("change", (e) => { packageFilter = e.target.value; renderTable(); });
  filterStatus.addEventListener("change", (e) => { statusFilter = e.target.value; renderTable(); });
  document.getElementById("btn-reset-filter").addEventListener("click", () => { searchTerm = ""; packageFilter = ""; statusFilter = ""; document.getElementById("search-input").value = ""; filterPackage.value = ""; filterStatus.value = ""; renderTable(); });

  renderSummary();
  renderTable();
})();
