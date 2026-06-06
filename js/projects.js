import { STATE } from "./state.js";
import { groupBy, formatDate } from "./utils/schedule.js";

function renderProjects() {
  const container = document.getElementById("view-container");
  const grouped = groupBy(STATE.schedule, "ProjectID");

  let html = `<div class="panel">
    <h2>📦 Projects Queue</h2>
    <table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Resource</th>
          <th>Start</th>
          <th>End</th>
        </tr>
      </thead>
      <tbody>`;

  Object.values(grouped).forEach(rows => {
    rows.forEach(row => {
      html += `
        <tr>
          <td>${row.ProjectID}</td>
          <td>${row.Resource}</td>
          <td>${formatDate(row.Start)}</td>
          <td>${formatDate(row.End)}</td>
        </tr>`;
    });
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

function groupByProject(data) {
  const map = {};
  data.forEach(d => {
    if (!map[d.ProjectID]) map[d.ProjectID] = [];
    map[d.ProjectID].push(d);
  });
  return map;
}

function format(date) {
  return new Date(date).toLocaleDateString();
}


async function renderProjectsPanel() {

  const projects = await getProjects();

  let html = `
    <div class="panel">
      <h2>📦 Projects Control Panel</h2>

      <button onclick="openCreateForm()">➕ New Project</button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  projects.forEach(p => {

    html += `
      <tr>
        <td>${p.ProjectID}</td>
        <td>${p.Customer}</td>
        <td>${p.Status}</td>
        <td>${p.Priority}</td>

        <td>

          <button onclick="editProject('${p.ProjectID}')">✏️</button>

          <button onclick="pauseProject('${p.ProjectID}')">⛔</button>

          <button onclick="deleteProject('${p.ProjectID}')">🗑</button>

        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;

  document.getElementById("view-container").innerHTML = html;
}

async function pauseProject(id) {
  await post("PAUSE_PROJECT", { projectId: id });
  renderProjectsPanel();
}

async function deleteProject(id) {
  await post("DELETE_PROJECT", { projectId: id });
  renderProjectsPanel();
}

function openCreateForm() {
  openProjectModal();
}

window.openNewProject = openCreateForm;
