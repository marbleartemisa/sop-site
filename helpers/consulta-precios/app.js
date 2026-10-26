
"use strict";

const CSV_URL = "./compras.csv";

const $ = (id) => document.getElementById(id);

const elements = {
  search: $("searchInput"),
  searchBtn: $("searchBtn"),
  clearBtn: $("clearSearch"),
  vendor: $("vendorFilter"),
  client: $("clientFilter"),
  period: $("periodFilter"),
  reset: $("resetBtn"),
  status: $("statusMessage"),
  section: $("resultsSection"),
  count: $("resultsCount"),
  updated: $("updatedLabel"),
  latestPrice: $("latestPrice"),
  latestDate: $("latestDate"),
  previousPrice: $("previousPrice"),
  previousDate: $("previousDate"),
  change: $("priceChange"),
  changeNote: $("priceChangeNote"),
  body: $("resultsBody"),
  empty: $("emptyMessage")
};

let purchases = [];
let hasLoaded = false;
let searchTimer = null;


function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

// Normaliza las distintas formas de escribir un material.
function expandSearchTerm(term) {
  const word = normalize(term);

  const synonyms = {
    mela: "melamine melamina",
    melamine: "melamine melamina",
    melamina: "melamine melamina",
    melmine: "melamine melamina",
    melamin: "melamine melamina",

    white: "white blanco blanca snow pearl polar bright",
    blanco: "white blanco blanca",
    blanca: "white blanco blanca",
    snow: "snow white",
    pearl: "pearl white",
    polar: "polar white",
    bright: "bright white",

    black: "black negro negra",
    negro: "black negro negra",
    negra: "black negro negra",

    gray: "gray grey gris",
    grey: "gray grey gris",
    gris: "gray grey gris",

    mdf: "mdf",
    panel: "panel panels",
    panels: "panel panels"
  };

  return synonyms[word] || word;
}

function matchesSearch(purchase, query) {
  const terms = normalize(query)
    .split(" ")
    .filter(Boolean);

  if (!terms.length) return true;

  // Incluir los tres campos relacionados con el artículo,
  // además de proveedor, cliente, orden y tipo.
  const searchableText = normalize([
    purchase.item,
    purchase.itemDescription,
    purchase.memo,
    purchase.vendor,
    purchase.num,
    purchase.cliente,
    purchase.type
  ].join(" "));

  // Cada palabra buscada puede encontrarse en cualquiera
  // de los campos, no necesariamente en el mismo campo.
  return terms.every((term) => {
    const variants = expandSearchTerm(term).split(" ");

    return variants.some((variant) =>
      variant.length > 0 && searchableText.includes(variant)
    );
  });
}





function parseCSV(text) {
  // Accept UTF-8 BOM and detect comma or semicolon delimiters.
  text = text.replace(/^\uFEFF/, "");

  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  const delimiter = semicolons > commas ? ";" : ",";

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }

      row.push(field);

      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);

    if (row.some((value) => value.trim() !== "")) {
      rows.push(row);
    }
  }

  if (rows.length < 2) {
    throw new Error("The CSV file contains no purchase records.");
  }

  const headers = rows[0].map((header) => normalize(header));
  const required = [
    "cliente", "type", "date", "delivdate",
    "num", "vendor", "item", "qty", "price", "amount"
  ];

  const missing = required.filter(
    (header) => !headers.includes(header)
  );

  if (missing.length) {
    throw new Error(
      "Missing CSV columns: " + missing.join(", ")
    );
  }

  return rows.slice(1).map((values) => {
    const record = {};

    headers.forEach((header, index) => {
      record[header] = (values[index] ?? "").trim();
    });

    return {
      cliente: record.cliente,
      type: record.type,
      date: record.date,
      delivDate: record.delivdate,
      num: record.num,
      vendor: record.vendor,
      item: record.item,
      itemDescription: record.itemdescription || "",
      memo: record.memo || "",
      qty: parseNumber(record.qty),
      price: parseNumber(record.price),
      amount: parseNumber(record.amount),
      dateValue: parseDate(record.date)
    };
  }).filter((purchase) => purchase.item !== "");
}

function parseNumber(value) {
  if (typeof value === "number") return value;

  let text = String(value ?? "")
    .trim()
    .replace(/[$\s]/g, "");

  if (!text) return NaN;

  // Excel CSV from a US-style number format:
  // 1,234.56 -> 1234.56
  if (text.includes(".") && text.includes(",")) {
    text = text.replace(/,/g, "");
  } else if (text.includes(",") && !text.includes(".")) {
    // Supports decimal comma when there is no decimal point.
    text = text.replace(",", ".");
  }

  const number = Number(text);
  return Number.isFinite(number) ? number : NaN;
}

