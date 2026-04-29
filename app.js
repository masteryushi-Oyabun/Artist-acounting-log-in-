const users = [
  { id: "admin", password: "1234" },
  { id: "owner", password: "1234" }
];

const sampleSales = [
  { id: 1, date: "2026-04-01", artist: "JC", client: "Sora Kim", appointmentType: "Walk-in", type: "Session", tattoo: 450, tattooPayment: "Cash", tip: 80, tipPayment: "Cash", deposit: 0, depositPayment: "", paid: false },
  { id: 2, date: "2026-04-03", artist: "Mina", client: "Nina Park", appointmentType: "One-Done", type: "Deposit", tattoo: 0, tattooPayment: "", tip: 0, tipPayment: "", deposit: 150, depositPayment: "Credit Card", paid: false },
  { id: 3, date: "2026-04-05", artist: "JC", client: "Gianna Casanova", appointmentType: "On-Going", type: "Deposit", tattoo: 0, tattooPayment: "", tip: 0, tipPayment: "", deposit: 200, depositPayment: "Venmo, Zelle, Cash App", paid: false },
  { id: 4, date: "2026-04-09", artist: "Alex", client: "Marco Lee", appointmentType: "Closing", type: "Session", tattoo: 620, tattooPayment: "Credit Card", tip: 120, tipPayment: "Credit Card", deposit: 0, depositPayment: "", paid: false },
  { id: 5, date: "2026-04-12", artist: "JC", client: "Armando Gonzales", appointmentType: "On-Going", type: "Session", tattoo: 900, tattooPayment: "Cash", tip: 150, tipPayment: "Cash", deposit: 0, depositPayment: "", paid: false },
  { id: 6, date: "2026-04-12", artist: "JC", client: "Maya Stone", appointmentType: "Walk-in", type: "Session", tattoo: 280, tattooPayment: "Credit Card", tip: 45, tipPayment: "Credit Card", deposit: 0, depositPayment: "", paid: false },
  { id: 7, date: "2026-04-12", artist: "JC", client: "Leo Grant", appointmentType: "One-Done", type: "Session", tattoo: 360, tattooPayment: "Venmo, Zelle, Cash App", tip: 70, tipPayment: "Venmo, Zelle, Cash App", deposit: 0, depositPayment: "", paid: false },
  { id: 8, date: "2026-04-12", artist: "JC", client: "Iris Cho", appointmentType: "Walk-in", type: "Session", tattoo: 220, tattooPayment: "Cash", tip: 35, tipPayment: "Cash", deposit: 0, depositPayment: "", paid: false },
  { id: 9, date: "2026-04-15", artist: "Sam", client: "Jenna Choi", appointmentType: "Walk-in", type: "Session", tattoo: 380, tattooPayment: "Venmo, Zelle, Cash App", tip: 60, tipPayment: "Venmo, Zelle, Cash App", deposit: 0, depositPayment: "", paid: false },
  { id: 10, date: "2026-04-18", artist: "Mina", client: "David Smith", appointmentType: "One-Done", type: "Session", tattoo: 520, tattooPayment: "Cash", tip: 90, tipPayment: "Cash", deposit: 0, depositPayment: "", paid: false },
  { id: 11, date: "2026-04-21", artist: "JC", client: "Chang-hee Lee", appointmentType: "On-Going", type: "Deposit", tattoo: 0, tattooPayment: "", tip: 0, tipPayment: "", deposit: 1000, depositPayment: "Cash", paid: false },
  { id: 12, date: "2026-04-24", artist: "Alex", client: "Rachel Moon", appointmentType: "Walk-in", type: "Deposit", tattoo: 0, tattooPayment: "", tip: 0, tipPayment: "", deposit: 250, depositPayment: "Credit Card", paid: false },
  { id: 13, date: "2026-04-28", artist: "JC", client: "Hana Seo", appointmentType: "Closing", type: "Session", tattoo: 700, tattooPayment: "Credit Card", tip: 140, tipPayment: "Credit Card", deposit: 0, depositPayment: "", paid: false }
];

let activeTab = "daily";
let pendingPaidId = null;
const artistColors = {
  JC: "#236c8f",
  Mina: "#8f5f23",
  Alex: "#5f7f3a",
  Sam: "#7a4f8f"
};
const graphSeries = [
  { key: "total", label: "Total", color: "#c8cdd3" },
  { key: "cash", label: "Cash", color: "#a9d5c1" },
  { key: "card", label: "Card", color: "#f2c7a5" },
  { key: "app", label: "App", color: "#bfc7ee" }
];

