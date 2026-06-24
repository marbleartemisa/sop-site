import { carpentryTimes } from "../data/carpentry-times.js";

export function calculateCarpentry(input, stageFactor = 1) {

  const cnc = input.panels * carpentryTimes.cnc.panel;

  const edge = carpentryTimes.edgebanding.setup +
               (input.edgeLF * carpentryTimes.edgebanding.lf);

  const laminate = input.laminateSqFt * carpentryTimes.laminate.sqft;

  const assembly =
      (input.cabinets * carpentryTimes.assembly.cabinet) +
      (input.drawers * carpentryTimes.assembly.drawer) +
      (input.pantry * carpentryTimes.assembly.pantry);

  const hardware =
      (input.trashcan * carpentryTimes.hardware.trashcan) +
      (input.lazySusan * carpentryTimes.hardware.lazySusan) +
      (input.lemans * carpentryTimes.hardware.lemans);

  const pocket =
      (input.pocketCabinet * carpentryTimes.pocket.cabinet) +
      (input.pocketPantry * carpentryTimes.pocket.pantry);

  const qc =
      (input.cabinets * carpentryTimes.qc.cabinet) +
      (input.pantry * carpentryTimes.qc.pantry) +
      carpentryTimes.qc.project;

  const total =
    (cnc + edge + laminate + assembly + hardware + pocket + qc)
    * stageFactor;

  return {
    cnc,
    edge,
    laminate,
    assembly,
    hardware,
    pocket,
    qc,
    total
  };
}
