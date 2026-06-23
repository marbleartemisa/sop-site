import { stages } from './data/stages.js';
import { simulateProject } from './simulation.js';

export function renderProjectSimulationModal() {

    console.log("Opening Simulation Modal");

    const container =
        document.getElementById("modal-container");

    if (!container) {

        console.error(
            "modal-container not found"
        );

        return;
    }

    container.innerHTML = `

        <div
            id="simulationModal"
            class="simulation-modal">

            <div
                class="simulation-container">

                <!-- ===================================== -->
                <!-- LEFT COLUMN -->
                <!-- ===================================== -->

                <div class="column-left">

                    <div class="modal-header">

                        <h2>
                            New Project Simulation
                        </h2>

                        <button
                            id="btnCloseModal"
                            class="close-btn">

                            ✕

                        </button>

                    </div>

                    <div class="form-group">

                        <label>
                            Project Name
                        </label>

                        <input
                            id="projectName"
                            type="text"
                            placeholder="Customer / Project Name">

                    </div>

                    <hr>

                    <h3>
                        Project Stages
                    </h3>

                    <div
                        id="stagesContainer">
                    </div>

                    <button
                        id="btnSimulate"
                        class="simulate-btn">

                        Simulate Project

                    </button>

                </div>

                <!-- ===================================== -->
                <!-- CENTER COLUMN -->
                <!-- ===================================== -->

                <div class="column-center">

                    <h3>
                        Parameters
                    </h3>

                    <div
                        id="carpentrySection">
                    </div>

                    <div
                        id="stoneSection">
                    </div>

                </div>

                <!-- ===================================== -->
                <!-- RIGHT COLUMN -->
                <!-- ===================================== -->

                <div class="column-right">

                    <h3>
                        Results
                    </h3>

                    <div
                        id="simulationResult">

                        Select stages and click
                        "Simulate Project"

                    </div>

                </div>

            </div>

        </div>

    `;

    renderStages();
    bindEvents();

    // Close button

    document
        .getElementById(
            "btnCloseModal"
        )
        ?.addEventListener(
            "click",
            () => {

                container.innerHTML = "";

            }
        );
}
/* ==========================================
   STAGES
========================================== */

function renderStages() {

    const container =
        document.getElementById('stagesContainer');

    if (!container) return;

    container.innerHTML = '';

    stages.forEach(stage => {

        container.innerHTML += `

            <label class="stage-item">

                <input
                    type="checkbox"
                    class="stage-checkbox"
                    value="${stage.id}">

                ${stage.name}

            </label>

        `;
    });
}

/* ==========================================
   CARPENTRY FORM
========================================== */

function renderCarpentryForm() {

    const container =
        document.getElementById('carpentrySection');

    if (!container) return;

    container.innerHTML = `

        <h3>Carpentry Production</h3>

        <input
            id="panels"
            type="number"
            placeholder="Panels">

        <input
            id="cabinets"
            type="number"
            placeholder="Cabinets">

        <input
            id="drawers"
            type="number"
            placeholder="Drawers">

        <input
            id="carpentryEdgeLF"
            type="number"
            placeholder="Edge LF">

    `;
}

/* ==========================================
   STONE FORM
========================================== */

function renderStoneForm() {

    const container =
        document.getElementById('stoneSection');

    if (!container) return;

    container.innerHTML = `

        <h3>Stone Production</h3>

        <select id="machine">

            <option value="BRETON">
                Breton
            </option>

            <option value="COCH">
                Coch
            </option>

        </select>

        <input
            id="sqft"
            type="number"
            placeholder="SqFt">

        <input
            id="slabs"
            type="number"
            placeholder="Slabs">

        <input
            id="stoneEdgeLF"
            type="number"
            placeholder="Edge LF">

    `;
}

/* ==========================================
   EVENTS
========================================== */

function bindEvents() {

    console.log("Binding modal events");

    // Checkboxes de etapas

    document
        .querySelectorAll(".stage-checkbox")
        .forEach(cb => {

            cb.addEventListener(
                "change",
                onStageChange
            );

        });

    // Botón Simulate

    document
        .getElementById("btnSimulate")
        ?.addEventListener(
            "click",
            runSimulation
        );

    // Botón Close

    document
        .getElementById("btnCloseModal")
        ?.addEventListener(
            "click",
            closeSimulationModal
        );
}

function closeSimulationModal() {

    const container =
        document.getElementById(
            "modal-container"
        );

    if (container) {

        container.innerHTML = "";

    }
}

function onStageChange() {

    const selectedStages =

        [...document.querySelectorAll(
            '.stage-checkbox:checked'
        )]

        .map(cb => Number(cb.value));

    // Carpentry

    if (selectedStages.includes(6)) {

        renderCarpentryForm();

    } else {

        document.getElementById(
            'carpentrySection'
        ).innerHTML = '';
    }

    // Stone

    if (selectedStages.includes(10)) {

        renderStoneForm();

    } else {

        document.getElementById(
            'stoneSection'
        ).innerHTML = '';
    }
}

/* ==========================================
   SIMULATION
========================================== */

function runSimulation() {

    const selectedStages =

        [...document.querySelectorAll(
            '.stage-checkbox:checked'
        )]

        .map(cb => Number(cb.value));

    const state = {

        projectName:

            document.getElementById(
                'projectName'
            )?.value || '',

        selectedStages,

        carpentry: {

            panels:
                Number(
                    document.getElementById(
                        'panels'
                    )?.value || 0
                ),

            cabinets:
                Number(
                    document.getElementById(
                        'cabinets'
                    )?.value || 0
                ),

            drawers:
                Number(
                    document.getElementById(
                        'drawers'
                    )?.value || 0
                ),

            edgeLF:
                Number(
                    document.getElementById(
                        'carpentryEdgeLF'
                    )?.value || 0
                )
        },

        stone: {

            machine:
                document.getElementById(
                    'machine'
                )?.value || 'BRETON',

            slabs:
                Number(
                    document.getElementById(
                        'slabs'
                    )?.value || 0
                ),

            edgeLF:
                Number(
                    document.getElementById(
                        'stoneEdgeLF'
                    )?.value || 0
                )
        }
    };

    console.log('Simulation State', state);

    const result =
        simulateProject(state);

    renderResults(result);
}

/* ==========================================
   RESULTS
========================================== */

function renderResults(result) {

    document.getElementById(
        'simulationResult'
    ).innerHTML = `

        <h3>Simulation Results</h3>

        <div>

            Total Hours:
            <strong>${result.totalHours}</strong>

        </div>

    `;
}
