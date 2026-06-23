const complexityFactor = {

    1:1.00,
    2:1.15,
    3:1.30,
    4:1.50,
    5:2.00
};

export function calculateCarpentry(data)
{
    let cnc = data.panels * 9;

    let edgeSetup = 15;

    let edgeProcess =
        data.edgeLF * 0.60;

    let cabinets =
        data.cabinets * 10;

    let drawers =
        data.drawers * 20;

    let pantry =
        data.pantry * 20;

    let trashcan =
        data.trashcan * 25;

    let lazy =
        data.lazySusan * 25;

    let lemans =
        data.lemans * 25;

    let pocketCab =
        data.pocketCabinet * 60;

    let pocketPantry =
        data.pocketPantry * 90;

    let laminate =
        data.laminateSqft * 3.5;

    let total =
        cnc +
        edgeSetup +
        edgeProcess +
        cabinets +
        drawers +
        pantry +
        trashcan +
        lazy +
        lemans +
        pocketCab +
        pocketPantry +
        laminate;

    total =
        total *
        complexityFactor[data.complexity];

    return {

        cnc,
        edgeSetup,
        edgeProcess,
        cabinets,
        drawers,
        pantry,
        trashcan,
        lazy,
        lemans,
        pocketCab,
        pocketPantry,
        laminate,

        totalMinutes: total,

        totalHours:
            (total / 60).toFixed(2)
    };
}
