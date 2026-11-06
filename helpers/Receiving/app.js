"use strict";

/**
 * ARTEMISA RECEIVING
 *
 * Frontend interface.
 *
 * IMPORTANT:
 * The historical Apps Script API is currently protected.
 * This frontend intentionally does not attempt to bypass that protection.
 * A secure internal connection must be configured before retrieving data.
 */

const RECEIVING_CONFIG = {
  API_ENABLED: false,
  API_URL: ""
};


document.addEventListener("DOMContentLoaded", initializeReceiving);


function initializeReceiving() {

  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("clearSearch");
  const resetFilters = document.getElementById("resetFilters");

  const tabs = document.querySelectorAll(".module-tab");

  searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    searchHistoricalRecords();
  });

  searchInput.addEventListener("input", function() {
    document
      .querySelector(".search-input-wrap")
      .classList.toggle("has-value", Boolean(searchInput.value));
  });

  clearSearch.addEventListener("click", function() {
    searchInput.value = "";
    searchInput.focus();

    document
      .querySelector(".search-input-wrap")
      .classList.remove("has-value");
  });

  resetFilters.addEventListener("click", resetSearchFilters);

  tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
      if (tab.disabled) return;
      changeModule(tab.dataset.tab);
    });
  });

  updateSearchDescription();

  console.info("Artemisa Receiving interface initialized.");
}


/* --------------------------------------------------
   MODULE NAVIGATION
-------------------------------------------------- */

function changeModule(moduleName) {

  const historyView = document.getElementById("historyView");
  const receiptsView = document.getElementById("receiptsView");

  const tabs = document.querySelectorAll(".module-tab");

  historyView.hidden = moduleName !== "history";
  receiptsView.hidden = moduleName !== "receipts";

  tabs.forEach(function(tab) {
    tab.classList.toggle(
      "active",
      tab.dataset.tab === moduleName
    );
  });

}


/* --------------------------------------------------
   SEARCH
-------------------------------------------------- */

function searchHistoricalRecords() {

  const query = document
    .getElementById("searchInput")
    .value
    .trim();

  const filters = getSearchFilters();

  updateSearchDescription();

  if (!RECEIVING_CONFIG.API_ENABLED || !RECEIVING_CONFIG.API_URL) {

    showConnectionPending();

    console.info("Receiving search criteria:", {
      query: query,
      filters: filters
    });

    return;
  }

  /*
   * This section will be connected only after the secure
   * internal backend bridge has been implemented and tested.
   */

  executeReceivingSearch(query, filters);
}


function getSearchFilters() {

  return {
    dateFrom: document.getElementById("dateFrom").value,
    dateTo: document.getElementById("dateTo").value,
    mediaType: document.getElementById("mediaType").value,
    matchStatus: document.getElementById("matchStatus").value,
    fileType: document.getElementById("fileType").value
  };

}


function updateSearchDescription() {

  const query = document
    .getElementById("searchInput")
    .value
    .trim();

  const description = document.getElementById("searchDescription");

  description.textContent = query || "All records";

}


/* --------------------------------------------------
   FILTER RESET
-------------------------------------------------- */

function resetSearchFilters() {

  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  document.getElementById("mediaType").value = "";
  document.getElementById("matchStatus").value = "";
  document.getElementById("fileType").value = "";

  updateSearchDescription();

  showDefaultState();

}


/* --------------------------------------------------
   CONNECTION STATUS
-------------------------------------------------- */

function showConnectionPending() {

  const message = document.getElementById("systemMessage");

  message.hidden = false;

  message.querySelector("strong").textContent =
    "Secure connection pending";

  message.querySelector("p").textContent =
    "Your search criteria have been captured, but the historical database " +
    "is not connected to this interface yet. No historical records have " +
    "been modified or fabricated.";

  document.getElementById("messageCount").textContent = "—";
  document.getElementById("fileCount").textContent = "—";
  document.getElementById("resultsCount").textContent = "0 records";

  document.getElementById("resultsSubtitle").textContent =
    "The secure internal connection is required to retrieve records.";

  document.getElementById("resultsContainer").innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⌕</div>
      <h3>Search criteria received</h3>
      <p>
        The interface is ready. Historical messages and files will appear
        here once the secure connection to the internal database is enabled.
      </p>
    </div>
  `;

  document.getElementById("pagination").hidden = true;

}


function showDefaultState() {

  document.getElementById("messageCount").textContent = "—";
  document.getElementById("fileCount").textContent = "—";
  document.getElementById("resultsCount").textContent = "0 records";

  document.getElementById("resultsSubtitle").textContent =
    "Search the historical database to view messages and related files.";

  document.getElementById("resultsContainer").innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⌕</div>
      <h3>Search the Artemisa history</h3>
      <p>
        Enter a material, supplier, project or other keyword to find
        historical messages and their associated photographs.
      </p>
    </div>
  `;

  document.getElementById("pagination").hidden = true;

}


/* --------------------------------------------------
   FUTURE SECURE API ADAPTER
-------------------------------------------------- */

async function executeReceivingSearch(query, filters) {

  /*
   * DO NOT activate this function by simply inserting
   * the Apps Script deployment URL.
   *
   * The current Apps Script API has ENABLE_WEB_ACCESS = false.
   * A secure authentication bridge must be implemented first.
   *
   * Expected response structure from the future bridge:
   *
   * {
   *   ok: true,
   *   data: {
   *     totalMessages: 0,
   *     totalFiles: 0,
   *     results: []
   *   }
   * }
   */

  showConnectionPending();

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
