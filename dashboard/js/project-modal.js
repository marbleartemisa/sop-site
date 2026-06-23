import { stages } from './data/stages.js';

export function renderProjectSimulationModal()
{
    console.log(
        'Modal function executed'
    );

    const container =
        document.getElementById(
            'modal-container'
        );

   container.innerHTML = `

    <div id="simulationModal"
         class="simulation-modal">

        <div class="simulation-container">

            <div class="column-left">

                <h2>New Project</h2>

                <input
                    id="projectName"
                    placeholder="Project Name">

                <div id="stagesContainer"></div>

                <button id="btnSimulate">
                    Simulate
                </button>

            </div>

            <div class="column-center">

                <div id="carpentrySection"></div>

                <div id="stoneSection"></div>

            </div>

            <div class="column-right">

                <div id="simulationResult"></div>

            </div>

        </div>

    </div>
    `;

    renderStages();

    bindEvents();
}


function renderStages()
{
    const container =
        document.getElementById("stagesContainer");

    container.innerHTML = '';

    stages.forEach(stage =>
    {
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

function renderCarpentryForm()
{
    document.getElementById(
        "carpentrySection"
    ).innerHTML = `

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
            id="edgeLF"
            type="number"
            placeholder="Edge LF">

    `;
}

function renderStoneForm()
{
    document.getElementById(
        "stoneSection"
    ).innerHTML = `

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
            id="edgeLF"
            type="number"
            placeholder="Edge LF">

    `;
}

function bindEvents()
{
    document
    .querySelectorAll(".stage-checkbox")
    .forEach(cb =>
    {
        cb.addEventListener(
            "change",
            onStageChange
        );
    });

    document
    .getElementById("btnSimulate")
    .addEventListener(
        "click",
        runSimulation
    );
}

function onStageChange()
{
    const selected = [...document
        .querySelectorAll(
            ".stage-checkbox:checked"
        )]
        .map(cb =>
            Number(cb.value)
        );

    if(selected.includes(6))
    {
        renderCarpentryForm();
    }
    else
    {
        document
        .getElementById(
            "carpentrySection"
        ).innerHTML = '';
    }

    if(selected.includes(10))
    {
        renderStoneForm();
    }
    else
    {
        document
        .getElementById(
            "stoneSection"
        ).innerHTML = '';
    }
}


import { simulateProject }
from './simulation.js';

function runSimulation()
{
    const state =
    {
        selectedStages:[6,10],

        carpentry:{
            panels:
                Number(
                    document
                    .getElementById("panels")
                    ?.value || 0
                ),

            cabinets:
                Number(
                    document
                    .getElementById("cabinets")
                    ?.value || 0
                ),

            drawers:
                Number(
                    document
                    .getElementById("drawers")
                    ?.value || 0
                ),

            edgeLF:
                Number(
                    document
                    .getElementById("edgeLF")
                    ?.value || 0
                )
        },

        stone:{
            machine:
                document
                .getElementById("machine")
                ?.value,

            slabs:
                Number(
                    document
                    .getElementById("slabs")
                    ?.value || 0
                ),

            edgeLF:
                Number(
                    document
                    .getElementById("stoneEdgeLF")
                    ?.value || 0
                )
        }
    };

    const result =
        simulateProject(state);

    renderResults(result);
}

function renderResults(result)
{
    document.getElementById(
        "simulationResult"
    ).innerHTML = `

        <h3>
            Simulation
        </h3>

        <div>

            Total Hours:

            ${result.totalHours}

        </div>

    `;
}





