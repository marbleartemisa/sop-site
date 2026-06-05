function renderProjects() {

  const container = document.getElementById("view-container");

  const grouped = groupByProject(STATE.schedule);

  let html = `<div class="panel">
    <h2>📦 Projects Queue</h2>
    <table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Resource</th>
          <th>Start</th>
          <th>End</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.keys(grouped).forEach(p => {

    grouped[p].forEach(row => {
      html += `
        <tr>
          <td>${row.ProjectID}</td>
          <td>${row.Resource}</td>
          <td>${format(row.Start)}</td>
          <td>${format(row.End)}</td>
        </tr>
      `;
    });

  });

  html += "</tbody></table></div>";

  container.innerHTML = html;
}

function groupByProject(data) {
  const map = {};
  data.forEach(d => {
    if (!map[d.ProjectID]) map[d.ProjectID] = [];
    map[d.ProjectID].push(d);
  });
  return map;
}

function format(date) {
  return new Date(date).toLocaleDateString();
}
