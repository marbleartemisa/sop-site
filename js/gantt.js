import { STATE } from "./state.js";

/****************************************************
 * 📊 GANTT SAP LEVEL (READ ONLY ENGINE)
 ****************************************************/
export function renderGantt(projectId, zoom = "day") {

  const container = document.getElementById("view-container");

  const tasks = STATE.PROJECT_TASKS
    .filter(t => t.ProjectID === projectId)
    .filter(t => t.CalculatedStart && t.CalculatedEnd);

  if (!tasks.length) {
    container.innerHTML = "<div class='panel'>No schedule generated</div>";
    return;
  }

  const parsed = tasks.map(t => ({
    ...t,
    start: new Date(t.CalculatedStart),
    end: new Date(t.CalculatedEnd)
  }));

  const min = new Date(Math.min(...parsed.map(t => t.start)));
  const max = new Date(Math.max(...parsed.map(t => t.end)));

  const lanes = groupByResource(parsed);

  const scale = getScale(zoom);

  let html = `
    <div class="panel">
      <h2>📊 SAP Gantt - Project ${projectId}</h2>

      <div style="margin-bottom:10px;">
        <button onclick="setZoom('day')">Day</button>
        <button onclick="setZoom('week')">Week</button>
        <button onclick="setZoom('month')">Month</button>
      </div>

      <div style="overflow:auto; border:1px solid #ccc;">
        <div style="min-width:1200px;">
  `;

  // HEADER TIMELINE
  html += renderTimeline(min, max, scale);

  // LANES
  Object.entries(lanes).forEach(([resource, items]) => {

    html += `
      <div style="border-top:1px solid #eee; position:relative;">
        <div style="width:180px; display:inline-block; font-weight:bold;">
          ${resource}
        </div>

        <div style="position:relative; display:inline-block; width:100%;">
    `;

    items.forEach(task => {

      const left = timeToPx(task.start, min, scale);
      const width = timeToPx(task.end, min, scale) - left;

      const color = getStatusColor(task.Status);

      const isCritical = task.isCritical;

      html += `
        <div title="${task.Task}"
          style="
            position:absolute;
            left:${left}px;
            width:${width}px;
            height:24px;
            top:5px;
            background:${isCritical ? "#ef4444" : color};
            border-radius:6px;
            color:white;
            font-size:11px;
            display:flex;
            align-items:center;
            padding-left:6px;
            overflow:hidden;
            white-space:nowrap;
          ">
          ${task.Task}
        </div>
      `;
    });

    html += `</div></div>`;
  });

  html += `</div></div></div>`;

  container.innerHTML = html;
}

/****************************************************
 * 🧠 SCALE SYSTEM (DAY / WEEK / MONTH)
 ****************************************************/
function getScale(zoom) {
  switch (zoom) {
    case "week": return 20;
    case "month": return 6;
    default: return 80; // day
  }
}

/****************************************************
 * ⏱ TIME → PX
 ****************************************************/
function timeToPx(date, min, scale) {
  const hours = (date - min) / (1000 * 60 * 60);
  return hours * (scale / 24);
}

/****************************************************
 * 📦 GROUP BY RESOURCE
 ****************************************************/
function groupByResource(tasks) {
  return tasks.reduce((acc, t) => {
    if (!acc[t.Resource]) acc[t.Resource] = [];
    acc[t.Resource].push(t);
    return acc;
  }, {});
}

/****************************************************
 * 🎨 STATUS COLORS
 ****************************************************/
function getStatusColor(status) {
  switch (status) {
    case "DONE": return "#22c55e";
    case "IN_PROGRESS": return "#3b82f6";
    case "BLOCKED": return "#ef4444";
    default: return "#94a3b8";
  }
}

/****************************************************
 * 📅 TIMELINE HEADER
 ****************************************************/
function renderTimeline(min, max, scale) {

  let html = `<div style="display:flex; border-bottom:1px solid #ddd;">`;

  const hours = (max - min) / (1000 * 60 * 60);
  const steps = Math.ceil(hours / 24);

  for (let i = 0; i <= steps; i++) {
    html += `
      <div style="width:${scale}px; font-size:10px;">
        ${i}
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

/****************************************************
 * 🎯 ZOOM CONTROL
 ****************************************************/
window.setZoom = function(zoom) {
  window.currentZoom = zoom;
  window.lastGanttProject && renderGantt(window.lastGanttProject, zoom);
};
