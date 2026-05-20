/* =========================
   NAVBAR SYSTEM (PRODUCTION READY)
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
    this.initOutsideClick();
  },

  /* =========================
     MOBILE MENU TOGGLE
  ========================= */
  toggleMenu() {
    const container = document.getElementById('navbar-container');
    const menu = container?.querySelector('.menu');
    if (!menu) return;

    menu.classList.toggle('show');
  },

  /* =========================
     DROPDOWN TOGGLE
  ========================= */
  toggleDropdown(btn) {
    const container = document.getElementById('navbar-container');
    const dropdown = btn.closest('.dropdown');

    if (!container || !dropdown) return;

    container.querySelectorAll('.dropdown').forEach(d => {
      if (d !== dropdown) d.classList.remove('open');
    });

    dropdown.classList.toggle('open');
  },

  /* =========================
     CLICK OUTSIDE CLOSE
  ========================= */
  initOutsideClick() {
    document.addEventListener('click', (e) => {
      const container = document.getElementById('navbar-container');
      if (!container) return;

      const clickedInside = container.contains(e.target);

      if (!clickedInside) return;

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
    if (!container) return;

    const path = window.location.pathname;

    container.querySelectorAll('.menu a').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === path);
    });
  },

  /* =========================
     MOBILE CLOSE ON CLICK
  ========================= */
  setupMobileClose() {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    container.querySelectorAll('.menu a').forEach(link => {
      link.addEventListener('click', () => {
        container.querySelector('.menu')?.classList.remove('show');
      });
    });
  },

  /* =========================
     USER SYSTEM
  ========================= */
  initUser() {
    const saved = localStorage.getItem('usuario');

    if (!saved) return;

    try {
      const user = JSON.parse(saved);
      this.user = user;
      this.showUser(user);
    } catch (e) {
      localStorage.removeItem('usuario');
    }
  },

  setUser(user) {
    this.user = user;
    localStorage.setItem('usuario', JSON.stringify(user));
    this.showUser(user);
  },

  showUser(user) {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    const userDiv = container.querySelector('#userInfo');
    const userName = container.querySelector('#userName');

    if (!userDiv || !userName) return;

    userName.textContent = user.usuario;
    userDiv.style.display = 'flex';
  },

  hideUser() {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    const userDiv = container.querySelector('#userInfo');

    if (userDiv) userDiv.style.display = 'none';

    this.user = null;
  },

  logout() {
    localStorage.removeItem('usuario');
    this.user = null;
    window.location.href = '/sop-site/';
  }
};

/* =========================
   GLOBAL BRIDGE (HTML ACCESS)
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

/* =========================
   GLOBAL ACCESS
========================= */
window.Navbar = Navbar;
