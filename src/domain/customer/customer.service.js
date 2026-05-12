import { openDB } from "../../infra/db/db.js";
import { CustomerRepo } from "./customer.repo.js";
import { createCustomer } from "./customer.model.js";

export class CustomerService {
  constructor() {
    this.repo = new CustomerRepo();
  }

  async create(data) {
    const db = await openDB();
    const customer = createCustomer(data);
    await this.repo.put(db, customer);
    return customer;
  }

  async getAll() {
    const db = await openDB();
    return this.repo.getAll(db);
  }
}
