import { stages } from './data/stages.js';
import { simulateProject } from './simulation.js';
import { createProject } from "./services/project-service.js";
import { fetchSchedule } from "./services/schedule-service.js";
import { renderGantt } from "./views/gantt-view.js";


/* =========================
   STATE
========================= */
let state = {
  projectName: "",
  selectedStages: [],
  carpentryActive: true,
  stoneActive: true
};

/* =========================
   ENTRY
========================= */
export function renderProjectSimulationModal() {

  const container = document.getElementById("modal-container");
  if (!container) return;

  container.style.display = "flex";
  container.innerHTML = buildModalHTML();

  init();
}

/* =========================
   INIT
========================= */
function init() {

  // normalizar IDs siempre como STRING
  state.selectedStages = stages.map(s => String(s.id));

  state.carpentryActive = true;
  state.stoneActive = true;

  bindEvents();
  render();
}

/* =========================
   RENDER ROOT
========================= */
function render() {
  renderStages();
  renderParameters();
  renderResults();
}

/* =========================
   TEMPLATE
========================= */
function buildModalHTML() {

  return `

    <div class="simulation-modal">

      <div class="simulation-container">

        <!-- =======================================
             COLUMN 1
        ======================================== -->

            <aside class="column-left">
            
                <div class="column-header">
            
                    <div class="modal-header">
            
                        <h2>New Project</h2>
            
                        <button id="btnCloseModal">✕</button>
            
                    </div>
            
                    <input
                        id="projectName"
                        type="text"
                        placeholder="Customer"
                       />
                   </div>
            
            
                <div class="column-scroll">
            
                    <div class="section-title">
                        Project Stages
                    </div>
            
                    <div id="stagesContainer"></div>
            
                    <button id="btnSimulate">
                        Create Project
                    </button>
            
                </div>
            
            </aside>
        <!-- =======================================
             COLUMN 2
        ======================================== -->

        <main class="column-center">

          <div class="section-title">
              Parameters
          </div>

          <div id="parameterContent">

              <!-- Carpentry -->

              <div class="parameter-card">

                  <h4>🪵 Carpentry</h4>

                  <div id="carpentrySection"></div>

              </div>

              <!-- Stone -->

              <div class="parameter-card">

                  <h4>🪨 Stone</h4>

                  <div id="stoneSection"></div>

              </div>

          </div>

        </main>


        <!-- =======================================
             COLUMN 3
        ======================================== -->

        <aside class="column-right">

            <div class="section-title">
                Simulation
            </div>

            <div id="simulationResult"></div>
            <div id="ganttView"></div>

        </aside>

      </div>

    </div>

  `;
}

/* =========================
   STAGES
========================= */

function renderStages() {

  const container =
    document.getElementById(
      "stagesContainer"
    );

  if (!container) return;

  container.innerHTML =
    stages.map(stage => {

      const checked =
        state.selectedStages.includes(
          String(stage.id)
        );

      return `
        <label class="stage-item">

          <input
            type="checkbox"
            class="stage-checkbox"
            value="${stage.id}"
            ${checked ? "checked" : ""}
          >

          <span class="stage-name">
            ${stage.name}
          </span>

          <span class="stage-days">
            (${stage.days}d)
          </span>

        </label>
      `;
    }).join("");
}

/* =========================
   PARAMETERS
========================= */
function renderParameters() {

  const carpentry = document.getElementById("carpentrySection");
  const stone = document.getElementById("stoneSection");

  if (!carpentry || !stone) return;

  carpentry.innerHTML = state.carpentryActive ? carpentryTemplate() : "";
  stone.innerHTML = state.stoneActive ? stoneTemplate() : "";
}

