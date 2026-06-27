export function renderGantt(tasks = []) {

  if (!tasks?.length) {
    return `<div class="gantt-empty">No Gantt data</div>`;
  }

  // =========================
  // CLEAN DATA
  // =========================
  const valid = tasks.filter(t =>
    t.CalculatedStart && t.CalculatedEnd
  );

  if (!valid.length) {
    return `<div class="gantt-empty">No schedule calculated</div>`;
  }

  // =========================
  // TIME RANGE
  // =========================
  const allDates = valid.flatMap(t => [
    new Date(t.CalculatedStart),
    new Date(t.CalculatedEnd)
  ]);

  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const totalMs = maxDate - minDate;

  // =========================
  // GROUP BY RESOURCE
  // =========================
  const grouped = {};

  valid.forEach(t => {
    const r = t.Resource || "UNASSIGNED";
    if (!grouped[r]) grouped[r] = [];
    grouped[r].push(t);
  });

  // =========================
  // HEADER SCALE (simple)
  // =========================
  const days = Math.ceil(totalMs / (1000 * 60 * 60 * 24));

  let html = `
    <div class="gantt-pro">

      <div class="gantt-header">
        ${Array.from({ length: days }).map((_, i) => {
          const d = new Date(minDate);
          d.setDate(d.getDate() + i);
          return `<div class="gantt-day">${d.getDate()}</div>`;
        }).join("")}
      </div>

      <div class="gantt-body">
  `;

  // =========================
  // ROWS
  // =========================
  Object.keys(grouped).forEach(resource => {

    const tasks = grouped[resource]
      .sort((a, b) => (a.Sequence || 0) - (b.Sequence || 0));

    html += `
      <div class="gantt-row">

        <div class="gantt-label">
          ${resource}
        </div>

        <div class="gantt-track">
    `;

    tasks.forEach(t => {

      const start = new Date(t.CalculatedStart);
      const end = new Date(t.CalculatedEnd);

      const left = ((start - minDate) / totalMs) * 100;
      const width = ((end - start) / totalMs) * 100;

      html += `
        <div class="gantt-bar"
             title="${t.ProjectID} | ${t.Task || ''}"
             style="left:${left}%; width:${width}%">
          ${t.ProjectID}
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}
