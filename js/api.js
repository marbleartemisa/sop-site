/****************************************************
 * 🌐 ERP API LAYER (Google Apps Script Backend)
 ****************************************************/

const API = "https://script.google.com/macros/s/AKfycbzVLUTOzA0gGIfKml7kWBAWIjSE6g473aBDmFCg-cN2UzSG2-VnKElingOTgCSdeIumfg/exec";

/****************************************************
 * POST ACTIONS (CREATE / UPDATE / DELETE)
 ****************************************************/
export async function post(action, project = {}) {

  try {

    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
    body: JSON.stringify({
        action,
        project
      })
    });


    return await res.json();

  } catch (err) {

    console.error("API POST ERROR:", err);

    return {
      success: false,
      error: err.message
    };
  }
}



/****************************************************
 * GET PROJECTS
 ****************************************************/
export async function getProjects() {

  try {

    const res = await fetch(`${API}?action=projects`);
    return await res.json();

  } catch (err) {

    console.error("API GET PROJECTS ERROR:", err);
    return [];
  }
}

/****************************************************
 * GET SCHEDULE
 ****************************************************/
export async function fetchSchedule() {

  try {

    const res = await fetch(`${API}?action=schedule`);
    return await res.json();

  } catch (err) {

    console.error("API GET SCHEDULE ERROR:", err);
    return [];
  }
}

/****************************************************
 * CREATE PROJECT (wrapper limpio)
 ****************************************************/
export async function createProject(project) {
  return post("CREATE_PROJECT", project);
}