export function renderCarpentryResults(data = {}) {

  if (!data) return "";

  const {

    cnc = 0,

    edge = 0,

    laminate = 0,

    paint = 0,

    glass = 0,

    lighting = 0,

    assembly = 0,

    hardware = 0,

    pocket = 0,

    qc = 0,

    totalMinutes = 0,

    totalHours = 0

  } = data;

  return `

    <div class="result-panel">

      <div class="result-title">
        🪵 Carpentry Simulation
      </div>

      <!-- CNC -->

      <div class="result-group">

        <div class="group-title">
          ⚙️ CNC
        </div>

        <div class="metric">
          <span>Panel Cutting</span>
          <b>${cnc.toFixed(1)} min</b>
        </div>

      </div>

      <!-- PANEL PROCESSING -->

      <div class="result-group">

        <div class="group-title">
          🟦 Panel Processing
        </div>

        <div class="metric">
          <span>Edge Banding</span>
          <b>${edge.toFixed(1)} min</b>
        </div>

        <div class="metric">
          <span>Lamination</span>
          <b>${laminate.toFixed(1)} min</b>
        </div>

      </div>

      <!-- EXTERNAL SERVICES -->

      <div class="result-group">

        <div class="group-title">
          🎨 External Services
        </div>

        <div class="metric">
          <span>Paint</span>
          <b>${paint.toFixed(1)} min</b>
        </div>

        <div class="metric">
          <span>Glass</span>
          <b>${glass.toFixed(1)} min</b>
        </div>

        <div class="metric">
          <span>LED Lighting</span>
          <b>${lighting.toFixed(1)} min</b>
        </div>

      </div>

      <!-- ASSEMBLY -->

      <div class="result-group">

        <div class="group-title">
          🔨 Assembly
        </div>

        <div class="metric">
          <span>Cabinets / Drawers</span>
          <b>${assembly.toFixed(1)} min</b>
        </div>

      </div>

      <!-- HARDWARE -->

      <div class="result-group">

        <div class="group-title">
          🧰 Hardware
        </div>

        <div class="metric">
          <span>Hardware Installation</span>
          <b>${hardware.toFixed(1)} min</b>
        </div>

      </div>

      <!-- POCKET -->

      <div class="result-group">

        <div class="group-title">
          🚪 Pocket Systems
        </div>

        <div class="metric">
          <span>Pocket Mechanisms</span>
          <b>${pocket.toFixed(1)} min</b>
        </div>

      </div>

      <!-- QC -->

      <div class="result-group">

        <div class="group-title">
          ✔ Quality Control
        </div>

        <div class="metric">
          <span>Inspection</span>
          <b>${qc.toFixed(1)} min</b>
        </div>

      </div>

      <!-- TOTAL -->
      <div class="summary-card">
       <div class="summary-title">
         Carpentry Total
       </div>
       
          <div class="summary-row">
              <span class="summary-label">
                  Minutes
              </span>
              <span class="summary-value">
                  ${totalMinutes.toFixed(1)} min
              </span>
          </div>
          <div class="summary-row">
           <span class="summary-label">
               Hours
           </span>
           <span class="summary-value">
               ${totalHours.toFixed(2)} hrs
           </span>
         </div>
      </div>
    </div>
  `;
}

export function renderStoneResults(data = {}) {

  if (!data) return "";

  const {
    setup = 0,
    edge = 0,
    cutouts = 0,
    led = 0,
    frame = 0,
    totalMinutes = 0,
    totalHours = 0
  } = data;

  return `
    <div class="result-panel stone-results">

      <div class="result-title">🪨 Stone</div>

      <!-- CORE -->
      <div class="result-group">
        <div class="group-title">Production</div>

        <div class="metric">
          <span>Machine Setup</span>
          <b>${setup.toFixed(1)} min</b>
        </div>

        <div class="metric">
          <span>Edge Work</span>
          <b>${edge.toFixed(1)} min</b>
        </div>

        <div class="metric">
          <span>Cutouts</span>
          <b>${cutouts.toFixed(1)} min</b>
        </div>
      </div>

      <!-- EXTRA -->
      <div class="result-group">
        <div class="group-title">Extras</div>

        <div class="metric">
          <span>LED Work</span>
          <b>${led.toFixed(1)} min</b>
        </div>

        <div class="metric">
          <span>Metal Frame</span>
          <b>${frame.toFixed(1)} min</b>
        </div>
      </div>

      <!-- TOTAL -->
          <div class="summary-card">
         
             <div class="summary-title">
                 Stone Total
             </div>
         
             <div class="summary-row">
         
                 <span class="summary-label">
                     Minutes
                 </span>
         
                 <span class="summary-value">
                     ${totalMinutes.toFixed(1)} min
                 </span>
         
             </div>
         
             <div class="summary-row">
         
                 <span class="summary-label">
                     Hours
                 </span>
         
                 <span class="summary-value">
                     ${totalHours.toFixed(2)} hrs
                 </span>
         
             </div>
         
         </div>

    </div>
  `;
}
/* =========================
   RESULTS
========================= */

