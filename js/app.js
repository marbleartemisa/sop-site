import { generateSchedule } from "./scheduler.js";
import { state } from "./state.js";

window.app = {
  init,
  view: "projects"
};

async function init() {
  console.log("ERP INIT");

  await loadInitialData();

  showView("projects");
}

async function loadInitialData() {
  // aquí luego conectas API real
  console.log("Loading data...");
}

window.showView = function (view) {
  const container = document.getElementById("view-container");

  if (view === "projects") {
    container.innerHTML = renderProjects();
  }

  if (view === "gantt") {
    container.innerHTML = renderGantt();
  }

  if (view === "create") {
    container.innerHTML = renderProjectConfigurator();
  }
};
