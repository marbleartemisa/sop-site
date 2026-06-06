import { STATE } from "./state.js";

/**
 * Render Gantt agrupado por proyectos con timeline
 */
export function renderGantt(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  STATE.projects.forEach(project => {
    const row = document.createElement("div");
    row.style.padding = "10px";
    row.style.borderBottom = "1px solid #333";

    let html = `<strong>${project.name || project.ProjectID}</strong><br/>`;

    if (project.timeline && Array.isArray(project.timeline)) {
      project.timeline.forEach(t => {
        html += `
          <div>
            ${t.phase}: ${formatDate(t.start)} → ${formatDate(t.end)}
          </div>
        `;
      });
    }

    row.innerHTML = html;
    container.appendChild(row);
  });
}


/**
 * Render Gantt agrupado por recursos (load view)
 */
export function renderResourceGantt(containerId = "view-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = `<div class="panel">
    <h2>📊 Resource Gantt</h2>`;

  const byResource = groupByResource(STATE.schedule);

  Object.entries(byResource).forEach(([resource, tasks]) => {
    html += `<h3>${resource}</h3>`;

    tasks.forEach(task => {
      html += `
        <div style="margin:5px 0; padding:5px; background:#1c2a45;">
          ${task.ProjectID} | ${formatDate(task.Start)} → ${formatDate(task.End)}
        </div>
      `;
    });
  });

  html += `</div>`;
  container.innerHTML = html;
}


/* ----------------- helpers ----------------- */

function groupByResource(schedule) {
  return schedule.reduce((acc, item) => {
    if (!acc[item.Resource]) acc[item.Resource] = [];
    acc[item.Resource].push(item);
    return acc;
  }, {});
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
