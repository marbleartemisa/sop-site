let TIMELINE_DATA = [];

async function loadTimeline() {
  TIMELINE_DATA = await fetch(API + "?action=timeline");
  renderTimeline(TIMELINE_DATA);
}
function renderTimeline(data) {

  const container = document.getElementById("timeline");

  let html = "";

  const grouped = groupByResource(data);

  Object.keys(grouped).forEach(resource => {

    html += `<h3>${resource}</h3><div class="lane">`;

    grouped[resource].forEach(item => {

      html += `
        <div class="bar">
          ${item.ProjectID}
          <small>${format(item.Start)} → ${format(item.End)}</small>
        </div>
      `;
    });

    html += `</div>`;
  });

  container.innerHTML = html;
}
