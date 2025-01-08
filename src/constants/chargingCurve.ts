// Charging curve data points [SoC percentage, charging rate percentage]
export const chargingCurvePoints = [
  [0, 100],    // At 0% SoC, 100% charging rate
  [50, 95],    // At 50% SoC, 95% charging rate
  [70, 85],    // At 70% SoC, 85% charging rate
  [80, 70],    // At 80% SoC, 70% charging rate
  [90, 40],    // At 90% SoC, 40% charging rate
  [100, 10],   // At 100% SoC, 10% charging rate
] as const;

// Linear interpolation between two points
export const interpolate = (x: number, x1: number, y1: number, x2: number, y2: number): number => {
  return y1 + (x - x1) * (y2 - y1) / (x2 - x1);
};

// Get charging rate percentage for any SoC
export const getChargingRatePercentage = (soc: number): number => {
  // Find the two points to interpolate between
  for (let i = 0; i < chargingCurvePoints.length - 1; i++) {
    const [soc1, rate1] = chargingCurvePoints[i];
    const [soc2, rate2] = chargingCurvePoints[i + 1];
    
    if (soc >= soc1 && soc <= soc2) {
      return interpolate(soc, soc1, rate1, soc2, rate2);
    }
  }
  return chargingCurvePoints[chargingCurvePoints.length - 1][1];
}; 