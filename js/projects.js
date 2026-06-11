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
import { EventBus } from "./eventBus.js";

EventBus.on("OPEN_CREATE_PROJECT", () => {
  openProjectModal();
});

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

  try {

    const selectedServices = [...document.querySelectorAll(".svc:checked")]
      .map(el => el.value);

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
      ServiceType: selectedServices.length ? selectedServices : ["STONE"],

      Status: "NEW",
      CreatedDate: new Date().toISOString(),
      CreatedBy: "UI"
    };

    console.log("PROJECT READY:", project);

    const result = await createProject(project);

    if (result?.status !== "OK") {
      alert(result?.message || "Error creating project");
      return;
    }

    await renderProjects();
    closeModal();

  } catch (err) {
    console.error(err);
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

  <div class="modal"
       style="
          width:1400px;
          max-width:95vw;
          height:85vh;
          overflow:auto;
          display:grid;
          grid-template-columns: 340px 1fr 340px;
          gap:20px;
          font-family: Arial;
       ">

    <!-- ===================== -->
    <!-- COLUMN 1 -->
    <!-- ===================== -->
    <div>

      <h2>New Project</h2>

      <input
        id="m_customer"
        placeholder="Customer"
        style="width:100%; margin-bottom:10px;"
      >

      <h3>Project Stages</h3>

      <div class="stage-list">

        <label class="stage-item">
          <input class="stage" type="checkbox" checked value="AGREEMENT">
          Agreement (0d)
        </label>

        <label class="stage-item">
          <input class="stage" type="checkbox" checked value="MEASURE">
          Measure Confirmation (3d)
        </label>

        <label class="stage-item">
          <input class="stage" type="checkbox" checked value="SCHEDULING">
          Scheduling (3d)
        </label>

        <label class="stage-item">
          <input class="stage" type="checkbox" checked value="MATERIAL">
          Material Order (4d)
        </label>

        <label class="stage-item">
          <input class="stage" type="checkbox" checked value="APPROVAL">
          Final Approval (3d)
        </label>

        <label class="stage-item">
          <input class="stage svc" type="checkbox" checked value="CARPENTRY">
          Cabinet Fabrication (2.5d)
        </label>

        <label class="stage-item">
          <input class="stage" type="checkbox" checked value="INSTALL_CAB">
          Cabinet Installation (2.5d)
        </label>

        <label class="stage-item">
          <input class="stage" type="checkbox" checked value="STONE_MEASURE">
          Stone Measure (2d)
        </label>

        <label class="stage-item">
          <input class="stage" type="checkbox" checked value="STONE_APPROVAL">
          Stone Approval (3d)
        </label>

        <label class="stage-item">
          <input class="stage svc" type="checkbox" checked value="STONE">
          Stone Fabrication (3d)
        </label>

        <label class="stage-item">
          <input class="stage" type="checkbox" checked value="STONE_INSTALL">
          Stone Installation (3d)
        </label>

        <label class="stage-item">
          <input class="stage" type="checkbox" checked value="PUNCHOUT">
          Punchout (2d)
        </label>

      </div>

      <br>

      <button onclick="submitProject()">
        Create Project
      </button>

    </div>

    <!-- ===================== -->
    <!-- COLUMN 2 -->
    <!-- ===================== -->
    <div>

      <h3>Resources & Parameters</h3>

      <!-- AHORA MATERIAL VA AQUÍ -->
      <div style="margin-bottom:15px;">
        <label style="display:block; margin-bottom:6px;">Stone Material</label>

        <select
          id="m_material"
          style="width:100%; padding:6px;"
        >
          <option>Caesarstone</option>
          <option>Cambria</option>
          <option>Dekton</option>
          <option>Granite</option>
          <option>Quartz</option>
          <option>Quartzite</option>
          <option>Porcelain</option>
        </select>
      </div>

      <div id="dynamic-panel"></div>

    </div>

    <!-- ===================== -->
    <!-- COLUMN 3 -->
    <!-- ===================== -->
    <div>

      <h3>Simulation</h3>

      <div id="sim-result">
        Select stages and parameters...
      </div>

    </div>

  </div>

  <style>
    .stage-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stage-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
    }

    .stage-item input {
      margin: 0;
    }
  </style>
  `;

  renderDynamicPanel();

  setTimeout(() => {

    document.querySelectorAll(".svc")
      .forEach(el => {

        el.addEventListener("change", () => {
          renderDynamicPanel();
          calculateSimulation();
        });

      });

  }, 100);
}

function openCreateForm() {
  openProjectModal();
}

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
      <div class="module">
        <h3>🪨 Stone Production</h3>

        <select id="m_stone_thickness">
          <option value="6mm">6mm</option>
          <option value="8mm">8mm</option>
          <option value="12mm">12mm</option>
          <option value="2cm">2cm</option>
          <option value="3cm">3cm</option>
        </select>

        <select id="m_stone_resource">
          <option value="BRETON">Breton CNC</option>
          <option value="WATERJET">Waterjet</option>
        </select>

        <select id="m_stone_edge_type">
          <option value="simple">Simple</option>
          <option value="bullnose">Bullnose</option>
          <option value="ogee">Ogee</option>
          <option value="laminated">Laminated</option>
        </select>

        <input id="m_stone_ft2" type="number" placeholder="Sqft (Stone Panels)">
        <input id="m_stone_edge_ft" type="number" placeholder="Edge Linear Ft">
        <input id="m_stone_cutouts" type="number" placeholder="Cutouts">
        <input id="m_stone_slabs" type="number" placeholder="Slabs">
      </div>
    `;
  }

  /**********************
   * 🪵 CARPENTRY MODULE
   **********************/
  if (selected.includes("CARPENTRY")) {

    html += `
      <div class="module">
        <h3>🪵 Carpentry Production</h3>

        <input id="m_carpentry_panels" type="number" placeholder="Panels (CNC)">

        <select id="m_carpentry_cabinets">
          <option value="0">0 Cabinets</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="5">5+</option>
        </select>

        <select id="m_carpentry_drawers">
          <option value="0">0 Drawers</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="5">5+</option>
        </select>

        <select id="m_carpentry_pantry">
          <option value="0">No Pantry</option>
          <option value="1">1</option>
          <option value="2">2+</option>
        </select>

        <select id="m_carpentry_trashcan">
          <option value="0">No Trashcan</option>
          <option value="1">1</option>
          <option value="2">2+</option>
        </select>

        <select id="m_carpentry_lazy">
          <option value="0">None</option>
          <option value="1">Lazy Susan</option>
        </select>

        <select id="m_carpentry_lemans">
          <option value="0">None</option>
          <option value="1">LeMans II</option>
        </select>

        <select id="m_carpentry_pocket_pantry">
          <option value="0">No</option>
          <option value="1">Yes</option>
        </select>

        <select id="m_carpentry_pocket_cabinet">
          <option value="0">No</option>
          <option value="1">Yes</option>
        </select>

        <input id="m_carpentry_edge_ft" type="number" placeholder="Edge Banding LF">
      </div>
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

function calculateSimulation() {

  const selected = [...document.querySelectorAll(".svc:checked")]
    .map(el => el.value);

  let total = 0;
  let breakdown = [];

  /**********************
   * 🪨 STONE CALC
   **********************/
  if (selected.includes("STONE")) {

    const thickness =
      document.getElementById("m_stone_thickness")?.value || "8mm";

    const factor = TIME_RATES.STONE.thicknessFactor[thickness] || 1;

    const panels = safeNumber("m_stone_ft2");
    const edgeFt = safeNumber("m_stone_edge_ft");
    const cutouts = safeNumber("m_stone_cutouts");
    const slabs = safeNumber("m_stone_slabs");

    const cnc = panels * TIME_RATES.STONE.cncCut * factor;
    const edge = edgeFt * TIME_RATES.STONE.edge * factor;
    const cut = panels * TIME_RATES.STONE.panelCut * factor;

    const extras = (cutouts * 2) + (slabs * 3);

    total += cnc + edge + cut + extras;

    breakdown.push(`🪨 CNC: ${cnc.toFixed(1)} min`);
    breakdown.push(`Edge: ${edge.toFixed(1)} min`);
    breakdown.push(`Panel Cut: ${cut.toFixed(1)} min`);
  }

  /**********************
   * 🪵 CARPENTRY CALC
   **********************/
  if (selected.includes("CARPENTRY")) {

    const panels = safeNumber("m_carpentry_panels");
    const cabinets = safeNumber("m_carpentry_cabinets");
    const drawers = safeNumber("m_carpentry_drawers");
    const pantry = safeNumber("m_carpentry_pantry");
    const trashcan = safeNumber("m_carpentry_trashcan");
    const lazy = safeNumber("m_carpentry_lazy");
    const lemans = safeNumber("m_carpentry_lemans");
    const pocketP = safeNumber("m_carpentry_pocket_pantry");
    const pocketC = safeNumber("m_carpentry_pocket_cabinet");
    const edge = safeNumber("m_carpentry_edge_ft");

    const t = TIME_RATES.CARPENTRY;

    const cnc = panels * t.cncCut;
    const edgeTime = edge * t.edgeBand;
    const cabinetsTime = cabinets * t.cabinet;
    const drawersTime = drawers * t.drawer;
    const pantryTime = pantry * t.pantry;
    const trashTime = trashcan * t.trashcan;
    const lazyTime = lazy * t.lazySusan;
    const lemansTime = lemans * t.lemans;
    const ppTime = pocketP * t.pocketPantry;
    const pcTime = pocketC * t.pocketCabinet;

    const carpentryTotal =
      cnc + edgeTime + cabinetsTime + drawersTime +
      pantryTime + trashTime + lazyTime + lemansTime +
      ppTime + pcTime;

    total += carpentryTotal;

    breakdown.push(`🪵 CNC: ${cnc.toFixed(1)} min`);
    breakdown.push(`Edge: ${edgeTime.toFixed(1)} min`);
    breakdown.push(`Cabinets: ${cabinetsTime.toFixed(1)} min`);
    breakdown.push(`Drawers: ${drawersTime.toFixed(1)} min`);
  }

  /**********************
   * OUTPUT
   **********************/
  document.getElementById("sim-result").innerHTML = `
    <p><b>Total Time:</b> ${(total / 60).toFixed(2)} hrs</p>
    <hr>
    ${breakdown.map(b => `<p>${b}</p>`).join("")}
  `;
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
window.renderProjects = renderProjects
window.openCreateForm = openCreateForm;
window.pauseProject = pauseProject;
window.deleteProject = deleteProject;
window.submitProject = submitProject;
window.runScheduleAll = runScheduleAll;
window.closeModal = closeModal;

