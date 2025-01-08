import { TeslaModel, ChargingData } from '../types/types';

export const teslaChargingData: Record<TeslaModel, ChargingData> = {
  'Model 3': {
    batteryCapacity: 82,
    chargingRates: {
      'Mobile Charger': 7.6,  // Level 1 charging
      'Wall Charger': 11.5,   // Level 2 charging
      'Super Charger': 250    // V3 Supercharging
    }
  },
  'Model Y': {
    batteryCapacity: 75,
    chargingRates: {
      'Mobile Charger': 7.6,
      'Wall Charger': 11.5,
      'Super Charger': 250
    }
  },
  'Model S': {
    batteryCapacity: 100,
    chargingRates: {
      'Mobile Charger': 7.6,
      'Wall Charger': 11.5,
      'Super Charger': 250
    }
  },
  'Model X': {
    batteryCapacity: 100,
    chargingRates: {
      'Mobile Charger': 7.6,
      'Wall Charger': 11.5,
      'Super Charger': 250
    }
  }
};

export const electricityRates = {
  'Mobile Charger': 0.14,    // Average home electricity rate per kWh
  'Wall Charger': 0.14,      // Home electricity rate
  'Super Charger': 0.28      // Tesla Supercharger rate
}; 