/* ===== LOAD NAVBAR ===== */

async function loadNavbar(){

  const response = await fetch('/sop-site/components/navbar.html');

  const html = await response.text();

  document.getElementById('navbar-container').innerHTML = html;

  setupNavbar();
}

/* ===== SETUP ===== */

function setupNavbar(){

  highlightMenu();

  setupMobileClose();

}

/* ===== MOBILE MENU ===== */

function toggleMenu(){

  document
    .querySelector('.menu')
    .classList
    .toggle('show');

}

/* ===== DROPDOWN ===== */

function toggleDropdown(btn){

  const dropdown = btn.parentElement;

  document.querySelectorAll('.dropdown').forEach(d=>{

    if(d !== dropdown){
      d.classList.remove('open');
    }

  });

  dropdown.classList.toggle('open');
}

/* ===== CLOSE OUTSIDE ===== */

document.addEventListener('click',function(e){

  if(!e.target.closest('.dropdown')){

    document.querySelectorAll('.dropdown').forEach(d=>{

      d.classList.remove('open');

    });

  }

});

/* ===== ACTIVE LINK ===== */

function highlightMenu(){

  const path = window.location.pathname;

  document.querySelectorAll('.menu a').forEach(link=>{

    const href = link.getAttribute('href');

    if(href === path){

      link.classList.add('active');

    }

  });

}

/* ===== CLOSE MOBILE ===== */

function setupMobileClose(){

  document.querySelectorAll('.menu a').forEach(link=>{

    link.addEventListener('click',()=>{

      document
        .querySelector('.menu')
        .classList
        .remove('show');

    });

  });

}

/* ===== INIT ===== */

document.addEventListener('DOMContentLoaded',loadNavbar);
