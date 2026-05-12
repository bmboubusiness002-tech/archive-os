import { BaseRepo } from "../../infra/repos/base.repo.js";

export class DecisionRepo extends BaseRepo {
  constructor() {
    super("decision_logs");
  }
}
