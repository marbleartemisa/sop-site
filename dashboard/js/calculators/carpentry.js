import { carpentryTimes } from "../data/carpentry-times.js";

export function calculateCarpentry(input) {

  const f = input.complexityFactor || 1;

  // =========================
  // CNC CUTTING
  // =========================
  const cnc =
    (input.panels || 0) * carpentryTimes.cnc.panel;

  // =========================
  // EDGE BANDING
  // =========================
  const edge =
    carpentryTimes.edgebanding.setup +
    ((input.edgeLF || 0) * carpentryTimes.edgebanding.lf);

  // =========================
  // LAMINATION
  // =========================
  const laminate =
    (input.laminateSqFt || 0) * carpentryTimes.laminate.sqft;

  // =========================
  // ASSEMBLY
  // =========================
  const assembly =
    ((input.cabinets || 0) * carpentryTimes.assembly.cabinet) +
    ((input.drawers || 0) * carpentryTimes.assembly.drawer) +
    ((input.pantry || 0) * carpentryTimes.assembly.pantry);

  // =========================
  // HARDWARE
  // =========================
  const hardware =
    ((input.trashcan || 0) * carpentryTimes.hardware.trashcan) +
    ((input.lazySusan || 0) * carpentryTimes.hardware.lazySusan) +
    ((input.lemans || 0) * carpentryTimes.hardware.lemans);

  // =========================
  // POCKET SYSTEMS
  // =========================
  const pocket =
    ((input.pocketCabinet || 0) * carpentryTimes.pocket.cabinet) +
    ((input.pocketPantry || 0) * carpentryTimes.pocket.pantry);

  // =========================
  // QUALITY CONTROL (QC)
  // =========================
  const qc =
    ((input.cabinets || 0) * carpentryTimes.qc.cabinet) +
    ((input.pantry || 0) * carpentryTimes.qc.pantry) +
    carpentryTimes.qc.project;

  // =========================
  // TOTAL
  // =========================
  const total =
    (cnc + edge + laminate + assembly + hardware + pocket + qc) * f;

  return {
        
          cnc,
          edge,
          laminate,
          assembly,
          hardware,
          pocket,
          qc,
        
          complexityFactor,
          projectFactor,
        
          totalMinutes: total,
          totalHours: +(total / 60).toFixed(2)
        };

}
