import { STATE } from "./state.js";
import { calculateProjectSchedule } from "./scheduler.engine.js";

/**
 * ORQUESTADOR PRINCIPAL
 * Solo coordina la simulación
 */

export function generateSchedule() {

  let currentDate = new Date();

  STATE.schedule = [];

  STATE.projects.forEach(project => {

    const result = calculateProjectSchedule({
      ...project,
      resource: project.resource || "BRETON"
    });

    const start = new Date(currentDate);
    const end = new Date(start);

    end.setHours(end.getHours() + result.totalHours);

    const entry = {
      ProjectID: project.projectId || project.ProjectID,
      Resource: result.resource,
      Start: start,
      End: end,
      PF: result.totalHours
    };

    STATE.schedule.push(entry);

    currentDate = new Date(end);
  });

  console.log("SCHEDULE GENERATED", STATE.schedule);
}

/* GLOBAL */
window.runScheduler = generateSchedule;
