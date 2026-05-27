const API =
  "https://script.google.com/macros/s/AKfycbwwA8TFM4pxWwY_LiQQooUUACuWE_Q1BrPP3YieqwWCR1bTnIZB78S72pDLAhqgxWND4g/exec?type=full";


let DB = [];
let INDEX = {};

/* =========================
   LOAD DATA
========================= */
async function loadData() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Invalid API response");

    DB = data;

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
   SIDEBAR
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

        renderDetail(item.id);
      });

      group.appendChild(div);
    });

    sidebar.appendChild(group);
  }
}

/* =========================
   DETAIL VIEW
========================= */
function renderDetail(id) {

  const item = INDEX[id];
  const detail = document.getElementById("detail");

  if (!item) {
    detail.innerHTML = `<div style="padding:20px">Item not found</div>`;
    return;
  }

  const variants = parseVariants(item.variants);
  const details = item.details || [];
  const media = item.media || [];

const images = media.filter(x =>
  String(x.type || "")
    .trim()
    .toLowerCase() === "image"
);

const diagrams = media.filter(x =>
  String(x.type || "")
    .trim()
    .toLowerCase() === "diagram"
);

/* HERO IMAGE */
const heroImage = images[0] || null;

/* GALLERY IMAGES */
const galleryImages = images.slice(1);

detail.innerHTML = `
<div class="card">

  <!-- HERO -->
  <div class="card-hero">

    <div class="card-image">

      <img
        src="${heroImage?.url || item.image_url || ''}"
        alt="${item.name || ''}"
      >

    </div>

    <div class="card-info">

      <h1>${item.name || "Unnamed Item"}</h1>

      <div class="hero-meta">
        ${item.system || ""} ${item.size || ""}
      </div>

      <div class="hero-cabinet">
        Cabinet Required:
        <strong>${item.cabinet_required || "-"}</strong>
      </div>

      ${
        item.description
          ? `
          <div class="card-desc">
            ${item.description}
          </div>
        `
          : ""
      }

    </div>

  </div>

  <div class="card-content">

    <!-- GALLERY -->
    ${
      galleryImages.length
        ? `
        <div class="section">

          <h3>Product Gallery</h3>

          <div class="gallery">

            ${galleryImages.map(img =>`
              <div class="gallery-item">

                <img
                  src="${img.url}"
                  alt="${img.description || ''}"
                >

                ${
                  img.description
                    ? `<div class="gallery-caption">${img.description}</div>`
                    : ""
                }

              </div>
            `).join("")}

          </div>

        </div>
      `
        : ""
    }

    <!-- DIAGRAMS -->
    ${
      diagrams.length
        ? `
        <div class="section">

          <h3>Technical Diagrams</h3>

          <div class="gallery">

            ${diagrams.map(img => `
              <div class="gallery-item">

                <img
                  src="${img.url}"
                  alt="${img.description || ''}"
                >

                ${
                  img.description
                    ? `<div class="gallery-caption">${img.description}</div>`
                    : ""
                }

              </div>
            `).join("")}

          </div>

        </div>
      `
        : ""
    }

    <!-- VARIANTS -->
    <div class="section">

      <h3>Brands / Variants</h3>

      <div class="variants">

        ${
          variants.length
            ? variants.map(v => `
              <div class="variant-card">

                <div class="variant-brand">
                  ${v.brand || "-"}
                </div>

                <div class="variant-row">
                  <span>SKU</span>
                  <strong>${v.sku || "-"}</strong>
                </div>

                <div class="variant-row">
                  <span>Finish</span>
                  <strong>${v.finish || "-"}</strong>
                </div>

                <div class="variant-row">
                  <span>Price</span>
                  <strong>
                    $${v.price_min || "-"} - $${v.price_max || "-"}
                  </strong>
                </div>
<div class="variant-links">

  ${
    v.image_url
      ? `
        <a
          href="${v.image_url}"
          target="_blank"
          class="brand-link"
        >
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
          Brand Website
        </a>
      `
      : ""
  }

  ${
    v.diagram_url
      ? `
        <a
          href="${v.diagram_url}"
          target="_blank"
          class="spec-link"
        >
          <i class="fa-solid fa-ruler-combined"></i>
          Technical Specs
        </a>
      `
      : ""
  }

</div>

              </div>
            `).join("")
            : `<p>No variants available</p>`
        }

      </div>

    </div>

    <!-- DETAILS -->
    <div class="section">

      <h3>Requirements</h3>
      ${renderList(details.requirements)}

    </div>

    <div class="section">

      <h3>Recommendations</h3>
      ${renderList(details.recommendations)}

    </div>

    <div class="section">

      <h3>Warnings</h3>
      ${renderList(details.warnings)}

    </div>

    <div class="section">

      <h3>Installation Notes</h3>
      <p>${details.installation_notes || "-"}</p>

    </div>

    <div class="section">

      <h3>Plumbing Notes</h3>
      <p>${details.plumbing_notes || "-"}</p>

    </div>

  </div>

</div>
`;

  if (window.innerWidth < 900) {
    detail.scrollIntoView({ behavior: "smooth" });
  }
}

/* =========================
   HELPERS
========================= */

function parseVariants(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;

  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
}

function renderList(data) {

  if (!data) return "<ul><li>-</li></ul>";

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) data = parsed;
    } catch {
      data = data.split(/\n|,|\|/).map(x => x.trim()).filter(Boolean);
    }
  }

  if (!Array.isArray(data) || !data.length) {
    return "<ul><li>-</li></ul>";
  }

  return `<ul>${data.map(x => `<li>${x}</li>`).join("")}</ul>`;
}

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
