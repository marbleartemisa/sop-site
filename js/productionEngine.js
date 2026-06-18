import {
  PRODUCTION_TIME_MATRIX,
  EDGE_FACTORS
} from "./state.js";

/**
 * Material factor
 */
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

/**
 * CUTTING
 */
export function calcCutting(project) {

  const ft2 = project.ft2 || 0;
  const group = project.group || "G2";

  const rate =
    PRODUCTION_TIME_MATRIX.CUT_CNC.LF[group] || 0;

  return (
    ft2 *
    rate *
    getMaterialFactor(group)
  );
}

/**
 * CUTOUTS
 */
export function calcCutouts(project) {

  const qty =
    project.cutouts?.qty || 0;

  const type =
    project.cutouts?.type || "UNDERMOUNT";

  const group =
    project.group || "G2";

  const base =
    PRODUCTION_TIME_MATRIX.CUTOUTS.EA[type]?.[group] || 0;

  return base * qty;
}

/**
 * EDGES
 */
export function calcEdges(project) {

  const linearFeet =
    project.edgesLF || 0;

  const edgeType =
    project.edgeType || "MITER_45";

  const group =
    project.group || "G2";

  const base =
    PRODUCTION_TIME_MATRIX.EDGES.LF[group] || 0;

  const edgeFactor =
    EDGE_FACTORS[edgeType]?.factor || 1;

  return (
    linearFeet *
    base *
    edgeFactor
  );
}

/**
 * INTEGRATED SINK
 */
export function calcSink(project) {

  const qty =
    project.sinks || 0;

  const group =
    project.group || "G2";

  const base =
    PRODUCTION_TIME_MATRIX.SINK.EA[group] || 0;

  return base * qty;
}

/**
 * POLISH
 */
export function calcPolish(project) {

  const linearFeet =
    project.edgesLF || 0;

  const group =
    project.group || "G2";

  const base =
    PRODUCTION_TIME_MATRIX.POLISH.LF[group] || 0;

  return base * linearFeet;
}

/**
 * FRAME
 */
export function calcFrame(project) {

  const qty =
    project.frameQty || 0;

  const group =
    project.group || "G2";

  const base =
    PRODUCTION_TIME_MATRIX.FRAME.EA[group] || 0;

  return base * qty;
}

/**
 * MAIN ENGINE
 */
export function calculateProjectTime(project) {

  const stages =
    project.stages || [];

  const result = {
    cutting: 0,
    cutouts: 0,
    edges: 0,
    sink: 0,
    polish: 0,
    frame: 0
  };

  // STONE PIPELINE
  if (stages.includes("STONE")) {

    result.cutting =
      calcCutting(project);

    result.cutouts =
      calcCutouts(project);

    result.edges =
      calcEdges(project);

    result.polish =
      calcPolish(project);

    if ((project.sinks || 0) > 0) {

      result.sink =
        calcSink(project);
    }

    if ((project.frameQty || 0) > 0) {

      result.frame =
        calcFrame(project);
    }
  }

  result.total =
    result.cutting +
    result.cutouts +
    result.edges +
    result.sink +
    result.polish +
    result.frame;

  return result;
}
