(function () {
  let sortKey = "name", sortDir = "asc", searchTerm = "", statusFilter = "";
  const tbody = document.getElementById("table-body");
  const resultCount = document.getElementById("result-count");

  function renderSummary() {
    const s = MitraDB.summary();
    const c = MitraDB.coverageSummary();
    document.getElementById("summary-grid").innerHTML = `
      <div class="summary-card total"><div class="label">Total Mitra</div><div class="value">${s.total}</div><div class="hint">Mitra sebagai entitas cabang</div></div>
      <div class="summary-card active"><div class="label">Mitra Aktif</div><div class="value">${s.active}</div><div class="hint">Dapat registrasi customer</div></div>
      <div class="summary-card terminate"><div class="label">Mitra Nonaktif</div><div class="value">${s.inactive}</div><div class="hint">Tidak dapat customer baru</div></div>
      <div class="summary-card total"><div class="label">Coverage Area</div><div class="value">${c.active}<span style="font-size:16px; color:var(--color-text-faint);">/${c.total}</span></div><div class="hint">Area aktif milik Mitra</div></div>
    `;
  }

  function badgeFor(status) {
    return status === "Aktif"
      ? `<span class="badge badge-active">${status}</span>`
      : `<span class="badge badge-terminate">${status}</span>`;
  }

  function dueDateLabel(rule) {
    if (!rule || !rule.type) return "-";
    const map = { fixed_day:"Tanggal "+(rule.value||"-"), days_after_issue:"H+"+(rule.value||"-"), running_day:"Pro-rata", plus_30_days:"+30 hari", activation_date_cycle:"Siklus aktivasi" };
    return map[rule.type] || rule.type;
  }

  function getFilteredSorted() {
    let list = MitraDB.getAll();
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(t) || (m.code||"").toLowerCase().includes(t) || m.pic_name.toLowerCase().includes(t) || (m.email||"").toLowerCase().includes(t) || (m.coverage_areas||[]).some(c => c.name.toLowerCase().includes(t)));
    }
    if (statusFilter) list = list.filter(m => m.status === statusFilter);
    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "default_due_date_rule") { va = JSON.stringify(a.default_due_date_rule||{}); vb = JSON.stringify(b.default_due_date_rule||{}); }
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
      tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Tidak ada Mitra yang cocok.</td></tr>`;
    } else {
      tbody.innerHTML = list.map(m => {
        const cov = m.coverage_areas || [];
        const covHtml = cov.length
          ? cov.map(c => `<span class="history-chip"${c.status !== "Aktif" ? ' style="opacity:.5"' : ""}><b>${AppUtils.escapeHtml(c.name)}</b> · ${AppUtils.escapeHtml(c.olt_name || "-")}</span>`).join("")
          : `<span class="cell-muted">Belum ada coverage</span>`;
        return `
        <tr>
          <td><span class="package-code-tag">${AppUtils.escapeHtml(m.code || "-")}</span></td>
          <td class="cell-strong">${AppUtils.escapeHtml(m.name)}</td>
          <td>${AppUtils.escapeHtml(m.pic_name)}<div class="cell-muted">${AppUtils.escapeHtml(m.phone)}</div></td>
          <td>${covHtml}</td>
          <td>${AppUtils.escapeHtml(m.bank_name)}<div class="cell-muted">${AppUtils.escapeHtml(m.bank_account_number)}</div></td>
          <td>${AppUtils.escapeHtml(dueDateLabel(m.default_due_date_rule))}</td>
          <td>${badgeFor(m.status)}</td>
          <td><a class="btn btn-secondary btn-sm" href="edit.html?id=${m.id}">Kelola</a></td>
        </tr>
      `;
      }).join("");
    }
    resultCount.textContent = `Menampilkan ${list.length} dari ${MitraDB.getAll().length} Mitra`;
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