function renderResults() {

  const container = document.getElementById("simulationResult");
  if (!container) return;

  // =========================
  // 1. STATE + SIMULATION
  // =========================
  const state = buildState();
  const result = simulateProject(state) || {};

  const carpentry = result.carpentry || {};
  const stone = result.stone || {};

  const totalHours =
    Number.isFinite(result.totalHours)
      ? result.totalHours
      : 0;

  // =========================
  // 2. UI - SIMULATION PANEL
  // =========================
  container.innerHTML = `
    ${renderCarpentryResults(carpentry)}
    ${renderStoneResults(stone)}

    <div class="result-total">
      <h3>Project Total</h3>
      <div class="hours">
        ${totalHours.toFixed(1)} hrs
      </div>
    </div>
  `;

  // =========================
  // 3. GANTT HOOK (NO BREAK CHANGE)
  // =========================
  const ganttContainer = document.getElementById("ganttView");

  if (ganttContainer) {
    ganttContainer.innerHTML = renderGantt(result.schedule || []);
  }

   // =========================
   // GANTT REAL (BACKEND)
   // =========================
      (async () => {
      
        const ganttContainer =
          document.getElementById("ganttView");
      
        if (!ganttContainer) return;
      
        const schedule = await fetchSchedule();
      
        ganttContainer.innerHTML =
          renderGantt(schedule);
      })();
   }

/* =========================
   EVENTS
========================= */
function bindEvents() {

  //=====================================
  // CLOSE MODAL
  //=====================================

  document
    .getElementById("btnCloseModal")
    ?.addEventListener("click", closeModal);

  //=====================================
  // CREATE PROJECT
  //=====================================

  document
    .getElementById("btnSimulate")
    ?.addEventListener("click", onCreateProject);

  //=====================================
  // STAGES
  //=====================================

  document.addEventListener(
    "change",
    onStageChange
  );

  //=====================================
  // PROJECT NAME
  //=====================================

  document
    .getElementById("projectName")
    ?.addEventListener("input", (e) => {

      state.projectName = e.target.value;

    });

  //=====================================
  // LIVE SIMULATION
  //=====================================

  document.addEventListener(
    "input",
    renderResults
  );

  document.addEventListener(
    "change",
    renderResults
  );
}

//=====================================
// CREATE PROJECT
//=====================================

function onCreateProject() {

  const stateData = buildState();

  // reutilizamos simulación ya consistente
  const projectData = createProject(stateData);

  console.log("PROJECT");
  console.log(projectData.project);

  console.log("TASKS");
  console.log(projectData.tasks);

}

/* =========================
   STAGE CHANGE
========================= */
function onStageChange(e) {

  if (!e.target.classList.contains("stage-checkbox")) return;

  const id = String(e.target.value);

  if (e.target.checked) {
    if (!state.selectedStages.includes(id)) {
      state.selectedStages.push(id);
    }
  } else {
    state.selectedStages = state.selectedStages.filter(s => s !== id);
  }

  state.carpentryActive = state.selectedStages.includes("6");
  state.stoneActive = state.selectedStages.includes("10");

  render();
}

/* =========================
   CLOSE
========================= */
function closeModal() {

  const container = document.getElementById("modal-container");

  container.innerHTML = "";
  container.style.display = "none";
}

function getCarpentryFactor() {

  const level =
    Number(document.getElementById("carpentryLevel")?.value || 3);

  const map = {
    1: 0.75,
    2: 0.90,
    3: 1.00,
    4: 1.20,
    5: 1.40
  };

  return map[level] || 1;
}