const $ = (selector) => document.querySelector(selector);

function setScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === id);
  });
}

function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
}

function shortDate(value) {
  const [, month, day] = value.split("-");
  return `${month}/${day}`;
}

function betweenDates(row, from, to) {
  return (!from || row.date >= from) && (!to || row.date <= to);
}

function sum(rows, key = "amount") {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function rowTotal(row) {
  return row.tattoo + row.tip + row.deposit;
}

function paymentIcon(type) {
  if (!type) {
    return "";
  }

  if (type === "Cash") {
    return "<span class=\"payment-icon cash\" title=\"Cash\">cash</span>";
  }

  if (type === "Credit Card") {
    return "<span class=\"payment-icon card\" title=\"Credit Card\">card</span>";
  }

  return "<span class=\"payment-icon app\" title=\"Venmo, Zelle, Cash App\">APP</span>";
}

function amountWithPayment(amount, payment) {
  if (!amount) {
    return "-";
  }

  return `<span class="amount-with-icon">${money(amount)} ${paymentIcon(payment)}</span>`;
}

function fillArtistSelect() {
  const artists = getArtistOptions();
  $("#artist-select").innerHTML = artists.map((artist) => `<option value="${artist}">${artist}</option>`).join("");
}

function getArtistOptions() {
  const artists = [...new Set(sampleSales.map((row) => row.artist))];
  return ["summary", "invoice"].includes(activeTab) ? artists : ["All Artists", ...artists];
}

function refreshArtistSelect() {
  const previous = $("#artist-select").value;
  const artists = getArtistOptions();
  $("#artist-select").innerHTML = artists.map((artist) => `<option value="${artist}">${artist}</option>`).join("");
  $("#artist-select").value = artists.includes(previous) ? previous : artists[0];
}

function setDefaultDates() {
  $("#report-from").value = "2026-04-01";
  $("#report-to").value = "2026-04-30";
}

function getFilteredSessionRows() {
  const from = $("#report-from").value;
  const to = $("#report-to").value;
  const artist = $("#artist-select").value;

  return sampleSales.filter((row) => {
    const artistMatches = artist === "All Artists" || row.artist === artist;
    return artistMatches && betweenDates(row, from, to);
  });
}

function updateDailyReport(rows) {
  renderDailyTable(rows);
}

function renderDailyTable(rows) {
  $("#daily-sales-table").innerHTML = rows.map((row, index) => {
    const previous = rows[index - 1];
    const sameDate = previous && previous.date === row.date;
    return `
      <tr class="${sameDate ? "same-date-row" : ""}">
        <td>${sameDate ? "" : shortDate(row.date)}</td>
        <td>${row.artist}</td>
        <td>${row.client}</td>
        <td>${row.appointmentType}</td>
        <td>${amountWithPayment(row.tattoo, row.tattooPayment)}</td>
        <td>${amountWithPayment(row.tip, row.tipPayment)}</td>
        <td>${amountWithPayment(row.deposit, row.depositPayment)}</td>
        <td>${money(rowTotal(row))}</td>
        <td>
          <button class="status-button ${row.paid ? "paid" : "unpaid"}" type="button" data-status-id="${row.id}" aria-label="Toggle paid status">
            ${row.paid ? "PAID" : "UNPAID"}
          </button>
        </td>
        <td>
          <button class="icon-button view-button" type="button" data-view-id="${row.id}" aria-label="View sale detail">VIEW</button>
        </td>
      </tr>
    `;
  }).join("") || "<tr><td colspan=\"10\">No sales in this filter.</td></tr>";
}

function updateGraphReport(rows) {
  renderDailyChart(rows);
}

function updateArtistReport(rows) {
  return rows;
}

function updateReports() {
  const rows = getFilteredSessionRows();
  updateDailyReport(rows);
  updateArtistReport(rows);
  updateGraphReport(rows);
  updateSummaryReport(rows);
  updateInvoiceReport(rows);
}

function setActiveTab(tab) {
  activeTab = tab;
  refreshArtistSelect();
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.reportTab === tab);
  });
  document.querySelectorAll(".report-view").forEach((view) => {
    view.classList.toggle("active", view.id === `${tab}-report`);
  });
  updateReports();
}

