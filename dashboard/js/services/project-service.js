import { buildProject } from "./project-builder.js";
import { buildProjectTasks } from "./project-task-builder.js";

export function createProject(state) {

    //==========================
    // Build Project
    //==========================

    const project =
        buildProject(state);

    //==========================
    // Build Tasks
    //==========================

    const tasks =
        buildProjectTasks(project);

    //==========================
    // Return complete package
    //==========================

    return {

        project,

        tasks

    };

}
