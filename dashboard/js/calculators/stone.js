const levelFactor = {

    1:0.85,
    2:1.00,
    3:1.30
};

const edgeTimes = {

    Eased:2,
    Pencil:3,
    HalfBullnose:4,
    FullBullnose:5,
    Ogee:8,
    Miter:10,
    Laminated:12
};

function setupMachine(machine, slabs)
{
    if(machine==="BRETON")
    {
        return slabs * 25;
    }

    return slabs * 30;
}

export function calculateStone(data)
{
    let setup =
        setupMachine(
            data.machine,
            data.slabs
        );

    let edge =
        data.edgeLF *
        edgeTimes[data.edgeType];

    let cutouts =
        data.cutouts * 20;

    let led =
        data.led * 60;

    let frame =
        data.metalFrame * 120;

    let total =
        setup +
        edge +
        cutouts +
        led +
        frame;

    total =
        total *
        levelFactor[data.level];

    return {

        setup,

        edge,

        cutouts,

        led,

        frame,

        totalMinutes: total,

        totalHours:
            (total / 60).toFixed(2)
    };
}
