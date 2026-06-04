
// ===== MENU TOGGLE =====
function toggleMenu(){
  document.querySelector('.menu').classList.toggle('show');
}

// ===== DROPDOWN =====
function toggleDropdown(btn){

  const dropdown = btn.parentElement;

  document.querySelectorAll(".dropdown").forEach(d=>{
    if(d !== dropdown) d.classList.remove("open");
  });

  dropdown.classList.toggle("open");
}

// click outside
document.addEventListener("click", (e)=>{
  if(!e.target.closest(".dropdown")){
    document.querySelectorAll(".dropdown").forEach(d=>{
      d.classList.remove("open");
    });
  }
});

// ===== ACTIVE MENU =====
function destacarMenu(){

  const path = window.location.pathname;

  document.querySelectorAll(".menu a").forEach(a=>{
    const href = new URL(a.href).pathname;
    if(href === path) a.classList.add("active");
  });

  document.querySelectorAll(".dropdown").forEach(drop=>{
    let active = false;

    drop.querySelectorAll("a").forEach(a=>{
      const href = new URL(a.href).pathname;
      if(href === path) active = true;
    });

    if(active){
      drop.querySelector(".drop-btn").classList.add("active");
    }
  });
}

window.addEventListener("DOMContentLoaded", destacarMenu);
