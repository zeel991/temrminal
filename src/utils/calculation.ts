const PRECISION = 1e18;

export function formatPrice(raw: bigint): string {
  return (Number(raw) / PRECISION).toFixed(4);
}

export function calculateHealthMetrics(healthFactorRaw: bigint) {
  const healthFactorPct = healthFactorRaw > 0n ? Number(healthFactorRaw) : 0;
  const isHealthy = healthFactorPct >= 133;
  const isWarning = healthFactorPct < 133 && healthFactorPct >= 117;
  const isDanger = healthFactorPct < 117;

  return {
    healthFactorPct,
    isHealthy,
    isWarning,
    isDanger,
  };
}

export function calculateUsagePercent(buyingPower: bigint, debt: bigint): number {
  return buyingPower > 0n ? Number((debt * 10000n) / buyingPower) / 100 : 0;
}

export function calculateRemainingBuyingPower(buyingPower: bigint, debt: bigint): bigint {
  return buyingPower > debt ? buyingPower - debt : 0n;
}

export function calculatePositionMetrics(
  positionSizeUsd: bigint,
  entryPrice: bigint,
  currentPrice: number
) {
  if (positionSizeUsd === 0n || entryPrice === 0n) {
    return {
      currentValue: 0,
      pnlAmount: 0,
      pnlPercent: 0,
    };
  }

  const positionSizeNum = Number(positionSizeUsd) / PRECISION;
  const entryPriceNum = Number(entryPrice) / PRECISION;

  const currentValue = positionSizeNum * (currentPrice / entryPriceNum);
  const pnlAmount = currentValue - positionSizeNum;
  const pnlPercent = ((currentPrice - entryPriceNum) / entryPriceNum) * 100;

  return {
    currentValue,
    pnlAmount,
    pnlPercent,
  };
}