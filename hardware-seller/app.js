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

      div.innerHTML = `
          <div class="item-name">
            ${item.name || "Unnamed"}
          </div>
        
          <div class="item-meta">
            ${item.brand || ""} ${item.size || ""}
          </div>
        `;

      div.onclick = () => {
        
          document
            .querySelectorAll(".item")
            .forEach(x => x.classList.remove("active"));
        
          div.classList.add("active");
        
          renderDetail(item);
        };

      group.appendChild(div);
    });

    sidebar.appendChild(group);
  });
}

/* =========================
   RENDER DETAIL PANEL
========================= */
function renderDetail(item){

  const detail = document.getElementById("detail");

  const image =
    item.image ||
    item.photo ||
    "/sop-site/images/no-image.png";

  detail.innerHTML = `

    <div class="card">

      <!-- HERO -->
      <div class="card-hero">

        <div class="card-image">
          <img src="${image}">
        </div>

        <div class="card-info">

          <h1>${item.name || "Unnamed Hardware"}</h1>

          <div class="card-desc">
            ${item.description || "No description available"}
          </div>

          <div class="tags">
            ${(item.compatible || [])
              .map(c=>`<div class="tag">${c}</div>`)
              .join("")}
          </div>

        </div>

      </div>

      <!-- CONTENT -->
      <div class="card-content">

        <!-- REQUIREMENTS -->
        <div class="section">

          <h3>Requirements</h3>

          <div class="spec-list">

            ${(item.requirements || [])
              .map(r=>`
                <div class="spec-item">
                  ${r}
                </div>
              `).join("")}

          </div>

        </div>

        <!-- WARNINGS -->
        <div class="section">

          <h3>Warnings</h3>

          <div class="spec-list">

            ${(item.warnings || [])
              .map(w=>`
                <div class="spec-item">
                  ${w}
                </div>
              `).join("")}

          </div>

        </div>

        <!-- SPECS -->
        <div class="section">

          <h3>Specifications</h3>

          <div class="spec-list">

            <div class="spec-item">
              Vendor:
              ${item.specs?.vendor || "-"}
            </div>

            <div class="spec-item">
              Cost:
              ${item.specs?.cost || "-"}
            </div>

          </div>

        </div>

      </div>

    </div>
  `;

  /* MOBILE AUTO SCROLL */

  if(window.innerWidth < 900){

    detail.scrollIntoView({
      behavior:"smooth"
    });

  }
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
