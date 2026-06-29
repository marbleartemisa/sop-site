import { buildProject } from "./project-builder.js";
import { buildProjectTasks } from "./task-builder.js";
import { post } from "./api.js";

export function createProject(state) {

    const project = buildProject(state);

    const tasks = buildProjectTasks(project);

    return {
        project,
        tasks
    };

}

export async function saveProject(project, tasks) {

    return await post({

        action: "CREATE_PROJECT",

        project,

        tasks

    });

}
