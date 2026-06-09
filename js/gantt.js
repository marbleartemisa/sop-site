import { STATE } from "./state.js";

/****************************************************
 * 📊 GANTT PRO VIEW
 ****************************************************/
export function renderGantt(projectId) {

  const container = document.getElementById("view-container");

  const tasks = STATE.PROJECT_TASKS
    .filter(t => t.ProjectID === projectId)
    .sort((a, b) => new Date(a.CalculatedStart) - new Date(b.CalculatedStart));

  if (!tasks.length) {
    container.innerHTML = "<p>No schedule generated yet</p>";
    return;
  }

  const minDate = new Date(Math.min(...tasks.map(t => new Date(t.CalculatedStart))));
  const maxDate = new Date(Math.max(...tasks.map(t => new Date(t.CalculatedEnd))));

  const totalHours = (maxDate - minDate) / (1000 * 60 * 60);

  let html = `
    <div class="panel">
      <h2>📊 Gantt - Project ${projectId}</h2>

      <div style="overflow-x:auto;">
        <div style="position:relative; min-width:1000px; border:1px solid #ccc;">
  `;

  tasks.forEach(task => {

    const start = new Date(task.CalculatedStart);
    const end = new Date(task.CalculatedEnd);

    const left = ((start - minDate) / (1000 * 60 * 60)) / totalHours * 100;
    const width = ((end - start) / (1000 * 60 * 60)) / totalHours * 100;

    const color = getStatusColor(task.Status);

    html += `
      <div style="
        position:relative;
        height:40px;
        border-bottom:1px solid #eee;
      ">

        <div style="position:absolute; left:0; width:200px; padding:5px;">
          ${task.Task}
        </div>

        <div style="
          position:absolute;
          left:${left}%;
          width:${width}%;
          height:25px;
          top:7px;
          background:${color};
          border-radius:6px;
          color:white;
          font-size:12px;
          display:flex;
          align-items:center;
          padding-left:6px;
        ">
          ${task.Resource}
        </div>

      </div>
    `;
  });

  html += `
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
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
