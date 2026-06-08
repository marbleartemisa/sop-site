import { STATE } from "./state.js";
import { getProjects, post } from "./api.js";
import { formatDate } from "../utils/schedule.js";

/****************************************************
 * 📦 PROJECTS VIEW (MAIN PANEL)
 ****************************************************/
export async function renderProjects() {

  const container = document.getElementById("view-container");

  const projects = await getProjects();

  STATE.projects = projects;
  window.STATE = STATE;

  let html = `
    <div class="panel">

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2>📦 Projects Control Center</h2>
        <button onclick="openCreateForm()">➕ New Project</button>
      </div>

      <hr/>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Material</th>
            <th>Ft2</th>
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
        <td>${p.Material}</td>
        <td>${p.Ft2}</td>
        <td>${p.Priority}</td>

        <td style="display:flex; gap:6px;">

          <button onclick="editProject('${p.ProjectID}')">✏️</button>

          <button onclick="pauseProject('${p.ProjectID}')">⛔</button>

          <button onclick="deleteProject('${p.ProjectID}')">🗑</button>

        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>

    </div>
  `;

  container.innerHTML = html;
}


/****************************************************
 * ⛔ PAUSE PROJECT
 ****************************************************/
async function pauseProject(id) {
  await post("PAUSE_PROJECT", { projectId: id });
  await renderProjects();
}

window.pauseProject = pauseProject;


/****************************************************
 * 🗑 DELETE PROJECT
 ****************************************************/
async function deleteProject(id) {
  await post("DELETE_PROJECT", { projectId: id });
  await renderProjects();
}

window.deleteProject = deleteProject;


/****************************************************
 * ➕ CREATE PROJECT MODAL TRIGGER
 ****************************************************/
function openCreateForm() {
  openProjectModal();
}

window.openNewProject = openCreateForm;
window.openCreateForm = openCreateForm;


/****************************************************
 * 📊 OPTIONAL: SCHEDULE VIEW (SEPARATE FUNCTION)
 * (ANTES ESTABA MAL MEZCLADO AQUÍ)
 ****************************************************/
export function renderScheduleView() {

  const container = document.getElementById("view-container");

  const grouped = groupByProject(STATE.schedule || []);

  let html = `
    <div class="panel">
      <h2>📊 Production Schedule</h2>

      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Resource</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>

        <tbody>
  `;

  Object.values(grouped).forEach(rows => {
    rows.forEach(row => {
      html += `
        <tr>
          <td>${row.ProjectID}</td>
          <td>${row.Resource}</td>
          <td>${formatDate(row.Start)}</td>
          <td>${formatDate(row.End)}</td>
        </tr>
      `;
    });
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}


/****************************************************
 * 🧠 GROUP BY (LOCAL UTILITY CLEAN)
 ****************************************************/
function groupByProject(data) {
  return data.reduce((acc, item) => {
    if (!acc[item.ProjectID]) acc[item.ProjectID] = [];
    acc[item.ProjectID].push(item);
    return acc;
  }, {});
}
