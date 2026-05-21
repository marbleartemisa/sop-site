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

    DB = Array.isArray(data) ? data : [];

    renderSidebar();

  } catch (err) {
    console.error("API error:", err);

    document.getElementById("sidebar").innerHTML =
      `<div style="color:red;padding:10px">
        Error loading hardware data
      </div>`;
  }
}

/* =========================
   SIDEBAR
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

      div.innerHTML = `
        <div class="item-name">${item.name || "Unnamed"}</div>
        <div class="item-meta">${item.system || ""} ${item.size || ""}</div>
      `;

      div.onclick = () => {
        document
          .querySelectorAll(".item")
          .forEach((x) => x.classList.remove("active"));

        div.classList.add("active");

        renderDetail(item);
      };

      group.appendChild(div);
    });

    sidebar.appendChild(group);
  });
}

/* =========================
   DETAIL PANEL (ROBUSTO)
========================= */
function renderDetail(item) {

  const detail = document.getElementById("detail");

  const variants = Array.isArray(item.variants) ? item.variants : [];
  const details = item.details || {};

  const mainVariant = variants[0] || {};

  detail.innerHTML = `
    <div class="card">

      <!-- HEADER -->
      <h1>${item.name || "Unnamed Item"}</h1>

      <p>
        ${item.system || ""} - ${item.size || ""}
      </p>

      <p>
        Cabinet: ${item.cabinet_required || "-"}
      </p>

      <!-- VARIANTS -->
      <h3>Available Brands</h3>

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
                    <a href="${v.image_url || "#"}" target="_blank">Image</a>
                    |
                    <a href="${v.diagram_url || "#"}" target="_blank">Diagram</a>
                  </div>

                </div>
              `).join("")
            : `<p>No variants available</p>`
        }
      </div>

      <!-- DETAILS -->
      <h3>Requirements</h3>
      <ul>
        ${(details.requirements || [])
          .map(r => `<li>${r}</li>`)
          .join("") || "<li>-</li>"}
      </ul>

      <h3>Recommendations</h3>
      <ul>
        ${(details.recommendations || [])
          .map(r => `<li>${r}</li>`)
          .join("") || "<li>-</li>"}
      </ul>

      <h3>Warnings</h3>
      <ul>
        ${(details.warnings || [])
          .map(w => `<li>${w}</li>`)
          .join("") || "<li>-</li>"}
      </ul>

      <h3>Installation Notes</h3>
      <p>${details.installation_notes || "-"}</p>

      <h3>Plumbing Notes</h3>
      <p>${details.plumbing_notes || "-"}</p>

    </div>
  `;
}

/* =========================
   TOGGLES
========================= */
function toggleMenu() {
  document.getElementById("mainMenu")?.classList.toggle("show");
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
