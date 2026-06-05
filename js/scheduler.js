async function initERP() {
  await refresh();
  showView('projects');
}

async function refresh() {
  STATE.schedule = await fetchSchedule();
  renderProjects();
}

function showView(view) {
  const container = document.getElementById("view-container");

  if (view === "projects") renderProjects();
  if (view === "gantt") renderGantt();
  if (view === "resources") renderResources();
  if (view === "create") renderCreateProject();
  if (view === "history") renderHistory();
}
