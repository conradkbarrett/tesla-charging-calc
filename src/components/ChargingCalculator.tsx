import { useState } from 'react';
import { TeslaModel, ChargerType } from '../types/types';
import { teslaChargingData, electricityRates } from '../constants/teslaData';
import { getChargingRatePercentage } from '../constants/chargingCurve';
import { ClockIcon, BoltIcon, CurrencyDollarIcon } from '@heroicons/react/20/solid';

export default function ChargingCalculator() {
  const [selectedModel, setSelectedModel] = useState<TeslaModel>('Model 3');
  const [selectedCharger, setSelectedCharger] = useState<ChargerType>('Wall Charger');
  const [batteryLevel, setBatteryLevel] = useState<number>(20);
  const [targetLevel, setTargetLevel] = useState<number>(80);
  const [customElectricityRate, setCustomElectricityRate] = useState<number>(electricityRates['Wall Charger']);
  const [customChargingRate, setCustomChargingRate] = useState<number>(11.5); // Default Wall Charger rate
  const [result, setResult] = useState<{
    hours: number;
    minutes: number;
    cost: number;
    energyAdded: number;
  } | null>(null);

  const getDefaultChargingRate = (chargerType: ChargerType) => {
    switch (chargerType) {
      case 'Mobile Charger': return 7.6;
      case 'Wall Charger': return 11.5;
      case 'Super Charger': return 250;
      default: return 11.5;
    }
  };

  const handleChargerChange = (chargerType: ChargerType) => {
    setSelectedCharger(chargerType);
    setCustomChargingRate(getDefaultChargingRate(chargerType));
  };

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return { hours, minutes };
  };

  const calculateTaperedChargingTime = (
    batteryCapacity: number,
    maxChargingRate: number,
    startLevel: number,
    targetLevel: number
  ): { minutes: number; energyCharged: number } => {
    const SOC_INCREMENT = 0.5; // Calculate in 0.5% increments
    let totalMinutes = 0;
    
    // Calculate total energy needed once, outside the loop
    const energyCharged = (batteryCapacity * (targetLevel - startLevel)) / 100;
    
    for (let soc = startLevel; soc < targetLevel; soc += SOC_INCREMENT) {
      // Get the charging rate percentage for current SoC
      const ratePercentage = getChargingRatePercentage(soc) / 100;
      const currentChargingRate = maxChargingRate * ratePercentage;
      
      // Calculate time needed for this increment
      const energyIncrement = (batteryCapacity * SOC_INCREMENT) / 100;
      const incrementHours = energyIncrement / currentChargingRate;
      totalMinutes += incrementHours * 60;
    }
    
    return {
      minutes: totalMinutes,
      energyCharged
    };
  };

  const calculateChargingTime = () => {
    const modelData = teslaChargingData[selectedModel];
    if (!modelData) return;

    const batteryCapacity = modelData.batteryCapacity;
    const maxChargingRate = selectedCharger === 'Super Charger' 
      ? modelData.chargingRates[selectedCharger]
      : customChargingRate;
    
    const rate = selectedCharger === 'Super Charger' 
      ? electricityRates['Super Charger']
      : customElectricityRate;

    const { minutes, energyCharged } = calculateTaperedChargingTime(
      batteryCapacity,
      maxChargingRate,
      batteryLevel,
      targetLevel
    );

    const { hours, minutes: mins } = formatTime(minutes);
    const cost = energyCharged * rate;

    setResult({ 
      hours, 
      minutes: mins, 
      cost: parseFloat(cost.toFixed(2)),
      energyAdded: parseFloat(energyCharged.toFixed(1))
    });
  };

  return (
    <div className="calculator-container">
      <h1 className="text-2xl font-semibold mb-6 text-center">Tesla Charging Calculator</h1>
      
      <div className="input-group">
        <label className="label">Select Tesla Model</label>
        <select 
          className="select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as TeslaModel)}
        >
          <option value="Model 3">Model 3</option>
          <option value="Model Y">Model Y</option>
          <option value="Model S">Model S</option>
          <option value="Model X">Model X</option>
        </select>
      </div>

      <div className="input-group">
        <label className="label">Select Charger Type</label>
        <select 
          className="select"
          value={selectedCharger}
          onChange={(e) => handleChargerChange(e.target.value as ChargerType)}
        >
          <option value="Mobile Charger">Mobile Charger</option>
          <option value="Wall Charger">Wall Charger</option>
          <option value="Super Charger">Super Charger</option>
        </select>
      </div>

      {selectedCharger !== 'Super Charger' && (
        <>
          <div className="input-group">
            <label className="label">Charging Rate (kW)</label>
            <input
              type="number"
              className="input"
              value={customChargingRate}
              onChange={(e) => setCustomChargingRate(Number(e.target.value))}
              min="1"
              max={selectedCharger === 'Wall Charger' ? "11.5" : "7.6"}
              step="0.1"
            />
            <p className="text-sm text-gray-400 mt-1">
              {selectedCharger === 'Mobile Charger' 
                ? 'Maximum rate: 7.6 kW' 
                : 'Maximum rate: 11.5 kW'}
            </p>
          </div>

          <div className="input-group">
            <label className="label">Electricity Rate ($ per kWh)</label>
            <input
              type="number"
              className="input"
              value={customElectricityRate}
              onChange={(e) => setCustomElectricityRate(Number(e.target.value))}
              min="0"
              step="0.01"
            />
          </div>
        </>
      )}

      <div className="input-group">
        <label className="label">Current Battery Level (%)</label>
        <input
          type="number"
          className="input"
          value={batteryLevel}
          onChange={(e) => setBatteryLevel(Number(e.target.value))}
          min="0"
          max="100"
        />
      </div>

      <div className="input-group">
        <label className="label">Target Battery Level (%)</label>
        <input
          type="number"
          className="input"
          value={targetLevel}
          onChange={(e) => setTargetLevel(Number(e.target.value))}
          min="0"
          max="100"
        />
      </div>

      <button 
        className="button"
        onClick={calculateChargingTime}
      >
        Calculate Charging Time
      </button>

      {result && (
        <div className="result space-y-20 py-12 px-8">
          <div className="flex items-center justify-between group relative hover:bg-gray-700/20 p-4 rounded-lg transition-all duration-200">
            <div className="w-[32px] h-[32px] flex items-center justify-center">
              <ClockIcon className="!w-5 !h-5 text-blue-400" aria-hidden="true" />
            </div>
            <p className="result-text text-3xl font-light">
              {result.hours}h {result.minutes}m
            </p>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p className="text-sm text-gray-400 whitespace-nowrap font-medium tracking-wide">
                Charging Time
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between group relative hover:bg-gray-700/20 p-4 rounded-lg transition-all duration-200">
            <div className="w-[32px] h-[32px] flex items-center justify-center">
              <CurrencyDollarIcon className="!w-5 !h-5 text-blue-400" aria-hidden="true" />
            </div>
            <p className="result-text text-3xl font-light">
              ${result.cost}
            </p>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p className="text-sm text-gray-400 whitespace-nowrap font-medium tracking-wide">
                Total Cost
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between group relative hover:bg-gray-700/20 p-4 rounded-lg transition-all duration-200">
            <div className="w-[32px] h-[32px] flex items-center justify-center">
              <BoltIcon className="!w-5 !h-5 text-blue-400" aria-hidden="true" />
            </div>
            <p className="result-text text-3xl font-light">
              {result.energyAdded} kWh
            </p>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p className="text-sm text-gray-400 whitespace-nowrap font-medium tracking-wide">
                Energy Added
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 