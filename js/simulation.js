export function simulateProject(p) {

  const levelFactor = {
    1: 1.0,
    2: 1.3,
    3: 1.7
  }[p.level] || 1;

  const edgeFactor = {
    simple: 1.0,
    45: 1.2,
    laminated: 1.3,
    bullnose: 1.8,
    ogee: 1.8
  }[p.edgeType] || 1;

  const cutTime = p.ft2 * 0.08;
  const fabTime = p.pieces * 0.5;
  const edgeTime = p.edgeFt * 0.15 * edgeFactor;
  const cutoutTime = p.cutouts * 0.6;
  const slabTime = p.slabs * 0.4;

  const total =
    (cutTime + fabTime + edgeTime + cutoutTime + slabTime) * levelFactor;

  return {
    cutTime,
    fabTime,
    edgeTime,
    cutoutTime,
    slabTime,
    totalHours: total
  };
}
