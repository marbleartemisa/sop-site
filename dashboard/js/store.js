// =====================================
// SIMPLE ERP STORE (TEMP VERSION)
// =====================================

let projects = [];

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
