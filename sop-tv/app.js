const TIME_PER_SOP = 30000; // 30 segundos

let sops = [];
let index = 0;

const viewer = document.getElementById("viewer");
const title = document.getElementById("sopTitle");
const info = document.getElementById("sopInfo");
const counter = document.getElementById("counter");
const timer = document.getElementById("timer");
const deptBadge = document.getElementById("deptBadge");
const progressFill = document.getElementById("progressFill");

let countdown = TIME_PER_SOP / 1000;

async function loadSOPs() {

  try {

    const res = await fetch("/sop-site/SOP_INDEX.json?v=" + Date.now());
    sops = await res.json();

    if (!sops.length) {
      title.innerText = "No SOPs encontrados";
      return;
    }

    showSOP();

    setInterval(nextSOP, TIME_PER_SOP);
    setInterval(updateTimer, 1000);

  } catch (err) {

    console.error(err);
    title.innerText = "Error cargando SOP_INDEX.json";

  }

}

function showSOP() {

  const sop = sops[index];

  title.textContent = sop.title;
  info.textContent = sop.department || "";

  if (deptBadge) {
    deptBadge.textContent = sop.department || "";
    updateDepartmentColor(sop.department);
  }

  counter.textContent = `${index + 1} / ${sops.length}`;

  countdown = TIME_PER_SOP / 1000;

  // Reiniciar barra de progreso
  if (progressFill) {
    progressFill.style.transition = "none";
    progressFill.style.width = "0%";

    setTimeout(() => {
      progressFill.style.transition = `width ${TIME_PER_SOP}ms linear`;
      progressFill.style.width = "100%";
    }, 50);
  }

  // Fade elegante
  viewer.style.opacity = "0";

  setTimeout(() => {

    viewer.src = "/sop-site/" + sop.url;

    viewer.onload = () => {
      viewer.style.opacity = "1";
    };

  }, 300);

}

function nextSOP() {

  index++;

  if (index >= sops.length) {
    index = 0;
  }

  showSOP();

}

function updateTimer() {

  countdown--;

  timer.textContent = `Próximo SOP en ${countdown}s`;

  if (countdown <= 0) {
    countdown = TIME_PER_SOP / 1000;
  }

}

function updateDepartmentColor(department) {

  if (!deptBadge) return;

  deptBadge.style.background = "#003366";
  deptBadge.style.color = "white";

  switch ((department || "").toLowerCase()) {

    case "stone":
      deptBadge.style.background = "#fef3c7";
      deptBadge.style.color = "#92400e";
      break;

    case "carpinteria":
      deptBadge.style.background = "#e0f2fe";
      deptBadge.style.color = "#0369a1";
      break;

    case "administracion":
      deptBadge.style.background = "#ede9fe";
      deptBadge.style.color = "#5b21b6";
      break;

    case "comercial":
      deptBadge.style.background = "#dcfce7";
      deptBadge.style.color = "#166534";
      break;

    case "maquinarias":
      deptBadge.style.background = "#fee2e2";
      deptBadge.style.color = "#991b1b";
      break;

    case "vehiculos":
      deptBadge.style.background = "#e5e7eb";
      deptBadge.style.color = "#374151";
      break;

  }

}

loadSOPs();
