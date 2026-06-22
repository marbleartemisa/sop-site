import { STATE, EDGE_FACTORS } from "./state.js";
import { getProjects, post } from "./api.js";
import { formatDate } from "../utils/schedule.js";
import { generateSchedule } from "./scheduler.js";


const STAGE_CONFIG = {

  STONE: {
    CUTTING: { required: true },
    CUTOUTS: { required: true },
    EDGES: { required: true },
    POLISH: { required: true },

    // opcionales
    SINK: { required: false },
    FRAME: { required: false }
  },

  CARPENTRY: {
    PRE_MICA: { required: false },
    CNC: { required: true },
    EDGEBAND: { required: true },
    ASSEMBLY: { required: true },

    // opcionales
    POST_MICA: { required: false },
    HARDWARE: { required: false }
  }

};



function initStageListeners() {
  const container = document.getElementById("modal-container");

  container.addEventListener("change", (e) => {
    if (!e.target.classList.contains("stage")) return;

    updateState();
  });
}

function updateState() {
  STATE.UI.stages = [...document.querySelectorAll(".stage:checked")]
    .map(el => el.value);

  renderDynamicPanel();
  calculateSimulation();
}

function syncSelectedStages() {
  STATE.UI = STATE.UI || {};
  STATE.UI.stages = [...document.querySelectorAll(".stage:checked")]
    .map(el => el.value);
}

/****************************************************
* 🪟 MODAL LIMPIO - PRODUCTION ERP
****************************************************/

