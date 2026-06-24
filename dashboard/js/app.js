console.log("APP LOADED");

// ===============================
// IMPORT MODAL
// ===============================
import { renderProjectSimulationModal } from "./project-modal.js";

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  console.log("DOM READY");

  const btn = document.getElementById("btn-new-project");

  if (!btn) {
    console.error("❌ btn-new-project NOT FOUND");
    return;
  }

  console.log("✅ New Project button connected");

  btn.addEventListener("click", () => {
    console.log("🟢 New Project clicked");

    if (typeof renderProjectSimulationModal === "function") {
      renderProjectSimulationModal();
    } else {
      console.error("❌ Modal function missing");
    }
  });

});

// ===============================
// GLOBAL ACTIONS
// ===============================
window.refreshData = function () {
  console.log("Refresh triggered");
};

window.runScheduler = function () {
  console.log("Scheduler triggered");
};
