export function renderGantt(schedule = []) {

  if (!schedule.length) {
    return `<div class="gantt-empty">No schedule data</div>`;
  }

  // =========================
  // GROUP BY RESOURCE
  // =========================
  const grouped = {};

  schedule.forEach(item => {

    const key = item.Resource || "UNKNOWN";

    if (!grouped[key]) grouped[key] = [];

    grouped[key].push(item);
  });

  // =========================
  // RENDER
  // =========================
  return Object.keys(grouped).map(resource => {

    const tasks = grouped[resource];

    return `
      <div class="gantt-resource">

        <div class="gantt-resource-title">
          ${resource}
        </div>

        <div class="gantt-bars">

          ${tasks.map(t => {

            const start = new Date(t.Start);
            const end = new Date(t.End);

            const duration =
              Math.max(
                1,
                (end - start) / (1000 * 60 * 60 * 24)
              );

            return `
              <div class="gantt-bar">
                <span class="gantt-label">
                  ${t.ProjectID}
                </span>

                <div class="gantt-timeline">
                  <div class="gantt-fill"
                       style="width:${Math.min(100, duration * 10)}%">
                  </div>
                </div>
              </div>
            `;
          }).join("")}

        </div>

      </div>
    `;

  }).join("");
}
