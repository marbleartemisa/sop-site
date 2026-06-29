import { buildProject } from "./project-builder.js";
import { buildProjectTasks } from "./task-builder.js";
import { post } from "./api.js";

export function createProject(state) {

  const project = buildProject(state);

  return { project };
}

/*========================================
  SAVE PROJECT TO BACKEND (FIXED)
========================================*/
export async function saveProject(project) {

  return await post({
    action: "CREATE_PROJECT",
    project
  });

}
