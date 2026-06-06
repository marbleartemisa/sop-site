let STATE = {
  projects: [],
  schedule: [],
  resources: []
};

// state.js
export const STATE = {
  schedule: [],
  projects: []
};

// Load state from storage
function loadState() {
  const saved = localStorage.getItem("STATE");
  if (saved) {
    STATE = JSON.parse(saved);
  }
}

// Save state to storage
function saveState() {
  localStorage.setItem("STATE", JSON.stringify(STATE));
}

// Getters
function getState() {
  return STATE;
}

// Mutations (controladas)
function setProjects(projects) {
  STATE.projects = projects;
  saveState();
}

function setSchedule(schedule) {
  STATE.schedule = schedule;
  saveState();
}

function setResources(resources) {
  STATE.resources = resources;
  saveState();
}

// Exponer globalmente (IMPORTANTE para tu arquitectura actual)
window.STATE = STATE;
window.getState = getState;
window.setProjects = setProjects;
window.setSchedule = setSchedule;
window.setResources = setResources;
window.loadState = loadState;

loadState();
