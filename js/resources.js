import { STATE } from "./state.js";

function renderResources() {
  const container = document.getElementById("view-container");

  const load = STATE.schedule.reduce((acc, s) => {
    acc[s.Resource] = (acc[s.Resource] || 0) + Number(s.PF);
    return acc;
  }, {});

  let html = `<div class="panel"><h2>⚙️ Resource Load</h2>`;

  Object.entries(load).forEach(([r, val]) => {
    html += `<p>${r}: ${val} PF</p>`;
  });

  html += `</div>`;
  container.innerHTML = html;
}
