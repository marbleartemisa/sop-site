// =====================================
// ARTEMISA ERP STORE (CLEAN VERSION)
// =====================================

// ---------------------
// SINGLE SOURCE OF TRUTH
// ---------------------
const state = {
  projects: [],
  stages: [],
  carpentryActive: true,
  stoneActive: true
};

// =====================
// STORE CORE API
// =====================
export const store = {

  // GET FULL STATE
  getState() {
    return state;
  },

  // UPDATE STATE (MERGE SAFE)
  setState(partialState) {
    Object.assign(state, partialState);

    console.log(
      "🟢 STORE UPDATED:",
      JSON.parse(JSON.stringify(state))
    );
  },

  // RESET STORE
  reset() {
    state.projects = [];
    state.stages = [];
    state.carpentryActive = true;
    state.stoneActive = true;

    console.log("🔄 STORE RESET");
  }

};
