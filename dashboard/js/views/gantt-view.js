export function renderGantt(schedule = []) {

  if (!schedule.length) {
    return `<div class="gantt-empty">No schedule data</div>`;
  }

  // group by project
  const grouped = {};

  schedule.forEach(item => {

    if (!grouped[item.ProjectID]) {
      grouped[item.ProjectID] = [];
    }

    grouped[item.ProjectID].push(item);
  });

  return `
    <div class="gantt-wrapper">

      ${Object.keys(grouped).map(projectId => {

        const tasks = grouped[projectId];

        return `
          <div class="gantt-project">

            <div class="gantt-title">
              ${projectId}
            </div>

            <div class="gantt-bars">

              ${tasks.map(t => `
                <div class="gantt-bar">
                  <span>${t.Resource}</span>
                  <small>
                    ${formatDate(t.Start)} → ${formatDate(t.End)}
                  </small>
                </div>
              `).join("")}

            </div>

          </div>
        `;
      }).join("")}

    </div>
  `;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
