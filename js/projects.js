import { STATE } from "./state.js";
import { getProjects, post } from "./api.js";
import { formatDate } from "../utils/schedule.js";
import { TIME_RATES } from "./timeEngine.js";

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
    
      <div style="display:flex; gap:10px;">
        <button onclick="openCreateForm()">➕ New Project</button>
    
        <button onclick="runScheduleAll()" style="background:#1e40af; color:white;">
          🧠 Run Schedule
        </button>
      </div>
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
          <button onclick="openGantt('${p.ProjectID}')">📊 SAP Gantt</button>
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
import { createProject } from "./api.js";

async function submitProject() {
    
  ServiceType: selectedServices,
      const selectedServices = [...document.querySelectorAll(".svc:checked")]
  .map(el => el.value);
  
  try {

    const customer = document.getElementById("m_customer").value?.trim();

    if (!customer) {
      alert("Customer is required");
      return;
    }

    const project = {
      ProjectID: "PRJ-" + Date.now(),

      Customer: customer,

      Material: document.getElementById("m_material").value,

      Ft2: Number(document.getElementById("m_ft2").value) || 0,

      Pieces: Number(document.getElementById("m_pieces").value) || 0,

      Complexity: Number(document.getElementById("m_level").value) || 1,

      EdgeType: document.getElementById("m_edge_type").value,

      EdgeLF: Number(document.getElementById("m_edge_ft").value) || 0,

      Cutouts: Number(document.getElementById("m_cutouts").value) || 0,

      Slabs: Number(document.getElementById("m_slabs").value) || 0,

      WorkflowTemplate: "DEFAULT",

      ServiceType: typeof detectServiceType === "function"
        ? detectServiceType()
        : "STONE",

      Status: "NEW",

      CreatedDate: new Date().toISOString(),

      CreatedBy: "UI"
    };

    console.log("PROJECT READY:", project);

    const result = await createProject(project);

    console.log("CREATE PROJECT RESULT:", result);

    if (result?.status !== "OK") {

      alert(result?.message || "Error creating project");
      return;
    }

    await renderProjects();

    closeModal();

  } catch (err) {

    console.error("SUBMIT PROJECT ERROR:", err);

    alert("Error creating project: " + err.message);
  }
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

function safeNumber(id) {
  return Number(document.getElementById(id)?.value || 0);
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

setTimeout(() => {

  document.querySelectorAll(".svc").forEach(cb => {
    cb.addEventListener("change", renderDynamicPanel);
  });

}, 200);

function renderDynamicPanel() {

  const selected = [...document.querySelectorAll(".svc:checked")]
    .map(el => el.value);

  const panel = document.getElementById("dynamic-panel");

  let html = "";

  /**********************
   * 🪨 STONE MODULE
   **********************/
  if (selected.includes("STONE")) {

   html += `
  <h3>🪨 Stone Production</h3>

  <select id="m_thickness">
    <option value="6mm">6mm</option>
    <option value="8mm">8mm</option>
    <option value="12mm">12mm</option>
    <option value="2cm">2cm</option>
    <option value="3cm">3cm</option>
  </select>

  <select id="m_resource">
    <option value="BRETON">Breton CNC</option>
    <option value="WATERJET">Waterjet</option>
  </select>

  <select id="m_edge_type">
    <option value="simple">Simple</option>
    <option value="bullnose">Bullnose</option>
    <option value="ogee">Ogee</option>
    <option value="laminated">Laminated</option>
  </select>

  <input id="m_ft2" type="number" placeholder="Sqft (Panels)">
  <input id="m_edge_ft" type="number" placeholder="Edge Linear Ft">
  <input id="m_cutouts" type="number" placeholder="Cutouts">
  <input id="m_slabs" type="number" placeholder="Slabs">
`;
  }

  /**********************
   * 🪵 CARPENTRY MODULE
   **********************/
  if (selected.includes("CARPENTRY")) {

  html += `
  <h3>🪵 Carpentry Production</h3>

  <input id="m_panels" type="number" placeholder="Panels (CNC)">

  <select id="m_cabinets">
    <option value="0">0 Cabinets</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="5">5+</option>
  </select>

  <select id="m_drawers">
    <option value="0">0 Drawers</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="5">5+</option>
  </select>

  <select id="m_pantry">
    <option value="0">No Pantry</option>
    <option value="1">1 Pantry</option>
    <option value="2">2+</option>
  </select>

  <select id="m_trashcan">
    <option value="0">No Trashcan</option>
    <option value="1">1</option>
    <option value="2">2+</option>
  </select>

  <select id="m_lazy">
    <option value="0">None</option>
    <option value="1">Lazy Susan</option>
  </select>

  <select id="m_lemans">
    <option value="0">None</option>
    <option value="1">LeMans II</option>
  </select>

  <select id="m_pocket_pantry">
    <option value="0">No</option>
    <option value="1">Yes</option>
  </select>

  <select id="m_pocket_cabinet">
    <option value="0">No</option>
    <option value="1">Yes</option>
  </select>

  <input id="m_edge_ft_carp" type="number" placeholder="Edge Banding LF">
`;
  }

  panel.innerHTML = html;
}

/****************************************************
 * ❌ CLOSE MODAL
 ****************************************************/
function closeModal() {
  document.getElementById("modal-container").innerHTML = "";
}

import { TIME_RATES } from "./timeEngine.js";

function calculateSimulation() {

  const selected = [...document.querySelectorAll(".svc:checked")]
    .map(el => el.value);

  let total = 0;
  let breakdown = [];

  /**********************
   * 🪨 STONE CALC
   **********************/
  if (selected.includes("STONE")) {

    const thickness = document.getElementById("m_thickness")?.value || "8mm";

    const factor = TIME_RATES.STONE.thicknessFactor[thickness];

    const panels = Number(document.getElementById("m_ft2")?.value || 0);
    const edgeFt = Number(document.getElementById("m_edge_ft")?.value || 0);
    const cutouts = Number(document.getElementById("m_cutouts")?.value || 0);
    const slabs = Number(document.getElementById("m_slabs")?.value || 0);

    const cnc = panels * TIME_RATES.STONE.cncCut * factor;
    const edge = edgeFt * TIME_RATES.STONE.edge * factor;
    const cut = panels * TIME_RATES.STONE.panelCut * factor;

    total += cnc + edge + cut + (cutouts * 2) + (slabs * 3);

    breakdown.push(`🪨 CNC: ${cnc.toFixed(1)} min`);
    breakdown.push(`Edge: ${edge.toFixed(1)} min`);
    breakdown.push(`Cut: ${cut.toFixed(1)} min`);
  }

  /**********************
   * 🪵 CARPENTRY CALC
   **********************/
  if (selected.includes("CARPENTRY")) {

    const p = {
      panels: Number(document.getElementById("m_panels")?.value || 0),
      cabinets: Number(document.getElementById("m_cabinets")?.value || 0),
      drawers: Number(document.getElementById("m_drawers")?.value || 0),
      pantry: Number(document.getElementById("m_pantry")?.value || 0),
      trashcan: Number(document.getElementById("m_trashcan")?.value || 0),
      lazy: Number(document.getElementById("m_lazy")?.value || 0),
      lemans: Number(document.getElementById("m_lemans")?.value || 0),
      pocketP: Number(document.getElementById("m_pocket_pantry")?.value || 0),
      pocketC: Number(document.getElementById("m_pocket_cabinet")?.value || 0),
      edge: Number(document.getElementById("m_edge_ft_carp")?.value || 0)
    };

    const t = TIME_RATES.CARPENTRY;

    const cnc = p.panels * t.cncCut;
    const edge = p.edge * t.edgeBand;
    const cabinets = p.cabinets * t.cabinet;
    const drawers = p.drawers * t.drawer;
    const pantry = p.pantry * t.pantry;
    const trash = p.trashcan * t.trashcan;
    const lazy = p.lazy * t.lazySusan;
    const lemans = p.lemans * t.lemans;
    const pp = p.pocketP * t.pocketPantry;
    const pc = p.pocketC * t.pocketCabinet;

    total += cnc + edge + cabinets + drawers + pantry + trash + lazy + lemans + pp + pc;

    breakdown.push(`🪵 CNC: ${cnc.toFixed(1)} min`);
    breakdown.push(`Edge: ${edge.toFixed(1)} min`);
    breakdown.push(`Cabinets: ${cabinets.toFixed(1)} min`);
  }

  const html = `
    <p><b>Total Time:</b> ${(total / 60).toFixed(2)} hrs</p>
    <hr>
    ${breakdown.map(b => `<p>${b}</p>`).join("")}
  `;

  document.getElementById("sim-result").innerHTML = html;
}

import { generateSchedule } from "./scheduler.js";

function runScheduleAll() {
  const projects = STATE.projects;

  let allTasks = [];

  projects.forEach(p => {
    const tasks = generateSchedule(p.ProjectID, STATE);
    allTasks = allTasks.concat(tasks);
  });

  STATE.schedule = allTasks;

  console.log("SCHEDULE UPDATED:", allTasks);
}

import { renderGantt } from "./gantt.js";

function openGantt(projectId) {
  window.lastGanttProject = projectId;
  renderGantt(projectId, window.currentZoom || "day");
}

window.openGantt = openGantt;

/****************************************************
 * 🌐 GLOBAL EXPORTS (IMPORTANT FOR HTML ONCLICK)
 ****************************************************/
window.renderProjects = renderProjects;
window.openCreateForm = openCreateForm;
window.pauseProject = pauseProject;
window.deleteProject = deleteProject;
window.submitProject = submitProject;
window.runScheduleAll = runScheduleAll;
window.closeModal = closeModal;

