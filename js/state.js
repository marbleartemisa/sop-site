// ======================
// DEFAULT STATE (PLANTILLA)
// ======================
export const DEFAULT_STATE = {
  stage: "carpentry", // "stone" | "carpentry"

  PROJECTS: [],
  PROJECT_TASKS: [],

  RESOURCES: [
    { id: "CNC", capacity: 1 },
    { id: "BRETON", capacity: 1 },
    { id: "COACH", capacity: 1 },
    { id: "MANUAL", capacity: 1 }
  ],

  schedule: [],

  UI: {
    stages: [],
    modules: {
      STONE: true,
      CARPENTRY: true
    }
  }
};

// ======================
// ACTIVE STATE (SINGLE SOURCE OF TRUTH)
// ======================
export const STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));

// ======================
// EDGE FACTORS
// ======================
export const EDGE_FACTORS = {
  MITER_45: {
    factor: 1.8,
    label: "Miter 45° (Glue + Recut + Polish)"
  },
  LAMINATED: {
    factor: 2.2,
    label: "Laminated (Build + Recut + Polish)"
  },
  BULLNOSE: {
    factor: 1.3,
    label: "Bullnose (Diarex)"
  },
  HALF_BULLNOSE: {
    factor: 1.35,
    label: "Half Bullnose (Diarex)"
  },
  FULL_BULLNOSE: {
    factor: 1.4,
    label: "Full Bullnose (Diarex)"
  },
  OGEE: {
    factor: 1.6,
    label: "Ogee (Diarex complex)"
  }
};

// ======================
// PRODUCTION MATRIX
// ======================
export const PRODUCTION_TIME_MATRIX = {
  CUT_CNC: {
    LF: { G1: 0.8, G2: 1.2, G3: 3.0, G4: 1.0, G5: 4.0 },
    COACH: { G1: 1.5, G2: 2.5, G3: 5.0, G4: 2.0, G5: 6.5 }
  },

  CUTOUTS: {
    EA: {
      UNDERMOUNT: { G1: 45, G2: 60, G3: 120, G4: 50, G5: 150 },
      TOPMOUNT: { G1: 30, G2: 40, G3: 80, G4: 35, G5: 100 },
      FAUCET: { G1: 5, G2: 8, G3: 20, G4: 7, G5: 15 },
      OUTLET: { G1: 10, G2: 15, G3: 30, G4: 12, G5: 25 }
    }
  },

  EDGES: {
    LF: { G1: 10, G2: 15, G3: 30, G4: 12, G5: 45 }
  },

  EDGE_TYPES: {
    EASED: { G1: 5, G2: 6, G3: 12, G4: 5, G5: 8 },
    HALF_BULLNOSE: { G1: 8, G2: 12, G3: 20, G4: 10, G5: 15 },
    FULL_BULLNOSE: { G1: 10, G2: 15, G3: 25, G4: 12, G5: 20 },
    MITER_45: { G1: 20, G2: 25, G3: 40, G4: 22, G5: 30 },
    OGEE: { G1: 30, G2: 40, G3: 60, G4: 35, G5: 999 },
    LAMINATED: { G1: 12, G2: 15, G3: 20, G4: 12, G5: 18 }
  },

  SINK: {
    EA: { G1: 240, G2: 300, G3: 480, G4: 240, G5: 400 }
  },

  POLISH: {
    LF: { G1: 15, G2: 20, G3: 40, G4: 15, G5: 60 }
  },

  FRAME: {
    EA: { G1: 120, G2: 120, G3: 150, G4: 120, G5: 150 }
  }
};

// ======================
// MATERIAL GROUPS
// ======================
export const MATERIAL_GROUPS = {
  MARBLE: "G1",
  TRAVERTINE: "G1",
  LIMESTONE: "G1",
  ONYX: "G1",
  DOLOMITE: "G1",

  GRANITE: "G2",
  SLATE: "G2",
  BASALT: "G2",
  SOAPSTONE: "G2",

  QUARTZITE: "G3",

  QUARTZ: "G4",
  CAESARSTONE: "G4",
  CAMBRIA: "G4",
  SILESTONE: "G4",
  TERRAZZO: "G4",

  DEKTON: "G5",
  NEOLITH: "G5",
  PORCELAIN: "G5",
  LAPITEC: "G5",

  CORIAN: "G6",
  SOLID_SURFACE: "G6",
  LAMINATE: "G6"
};

// ======================
// WORKFLOW
// ======================
export const WORKFLOW = [
  { id: "AGREEMENT", label: "Agreement", days: 0 },
  { id: "MEASURE", label: "Measure Confirmation", days: 3 },
  { id: "SCHEDULING", label: "Scheduling", days: 3 },
  { id: "MATERIAL", label: "Material Order", days: 4 },
  { id: "APPROVAL", label: "Final Approval", days: 3 },

  { id: "CARPENTRY_FAB", label: "Carpentry Fabrication", days: 2.5, module: "CARPENTRY" },
  { id: "CARPENTRY_INSTALL", label: "Carpentry Installation", days: 2.5, module: "CARPENTRY" },

  { id: "STONE_MEASURE", label: "Stone Measure", days: 2, module: "STONE" },
  { id: "STONE_APPROVAL", label: "Stone Approval", days: 3, module: "STONE" },
  { id: "STONE_FAB", label: "Stone Fabrication", days: 3, module: "STONE" },
  { id: "STONE_INSTALL", label: "Stone Installation", days: 3, module: "STONE" },

  { id: "PUNCHOUT", label: "Punchout", days: 2 },
  { id: "CLOSE", label: "Final Payment", days: 0 }
];

// ======================
// MATERIAL OPTIONS
// ======================
export const MATERIAL_OPTIONS = [
  "Granite",
  "Marble",
  "Quartz",
  "Quartzite",
  "Dekton",
  "Porcelain",
  "Travertine",
  "Dolomite",
  "Onyx",
  "Slate",
  "Basalt",
  "Soapstone",
  "Neolith",
  "Lapitec",
  "Corian"
];

// ======================
// HELPERS
// ======================
export function getMaterialGroup(material) {
  if (!material) return "G3";

  const key = material.toString().trim().toUpperCase();
  return MATERIAL_GROUPS[key] || "G3";
}

// ======================
// DEBUG GLOBAL ACCESS
// ======================
window.STATE = STATE;
window.EDGE_FACTORS = EDGE_FACTORS;
