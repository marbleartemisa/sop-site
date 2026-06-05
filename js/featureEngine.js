export function generateOperations(project) {

  const ops = [];

  // BASE CUT
  ops.push({
    step: "CUT",
    time: project.Ft2 * getCutRate(project.CutMethod)
  });

  // EDGE NORMAL
  const edgeFactor = getEdgeFactor(project.features);
  ops.push({
    step: "EDGE_FINISH",
    time: project.LinearFeet * edgeFactor
  });

  // ISLAND
  if (project.features.island) {
    ops.push({
      step: "ISLAND_PROCESS",
      time: project.Ft2 * 0.15
    });
  }

  // WATERFALL
  if (project.features.waterfall) {
    ops.push({
      step: "WATERFALL_PROCESS",
      time: project.LinearFeet * 0.6
    });
  }

  // BACKSPLASH
  if (project.features.backsplash_full) {
    ops.push({
      step: "BACKSPLASH",
      time: project.LinearFeet * 0.25
    });
  }

  // METAL FRAME
  if (project.features.metal_frame) {
    ops.push({
      step: "FRAME",
      time: project.Ft2 * 0.3
    });
  }

  // LED
  if (project.features.led_integration) {
    ops.push({
      step: "LED_PREP",
      time: project.LinearFeet * 0.2
    });
  }

  return ops;
}
