import { STATE } from "./state.js";
import { renderProjects } from "./projects.js";
import { getProjects, fetchSchedule } from "./api.js";

/****************************************************
 * 🚀 APP CORE
 ****************************************************/
window.app = {
  init,
  view: "projects"
};

/****************************************************
 * INIT SYSTEM
 ****************************************************/
export async function init() {

  console.log("🚀 ERP INIT START");

  await loadInitialData();

  await renderProjects();

  console.log("✅ ERP READY");
}

/****************************************************
 * LOAD DATA FROM BACKEND (SOURCE OF TRUTH)
 ****************************************************/
async function loadInitialData() {

  console.log("📡 Loading backend data...");

  const projects = await getProjects();
  STATE.projects = projects || [];

  const schedule = await fetchSchedule();
  STATE.schedule = schedule || [];

  console.log("📦 Projects loaded:", STATE.projects.length);
  console.log("📅 Schedule loaded:", STATE.schedule.length);
}

/****************************************************
 * GLOBAL INIT (HTML ENTRY POINT)
 ****************************************************/
window.initERP = init;

/****************************************************
 * NAVIGATION SIMPLE
 ****************************************************/
window.showView = async function(view) {

  window.app.view = view;

  switch (view) {

    case "projects":
      await renderProjects();
      break;

    case "schedule":
      console.log("Schedule view (connect UI here)");
      break;

    default:
      console.log("View not implemented:", view);
  }
};
