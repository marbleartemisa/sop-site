const DEFAULT_STATE = {
  projects: [],
  schedule: [],
  resources: []
};

export const STATE = structuredClone(DEFAULT_STATE);

// Load
function loadState() {
  const saved = localStorage.getItem("STATE");
  if (saved) {
    const parsed = JSON.parse(saved);
    STATE.projects = parsed.projects || [];
    STATE.schedule = parsed.schedule || [];
    STATE.resources = parsed.resources || [];
  }
}

// Save
function saveState() {
  localStorage.setItem("STATE", JSON.stringify(STATE));
}

// setters
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

// init
loadState();

// opcional compatibilidad debug
window.STATE = STATE;
