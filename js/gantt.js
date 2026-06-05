import { state } from "./state.js";

export function renderGantt(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  state.projects.forEach(p => {

    const row = document.createElement("div");
    row.style.padding = "10px";
    row.style.borderBottom = "1px solid #333";

    let html = `<strong>${p.name}</strong><br/>`;

    if (p.timeline) {
      p.timeline.forEach(t => {
        html += `
          <div>
            ${t.phase}: ${t.start.toDateString()} → ${t.end.toDateString()}
          </div>
        `;
      });
    }

    row.innerHTML = html;
    container.appendChild(row);
  });
}



function renderGantt() {

  const container = document.getElementById("view-container");

  let html = `<div class="panel"><h2>📊 Resource Gantt</h2>`;

  const byResource = {};

  STATE.schedule.forEach(s => {
    if (!byResource[s.Resource]) byResource[s.Resource] = [];
    byResource[s.Resource].push(s);
  });

  Object.keys(byResource).forEach(r => {

    html += `<h3>${r}</h3>`;

    byResource[r].forEach(task => {
      html += `
        <div style="margin:5px 0; padding:5px; background:#1c2a45;">
          ${task.ProjectID} | ${format(task.Start)} → ${format(task.End)}
        </div>
      `;
    });

  });

  html += `</div>`;
  container.innerHTML = html;
}
