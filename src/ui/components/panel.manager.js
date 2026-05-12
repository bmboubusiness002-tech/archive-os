// src/ui/core/panel.manager.js

export function renderPanels(config) {
  return `
    <div class="panel-layout">

      <div class="panel-left">
        ${config.left || ""}
      </div>

      <div class="panel-center">
        ${config.center || ""}
      </div>

      <div class="panel-right">
        ${config.right || ""}
      </div>

      <div class="panel-bottom">
        ${config.bottom || ""}
      </div>

    </div>
  `;
}
