// src/ui/screens/intelligence.screen.js

export async function loadIntelligence(view) {
  if (!view) return;
  view.innerHTML = `
    <div style="padding:24px;color:#94a3b8;">
      <h2 style="margin:0 0 8px;color:#e2e8f0;">Intelligence</h2>
      <p>This module is not yet available.</p>
    </div>
  `;
}
