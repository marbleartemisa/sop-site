const DEFAULT_STATE = {
  PROJECTS: [],
  PROJECT_TASKS: [],
  RESOURCES: []
};

export const STATE = structuredClone(DEFAULT_STATE);

let isLoaded = false;

// ======================
// LOAD STATE
// ======================
export function loadState() {
  const saved = localStorage.getItem("STATE");

  if (saved) {
    const parsed = JSON.parse(saved);

    STATE.PROJECTS = parsed.PROJECTS || [];
    STATE.PROJECT_TASKS = parsed.PROJECT_TASKS || [];
    STATE.RESOURCES = parsed.RESOURCES || [];
  }

  isLoaded = true;
  return STATE;
}

// ======================
// SAVE STATE
// ======================
function saveState() {
  localStorage.setItem("STATE", JSON.stringify(STATE));
}

// ======================
// SETTERS
// ======================
export function setProjects(projects) {
  STATE.PROJECTS = projects;
  saveState();
}

export function setProjectTasks(tasks) {
  STATE.PROJECT_TASKS = tasks;
  saveState();
}

export function setResources(resources) {
  STATE.RESOURCES = resources;
  saveState();
}

// ======================
// GETTERS (IMPORTANTE PARA SCHEDULER)
// ======================
export function getProjectTasks() {
  return STATE.PROJECT_TASKS;
}

export function getProjects() {
  return STATE.PROJECTS;
}

export function getResources() {
  return STATE.RESOURCES;
}

// ======================
// INIT
// ======================
loadState();

// DEBUG
window.STATE = STATE;
