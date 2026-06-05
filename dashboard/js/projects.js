let projects = JSON.parse(localStorage.getItem("projects") || "[]");

function saveProject() {
  const name = document.getElementById("projectName").value;
  const client = document.getElementById("clientName").value;

  if (!name) return;

  const project = {
    id: Date.now(),
    name,
    client,
    created: new Date().toISOString()
  };

  projects.push(project);
  localStorage.setItem("projects", JSON.stringify(projects));

  renderProjects();
}

function renderProjects() {
  const list = document.getElementById("projectList");
  if (!list) return;

  list.innerHTML = "";

  projects.forEach(p => {
    const div = document.createElement("div");
    div.className = "project";

    div.innerHTML = `
      <strong>${p.name}</strong><br>
      <small>${p.client || "No client"}</small>
    `;

    list.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", renderProjects);
