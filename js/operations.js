function generateOperations(project) {

  const baseOps = [
    { Step: "MEASURE", Resource: "MANUAL", PF: 2, Sequence: 1 },
    { Step: "CAD", Resource: "MANUAL", PF: 3, Sequence: 2 },
    { Step: "PROGRAM", Resource: "MANUAL", PF: 2, Sequence: 3 },
    { Step: "CUT", Resource: "BRETON", PF: 10, Sequence: 4 },
    { Step: "POLISH", Resource: "COACH", PF: 8, Sequence: 5 },
    { Step: "INSTALL", Resource: "MANUAL", PF: 6, Sequence: 6 }
  ];

  return baseOps.map(op => ({
    ProjectID: project.ProjectID,
    Step: op.Step,
    Resource: op.Resource,
    PF: op.PF,
    Sequence: op.Sequence,
    DependencyStep: null
  }));
}
