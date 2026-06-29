import { buildProject } from "./project-builder.js";
import { buildProjectTasks } from "./task-builder.js";
import { post } from "./api.js";

export function createProject(state) {

  //==========================
  // BUILD PROJECT
  //==========================

  const project = buildProject(state);

  //==========================
  // BUILD TASKS
  //==========================

  const tasks = buildProjectTasks(project);

  return {
    project,
    tasks
  };
}

/*========================================
  SAVE PROJECT TO BACKEND (FIXED)
========================================*/

export async function saveProject(project, tasks) {

  return await post({
    action: "CREATE_PROJECT",
    project,
    tasks
  });

}
