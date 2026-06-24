import { calculateCarpentry } from './calculators/carpentry.js';
import { calculateStone } from './calculators/stone.js';

// =========================
// STAGE GROUPING LOGIC
// =========================

function getStageFlags(stages = []) {

    return {
        carpentry: stages.some(s =>
            s.startsWith("carpentry_")
        ),

        stone: stages.some(s =>
            s.startsWith("stone_")
        )
    };
}

// =========================
// CORE SIMULATION
// =========================

function simulate(state) {

    let result = {
        carpentry: null,
        stone: null,
        totalMinutes: 0
    };

    const stages = state.stages || [];
    const flags = getStageFlags(stages);

    // =========================
    // CARPENTRY
    // =========================
    if (flags.carpentry) {

        const carpentryResult = calculateCarpentry(
            state.carpentry || {}
        );

        result.carpentry = carpentryResult;
        result.totalMinutes += carpentryResult.totalMinutes || 0;
    }

    // =========================
    // STONE
    // =========================
    if (flags.stone) {

        const stoneResult = calculateStone(
            state.stone || {}
        );

        result.stone = stoneResult;
        result.totalMinutes += stoneResult.totalMinutes || 0;
    }

    return result;
}

// =========================
// MAIN ENTRY POINT
// =========================


export function simulateProject(state) {

    console.log("SIMULATION INPUT:", JSON.parse(JSON.stringify(state)));

    const result = simulate(state);

    return {
        carpentry: result.carpentry,
        stone: result.stone,
        totalMinutes: result.totalMinutes,
        totalHours: +(result.totalMinutes / 60).toFixed(2)
    };
}
