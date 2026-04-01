// Toggle menu mobile
function toggleMenu(){ document.querySelector('.menu').classList.toggle('show'); }

// EJEMPLO DE SOP
const SOP_INDEX = [
  {id:1,title:"SOP 001: Seguridad",department:"Producción",url:"#",keywords:"seguridad"},
  {id:2,title:"SOP 002: Calidad",department:"Producción",url:"#",keywords:"calidad"},
  {id:3,title:"SOP 003: Ventas",department:"Comercial",url:"#",keywords:"ventas"}
];

// Renderizar tabla SOP
function renderSOP(){
  const container = document.getElementById("sopContainer");
  let html = `<div class="sop-info">Mostrando <strong>${SOP_INDEX.length}</strong> SOP</div>
  <table class="sop-table">
    <thead><tr><th>Departamento</th><th>Procedimiento SOP</th><th>Acción</th></tr></thead><tbody>`;
  SOP_INDEX.forEach(sop=>{
    html += `<tr>
      <td data-label="Departamento">${sop.department}</td>
      <td data-label="Procedimiento">${sop.title}</td>
      <td data-label="Acción"><a class="sop-btn" href="${sop.url}"><i class="fa-solid fa-eye"></i> Ver</a></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}
renderSOP();

// Placeholder para login modal
function openLogin(role){ alert("Abrir login para " + role); }
