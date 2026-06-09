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
          <option>Caesarstone<option>
          <option>Cambria<option>
          <option>Dekton<option>
          <option>Dolomite<option>
          <option>Engineered Quartz<option>
          <option>Granite<option>
          <option>Infinity<option>
          <option>Lapitec<option>
          <option>MSI Quartz<option>
          <option>Neolith<option>
          <option>Obsidiana<option>
          <option>Porcelain<option>
          <option>Quartz<option>
          <option>Quartzite<option>
          <option>Sapienstone<option>
          <option>Silestone<option>
          <option>Sintered Stone<option>
          <option>Soapstone<option>
          <option>Ultra Compact Surfaces<option>
        </select>

        <select id="m_resource">
          <option value="BRETON">Breton (CNC)</option>
          <option value="COACH">Coach (CNC)</option>
          <option value="MANUAL">Fabricación Manual</option>
        </select>

        <input id="m_ft2" type="number" placeholder="Total Ft2">

        <input id="m_pieces" type="number" placeholder="Pieces">

        <select id="m_level">
          <option value="1">Level 1 (Corte y Pulido)</option>
          <option value="2">Level 2 (Standard)</option>
          <option value="3">Level 3 (Luxury)</option>
        </select>

        <select id="m_edge_type">
          <option>simple</option>
          <option>45</option>
          <option>laminated</option>
          <option>bullnose</option>
          <option>half bullnose</option>
          <option>full bullnose</option>
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
  setTimeout(() => {

  const ids = [
    "m_ft2",
    "m_pieces",
    "m_level",
    "m_edge_type",
    "m_edge_ft",
    "m_cutouts",
    "m_slabs"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);

    if (el) {
      el.addEventListener("input", calculateSimulation);
      el.addEventListener("change", calculateSimulation);
    }
  });

}, 200);
}

/****************************************************
 * ❌ CLOSE MODAL
 ****************************************************/
function closeModal() {
  document.getElementById("modal-container").innerHTML = "";
}

function calculateSimulation() {

  const p = {
    ft2: Number(document.getElementById("m_ft2")?.value || 0),
    pieces: Number(document.getElementById("m_pieces")?.value || 0),
    level: Number(document.getElementById("m_level")?.value || 1),
    edgeType: document.getElementById("m_edge_type")?.value,
    edgeFt: Number(document.getElementById("m_edge_ft")?.value || 0),
    cutouts: Number(document.getElementById("m_cutouts")?.value || 0),
    slabs: Number(document.getElementById("m_slabs")?.value || 0)
  };

  const levelFactor = { 1: 1.0, 2: 1.3, 3: 1.7 }[p.level] || 1;

  const edgeFactor = {
    simple: 1.0,
    45: 1.2,
    laminated: 1.3,
    bullnose: 1.8,
    ogee: 1.8
  }[p.edgeType] || 1;

  const cut = p.ft2 * 0.08;
  const fab = p.pieces * 0.5;
  const edge = p.edgeFt * 0.15 * edgeFactor;
  const cutout = p.cutouts * 0.6;
  const slabs = p.slabs * 0.4;

  const total = (cut + fab + edge + cutout + slabs) * levelFactor;

  const html = `
    <p><b>Total Hours:</b> ${total.toFixed(2)}</p>
    <p>Cut: ${cut.toFixed(2)}</p>
    <p>Fabrication: ${fab.toFixed(2)}</p>
    <p>Edge: ${edge.toFixed(2)}</p>
    <p>Cutouts: ${cutout.toFixed(2)}</p>
    <p>Slabs: ${slabs.toFixed(2)}</p>
  `;

  const el = document.getElementById("sim-result");
  if (el) el.innerHTML = html;
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

