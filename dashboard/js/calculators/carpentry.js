import { CARPENTRY }
from '../data/carpentry-times.js';

const complexityFactor = {

    1:1.00,
    2:1.15,
    3:1.30,
    4:1.50,
    5:2.00
};

export function calculateCarpentry(data)
{
    let total=0;

    total += data.panels * CARPENTRY.PANEL_CUT;

    total += CARPENTRY.EDGE_SETUP;

    total += data.edgeLF * CARPENTRY.EDGE_LF;

    total += data.cabinets * CARPENTRY.CABINET;

    total += data.drawers * CARPENTRY.DRAWER;

    total += data.pantry * CARPENTRY.PANTRY;

    total += data.trashcan * CARPENTRY.TRASHCAN;

    total += data.lazySusan * CARPENTRY.LAZY_SUSAN;

    total += data.lemans * CARPENTRY.LEMANS;

    total += data.pocketCabinet * CARPENTRY.POCKET_CABINET;

    total += data.pocketPantry * CARPENTRY.POCKET_PANTRY;

    total += data.laminateSqft * CARPENTRY.LAMINATE_SQFT;

    total *= complexityFactor[data.complexity];

    return {

        totalMinutes:total,

        totalHours:(total/60).toFixed(2)
    };
}
