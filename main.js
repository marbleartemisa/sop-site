// ===== GLOBAL USER =====
let CURRENT_USER = null; // objeto con {usuario, rol, dept, correo}

// ===== USUARIOS =====
const usuarios = [
  {usuario:"Damian Molina", clave:"Dam1975", rol:"editor", dept:"produccion", correo:"damian@artemisa.com"},
  {usuario:"Carlos Herrera", clave:"Art2026", rol:"admin", dept:"administracion", correo:"carlos@artemisa.com"}
];

// ===== LOGIN =====
let loginType = "editor"; // admin / editor

function openLogin(type) {
  loginType = type;
  document.getElementById("loginModal").style.display = "flex";
  loadUsuarios();
}

function closeLogin() {
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("loginPass").value = "";
  document.getElementById("loginError").style.display = "none";
}

function loadUsuarios() {
  const select = document.getElementById("loginUser");
  select.innerHTML = '<option value="">Seleccione usuario</option>';
  usuarios.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.usuario;
    opt.textContent = u.usuario;
    select.appendChild(opt);
  });
}

function doLogin() {
  const usuario = document.getElementById("loginUser").value.trim();
  const clave = document.getElementById("loginPass").value.trim();
  const errorMsg = document.getElementById("loginError");

  errorMsg.style.display = "none";

  if(!usuario || !clave) {
    errorMsg.innerText = "Seleccione usuario e ingrese la clave";
    errorMsg.style.display = "block";
    return;
  }

  const match = usuarios.find(u => u.usuario===usuario && u.clave===clave);
  if(!match) { errorMsg.innerText="Usuario o clave incorrectos"; errorMsg.style.display="block"; return; }
  if(loginType==="admin" && match.rol!=="admin") { errorMsg.innerText="No autorizado para Admin"; errorMsg.style.display="block"; return; }
  if(loginType==="editor" && match.rol!=="editor") { errorMsg.innerText="No autorizado para Editar SOP"; errorMsg.style.display="block"; return; }

  CURRENT_USER = match;
  localStorage.setItem("CURRENT_USER", JSON.stringify(CURRENT_USER));
  closeLogin();

  document.querySelector(".navbar").insertAdjacentHTML("beforeend",
    `<span style="color:#00ffff;margin-left:15px;">Usuario: ${CURRENT_USER.usuario}</span>`);

  // redirigir según rol
  if(match.rol==="admin") window.location.href="/sop-site/admin/";
  else window.location.href="/sop-site/sop-viewer-edit/";
}

document.getElementById("loginBtn").addEventListener("click", doLogin);
document.getElementById("loginPass").addEventListener("keypress", e=>{ if(e.key==="Enter") doLogin(); });

// ===== MANDAR LOGIN AL ENTRAR =====
window.addEventListener("load", ()=>{
  const savedUser = localStorage.getItem("CURRENT_USER");
  if(savedUser) {
    CURRENT_USER = JSON.parse(savedUser);
    document.querySelector(".navbar").insertAdjacentHTML("beforeend",
      `<span style="color:#00ffff;margin-left:15px;">Usuario: ${CURRENT_USER.usuario}</span>`);
  } else {
    openLogin("editor"); // Login obligatorio al entrar
  }
});