// =====================================
// ARTEMISA ERP STORE (CLEAN VERSION)
// =====================================

let state = {
  projects: [],
  stages: [],
  carpentryActive: true,
  stoneActive: true
};

let listeners = [];

export const store = {

  getState() {
    return state;
  },

  setState(newState) {
    state = { ...state, ...newState };

    console.log("STORE UPDATED:", state);

    listeners.forEach(fn => fn(state));
  },

  subscribe(fn) {
    listeners.push(fn);
  }
};

// OPTIONAL helpers
export function addProject(p) {
  state.projects.push(p);
}

export function getProjects() {
  return state.projects;
}

export function clearProjects() {
  state.projects = [];
}
