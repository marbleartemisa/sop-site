export function calculateCarpentry(data){

  const cnc =
      data.panels * 9;

  const edge =
      data.edgeLF * 0.60;

  const cabinets =
      data.cabinets * 10;

  const drawers =
      data.drawers * 20;

  const pantry =
      data.pantry * 20;

  const total =
      cnc +
      edge +
      cabinets +
      drawers +
      pantry;

  return {

    cnc,
    edge,
    cabinets,
    drawers,
    pantry,
    total

  };

}
