import { stages } from './data/stages.js';
import { simulateProject } from './simulation.js';

export function renderProjectSimulationModal() {

    console.log('Opening Simulation Modal');

    const container =
        document.getElementById('modal-container');

    if (!container) {
        console.error('modal-container not found');
        return;
    }

    container.innerHTML = `

        <div id="simulationModal" class="simulation-modal">

            <div class="simulation-container">

                <!-- COLUMN 1 -->

                <div class="column-left">

                    <h2>New Project</h2>

                    <input
                        id="projectName"
                        type="text"
                        placeholder="Project Name">

                    <div id="stagesContainer"></div>

                    <button id="btnSimulate">
                        Simulate
                    </button>

                </div>

                <!-- COLUMN 2 -->

                <div class="column-center">

                    <div id="carpentrySection"></div>

                    <div id="stoneSection"></div>

                </div>

                <!-- COLUMN 3 -->

                <div class="column-right">

                    <div id="simulationResult">

                        Waiting for simulation...

                    </div>

                </div>

            </div>

        </div>

    `;

    renderStages();
    bindEvents();
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

    document
        .querySelectorAll('.stage-checkbox')
        .forEach(cb => {

            cb.addEventListener(
                'change',
                onStageChange
            );
        });

    document
        .getElementById('btnSimulate')
        ?.addEventListener(
            'click',
            runSimulation
        );
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
