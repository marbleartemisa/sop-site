const API = const API = "https://script.google.com/macros/s/AKfycbzVLUTOzA0gGIfKml7kWBAWIjSE6g473aBDmFCg-cN2UzSG2-VnKElingOTgCSdeIumfg/exec";

async function loadProjects() {

  const res = await fetch(API + "?action=projects");
  const data = await res.json();

  let html = "<table>";
  html += "<tr><th>ID</th><th>Customer</th><th>Status</th><th>Template</th></tr>";

  data.forEach(p => {
    html += `
      <tr onclick="loadTasks('${p.ProjectID}')">
        <td>${p.ProjectID}</td>
        <td>${p.Customer}</td>
        <td>${p.Status}</td>
        <td>${p.WorkflowTemplate || "-"}</td>
      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("projects").innerHTML = html;
}

async function loadTasks(projectId) {

  const res = await fetch(API + "?action=project_tasks");
  const data = await res.json();

  const filtered = data.filter(t => t.ProjectID === projectId);

  let html = "<table>";
  html += "<tr><th>Task</th><th>Resource</th><th>Hours</th></tr>";

  filtered.forEach(t => {
    html += `
      <tr>
        <td>${t.TaskName}</td>
        <td>${t.Resource}</td>
        <td>${t.Duration || t.PlannedHours}</td>
      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("tasks").innerHTML = html;
}

async function loadSchedule() {

  const res = await fetch(API + "?action=schedule");
  const data = await res.json();

  let html = "<table>";
  html += "<tr><th>Project</th><th>Resource</th><th>Start</th><th>End</th></tr>";

  data.forEach(s => {
    html += `
      <tr>
        <td>${s.ProjectID}</td>
        <td>${s.Resource}</td>
        <td>${new Date(s.Start).toLocaleString()}</td>
        <td>${new Date(s.End).toLocaleString()}</td>
      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("schedule").innerHTML = html;
}

async function createProjectDemo() {

  const payload = {
    action: "CREATE_PROJECT",
    project: {
      ProjectID: "P-" + Math.floor(Math.random() * 10000),
      Customer: "Demo Client",
      WorkflowTemplate: "EXPORT",
      Pieces: 20,
      EdgeLF: 50,
      Complexity: 1
    }
  };

  await fetch(API, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  await refreshAll();
}

function openCreateProject() {
  createProjectDemo();
}

async function refreshAll() {
  await loadProjects();
  await loadSchedule();
}

refreshAll();
