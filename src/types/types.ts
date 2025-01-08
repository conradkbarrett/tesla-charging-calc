export type TeslaModel = 'Model 3' | 'Model Y' | 'Model S' | 'Model X';
export type ChargerType = 'Mobile Charger' | 'Wall Charger' | 'Super Charger';

export interface ChargingData {
  batteryCapacity: number; // in kWh
  chargingRates: {
    [key in ChargerType]: number; // in kW
  };
} 