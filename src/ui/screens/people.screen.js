// src/ui/screens/people.screen.js

import { renderCustomers } from "../../modules/customers/customers.screen.js";

export async function loadPeople(view) {
  if (!view) return;

  view.innerHTML = `<div id="people-root"></div>`;

  return renderCustomers(document.getElementById("people-root"));
}
