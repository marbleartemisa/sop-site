const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbzVLUTOzA0gGIfKml7kWBAWIjSE6g473aBDmFCg-cN2UzSG2-VnKElingOTgCSdeIumfg/exec";

export async function fetchSchedule() {

  try {

    const res = await fetch(
      `${BACKEND_URL}?action=schedule`
    );

    const data = await res.json();

    return Array.isArray(data) ? data : [];

  } catch (err) {

    console.error("Schedule fetch error:", err);

    return [];
  }
}
