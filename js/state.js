const DEFAULT_STATE = {
  projects: [],
  schedule: [],
  resources: []
};

let STATE = structuredClone(DEFAULT_STATE);

// Load state from storage
function loadState() {
  const saved = localStorage.getItem("STATE");
  if (saved) {
    const parsed = JSON.parse(saved);

    // merge seguro (evita romper estructura)
    STATE.projects = parsed.projects || [];
    STATE.schedule = parsed.schedule || [];
    STATE.resources = parsed.resources || [];
  }
}

// Save state
function saveState() {
  localStorage.setItem("STATE", JSON.stringify(STATE));
}

// Getter seguro (evita manipulación directa)
function getState() {
  return STATE;
}

// Mutations controladas
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

// Init
loadState();

// Exposición global (para tu arquitectura actual híbrida)
window.getState = getState;
window.setProjects = setProjects;
window.setSchedule = setSchedule;
window.setResources = setResources;
window.loadState = loadState;
