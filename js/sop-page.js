// =========================
// SOP PAGE LOGIC
// =========================

let SOP_INDEX = [];

// =========================
// LOAD DATA
// =========================
fetch('SOP_INDEX.json?v=' + Date.now())
  .then(res => res.json())
  .then(data => {
    SOP_INDEX = data;
    sortByDepartment();
    renderSOP();
  });

// =========================
// RENDER
// =========================
function renderSOP(filtered) {
  const container = document.getElementById("sopContainer");
  const list = filtered || SOP_INDEX;

  let html = `
    <div class="sop-info">
      Mostrando <strong>${list.length}</strong> SOP
    </div>

    <table class="sop-table">
      <thead>
        <tr>
          <th>Departamento</th>
          <th>Procedimiento</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
  `;

  list.forEach(sop => {
    html += `
      <tr onclick="openSOP('${sop.url}')">
        <td>${getDepartmentBadge(sop.department)}</td>
        <td class="sop-nombre">${sop.title}</td>
        <td>
          <a class="sop-btn"
             href="/sop-site/viewer.html?doc=${sop.url}"
             onclick="event.stopPropagation()">
            Ver
          </a>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";

  container.innerHTML = html;
}

// =========================
// FILTER
// =========================
function filterSOP() {
  const search = (document.getElementById("searchInput").value || "")
    .toLowerCase().trim();

  const dept = document.getElementById("deptFilter").value;

  const filtered = SOP_INDEX.filter(sop => {
    const matchDept = !dept || sop.department === dept;

    const text = (sop.title + " " + (sop.search_text || "")).toLowerCase();

    const matchSearch = !search || text.includes(search);

    return matchDept && matchSearch;
  });

  renderSOP(filtered);
}

function filterDept(dep) {
  document.getElementById("deptFilter").value = dep;
  filterSOP();
}

// =========================
// SORT
// =========================
function sortTable(field) {
  SOP_INDEX.sort((a, b) =>
    (a[field] || "").localeCompare(b[field] || "")
  );
  renderSOP();
}

// =========================
// OPEN SOP
// =========================
function openSOP(url) {
  window.location.href = "/sop-site/viewer.html?doc=" + url;
}

// =========================
// BADGE
// =========================
function getDepartmentBadge(dep) {

  if (dep === "produccion") dep = "carpinteria";
  if (dep === "instalacion") dep = "stone";

  const names = {
    carpinteria: "Carpintería",
    administracion: "Administración",
    comercial: "Comercial",
    stone: "Stone",
    maquinarias: "Maquinarias",
    vehiculos: "Vehículos",
    ecopower: "Ecopowertech",
    taller: "Taller",
    medidas: "Diseño-Medidas",
    "houzz-pro": "Houzz Pro"
  };

  return `<span class="dept-badge dept-${dep}">${names[dep] || dep}</span>`;
}

// =========================
// SEARCH RANKING
// =========================
function score(sop, q) {
  const query = (q || "").toLowerCase();
  const title = (sop.title || "").toLowerCase();

  if (title === query) return 100;
  if (title.includes(query)) return 50;
  return 0;
}