function getStoneFactor() {

  const level =
    Number(document.getElementById("stoneLevel")?.value || 2);

  const map = {
    1: 0.85,
    2: 1.00,
    3: 1.25
  };

  return map[level] || 1;
}
/* =========================
   BUILD STATE
========================= */
function buildState() {

  return {
    projectName: state.projectName,
    stages: state.selectedStages,

    // =========================
    // CARPENTRY
    // =========================
    carpentry: {
      level: Number(document.getElementById("carpentryLevel")?.value || 3),

      panels: getValue("panels"),
      cabinets: getValue("cabinets"),
      drawers: getValue("drawers"),

      pantry: getValue("pantry") || 0,
      trashcan: getValue("trashcan") || 0,
      lazySusan: getValue("lazySusan") || 0,
      lemans: getValue("lemans") || 0,

      pocketCabinet: getValue("pocketCabinet") || 0,
      pocketPantry: getValue("pocketPantry") || 0,

      edgeLF: getValue("edgeLF"),
      laminateSqFt: getValue("laminateSqFt") || 0, 
      paintSqFt:getValue("paintSqFt"),
      glassSqFt:getValue("glassSqFt"),
      lightingLF:getValue("lightingLF"),
    },

    // =========================
    // STONE
    // =========================
    stone: {
      machine: document.getElementById("machine")?.value || "BRETON",

      level: Number(document.getElementById("stoneLevel")?.value || 2),

      sqft: getValue("sqft"),
      slabs: getValue("slabs"),
      edgeLF: getValue("stoneEdgeLF"),

      cutouts: getValue("cutouts") || 0,
      led: getValue("led") || 0,
      metalFrame: getValue("metalFrame") || 0,

      edgeType: document.getElementById("edgeType")?.value || "Eased"
    }
  };
}

/* =========================
   HELPERS
========================= */
function getValue(id) {
  return Number(document.getElementById(id)?.value || 0);
}

/* =========================
   TEMPLATES
========================= */
function carpentryTemplate() {

  return `
    <div class="parameter-card">

      <!-- SETTINGS -->
      <div class="form-grid-2">

        <div class="mini-input">
          <label>Project Type</label>
          <select id="projectType">
            <option value="Kitchen">Kitchen</option>
            <option value="Pantry">Pantry</option>
            <option value="Closet">Closet</option>
            <option value="Wall Unit">Wall Unit</option>
            <option value="Office Furniture">Office Furniture</option>
            <option value="Custom Furniture">Custom Furniture</option>
          </select>
        </div>

        <div class="mini-input">
          <label>Complexity</label>
          <select id="carpentryLevel">
            <option value="1">Level 1 (Budget)</option>
            <option value="2">Level 2 (Economy)</option>
            <option value="3" selected>Level 3 (Standard)</option>
            <option value="4">Level 4 (Premium)</option>
            <option value="5">Level 5 (Luxury)</option>
          </select>
        </div>

      </div>

      <div class="section-subtitle">
        ⚙️ Production
      </div>

      <div class="mini-grid">

        <div class="mini-input">
          <label>Panels</label>
          <input id="panels" type="number" min="0">
          <small>9 min / panel</small>
        </div>

        <div class="mini-input">
          <label>Cabinets</label>
          <input id="cabinets" type="number" min="0">
          <small>10 min / cabinet</small>
        </div>

        <div class="mini-input">
          <label>Drawers</label>
          <input id="drawers" type="number" min="0">
          <small>20 min / drawer</small>
        </div>

        <div class="mini-input">
          <label>Pantry</label>
          <input id="pantry" type="number" min="0">
          <small>20 min / pantry</small>
        </div>

      </div>

      <div class="section-subtitle">
        🔩 Hardware
      </div>

      <div class="mini-grid">

        <div class="mini-input">
          <label>Trashcan</label>
          <input id="trashcan" type="number" min="0">
          <small>25 min / unit</small>
        </div>

        <div class="mini-input">
          <label>Lazy Susan</label>
          <input id="lazySusan" type="number" min="0">
          <small>25 min / unit</small>
        </div>

        <div class="mini-input">
          <label>LeMans II</label>
          <input id="lemans" type="number" min="0">
          <small>25 min / unit</small>
        </div>

      </div>

      <div class="section-subtitle">
        🚪 Pocket Systems
      </div>

      <div class="mini-grid">

        <div class="mini-input">
          <label>Pocket Pantry</label>
          <input id="pocketPantry" type="number" min="0">
          <small>90 min / unit</small>
        </div>

        <div class="mini-input">
          <label>Pocket Cabinet</label>
          <input id="pocketCabinet" type="number" min="0">
          <small>60 min / unit</small>
        </div>

      </div>

      <div class="section-subtitle">
        ✨ Finishing
      </div>

      <div class="mini-grid">

        <div class="mini-input">
          <label>Edge LF</label>
          <input id="edgeLF" type="number" min="0">
          <small>0.60 min / LF</small>
        </div>

        <div class="mini-input">
          <label>Laminate SqFt</label>
          <input id="laminateSqFt" type="number" min="0">
          <small>3.5 min / SqFt</small>
        </div>

      </div>

      <div class="section-subtitle">
        External Services
      </div>

      <div class="mini-grid">

        <div class="mini-input">
          <label>Paint SqFt</label>
          <input id="paintSqFt" type="number" min="0">
          <small>External finish service</small>
        </div>

        <div class="mini-input">
          <label>Glass SqFt</label>
          <input id="glassSqFt" type="number" min="0">
          <small>External glass service</small>
        </div>

        <div class="mini-input">
          <label>LED Lighting LF</label>
          <input id="lightingLF" type="number"> 
          <small> 1.8 min / LF </small>
      </div>

      </div>


    </div>
  `;
}

