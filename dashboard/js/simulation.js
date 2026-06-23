// simulation.js

import { calculateCarpentry }
from './calculators/carpentry.js';

import { calculateStone }
from './calculators/stone.js';

export function simulate(state)
{
    let result = {

        carpentry:null,
        stone:null,

        totalMinutes:0
    };

    if(state.selectedStages.includes(6))
    {
        result.carpentry =
            calculateCarpentry(
                state.carpentry
            );

        result.totalMinutes +=
            result.carpentry.totalMinutes;
    }

    if(state.selectedStages.includes(10))
    {
        result.stone =
            calculateStone(
                state.stone
            );

        result.totalMinutes +=
            result.stone.totalMinutes;
    }

    return result;
}

export function simulateProject(state)
{
    console.log(state);

    return {
        totalMinutes: 0,
        totalHours: 0
    };
}
