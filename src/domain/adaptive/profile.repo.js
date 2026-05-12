// -------------------------------------
// USER ADAPTIVE PROFILE REPO
// -------------------------------------

import { BaseRepo } from "../../infra/repos/base.repo.js";

export class ProfileRepo extends BaseRepo {
  constructor() {
    super("adaptive_profile");
  }

  async getProfile(db) {
    const p = await this.getById(db, "main");
    return p || null;
  }

  async saveProfile(db, profile) {
    return this.put(db, {
      id: "main",
      ...profile,
      updatedAt: Date.now()
    });
  }
}
