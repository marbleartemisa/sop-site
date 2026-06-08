
const API = "https://script.google.com/macros/s/AKfycbzVLUTOzA0gGIfKml7kWBAWIjSE6g473aBDmFCg-cN2UzSG2-VnKElingOTgCSdeIumfg/exec";

let DATA = [];

async function loadData() {

  const res = await fetch(API);
  DATA = await res.json();

  render();
}

function render() {

  renderTable("all", DATA);

  renderFiltered("breton", "BRETON");
  renderFiltered("manual", "MANUAL");

  renderSummary();
}

function renderFiltered(id, resource) {

  const filtered = DATA.filter(x => x.Resource === resource);

  renderTable(id, filtered);
}

function renderTable(id, data) {

  const el = document.getElementById(id);

  if (!data.length) {
    el.innerHTML = "<tr><td>No data</td></tr>";
    return;
  }

  const headers = Object.keys(data[0]);

  let html = "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";

  data.forEach(row => {
    html += "<tr>" +
      headers.map(h => `<td>${row[h]}</td>`).join("") +
      "</tr>";
  });

  el.innerHTML = html;
}

function renderSummary() {

  const total = DATA.length;

  const resources = [...new Set(DATA.map(x => x.Resource))];

  document.getElementById("summary").innerHTML = `
    <div class="card">📦 Jobs: ${total}</div>
    <div class="card">⚙️ Resources: ${resources.length}</div>
  `;
}

loadData();
