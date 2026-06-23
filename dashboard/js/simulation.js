import { projectState }
from "./project-state.js";

import { calculateCarpentry }
from "./calculators/carpentry.js";

import { calculateStone }
from "./calculators/stone.js";

export function renderSimulation(){

  const sim =
      document.getElementById("simulation");

  if(!sim) return;

  const carp =
      calculateCarpentry(
        projectState.carpentry
      );

  const stone =
      calculateStone(
        projectState.stone
      );

  sim.innerHTML = `

  <h3>CARPENTRY</h3>

  <p>CNC:
     ${(carp.cnc/60).toFixed(1)} hrs</p>

  <p>EDGE:
     ${(carp.edge/60).toFixed(1)} hrs</p>

  <p>TOTAL:
     ${(carp.total/60).toFixed(1)} hrs</p>

  <hr>

  <h3>STONE</h3>

  <p>CUT:
     ${(stone.cut/60).toFixed(1)} hrs</p>

  <p>EDGE:
     ${(stone.edge/60).toFixed(1)} hrs</p>

  <p>TOTAL:
     ${(stone.total/60).toFixed(1)} hrs</p>

  `;

}
