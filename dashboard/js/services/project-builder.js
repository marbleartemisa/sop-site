import { simulateProject } from "../simulation.js";

export function buildProject(state) {

    const simulation =
        simulateProject(state);

    return {

        id: crypto.randomUUID(),

        customer:
            state.projectName,

        createdAt:
            new Date().toISOString(),

        currentStage:
            "Agreement",

        priority:
            "Normal",

        simulation,

        carpentry:
            state.carpentry,

        stone:
            state.stone,

        stages:
            state.stages
    };

}
