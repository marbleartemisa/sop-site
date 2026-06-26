import { carpentryTimes } from "../data/carpentry-times.js";

// =========================
// LEVEL FACTOR
// =========================
const carpentryLevelFactor = {
  1: 0.85,
  2: 0.95,
  3: 1.0,
  4: 1.25,
  5: 1.5
};

// =========================
// MAIN CALCULATOR
// =========================
export function calculateCarpentry(input = {}) {

  const level = Number(input.level || 3);
  const factor = carpentryLevelFactor[level] || 1;

  // =========================
  // CNC
  // =========================
  const cnc =
    (input.panels || 0) * carpentryTimes.cnc.panel;

  // =========================
  // EDGEBANDING (CORRECTO)
  // =========================
  const edgeSetup =
    carpentryTimes.edgebanding.setup;

  const edgeProduction =
    (input.edgeLF || 0) * carpentryTimes.edgebanding.lf;

  const edgeQC =
    carpentryTimes.edgebanding.qc;

  const edge =
    edgeSetup + edgeProduction + edgeQC;

  // =========================
  // LAMINATE
  // =========================
  const laminate =
    (input.laminateSqFt || 0) * carpentryTimes.laminate.sqft;

  // PAINT

      const paint =
          (input.paintSqFt || 0)
          * carpentryTimes.paint.sqft;
      
      // GLASS
      
      const glass =
          (input.glassSqFt || 0)
          * carpentryTimes.glass.sqft;
      
      // LED LIGHTING
      
      const lighting =
          (input.lightingLF || 0)
          * carpentryTimes.lighting.lf;
  // =========================
  // ASSEMBLY
  // =========================
  const assembly =
    (input.cabinets || 0) * carpentryTimes.assembly.cabinet +
    (input.drawers || 0) * carpentryTimes.assembly.drawer +
    (input.pantry || 0) * carpentryTimes.assembly.pantry;

  // =========================
  // HARDWARE
  // =========================
  const hardware =
    (input.trashcan || 0) * carpentryTimes.hardware.trashcan +
    (input.lazySusan || 0) * carpentryTimes.hardware.lazySusan +
    (input.lemans || 0) * carpentryTimes.hardware.lemans;

  // =========================
  // POCKET
  // =========================
  const pocket =
    (input.pocketCabinet || 0) * carpentryTimes.pocket.cabinet +
    (input.pocketPantry || 0) * carpentryTimes.pocket.pantry;

  // =========================
  // QC GLOBAL
  // =========================
  const qc =
    (input.cabinets || 0) * carpentryTimes.qc.cabinet +
    (input.pantry || 0) * carpentryTimes.qc.pantry +
    carpentryTimes.qc.project;

  // =========================
  // TOTAL
  // =========================
  const baseTotal =
    cnc +
    edge +
    laminate +
    paint +
    glass +
    lighting +
    assembly +
    hardware +
    pocket +
    qc;
  
  const totalMinutes =
    baseTotal * factor;

  return {
    level,
    factor,

    cnc,

    edgeSetup,
    edgeProduction,
    edgeQC,
    edge,

    
    laminate,
    paint,
    glass,
    lighting,
    assembly,
    
    hardware,
    pocket,
    qc,

    baseTotal,
    totalMinutes,
    totalHours: +(totalMinutes / 60).toFixed(2)
  };
}