function openProjectModal() {

  const container = document.getElementById("modal-container");
  if (!container) return;

  // =========================
  // 1. STATE SAFE INIT
  // =========================
  STATE.UI = STATE.UI || {};
  STATE.UI.stages = [];

  // =========================
  // 2. RENDER MODAL
  // =========================
  container.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal()"></div>

    <div class="modal"
      style="
        width:1400px;
        max-width:95vw;
        height:85vh;
        overflow:auto;
        display:grid;
        grid-template-columns: 24% 40% 36%;
        gap:20px;
        font-family: Arial;
      ">

      <!-- ================= COLUMN 1 ================= -->
      <div>
        <h2>New Project</h2>

        <input id="m_customer"
          placeholder="Customer"
          style="width:100%; margin-bottom:10px;" />

        <h3>Project Stages</h3>

        <div class="stage-list">

          <label class="stage-item">
            <input class="stage" type="checkbox" checked value="AGREEMENT">
            <span class="stage-text">Agreement (0d)</span>
          </label>

          <label class="stage-item">
            <input class="stage" type="checkbox" checked value="MEASURE">
            <span class="stage-text">Measure Confirmation (3d)</span>
          </label>

          <label class="stage-item">
            <input class="stage" type="checkbox" checked value="SCHEDULING">
            <span class="stage-text">Scheduling (3d)</span>
          </label>

          <label class="stage-item">
            <input class="stage" type="checkbox" checked value="MATERIAL">
            <span class="stage-text">Material Order (4d)</span>
          </label>

          <label class="stage-item">
            <input class="stage" type="checkbox" checked value="APPROVAL">
            <span class="stage-text">Final Approval (3d)</span>
          </label>

          <label class="stage-item">
            <input class="stage" type="checkbox" checked value="CARPENTRY">
            <span class="stage-text">Carpentry Fabrication (2.5d)</span>
          </label>

          <label class="stage-item">
            <input class="stage" type="checkbox" checked value="INSTALL_CAB">
            <span class="stage-text">Carpentry Installation (2.5d)</span>
          </label>

          <label class="stage-item">
            <input class="stage" type="checkbox" checked value="STONE">
            <span class="stage-text">Stone Fabrication (3d)</span>
          </label>

          <label class="stage-item">
            <input class="stage" type="checkbox" checked value="STONE_INSTALL">
            <span class="stage-text">Stone Installation (3d)</span>
          </label>

        </div>

        <br>

        <button onclick="submitProject()">
          Create Project
        </button>
      </div>

      <!-- ================= COLUMN 2 ================= -->
      <div>
        <h3>Resources & Parameters</h3>

        <div id="dynamic-panel"
          style="max-height:70vh; overflow:auto; padding-right:10px;">
        </div>
      </div>

      <!-- ================= COLUMN 3 ================= -->
      <div>
        <h3>Simulation</h3>

        <div id="sim-result">
          Select stages and parameters...
        </div>
      </div>

    </div>
  `;

  // =========================
  // 3. WAIT FOR DOM PAINT
  // =========================
  requestAnimationFrame(() => {

    // =========================
    // 4. READ INITIAL STAGES
    // =========================
    STATE.UI.stages = [...document.querySelectorAll(".stage:checked")]
      .map(el => el.value);

    // =========================
    // 5. INITIAL RENDER ENGINE
    // =========================
    renderDynamicPanel();
    calculateSimulation();

    // =========================
    // 6. STAGE LISTENERS
    // =========================
    document.querySelectorAll(".stage").forEach(el => {

      el.addEventListener("change", () => {

        STATE.UI.stages = [...document.querySelectorAll(".stage:checked")]
          .map(el => el.value);

        renderDynamicPanel();
        calculateSimulation();

      });

    });

  });
}

/****************************************************
 * ❌ CLOSE MODAL
 ****************************************************/
function closeModal() {
  document.getElementById("modal-container")?.remove();
}

window.closeModal = closeModal;

function openCreateForm() {
  openProjectModal();
}



/****************************************************
 * 📦 PROJECTS VIEW (MAIN PANEL)
 ****************************************************/
export async function renderProjects() {

  const container = document.getElementById("view-container");
  if (!container) return;

  const projects = await getProjects();

  STATE.projects = projects;
  window.STATE = STATE;

  let html = `
    <div class="panel">

      <!-- HEADER ACTIONS -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h2>📦 Projects Control Center</h2>

        <div style="display:flex; gap:10px;">
          <button data-action="create-project">➕ New Project</button>
          <button data-action="run-schedule" style="background:#1e40af; color:white;">
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
          <button data-action="edit-project" data-id="${p.ProjectID}">✏️</button>
          <button data-action="pause-project" data-id="${p.ProjectID}">⛔</button>
          <button data-action="delete-project" data-id="${p.ProjectID}">🗑</button>
          <button data-action="open-gantt" data-id="${p.ProjectID}">📊 Gantt</button>
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

    const selectedServices = [...document.querySelectorAll(".stage:checked")]
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

function attachSimulationListeners() {

  document
    .querySelectorAll(
      "#dynamic-panel input, #dynamic-panel select"
    )
    .forEach(el => {

      el.addEventListener("input", calculateSimulation);
      el.addEventListener("change", calculateSimulation);

    });

}
  

function renderDynamicPanel() {
   const panel = document.getElementById("dynamic-panel");
  
    if (!panel) {
      console.warn("dynamic-panel aún no existe");
      return;
    }
   const selected = STATE.UI.stages;
  let html = "";

  /**********************
   * 🪨 STONE MODULE
   **********************/
  if (selected.includes("STONE")) {

html += `
  <div class="module">
    <div class="section-title">🪨 Stone Production</div>

    <select id="m_stone_resource">
      <option value="BRETON">Breton CNC</option>
      <option value="COACH">COACH</option>
    </select>

    <select id="m_stone_material">
      <option value="">Select material</option>
      <option value="Caesarstone">Caesarstone</option>
      <option value="Cambria">Cambria</option>
      <option value="Dekton">Dekton</option>
      <option value="Granite">Granite</option>
      <option value="Quartz">Quartz</option>
      <option value="Quartzite">Quartzite</option>
      <option value="Porcelain">Porcelain</option>
    </select>

    <select id="m_stone_thickness">
      <option value="6mm">6mm</option>
      <option value="8mm">8mm</option>
      <option value="12mm">12mm</option>
      <option value="2cm">2cm</option>
      <option value="3cm">3cm</option>
    </select>

    <select id="m_stone_complexity">
      <option value="LOW">Low</option>
      <option value="MED">Medium</option>
      <option value="HIGH">High</option>
    </select>

    <input id="m_stone_ft2" type="number" placeholder="Sqft (Stone Panels)" />

    <!-- EDGE SYSTEM -->
    <select id="m_stone_edge_type">
      <option value="simple">Simple</option>
      <option value="bullnose">Bullnose</option>
      <option value="ogee">Ogee</option>
      <option value="laminated">Laminated</option>
    </select>

    <input id="m_stone_edge_ft" type="number" placeholder="Edge Linear Ft" />

    <input id="m_stone_cutouts" type="number" placeholder="Cutouts" />
    <input id="m_stone_slabs" type="number" placeholder="Slabs" />
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
          <option value="0">0 Trashcan</option>
          <option value="1">1</option>
          <option value="2">2+</option>
        </select>

        <select id="m_carpentry_lazy">
          <option value="0">0 Lazy</option>
          <option value="1">Lazy Susan</option>
          <option value="2">2+</option>
        </select>

        <select id="m_carpentry_lemans">
          <option value="0">0 Lemans</option>
          <option value="1">LeMans II</option>
        </select>

        <select id="m_carpentry_pocket_pantry">
          <option value="0">0 PocketP</option>
          <option value="1">Yes</option>
        </select>

        <select id="m_carpentry_pocket_cabinet">
          <option value="0">0 PocketC</option>
          <option value="1">Yes</option>
        </select>

        <input id="m_carpentry_edge_ft" type="number" placeholder="Edge Banding LF">
      </div>
    `;
  }

  /**********************
   * 🧹 CLEAN RENDER
   **********************/
  panel.innerHTML = html;

  /**********************
   * 🧼 RESET STONE MATERIAL IF STONE IS OFF
   **********************/
  if (!selected.includes("STONE")) {
    const material = document.getElementById("m_stone_material");
    if (material) material.value = "";
  }
}


/****************************************************
 * 📦 ENGINE IMPORT
 ****************************************************/
import { calculateProjectTime } from "./productionEngine.js";


/****************************************************
 * 🧱 BUILD PROJECT MODEL
 ****************************************************/
function buildProjectFromUI() {

  syncSelectedStages();
  const selected = STATE.UI.stages;

  const material = document.getElementById("m_stone_material")?.value || "";
  const group = getMaterialGroup(material);

  return {
    material,
    group,

    ft2: safeNumber("m_stone_ft2"),
    edgesLF: safeNumber("m_stone_edge_ft"),

    edgeType: document.getElementById("m_stone_edge_type")?.value || "MITER_45",

    cutouts: {
      qty: safeNumber("m_stone_cutouts"),
      type: "UNDERMOUNT"
    },

    sinks: 0,
    frameQty: 0,

    machine: "BRETON",

    stages: selected
  };
}


function calculateSimulation() {

  // =========================
  // 1. READ UI STATE
  // =========================
  syncSelectedStages();
  const selected = STATE.UI.stages;

  const material = document.getElementById("m_stone_material")?.value || "";
  const group = getMaterialGroup(material);

  // =========================
  // 2. BUILD PROJECT MODEL (SINGLE SOURCE OF TRUTH)
  // =========================

const project = document.getElementById("m_stone_material")
  ? buildProjectFromUI()
  : null;

if (!project) return;

  // =========================
  // 3. ENGINE CALL (ONLY SOURCE OF TRUTH)
  // =========================
  const breakdown = calculateProjectTime(project);

  // =========================
  // 4. ACCUMULATE RESULT
  // =========================
  let total = 0;
  let lines = [];

  // =========================
  // 5. STONE PIPELINE
  // =========================
  if (selected.includes("STONE")) {

    const stoneParts = [
      { label: "Cutting", value: breakdown.cutting },
      { label: "Cutouts", value: breakdown.cutouts },
      { label: "Edges", value: breakdown.edges },
      { label: "Polish", value: breakdown.polish }
    ];

    stoneParts.forEach(p => {
      total += p.value || 0;
      lines.push(`<p><b>${p.label}:</b> ${(p.value || 0).toFixed(1)} min</p>`);
    });

    if (breakdown.sink > 0) {
      total += breakdown.sink;
      lines.push(`<p><b>Integrated Sink:</b> ${breakdown.sink.toFixed(1)} min</p>`);
    }
  }

  // =========================
  // 6. CARPENTRY PIPELINE
  // =========================
  if (selected.includes("CARPENTRY")) {

    const frame = breakdown.frame || 0;
    total += frame;

    lines.push(`<p><b>Frame:</b> ${frame.toFixed(1)} min</p>`);
  }

  // =========================
  // 7. RENDER OUTPUT
  // =========================
  const html = `
    <div class="sim-summary">

      <h3>🧠 Engine Simulation</h3>

      <p>
        <b>Material:</b> ${material || "-"} |
        <b>Group:</b> ${group}
      </p>

      ${lines.join("")}

      <hr>

      <p><b>Total Minutes:</b> ${total.toFixed(1)}</p>
      <p><b>Total Hours:</b> ${(total / 60).toFixed(2)}</p>

    </div>
  `;

  const result = document.getElementById("sim-result");
  if (result) result.innerHTML = html;
}

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
 * 🎯 UI EVENT DELEGATION (NEW ARCHITECTURE)
 ****************************************************/
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action='create-project']");
  if (!btn) return;

  openProjectModal();
});
/****************************************************
 * 🌐 GLOBAL EXPORTS (IMPORTANT FOR HTML ONCLICK)
 ****************************************************/
window.openCreateForm = openCreateForm;
window.openProjectModal = openProjectModal;
window.closeModal = closeModal;
window.submitProject = submitProject;
window.renderProjects = renderProjects;
window.renderDynamicPanel = renderDynamicPanel;
window.calculateSimulation = calculateSimulation;
window.runScheduleAll = runScheduleAll;




