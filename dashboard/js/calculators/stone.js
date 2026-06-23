export function calculateStone(data){

  const cut =
      data.slabs * 25;

  const edge =
      data.edgeLF * 2;

  const cutouts =
      data.cutouts * 15;

  const total =
      cut +
      edge +
      cutouts;

  return {

    cut,
    edge,
    cutouts,
    total

  };

}
