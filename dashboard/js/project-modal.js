import { renderSimulation }
from "./simulation.js";

export function openProjectModal(){

  document.getElementById(
    "modal-container"
  ).innerHTML = `

  <div class="modal-overlay">

    <div class="project-modal">

      <div class="modal-header">

        <h2>New Project</h2>

        <button onclick="closeModal()">
          ✕
        </button>

      </div>

      <div class="modal-body">

        <div class="column">

          <h3>Stages</h3>

          <label>

            <input
              type="checkbox"
              checked>

            Carpentry

          </label>

          <br>

          <label>

            <input
              type="checkbox"
              checked>

            Stone

          </label>

        </div>

        <div class="column">

          <h3>Parameters</h3>

          Panels

          <input
             id="panels"
             type="number"
             value="0">

          <br>

          Cabinets

          <input
             id="cabinets"
             type="number"
             value="0">

          <br>

          Slabs

          <input
             id="slabs"
             type="number"
             value="0">

        </div>

        <div
          id="simulation"
          class="column">

        </div>

      </div>

    </div>

  </div>

  `;

  renderSimulation();

}
