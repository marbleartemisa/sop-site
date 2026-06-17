const CHANGE_TIME = 30000;


let sops = [];
let index = 0;

const viewer = document.getElementById("viewer");
const title = document.getElementById("sopTitle");
const info = document.getElementById("sopInfo");
const counter = document.getElementById("counter");
const timer = document.getElementById("timer");

let countdown = TIME_PER_SOP / 1000;

async function loadSOPs(){

  try {

    const res = await fetch("/sop-site/SOP_INDEX.json?v=" + Date.now());
    sops = await res.json();

    if(!sops.length){
      title.innerText = "No SOPs encontrados";
      return;
    }

    showSOP();

    setInterval(nextSOP, TIME_PER_SOP);
    setInterval(updateTimer, 1000);

  } catch(err){
    console.error(err);
    title.innerText = "Error cargando SOP_INDEX.json";
  }
}

function showSOP(){

  const sop = sops[index];

  title.innerText = sop.title;
  info.innerText = sop.department;

  viewer.src = "/sop-site/" + sop.url;

  counter.innerText = `${index+1} / ${sops.length}`;

  countdown = TIME_PER_SOP / 1000;
}

function nextSOP(){

  index++;

  if(index >= sops.length){
    index = 0;
  }

  showSOP();
}

function updateTimer(){
  countdown--;
  timer.innerText = `Siguiente en ${countdown}s`;

  if(countdown <= 0){
    countdown = TIME_PER_SOP / 1000;
  }
}

loadSOPs();
