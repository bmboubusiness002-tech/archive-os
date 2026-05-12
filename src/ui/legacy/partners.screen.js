// -------------------------------------
// PARTNERS SCREEN (STABLE + EXTENSIBLE)
// -------------------------------------

function getRoot() {
  return document.getElementById("view") || document.getElementById("app");
}

export async function loadPartners() {
  const root = getRoot();
  if (!root) return;

  try {
    root.innerHTML = `
      <div style="padding:20px;">
        <h2>🤝 Partners</h2>

        <div style="margin-top:10px;opacity:0.7;">
          Suppliers / Clients management coming soon
        </div>

        <div style="margin-top:20px;padding:10px;background:#111;border-radius:8px;">
          💡 Future:
          <ul>
            <li>Suppliers tracking</li>
            <li>Customer history</li>
            <li>Credit system</li>
          </ul>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("❌ loadPartners error:", err);

    root.innerHTML = `
      <div style="color:red;padding:20px;">
        Error loading partners
      </div>
    `;
  }
}
