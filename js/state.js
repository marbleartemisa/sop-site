/****************************************************
 * GLOBAL ERP STATE
 ****************************************************/

const DEFAULT_STATE = {
  projects: [],
  schedule: [],
  resources: []
};

/* Estado global compartido */
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

    console.error("Failed loading STATE", err);

  }
}

/****************************************************
 * SAVE STATE
 ****************************************************/
function saveState() {

  localStorage.setItem(
    "STATE",
    JSON.stringify(STATE)
  );
}

/****************************************************
 * GETTERS
 ****************************************************/
export function getState() {
  return STATE;
}

/****************************************************
 * MUTATIONS
 ****************************************************/
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
 * INIT
 ****************************************************/
loadState();

/****************************************************
 * GLOBAL COMPATIBILITY
 ****************************************************/
window.STATE = STATE;

window.getState = getState;
window.setProjects = setProjects;
window.setSchedule = setSchedule;
window.setResources = setResources;
window.loadState = loadState;
