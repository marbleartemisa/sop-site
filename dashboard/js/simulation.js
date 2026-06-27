import { calculateCarpentry } from "./calculators/carpentry.js";
import { calculateStone } from "./calculators/stone.js";

//==================================================
// CORE SIMULATION
//==================================================

function simulate(state = {}) {

    const result = {
        carpentry: null,
        stone: null,
        totalMinutes: 0
    };

    //------------------------------------------------
    // CARPENTRY
    //------------------------------------------------

    if (state.carpentry && Object.keys(state.carpentry).length) {

        const carpentryResult =
            calculateCarpentry(state.carpentry);

        result.carpentry = carpentryResult;

        result.totalMinutes += (carpentryResult.totalMinutes || 0);
    }

    //------------------------------------------------
    // STONE
    //------------------------------------------------

    if (state.stone && Object.keys(state.stone).length) {

        const stoneResult =
            calculateStone(state.stone);

        result.stone = stoneResult;

        result.totalMinutes += (stoneResult.totalMinutes || 0);
    }

    return result;
}

//==================================================
// PUBLIC
//==================================================

export function simulateProject(state = {}) {

    const result = simulate(state);

        return {
          ...result,
          schedule: result.schedule || [],
          totalHours: +(result.totalMinutes / 60).toFixed(2)
        };
}
