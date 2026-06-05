function estimateProject(project) {

  let baseFt2 = Number(project.Ft2 || 0);

  let materialFactor = getMaterialFactor(project.Material);
  let complexityFactor = getComplexity(project);
  let pieceFactor = getPieceFactor(project);

  // CUT
  let cutRate = getCutRate(project.CutMethod);

  let cutTime =
    baseFt2 *
    cutRate *
    materialFactor *
    complexityFactor *
    pieceFactor;

  // FAB
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
