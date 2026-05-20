/* =========================
   NAVBAR SYSTEM + AUTH
========================= */

let currentUser = null;

/* =========================
   LOAD NAVBAR HTML
========================= */

async function loadNavbar() {
  try {
    const res = await fetch('/sop-site/components/navbar.html');
    const html = await res.text();

    const container = document.getElementById('navbar-container');
    if (!container) return;

    container.innerHTML = html;

    setupNavbar();
    initUserSession(); // 🔥 control de usuario al cargar navbar

  } catch (err) {
    console.error('Error cargando navbar:', err);
  }
}

/* =========================
   SETUP NAVBAR
========================= */

function setupNavbar() {
  highlightMenu();
  setupMobileClose();
}

/* =========================
   MOBILE MENU
========================= */

function toggleMenu() {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  menu.classList.toggle('show');
}

/* =========================
   DROPDOWN
========================= */

function toggleDropdown(btn) {
  const dropdown = btn.closest('.dropdown');
  if (!dropdown) return;

  document.querySelectorAll('.dropdown').forEach(d => {
    if (d !== dropdown) d.classList.remove('open');
  });

  dropdown.classList.toggle('open');
}

/* =========================
   CLOSE OUTSIDE CLICK
========================= */

document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown.open').forEach(d => {
      d.classList.remove('open');
    });
  }
});

/* =========================
   ACTIVE MENU
========================= */

function highlightMenu() {
  const path = window.location.pathname;

  document.querySelectorAll('.menu a').forEach(link => {
    const href = link.getAttribute('href');

    if (href === path) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* =========================
   CLOSE MOBILE MENU
========================= */

function setupMobileClose() {
  document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.querySelector('.menu');
      if (menu) menu.classList.remove('show');
    });
  });
}

/* =========================
   USER CONTROL SYSTEM
========================= */

/* Mostrar usuario en navbar */
function showUser(user) {
  const userDiv = document.getElementById('userInfo');
  const userName = document.getElementById('userName');

  if (!userDiv || !userName) return;

  userName.textContent = user.usuario;
  userDiv.style.display = 'flex';

  currentUser = user;
}

/* Ocultar usuario */
function hideUser() {
  const userDiv = document.getElementById('userInfo');
  if (userDiv) userDiv.style.display = 'none';

  currentUser = null;
}

/* Guardar sesión */
function setUser(user) {
  currentUser = user;
  localStorage.setItem('usuario', JSON.stringify(user));
  showUser(user);
}

/* Cerrar sesión */
function logout() {
  localStorage.removeItem('usuario');
  hideUser();

  window.location.href = '/sop-site/';
}

/* Inicializar sesión desde localStorage */
function initUserSession() {
  const saved = localStorage.getItem('usuario');

  if (saved) {
    try {
      const user = JSON.parse(saved);
      showUser(user);
    } catch (e) {
      console.warn('Error leyendo usuario guardado');
      localStorage.removeItem('usuario');
    }
  }
}

/* =========================
   INIT
========================= */

document.addEventListener('DOMContentLoaded', loadNavbar);
