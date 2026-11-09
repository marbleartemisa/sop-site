
"use strict";

/**
 * ARTEMISA RECEIVING
 * Historical search and message detail.
 */

const RECEIVING_CONFIG = {
  API_ENABLED: true,
  API_URL: "https://script.google.com/macros/s/AKfycby0y93mBO3FOi3O9XRX0FpBwMEo5A6ZvAJEs-PI56n4pQ-fLjSkIiuKnPFqEcNZYMG2/exec",
  PAGE_SIZE: 20
};

const RECEIVING_STATE = {
  results: [],
  totalMessages: 0,
  totalFiles: 0,
  offset: 0,
  query: "",
  filters: {},
  loading: false
};

document.addEventListener("DOMContentLoaded", initializeReceiving);


/* --------------------------------------------------
   INITIALIZATION
-------------------------------------------------- */

function initializeReceiving() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("clearSearch");
  const resetFilters = document.getElementById("resetFilters");
  const resultsContainer = document.getElementById("resultsContainer");

  if (!searchForm || !searchInput || !resultsContainer) {
    console.error("Receiving: required HTML elements are missing.");
    return;
  }

  searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    RECEIVING_STATE.offset = 0;
    searchHistoricalRecords();
  });

  searchInput.addEventListener("input", function() {
    const wrapper = document.querySelector(".search-input-wrap");

    if (wrapper) {
      wrapper.classList.toggle(
        "has-value",
        Boolean(searchInput.value)
      );
    }
  });

  if (clearSearch) {
    clearSearch.addEventListener("click", function() {
      searchInput.value = "";
      searchInput.focus();

      const wrapper = document.querySelector(".search-input-wrap");
      if (wrapper) wrapper.classList.remove("has-value");
    });
  }

  if (resetFilters) {
    resetFilters.addEventListener("click", resetSearchFilters);
  }

  document.querySelectorAll(".module-tab").forEach(function(tab) {
    tab.addEventListener("click", function() {
      if (tab.disabled) return;
      changeModule(tab.dataset.tab);
    });
  });

  const previousPage = document.getElementById("previousPage");
  const nextPage = document.getElementById("nextPage");

  if (previousPage) {
    previousPage.addEventListener("click", function() {
      if (RECEIVING_STATE.offset >= RECEIVING_CONFIG.PAGE_SIZE) {
        RECEIVING_STATE.offset -= RECEIVING_CONFIG.PAGE_SIZE;
        searchHistoricalRecords(true);
      }
    });
  }

  if (nextPage) {
    nextPage.addEventListener("click", function() {
      const nextOffset =
        RECEIVING_STATE.offset + RECEIVING_CONFIG.PAGE_SIZE;

      if (nextOffset < RECEIVING_STATE.totalMessages) {
        RECEIVING_STATE.offset = nextOffset;
        searchHistoricalRecords(true);
      }
    });
  }

  resultsContainer.addEventListener("click", function(event) {
    const link = event.target.closest("a");
    if (link) return;

    const card = event.target.closest("[data-message-index]");
    if (!card) return;

    const index = Number(card.dataset.messageIndex);
    const message = RECEIVING_STATE.results[index];

    if (message) showMessageDetail(message);
  });

  resultsContainer.addEventListener("keydown", function(event) {
    if (event.key !== "Enter" && event.key !== " ") return;

    const card = event.target.closest("[data-message-index]");
    if (!card) return;

    event.preventDefault();

    const message =
      RECEIVING_STATE.results[Number(card.dataset.messageIndex)];

    if (message) showMessageDetail(message);
  });

  addReceivingStyles();
  updateSearchDescription();

  console.info("Artemisa Receiving initialized.");
}


/* --------------------------------------------------
   MODULE NAVIGATION
-------------------------------------------------- */

