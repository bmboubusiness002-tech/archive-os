export class RealRuntimeServices {
  inventoryService() {
    return {
      service: 'inventory-service',
      active: true,
    }
  }

  financeService() {
    return {
      service: 'finance-service',
      active: true,
    }
  }

  repairService() {
    return {
      service: 'repair-service',
      active: true,
    }
  }

  posService() {
    return {
      service: 'pos-service',
      active: true,
    }
  }

  telemetryService() {
    return {
      service: 'telemetry-service',
      active: true,
    }
  }
}

export const realRuntimeServices = new RealRuntimeServices()
