import { calculateCarpentry } from './calculators/carpentry.js';
import { calculateStone } from './calculators/stone.js';

export function simulate(state) {

    let result = {
        carpentry: null,
        stone: null,
        totalMinutes: 0
    };

    const stages = state.stages || [];

    // =========================
    // CARPENTRY
    // =========================
    if (stages.includes("carpentry")) {

        result.carpentry = calculateCarpentry(
            state.carpentry || {}
        );

        result.totalMinutes += result.carpentry.totalMinutes || 0;
    }

    // =========================
    // STONE
    // =========================
    if (stages.includes("stone")) {

        result.stone = calculateStone(
            state.stone || {}
        );

        result.totalMinutes += result.stone.totalMinutes || 0;
    }

    return result;
}

// =======================================================
// MAIN ENTRY POINT (used by modal)
// =======================================================

export function simulateProject(state) {

    console.log("SIMULATION INPUT:", state);

    const result = simulate(state);

    return {
        ...result,
        totalHours: +(result.totalMinutes / 60).toFixed(2)
    };
}
