import { calculateCarpentry } from "./calculators/carpentry.js";
import { calculateStone } from "./calculators/stone.js";

//==================================================
// CORE SIMULATION
//==================================================

function simulate(state) {

    const result = {

        carpentry: null,

        stone: null,

        totalMinutes: 0
    };

    //------------------------------------------------
    // CARPENTRY
    //------------------------------------------------

    if (state.carpentry) {

        const carpentryResult =
            calculateCarpentry(state.carpentry);

        result.carpentry = carpentryResult;

        result.totalMinutes +=
            carpentryResult.totalMinutes;
    }

    //------------------------------------------------
    // STONE
    //------------------------------------------------

    if (state.stone) {

        const stoneResult =
            calculateStone(state.stone);

        result.stone = stoneResult;

        result.totalMinutes +=
            stoneResult.totalMinutes;
    }

    return result;
}

//==================================================
// PUBLIC
//==================================================

export function simulateProject(state) {

    const result = simulate(state);

    return {

        ...result,

        totalHours:
            +(result.totalMinutes / 60).toFixed(2)
    };
}
