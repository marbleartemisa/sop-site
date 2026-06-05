import { state } from "./state.js";

/*
  RULE:
  - cada proyecto tiene fases:
    NEED -> FAB -> INST
  - cada fase tiene duración estimada
  - recursos limitados (simple version)
*/

const DEFAULT_DURATIONS = {
  NEED: 2,
  FAB: 5,
  INST: 2
};

export function generateSchedule() {
  let currentDate = new Date();

  state.projects.forEach(project => {

    project.timeline = [];

    Object.keys(DEFAULT_DURATIONS).forEach(phase => {

      const start = new Date(currentDate);
      const end = new Date(currentDate);
      end.setDate(end.getDate() + DEFAULT_DURATIONS[phase]);

      project.timeline.push({
        phase,
        start,
        end
      });

      // siguiente fase empieza donde termina esta
      currentDate = new Date(end);
    });
  });

  console.log("SCHEDULE GENERATED", state.projects);
}
