function simulateMove(projectId, newStartDate) {

  const clone = structuredClone(STATE.schedule);

  let projectOps = clone.filter(p => p.ProjectID === projectId);

  let offset = new Date(newStartDate) - new Date(projectOps[0].Start);

  projectOps.forEach(op => {

    op.Start = new Date(new Date(op.Start).getTime() + offset);
    op.End = new Date(new Date(op.End).getTime() + offset);

  });

  return clone;
}
