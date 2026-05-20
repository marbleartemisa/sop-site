/* =========================
   NAVBAR LOADER
========================= */

async function loadNavbar() {
  try {
    const res = await fetch('/sop-site/components/navbar.html');
    const html = await res.text();

    const container = document.getElementById('navbar-container');
    if (!container) return;

    container.innerHTML = html;

    setupNavbar();
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
   MOBILE MENU TOGGLE
========================= */

function toggleMenu() {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  menu.classList.toggle('show');
}

/* =========================
   DROPDOWN TOGGLE
========================= */

function toggleDropdown(btn) {
  const dropdown = btn.closest('.dropdown');
  if (!dropdown) return;

  // Cerrar otros dropdowns
  document.querySelectorAll('.dropdown').forEach(d => {
    if (d !== dropdown) d.classList.remove('open');
  });

  dropdown.classList.toggle('open');
}

/* =========================
   CLOSE DROPDOWNS OUTSIDE CLICK
========================= */

document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown.open').forEach(d => {
      d.classList.remove('open');
    });
  }
});

/* =========================
   HIGHLIGHT ACTIVE LINK
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
   CLOSE MENU (MOBILE)
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
   INIT
========================= */

document.addEventListener('DOMContentLoaded', loadNavbar);
