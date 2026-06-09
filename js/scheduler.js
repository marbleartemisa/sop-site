import { STATE } from "./state.js";

/*
  RULE:
  - cada proyecto tiene fases:
    NEED -> FAB -> INST
  - cada fase tiene duración estimada
*/

const DEFAULT_DURATIONS = {
  NEED: 2,
  FAB: 5,
  INST: 2
};

export function generateSchedule() {

  let currentDate = new Date();

   STATE.projects.forEach(project => {

    project.timeline = [];

    Object.keys(DEFAULT_DURATIONS).forEach(phase => {

      const start = new Date(currentDate);
      const end = new Date(currentDate);

      end.setDate(
        end.getDate() + DEFAULT_DURATIONS[phase]
      );

      project.timeline.push({
        phase,
        start,
        end
      });

      currentDate = new Date(end);
    });

  });

  console.log(
    "SCHEDULE GENERATED",
    state.projects
  );
}

/* GLOBAL BUTTONS */

window.runScheduler = generateSchedule;

window.createTestProject = function () {
  console.log("TEST PROJECT CLICKED");
};

window.renderGantt = function () {
  console.log("GANTT CLICKED");
};

window.refreshData = function () {
  console.log("REFRESH CLICKED");
};
