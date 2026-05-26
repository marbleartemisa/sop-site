const API =
  "https://script.google.com/macros/s/AKfycbzY1yMs1NX3IlkIXI1iKjRvZvaCxIJUFAxR5R47xkN6Cc4zMD2IuVGFbM0mjGzO1DMt8w/exec?type=full";

let DB = [];
let INDEX = {}; // lookup rápido por id

/* =========================
   LOAD DATA (OPTIMIZADO)
========================= */
async function loadData() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Invalid API response");

    DB = data;

    // 🔥 INDEX PARA PERFORMANCE (CLAVE)
    INDEX = {};
    DB.forEach(item => {
      if (item?.id) INDEX[item.id] = item;
    });

    renderSidebar();

  } catch (err) {
    console.error("API error:", err);
    document.getElementById("sidebar").innerHTML =
      `<div style="color:red;padding:10px">Error loading data</div>`;
  }
}

/* =========================
   SIDEBAR (RÁPIDO + SEGURO)
========================= */
function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  if (!DB.length) return;

  const grouped = groupBy(DB, "category");

  for (const cat in grouped) {

    const group = document.createElement("div");
    group.className = "group";

    group.innerHTML = `<div class="group-title">${cat || "Uncategorized"}</div>`;

    grouped[cat].forEach(item => {

      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <div class="item-name">${item?.name || "Unnamed"}</div>
        <div class="item-meta">
          ${item?.system || ""} ${item?.size || ""}
        </div>
      `;

      div.addEventListener("click", () => {

        document.querySelectorAll(".item")
          .forEach(x => x.classList.remove("active"));

        div.classList.add("active");

        renderDetail(item.id); // 🔥 ahora usa INDEX (más rápido)
      });

      group.appendChild(div);
    });

    sidebar.appendChild(group);
  }
}

/* =========================
   DETAIL (FIX PRINCIPAL)
========================= */
function renderDetail(id) {

  const item = INDEX[id];

  const detail = document.getElementById("detail");

  if (!item) {
    detail.innerHTML = `<div style="padding:20px">Item not found</div>`;
    return;
  }

  // 🔥 SAFE VARIANTS PARSE
  const variants = parseVariants(item.variants);

  const details = item.details || {};

  detail.innerHTML = `
    <div class="card">

  ${
    item.image_url
      ? `
        <div class="card-image-wrap">
          <img
            src="${item.image_url}"
            alt="${item.name}"
            class="main-image"
          >
        </div>
      `
      : ""
  }

      <h1>${item.name || "Unnamed Item"}</h1>

      <p>${item.system || ""} - ${item.size || ""}</p>

      <p>Cabinet: ${item.cabinet_required || "-"}</p>

      <!-- VARIANTS -->
      <h3>Brands / Variants</h3>

      <div class="variants">
        ${
          variants.length
            ? variants.map(v => `
                <div class="variant-card">

                  <strong>${v.brand || "-"}</strong>

                  <div>SKU: ${v.sku || "-"}</div>
                  <div>Finish: ${v.finish || "-"}</div>

                  <div>
                    Price: $${v.price_min || "-"} - $${v.price_max || "-"}
                  </div>

                  <div>
                    ${v.image_url ? `<a href="${v.image_url}" target="_blank">Image</a>` : ""}
                    ${v.diagram_url ? ` | <a href="${v.diagram_url}" target="_blank">Diagram</a>` : ""}
                  </div>

                </div>
              `).join("")
            : `<p>No variants available</p>`
        }
      </div>

      <!-- DETAILS -->
      <h3>Requirements</h3>
      ${renderList(details.requirements)}

      <h3>Recommendations</h3>
      ${renderList(details.recommendations)}

      <h3>Warnings</h3>
      ${renderList(details.warnings)}

      <h3>Installation Notes</h3>
      <p>${details.installation_notes || "-"}</p>

      <h3>Plumbing Notes</h3>
      <p>${details.plumbing_notes || "-"}</p>

    </div>
  `;

  // UX: scroll en mobile
  if (window.innerWidth < 900) {
    detail.scrollIntoView({ behavior: "smooth" });
  }
}

/* =========================
   HELPERS
========================= */

// 🔥 FIX VARIANTS (por si viene string o null)
function parseVariants(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;

  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
}

// safe list render
function renderList(data) {

  // vacío
  if (!data) {
    return "<ul><li>-</li></ul>";
  }

  // si viene string desde Sheets
  if (typeof data === "string") {

    // intenta parse JSON
    try {
      const parsed = JSON.parse(data);

      if (Array.isArray(parsed)) {
        data = parsed;
      }

    } catch {

      // separa por saltos, coma o pipe
      data = data
        .split(/\n|,|\|/)
        .map(x => x.trim())
        .filter(Boolean);
    }
  }

  // si no es array válido
  if (!Array.isArray(data) || data.length === 0) {
    return "<ul><li>-</li></ul>";
  }

  return `
    <ul>
      ${data.map(x => `<li>${x}</li>`).join("")}
    </ul>
  `;
}

/* =========================
   GROUP BY
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
