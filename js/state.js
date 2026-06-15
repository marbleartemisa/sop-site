const DEFAULT_STATE = {
  PROJECTS: [],
  PROJECT_TASKS: [],
  RESOURCES: []
};

export const EDGE_FACTORS = {
  MITER_45: {
    factor: 1.8,
    label: "Miter 45° (Glue + Recut + Polish)"
  },
  LAMINATED: {
    factor: 2.2,
    label: "Laminated (Build + Recut + Polish)"
  },
  BULLNOSE: {
    factor: 1.3,
    label: "Bullnose (Diarex)"
  },
  HALF_BULLNOSE: {
    factor: 1.35,
    label: "Half Bullnose (Diarex)"
  },
  FULL_BULLNOSE: {
    factor: 1.4,
    label: "Full Bullnose (Diarex)"
  },
  OGEE: {
    factor: 1.6,
    label: "Ogee (Diarex complex)"
  }
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


// DEBUG GLOBAL ACCESS (solo dev)
window.STATE = STATE;
window.EDGE_FACTORS = EDGE_FACTORS;
