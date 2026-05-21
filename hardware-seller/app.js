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
        <div class="item-meta">${item.category || ""}</div>
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
   DETAIL PANEL (NEW STRUCTURE)
========================= */
function renderDetail(item) {
  const detail = document.getElementById("detail");

  // IMAGEN (media array o fallback)
  const image =
    (item.media && item.media[0]?.url) ||
    item.image_url ||
    "/sop-site/images/no-image.png";

  detail.innerHTML = `
    <div class="card">

      <!-- HERO -->
      <div class="card-hero">

        <div class="card-image">
          <img src="${image}" alt="${item.name}">
        </div>

        <div class="card-info">

          <h1>${item.name || "Unnamed Hardware"}</h1>

          <p class="card-desc">
            ${item.description || "No description available"}
          </p>

          <div class="tags">
            ${(item.compatible || [])
              .map((c) => `<div class="tag">${c}</div>`)
              .join("")}
          </div>

        </div>

      </div>

      <!-- SYSTEM INFO -->
      <div class="section">
        <h3>System</h3>

        <div class="spec-list">
          <div class="spec-item">
            Type: ${item.system?.type || "-"}
          </div>

          <div class="spec-item">
            Corner: ${item.system?.corner || "-"}
          </div>

          <div class="spec-item">
            Install: ${item.system?.install || "-"}
          </div>
        </div>
      </div>

      <!-- REQUIREMENTS -->
      <div class="section">
        <h3>Requirements</h3>

        <div class="spec-list">
          ${(item.requirements || [])
            .map((r) => `<div class="spec-item">${r}</div>`)
            .join("")}
        </div>
      </div>

      <!-- WARNINGS -->
      <div class="section">
        <h3>Warnings</h3>

        <div class="spec-list">
          ${(item.warnings || [])
            .map((w) => `<div class="spec-item">${w}</div>`)
            .join("")}
        </div>
      </div>

      <!-- SPECIFICATIONS -->
      <div class="section">
        <h3>Specifications</h3>

        <div class="spec-list">
          <div class="spec-item">
            Vendor: ${item.specifications?.vendor || "-"}
          </div>

          <div class="spec-item">
            Cost: ${item.specifications?.cost || "-"}
          </div>

          <div class="spec-item">
            Material: ${item.specifications?.material || "-"}
          </div>

          <div class="spec-item">
            Finish: ${item.specifications?.finish || "-"}
          </div>
        </div>
      </div>

    </div>
  `;

  /* MOBILE SCROLL FIX */
  if (window.innerWidth < 900) {
    detail.scrollIntoView({ behavior: "smooth" });
  }
}

/* =========================
   TOGGLES
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
