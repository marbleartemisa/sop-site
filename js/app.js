import { STATE } from "./state.js";
import { renderProjects } from "./projects.js";
import { getProjects, fetchSchedule } from "./api.js";
import { EventBus } from "./eventBus.js";

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

  registerEvents();

  console.log("✅ ERP READY");
}

/****************************************************
 * LOAD DATA FROM BACKEND
 ****************************************************/
async function loadInitialData() {

  console.log("📡 Loading backend data...");

  STATE.projects = await getProjects() || [];
  STATE.schedule = await fetchSchedule() || [];

  console.log("📦 Projects:", STATE.projects.length);
  console.log("📅 Schedule:", STATE.schedule.length);
}

/****************************************************
 * EVENT BUS REGISTRATION
 ****************************************************/
function registerEvents() {

  EventBus.on("OPEN_CREATE_PROJECT", () => {
    import("./projects.js").then(m => {
      m.openProjectModal();
    });
  });

  EventBus.on("REFRESH_PROJECTS", async () => {
    await renderProjects();
  });

  EventBus.on("RUN_SCHEDULER", async () => {
    console.log("🧠 running scheduler...");
  });
}

/****************************************************
 * GLOBAL INIT ENTRY
 ****************************************************/
window.initERP = init;

/****************************************************
 * NAVIGATION
 ****************************************************/
window.showView = async function(view) {

  window.app.view = view;

  switch (view) {

    case "projects":
      await renderProjects();
      break;

    case "schedule":
      console.log("Schedule view TODO");
      break;
  }
};
