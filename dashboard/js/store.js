// =====================================
// SIMPLE ERP STORE (TEMP VERSION)
// =====================================

let projects = [];

// SIMPLE GLOBAL STORE (MVP ERP)

const state = {
  projects: [],
  stages: [],
  carpentryActive: true,
  stoneActive: true
};

export const store = {

  getState() {
    return state;
  },

  setState(newState) {
    Object.assign(state, newState);
    console.log("STORE UPDATED:", state);
  }

};

// ---------------------
// ADD PROJECT
// ---------------------
export function addProject(project) {
  projects.push(project);

  console.log(
    "PROJECT ADDED:",
    project
  );
}

// ---------------------
// GET PROJECTS
// ---------------------
export function getProjects() {
  return projects;
}

// ---------------------
// CLEAR PROJECTS
// ---------------------
export function clearProjects() {
  projects = [];

  console.log(
    "PROJECTS CLEARED"
  );
}
