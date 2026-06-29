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

import { post } from "./api.js";

export async function saveProject(project) {

  return await post({
    action: "CREATE_PROJECT",
    project
  });

}
