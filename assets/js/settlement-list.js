(function () {
  let ledgerSearch = "", ledgerFilter = "";

  function fmtRupiah(n) { return "Rp" + new Intl.NumberFormat("id-ID").format(n); }

  function renderSummary() {
    const s = SettlementDB.summary();
    const p = PayoutDB.summary();
    document.getElementById("summary-grid").innerHTML = `
      <div class="summary-card total"><div class="label">Saldo Pending</div><div class="value">${fmtRupiah(s.totalPendingAmount)}</div><div class="hint">Hak Mitra belum dicairkan</div></div>
      <div class="summary-card active"><div class="label">Total Settled</div><div class="value">${fmtRupiah(s.totalSettledAmount)}</div><div class="hint">Sudah dicairkan</div></div>
      <div class="summary-card isolir"><div class="label">Payout Requested</div><div class="value">${p.requested}</div><div class="hint">Menunggu approval Finance</div></div>
      <div class="summary-card terminate"><div class="label">Payout Paid</div><div class="value">${p.paid}</div><div class="hint">Sudah transfer</div></div>
    `;
  }

  function badgeFor(status) {
    const map = { pending:"badge-isolir", settled:"badge-active", cancelled:"badge-terminate" };
    return `<span class="badge ${map[status] || ""}">${status}</span>`;
  }

  function payoutBadge(status) {
    const map = { requested:"badge-isolir", approved:"badge-isolir", paid:"badge-active", rejected:"badge-terminate" };
    return `<span class="badge ${map[status] || ""}">${status}</span>`;
  }

  function renderLedger() {
    let list = SettlementDB.getAll();
    if (ledgerSearch) {
      const t = ledgerSearch.toLowerCase();
      list = list.filter(s => s.invoice_number.toLowerCase().includes(t) || s.customer_name.toLowerCase().includes(t));
    }
    if (ledgerFilter) list = list.filter(s => s.status === ledgerFilter);
    const tbody = document.getElementById("ledger-tbody");
    if (list.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="7">Tidak ada ledger yang cocok.</td></tr>`;
    } else {
      tbody.innerHTML = list.map(s => `
        <tr>
          <td><span class="package-code-tag">${AppUtils.escapeHtml(s.invoice_number)}</span></td>
          <td class="cell-strong">${AppUtils.escapeHtml(s.customer_name)}</td>
          <td>${fmtRupiah(s.selling_price)}</td>
          <td>${fmtRupiah(s.base_price)}</td>
          <td>${fmtRupiah(s.gateway_fee)}</td>
          <td class="cell-strong">${fmtRupiah(s.mitra_amount)}</td>
          <td>${badgeFor(s.status)}</td>
        </tr>
      `).join("");
    }
    document.getElementById("ledger-result-count").textContent = `Menampilkan ${list.length} dari ${SettlementDB.getAll().length} ledger`;
  }

  function renderPayouts() {
    const list = PayoutDB.getAll();
    const tbody = document.getElementById("payout-tbody");
    if (list.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Belum ada pengajuan payout.</td></tr>`;
    } else {
      tbody.innerHTML = list.map(p => `
        <tr>
          <td>${AppUtils.formatDate(p.created_at)}</td>
          <td class="cell-strong">${fmtRupiah(p.amount)}</td>
          <td>${AppUtils.escapeHtml(p.bank_name || "-")} · ${AppUtils.escapeHtml(p.bank_account_number || "-")}</td>
          <td>${payoutBadge(p.status)}</td>
          <td class="cell-muted">${AppUtils.escapeHtml(p.proof_file || "-")}</td>
          <td>${p.paid_at ? AppUtils.formatDate(p.paid_at) : "-"}</td>
        </tr>
      `).join("");
    }
  }

  function showPayoutModal() {
    const s = SettlementDB.summary();
    const pendingAmount = s.totalPendingAmount;
    const modalRoot = document.getElementById("modal-root");
    if (pendingAmount <= 0) { AppUtils.toast("Saldo pending kosong. Tidak bisa ajukan payout.", "danger"); return; }
    modalRoot.innerHTML = `
      <div class="modal-overlay"><div class="modal-box">
        <h3>Ajukan Payout Settlement</h3>
        <p>Saldo pending: <b>${fmtRupiah(pendingAmount)}</b></p>
        <div class="form-field" style="margin-top:14px;">
          <label>Amount Pencairan</label>
          <input type="number" id="modal-amount" value="${pendingAmount}" max="${pendingAmount}" min="1" style="width:100%;" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="modal-cancel">Batal</button>
          <button class="btn btn-primary" id="modal-confirm">Ajukan</button>
        </div>
      </div></div>`;
    document.getElementById("modal-cancel").onclick = () => { modalRoot.innerHTML = ""; };
    document.getElementById("modal-confirm").onclick = () => {
      const amount = Number(document.getElementById("modal-amount").value);
      if (amount <= 0 || amount > pendingAmount) { AppUtils.toast("Amount tidak valid.", "danger"); return; }
      PayoutDB.create({ amount, bank_name:"BCA", bank_account_number:"1234567890", bank_account_name:"PT Dasarata Network" });
      modalRoot.innerHTML = "";
      AppUtils.toast("Payout diajukan. Menunggu approval Finance.", "success");
      renderSummary();
      renderPayouts();
    };
  }

  document.getElementById("ledger-search").addEventListener("input", AppUtils.debounce(e => { ledgerSearch = e.target.value.trim(); renderLedger(); }, 200));
  document.getElementById("ledger-filter-status").addEventListener("change", e => { ledgerFilter = e.target.value; renderLedger(); });
  document.getElementById("ledger-reset-filter").addEventListener("click", () => {
    ledgerSearch = ""; ledgerFilter = "";
    document.getElementById("ledger-search").value = "";
    document.getElementById("ledger-filter-status").value = "";
    renderLedger();
  });
  document.getElementById("btn-request-payout").addEventListener("click", showPayoutModal);

  renderSummary();
  renderLedger();
  renderPayouts();
})();
