import { generateSchedule } from "./scheduler.js";
import { STATE } from "./state.js";
import { renderProjects } from "./projects.js";

window.app = {
  init,
  view: "projects"
};

export async function init() {

  console.log("ERP INIT");

  await loadInitialData();

  await renderProjects();
}

async function loadInitialData() {

  console.log("Loading data...");
}

/* GLOBAL INIT */
window.initERP = init;

/* NAVIGATION */
window.showView = async function(view) {

  if (view === "projects") {
    await renderProjects();
    return;
  }

  console.log("View not implemented:", view);
};
