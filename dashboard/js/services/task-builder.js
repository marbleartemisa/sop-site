import { stages } from "../data/stages.js";

export function buildProjectTasks(project) {

    return stages.map((stage, index) => ({

        id: crypto.randomUUID(),

        projectId: project.id,

        order: index + 1,

        stageId: stage.id,

        stageName: stage.name,

        plannedDays: stage.days,

        calculatedHours: 0,

        calculatedMinutes: 0,

        startDate: null,

        endDate: null,

        status: "Pending",

        assignedResource: null

    }));

}
