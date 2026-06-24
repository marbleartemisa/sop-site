import { stages } from './data/stages.js';
import { simulateProject } from './simulation.js';
import { store } from "./store.js";

export function renderProjectSimulationModal() {

    const container = document.getElementById("modal-container");
    if (!container) return;

    container.style.display = "flex";

    container.innerHTML = buildModalHTML();

    initState();
    bindEvents();

    store.subscribe(renderUI);

    renderUI(store.getState()); // IMPORTANT: first render
}

// =====================

function initState() {

    store.setState({
        stages: stages.map(s => s.id),
        carpentryActive: true,
        stoneActive: true
    });
}

// =====================

function renderUI(state) {
    renderStages(state);
    renderParameters(state);
    renderResults(state);
}

// =====================

function buildModalHTML() {
    return `
    <div class="simulation-modal">
      <div class="simulation-container">

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

        <div class="column-center">
          <h3>Parameters</h3>
          <div id="carpentrySection"></div>
          <div id="stoneSection"></div>
        </div>

        <div class="column-right">
          <h3>Results</h3>
          <div id="simulationResult">Waiting...</div>
        </div>

      </div>
    </div>`;
}

// =====================

function renderStages(state) {

    const container = document.getElementById("stagesContainer");
    if (!container) return;

    container.innerHTML = stages.map(stage => `
      <label class="stage-item">
        <input type="checkbox"
          value="${stage.id}"
          ${state.stages.includes(stage.id) ? "checked" : ""}>
        <span>${stage.name}</span>
      </label>
    `).join("");
}

// =====================

function renderParameters(state) {

    const carpentry = document.getElementById("carpentrySection");
    const stone = document.getElementById("stoneSection");

    if (!carpentry || !stone) return;

    carpentry.innerHTML = state.stages.includes("carpentry")
        ? carpentryTemplate()
        : "";

    stone.innerHTML = state.stages.includes("stone")
        ? stoneTemplate()
        : "";
}

// =====================

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

// =====================

function bindEvents() {

    document.getElementById("btnCloseModal")
        ?.addEventListener("click", closeModal);

    document.getElementById("btnSimulate")
        ?.addEventListener("click", () => {
            console.log("SIMULATE", store.getState());
        });

    document.addEventListener("change", handleStageChange);
}

// =====================

function handleStageChange(e) {

    if (!e.target.matches("input[type='checkbox']")) return;

    const id = e.target.value;

    let stagesState = store.getState().stages;

    if (e.target.checked) {
        stagesState = [...stagesState, id];
    } else {
        stagesState = stagesState.filter(s => s !== id);
    }

    store.setState({ stages: stagesState });
}

// =====================

function closeModal() {
    const container = document.getElementById("modal-container");
    if (!container) return;

    container.innerHTML = "";
    container.style.display = "none";
}

// =====================

function carpentryTemplate() {
    return `
      <div class="parameter-group">
        <h4>Carpentry</h4>
        <input placeholder="Panels">
        <input placeholder="Cabinets">
      </div>
    `;
}

function stoneTemplate() {
    return `
      <div class="parameter-group">
        <h4>Stone</h4>
        <input placeholder="SqFt">
        <input placeholder="Slabs">
      </div>
    `;
}
