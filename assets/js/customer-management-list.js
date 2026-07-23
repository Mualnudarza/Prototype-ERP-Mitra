(function () {
  let sortKey = "customer_name";
  let sortDir = "asc"; // asc | desc
  let searchTerm = "";
  let statusFilter = "";

  const tbody = document.getElementById("table-body");
  const resultCount = document.getElementById("result-count");

  function renderSummary() {
    const s = CustomerDB.summary();
    document.getElementById("summary-grid").innerHTML = `
      <div class="summary-card total">
        <div class="label">Total Pelanggan</div>
        <div class="value">${s.total}</div>
        <div class="hint">Seluruh pelanggan terdaftar</div>
      </div>
      <div class="summary-card active">
        <div class="label">Pelanggan Aktif</div>
        <div class="value">${s.active}</div>
        <div class="hint">Status Active</div>
      </div>
      <div class="summary-card isolir">
        <div class="label">Pelanggan Isolir</div>
        <div class="value">${s.isolir}</div>
        <div class="hint">Layanan disuspend sementara</div>
      </div>
      <div class="summary-card terminate">
        <div class="label">Pelanggan Terminate</div>
        <div class="value">${s.terminate}</div>
        <div class="hint">Layanan dihentikan permanen</div>
      </div>
    `;
  }

  function badgeFor(status) {
    const map = {
      Active: "badge-active",
      Isolir: "badge-isolir",
      Terminate: "badge-terminate",
    };
    return `<span class="badge ${map[status] || ""}">${status}</span>`;
  }

  function getFilteredSorted() {
    let list = CustomerDB.getAll();

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.pppoe_secret.toLowerCase().includes(t) ||
          c.customer_name.toLowerCase().includes(t) ||
          c.phone_number.toLowerCase().includes(t)
      );
    }
    if (statusFilter) {
      list = list.filter((c) => c.customer_status === statusFilter);
    }

    list.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (sortKey === "expired_date") {
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
      tbody.innerHTML = `<tr class="empty-row"><td colspan="7">Tidak ada pelanggan yang cocok dengan pencarian/filter.</td></tr>`;
    } else {
      tbody.innerHTML = list
        .map(
          (c) => `
        <tr>
          <td><span class="pppoe-tag">${AppUtils.escapeHtml(c.pppoe_secret)}</span></td>
          <td class="cell-strong">${AppUtils.escapeHtml(c.customer_name)}</td>
          <td>${AppUtils.escapeHtml(c.phone_number)}</td>
          <td>${AppUtils.formatDate(c.expired_date)}</td>
          <td>${AppUtils.escapeHtml(c.package_name)}</td>
          <td>${badgeFor(c.customer_status)}</td>
          <td>
            <a class="btn btn-secondary btn-sm" href="edit.html?id=${c.id}">Edit</a>
          </td>
        </tr>
      `
        )
        .join("");
    }

    resultCount.textContent = `Menampilkan ${list.length} dari ${CustomerDB.getAll().length} pelanggan`;

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

  document.getElementById("btn-add-customer").addEventListener("click", () => {
    window.location.href = "edit.html";
  });

  renderSummary();
  renderTable();
})();
