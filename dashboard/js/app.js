import { openProjectModal } from "./project-modal.js";

import { renderModal }
from './project-modal.js';

renderModal();

console.log("ERP App Loaded");

// ==============================
// NEW PROJECT MODAL
// ==============================
function openCreateForm() {
  console.log("New Project clicked");

  try {
    if (typeof openProjectModal === "function") {
      openProjectModal();
    } else {
      console.error("openProjectModal is not a function");
    }
  } catch (err) {
    console.error("Error opening modal:", err);
  }
}

// Exponer global para HTML onclick
window.openCreateForm = openCreateForm;

// ==============================
// MOCK FUNCTIONS (TEMP)
// ==============================
function refreshData() {
  console.log("refresh triggered");
}

function runScheduler() {
  console.log("scheduler triggered");
}

import {
    renderProjectSimulationModal
}
from './project-modal.js';

document.addEventListener(
    'DOMContentLoaded',
    () =>
    {
        const btn =
            document.getElementById(
                'btn-new-project'
            );

        if(btn)
        {
            btn.addEventListener(
                'click',
                renderProjectSimulationModal
            );
        }
    }
);

// Exponer global
window.refreshData = refreshData;
window.runScheduler = runScheduler;
