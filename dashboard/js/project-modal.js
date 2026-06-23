import { stages } from './data/stages.js';
import { simulateProject } from './simulation.js';

/* =========================================================
   ENTRY POINT
========================================================= */

export function renderProjectSimulationModal() {

    console.log("Opening Simulation Modal");

    const container = document.getElementById("modal-container");

    if (!container) {
        console.error("modal-container not found");
        return;
    }

    openModal(container);

    container.innerHTML = buildModalHTML();

    initModal();
}

/* =========================================================
   OPEN / CLOSE MODAL STATE
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
   UI TEMPLATE
========================================================= */

function buildModalHTML() {

    return `
        <div id="simulationModal" class="simulation-modal">

            <div class="simulation-container">

                <!-- LEFT -->
                <div class="column-left">

                    <div class="modal-header">

                        <h2>Project Simulation</h2>

                        <button id="btnCloseModal">✕</button>

                    </div>

                    <input
                        id="projectName"
                        type="text"
                        placeholder="Customer / Project">

                    <hr/>

                    <div id="stagesContainer"></div>

                    <button id="btnSimulate">
                        Run Simulation
                    </button>

                </div>

                <!-- CENTER -->
                <div class="column-center">

                    <h3>Parameters</h3>

                    <div id="carpentrySection"></div>
                    <div id="stoneSection"></div>

                </div>

                <!-- RIGHT -->
                <div class="column-right">

                    <h3>Results</h3>

                    <div id="simulationResult">
                        Waiting...
                    </div>

                </div>

            </div>
        </div>
    `;
}

/* =========================================================
   INIT
========================================================= */

function initModal() {

    renderStages();
    bindEvents();
}

/* =========================================================
   STAGES
========================================================= */

function renderStages() {

    const container = document.getElementById("stagesContainer");

    if (!container) return;

    container.innerHTML = stages.map(stage => `
        <label class="stage-item">

            <input
                type="checkbox"
                class="stage-checkbox"
                value="${stage.id}">

            <span>
                ${stage.name} (${stage.days}d)
            </span>

        </label>
    `).join("");
}

/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    const stagesContainer = document.getElementById("stagesContainer");
    const btnSimulate = document.getElementById("btnSimulate");
    const btnClose = document.getElementById("btnCloseModal");

    if (stagesContainer) {
        stagesContainer.addEventListener("change", onStageChange);
    }

    if (btnSimulate) {
        btnSimulate.addEventListener("click", runSimulation);
    }

    if (btnClose) {
        btnClose.addEventListener("click", closeModal);
    }
}

/* =========================================================
   STAGE LOGIC
========================================================= */

function getSelectedStages() {

    return [...document.querySelectorAll(".stage-checkbox:checked")]
        .map(cb => Number(cb.value));
}

function onStageChange() {

    const selected = getSelectedStages();

    toggleCarpentry(selected.includes(6));
    toggleStone(selected.includes(10));
}

/* =========================================================
   DYNAMIC PARAMETERS
========================================================= */

function toggleCarpentry(show) {

    const container = document.getElementById("carpentrySection");
    if (!container) return;

    container.innerHTML = show ? carpentryTemplate() : "";
}

function toggleStone(show) {

    const container = document.getElementById("stoneSection");
    if (!container) return;

    container.innerHTML = show ? stoneTemplate() : "";
}

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

/* =========================================================
   SIMULATION
========================================================= */

function runSimulation() {

    const state = buildState();

    console.log("SIMULATION STATE", state);

    const result = simulateProject(state);

    renderResults(result);
}

/* =========================================================
   STATE BUILDER
========================================================= */

function buildState() {

    return {
        projectName: document.getElementById("projectName")?.value || "",
        stages: getSelectedStages(),

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

/* =========================================================
   HELPERS
========================================================= */

function getValue(id) {
    return Number(document.getElementById(id)?.value || 0);
}

/* =========================================================
   RESULTS
========================================================= */

function renderResults(result) {

    const container = document.getElementById("simulationResult");

    if (!container) return;

    container.innerHTML = `
        <div class="result-card">
            <h3>Total Hours</h3>
            <div style="font-size:24px;font-weight:bold;">
                ${result.totalHours}
            </div>
        </div>
    `;
}
