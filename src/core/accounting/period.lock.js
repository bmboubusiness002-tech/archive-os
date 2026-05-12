// -------------------------------------
// AUDIT SERVICE
// -------------------------------------

import { AuditRepo } from "./audit.repo.js";

const repo = new AuditRepo();

export async function logAction(action, data = {}) {
  await repo.log({
    action,
    data
  });
}
