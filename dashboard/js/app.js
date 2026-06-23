import { openProjectModal } from "./project-modal.js";

window.openCreateForm = () => {
  openProjectModal();
};

window.refreshData = () => {
  console.log("refresh");
};

window.runScheduler = () => {
  console.log("scheduler");
};
