export function renderGantt(tasks = []) {

  if (!tasks || !tasks.length) {
    return `<div class="gantt-empty">No Gantt data</div>`;
  }

  // =========================
  // CLEAN + FILTER VALID DATA
  // =========================
  const valid = tasks.filter(t =>
    t.CalculatedStart && t.CalculatedEnd
  );

  if (!valid.length) {
    return `<div class="gantt-empty">No calculated schedule</div>`;
  }

  // =========================
  // GROUP BY RESOURCE
  // =========================
  const grouped = {};

  valid.forEach(task => {

    const resource = task.Resource || "UNASSIGNED";

    if (!grouped[resource]) grouped[resource] = [];

    grouped[resource].push(task);
  });

  // =========================
  // GLOBAL TIME RANGE (for scaling)
  // =========================
  const allDates = valid.flatMap(t => [
    new Date(t.CalculatedStart),
    new Date(t.CalculatedEnd)
  ]);

  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));

  const totalMs = maxDate - minDate;

  // =========================
  // RENDER
  // =========================
  let html = `<div class="gantt-container">`;

  Object.keys(grouped).forEach(resource => {

    const tasks = grouped[resource]
      .sort((a, b) => (a.Sequence || 0) - (b.Sequence || 0));

    html += `
      <div class="gantt-resource">
        <div class="gantt-resource-title">${resource}</div>
        <div class="gantt-track">
    `;

    tasks.forEach(t => {

      const start = new Date(t.CalculatedStart);
      const end = new Date(t.CalculatedEnd);

      const left = ((start - minDate) / totalMs) * 100;
      const width = ((end - start) / totalMs) * 100;

      html += `
        <div class="gantt-bar"
             style="left:${left}%; width:${width}%">
          ${t.Task || t.TaskName || t.ProjectID}
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  html += `</div>`;

  return html;
}