function stoneTemplate() {

  return `

    <!-- =======================================
         PROJECT SETTINGS
    ======================================== -->

    <div class="form-grid-2">

      <div class="mini-input">
        <label>Machine</label>

        <select id="machine">
          <option value="BRETON">Breton CNC</option>
          <option value="COCH">Coch CNC</option>
        </select>

      </div>

      <div class="mini-input">

        <label>Complexity</label>

        <select id="stoneLevel">
          <option value="1">Level 1</option>
          <option value="2" selected>Level 2 Standard</option>
          <option value="3">Level 3 Luxury</option>
        </select>

      </div>

      <div class="mini-input">

        <label>Material</label>

        <select id="material">
          <option value="Quartz">Quartz</option>
          <option value="Granite">Granite</option>
          <option value="Marble">Marble</option>
          <option value="Quartzite">Quartzite</option>
          <option value="Porcelain">Porcelain</option>
          <option value="Dekton">Dekton</option>
        </select>

      </div>

      <div class="mini-input">

        <label>Thickness</label>

        <select id="thickness">
          <option value="6">6 mm</option>
          <option value="12">12 mm</option>
          <option value="20">20 mm</option>
          <option value="30">30 mm</option>
        </select>

      </div>

    </div>


    <!-- =======================================
         FABRICATION
    ======================================== -->

    <div class="section-subtitle">
      Fabrication
    </div>

    <div class="mini-grid">

      <div class="mini-input">

        <label>SqFt</label>

        <input
          id="sqft"
          type="number"
          min="0">

        <small>Stone surface area</small>

      </div>

      <div class="mini-input">

        <label>Slabs</label>

        <input
          id="slabs"
          type="number"
          min="0">

        <small>Machine setup quantity</small>

      </div>

      <div class="mini-input">

        <label>Edge LF</label>

        <input
          id="stoneEdgeLF"
          type="number"
          min="0">

        <small>Linear feet of edge</small>

      </div>

      <div class="mini-input">

        <label>Cutouts</label>

        <input
          id="cutouts"
          type="number"
          min="0">

        <small>Sink • Cooktop • Faucet</small>

      </div>

    </div>


    <!-- =======================================
         SPECIAL OPERATIONS
    ======================================== -->

    <div class="section-subtitle">
      Special Operations
    </div>

    <div class="form-grid-2">

      <div class="mini-input">

        <label>LED Lighting LF</label>

        <input
          id="led"
          type="number"
          min="0">

        <small>Linear feet of LED channel</small>

      </div>

      <div class="mini-input">

        <label>Metal Frame LF</label>

        <input
          id="metalFrame"
          type="number"
          min="0">

        <small>Linear feet of metal frame</small>

      </div>

    </div>

  `;

}
