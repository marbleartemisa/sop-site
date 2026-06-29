import { buildProject } from "./project-builder.js";
import { buildProjectTasks } from "./task-builder.js";
import { post } from "./api.js";

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



export async function saveProject(project, tasks) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            action: "CREATE_PROJECT",

            project,

            tasks

        })

    });

    return await response.json();

}
