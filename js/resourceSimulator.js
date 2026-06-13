export function simulateResourceLoad(existingSchedule, newOps, startDate = new Date()) {

  const resources = {};

  // 1. construir timeline actual
  existingSchedule.forEach(op => {

    if (!resources[op.Resource]) resources[op.Resource] = [];

    resources[op.Resource].push({
      start: new Date(op.Start),
      end: new Date(op.End)
    });
  });

  // 2. simular nuevo proyecto
  const simulation = [];

  let currentDate = new Date(startDate);

  newOps.forEach(op => {

    const resource = op.Resource;

    if (!resources[resource]) resources[resource] = [];

    const durationDays = op.totalHours / 8;

    const start = findNextFreeSlot(resources[resource], currentDate);
    const end = addDays(start, durationDays);

    // agregar simulación (SIN guardar)
    resources[resource].push({ start, end });

    simulation.push({
      Resource: resource,
      Start: start,
      End: end,
      Step: op.step
    });

    currentDate = end;
  });

  return {
    simulation,
    resources
  };
}

function findNextFreeSlot(calendar, date) {

  let current = new Date(date);

  while (true) {

    const conflict = calendar.find(slot =>
      current >= slot.start && current <= slot.end
    );

    if (!conflict) return current;

    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }
}


function renderResourceSimulation(simulation) {

  const container = document.getElementById("liveResult");

  let html = `<h4>📊 Resource Load Simulation</h4>`;

  const grouped = {};

  simulation.forEach(s => {
    if (!grouped[s.Resource]) grouped[s.Resource] = [];
    grouped[s.Resource].push(s);
  });

  Object.keys(grouped).forEach(r => {

    html += `<b>${r}</b><br>`;

    grouped[r].forEach(s => {
      html += `
        <div style="margin-left:10px">
          ${s.Step}: ${formatDate(s.Start)} → ${formatDate(s.End)}
        </div>
      `;
    });

  });

  container.innerHTML = html;
}
