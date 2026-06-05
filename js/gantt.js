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
