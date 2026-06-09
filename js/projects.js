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

/****************************************************
 * 🗑 DELETE PROJECT
 ****************************************************/
async function deleteProject(id) {
  await post("DELETE_PROJECT", { projectId: id });
  await renderProjects();
}

/****************************************************
 * ➕ CREATE PROJECT MODAL
 ****************************************************/
function openCreateForm() {
  openProjectModal();
}

/****************************************************
 * 📊 SCHEDULE VIEW
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
 * ➕ SUBMIT PROJECT
 ****************************************************/
async function submitProject() {

  const project = {
    projectId: "PRJ-" + Date.now(),

    customer: document.getElementById("m_customer").value,
    material: document.getElementById("m_material").value,
    ft2: Number(document.getElementById("m_ft2").value),
    pieces: Number(document.getElementById("m_pieces").value),

    level: Number(document.getElementById("m_level").value),
    edgeType: document.getElementById("m_edge_type").value,
    edgeFt: Number(document.getElementById("m_edge_ft").value),

    cutouts: Number(document.getElementById("m_cutouts").value),
    slabs: Number(document.getElementById("m_slabs").value),

    createdAt: new Date().toISOString(),
    createdBy: window.currentUser || "system"
  };

  console.log("PROJECT READY:", project);

  await post("CREATE_PROJECT", project);

  closeModal();
  await renderProjects();
}

/****************************************************
 * 🧠 GROUP BY UTILITY
 ****************************************************/
function groupByProject(data) {
  return data.reduce((acc, item) => {
    if (!acc[item.ProjectID]) acc[item.ProjectID] = [];
    acc[item.ProjectID].push(item);
    return acc;
  }, {});
}

/****************************************************
 * 🪟 MODAL
 ****************************************************/
function openProjectModal() {

  const container = document.getElementById("modal-container");

  container.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal()"></div>

    <div class="modal" style="display:flex; gap:20px; width:700px;">

      <!-- LEFT: FORM -->
      <div style="flex:1;">
        <h2>New Project</h2>

        <input id="m_customer" placeholder="Customer">

        <select id="m_material">
          <option>Quartz</option>
          <option>Granite</option>
          <option>Marble</option>
          <option>Porcelain</option>
        </select>

        <input id="m_ft2" type="number" placeholder="Total Ft2">

        <input id="m_pieces" type="number" placeholder="Pieces">

        <select id="m_level">
          <option value="1">Level 1 (Simple)</option>
          <option value="2">Level 2 (Standard)</option>
          <option value="3">Level 3 (VIP)</option>
        </select>

        <select id="m_edge_type">
          <option>simple</option>
          <option>45</option>
          <option>laminated</option>
          <option>bullnose</option>
          <option>ogee</option>
        </select>

        <input id="m_edge_ft" type="number" placeholder="Edge Linear Ft">

        <input id="m_cutouts" type="number" placeholder="Cutouts">

        <input id="m_slabs" type="number" placeholder="Number of Slabs">

        <button onclick="submitProject()">Create</button>
      </div>

      <!-- RIGHT: LIVE SIMULATION -->
      <div style="flex:1; background:#0f172a; padding:12px; border-radius:10px;">
        <h3>Simulation</h3>
        <div id="sim-result">
          Fill form to see simulation...
        </div>
      </div>

    </div>
  `;
}

/****************************************************
 * ❌ CLOSE MODAL
 ****************************************************/
function closeModal() {
  document.getElementById("modal-container").innerHTML = "";
}

/****************************************************
 * 🌐 GLOBAL EXPORTS (IMPORTANT FOR HTML ONCLICK)
 ****************************************************/
window.renderProjects = renderProjects;
window.openCreateForm = openCreateForm;
window.pauseProject = pauseProject;
window.deleteProject = deleteProject;
window.submitProject = submitProject;
window.closeModal = closeModal;

