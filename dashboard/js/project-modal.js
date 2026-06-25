import { stages } from './data/stages.js';
import { simulateProject } from './simulation.js';


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

        <!-- COLUMN 1 -->
        <div class="column-left">

          <div class="modal-header">
            <h2>New Project</h2>
            <button id="btnCloseModal">✕</button>
          </div>

          <input
            id="projectName"
            type="text"
            placeholder="Customer"
          />

          <div class="section-title">
            Project Stages
          </div>

          <div id="stagesContainer"></div>

          <button id="btnSimulate">
            Create Project
          </button>

        </div>

        <!-- COLUMN 2 -->
            <div class="column-center">
            
              <div class="section-title">Parameters</div>
            
              <!-- CARPENTRY CARD -->
              <div class="parameter-card">
                <h4>🪵 Carpentry</h4>
            
                <div id="carpentrySection"></div>
              </div>

              <!-- STONE CARD -->
              <div class="parameter-card">
                <h4>🪨 Stone</h4>
            
                <div id="stoneSection"></div>
              </div>
            
            </div>

        <!-- COLUMN 3 -->
        <div class="column-right">

          <div class="section-title">
            Simulation
          </div>

          <div id="simulationResult"></div>

        </div>

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

function renderCarpentryResults(data) {

  if (!data) return "";

  return `

    <div class="simulation-card">

      <h4>🪵 Carpentry Production</h4>

      <div class="calc-row">
        <span>CNC</span>
        <span>${data.cnc.toFixed(1)} min</span>
      </div>

      <div class="calc-row">
        <span>Edgebanding</span>
        <span>${data.edge.toFixed(1)} min</span>
      </div>

      <div class="calc-row">
        <span>Laminate</span>
        <span>${data.laminate.toFixed(1)} min</span>
      </div>

      <div class="calc-row">
        <span>Assembly</span>
        <span>${data.assembly.toFixed(1)} min</span>
      </div>

      <div class="calc-row">
        <span>Hardware</span>
        <span>${data.hardware.toFixed(1)} min</span>
      </div>

      <div class="calc-row">
        <span>Pocket Doors</span>
        <span>${data.pocket.toFixed(1)} min</span>
      </div>

      <div class="calc-row">
        <span>QC</span>
        <span>${data.qc.toFixed(1)} min</span>
      </div>

      <hr>

      <div class="calc-total">

        ${data.totalHours} hrs

      </div>

    </div>
  `;
}

function renderStoneResults(data) {

  if (!data) return "";

  return `

    <div class="simulation-card">

      <h4>🪨 Stone Production</h4>

      <div class="calc-row">
        <span>Machine Setup</span>
        <span>${data.setup.toFixed(1)} min</span>
      </div>

      <div class="calc-row">
        <span>Edge Work</span>
        <span>${data.edge.toFixed(1)} min</span>
      </div>

      <div class="calc-row">
        <span>Cutouts</span>
        <span>${data.cutouts.toFixed(1)} min</span>
      </div>

      <div class="calc-row">
        <span>LED</span>
        <span>${data.led.toFixed(1)} min</span>
      </div>

      <div class="calc-row">
        <span>Metal Frame</span>
        <span>${data.frame.toFixed(1)} min</span>
      </div>

      <hr>

      <div class="calc-total">

        ${data.totalHours} hrs

      </div>

    </div>
  `;
}

/* =========================
   RESULTS
========================= */

function renderResults() {

  const container =
    document.getElementById(
      "simulationResult"
    );

  if (!container) return;

  const result =
    simulateProject(
      buildState()
    );

  container.innerHTML = `

    ${renderCarpentryResults(
      result.carpentry
    )}

    ${renderStoneResults(
      result.stone
    )}

    <div class="result-total">

      <h3>Total Simulation</h3>

      <div class="hours">

        ${result.totalHours} hrs

      </div>

    </div>

  `;
}

/* =========================
   EVENTS
========================= */
function bindEvents() {

  document.getElementById("btnCloseModal")
    ?.addEventListener("click", closeModal);

  document.getElementById("btnSimulate")
    ?.addEventListener("click", renderResults);

  document.addEventListener("change", onStageChange);

  document.getElementById("projectName")
    ?.addEventListener("input", (e) => {
      state.projectName = e.target.value;
    });

   document.addEventListener("input", () => {
     renderResults();
   });
   
   document.addEventListener("change", () => {
     renderResults();
   });
      document.addEventListener(
     "input",
     () => renderResults()
   );
   
   document.addEventListener(
     "change",
     () => renderResults()
   );
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

         carpentry: {
           level: Number(document.getElementById("carpentryLevel")?.value || 3),
           complexityFactor: getCarpentryFactor(),
         
           panels: getValue("panels"),
           cabinets: getValue("cabinets"),
           drawers: getValue("drawers"),
           pantry: getValue("pantry") || 0,
           trashcan: getValue("trashcan") || 0,
           lazySusan: getValue("lazySusan") || 0,
           lemans: getValue("lemans") || 0,
           pocketCabinet: getValue("pocketCabinet") || 0,
           pocketPantry: getValue("pocketPantry") || 0,
         
           edgeLF: getValue("carpentryEdgeLF"),
           laminateSqFt: getValue("laminateSqFt") || 0
         },

          stone: {
           machine: document.getElementById("machine")?.value || "BRETON",
         
           level: Number(document.getElementById("stoneLevel")?.value || 2),
           complexityFactor: getStoneFactor(),
         
           sqft: getValue("sqft"),
           slabs: getValue("slabs"),
           edgeLF: getValue("stoneEdgeLF")
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

      <h4>🪵 Carpentry Production</h4>

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

      </div>

      <div class="section-subtitle">
        Production
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
        Hardware
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
        Pocket Systems
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
        Finishing
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

    </div>
  `;
}

function stoneTemplate() {

  return `
    <div class="parameter-card">

      <h4>🪨 Stone Production</h4>

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

      <div class="section-subtitle">
        Fabrication
      </div>

      <div class="mini-grid">

        <div class="mini-input">
          <label>SqFt</label>
          <input id="sqft" type="number" min="0">
          <small>Stone area</small>
        </div>

        <div class="mini-input">
          <label>Slabs</label>
          <input id="slabs" type="number" min="0">
          <small>Machine setup applies</small>
        </div>

        <div class="mini-input">
          <label>Edge LF</label>
          <input id="stoneEdgeLF" type="number" min="0">
          <small>Edge finish LF</small>
        </div>

        <div class="mini-input">
          <label>Cutouts</label>
          <input id="cutouts" type="number" min="0">
          <small>Sink / Cooktop / Faucet</small>
        </div>

      </div>

    </div>
  `;
}
