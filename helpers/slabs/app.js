
(() => {
  "use strict";

  const CSV_URL = "./slabs.csv";

  const REQUIRED = [
    "TYPE", "CODEID", "SLAB", "OWN", "PICTURE", "ZOOM",
    "LOCATION", "TH", "QTY", "COST", "L", "W",
    "SF", "ORIG", "MSRP", "BUSQUEDA"
  ];

  const $ = id => document.getElementById(id);

  const el = {
    search: $("searchInput"),
    clear: $("clearSearch"),
    searchBtn: $("searchBtn"),
    type: $("typeFilter"),
    owner: $("ownerFilter"),
    th: $("thFilter"),
    location: $("locationFilter"),
    price: $("priceFilter"),
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

  // CSV parser: supports quoted fields containing commas.
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
        cell = "";

        if (row.some(value => value.trim() !== "")) {
          rows.push(row);
        }

        row = [];
      } else {
        cell += char;
      }
    }

    if (cell.length || row.length) {
      row.push(cell);
      rows.push(row);
    }

    if (!rows.length) return [];

    const headers = rows.shift().map(header =>
      header.trim().toUpperCase()
    );

    const missing = REQUIRED.filter(header =>
      !headers.includes(header)
    );

    if (missing.length) {
      throw new Error("Missing CSV columns: " + missing.join(", "));
    }

    return rows.map(values => {
      const item = {};

      headers.forEach((header, index) => {
        item[header] = (values[index] ?? "").trim();
      });

      return item;
    }).filter(item => item.CODEID || item.SLAB);
  }

  function num(value) {
    const text = String(value ?? "")
      .trim()
      .replace(/[$,\s]/g, "");

    if (!text) return NaN;

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
      maximumFractionDigits: 2
    });
  }

  function fillSelect(select, values) {
    const firstOption = select.options[0];
    select.replaceChildren(firstOption);

    [...new Set(
      values.map(value => String(value ?? "").trim())
        .filter(Boolean)
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

  function searchText(slab) {
    return norm([
      slab.TYPE, slab.CODEID, slab.SLAB, slab.OWN,
      slab.LOCATION, slab.TH, slab.QTY, slab.L,
      slab.W, slab.SF, slab.ORIG, slab.MSRP,
      slab.BUSQUEDA
    ].join(" "));
  }

  function priceMatches(slab, range) {
    if (!range) return true;

    const price = num(slab.MSRP);
    if (!Number.isFinite(price)) return false;

    const [minimum, maximum] = range.split("-").map(Number);

    return price >= minimum && price < maximum;
  }

  function applyFilters() {
    const words = norm(el.search.value)
      .split(/\s+/)
      .filter(Boolean);

    return slabs.filter(slab => {
      const text = searchText(slab);

      return words.every(word => text.includes(word)) &&
        (!el.type.value || slab.TYPE === el.type.value) &&
        (!el.owner.value || slab.OWN === el.owner.value) &&
        (!el.th.value || slab.TH === el.th.value) &&
        (!el.location.value || slab.LOCATION === el.location.value) &&
        priceMatches(slab, el.price.value);
    });
  }

  function photo(url, alt, className) {
    if (!url) {
      return '<div class="photo-fallback">Photo not available</div>';
    }

    return `
      <img
        class="${className}"
        src="${esc(url)}"
        alt="${esc(alt)}"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'photo-fallback',textContent:'Photo unavailable or access restricted'}))"
      >
    `;
  }

  function createCard(slab) {
    const dimensions = [slab.L, slab.W]
      .filter(Boolean)
      .join(" × ");

    return `
      <article
        class="slab-card"
        tabindex="0"
        role="button"
        data-code="${esc(slab.CODEID)}"
      >
        <div class="photo-wrap">
          ${photo(slab.PICTURE, slab.SLAB, "card-photo")}
        </div>

        <div class="card-body">
          <div class="card-code">
            ${esc(slab.CODEID || "NO CODE")} · ${esc(slab.TYPE || "Uncategorized")}
          </div>

          <h4 class="card-title">
            ${esc(slab.SLAB || "Unnamed slab")}
          </h4>

          <div class="card-meta">
            Owner: ${esc(slab.OWN || "—")}<br>
            Location: ${esc(slab.LOCATION || "—")}<br>
            ${esc(slab.TH || "—")} · ${esc(dimensions || "Dimensions not listed")}<br>
            Qty: ${esc(slab.QTY || "—")}
          </div>

          <div class="card-price">${esc(money(slab.MSRP))}</div>
          <span class="card-link">VIEW DETAILS ↗</span>
        </div>
      </article>
    `;
  }

  function render() {
    filtered = applyFilters();

    el.groups.innerHTML = "";
    el.count.textContent =
      `${filtered.length.toLocaleString("en-US")} slabs`;

    el.results.hidden = false;
    el.empty.hidden = filtered.length > 0;
    el.clear.hidden = !el.search.value;

    if (!filtered.length) return;

    const groups = new Map();

    filtered.forEach(slab => {
      const type = slab.TYPE || "Uncategorized";

      if (!groups.has(type)) {
        groups.set(type, []);
      }

      groups.get(type).push(slab);
    });

    [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([type, items]) => {
        const section = document.createElement("section");
        section.className = "type-group";

        section.innerHTML = `
          <div class="group-heading">
            <h3>${esc(type)}</h3>
            <span class="group-count">${items.length}</span>
          </div>
          <div class="slab-grid">
            ${items.map(createCard).join("")}
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

  function showDetails(slab) {
    const dimensions = [slab.L, slab.W]
      .filter(Boolean)
      .join(" × ");

    el.content.innerHTML = `
      <div class="detail-layout">

        <div class="detail-photo-panel">
          ${photo(slab.ZOOM || slab.PICTURE, slab.SLAB, "detail-photo")}
        </div>

        <div class="detail-info">
          <div class="eyebrow">${esc(slab.TYPE || "SLAB")}</div>

          <h2 id="dialogTitle">
            ${esc(slab.SLAB || "Unnamed slab")}
          </h2>

          <div class="detail-code">
            Code: ${esc(slab.CODEID || "—")}
          </div>

          <div class="detail-grid">
            ${detailItem("Owner", slab.OWN)}
            ${detailItem("Warehouse location", slab.LOCATION)}
            ${detailItem("Thickness", slab.TH)}
            ${detailItem("Quantity (reference)", slab.QTY)}
            ${detailItem("Dimensions (L × W)", dimensions)}
            ${detailItem("Square feet", slab.SF)}
            ${detailItem("Origin / supplier", slab.ORIG)}
          </div>

          <div class="detail-price">
            <span class="detail-label">MSRP · Reference price</span>
            <span class="detail-value">${esc(money(slab.MSRP))}</span>
          </div>

          <div class="code-inventory">
            <span class="detail-label">
              CODE INVENTORY · Internal sales reference
            </span>
            <span class="detail-value">${esc(slab.COST || "—")}</span>
          </div>

          ${slab.BUSQUEDA ? `
            <p class="verify-note">
              <strong>Keywords / notes:</strong>
              ${esc(slab.BUSQUEDA)}
            </p>
          ` : ""}

          <p class="verify-note">
            Sales reference only. Confirm current ownership,
            remaining quantity and availability in AppSheet
            before committing to a customer.
          </p>
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

  async function init() {
    try {
      const response = await fetch(CSV_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(
          `Could not load slabs.csv (HTTP ${response.status}).`
        );
      }

      slabs = parseCSV(await response.text());

      fillSelect(el.type, slabs.map(s => s.TYPE));
      fillSelect(el.owner, slabs.map(s => s.OWN));
      fillSelect(el.th, slabs.map(s => s.TH));
      fillSelect(el.location, slabs.map(s => s.LOCATION));

      setStatus(
        `Loaded ${slabs.length.toLocaleString("en-US")} slab records. Confirm availability in AppSheet.`
      );

      render();

    } catch (error) {
      console.error("Slabs catalog error:", error);

      setStatus(
        `Unable to load slab catalog. ${error.message} Check that slabs.csv is in this folder and has the expected headers.`,
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
    el.type,
    el.owner,
    el.th,
    el.location,
    el.price
  ].forEach(select => select.addEventListener("change", render));

  el.reset.addEventListener("click", () => {
    el.search.value = "";

    [
      el.type,
      el.owner,
      el.th,
      el.location,
      el.price
    ].forEach(select => select.value = "");

    render();

    setStatus(
      `Loaded ${slabs.length} slab records. Confirm availability in AppSheet.`
    );
  });

  el.groups.addEventListener("click", event => {
    const card = event.target.closest(".slab-card");
    if (!card) return;

    const slab = filtered.find(
      item => String(item.CODEID) === card.dataset.code
    );

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
    el.dialog.close();
  });

  el.dialog.addEventListener("click", event => {
    if (event.target === el.dialog) {
      el.dialog.close();
    }
  });

  init();
})();

