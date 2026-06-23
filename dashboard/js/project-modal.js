export function renderProjectSimulationModal() {

    const container =
        document.getElementById("modal-container");

    container.innerHTML = `

        <div id="simulationModal"
             class="simulation-modal">

            <div class="simulation-container">

                <!-- COLUMNA 1 -->

                <div class="column-left">

                    <h2>New Project</h2>

                    <input
                        type="text"
                        id="projectName"
                        placeholder="Project Name">

                    <div id="stagesContainer"></div>

                    <button id="btnSimulate">
                        Simulate
                    </button>

                </div>

                <!-- COLUMNA 2 -->

                <div class="column-center">

                    <div id="carpentrySection"></div>

                    <div id="stoneSection"></div>

                </div>

                <!-- COLUMNA 3 -->

                <div class="column-right">

                    <div id="simulationResult"></div>

                </div>

            </div>

        </div>

    `;
}
