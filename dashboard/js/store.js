// ===============================
// SIMPLE STORE (TEMP)
// ===============================

let projects = [];

export function addProject(project) {
  projects.push(project);
  console.log("PROJECT ADDED:", project);
}

export function getProjects() {
  return projects;
}

export function clearProjects() {
  projects = [];
}
