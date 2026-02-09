import { formatUnits } from "viem";

interface CollateralOverviewProps {
  shareValue: bigint;
  buyingPower: bigint;
  debt: bigint;
  remainingBuyingPower: bigint;
  usagePct: number;
  onRefresh: () => void;
}

export default function CollateralOverview({
  shareValue,
  buyingPower,
  debt,
  remainingBuyingPower,
  usagePct,
  onRefresh,
}: CollateralOverviewProps) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-[#b366ff]/60 uppercase tracking-widest">
          Collateral & Leverage Overview
        </div>
        <button
          onClick={onRefresh}
          className="px-2 py-1 text-xs text-[#b366ff]/70 hover:text-[#b366ff] hover:bg-[#b366ff]/10 rounded transition-colors"
          title="Refresh collateral data"
        >
          🔄 Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
        <div className="bg-[#0a0a0a] border border-[#b366ff]/20 rounded p-3">
          <div className="text-[#b366ff]/50">Collateral Value</div>
          <div className="tabular-nums text-lg">
            ${formatUnits(shareValue, 18)}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#b366ff]/20 rounded p-3">
          <div className="text-[#b366ff]/50">Max Leverage (75%)</div>
          <div className="tabular-nums text-lg">
            ${formatUnits(buyingPower, 18)}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#b366ff]/20 rounded p-3">
          <div className="text-[#b366ff]/50">Debt Used</div>
          <div className="tabular-nums text-lg">${formatUnits(debt, 18)}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#b366ff]/20 rounded p-3">
          <div className="text-[#b366ff]/50">Available</div>
          <div className="tabular-nums text-lg text-green-400">
            ${formatUnits(remainingBuyingPower, 18)}
          </div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-[#b366ff]/70 mb-1">
        <span>Leverage Usage: {usagePct.toFixed(1)}% of 75% max</span>
        <span>
          {usagePct >= 75
            ? "At limit - cannot open new positions"
            : `${(75 - usagePct).toFixed(1)}% remaining`}
        </span>
      </div>
      <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#b366ff]/20">
        <div
          className={`h-full transition-all duration-300 ${
            usagePct >= 75
              ? "bg-red-500"
              : usagePct >= 70
                ? "bg-amber-500"
                : "bg-[#b366ff]"
          }`}
          style={{ width: `${Math.min(usagePct, 100)}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-[#b366ff]/50">
        Shows leverage usage. Amber at &gt;70%, red at &gt;75% (liquidation
        threshold).
      </div>
    </section>
  );
}