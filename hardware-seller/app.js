const API = "https://script.google.com/macros/s/AKfycbzY1yMs1NX3IlkIXI1iKjRvZvaCxIJUFAxR5R47xkN6Cc4zMD2IuVGFbM0mjGzO1DMt8w/exec?type=full";

let DB = [];

async function loadData(){
  const res = await fetch(API);
  DB = await res.json();
  renderSidebar();
}

function renderSidebar(){

  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  const grouped = groupBy(DB, "category");

  Object.keys(grouped).forEach(cat=>{

    const group = document.createElement("div");
    group.className = "group";

    group.innerHTML = `<div class="group-title">${cat}</div>`;

    grouped[cat].forEach(item=>{

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = item.name;

      div.onclick = () => renderDetail(item);

      group.appendChild(div);
    });

    sidebar.appendChild(group);
  });
}

function renderDetail(item){

  const detail = document.getElementById("detail");

  detail.innerHTML = `
    <div class="card">

      <h1>${item.name}</h1>
      <p>${item.description || ""}</p>

      <h3>Compatible</h3>
      <div class="tags">
        ${(item.compatible || []).map(c=>`<div class="tag">${c}</div>`).join("")}
      </div>

      <h3>Requirements</h3>
      <ul>
        ${(item.requirements || []).map(r=>`<li>${r}</li>`).join("")}
      </ul>

      <h3>Warnings</h3>
      <ul>
        ${(item.warnings || []).map(w=>`<li>${w}</li>`).join("")}
      </ul>

      <h3>Vendor</h3>
      <p>${item.specs?.vendor || ""}</p>

      <h3>Cost</h3>
      <p>${item.specs?.cost || ""}</p>

    </div>
  `;
}

function groupBy(arr, key){
  return arr.reduce((acc,obj)=>{
    (acc[obj[key]] = acc[obj[key]] || []).push(obj);
    return acc;
  }, {});
}

loadData();
