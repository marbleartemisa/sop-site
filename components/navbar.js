/* =========================
   NAVBAR SYSTEM (FIXED)
========================= */

const Navbar = {
  user: null,

  /* =========================
     LOAD NAVBAR
  ========================= */
  async load() {
    try {
      const res = await fetch('/sop-site/components/navbar.html');
      const html = await res.text();

      const container = document.getElementById('navbar-container');
      if (!container) return;

      container.innerHTML = html;

      this.setup();
      this.initUser();
    } catch (err) {
      console.error('Error cargando navbar:', err);
    }
  },

  /* =========================
     SETUP
  ========================= */
  setup() {
    this.highlightMenu();
    this.setupMobileClose();
  },

  /* =========================
     MOBILE TOGGLE
  ========================= */
  toggleMenu() {
    const container = document.getElementById('navbar-container');
    const menu = container?.querySelector('.menu');
    if (!menu) return;

    menu.classList.toggle('show');
  },

  /* =========================
     DROPDOWN
  ========================= */
  toggleDropdown(btn) {
    const dropdown = btn.closest('.dropdown');
    if (!dropdown) return;

    const container = document.getElementById('navbar-container');

    container.querySelectorAll('.dropdown').forEach(d => {
      if (d !== dropdown) d.classList.remove('open');
    });

    dropdown.classList.toggle('open');
  },

  /* =========================
     CLOSE OUTSIDE CLICK
  ========================= */
  initOutsideClick() {
    document.addEventListener('click', (e) => {
      const container = document.getElementById('navbar-container');

      if (!container.contains(e.target)) return;

      if (!e.target.closest('.dropdown')) {
        container.querySelectorAll('.dropdown.open').forEach(d => {
          d.classList.remove('open');
        });
      }
    });
  },

  /* =========================
     ACTIVE MENU
  ========================= */
  highlightMenu() {
    const container = document.getElementById('navbar-container');
    const path = window.location.pathname;

    container.querySelectorAll('.menu a').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === path);
    });
  },

  /* =========================
     MOBILE CLOSE
  ========================= */
  setupMobileClose() {
    const container = document.getElementById('navbar-container');

    container.querySelectorAll('.menu a').forEach(link => {
      link.addEventListener('click', () => {
        container.querySelector('.menu')?.classList.remove('show');
      });
    });
  },

  /* =========================
     USER SYSTEM (FIX)
  ========================= */
  initUser() {
    const saved = localStorage.getItem('usuario');

    if (!saved) return;

    try {
      const user = JSON.parse(saved);
      this.showUser(user);
    } catch (e) {
      localStorage.removeItem('usuario');
    }
  },

  showUser(user) {
    const container = document.getElementById('navbar-container');

    const userDiv = container.querySelector('#userInfo');
    const userName = container.querySelector('#userName');

    if (!userDiv || !userName) return;

    userName.textContent = user.usuario;
    userDiv.style.display = 'flex';

    this.user = user;
  },

  logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/sop-site/';
  }
};

/* =========================
   GLOBAL BRIDGE (HTML calls)
========================= */

function toggleMenu() {
  Navbar.toggleMenu();
}

function toggleDropdown(btn) {
  Navbar.toggleDropdown(btn);
}

function logout() {
  Navbar.logout();
}

/* =========================
   INIT
========================= */

document.addEventListener('DOMContentLoaded', () => {
  Navbar.load();
});
