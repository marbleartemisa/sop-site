function openProjectModal(project = null) {

  const isEdit = !!project;

  const html = `
    <div class="modal">
      <h2>${isEdit ? "Edit Project" : "New Project"}</h2>

      <input id="p_id" placeholder="Project ID" value="${project?.ProjectID || ""}">
      <input id="p_customer" placeholder="Customer" value="${project?.Customer || ""}">
      <input id="p_priority" placeholder="Priority" value="${project?.Priority || ""}">

      <button onclick="submitProject(${isEdit})">
        Save
      </button>

    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
}

async function pauseProject(id) {
  await post("PAUSE_PROJECT", { projectId: id });
  renderProjectsPanel();
}

function closeModal() {
  document.querySelector(".modal")?.remove();
}

async function deleteProject(id) {
  await post("DELETE_PROJECT", { projectId: id });
  renderProjectsPanel();
}

async function submitProject(isEdit) {

  const data = {
    ProjectID: document.getElementById("p_id").value,
    Customer: document.getElementById("p_customer").value,
    Priority: document.getElementById("p_priority").value
  };

  if (isEdit) {
    await post("UPDATE_PROJECT", data);
  } else {
    await post("CREATE_PROJECT", data);
  }

  closeModal();
renderProjectsPanel();
}
