export const TIME_RATES = {

  CARPENTRY: {
    cncCut: 8,              // min per panel
    edgeBand: 0.5,          // min per linear ft
    cabinet: 10,
    drawer: 20,
    pantry: 20,
    trashcan: 25,
    lazySusan: 25,
    lemans: 25,
    pocketPantry: 90,
    pocketCabinet: 60,
    extraCut: 10
  },

  STONE: {
    thicknessFactor: {
      "6mm": 0.8,
      "8mm": 1.0,
      "12mm": 1.2,
      "2cm": 1.5,
      "3cm": 2.0
    }
  }
};

export function calcCarpentryTime(p) {

  const t = TIME_RATES.CARPENTRY;

  return {

    cnc: (p.panels || 0) * t.cncCut,

    edge: (p.edgeFt || 0) * t.edgeBand,

    cabinets: (p.cabinets || 0) * t.cabinet,

    drawers: (p.drawers || 0) * t.drawer,

    pantry: (p.pantry || 0) * t.pantry,

    trashcan: (p.trashcan || 0) * t.trashcan,

    lazySusan: (p.lazySusan || 0) * t.lazySusan,

    lemans: (p.lemans || 0) * t.lemans,

    pocketPantry: (p.pocketPantry || 0) * t.pocketPantry,

    pocketCabinet: (p.pocketCabinet || 0) * t.pocketCabinet

  };
}

export function calcStoneFactor(thickness) {

  return TIME_RATES.STONE.thicknessFactor[thickness] || 1;
}

const stoneFactor = calcStoneFactor(project.Stone?.thickness || "8mm");

const cncTime = panels * 8 * stoneFactor;
const edgeTime = edgeFt * 0.5 * stoneFactor;
