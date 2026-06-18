const DEFAULT_STATE = {
  PROJECTS: [],
  PROJECT_TASKS: [],
  RESOURCES: [
    { id: "CNC", capacity: 1 },
    { id: "BRETON", capacity: 1 },
    { id: "COACH", capacity: 1 },
    { id: "MANUAL", capacity: 1 }
  ],
  schedule: [] // 👈 IMPORTANTE (te faltaba esto)
};

export const EDGE_FACTORS = {
  MITER_45: {
    factor: 1.8,
    label: "Miter 45° (Glue + Recut + Polish)"
  },
  LAMINATED: {
    factor: 2.2,
    label: "Laminated (Build + Recut + Polish)"
  },
  BULLNOSE: {
    factor: 1.3,
    label: "Bullnose (Diarex)"
  },
  HALF_BULLNOSE: {
    factor: 1.35,
    label: "Half Bullnose (Diarex)"
  },
  FULL_BULLNOSE: {
    factor: 1.4,
    label: "Full Bullnose (Diarex)"
  },
  OGEE: {
    factor: 1.6,
    label: "Ogee (Diarex complex)"
  }
};

export const STATE = structuredClone(DEFAULT_STATE);

let isLoaded = false;

// ======================
// LOAD STATE
// ======================
export function loadState() {
  const saved = localStorage.getItem("STATE");

  if (saved) {
    const parsed = JSON.parse(saved);

    STATE.PROJECTS = parsed.PROJECTS || [];
    STATE.PROJECT_TASKS = parsed.PROJECT_TASKS || [];
    STATE.RESOURCES = parsed.RESOURCES || [];
  }

  isLoaded = true;
  return STATE;
}

// ======================
// SAVE STATE
// ======================
function saveState() {
  localStorage.setItem("STATE", JSON.stringify(STATE));
}

// ======================
// SETTERS
// ======================
export function setProjects(projects) {
  STATE.PROJECTS = projects;
  saveState();
}

export function setProjectTasks(tasks) {
  STATE.PROJECT_TASKS = tasks;
  saveState();
}

export function setResources(resources) {
  STATE.RESOURCES = resources;
  saveState();
}

// ======================
// GETTERS (IMPORTANTE PARA SCHEDULER)
// ======================
export function getProjectTasks() {
  return STATE.PROJECT_TASKS;
}

export function getProjects() {
  return STATE.PROJECTS;
}

export function getResources() {
  return STATE.RESOURCES;
}

export const PRODUCTION_TIME_MATRIX = {
  CUT_CNC: {
    LF: {
      G1: 0.8,
      G2: 1.2,
      G3: 3.0,
      G4: 1.0,
      G5: 4.0
    },
    COACH: {
      G1: 1.5,
      G2: 2.5,
      G3: 5.0,
      G4: 2.0,
      G5: 6.5
    }
  },

  CUTOUTS: {
    EA: {
      UNDERMOUNT: {
        G1: 45,
        G2: 60,
        G3: 120,
        G4: 50,
        G5: 150
      },
      FAUCET: {
        G1: 5,
        G2: 8,
        G3: 20,
        G4: 7,
        G5: 15
      }
    }
  },

  EDGES: {
    LF: {
      G1: 10,
      G2: 15,
      G3: 30,
      G4: 12,
      G5: 45
    }
  },

  SINK: {
    EA: {
      G1: 240,
      G2: 300,
      G3: 480,
      G4: 240,
      G5: 400
    }
  },

  POLISH: {
    LF: {
      G1: 15,
      G2: 20,
      G3: 40,
      G4: 15,
      G5: 60
    }
  },

  FRAME: {
    EA: {
      G1: 120,
      G2: 120,
      G3: 150,
      G4: 120,
      G5: 150
    }
  }
};

// ======================
// INIT
// ======================
loadState();


// DEBUG GLOBAL ACCESS (solo dev)
window.STATE = STATE;
window.EDGE_FACTORS = EDGE_FACTORS;
