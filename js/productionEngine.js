import { PRODUCTION_TIME_MATRIX } from "./state.js";
import { EDGE_FACTORS } from "./state.js";


export function getMaterialFactor(group) {
  const map = {
    G1: 1.0,
    G2: 1.1,
    G3: 1.4,
    G4: 1.2,
    G5: 1.6
  };

  return map[group] || 1;
}

export function calcCutting({ ft2, group, machine }) {
  const rate = PRODUCTION_TIME_MATRIX.CUT_CNC.LF[group];

  return ft2 * rate * getMaterialFactor(group);
}

export function calcCutouts({ type, qty, group }) {
  const base =
    PRODUCTION_TIME_MATRIX.CUTOUTS.EA[type][group];

  return base * qty;
}

export function calcEdges({ linearFeet, type, group }) {
  const base =
    PRODUCTION_TIME_MATRIX.EDGES.LF[group];

  const edgeFactor = EDGE_FACTORS[type]?.factor || 1;

  return linearFeet * base * edgeFactor;
}

export function calcSink({ qty, group }) {
  return PRODUCTION_TIME_MATRIX.SINK.EA[group] * qty;
}

export function calcPolish({ linearFeet, group }) {
  return PRODUCTION_TIME_MATRIX.POLISH.LF[group] * linearFeet;
}

export function calcFrame({ qty, group }) {
  return PRODUCTION_TIME_MATRIX.FRAME.EA[group] * qty;
}

export function calculateProjectTime(input) {
  const {
    ft2,
    group,
    edgesLF,
    edgeType,
    cutouts,
    sinks,
    frameQty,
    machine
  } = input;

  return {
    cutting: calcCutting({ ft2, group, machine }),
    cutouts: calcCutouts({ ...cutouts, group }),
    edges: calcEdges({ linearFeet: edgesLF, type: edgeType, group }),
    sink: calcSink({ qty: sinks, group }),
    polish: calcPolish({ linearFeet: edgesLF, group }),
    frame: calcFrame({ qty: frameQty, group })
  };
}
