import { STATE, EDGE_FACTORS } from "./state.js";
import { getProjects, post } from "./api.js";
import { formatDate } from "../utils/schedule.js";
import { generateSchedule } from "./scheduler.js";
import { getMaterialGroup } from "./state.js";
import { WORKFLOW } from "./state.js";

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

STATE.UI = STATE.UI || {};
STATE.UI.data = STATE.UI.data || {
  stone: {},
  carpentry: {}
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
  STATE.UI.stages = Array.from(document.querySelectorAll(".stage:checked"))
  .map(el => (el.value || "").toUpperCase().trim());
}

function getColumn2(stage) {

  if (stage === "carpinteria") {
    return [
      "Paneles",
      "Cabinets",
      "Gavetas",
      "Pantry",
      "Trashcan",
      "Lazy Susan",
      "Lemans II",
      "Pocket Door Pantry",
      "Pocket Door Cabinets",
      "Pies lineales de edgebanding"
    ];
  }

  if (stage === "stone") {
    return [
      "Máquina",
      "Tipo de material",
      "Ancho del slab",
      "Complejidad",
      "Sqft",
      "Tipo de edge",
      "Pies lineales de edge",
      "Cutouts",
      "Slabs"
    ];
  }

  return [];
}

function syncModules() {

  const selected = STATE.UI.stages;

  STATE.UI.modules = {
    STONE: selected.some(s => s.includes("STONE")),
    CARPENTRY: selected.some(s => s.includes("CARPENTRY"))
  };
}

/****************************************************
* 🪟 MODAL LIMPIO - PRODUCTION ERP
****************************************************/