function renderDailyChart(rows) {
  const selectedArtist = $("#artist-select").value;
  const artists = selectedArtist === "All Artists"
    ? [...new Set(sampleSales.map((row) => row.artist))]
    : [selectedArtist];
  const byArtist = artists.reduce((result, artist) => {
    result[artist] = { total: 0, cash: 0, card: 0, app: 0 };
    return result;
  }, {});

  rows.forEach((row) => {
    if (!byArtist[row.artist]) {
      return;
    }

    addGraphAmount(byArtist[row.artist], row.tattoo, row.tattooPayment);
    addGraphAmount(byArtist[row.artist], row.deposit, row.depositPayment);
  });

  const max = Math.max(...artists.flatMap((artist) => {
    return graphSeries.map((series) => byArtist[artist][series.key] || 0);
  }), 1);

  $("#graph-legend").innerHTML = graphSeries.map((series) => {
    return `
      <span class="legend-item">
        <span class="legend-swatch" style="background: ${series.color}"></span>
        ${series.label}
      </span>
    `;
  }).join("");

  $("#daily-chart").innerHTML = artists.map((artist) => {
    return `
      <div class="vertical-group">
        <div class="vertical-bars artist-breakdown-bars">
          ${graphSeries.map((series) => {
            const value = byArtist[artist][series.key] || 0;
            const height = value ? Math.max((value / max) * 100, 8) : 0;
            return `
              <div class="vertical-bar-wrap">
                <span class="vertical-value">${value ? money(value) : ""}</span>
                <div class="vertical-bar" title="${artist} ${series.label} ${money(value)}" style="height: ${height}%; background: ${series.color}"></div>
                <span class="vertical-bar-label">${series.label}</span>
              </div>
            `;
          }).join("")}
        </div>
        <span class="vertical-date">${artist}</span>
      </div>
    `;
  }).join("") || "<p class=\"hint\">No sales in this date range.</p>";
}

function addGraphAmount(total, amount, payment) {
  if (!amount) {
    return;
  }

  total.total += amount;

  if (payment === "Cash") {
    total.cash += amount;
  } else if (payment === "Credit Card") {
    total.card += amount;
  } else if (payment === "Venmo, Zelle, Cash App") {
    total.app += amount;
  }
}

function renderArtistTable(rows) {
  return rows;
}

function updateSummaryReport(rows) {
  if (!rows.length) {
    $("#summary-table").innerHTML = "<tr><td colspan=\"6\">No summary rows in this filter.</td></tr>";
    return;
  }

  const totals = {
    tattoo: paymentTotals(rows, "tattoo", "tattooPayment"),
    tip: paymentTotals(rows, "tip", "tipPayment"),
    deposit: paymentTotals(rows, "deposit", "depositPayment")
  };
  const columnTotals = {
    tattoo: totals.tattoo.cash + totals.tattoo.card + totals.tattoo.app,
    tip: totals.tip.cash + totals.tip.card + totals.tip.app,
    deposit: totals.deposit.cash + totals.deposit.card + totals.deposit.app
  };

  $("#summary-table").innerHTML = `
    ${summaryListRows(rows)}
    ${summaryPaymentHeader()}
    ${summaryTotalRow("cash", totals.tattoo.cash, totals.tip.cash, totals.deposit.cash)}
    ${summaryTotalRow("card", totals.tattoo.card, totals.tip.card, totals.deposit.card)}
    ${summaryTotalRow("app", totals.tattoo.app, totals.tip.app, totals.deposit.app)}
    ${summaryTotalRow("total", columnTotals.tattoo, columnTotals.tip, columnTotals.deposit, "summary-total-row")}
  `;
}

function updateInvoiceReport(rows) {
  if (!rows.length) {
    $("#invoice-table").innerHTML = "<tr><td colspan=\"6\">No invoice rows in this filter.</td></tr>";
    return;
  }

  const adjustedRows = rows.map(invoiceAdjustedRow);
  const totals = {
    tattoo: paymentTotals(adjustedRows, "tattoo", "tattooPayment"),
    tip: paymentTotals(adjustedRows, "tip", "tipPayment"),
    deposit: paymentTotals(adjustedRows, "deposit", "depositPayment")
  };
  const columnTotals = {
    tattoo: totals.tattoo.cash + totals.tattoo.card + totals.tattoo.app,
    tip: totals.tip.cash + totals.tip.card + totals.tip.app,
    deposit: totals.deposit.cash + totals.deposit.card + totals.deposit.app
  };

  $("#invoice-table").innerHTML = `
    ${summaryListRows(adjustedRows)}
    ${summaryPaymentHeader()}
    ${summaryTotalRow("cash", totals.tattoo.cash, totals.tip.cash, totals.deposit.cash)}
    ${summaryTotalRow("card", totals.tattoo.card, totals.tip.card, totals.deposit.card)}
    ${summaryTotalRow("app", totals.tattoo.app, totals.tip.app, totals.deposit.app)}
    ${summaryTotalRow("total", columnTotals.tattoo, columnTotals.tip, columnTotals.deposit, "summary-total-row invoice-total-row")}
    ${invoicePaymentBox()}
  `;
}