function parseDate(value) {
  const text = String(value ?? "").trim();

  // US format: MM/DD/YYYY or M/D/YY.
  let match = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/
  );

  if (match) {
    let year = Number(match[3]);

    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }

    const date = new Date(
      year, Number(match[1]) - 1, Number(match[2])
    );

    if (
      date.getFullYear() === year &&
      date.getMonth() === Number(match[1]) - 1 &&
      date.getDate() === Number(match[2])
    ) {
      return date;
    }

    return null;
  }

  // ISO format: YYYY-MM-DD.
  match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (match) {
    const date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );

    if (!Number.isNaN(date.getTime())) return date;
  }

  return null;
}

function formatDate(date) {
  if (!date || Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value);
}

function formatQuantity(value) {
  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4
  }).format(value);
}

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", isError);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function populateVendors() {
  const selected = elements.vendor.value;

  const vendors = [...new Set(
    purchases
      .map((purchase) => purchase.vendor.trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  elements.vendor.replaceChildren(new Option("All vendors", ""));

  vendors.forEach((vendor) => {
    elements.vendor.add(
      new Option(vendor, vendor)
    );
  });

  if (vendors.includes(selected)) {
    elements.vendor.value = selected;
  }
}


function populateClients() {
  const selected = elements.client.value;

  const clients = [...new Set(
    purchases
      .map((purchase) => purchase.cliente.trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  elements.client.replaceChildren(
    new Option("All clients", "")
  );

  clients.forEach((client) => {
    elements.client.add(new Option(client, client));
  });

  if (clients.includes(selected)) {
    elements.client.value = selected;
  }
}

function getFilteredPurchases() {
  const query = normalize(elements.search.value || "");
  const selectedVendor = elements.vendor.value;
  const selectedClient = elements.client.value;
  const months = elements.period.value;


  let cutoff = null;

  // Calcular la fecha límite solo si se seleccionó un período.
  if (months !== "all") {
    const numberOfMonths = Number(months);

    if (Number.isFinite(numberOfMonths) && numberOfMonths >= 0) {
      cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - numberOfMonths);
      cutoff.setHours(0, 0, 0, 0);
    }
  }

  return purchases
    .filter((purchase) => {
      // 1. Filtrar por proveedor.
      if (
        selectedVendor &&
        purchase.vendor !== selectedVendor
      ) {
        return false;
      }

      // Filter by client.
        if (
          selectedClient &&
          purchase.cliente !== selectedClient
        ) {
          return false;
        }

      // 2. Filtrar por antigüedad de la compra.
      if (
        cutoff &&
        (
          !purchase.dateValue ||
          Number.isNaN(purchase.dateValue.getTime()) ||
          purchase.dateValue < cutoff
        )
      ) {
        return false;
      }

      // 3. Buscar por descripción, proveedor, orden o cliente.
      if (query) {
        const matches = typeof matchesSearch === "function"
          ? matchesSearch(purchase, query)
          : normalize([
              purchase.item,
              purchase.vendor,
              purchase.num,
              purchase.cliente,
              purchase.type
            ].join(" ")).includes(query);

        if (!matches) {
          return false;
        }
      }

      return true;
    })
    // 4. Ordenar por fecha, de la más reciente a la más antigua.
    .sort((a, b) => {
      const dateA = a.dateValue instanceof Date
        ? a.dateValue.getTime()
        : 0;

      const dateB = b.dateValue instanceof Date
        ? b.dateValue.getTime()
        : 0;

      return dateB - dateA;
    });
}



function updateSummary(records) {
  const latest = records[0];

  // Referencias a los títulos de las tres tarjetas.
  const latestLabel = elements.latestPrice
    .closest(".summary-card")
    .querySelector("span");

  const previousLabel = elements.previousPrice
    .closest(".summary-card")
    .querySelector("span");

  const changeLabel = elements.change
    .closest(".summary-card")
    .querySelector("span");

  if (!latest) {
    latestLabel.textContent = "Latest unit price";
    previousLabel.textContent = "Previous unit price";
    changeLabel.textContent = "Price change";

    elements.latestPrice.textContent = "—";
    elements.latestDate.textContent = "No purchase found";
    elements.previousPrice.textContent = "—";
    elements.previousDate.textContent = "Previous purchase";
    elements.change.textContent = "—";
    elements.change.className = "price-neutral";
    elements.changeNote.textContent = "Latest vs. previous";
    return;
  }

  // Identificar el artículo de referencia de las estadísticas.
  const itemName = latest.item;

  latestLabel.textContent = `Latest unit price · ${itemName}`;
  previousLabel.textContent = `Previous unit price · ${itemName}`;
  changeLabel.textContent = `Price change · ${itemName}`;

  // Las compras recibidas están ordenadas de más reciente
  // a más antigua. Comparamos únicamente el mismo artículo.
  const sameItem = records.filter(
    (purchase) =>
      normalize(purchase.item) === normalize(itemName)
  );

  elements.latestPrice.textContent = formatMoney(latest.price);
  elements.latestDate.textContent =
    "Latest: " + formatDate(latest.dateValue);

  if (
    sameItem.length < 2 ||
    !Number.isFinite(latest.price) ||
    !Number.isFinite(sameItem[1].price)
  ) {
    elements.previousPrice.textContent = "—";
    elements.previousDate.textContent =
      sameItem.length < 2
        ? "No previous purchase for this exact item"
        : "Previous price unavailable";

    elements.change.textContent = "—";
    elements.change.className = "price-neutral";
    elements.changeNote.textContent =
      "Two valid prices are needed for comparison";
    return;
  }

  const previous = sameItem[1];

  elements.previousPrice.textContent = formatMoney(previous.price);
  elements.previousDate.textContent =
    "Previous: " + formatDate(previous.dateValue);

  if (previous.price === 0) {
    elements.change.textContent = "N/A";
    elements.change.className = "price-neutral";
    elements.changeNote.textContent = "Previous price is zero";
    return;
  }

  const difference = latest.price - previous.price;
  const percent = (difference / Math.abs(previous.price)) * 100;

  elements.change.textContent =
    (difference > 0 ? "+" : "") + percent.toFixed(2) + "%";

  elements.change.className =
    difference > 0
      ? "price-up"
      : difference < 0
        ? "price-down"
        : "price-neutral";

  elements.changeNote.textContent =
    (difference > 0
      ? "Increase of "
      : difference < 0
        ? "Decrease of "
        : "No change · ") +
    (difference !== 0 ? formatMoney(Math.abs(difference)) : "");
}


function getLastMigratedPO() {
  if (!purchases.length) {
    return null;
  }

  // Encontrar la fecha más reciente de Date.
  const datedPurchases = purchases.filter(
    (purchase) =>
      purchase.dateValue instanceof Date &&
      !Number.isNaN(purchase.dateValue.getTime())
  );

  if (!datedPurchases.length) {
    return null;
  }

  const latestDate = Math.max(
    ...datedPurchases.map(
      (purchase) => purchase.dateValue.getTime()
    )
  );

  // Considerar únicamente las compras de esa fecha.
  const latestPurchases = datedPurchases.filter(
    (purchase) =>
      purchase.dateValue.getTime() === latestDate
  );

  // De esa fecha, seleccionar el Num más alto.
  const lastPurchase = latestPurchases.reduce(
    (highest, purchase) => {
      const currentNum = Number(
        String(purchase.num || "").replace(/,/g, "").trim()
      );

      const highestNum = Number(
        String(highest.num || "").replace(/,/g, "").trim()
      );

      if (!Number.isFinite(currentNum)) {
        return highest;
      }

      if (!Number.isFinite(highestNum) || currentNum > highestNum) {
        return purchase;
      }

      return highest;
    }
  );

  return {
    num: lastPurchase.num,
    date: lastPurchase.dateValue
  };
}


function renderResults() {
  if (!hasLoaded) return;

  elements.clearBtn.hidden = elements.search.value.length === 0;

  const query = elements.search.value.trim();
  const hasFilters =
    Boolean(elements.vendor.value) ||
    Boolean(elements.client.value) ||
    elements.period.value !== "all";

  // No mostrar toda la base de compras sin una consulta
  // o un filtro seleccionado.
 
if (!query && !hasFilters) {
  elements.section.hidden = true;

  const lastPO = getLastMigratedPO();

  if (lastPO) {
    setStatus(
      `Purchase history loaded: ${purchases.length.toLocaleString("en-US")} records. ` +
      `Last Migrated PO: ${lastPO.num} · ` +
      `Purchase Date: ${formatDate(lastPO.date)}. ` +
      `Purchase orders after this point may not yet be migrated.`
    );
  } else {
    setStatus(
      `Purchase history loaded: ${purchases.length.toLocaleString("en-US")} records. ` +
      `No valid purchase date was found in the data.`
    );
  }

  return;
}


  // getFilteredPurchases ya ordena las compras por fecha
  // descendente. Conservamos ese orden al crear los grupos.
  const records = getFilteredPurchases();

  elements.section.hidden = false;
  elements.count.textContent =
    `${records.length.toLocaleString("en-US")} purchase record(s)`;

  elements.updated.textContent =
    `Data file: compras.csv · ${new Date().toLocaleDateString("en-US")}`;

  updateSummary(records);

  // Agrupar por descripción normalizada del artículo.
  // No cambia el nombre original que se muestra en la tabla.
  const groups = new Map();

  records.forEach((purchase) => {
    const key = normalize(purchase.item);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(purchase);
  });

  // Construir la tabla agrupando los artículos iguales.
  // El orden de los grupos corresponde a la compra más
  // reciente de cada artículo.
  const rowsHTML = [];

  groups.forEach((items) => {
    const itemName = items[0].item;

    rowsHTML.push(`
      <tr class="item-group-row">
        <td colspan="8">
          ${escapeHTML(itemName)}
          <span class="group-count">
            ${items.length} purchase${items.length === 1 ? "" : "s"}
          </span>
        </td>
      </tr>
    `);

    items.forEach((purchase) => {
      rowsHTML.push(`
        <tr>
          <td>${escapeHTML(formatDate(purchase.dateValue))}</td>
          <td>${escapeHTML(purchase.cliente || "—")}</td>
          
            <td class="item-cell">
              <div class="item-name">${escapeHTML(purchase.item)}</div>
            
              ${
                purchase.itemDescription
                  ? `<div class="item-description">
                      ${escapeHTML(purchase.itemDescription)}
                    </div>`
                  : ""
              }
            
              ${
                purchase.memo
                  ? `<div class="item-memo">
                      <strong>Memo:</strong> ${escapeHTML(purchase.memo)}
                    </div>`
                  : ""
              }
            </td>

          <td>${escapeHTML(purchase.vendor || "—")}</td>
          <td>${escapeHTML(purchase.num || "—")}</td>
          <td class="numeric">${escapeHTML(formatQuantity(purchase.qty))}</td>
          <td class="numeric">${escapeHTML(formatMoney(purchase.price))}</td>
          <td class="numeric">${escapeHTML(formatMoney(purchase.amount))}</td>
        </tr>
      `);
    });
  });

  // Sumar los importes de los registros filtrados una sola vez.
  const totalAmount = records.reduce((sum, purchase) => {
    return sum + (
      Number.isFinite(purchase.amount) ? purchase.amount : 0
    );
  }, 0);

  // Total general al final de la tabla.
  rowsHTML.push(`
    <tr class="total-row">
      <td colspan="7">TOTAL GENERAL (${records.length} records)</td>
      <td class="numeric">${escapeHTML(formatMoney(totalAmount))}</td>
    </tr>
  `);

  elements.body.innerHTML = rowsHTML.join("");

  elements.empty.hidden = records.length !== 0;

  setStatus(
    records.length
      ? `${records.length} matching record(s) · Total amount: ${formatMoney(totalAmount)}`
      : "No matching purchases. Try a different item or reset the filters."
  );
}


async function loadPurchases() {
  setStatus("Loading purchase history...");

  try {
    const response = await fetch(
      `${CSV_URL}?v=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(
        `Could not load compras.csv (HTTP ${response.status}).`
      );
    }

    const csvText = await response.text();
    purchases = parseCSV(csvText);

    hasLoaded = true;
    populateVendors();
    populateClients();
    renderResults();
  } catch (error) {
    console.error("Price Consultation:", error);

    setStatus(
      "Unable to load purchase history. Check that compras.csv is in this folder and that its headers are correct. " +
      error.message,
      true
    );
  }
}

elements.search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderResults, 150);
});

elements.searchBtn.addEventListener("click", renderResults);

elements.search.addEventListener("keydown", (event) => {
  if (event.key === "Enter") renderResults();
});

elements.clearBtn.addEventListener("click", () => {
  elements.search.value = "";
  elements.search.focus();
  renderResults();
});

elements.vendor.addEventListener("change", renderResults);
elements.client.addEventListener("change", renderResults);
elements.period.addEventListener("change", renderResults);

elements.reset.addEventListener("click", () => {
  elements.search.value = "";
  elements.vendor.value = "";
  elements.client.value = "";
  elements.period.value = "all";
  renderResults();

});

loadPurchases();

