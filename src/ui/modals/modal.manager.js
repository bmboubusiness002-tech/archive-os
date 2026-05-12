// src/ui/core/modal.manager.js

export function showModal(content) {
  let modal = document.getElementById("modal-root");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-root";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box">
        ${content}
        <button onclick="closeModal()">Close</button>
      </div>
    </div>
  `;
}

window.closeModal = function () {
  const modal = document.getElementById("modal-root");
  if (modal) modal.innerHTML = "";
};