function invoiceAdjustedRow(row) {
  const rate = Number($("#invoice-percentage").value || 0) / 100;

  return {
    ...row,
    tattoo: Math.round(row.tattoo * rate),
    deposit: Math.round(row.deposit * rate)
  };
}

function paymentTotals(rows, amountKey, paymentKey) {
  return rows.reduce((total, row) => {
    const amount = row[amountKey] || 0;
    const payment = row[paymentKey];

    if (payment === "Cash") {
      total.cash += amount;
    } else if (payment === "Credit Card") {
      total.card += amount;
    } else if (payment === "Venmo, Zelle, Cash App") {
      total.app += amount;
    }

    return total;
  }, { cash: 0, card: 0, app: 0 });
}

function summaryListRows(rows) {
  return rows.map((row, index) => {
    const previous = rows[index - 1];
    const sameDate = previous && previous.date === row.date;
    return `
      <tr class="${sameDate ? "same-date-row" : ""}">
        <td>${sameDate ? "" : shortDate(row.date)}</td>
        <td>${row.artist}</td>
        <td>${row.client}</td>
        <td>${amountWithPayment(row.tattoo, row.tattooPayment)}</td>
        <td>${amountWithPayment(row.tip, row.tipPayment)}</td>
        <td>${amountWithPayment(row.deposit, row.depositPayment)}</td>
      </tr>
    `;
  }).join("");
}

function summaryPaymentHeader() {
  return `
    <tr class="summary-total-heading">
      <th colspan="3">Total</th>
      <th>Tattoo</th>
      <th>Tip</th>
      <th>Deposit</th>
    </tr>
  `;
}

function summaryTotalRow(label, tattoo, tip, deposit, className = "") {
  return `
    <tr class="${className}">
      <td></td>
      <td></td>
      <td>${label}</td>
      <td>${money(tattoo)}</td>
      <td>${money(tip)}</td>
      <td>${money(deposit)}</td>
    </tr>
  `;
}

function invoicePaymentBox() {
  return `
    <tr class="invoice-payment-box-row">
      <td colspan="6">
        <div class="invoice-payment-box">
          <div>Cash</div>
          <div>Check</div>
        </div>
      </td>
    </tr>
  `;
}

