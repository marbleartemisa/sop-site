import { STATE } from "./state.js";
import { calculateProjectSchedule } from "./scheduler.engine.js";

/**
 * ORQUESTADOR PRINCIPAL
 * Solo coordina la simulación
 */

// scheduler.js

export function generateSchedule(projectId, state) {
  const tasks = state.PROJECT_TASKS
    .filter(t => t.ProjectID === projectId)
    .sort((a, b) => a.Sequence - b.Sequence);

  const resourceCalendar = {};
  const taskMap = {};

  for (const task of tasks) {
    const resource = task.Resource;

    if (!resourceCalendar[resource]) {
      resourceCalendar[resource] = new Date();
    }

    // Dependency
    let dependencyEnd = null;

    if (task.Dependency) {
      const depTask = taskMap[task.Dependency];
      if (depTask) {
        dependencyEnd = new Date(depTask.CalculatedEnd);
      }
    }

    // Resource availability
    const resourceAvailable = new Date(resourceCalendar[resource]);

    // Previous sequence
    const prevTask = getPreviousTask(tasks, task.Sequence);
    const prevEnd = prevTask ? new Date(prevTask.CalculatedEnd) : null;

    const candidates = [dependencyEnd, resourceAvailable, prevEnd]
      .filter(Boolean);

    const start = new Date(Math.max(...candidates.map(d => d.getTime())));

    const end = new Date(start);
    end.setHours(end.getHours() + Number(task.DurationHours || 0));

    task.CalculatedStart = start.toISOString();
    task.CalculatedEnd = end.toISOString();

    taskMap[task.Task] = task;
    resourceCalendar[resource] = end;
  }

  return tasks;
}

function getPreviousTask(tasks, sequence) {
  return tasks.find(t => t.Sequence === sequence - 1);
}

/* GLOBAL */
window.runScheduler = generateSchedule;
