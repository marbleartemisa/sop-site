const sidebar = document.getElementById("sidebar");
const detail = document.getElementById("detail");

/* TEMP DATA (luego lo conectamos a Sheets) */
const data = [
  {
    category:"LAZY SUSAN",
    items:[
      {
        id:"lazy-full",
        name:"Full Circle Lazy Susan",
        description:"Rotating corner system",
        image:"/sop-site/images/lazy-fullcircle.png",
        compatible:["33 corner","36 corner"],
        materials:["Wood","Steel"],
        warnings:["Needs center alignment"]
      }
    ]
  }
];

/* =========================
   RENDER SIDEBAR
========================= */
function renderSidebar(){

  sidebar.innerHTML="";

  data.forEach(group=>{

    const g=document.createElement("div");
    g.className="group";

    g.innerHTML=`
      <div class="group-title">${group.category}</div>
    `;

    group.items.forEach(item=>{

      const el=document.createElement("div");
      el.className="item";
      el.textContent=item.name;

      el.onclick=()=>renderDetail(item);

      g.appendChild(el);
    });

    sidebar.appendChild(g);
  });
}

/* =========================
   DETAIL VIEW
========================= */
function renderDetail(item){

  detail.innerHTML=`
    <div class="card-title">${item.name}</div>
    <p>${item.description}</p>

    <img src="${item.image}" style="max-width:300px">

    <h3>Compatible</h3>
    ${item.compatible.map(c=>`<span class="tag">${c}</span>`).join("")}

    <h3>Materials</h3>
    ${item.materials.map(m=>`<span class="tag">${m}</span>`).join("")}

    <h3>Warnings</h3>
    <ul>
      ${item.warnings.map(w=>`<li>${w}</li>`).join("")}
    </ul>
  `;
}

/* INIT */
renderSidebar();

/* DROPDOWN */
function toggleDropdown(btn){
  btn.parentElement.classList.toggle("open");
}
