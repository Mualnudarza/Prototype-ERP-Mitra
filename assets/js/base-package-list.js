(function () {
  let sortKey = "name", sortDir = "asc", searchTerm = "", statusFilter = "";
  const tbody = document.getElementById("table-body");
  const resultCount = document.getElementById("result-count");

  function renderSummary() {
    const s = BasePackageDB.summary();
    document.getElementById("summary-grid").innerHTML = `
      <div class="summary-card total"><div class="label">Total Paket Dasar</div><div class="value">${s.total}</div><div class="hint">Seluruh paket ISP</div></div>
      <div class="summary-card active"><div class="label">Paket Aktif</div><div class="value">${s.active}</div><div class="hint">Dapat dipakai Mitra</div></div>
      <div class="summary-card terminate"><div class="label">Paket Nonaktif</div><div class="value">${s.inactive}</div><div class="hint">Tidak dapat dipakai baru</div></div>
    `;
  }

  function badgeFor(status) {
    return status === "Aktif"
      ? `<span class="badge badge-active">${status}</span>`
      : `<span class="badge badge-terminate">${status}</span>`;
  }

  function fmtRupiah(n) { return "Rp" + new Intl.NumberFormat("id-ID").format(n); }

  function getFilteredSorted() {
    let list = BasePackageDB.getAll();
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(t) || p.radius_profile_name.toLowerCase().includes(t));
    }
    if (statusFilter) list = list.filter(p => p.status === statusFilter);
    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }

  function renderTable() {
    const list = getFilteredSorted();
    if (list.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Tidak ada paket dasar yang cocok.</td></tr>`;
    } else {
      tbody.innerHTML = list.map(p => `
        <tr>
          <td class="cell-strong">${AppUtils.escapeHtml(p.name)}</td>
          <td>↓ ${p.bandwidth_down} Mbps${p.bandwidth_up ? " / ↑ " + p.bandwidth_up + " Mbps" : ""}</td>
          <td>${fmtRupiah(p.base_price)}</td>
          <td><span class="package-code-tag">${AppUtils.escapeHtml(p.radius_profile_name)}</span></td>
          <td>${badgeFor(p.status)}</td>
          <td><a class="btn btn-secondary btn-sm" href="edit.html?id=${p.id}">Edit</a></td>
        </tr>
      `).join("");
    }
    resultCount.textContent = `Menampilkan ${list.length} dari ${BasePackageDB.getAll().length} paket dasar`;
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
  document.getElementById("filter-status").addEventListener("change", e => { statusFilter = e.target.value; renderTable(); });
  document.getElementById("btn-reset-filter").addEventListener("click", () => {
    searchTerm = ""; statusFilter = "";
    document.getElementById("search-input").value = "";
    document.getElementById("filter-status").value = "";
    renderTable();
  });

  renderSummary();
  renderTable();
})();
