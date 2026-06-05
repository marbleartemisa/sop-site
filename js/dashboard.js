function loadData() {
  fetch(API_URL)
    .then(r => r.json())
    .then(data => {
      renderDashboard(data);
    });
}

function renderDashboard(data) {
  // breton queue
  // manual queue
  // all schedule
}