function changeModule(moduleName) {
  const historyView = document.getElementById("historyView");
  const receiptsView = document.getElementById("receiptsView");

  if (!historyView || !receiptsView) return;

  historyView.hidden = moduleName !== "history";
  receiptsView.hidden = moduleName !== "receipts";

  document.querySelectorAll(".module-tab").forEach(function(tab) {
    tab.classList.toggle(
      "active",
      tab.dataset.tab === moduleName
    );
  });
}


/* --------------------------------------------------
   HISTORICAL SEARCH
-------------------------------------------------- */

async function searchHistoricalRecords(keepState) {
  const searchInput = document.getElementById("searchInput");

  const query = searchInput ? searchInput.value.trim() : "";
  const filters = getSearchFilters();

  RECEIVING_STATE.query = query;
  RECEIVING_STATE.filters = filters;

  updateSearchDescription();

  if (!RECEIVING_CONFIG.API_ENABLED || !RECEIVING_CONFIG.API_URL) {
    showApiError("The Receiving API is not configured.");
    return;
  }

  if (RECEIVING_STATE.loading) return;

  RECEIVING_STATE.loading = true;
  showLoadingState();

  try {
    const params = new URLSearchParams({
      action: "SEARCH_RECEIVING_HISTORY",
      query: query,
      limit: String(RECEIVING_CONFIG.PAGE_SIZE),
      offset: String(RECEIVING_STATE.offset),
      filters: JSON.stringify(filters)
    });

    const requestUrl =
      RECEIVING_CONFIG.API_URL + "?" + params.toString();

    const response = await fetch(requestUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const payload = await response.json();

    if (!payload || payload.ok !== true) {
      throw new Error(
        payload && payload.error
          ? payload.error
          : "The API returned an invalid response."
      );
    }

    // Apps Script response is nested:
    // payload.data.results

    const data = payload.data || {};

    if (data.ok === false) {
      throw new Error(data.error || "Historical search failed.");
    }

    RECEIVING_STATE.results = Array.isArray(data.results)
      ? data.results
      : [];
    
    
    RECEIVING_STATE.totalMessages =
      Number(data.totalMessages || 0);

    RECEIVING_STATE.totalFiles =
      Number(data.totalRelatedFiles || 0);

    renderSearchResults(data);

    console.info("Receiving search completed:", {
      query: query,
      totalMessages: RECEIVING_STATE.totalMessages,
      totalFiles: RECEIVING_STATE.totalFiles,
      returnedMessages: RECEIVING_STATE.results.length
    });

  } catch (error) {
    console.error("Receiving API error:", error);

    showApiError(
      "Unable to retrieve historical records. " +
      error.message +
      ". Check the API connection and browser console."
    );

  } finally {
    RECEIVING_STATE.loading = false;
  }
}


function getSearchFilters() {
  return {
    dateFrom: document.getElementById("dateFrom")?.value || "",
    dateTo: document.getElementById("dateTo")?.value || "",
    mediaType: document.getElementById("mediaType")?.value || "",
    matchStatus: document.getElementById("matchStatus")?.value || "",
    fileType: document.getElementById("fileType")?.value || ""
  };
}


function updateSearchDescription() {
  const input = document.getElementById("searchInput");
  const description = document.getElementById("searchDescription");

  if (description) {
    description.textContent =
      input && input.value.trim()
        ? input.value.trim()
        : "All records";
  }
}


/* --------------------------------------------------
   RESULTS RENDERING
-------------------------------------------------- */

function renderSearchResults(data) {
  const container = document.getElementById("resultsContainer");
  if (!container) return;

  const messages = RECEIVING_STATE.results;

  document.getElementById("messageCount").textContent =
    RECEIVING_STATE.totalMessages.toLocaleString();

  document.getElementById("fileCount").textContent =
    RECEIVING_STATE.totalFiles.toLocaleString();

  document.getElementById("resultsCount").textContent =
    RECEIVING_STATE.totalMessages.toLocaleString() + " records";

  document.getElementById("resultsSubtitle").textContent =
    messages.length
      ? "Select a message to inspect its full content and associated files."
      : "No messages match your search criteria.";

  const systemMessage = document.getElementById("systemMessage");
  if (systemMessage) systemMessage.hidden = true;

  if (!messages.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⌕</div>
        <h3>No matching records</h3>
        <p>Try another keyword or adjust your search filters.</p>
      </div>
    `;

    updatePagination(data);
    return;
  }

  container.innerHTML = messages.map(function(message, index) {
    const files = Array.isArray(message.Files) ? message.Files : [];

    const thumbnails = files
      .filter(file => file.ThumbnailURL)
      .slice(0, 3)
      .map(function(file) {
        return `
          <a class="receiving-thumb-link"
             href="${escapeHTML(file.URL || file.ThumbnailURL)}"
             target="_blank"
             rel="noopener noreferrer"
             title="${escapeHTML(file.Name || "Open image")}">
            <img
              class="receiving-thumb"
              src="${escapeHTML(file.ThumbnailURL)}"
              alt="${escapeHTML(file.Name || "Associated image")}"
              loading="lazy"
              referrerpolicy="no-referrer"
            >
          </a>
        `;
      }).join("");

    const messageText = String(message.Message || "");
    const snippet = messageText.length > 300
      ? messageText.substring(0, 300) + "…"
      : messageText;

    const status = getMessageStatus(files);

    return `
      <article
        class="receiving-result-card"
        data-message-index="${index}"
        role="button"
        tabindex="0"
        aria-label="Open message ${escapeHTML(message.MessageID)}">

        <div class="receiving-result-main">
          <div class="receiving-result-top">
            <strong>${escapeHTML(message.MessageID || "Message")}</strong>
            <span class="receiving-status ${status.className}">
              ${escapeHTML(status.label)}
            </span>
          </div>

          <div class="receiving-result-meta">
            ${escapeHTML(message.Date || "")}
            ${message.Time ? " · " + escapeHTML(message.Time) : ""}
            ${message.Sender ? " · " + escapeHTML(message.Sender) : ""}
          </div>

          <div class="receiving-result-text">${escapeHTML(snippet)}</div>

          <div class="receiving-result-footer">
            <span>${escapeHTML(message.MediaType || "TEXT")}</span>
            <span>${files.length} associated file(s)</span>
            <span class="receiving-open-label">View details →</span>
          </div>
        </div>

        ${thumbnails ? `
          <div class="receiving-result-thumbnails">
            ${thumbnails}
          </div>
        ` : ""}

      </article>
    `;
  }).join("");

  updatePagination(data);
}


function getMessageStatus(files) {
  if (!files.length) {
    return { label: "NO FILES", className: "status-neutral" };
  }

  const statuses = files.map(file =>
    String(file.MatchStatus || "").toUpperCase()
  );

  if (statuses.includes("REVIEW")) {
    return { label: "REVIEW", className: "status-review" };
  }

  if (statuses.includes("CANDIDATE")) {
    return { label: "CANDIDATE", className: "status-candidate" };
  }

  if (statuses.every(status => status === "MATCHED")) {
    return { label: "MATCHED", className: "status-matched" };
  }

  return { label: statuses[0] || "UNCLASSIFIED", className: "status-neutral" };
}


/* --------------------------------------------------
   MESSAGE DETAIL
-------------------------------------------------- */

function showMessageDetail(message) {
  const files = Array.isArray(message.Files) ? message.Files : [];

  closeMessageDetail();

  const overlay = document.createElement("div");
  overlay.id = "receivingDetailOverlay";
  overlay.className = "receiving-detail-overlay";

  const fileHTML = files.length
    ? files.map(function(file) {
        const thumbnail = file.ThumbnailURL
          ? `
            <a href="${escapeHTML(file.URL || file.ThumbnailURL)}"
               target="_blank"
               rel="noopener noreferrer"
               class="receiving-detail-image-link">
              <img
                src="${escapeHTML(file.ThumbnailURL)}"
                alt="${escapeHTML(file.Name || "Receiving image")}"
                class="receiving-detail-image"
                loading="lazy"
                referrerpolicy="no-referrer"
              >
              <span>Open original image ↗</span>
            </a>
          `
          : `
            <div class="receiving-no-thumbnail">
              Preview unavailable
            </div>
          `;

        return `
          <div class="receiving-file-card">
            ${thumbnail}

            <div class="receiving-file-info">
              <strong>${escapeHTML(file.Name || "Unnamed file")}</strong>
              <span>Category: ${escapeHTML(file.FileCategory || "—")}</span>
              <span>Relation: ${escapeHTML(file.RelationType || "—")}</span>
              <span>Match method: ${escapeHTML(file.MatchMethod || "—")}</span>
              <span class="receiving-status ${getStatusClass(file.MatchStatus)}">
                ${escapeHTML(file.MatchStatus || "UNCLASSIFIED")}
              </span>
            </div>
          </div>
        `;
      }).join("")
    : `<p class="receiving-no-files">No files are associated with this message.</p>`;

  overlay.innerHTML = `
    <div class="receiving-detail-panel"
         role="dialog"
         aria-modal="true"
         aria-labelledby="receivingDetailTitle">

      <div class="receiving-detail-header">
        <div>
          <span class="receiving-detail-eyebrow">HISTORICAL MESSAGE</span>
          <h2 id="receivingDetailTitle">
            ${escapeHTML(message.MessageID || "Message detail")}
          </h2>
        </div>

        <button type="button"
                class="receiving-detail-close"
                aria-label="Close details">×</button>
      </div>

      <div class="receiving-detail-body">

        <div class="receiving-detail-metadata">
          <div>
            <span>Date</span>
            <strong>${escapeHTML(message.Date || "—")}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>${escapeHTML(message.Time || "—")}</strong>
          </div>
          <div>
            <span>Sender</span>
            <strong>${escapeHTML(message.Sender || "—")}</strong>
          </div>
          <div>
            <span>Media type</span>
            <strong>${escapeHTML(message.MediaType || "—")}</strong>
          </div>
        </div>

        <section class="receiving-detail-section">
          <h3>Full message</h3>
          <div class="receiving-full-message">${escapeHTML(message.Message || "")}</div>
        </section>

        <section class="receiving-detail-section">
          <h3>Associated files (${files.length})</h3>
          <p class="receiving-detail-help">
            Each file is displayed separately. REVIEW associations have not
            been approved or modified.
          </p>
          <div class="receiving-file-grid">
            ${fileHTML}
          </div>
        </section>

      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector(".receiving-detail-close")
    .addEventListener("click", closeMessageDetail);

  overlay.addEventListener("click", function(event) {
    if (event.target === overlay) closeMessageDetail();
  });

  document.addEventListener("keydown", handleDetailEscape);
}


function getStatusClass(status) {
  const value = String(status || "").toUpperCase();

  if (value === "REVIEW") return "status-review";
  if (value === "CANDIDATE") return "status-candidate";
  if (value === "MATCHED") return "status-matched";

  return "status-neutral";
}


function closeMessageDetail() {
  const overlay = document.getElementById("receivingDetailOverlay");

  if (overlay) overlay.remove();

  document.removeEventListener("keydown", handleDetailEscape);
}


function handleDetailEscape(event) {
  if (event.key === "Escape") closeMessageDetail();
}


/* --------------------------------------------------
   PAGINATION
-------------------------------------------------- */

function updatePagination(data) {
  const pagination = document.getElementById("pagination");
  const previous = document.getElementById("previousPage");
  const next = document.getElementById("nextPage");
  const indicator = document.getElementById("pageIndicator");

  if (!pagination) return;

  const total = RECEIVING_STATE.totalMessages;
  const currentPage =
    Math.floor(RECEIVING_STATE.offset / RECEIVING_CONFIG.PAGE_SIZE) + 1;

  const totalPages = Math.max(
    1,
    Math.ceil(total / RECEIVING_CONFIG.PAGE_SIZE)
  );

  pagination.hidden = total === 0;

  if (indicator) {
    indicator.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  if (previous) {
    previous.disabled = RECEIVING_STATE.offset === 0;
  }

  if (next) {
    next.disabled = !data.hasMore &&
      RECEIVING_STATE.offset + RECEIVING_CONFIG.PAGE_SIZE >= total;
  }
}


/* --------------------------------------------------
   FILTER RESET
-------------------------------------------------- */

function resetSearchFilters() {

  // Limpiar cadena de búsqueda
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.value = "";
  }

  // Limpiar indicador visual del campo
  const searchWrapper = document.querySelector(".search-input-wrap");

  if (searchWrapper) {
    searchWrapper.classList.remove("has-value");
  }

  // Limpiar todos los filtros
  [
    "dateFrom",
    "dateTo",
    "mediaType",
    "matchStatus",
    "fileType"
  ].forEach(function(id) {

    const element = document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });

  // Reiniciar paginación
  RECEIVING_STATE.offset = 0;

  // Actualizar indicador Current Search
  updateSearchDescription();

  // Ejecutar búsqueda sin restricciones
  searchHistoricalRecords();

}


/* --------------------------------------------------
   INTERFACE STATES
-------------------------------------------------- */

function showLoadingState() {
  const container = document.getElementById("resultsContainer");

  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="receiving-loader"></div>
        <h3>Searching historical records…</h3>
        <p>Connecting to the Artemisa Receiving database.</p>
      </div>
    `;
  }

  const message = document.getElementById("systemMessage");
  if (message) message.hidden = true;
}


function showApiError(errorText) {
  const message = document.getElementById("systemMessage");

  if (message) {
    message.hidden = false;

    const heading = message.querySelector("strong");
    const paragraph = message.querySelector("p");

    if (heading) heading.textContent = "Connection error";
    if (paragraph) paragraph.textContent = errorText;
  }

  const container = document.getElementById("resultsContainer");

  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">!</div>
        <h3>Unable to load records</h3>
        <p>${escapeHTML(errorText)}</p>
      </div>
    `;
  }

  const pagination = document.getElementById("pagination");
  if (pagination) pagination.hidden = true;
}


/* --------------------------------------------------
   STYLES FOR DYNAMIC DETAILS
-------------------------------------------------- */

function addReceivingStyles() {
  if (document.getElementById("receivingDynamicStyles")) return;

  const style = document.createElement("style");
  style.id = "receivingDynamicStyles";

  style.textContent = `
    .receiving-result-card {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 18px;
      padding: 18px;
      margin-bottom: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #fff;
      cursor: pointer;
      transition: border-color .2s, box-shadow .2s;
    }

    .receiving-result-card:hover,
    .receiving-result-card:focus {
      border-color: #8baed5;
      box-shadow: 0 4px 16px rgba(15, 40, 70, .08);
      outline: none;
    }

    .receiving-result-main {
      flex: 1;
      min-width: 0;
    }

    .receiving-result-top,
    .receiving-result-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .receiving-result-meta {
      margin: 8px 0;
      color: #64748b;
      font-size: 12px;
    }

    .receiving-result-text {
      color: #334155;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      line-height: 1.55;
    }

    .receiving-result-footer {
      justify-content: flex-start;
      margin-top: 12px;
      color: #64748b;
      font-size: 12px;
      gap: 16px;
    }

    .receiving-open-label {
      margin-left: auto;
      color: #2563a6;
      font-weight: 600;
    }

    .receiving-result-thumbnails {
      display: flex;
      gap: 7px;
      flex-shrink: 0;
    }

    .receiving-thumb-link {
      display: block;
      width: 72px;
      height: 72px;
      overflow: hidden;
      border-radius: 8px;
      background: #f1f5f9;
    }

    .receiving-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .receiving-status {
      display: inline-block;
      padding: 4px 9px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .04em;
    }

    .status-review {
      color: #92400e;
      background: #fef3c7;
    }

    .status-candidate {
      color: #1e40af;
      background: #dbeafe;
    }

    .status-matched {
      color: #166534;
      background: #dcfce7;
    }

    .status-neutral {
      color: #475569;
      background: #e2e8f0;
    }

    .receiving-detail-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      justify-content: flex-end;
      background: rgba(15, 23, 42, .55);
    }

    .receiving-detail-panel {
      width: min(760px, 100%);
      height: 100%;
      overflow-y: auto;
      background: #fff;
      box-shadow: -8px 0 30px rgba(0,0,0,.16);
    }

    .receiving-detail-header {
      position: sticky;
      top: 0;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 22px 26px;
      border-bottom: 1px solid #e2e8f0;
      background: #fff;
    }

    .receiving-detail-eyebrow {
      color: #64748b;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .12em;
    }

    .receiving-detail-header h2 {
      margin: 5px 0 0;
      color: #172b45;
      font-size: 21px;
    }

    .receiving-detail-close {
      width: 38px;
      height: 38px;
      border: 0;
      border-radius: 50%;
      background: #f1f5f9;
      color: #334155;
      font-size: 26px;
      cursor: pointer;
    }

    .receiving-detail-body {
      padding: 24px 26px 40px;
    }

    .receiving-detail-metadata {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      padding: 17px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
    }

    .receiving-detail-metadata div {
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 0;
    }

    .receiving-detail-metadata span,
    .receiving-file-info span {
      color: #64748b;
      font-size: 12px;
    }

    .receiving-detail-metadata strong {
      color: #1e293b;
      overflow-wrap: anywhere;
    }

    .receiving-detail-section {
      margin-top: 26px;
    }

    .receiving-detail-section h3 {
      margin: 0 0 12px;
      color: #172b45;
      font-size: 16px;
    }

    .receiving-full-message {
      padding: 17px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #fff;
      color: #334155;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      line-height: 1.65;
    }

    .receiving-detail-help {
      color: #64748b;
      font-size: 12px;
      line-height: 1.5;
    }

    .receiving-file-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 15px;
    }

    .receiving-file-card {
      min-width: 0;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #fff;
    }

    .receiving-detail-image-link {
      display: block;
      color: #2563a6;
      font-size: 11px;
      text-decoration: none;
    }

    .receiving-detail-image {
      display: block;
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: contain;
      background: #f1f5f9;
    }

    .receiving-detail-image-link span {
      display: block;
      padding: 8px 11px 0;
    }

    .receiving-file-info {
      display: flex;
      flex-direction: column;
      gap: 7px;
      padding: 12px;
      overflow-wrap: anywhere;
    }

    .receiving-file-info strong {
      color: #1e293b;
      font-size: 12px;
      line-height: 1.45;
    }

    .receiving-no-thumbnail {
      display: grid;
      place-items: center;
      min-height: 130px;
      background: #f1f5f9;
      color: #64748b;
      font-size: 12px;
    }

    .receiving-no-files {
      color: #64748b;
      font-size: 13px;
    }

    .receiving-loader {
      width: 28px;
      height: 28px;
      margin: 0 auto 12px;
      border: 3px solid #dbeafe;
      border-top-color: #2563a6;
      border-radius: 50%;
      animation: receiving-spin .8s linear infinite;
    }

    @keyframes receiving-spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      .receiving-result-card {
        flex-direction: column;
      }

      .receiving-result-thumbnails {
        flex-wrap: wrap;
      }

      .receiving-thumb-link {
        width: 65px;
        height: 65px;
      }

      .receiving-file-grid {
        grid-template-columns: 1fr;
      }

      .receiving-detail-header,
      .receiving-detail-body {
        padding-left: 17px;
        padding-right: 17px;
      }
    }
  `;

  document.head.appendChild(style);
}


/* --------------------------------------------------
   UTILITIES
-------------------------------------------------- */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function(character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}

