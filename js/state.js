// Init
loadState();

/* EXPORTS */
export { STATE };

export function getState() {
  return STATE;
}

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

/* Compatibilidad global */
window.getState = getState;
window.setProjects = setProjects;
window.setSchedule = setSchedule;
window.setResources = setResources;
window.loadState = loadState;
