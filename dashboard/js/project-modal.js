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

          <div class="section-title">
            Resources & Parameters
          </div>

          <div id="stoneSection"></div>

          <div id="carpentrySection"></div>

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

/* =========================
   RESULTS
========================= */
function renderResults() {

  const container = document.getElementById("simulationResult");
  if (!container) return;

  const result = simulateProject(buildState()) || {
    totalHours: 0
  };

  container.innerHTML = `
    <div class="result-card">
      <h3>Total Hours</h3>
      <div style="font-size:26px;font-weight:bold;">
        ${result.totalHours}
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

/* =========================
   BUILD STATE
========================= */
function buildState() {

  return {
    projectName: state.projectName,
    stages: state.selectedStages,

    carpentry: {
      panels: getValue("panels"),
      cabinets: getValue("cabinets"),
      drawers: getValue("drawers"),
      edgeLF: getValue("carpentryEdgeLF")
    },

    stone: {
      machine: document.getElementById("machine")?.value || "BRETON",
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
    <div class="parameter-group">
      <h4>Carpentry</h4>
      <input id="panels" placeholder="Panels">
      <input id="cabinets" placeholder="Cabinets">
      <input id="drawers" placeholder="Drawers">
      <input id="carpentryEdgeLF" placeholder="Edge LF">
    </div>
  `;
}

function stoneTemplate() {
  return `
    <div class="parameter-group">
      <h4>Stone</h4>
      <select id="machine">
        <option value="BRETON">BRETON</option>
        <option value="COCH">COCH</option>
      </select>

      <input id="sqft" placeholder="SqFt">
      <input id="slabs" placeholder="Slabs">
      <input id="stoneEdgeLF" placeholder="Edge LF">
    </div>
  `;
}
