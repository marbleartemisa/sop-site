const API = "https://script.google.com/macros/s/AKfycbzVLUTOzA0gGIfKml7kWBAWIjSE6g473aBDmFCg-cN2UzSG2-VnKElingOTgCSdeIumfg/exec";

async function post(action, data = {}) {

  const res = await fetch(API, {
    method: "POST",
    body: JSON.stringify({ action, data }),
    headers: { "Content-Type": "application/json" }
  });

  return await res.json();
}

async function getProjects() {
  const res = await fetch(API + "?action=projects");
  return await res.json();
}

async function fetchSchedule() {
  const res = await fetch(API);
  return await res.json();
}
