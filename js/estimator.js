/****************************************************
 * 🧠 ESTIMATOR ENGINE - ARTEMISA ERP
 ****************************************************/

export function estimateProject(project) {

  let baseFt2 = Number(project.Ft2 || 0);

  let materialFactor = getMaterialFactor(project.Material);
  let complexityFactor = getComplexity(project);
  let pieceFactor = getPieceFactor(project);

  let cutRate = getCutRate(project.CutMethod || "BRETON");

  let cutTime =
    baseFt2 *
    cutRate *
    materialFactor *
    complexityFactor *
    pieceFactor;

  let fabTime =
    baseFt2 *
    0.45 *
    materialFactor *
    complexityFactor;

  return {
    cutTime,
    fabTime,
    total: cutTime + fabTime
  };
}


/****************************************************
 * 🔧 HELPERS (VAN AQUÍ)
 ****************************************************/

function getMaterialFactor(m) {
  switch (m) {
    case "Quartzite": return 1.4;
    case "Dekton": return 1.7;
    case "Marble": return 1.2;
    case "Granite": return 1.0;
    default: return 1.0;
  }
}

function getCutRate(method) {
  switch (method) {
    case "BRETON": return 0.18;
    case "COACH": return 0.35;
    case "MANUAL": return 0.45;
    default: return 0.25;
  }
}

function getComplexity(project) {
  if (project.Complexity === "HIGH") return 1.5;
  if (project.Complexity === "MED") return 1.2;
  return 1.0;
}

function getPieceFactor(project) {
  const pieces = project.Pieces || 1;
  return 1 + (pieces - 1) * 0.02;
}
