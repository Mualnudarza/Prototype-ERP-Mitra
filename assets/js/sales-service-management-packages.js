(function () {
  let sortKey = "package_code";
  let sortDir = "asc";
  let searchTerm = "";
  let statusFilter = "";

  const tbody = document.getElementById("table-body");
  const resultCount = document.getElementById("result-count");

  function renderSummary() {
    const s = ServiceDB.summary();
    document.getElementById("summary-grid").innerHTML = `
      <div class="summary-card total">
        <div class="label">Total Paket</div>
        <div class="value">${s.total}</div>
        <div class="hint">Seluruh paket layanan</div>
      </div>
      <div class="summary-card active">
        <div class="label">Paket Aktif</div>
        <div class="value">${s.active}</div>
        <div class="hint">Status Aktif</div>
      </div>
      <div class="summary-card isolir">
        <div class="label">Paket Nonaktif</div>
        <div class="value">${s.inactive}</div>
        <div class="hint">Tidak tersedia untuk pelanggan baru</div>
      </div>
    `;
  }

  function badgeFor(status) {
    const map = { Aktif: "badge-active", Nonaktif: "badge-isolir" };
    return `<span class="badge ${map[status] || ""}">${status}</span>`;
  }

  function formatPrice(n) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  }

  function getFilteredSorted() {
    let list = ServiceDB.getAll();
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter((p) => p.package_code.toLowerCase().includes(t) || p.package_name.toLowerCase().includes(t));
    }
    if (statusFilter) {
      list = list.filter((p) => p.package_status === statusFilter);
    }
    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "selling_price") { va = Number(va); vb = Number(vb); }
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
      tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Tidak ada paket yang cocok dengan pencarian/filter.</td></tr>`;
    } else {
      tbody.innerHTML = list.map((p) => `
        <tr>
          <td><span class="package-code-tag">${AppUtils.escapeHtml(p.package_code)}</span></td>
          <td class="cell-strong">${AppUtils.escapeHtml(p.package_name)}</td>
          <td>${AppUtils.escapeHtml(p.bandwidth)}</td>
          <td>${formatPrice(p.selling_price)}</td>
          <td>${badgeFor(p.package_status)}</td>
          <td><a class="btn btn-secondary btn-sm" href="packages-edit.html?id=${p.id}">Edit</a></td>
        </tr>
      `).join("");
    }
    resultCount.textContent = `Menampilkan ${list.length} dari ${ServiceDB.getAll().length} paket`;
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
  document.getElementById("filter-status").addEventListener("change", (e) => { statusFilter = e.target.value; renderTable(); });
  document.getElementById("btn-reset-filter").addEventListener("click", () => { searchTerm = ""; statusFilter = ""; document.getElementById("search-input").value = ""; document.getElementById("filter-status").value = ""; renderTable(); });
  document.getElementById("btn-add-package").addEventListener("click", () => { window.location.href = "packages-edit.html"; });

  renderSummary();
  renderTable();
})();
