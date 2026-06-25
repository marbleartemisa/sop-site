const edgeTimes = {
  Eased: 2,
  Pencil: 3,
  HalfBullnose: 4,
  FullBullnose: 5,
  Ogee: 8,
  Miter: 10,
  Laminated: 12
};

// =========================
// MACHINE SETUP
// =========================
function setupMachine(machine, slabs) {

  const s = slabs || 0;

  if (machine === "BRETON") {
    return s * 25;
  }

  return s * 30;
}

// =========================
// MAIN CALCULATOR
// =========================
export function calculateStone(data) {

  const f = data.complexityFactor || 1;

  // =========================
  // SETUP / MACHINE
  // =========================
  const setup = setupMachine(
    data.machine,
    data.slabs
  );

  // =========================
  // EDGE WORK
  // =========================
  const edge =
    (data.edgeLF || 0) *
    (edgeTimes[data.edgeType] || 4);

  // =========================
  // CUTOUTS
  // =========================
  const cutouts =
    (data.cutouts || 0) * 20;

  // =========================
  // LED WORK
  // =========================
  const led =
    (data.led || 0) * 60;

  // =========================
  // METAL FRAME
  // =========================
  const frame =
    (data.metalFrame || 0) * 120;

  // =========================
  // TOTAL
  // =========================
  const totalMinutes =
    (setup + edge + cutouts + led + frame) * f;

  return {

  setup,
  edge,
  cutouts,
  led,
  frame,

  levelFactor:
      levelFactor[data.level],

  totalMinutes: total,
  totalHours:
      +(total / 60).toFixed(2)
};
}