function openProjectModal() {

  const container = document.getElementById("modal-container");
  if (!container) return;

  // =========================
  // 1. INIT STATE SAFE
  // =========================
  STATE.UI = STATE.UI || {};
  STATE.UI.stages = STATE.UI.stages || [];
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
          ${WORKFLOW.map(step => `
            <label class="stage-item">
              <input class="stage"
                type="checkbox"
                value="${step.id}"
                data-module="${step.module || "GLOBAL"}"
                checked>

              <span class="stage-text">
                ${step.label} (${step.days}d)
              </span>
            </label>
          `).join("")}
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
  // 3. INIT AFTER PAINT
  // =========================
  requestAnimationFrame(() => {

    const checkboxes = container.querySelectorAll(".stage");

    // =========================
    // 4. INITIAL STATE SYNC
    // =========================
    STATE.UI.stages = Array.from(checkboxes)
      .filter(el => el.checked)
      .map(el => (el.value || "").toUpperCase().trim());

    console.log("STAGES FINAL:", STATE.UI.stages);
    console.log("WORKFLOW VALUES:", Array.from(checkboxes).map(x => x.value));

    // =========================
    // 5. INITIAL RENDER
    // =========================
    
    renderDynamicPanel();
    calculateSimulation();

    // =========================
    // 6. EVENT LISTENERS (CLEAN + SAFE)
    // =========================
    checkboxes.forEach(el => {
      el.addEventListener("change", () => {

        STATE.UI.stages = Array.from(checkboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);

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

function saveState() {
  const get = (id) => document.getElementById(id)?.value ?? "";

  STATE.UI.data.stone = {
    resource: get("m_stone_resource"),
    material: get("m_stone_material"),
    thickness: get("m_stone_thickness"),
    complexity: get("m_stone_complexity"),
    ft2: get("m_stone_ft2"),
    edgeType: get("m_stone_edge_type"),
    edge_ft: get("m_stone_edge_ft"),
    cutouts: get("m_stone_cutouts"),
    slabs: get("m_stone_slabs")
  };

  STATE.UI.data.carpentry = {
    panels: get("m_carpentry_panels"),
    cabinets: get("m_carpentry_cabinets"),
    drawers: get("m_carpentry_drawers"),
    pantry: get("m_carpentry_pantry"),
    trashcan: get("m_carpentry_trashcan"),
    lazy: get("m_carpentry_lazy"),
    lemans: get("m_carpentry_lemans"),
    pocket_pantry: get("m_carpentry_pocket_pantry"),
    pocket_cabinet: get("m_carpentry_pocket_cabinet"),
    edge_ft: get("m_carpentry_edge_ft")
  };
}

function restoreState() {
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  };

  const s = STATE.UI.data?.stone || {};
  const c = STATE.UI.data?.carpentry || {};

  // STONE
  set("m_stone_resource", s.resource);
  set("m_stone_material", s.material);
  set("m_stone_thickness", s.thickness);
  set("m_stone_complexity", s.complexity);
  set("m_stone_ft2", s.ft2);
  set("m_stone_edge_type", s.edgeType);
  set("m_stone_edge_ft", s.edge_ft);
  set("m_stone_cutouts", s.cutouts);
  set("m_stone_slabs", s.slabs);

  // CARPENTRY
  set("m_carpentry_panels", c.panels);
  set("m_carpentry_cabinets", c.cabinets);
  set("m_carpentry_drawers", c.drawers);
  set("m_carpentry_pantry", c.pantry);
  set("m_carpentry_trashcan", c.trashcan);
  set("m_carpentry_lazy", c.lazy);
  set("m_carpentry_lemans", c.lemans);
  set("m_carpentry_pocket_pantry", c.pocket_pantry);
  set("m_carpentry_pocket_cabinet", c.pocket_cabinet);
  set("m_carpentry_edge_ft", c.edge_ft);
}

function attachListeners() {
  const panel = document.getElementById("dynamic-panel");
  if (!panel) return;

  const handler = () => {
    saveState();
    calculateSimulation();
  };

  panel.querySelectorAll("input, select").forEach(el => {
    el.oninput = handler;
    el.onchange = handler;
  });
}


function renderDynamicPanel() {

  const panel = document.getElementById("dynamic-panel");
  if (!panel) return;

  const stage = STATE.stage; // 👈 control único (carpentry | stone)

  let html = "";

  /**********************
   * 🪨 STONE MODULE
   **********************/
  if (stage === "stone") {

    html += `
      <div class="module">
        <div class="section-title">🪨 Stone Production</div>

        <select id="m_stone_resource">
          <option value="BRETON">Breton CNC</option>
          <option value="COACH">Manual Coach</option>
        </select>

        <select id="m_stone_material">
          <option value="">Select material</option>
          <option value="Granite">Granite</option>
          <option value="Quartz">Quartz</option>
          <option value="Quartzite">Quartzite</option>
          <option value="Porcelain">Porcelain</option>
          <option value="Dekton">Dekton</option>
        </select>

        <select id="m_stone_thickness">
          <option value="6mm">6mm</option>
          <option value="12mm">12mm</option>
          <option value="2cm">2cm</option>
          <option value="3cm">3cm</option>
        </select>

        <select id="m_stone_complexity">
          <option value="LOW">Low</option>
          <option value="MED">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <input id="m_stone_ft2" type="number" placeholder="Sqft">

        <select id="m_stone_edge_type">
          <option value="simple">Simple</option>
          <option value="bullnose">Bullnose</option>
          <option value="ogee">Ogee</option>
          <option value="laminated">Laminated</option>
        </select>

        <input id="m_stone_edge_ft" type="number" placeholder="Edge LF">
        <input id="m_stone_cutouts" type="number" placeholder="Cutouts">
        <input id="m_stone_slabs" type="number" placeholder="Slabs">
      </div>
    `;
  }

  /**********************
   * 🪵 CARPENTRY MODULE
   **********************/
  if (stage === "carpentry") {

    html += `
      <div class="module">
        <div class="section-title">🪵 Carpentry Production</div>

        <input id="m_carpentry_panels" type="number" placeholder="Panels">

        <select id="m_carpentry_cabinets">
          <option value="0">0 Cabinets</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="5">5+</option>
        </select>

        <select id="m_carpentry_drawers">
          <option value="0">0 Drawers</option>
          <option value="1">1</option>
          <option value="2">2</option>
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
          <option value="0">0 Lazy Susan</option>
          <option value="1">1</option>
        </select>

        <select id="m_carpentry_lemans">
          <option value="0">0 Lemans</option>
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

  /**********************
   * 🧹 EMPTY STATE (CONTROLLED)
   **********************/
  if (!html) {
    html = `
      <div class="module empty-state">
        <h3>No Stage Selected</h3>
        <p>Please select Carpentry or Stone</p>
      </div>
    `;
  }

  /**********************
   * 🧱 FINAL RENDER
   **********************/
  panel.innerHTML = `
    <div class="modules-wrapper">
      ${html}
    </div>
  `;

  queueMicrotask(() => {
    restoreState();
    attachListeners();
    calculateSimulation();
  });
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
  const selected = STATE.UI.stages || [];
  
  const hasStone =
    selected.some(s =>
      s.toUpperCase().startsWith("STONE")
    );
  
  const hasCarpentry =
    selected.some(s =>
      s.toUpperCase().startsWith("CARPENTRY")
    );
  
  const project = {
    stages: selected
  };

  // =========================
  // STONE SAFE BLOCK
  // =========================
  if (hasStone) {

    const material =
    STATE.UI.data?.stone?.material ||
    document.getElementById("m_stone_material")?.value ||
    "";
    project.stone = {
      material,
      group: material ? getMaterialGroup(material) : "UNKNOWN",

      ft2: safeNumber("m_stone_ft2"),
      edgesLF: safeNumber("m_stone_edge_ft"),

      edgeType: document.getElementById("m_stone_edge_type")?.value || "simple",

      cutouts: safeNumber("m_stone_cutouts"),
      slabs: safeNumber("m_stone_slabs"),

      thickness: document.getElementById("m_stone_thickness")?.value || "",
      complexity: document.getElementById("m_stone_complexity")?.value || "",
      resource: document.getElementById("m_stone_resource")?.value || "BRETON"
    };
  }

  // =========================
  // CARPENTRY SAFE BLOCK
  // =========================
  if (hasCarpentry) {

    project.carpentry = {
      panels: safeNumber("m_carpentry_panels"),
      cabinets: document.getElementById("m_carpentry_cabinets")?.value || "0",
      drawers: document.getElementById("m_carpentry_drawers")?.value || "0",
      pantry: document.getElementById("m_carpentry_pantry")?.value || "0",
      trashcan: document.getElementById("m_carpentry_trashcan")?.value || "0",
      lazy: document.getElementById("m_carpentry_lazy")?.value || "0",
      lemans: document.getElementById("m_carpentry_lemans")?.value || "0",
      pocket_pantry: document.getElementById("m_carpentry_pocket_pantry")?.value || "0",
      pocket_cabinet: document.getElementById("m_carpentry_pocket_cabinet")?.value || "0",
      edge_ft: safeNumber("m_carpentry_edge_ft")
    };
  }

  return project;
}


function calculateSimulation() {

  // =========================
  // 1. STATE (UN SOLO SISTEMA)
  // =========================
  const stage = STATE.stage; // "stone" | "carpentry"

  const showStone = stage === "stone";
  const showCarpentry = stage === "carpentry";

  // =========================
  // 2. UI ELEMENTS
  // =========================
  const materialEl = document.getElementById("m_stone_material");
  const material = materialEl?.value || "";

  const group = getMaterialGroup(material);

  const resultBox = document.getElementById("sim-result");
  if (!resultBox) return;

  // =========================
  // 3. BUILD PROJECT
  // =========================
  let project;

  try {
    project = buildProjectFromUI();
  } catch (err) {
    console.error("buildProjectFromUI error:", err);

    resultBox.innerHTML = `
      <div class="sim-summary">
        <h3>🧠 Engine Simulation</h3>
        <p style="color:red;">Error building project</p>
      </div>
    `;
    return;
  }

  if (!project) {
    resultBox.innerHTML = `
      <div class="sim-summary">
        <h3>🧠 Engine Simulation</h3>
        <p style="color:red;">Project is null</p>
      </div>
    `;
    return;
  }

  // =========================
  // 4. ENGINE CALCULATION
  // =========================
  let breakdown;

  try {
    breakdown = calculateProjectTime(project);
  } catch (err) {
    console.error("calculateProjectTime error:", err);

    resultBox.innerHTML = `
      <div class="sim-summary">
        <h3>🧠 Engine Simulation</h3>
        <p style="color:red;">Engine calculation error</p>
      </div>
    `;
    return;
  }

  // =========================
  // 5. OUTPUT
  // =========================
  let total = 0;

  let html = `
    <div class="sim-summary">

      <h3>🧠 Engine Simulation</h3>

      <p>
        <b>Material:</b> ${material || "-"} |
        <b>Group:</b> ${group || "-"}
      </p>
  `;

  // =========================
  // 🪨 STONE
  // =========================
  if (showStone && project.stone) {

    html += `
      <hr>
      <h4>🪨 Stone Production</h4>
    `;

    const stoneItems = [
      ["Cutting", breakdown.cutting],
      ["Cutouts", breakdown.cutouts],
      ["Edges", breakdown.edges],
      ["Polish", breakdown.polish],
      ["Slabs", breakdown.slabs]
    ];

    stoneItems.forEach(([label, value]) => {
      const v = Number(value) || 0;
      total += v;

      html += `
        <p><b>${label}:</b> ${v.toFixed(1)} min</p>
      `;
    });

    const sink = Number(breakdown.sink) || 0;

    if (sink > 0) {
      total += sink;

      html += `
        <p><b>Integrated Sink:</b> ${sink.toFixed(1)} min</p>
      `;
    }
  }

  // =========================
  // 🪵 CARPENTRY
  // =========================
  if (showCarpentry && project.carpentry) {

    html += `
      <hr>
      <h4>🪵 Carpentry Production</h4>
    `;

    const carpItems = [
      ["CNC", breakdown.cnc],
      ["Edge", breakdown.edge],
      ["Cabinets", breakdown.cabinets],
      ["Drawers", breakdown.drawers],
      ["Pantry", breakdown.pantry],
      ["Trashcan", breakdown.trashcan],
      ["Lazy Susan", breakdown.lazy],
      ["LeMans", breakdown.lemans],
      ["Pocket Pantry", breakdown.pocketPantry],
      ["Pocket Cabinet", breakdown.pocketCabinet]
    ];

    carpItems.forEach(([label, value]) => {
      const v = Number(value) || 0;
      total += v;

      html += `
        <p><b>${label}:</b> ${v.toFixed(1)} min</p>
      `;
    });
  }

  // =========================
  // 6. TOTAL
  // =========================
  html += `
      <hr>

      <p><b>Total Minutes:</b> ${total.toFixed(1)}</p>
      <p><b>Total Hours:</b> ${(total / 60).toFixed(2)}</p>

    </div>
  `;

  resultBox.innerHTML = html;
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




