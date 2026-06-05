let TIMELINE_DATA = [];

async function loadTimeline() {
  TIMELINE_DATA = await fetch(API + "?action=timeline");
  renderTimeline(TIMELINE_DATA);
}
