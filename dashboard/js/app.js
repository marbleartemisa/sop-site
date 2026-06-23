import {
renderProjectSimulationModal
} from "./project-modal.js";

console.log("ERP App Loaded");

document.addEventListener("DOMContentLoaded", () => {

// Inicialización ERP
if (typeof initERP === "function") {
    initERP();
}

// Botón New Project
const btnNewProject =
    document.getElementById("btn-new-project");

if (btnNewProject) {

    btnNewProject.addEventListener(
        "click",
        renderProjectSimulationModal
    );

    console.log("New Project button connected");
}
else {

    console.warn(
        "btn-new-project not found"
    );
}

});

// ==============================
// TEMP FUNCTIONS
// ==============================

function refreshData() {

console.log(
    "Refresh triggered"
);

}

function runScheduler() {

console.log(
    "Scheduler triggered"
);

}

// ==============================
// GLOBAL FUNCTIONS
// ==============================

window.refreshData = refreshData;
window.runScheduler = runScheduler;
