/****************************************************
 * 🧠 PROJECT CONFIGURATOR (LIVE)
 ****************************************************/

function renderProjectConfigurator() {

  const container = document.getElementById("view-container");

  container.innerHTML = `
    <div class="panel">
      <h2>🧠 Project Configurator</h2>

      <label>Room Type</label>
      <select id="roomType">
        <option>Kitchen</option>
        <option>Bathroom</option>
        <option>Vanity</option>
      </select>

      <label>Complexity</label>
      <select id="complexity">
        <option value="SIMPLE">Simple</option>
        <option value="STANDARD" selected>Standard</option>
        <option value="COMPLEX">Complex</option>
      </select>

      <label>Ft²</label>
      <input type="number" id="ft2" value="100" />

      <h3>Features</h3>

      <label><input type="checkbox" id="island"> Island</label><br>
      <label><input type="checkbox" id="waterfall"> Waterfall</label><br>
      <label><input type="checkbox" id="backsplash"> Full Backsplash</label><br>
      <label><input type="checkbox" id="led"> LED Integration</label><br>
      <label><input type="checkbox" id="frame"> Metal Frame</label><br>

      <hr>

      <h3>📊 Live Estimation</h3>

      <div id="liveResult">
        Loading...
      </div>

      <button onclick="submitProject()">🚀 Create Project</button>
    </div>
  `;

  attachLiveListeners();
  updateLiveEstimate();
}

function attachLiveListeners() {

  const inputs = document.querySelectorAll(
    "#roomType, #complexity, #ft2, #island, #waterfall, #backsplash, #led, #frame"
  );

  inputs.forEach(i => {
    i.addEventListener("input", updateLiveEstimate);
    i.addEventListener("change", updateLiveEstimate);
  });
}

function updateLiveEstimate() {

  const project = readForm();

  const ops = generateOperationsFromUI(project);

  const totalTime = ops.reduce((sum, op) => sum + op.time, 0);

  document.getElementById("liveResult").innerHTML = `
    ⏱ Total Time: <b>${totalTime.toFixed(2)} hours</b><br>
    🧱 Operations: <b>${ops.length}</b><br>
    🏭 Room: <b>${project.roomType}</b>
  `;
}

function readForm() {

  return {
    roomType: document.getElementById("roomType").value,
    complexity: document.getElementById("complexity").value,
    Ft2: Number(document.getElementById("ft2").value),

    features: {
      island: document.getElementById("island").checked,
      waterfall: document.getElementById("waterfall").checked,
      backsplash_full: document.getElementById("backsplash").checked,
      led: document.getElementById("led").checked,
      frame: document.getElementById("frame").checked
    }
  };
}

function generateOperationsFromUI(p) {

  let ops = [];

  // BASE CUT
  ops.push({
    step: "CUT",
    time: p.Ft2 * 0.2
  });

  // COMPLEXITY
  let complexityFactor =
    p.complexity === "COMPLEX" ? 1.5 :
    p.complexity === "STANDARD" ? 1.2 : 1.0;

  // ISLAND
  if (p.features.island) {
    ops.push({
      step: "ISLAND",
      time: p.Ft2 * 0.15 * complexityFactor
    });
  }

  // WATERFALL
  if (p.features.waterfall) {
    ops.push({
      step: "WATERFALL",
      time: p.Ft2 * 0.25
    });
  }

  // BACKSPLASH
  if (p.features.backsplash_full) {
    ops.push({
      step: "BACKSPLASH",
      time: p.Ft2 * 0.1
    });
  }

  // LED
  if (p.features.led) {
    ops.push({
      step: "LED",
      time: p.Ft2 * 0.05
    });
  }

  // FRAME
  if (p.features.frame) {
    ops.push({
      step: "FRAME",
      time: p.Ft2 * 0.3
    });
  }

  return ops;
}
async function updateLiveEstimate() {

  const project = readForm();
  const ops = generateOperationsFromUI(project);

  const schedule = await getSchedule(); // backend actual

  const simulation = simulateResourceLoad(schedule, ops);

  const totalTime = ops.reduce((a, b) => a + b.time, 0);

  document.getElementById("liveResult").innerHTML = `
    ⏱ Total Time: <b>${totalTime.toFixed(2)} hrs</b><br>
    🧱 Operations: <b>${ops.length}</b><br>
    <hr>
    ${renderSimulationHTML(simulation.simulation)}
  `;
}
async function submitProject() {

  const project = readForm();
  const ops = generateOperationsFromUI(project);

  const payload = {
    action: "CREATE_PROJECT",
    data: {
      ProjectID: "P-" + Date.now(),
      Customer: "MANUAL",
      Status: "READY",
      Ft2: project.Ft2,
      Material: "DEFAULT",
      ReadyDate: new Date(),

      features: project.features,
      operations: ops
    }
  };

  await post(API, payload);

  alert("Project created!");
}
