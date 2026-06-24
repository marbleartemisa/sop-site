import { calculateCarpentry } from './calculators/carpentry.js';
import { calculateStone } from './calculators/stone.js';

function simulate(state) {

    let result = {
        carpentry: null,
        stone: null,
        totalMinutes: 0
    };

    // =========================
    // CARPENTRY
    // =========================
    if (state.carpentry) {

        const carpentryResult =
            calculateCarpentry(state.carpentry);

        result.carpentry = carpentryResult;
        result.totalMinutes += carpentryResult.total;
    }

    // =========================
    // STONE
    // =========================
    if (state.stone) {

        const stoneResult =
            calculateStone(state.stone);

        result.stone = stoneResult;
        result.totalMinutes += stoneResult.totalMinutes;
    }

    return result;
}

export function simulateProject(state) {

    const result = simulate(state);

    return {
        ...result,
        totalHours: +(result.totalMinutes / 60).toFixed(2)
    };
}
