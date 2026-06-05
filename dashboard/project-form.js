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
