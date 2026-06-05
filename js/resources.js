function renderResources() {

  const container = document.getElementById("view-container");

  let html = `<div class="panel"><h2>⚙️ Resource Load</h2>`;

  const load = {};

  STATE.schedule.forEach(s => {
    if (!load[s.Resource]) load[s.Resource] = 0;
    load[s.Resource] += Number(s.PF);
  });

  Object.keys(load).forEach(r => {
    html += `<p>${r}: ${load[r]} PF</p>`;
  });

  html += "</div>";

  container.innerHTML = html;
}
