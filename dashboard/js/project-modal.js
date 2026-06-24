import { stages } from './data/stages.js';
import { simulateProject } from './simulation.js';
import {
  addProject,
  getProjects,
  clearProjects
} from './store.js';

/* =========================================================
   ENTRY POINT
========================================================= */

export function renderProjectSimulationModal() {

    const container = document.getElementById("modal-container");

    if (!container) {
        console.error("modal-container not found");
        return;
    }

    openModal(container);

    container.innerHTML = buildModalHTML();

    initState();

    bindEvents();

    store.subscribe(renderUI);
}

/* =========================================================
   MODAL OPEN / CLOSE
========================================================= */

function openModal(container) {
    container.style.display = "flex";
    container.style.pointerEvents = "auto";
}

function closeModal() {
    const container = document.getElementById("modal-container");

    if (!container) return;

    container.innerHTML = "";
    container.style.display = "none";
    container.style.pointerEvents = "none";
}

/* =========================================================
   INITIAL STATE
========================================================= */
function initState() {

  const stages = [
    { id: "agreement" },
    { id: "measure" },
    { id: "programming" }
  ];

  store.setState({
    stages: stages.map(s => s.id),
    carpentryActive: true,
    stoneActive: true
  });

}

/* =========================================================
   UI RENDER (ROOT)
========================================================= */

function renderUI(state) {

    renderStages(state);
    renderParameters(state);
    renderResults(state);
}

/* =========================================================
   TEMPLATE
========================================================= */

function buildModalHTML() {

    return `
        <div class="simulation-modal">

            <div class="simulation-container">

                <!-- COLUMN 1 -->
                <div class="column-left">

                    <div class="modal-header">
                        <h2>Project Simulation</h2>
                        <button id="btnCloseModal">✕</button>
                    </div>

                    <input id="projectName" placeholder="Customer / Project"/>

                    <hr/>

                    <div id="stagesContainer"></div>

                    <button id="btnSimulate">Run Simulation</button>

                </div>

                <!-- COLUMN 2 -->
                <div class="column-center">

                    <h3>Parameters</h3>

                    <div id="carpentrySection"></div>
                    <div id="stoneSection"></div>

                </div>

                <!-- COLUMN 3 -->
                <div class="column-right">

                    <h3>Results</h3>

                    <div id="simulationResult">Waiting...</div>

                </div>

            </div>
        </div>
    `;
}

/* =========================================================
   COLUMN 1 - STAGES
========================================================= */

function renderStages(state) {

    const container = document.getElementById("stagesContainer");
    if (!container) return;

    container.innerHTML = stages.map(stage => `
        <label class="stage-item">

            <input type="checkbox"
                   class="stage-checkbox"
                   value="${stage.id}"
                   ${state.stages.includes(stage.id) ? "checked" : ""} />

            <span>${stage.name} (${stage.days}d)</span>

        </label>
    `).join("");
}

/* =========================================================
   COLUMN 2 - PARAMETERS
========================================================= */

function renderParameters(state) {

    const carpentry = document.getElementById("carpentrySection");
    const stone = document.getElementById("stoneSection");

    if (!carpentry || !stone) return;

    // CARPENTRY
    carpentry.innerHTML = state.stages.includes(6)
        ? carpentryTemplate()
        : "";

    // STONE
    stone.innerHTML = state.stages.includes(10)
        ? stoneTemplate()
        : "";
}

/* =========================================================
   COLUMN 3 - RESULTS
========================================================= */

function renderResults(state) {

    const container = document.getElementById("simulationResult");
    if (!container) return;

    const result = simulateProject(state);

    container.innerHTML = `
        <div class="result-card">
            <h3>Total Hours</h3>
            <div style="font-size:26px;font-weight:bold;">
                ${result.totalHours}
            </div>
        </div>
    `;
}

/* =========================================================
   EVENTS (STATE ONLY)
========================================================= */

function bindEvents() {

    document.addEventListener("change", handleStageChange);

    document.getElementById("btnSimulate")
        ?.addEventListener("click", runSimulation);

    document.getElementById("btnCloseModal")
        ?.addEventListener("click", closeModal);
}

/* =========================================================
   STATE UPDATE (ONLY SOURCE OF TRUTH)
========================================================= */

function handleStageChange(e) {

    if (!e.target.classList.contains("stage-checkbox")) return;

    const id = Number(e.target.value);

    let current = store.getState().stages;

    if (e.target.checked) {
        current = [...current, id];
    } else {
        current = current.filter(s => s !== id);
    }

    store.setState({ stages: current });
}

/* =========================================================
   SIMULATION
========================================================= */

function runSimulation() {
    const state = store.getState();
    console.log("STATE:", state);
}

/* =========================================================
   TEMPLATES
========================================================= */

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