function openDetail(row) {
  $("#detail-title").textContent = `${row.client} - ${row.type}`;
  $("#detail-grid").innerHTML = `
    <dt>Date</dt><dd>${row.date}</dd>
    <dt>Artist</dt><dd>${row.artist}</dd>
    <dt>Client</dt><dd>${row.client}</dd>
    <dt>Appointment</dt><dd>${row.appointmentType}</dd>
    <dt>Type</dt><dd>${row.type}</dd>
    <dt>Tattoo</dt><dd>${amountWithPayment(row.tattoo, row.tattooPayment)}</dd>
    <dt>Tip</dt><dd>${amountWithPayment(row.tip, row.tipPayment)}</dd>
    <dt>Deposit</dt><dd>${amountWithPayment(row.deposit, row.depositPayment)}</dd>
    <dt>Total</dt><dd>${money(rowTotal(row))}</dd>
    <dt>Status</dt><dd>${row.paid ? "PAID" : "UNPAID"}</dd>
    <dt>Invoice #</dt><dd>${row.invoiceNumber || "-"}</dd>
    <dt>Paid Date</dt><dd>${row.paidDate || "-"}</dd>
    <dt>Paid Memo</dt><dd>${row.paidMemo || "-"}</dd>
  `;
  $("#detail-dialog").showModal();
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function openPaidDialog(row) {
  pendingPaidId = row.id;
  $("#paid-invoice").value = row.invoiceNumber || "";
  $("#paid-date").value = row.paidDate || todayValue();
  $("#paid-memo").value = row.paidMemo || "";
  $("#paid-dialog").showModal();
  $("#paid-invoice").focus();
}

function closePaidDialog() {
  pendingPaidId = null;
  $("#paid-dialog").close();
}

function savePaidStatus(event) {
  event.preventDefault();
  const row = sampleSales.find((sale) => sale.id === pendingPaidId);

  if (!row) {
    closePaidDialog();
    return;
  }

  row.paid = true;
  row.invoiceNumber = $("#paid-invoice").value.trim() || "-";
  row.paidDate = $("#paid-date").value || todayValue();
  row.paidMemo = $("#paid-memo").value.trim();
  closePaidDialog();
  updateReports();
}

function getUnpaidFilteredRows() {
  return getFilteredSessionRows().filter((row) => !row.paid);
}

function openPeriodPaidDialog() {
  const rows = getUnpaidFilteredRows();
  const from = $("#report-from").value || "start";
  const to = $("#report-to").value || "end";
  const artist = $("#artist-select").value || "All Artists";

  if (!rows.length) {
    $("#period-paid-note").textContent = `No unpaid sales for ${artist}, ${from} to ${to}.`;
  } else {
    $("#period-paid-note").textContent = `${rows.length} unpaid sale${rows.length === 1 ? "" : "s"} will be marked PAID for ${artist}, ${from} to ${to}.`;
  }

  $("#period-paid-invoice").value = "";
  $("#period-paid-date").value = todayValue();
  $("#period-paid-memo").value = "";
  $("#period-paid-dialog").showModal();
  $("#period-paid-invoice").focus();
}

function closePeriodPaidDialog() {
  $("#period-paid-dialog").close();
}

function savePeriodPaidStatus(event) {
  event.preventDefault();
  const rows = getUnpaidFilteredRows();

  rows.forEach((row) => {
    row.paid = true;
    row.invoiceNumber = $("#period-paid-invoice").value.trim() || "-";
    row.paidDate = $("#period-paid-date").value || todayValue();
    row.paidMemo = $("#period-paid-memo").value.trim();
  });

  closePeriodPaidDialog();
  updateReports();
}

function logIn() {
  const id = $("#user-id").value.trim();
  const password = $("#user-password").value;
  const matchingUser = users.find((user) => user.id.toLowerCase() === id.toLowerCase());

  if (!matchingUser || matchingUser.password !== password) {
    $("#login-error").textContent = "ID or password is not correct.";
    return;
  }

  $("#login-error").textContent = "";
  setScreen("dashboard-screen");
  updateReports();
}

$("#login-button").addEventListener("click", logIn);

$("#user-password").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    logIn();
  }
});

$("#logout-button").addEventListener("click", () => {
  $("#user-id").value = "";
  $("#user-password").value = "";
  setScreen("login-screen");
  $("#user-id").focus();
});

fillArtistSelect();
setDefaultDates();
["report-from", "report-to", "artist-select"].forEach((id) => {
  $(`#${id}`).addEventListener("change", updateReports);
});

$("#invoice-percentage").addEventListener("input", updateReports);

document.querySelectorAll("[data-report-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.reportTab);
  });
});

document.querySelectorAll("[data-print-view]").forEach((button) => {
  button.addEventListener("click", () => {
    window.print();
  });
});

$("#daily-sales-table").addEventListener("click", (event) => {
  const statusButton = event.target.closest("[data-status-id]");
  if (statusButton) {
    const row = sampleSales.find((sale) => sale.id === Number(statusButton.dataset.statusId));
    if (row.paid) {
      row.paid = false;
      row.invoiceNumber = "";
      row.paidDate = "";
      row.paidMemo = "";
      updateReports();
      return;
    }

    openPaidDialog(row);
    return;
  }

  const viewButton = event.target.closest("[data-view-id]");
  if (viewButton) {
    const row = sampleSales.find((sale) => sale.id === Number(viewButton.dataset.viewId));
    openDetail(row);
  }
});

$("#detail-close-button").addEventListener("click", () => {
  $("#detail-dialog").close();
});

$("#paid-form").addEventListener("submit", savePaidStatus);

$("#paid-cancel-button").addEventListener("click", closePaidDialog);

$("#paid-back-button").addEventListener("click", closePaidDialog);

$("#mark-period-paid-button").addEventListener("click", openPeriodPaidDialog);

$("#period-paid-form").addEventListener("submit", savePeriodPaidStatus);

$("#period-paid-cancel-button").addEventListener("click", closePeriodPaidDialog);

$("#period-paid-back-button").addEventListener("click", closePeriodPaidDialog);

$("#user-id").focus();
