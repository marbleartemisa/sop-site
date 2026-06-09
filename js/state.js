/****************************************************
 * GLOBAL STATE (ERP CORE)
 ****************************************************/

const DEFAULT_STATE = {
  projects: [],
  schedule: [],
  resources: []
};

/* 🔥 ESTO ES LO IMPORTANTE */
export const STATE = structuredClone(DEFAULT_STATE);

/****************************************************
 * LOAD STATE
 ****************************************************/
function loadState() {

  const saved = localStorage.getItem("STATE");

  if (!saved) return;

  try {

    const parsed = JSON.parse(saved);

    STATE.projects = parsed.projects || [];
    STATE.schedule = parsed.schedule || [];
    STATE.resources = parsed.resources || [];

  } catch (err) {
    console.error("STATE LOAD ERROR:", err);
  }
}

/****************************************************
 * SAVE STATE
 ****************************************************/
function saveState() {
  localStorage.setItem("STATE", JSON.stringify(STATE));
}

/****************************************************
 * INIT
 ****************************************************/
loadState();

/****************************************************
 * API
 ****************************************************/
export function getState() {
  return STATE;
}

export function setProjects(projects) {
  STATE.projects = projects;
  saveState();
}

export function setSchedule(schedule) {
  STATE.schedule = schedule;
  saveState();
}

export function setResources(resources) {
  STATE.resources = resources;
  saveState();
}

/****************************************************
 * GLOBAL COMPATIBILITY
 ****************************************************/
window.STATE = STATE;
window.getState = getState;
window.setProjects = setProjects;
window.setSchedule = setSchedule;
window.setResources = setResources;
