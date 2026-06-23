import { renderSimulation }
from "./simulation.js";

const PROJECT_STAGES = [
  { id: "agreement", label: "Agreement (0d)" },
  { id: "measure", label: "Measure Confirmation (3d)" },
  { id: "scheduling", label: "Scheduling (3d)" },
  { id: "material_order", label: "Material Order (4d)" },
  { id: "final_approval", label: "Final Approval (3d)" },

  { id: "carpentry_fab", label: "Carpentry Fabrication (2.5d)" },
  { id: "carpentry_install", label: "Carpentry Installation (2.5d)" },

  { id: "stone_measure", label: "Stone Measure (2d)" },
  { id: "stone_approval", label: "Stone Approval (3d)" },
  { id: "stone_fab", label: "Stone Fabrication (3d)" },
  { id: "stone_install", label: "Stone Installation (3d)" },

  { id: "punchout", label: "Punchout (2d)" }
];

function renderStages(container) {
  container.innerHTML = "";

  PROJECT_STAGES.forEach(stage => {
    const row = document.createElement("label");

    row.style.display = "block";
    row.style.marginBottom = "6px";

    row.innerHTML = `
      <input type="checkbox" value="${stage.id}" checked />
      <span>${stage.label}</span>
    `;

    container.appendChild(row);
  });
}




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
          <div id="stagesContainer"></div>
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
const container = document.getElementById("stagesContainer");
renderStages(container);
  renderSimulation();

}
