import { STATE } from "./state.js";

/**
 * Simula colas por recurso y calcula disponibilidad
 */

const RESOURCE_SPEED = {
  BRETON: 80,     // ft2 por día
  COACH: 60,
  MANUAL: 200
};

export function calculateProjectSchedule(project) {

  const resource = project.resource || "BRETON";

  const speed = RESOURCE_SPEED[resource] || 50;

  // tiempo base
  const baseHours =
    (project.ft2 / speed) * 8 +
    (project.pieces * 0.5) +
    (project.edgeFt * 0.2) +
    (project.cutouts * 0.6) +
    (project.slabs * 0.4);

  const complexityFactor = {
    1: 1.0,
    2: 1.25,
    3: 1.6
  }[project.level] || 1;

  const totalHours = baseHours * complexityFactor;

  return {
    resource,
    totalHours,
    estimatedDays: totalHours / 8
  };
}
