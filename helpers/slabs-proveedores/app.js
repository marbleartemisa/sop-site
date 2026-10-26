
(() => {
  "use strict";

  const CSV_URL = "./slabs-proveedores.csv";

  const $ = id => document.getElementById(id);

  const el = {
    search: $("searchInput"),
    clear: $("clearSearch"),
    searchBtn: $("searchBtn"),
    vendor: $("vendorFilter"),
    group: $("groupFilter"),
    finish: $("finishFilter"),
    technology: $("technologyFilter"),
    thickness: $("thicknessFilter"),
    priceType: $("priceTypeFilter"),
    reset: $("resetBtn"),
    status: $("statusMessage"),
    results: $("resultsSection"),
    count: $("resultsCount"),
    groups: $("slabGroups"),
    empty: $("emptyMessage"),
    dialog: $("slabDialog"),
    content: $("dialogContent"),
    close: $("closeDialog")
  };

  let slabs = [];
  let filtered = [];

  // Canonical field names and known Excel header variations.
  const HEADER_ALIASES = {
    PRICELISTID: "ID",
    ID: "ID",
    PROVEEDOR: "VENDOR",
    VENDOR: "VENDOR",
    GROUP: "GROUP",
    GRUPO: "GROUP",
    CODE: "CODE",
    ITEMNAME: "ITEMNAME",
    FINISH: "FINISH",
    TECHNOLOGY: "TECHNOLOGY",
    WIDTH4: "WIDTH4",
    WIDTH6: "WIDTH6",
    WIDTH8: "WIDTH8",
    WIDTH12: "WIDTH12",
    WIDTH20: "WIDTH20",
    WIDTH30: "WIDTH30",
    WIDHT30: "WIDTH30",
    WIDTH12SF: "WIDTH12SF",
    WITDTH12SF: "WIDTH12SF",
    WIDTHTH12SF: "WIDTH12SF",
    WIDTH20SF: "WIDTH20SF",
    WITDTH20SF: "WIDTH20SF",
    WIDTHTH20SF: "WIDTH20SF",
    WIDTH30SF: "WIDTH30SF",
    SF: "SF",
    SIZE: "SIZE",
    URLPHOTO: "URLPHOTO",
    URLUSEDTO: "URLUSEDTO",
    ESTADO: "STATUS",
    STATUS: "STATUS"
  };

  const PRICE_FIELDS = [
    { field: "WIDTH4", label: "4 mm", kind: "slab" },
    { field: "WIDTH6", label: "6 mm", kind: "slab" },
    { field: "WIDTH8", label: "8 mm", kind: "slab" },
    { field: "WIDTH12", label: "12 mm", kind: "slab" },
    { field: "WIDTH20", label: "2 cm", kind: "slab" },
    { field: "WIDTH30", label: "3 cm", kind: "slab" },
    { field: "WIDTH12SF", label: "12 mm", kind: "sf" },
    { field: "WIDTH20SF", label: "2 cm", kind: "sf" },
    { field: "WIDTH30SF", label: "3 cm", kind: "sf" }
  ];

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function norm(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9.#$]+/g, " ")
      .trim();
  }

  function headerKey(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  // Handles quoted commas, escaped quotes and line breaks inside quoted cells.
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, "");

    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (quoted && next === '"') {
          cell += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (char === "," && !quoted) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i++;

        row.push(cell);

        if (row.some(value => value.trim() !== "")) {
          rows.push(row);
        }

        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    if (cell.length || row.length) {
      row.push(cell);
      if (row.some(value => value.trim() !== "")) rows.push(row);
    }

    if (!rows.length) return [];

    const headers = rows.shift().map(header => {
      const key = headerKey(header);
      return HEADER_ALIASES[key] || key;
    });

    const required = [
      "VENDOR", "GROUP", "CODE", "ITEMNAME", "FINISH",
      "TECHNOLOGY", "SIZE", "SF", "URLPHOTO",
      "URLUSEDTO", "STATUS", ...PRICE_FIELDS.map(p => p.field)
    ];

    const missing = required.filter(header => !headers.includes(header));

    if (missing.length) {
      throw new Error(
        "Missing CSV columns: " + missing.join(", ")
      );
    }

    return rows.map(values => {
      const item = {};

      headers.forEach((header, index) => {
        item[header] = String(values[index] ?? "").trim();
      });

      return item;
    }).filter(item => item.CODE || item.ITEMNAME);
  }

  function num(value) {
    let text = String(value ?? "").trim();

    if (!text) return NaN;

    text = text.replace(/[$\s]/g, "");

    // Supports 1,234.56 and 1234.56.
    // For decimal-comma data, export the CSV using decimal points.
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(text)) {
      text = text.replace(/,/g, "");
    } else if (text.includes(",") && !text.includes(".")) {
      text = text.replace(/,/g, "");
    }

    const result = Number(text);
    return Number.isFinite(result) ? result : NaN;
  }

  function money(value) {
    const result = num(value);

    if (!Number.isFinite(result)) {
      return value ? String(value).trim() : "—";
    }

    return result.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function hasPrice(slab, field) {
    return Number.isFinite(num(slab[field]));
  }

  function availablePrices(slab, kind = "") {
    return PRICE_FIELDS.filter(price =>
      (!kind || price.kind === kind) &&
      hasPrice(slab, price.field)
    );
  }

  function availableThicknesses(slab) {
    return [...new Set(
      availablePrices(slab).map(price => price.label)
    )];
  }

  function fillSelect(select, values) {
    const firstOption = select.options[0];
    select.replaceChildren(firstOption);

    [...new Set(
      values.map(value => String(value ?? "").trim()).filter(Boolean)
    )]
      .sort((a, b) => a.localeCompare(
        b, undefined, { numeric: true, sensitivity: "base" }
      ))
      .forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
  }


function formatSize(value) {
  return String(value ?? "")
    .replace(/\uFFFD/g, "")
    .replace(/�/g, "")
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/\s*[xX×]\s*/g, " x ")
    .replace(/\s{2,}/g, " ")
    .trim();
}


  function searchText(slab) {
    return norm([
      slab.ID, slab.VENDOR, slab.GROUP, slab.CODE,
      slab.ITEMNAME, slab.FINISH, slab.TECHNOLOGY,
      slab.SIZE, slab.SF, ...PRICE_FIELDS.map(p => slab[p.field])
    ].join(" "));
  }

  function priceTypeMatches(slab) {
    const kind = el.priceType.value;

    if (!kind) return true;
    return availablePrices(slab, kind).length > 0;
  }

  function applyFilters() {
    const words = norm(el.search.value).split(/\s+/).filter(Boolean);

    return slabs.filter(slab => {
      const text = searchText(slab);

      return words.every(word => text.includes(word)) &&
        (!el.vendor.value || slab.VENDOR === el.vendor.value) &&
        (!el.group.value || slab.GROUP === el.group.value) &&
        (!el.finish.value || slab.FINISH === el.finish.value) &&
        (!el.technology.value || slab.TECHNOLOGY === el.technology.value) &&
        (!el.thickness.value ||
          availableThicknesses(slab).includes(el.thickness.value)) &&
        priceTypeMatches(slab);
    });
  }

  
function photo(url, alt, className) {
  const originalURL = String(url ?? "").trim();

  if (!originalURL) {
    return '<div class="photo-fallback">Photo not available</div>';
  }

  let imageURL = originalURL;

  try {
    const parsed = new URL(originalURL);

    // Convert Google Drive sharing links into image URLs.
    if (
      parsed.hostname === "drive.google.com" ||
      parsed.hostname === "www.drive.google.com"
    ) {
      let fileId = "";

      // Format: /file/d/FILE_ID/view
      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);

      if (match) {
        fileId = match[1];
      } else {
        // Formats using ?id=FILE_ID
        fileId = parsed.searchParams.get("id") || "";
      }

      if (fileId) {
        imageURL =
          "https://drive.google.com/thumbnail?id=" +
          encodeURIComponent(fileId) +
          "&sz=w1600";
      }
    }

    if (!/^https?:$/.test(new URL(imageURL).protocol)) {
      throw new Error("Unsupported image URL");
    }
  } catch (error) {
    return '<div class="photo-fallback">Invalid photo URL</div>';
  }

  const safeURL = esc(imageURL);
  const safeAlt = esc(alt);

  return `
    <img
      class="${className}"
      src="${safeURL}"
      alt="${safeAlt}"
      loading="lazy"
      referrerpolicy="no-referrer"
      onerror="this.onerror=null;this.replaceWith(Object.assign(document.createElement('div'),{className:'photo-fallback',textContent:'Photo unavailable — check Drive sharing permissions'}))"
    >
  `;
}


  function primaryPrice(slab) {
    // Prefer a per-slab price for the card; otherwise show per-SF.
    const price = availablePrices(slab, "slab")[0] ||
      availablePrices(slab, "sf")[0];

    if (!price) {
      return { value: "Price on request", label: "" };
    }

    return {
      value: money(slab[price.field]),
      label: price.kind === "sf"
        ? `${price.label} · per sq. ft.`
        : `${price.label} · per slab`
    };
  }

  function createCard(slab, index) {
    const price = primaryPrice(slab);
    const thicknesses = availableThicknesses(slab);

    return `
      <article class="slab-card" tabindex="0" role="button"
        data-index="${index}" aria-label="View ${esc(slab.ITEMNAME)}">

        <div class="photo-wrap">
          ${photo(slab.URLPHOTO, slab.ITEMNAME, "card-photo")}
        </div>

        <div class="card-body">
          <div class="card-code">
            ${esc(slab.VENDOR || "Supplier")} · ${esc(slab.CODE || "No code")}
          </div>

          <h4 class="card-title">
            ${esc(slab.ITEMNAME || "Unnamed material")}
          </h4>

          <div class="card-meta">
            ${slab.GROUP ? `Group: ${esc(slab.GROUP)}<br>` : ""}
            ${slab.FINISH ? `Finish: ${esc(slab.FINISH)}<br>` : ""}
            ${slab.TECHNOLOGY ? `Technology: ${esc(slab.TECHNOLOGY)}<br>` : ""}  
            ${slab.SIZE ? `Size: ${esc(formatSize(slab.SIZE))}<br>` : ""}
            ${slab.SF ? `Area: ${esc(slab.SF)} sq. ft.` : ""}
          </div>

          ${thicknesses.length ? `
            <div class="thickness-chips">
              ${thicknesses.map(t => `<span class="chip">${esc(t)}</span>`).join("")}
            </div>` : ""}

          <div class="card-price">
            ${esc(price.value)}
            ${price.label ? `<small>${esc(price.label)}</small>` : ""}
          </div>

          <span class="card-link">VIEW DETAILS ↗</span>
        </div>
      </article>
    `;
  }

  function render() {
    filtered = applyFilters();

    el.groups.innerHTML = "";
    el.count.textContent =
      `${filtered.length.toLocaleString("en-US")} materials`;

    el.results.hidden = false;
    el.empty.hidden = filtered.length > 0;
    el.clear.hidden = !el.search.value;

    if (!filtered.length) return;

    const groups = new Map();

    filtered.forEach(slab => {
      const vendor = slab.VENDOR || "Other suppliers";

      if (!groups.has(vendor)) groups.set(vendor, []);
      groups.get(vendor).push(slab);
    });

    [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([vendor, items]) => {
        const section = document.createElement("section");
        section.className = "vendor-group";

        section.innerHTML = `
          <div class="group-heading">
            <h3>${esc(vendor)}</h3>
            <span class="group-count">${items.length}</span>
          </div>
          <div class="slab-grid">
            ${items.map(slab => createCard(slab, slabs.indexOf(slab))).join("")}
          </div>
        `;

        el.groups.appendChild(section);
      });
  }

  function detailItem(label, value) {
    return `
      <div class="detail-item">
        <span class="detail-label">${esc(label)}</span>
        <span class="detail-value">${esc(value || "—")}</span>
      </div>
    `;
  }

  function priceTable(slab) {
    const prices = availablePrices(slab);

    if (!prices.length) {
      return '<p class="no-price">No prices listed. Contact the supplier.</p>';
    }

    return `
      <div class="price-table-wrap">
        <table class="price-table">
          <thead>
            <tr>
              <th>Thickness</th>
              <th>Pricing basis</th>
              <th>Price (USD)</th>
            </tr>
          </thead>
          <tbody>
            ${prices.map(price => `
              <tr>
                <td>${esc(price.label)}</td>
                <td>${price.kind === "sf" ? "Per sq. ft." : "Per slab"}</td>
                <td>${esc(money(slab[price.field]))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function showDetails(slab) {
    el.content.innerHTML = `
      <div class="detail-layout">
        <div class="detail-photos">
          <div class="detail-photo-panel">
            ${photo(slab.URLPHOTO, slab.ITEMNAME, "detail-photo")}
          </div>

          ${slab.URLUSEDTO && /^https?:\/\//i.test(slab.URLUSEDTO.trim()) ? `
            <div class="used-photo-panel">
              <h3>Installed inspiration</h3>
              ${photo(slab.URLUSEDTO, `${slab.ITEMNAME} installed`, "used-photo")}
            </div>
          ` : ""}
        </div>

        <div class="detail-info">
          <div class="eyebrow">${esc(slab.VENDOR || "SUPPLIER")}</div>

          <h2 id="dialogTitle">${esc(slab.ITEMNAME || "Unnamed material")}</h2>

          <div class="detail-code">
            Code: ${esc(slab.CODE || "—")}
            ${slab.ID ? ` · ID: ${esc(slab.ID)}` : ""}
          </div>

          <div class="detail-grid">
            ${detailItem("Vendor", slab.VENDOR)}
            ${detailItem("Group", slab.GROUP)}
            ${detailItem("Finish", slab.FINISH)}
            ${detailItem("Technology", slab.TECHNOLOGY)}
            ${detailItem("Dimensions", formatSize(slab.SIZE))}
            ${detailItem("Area (sq. ft.)", slab.SF)}
          </div>

          <div class="price-section">
            <h3>Available thicknesses &amp; prices</h3>
            ${priceTable(slab)}
          </div>

          <div class="detail-notice">
            <strong>Supplier material — not warehouse inventory.</strong>
            Prices are reference values from the catalog. Confirm the current
            price, available quantity, exact dimensions, finish, lead time
            and stock with the supplier before preparing a customer quote.
          </div>
        </div>
      </div>
    `;

    if (typeof el.dialog.showModal === "function") {
      el.dialog.showModal();
    } else {
      el.dialog.setAttribute("open", "");
    }
  }

  function setStatus(message, isError = false) {
    el.status.textContent = message;
    el.status.classList.toggle("error", isError);
  }

  function resetFilters() {
    el.search.value = "";

    [
      el.vendor, el.group, el.finish,
      el.technology, el.thickness, el.priceType
    ].forEach(select => {
      select.value = "";
    });

    render();

    setStatus(
      `Loaded ${slabs.length.toLocaleString("en-US")} active supplier records.`
    );
  }

  async function init() {
    try {
      const response = await fetch(CSV_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(
          `Could not load slabs-proveedores.csv (HTTP ${response.status}).`
        );
      }

      const parsed = parseCSV(await response.text());

      // N = discontinued. S and blank statuses remain visible;
      // blank status is not assumed to mean discontinued.
      slabs = parsed.filter(slab =>
        norm(slab.STATUS) !== "n"
      );

      fillSelect(el.vendor, slabs.map(s => s.VENDOR));
      fillSelect(el.group, slabs.map(s => s.GROUP));
      fillSelect(el.finish, slabs.map(s => s.FINISH));
      fillSelect(el.technology, slabs.map(s => s.TECHNOLOGY));

      fillSelect(
        el.thickness,
        slabs.flatMap(availableThicknesses)
      );

      setStatus(
        `Loaded ${slabs.length.toLocaleString("en-US")} active supplier records. Confirm current prices and availability with the supplier.`
      );

      render();
    } catch (error) {
      console.error("Supplier slabs catalog error:", error);

      setStatus(
        `Unable to load supplier catalog. ${error.message} Check that slabs-proveedores.csv is in this folder and that its headers match the Excel export.`,
        true
      );
    }
  }

  el.search.addEventListener("input", render);
  el.searchBtn.addEventListener("click", render);

  el.clear.addEventListener("click", () => {
    el.search.value = "";
    render();
    el.search.focus();
  });

  [
    el.vendor, el.group, el.finish,
    el.technology, el.thickness, el.priceType
  ].forEach(select => select.addEventListener("change", render));

  el.reset.addEventListener("click", resetFilters);

  
  // Full-screen photo viewer for the detail window.

function openImageViewer(src, alt) {
  // Remove any previous image viewer.
  document.querySelectorAll(".image-lightbox").forEach(viewer => {
    viewer.remove();
  });

  const overlay = document.createElement("div");
  overlay.className = "image-lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Expanded slab photo");

  const closeButton = document.createElement("button");
  closeButton.className = "image-lightbox-close";
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Close enlarged photo");

  const image = document.createElement("img");
  image.src = src;
  image.alt = alt || "Slab photo";

  // Only the selected image is added to the viewer.
  overlay.append(closeButton, image);

  // IMPORTANT: place the viewer inside the modal dialog,
  // so it appears above the detail screen.
  el.dialog.appendChild(overlay);

  function closeViewer() {
    overlay.remove();
    document.removeEventListener("keydown", handleKeydown);
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      closeViewer();
    }
  }

  closeButton.addEventListener("click", closeViewer);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeViewer();
    }
  });

  document.addEventListener("keydown", handleKeydown);
  closeButton.focus();
}


  // Click either photo inside the slab detail window to enlarge it.
  el.content.addEventListener("click", event => {
    const image = event.target.closest(".detail-photo, .used-photo");

    if (!image || !image.src) return;

    event.preventDefault();
    openImageViewer(image.currentSrc || image.src, image.alt);
  });

  
  el.groups.addEventListener("click", event => {
    const card = event.target.closest(".slab-card");
    if (!card) return;

    const slab = slabs[Number(card.dataset.index)];
    if (slab) showDetails(slab);
  });

  el.groups.addEventListener("keydown", event => {
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target.classList.contains("slab-card")
    ) {
      event.preventDefault();
      event.target.click();
    }
  });

  el.close.addEventListener("click", () => {
    if (typeof el.dialog.close === "function") {
      el.dialog.close();
    } else {
      el.dialog.removeAttribute("open");
    }
  });

  el.dialog.addEventListener("click", event => {
    if (event.target === el.dialog && typeof el.dialog.close === "function") {
      el.dialog.close();
    }
  });

  init();
})();

