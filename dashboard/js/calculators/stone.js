const edgeTimes = {

  Eased: 2,
  Pencil: 3,
  HalfBullnose: 4,
  FullBullnose: 5,
  Ogee: 8,
  Miter: 10,
  Laminated: 12
};

function setupMachine(machine, slabs) {

  const qty = slabs || 0;

  if (machine === "BRETON") {
    return qty * 25;
  }

  return qty * 30;
}

export function calculateStone(data = {}) {

  const complexityFactor =
    data.complexityFactor || 1;

  // MACHINE SETUP
  const setup =
    setupMachine(
      data.machine,
      data.slabs
    );

  // EDGE WORK
  const edge =
    (data.edgeLF || 0) *
    (
      edgeTimes[data.edgeType]
      || 4
    );

  // CUTOUTS
  const cutouts =
    (data.cutouts || 0) * 20;

  // LED
  const led =
    (data.led || 0) * 60;

  // METAL FRAME
  const frame =
    (data.metalFrame || 0) * 120;

  const subtotal =
      setup
    + edge
    + cutouts
    + led
    + frame;

  const totalMinutes =
      subtotal *
      complexityFactor;

  return {

    setup,
    edge,
    cutouts,
    led,
    frame,

    subtotal,

    complexityFactor,

    totalMinutes,

    totalHours:
      +(totalMinutes / 60).toFixed(2)
  };
}
