// ========================================
// APP
// ========================================

console.log("APP LOADED");

// ========================================
// IMPORTS
// ========================================

import {
  renderProjectSimulationModal
} from "./project-modal.js";

// ========================================
// ERP INIT
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log("DOM READY");

    if (
      typeof initERP === "function"
    ) {
      initERP();
    }

  }
);

// ========================================
// NEW PROJECT
// ========================================

function openCreateForm() {

  console.log(
    "NEW PROJECT CLICKED"
  );

  try {

    renderProjectSimulationModal();

  }
  catch(error) {

    console.error(
      "MODAL ERROR:",
      error
    );

  }

}

// ========================================
// TEMP ACTIONS
// ========================================

function refreshData() {

  console.log(
    "REFRESH"
  );

}

function runScheduler() {

  console.log(
    "SCHEDULER"
  );

}

// ========================================
// GLOBAL EXPORTS
// ========================================

window.openCreateForm =
  openCreateForm;

window.refreshData =
  refreshData;

window.runScheduler =
  runScheduler;
