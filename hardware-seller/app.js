const API =
  "https://script.google.com/macros/s/AKfycbzY1yMs1NX3IlkIXI1iKjRvZvaCxIJUFAxR5R47xkN6Cc4zMD2IuVGFbM0mjGzO1DMt8w/exec?type=full";

let DB = [];

/* =========================
   LOAD DATA
========================= */
async function loadData() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    // seguridad contra API vacía o error
    DB = Array.isArray(data) ? data : [];

    renderSidebar();
  } catch (err) {
    console.error("API error:", err);
    document.getElementById("sidebar").innerHTML =
      "<p style='color:red;padding:10px'>Error loading data</p>";
  }
}

/* =========================
   RENDER SIDEBAR
========================= */
function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  if (!DB.length) return;

  const grouped = groupBy(DB, "category");

  Object.keys(grouped).forEach((cat) => {
    const group = document.createElement("div");
    group.className = "group";

    group.innerHTML = `<div class="group-title">${cat}</div>`;

    grouped[cat].forEach((item) => {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = item.name || "Unnamed item";

      div.onclick = () => renderDetail(item);

      group.appendChild(div);
    });

    sidebar.appendChild(group);
  });
}

/* =========================
   RENDER DETAIL PANEL
========================= */
function renderDetail(item) {
  const detail = document.getElementById("detail");

  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

  detail.innerHTML = `
    <div class="card">

      <h1>${item.name || "N/A"}</h1>

      <p>${item.description || "No description available"}</p>

      <h3>Compatible</h3>
      <div class="tags">
        ${safeArray(item.compatible)
          .map((c) => `<div class="tag">${c}</div>`)
          .join("")}
      </div>

      <h3>Requirements</h3>
      <ul>
        ${safeArray(item.requirements)
          .map((r) => `<li>${r}</li>`)
          .join("")}
      </ul>

      <h3>Warnings</h3>
      <ul>
        ${safeArray(item.warnings)
          .map((w) => `<li>⚠️ ${w}</li>`)
          .join("")}
      </ul>

      <h3>Vendor</h3>
      <p>${item.specs?.vendor || "N/A"}</p>

      <h3>Cost</h3>
      <p>${item.specs?.cost || "N/A"}</p>

      <h3>Memo</h3>
      <p>${item.specs?.memo || ""}</p>

    </div>
  `;
}

/* =========================
   UI TOGGLES
========================= */
function toggleMenu() {
  document.getElementById("mainMenu").classList.toggle("show");
}

function toggleDropdown(btn) {
  btn.parentElement.classList.toggle("open");
}

/* =========================
   GROUP BY SAFE
========================= */
function groupBy(arr, key) {
  return (arr || []).reduce((acc, obj) => {
    const k = obj?.[key] || "Uncategorized";
    if (!acc[k]) acc[k] = [];
    acc[k].push(obj);
    return acc;
  }, {});
}

/* =========================
   INIT
========================= */
loadData();
