const CHANGE_TIME = 30000;

let sops = [];
let currentIndex = 0;

const viewer = document.getElementById("viewer");
const sopTitle = document.getElementById("sopTitle");
const counter = document.getElementById("counter");

async function loadIndex(){

    try{

        const response =
            await fetch("../SOP_INDEX.json");

        sops = await response.json();

        if(!sops.length){

            sopTitle.textContent =
                "No se encontraron SOPs";

            return;
        }

        showCurrentSOP();

        setInterval(() => {

            currentIndex++;

            if(currentIndex >= sops.length){
                currentIndex = 0;
            }

            showCurrentSOP();

        }, CHANGE_TIME);

    }
    catch(error){

        console.error(error);

        sopTitle.textContent =
            "Error cargando SOP_INDEX";
    }
}

function showCurrentSOP(){

    const sop = sops[currentIndex];

    sopTitle.textContent =
        sop.title;

    counter.textContent =
        `SOP ${currentIndex + 1} / ${sops.length}`;

    viewer.src = "../" + sop.url;
}

loadIndex();
