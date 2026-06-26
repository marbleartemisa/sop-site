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

  const s = slabs || 0;

  return machine === "BRETON"
    ? s * STONE.BRETON_SETUP
    : s * STONE.COCH_SETUP;
}

// =========================
// MAIN CALCULATOR
// =========================
export function calculateStone(input = {}) {

  const level = Number(input.level || 2);
  const factor = stoneLevelFactor[level] || 1;

  const edgeType =
    STONE.EDGE_TYPES[input.edgeType] || 4;

  // =========================
  // SETUP
  // =========================
  const setup =
    setupMachine(input.machine, input.slabs);

  // =========================
  // EDGE WORK
  // =========================
  const edge =
    (input.edgeLF || 0) * edgeType;

  // =========================
  // CUTOUTS
  // =========================
  const cutouts =
    (input.cutouts || 0) * 20;

  // =========================
  // LED (future input, safe default)
  // =========================
  const led =
    (input.led || 0) * 60;

  // =========================
  // METAL FRAME
  // =========================
  const frame =
    (input.metalFrame || 0) * 120;

  // =========================
  // BASE TOTAL
  // =========================
  const baseTotal =
    setup + edge + cutouts + led + frame;

  const totalMinutes =
    baseTotal * factor;

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
