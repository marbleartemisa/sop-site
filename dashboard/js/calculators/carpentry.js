import { carpentryTimes } from "../data/carpentry-times.js";

export function calculateCarpentry(input = {}) {

  const complexityFactor =
    input.complexityFactor || 1;

  const projectFactor =
    input.projectFactor || 1;

  // CNC
  const cnc =
    (input.panels || 0) *
    carpentryTimes.cnc.panel;

  // EDGEBANDING
  const edge =
    carpentryTimes.edgebanding.setup +
    (
      (input.edgeLF || 0) *
      carpentryTimes.edgebanding.lf
    );

  // LAMINATION
  const laminate =
    (input.laminateSqFt || 0) *
    carpentryTimes.laminate.sqft;

  // ASSEMBLY
  const assembly =
      ((input.cabinets || 0) *
       carpentryTimes.assembly.cabinet)

    + ((input.drawers || 0) *
       carpentryTimes.assembly.drawer)

    + ((input.pantry || 0) *
       carpentryTimes.assembly.pantry);

  // HARDWARE
  const hardware =
      ((input.trashcan || 0) *
       carpentryTimes.hardware.trashcan)

    + ((input.lazySusan || 0) *
       carpentryTimes.hardware.lazySusan)

    + ((input.lemans || 0) *
       carpentryTimes.hardware.lemans);

  // POCKET SYSTEMS
  const pocket =
      ((input.pocketCabinet || 0) *
       carpentryTimes.pocket.cabinet)

    + ((input.pocketPantry || 0) *
       carpentryTimes.pocket.pantry);

  // QC
  const qc =
      ((input.cabinets || 0) *
       carpentryTimes.qc.cabinet)

    + ((input.pantry || 0) *
       carpentryTimes.qc.pantry)

    + carpentryTimes.qc.project;

  const subtotal =
      cnc
    + edge
    + laminate
    + assembly
    + hardware
    + pocket
    + qc;

  const totalMinutes =
      subtotal
      * complexityFactor
      * projectFactor;

  return {

    cnc,
    edge,
    laminate,
    assembly,
    hardware,
    pocket,
    qc,

    subtotal,

    complexityFactor,
    projectFactor,

    totalMinutes,

    totalHours:
      +(totalMinutes / 60).toFixed(2)
  };
}
