(function () {
  let sortKey = "customer_name";
  let sortDir = "asc"; // asc | desc
  let searchTerm = "";
  let statusFilter = "";

  const tbody = document.getElementById("table-body");
  const resultCount = document.getElementById("result-count");

  function renderSummary() {
    const list = InfraDB.getMonitoringData();
    const s = {
      total: list.length,
      working: list.filter(c => c.olt_status === InfraDB.OLT_STATUS.WORKING).length,
      warning: list.filter(c => c.olt_status === InfraDB.OLT_STATUS.WARNING).length,
      offline: list.filter(c => c.olt_status === InfraDB.OLT_STATUS.OFFLINE).length,
    };
    document.getElementById("summary-grid").innerHTML = `
      <div class="summary-card total">
        <div class="label">Total Perangkat</div>
        <div class="value">${s.total}</div>
        <div class="hint">Jumlah perangkat yang dimonitor</div>
      </div>
      <div class="summary-card active">
        <div class="label">Status Working</div>
        <div class="value">${s.working}</div>
        <div class="hint">Perangkat berfungsi normal</div>
      </div>
      <div class="summary-card isolir">
        <div class="label">Status Warning</div>
        <div class="value">${s.warning}</div>
        <div class="hint">Perlu perhatian</div>
      </div>
      <div class="summary-card terminate">
        <div class="label">Status Offline</div>
        <div class="value">${s.offline}</div>
        <div class="hint">Perangkat tidak terhubung</div>
      </div>
    `;
  }

  function badgeForOltStatus(status) {
    const map = {
      Working: "badge-active",
      Warning: "badge-warning",
      Offline: "badge-terminate",
    };
    const textMap = {
      Working: "Working",
      Warning: "Warning",
      Offline: "Offline",
    };
    return `<span class="badge ${map[status] || ""}">${textMap[status] || status}</span>`;
  }

  function badgeForCustomerStatus(status) {
    const map = {
      Active: "badge-active",
      Isolir: "badge-isolir",
      Terminate: "badge-terminate",
      "Belum Diregistrasi": "badge-warning",
    };
    return `<span class="badge ${map[status] || ""}">${status}</span>`;
  }

  function getFilteredSorted() {
    let list = InfraDB.getMonitoringData();

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.customer_name.toLowerCase().includes(t) ||
          c.customer_id.toLowerCase().includes(t) ||
          c.olt_port.toLowerCase().includes(t) ||
          c.olt_slot.toLowerCase().includes(t) ||
          c.olt_pon.toLowerCase().includes(t) ||
          c.odp_name.toLowerCase().includes(t)
      );
    }
    if (statusFilter) {
      list = list.filter((c) => c.olt_status === statusFilter);
    }

    list.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (sortKey === "subscribe_date") {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      } else if (typeof va === "string") {
        va = va.toLowerCase();
        vb = vb.toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }

  function renderTable() {
    const list = getFilteredSorted();

    if (list.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="10">Tidak ada data monitoring yang cocok dengan pencarian/filter.</td></tr>`;
    } else {
      tbody.innerHTML = list
        .map(
          (c) => `
        <tr>
          <td class="cell-strong">${AppUtils.escapeHtml(c.customer_name)}</td>
          <td>${AppUtils.escapeHtml(c.customer_id)}</td>
          <td>${AppUtils.escapeHtml(c.onu_number)}</td>
          <td>${badgeForCustomerStatus(c.customer_status)}</td>
          <td>${AppUtils.formatDate(c.subscribe_date)}</td>
          <td>${AppUtils.escapeHtml(c.odp_name)}</td>
          <td>${AppUtils.escapeHtml(c.access_port)}</td>
          <td><span class="olt-rx-label">${c.olt_rx_register} dBm</span></td>
          <td><span class="olt-rx-label">${c.olt_rx_current} dBm</span></td>
          <td>${badgeForOltStatus(c.olt_status)}</td>
        </tr>
      `
        )
        .join("");
    }

    resultCount.textContent = `Menampilkan ${list.length} dari ${InfraDB.getMonitoringData().length} perangkat`;

    document.querySelectorAll("th.sortable").forEach((th) => {
      th.classList.toggle("sort-active", th.dataset.key === sortKey);
      const arrow = th.querySelector(".sort-arrow");
      if (th.dataset.key === sortKey) {
        arrow.textContent = sortDir === "asc" ? "↑" : "↓";
      } else {
        arrow.textContent = "↕";
      }
    });
  }

  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      if (sortKey === key) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDir = "asc";
      }
      renderTable();
    });
  });

  document.getElementById("search-input").addEventListener(
    "input",
    AppUtils.debounce((e) => {
      searchTerm = e.target.value.trim();
      renderTable();
    }, 200)
  );

  document.getElementById("filter-status").addEventListener("change", (e) => {
    statusFilter = e.target.value;
    renderTable();
  });

  document.getElementById("btn-reset-filter").addEventListener("click", () => {
    searchTerm = "";
    statusFilter = "";
    document.getElementById("search-input").value = "";
    document.getElementById("filter-status").value = "";
    renderTable();
  });

  renderSummary();
  renderTable();
})();