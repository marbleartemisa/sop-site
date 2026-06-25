import { STONE } from "../data/stone-times.js";

// =========================
// LEVEL FACTOR
// =========================
const stoneLevelFactor = {
  1: 0.85,
  2: 1.0,
  3: 1.25
};

// =========================
// MACHINE SETUP
// =========================
function setupMachine(machine, slabs = 0) {
  return machine === "BRETON"
    ? slabs * STONE.BRETON_SETUP
    : slabs * STONE.COCH_SETUP;
}

// =========================
// MAIN CALCULATOR
// =========================
export function calculateStone(input = {}) {

  const level = Number(input.level || 2);
  const factor = stoneLevelFactor[level] || 1;

  const edgeType =
    STONE.EDGE_TYPES[input.edgeType] || 4;

  const setup = setupMachine(input.machine, input.slabs);

  const edge =
    (input.edgeLF || 0) * edgeType;

  const cutouts =
    (input.cutouts || 0) * 20;

  const led =
    (input.led || 0) * 60;

  const frame =
    (input.metalFrame || 0) * 120;

  const baseTotal =
    setup + edge + cutouts + led + frame;

  const totalMinutes = baseTotal * factor;

  return {
    level,
    factor,

    setup,
    edge,
    cutouts,
    led,
    frame,

    baseTotal,
    totalMinutes,
    totalHours: +(totalMinutes / 60).toFixed(2)
  };
}
