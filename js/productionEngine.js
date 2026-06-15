import { PRODUCTION_TIME_MATRIX } from "./state.js";
import { EDGE_FACTORS } from "./state.js";
import { STAGE_CONFIG } from "./projects.js"; // o state central si luego lo movemos

const TIME_MATRIX = {

  STONE: {
    CUTTING: {
      G1: 0.8,
      G2: 1.2,
      G3: 3.0,
      G4: 1.0,
      G5: 4.0
    },

    CUTOUTS: {
      G1: 45,
      G2: 60,
      G3: 120,
      G4: 50,
      G5: 150
    },

    EDGES: {
      G1: 10,
      G2: 15,
      G3: 30,
      G4: 12,
      G5: 45
    },

    POLISH: {
      G1: 15,
      G2: 20,
      G3: 40,
      G4: 15,
      G5: 60
    },

    FRAME: {
      G1: 120,
      G2: 120,
      G3: 150,
      G4: 120,
      G5: 150
    }
  },

  CARPENTRY: {
    CNC: {
      MDF: 0.5,
      PLYWOOD: 0.8
    },
    EDGEBAND: {
      MDF: 0.3,
      PLYWOOD: 0.4
    }
  }

};

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

export function calculateProjectTime(project) {

  const stages = project.stages || [];

  let result = {
    cutting: 0,
    cutouts: 0,
    edges: 0,
    polish: 0,
    sink: 0,
    frame: 0
  };

  if (stages.includes("STONE")) {

    result.cutting =
      calcCutting(project);

    result.cutouts =
      calcCutouts(project);

    result.edges =
      calcEdges(project);

    result.polish =
      calcPolish(project);
  }

  if (stages.includes("CARPENTRY")) {
    result.frame =
      calcFrame(project);
  }

  return result;
}

export function getStageTime({ stage, group, materialType = "G2" }) {

  if (TIME_MATRIX.STONE[stage]) {
    return TIME_MATRIX.STONE[stage][materialType] || 0;
  }

  if (TIME_MATRIX.CARPENTRY[stage]) {
    return TIME_MATRIX.CARPENTRY[stage][materialType] || 0;
  }

  return 0;
}

export function calculateProjectTime(project) {

  const { stages = [], group = "G2" } = project;

  let result = {
    cutting: 0,
    cutouts: 0,
    edges: 0,
    polish: 0,
    frame: 0,
    cnc: 0,
    edgeband: 0
  };

  // 🪨 STONE
  if (stages.includes("STONE")) {

    result.cutting =
      getStageTime({ stage: "CUTTING", group });

    result.cutouts =
      getStageTime({ stage: "CUTOUTS", group });

    result.edges =
      getStageTime({ stage: "EDGES", group });

    result.polish =
      getStageTime({ stage: "POLISH", group });

    result.frame =
      getStageTime({ stage: "FRAME", group });
  }

  // 🪵 CARPENTRY
  if (stages.includes("CARPENTRY")) {

    result.cnc =
      getStageTime({ stage: "CNC", group });

    result.edgeband =
      getStageTime({ stage: "EDGEBAND", group });
  }

  return result;
}
