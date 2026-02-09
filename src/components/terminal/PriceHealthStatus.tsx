interface PriceHealthStatusProps {
    liveYes: string;
    liveNo: string;
    debt: bigint;
    healthFactorPct: number;
    isHealthy: boolean;
    isWarning: boolean;
    isDanger: boolean;
    liquidatable?: boolean;
    criticalLiquidation?: boolean;
    onRefresh: () => void;
  }
  
  export default function PriceHealthStatus({
    liveYes,
    liveNo,
    debt,
    healthFactorPct,
    isHealthy,
    isWarning,
    isDanger,
    liquidatable,
    criticalLiquidation,
    onRefresh,
  }: PriceHealthStatusProps) {
    return (
      <section className="bg-[#0a0a0a] border border-[#b366ff]/30 rounded p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-[#b366ff]/60 uppercase tracking-widest">
            Live Price & Health Status
          </div>
          <button
            onClick={onRefresh}
            className="px-2 py-1 text-xs text-[#b366ff]/70 hover:text-[#b366ff] hover:bg-[#b366ff]/10 rounded transition-colors"
            title="Refresh health status"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="flex gap-8 items-center">
          <div>
            <span className="text-[#b366ff]/60 mr-2">YES</span>
            <span className="text-2xl tabular-nums">{liveYes}</span>
          </div>
          <div>
            <span className="text-[#b366ff]/60 mr-2">NO</span>
            <span className="text-2xl tabular-nums">{liveNo}</span>
          </div>
          <div className="flex-1">
            {debt > 0n && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#b366ff]/60">Health Factor:</span>
                <span
                  className={`text-xl font-bold tabular-nums ${
                    isHealthy
                      ? "text-green-400"
                      : isWarning
                        ? "text-amber-400"
                        : "text-red-500"
                  }`}
                >
                  {healthFactorPct.toFixed(0)}%
                </span>
                {criticalLiquidation && (
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500 rounded text-red-400 text-xs font-bold uppercase animate-pulse">
                    Critical
                  </span>
                )}
                {liquidatable && !criticalLiquidation && (
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-500 rounded text-amber-400 text-xs font-bold uppercase">
                    Liquidatable
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {debt > 0n && (
          <div className="mt-3 text-xs text-[#b366ff]/60">
            {isHealthy && "✓ Healthy - Collateral is well above debt"}
            {isWarning && "⚠ Warning - Close to liquidation threshold (133%)"}
            {isDanger &&
              "🔴 Danger - Liquidation imminent! Add collateral or close positions"}
          </div>
        )}
      </section>
    );
  }