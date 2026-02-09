import { formatUnits } from "viem";

interface LiquidationWarningProps {
  shareValue: bigint;
  debt: bigint;
  healthFactorPct: number;
}

export default function LiquidationWarning({
  shareValue,
  debt,
  healthFactorPct,
}: LiquidationWarningProps) {
  return (
    <section className="mb-6 p-4 rounded border-2 border-red-500/50 bg-red-500/10">
      <div className="text-xs text-red-400 uppercase tracking-widest mb-2 font-bold">
        ⚠ Liquidation Risk
      </div>
      <p className="text-sm text-red-300/90 mb-3">
        Your position is liquidatable. Your debt exceeds 75% of your collateral
        value. Close positions or add collateral immediately to avoid
        liquidation penalties (5% total: 3% to liquidator, 2% protocol fee).
      </p>
      <div className="flex gap-3 text-xs">
        <div className="px-3 py-2 bg-[#000] border border-red-500/30 rounded">
          <span className="text-red-400/70">Collateral: </span>
          <span className="text-red-300 font-mono">
            ${formatUnits(shareValue, 18)}
          </span>
        </div>
        <div className="px-3 py-2 bg-[#000] border border-red-500/30 rounded">
          <span className="text-red-400/70">Debt: </span>
          <span className="text-red-300 font-mono">
            ${formatUnits(debt, 18)}
          </span>
        </div>
        <div className="px-3 py-2 bg-[#000] border border-red-500/30 rounded">
          <span className="text-red-400/70">Health: </span>
          <span className="text-red-300 font-mono font-bold">
            {healthFactorPct.toFixed(0)}%
          </span>
        </div>
      </div>
    </section>
  );
}