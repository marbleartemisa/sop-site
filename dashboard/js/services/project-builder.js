import { simulateProject } from "../simulation.js";

export function buildProject(state) {

  const simulation = simulateProject(state);

  return {

    ProjectID: crypto.randomUUID(), // 🔥 FIX CRÍTICO

    Customer: state.projectName || "UNKNOWN",

    CreatedDate: new Date().toISOString(),

    CurrentStage: "Agreement",

    Priority: "Normal",

    Simulation: simulation,

    Carpentry: state.carpentry || {},

    Stone: state.stone || {},

    Stages: state.stages || []

  };
}
