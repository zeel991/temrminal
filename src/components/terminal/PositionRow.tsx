import { formatUnits } from "viem";
import { formatPrice } from "@/utils/calculation";
import { type PythPrice } from "@/lib/pyth-prices";

interface PositionRowProps {
  asset: "SOL" | "ETH" | "BTC";
  assetPrice?: PythPrice;
  positionSizeUsd: bigint;
  entryPrice: bigint;
  currentValue: number;
  pnlAmount: number;
  pnlPercent: number;
  hasPosition: boolean;
  remainingBuyingPower: bigint;
  onOpenClick: () => void;
  onCloseClick: () => void;
  pendingOpen: boolean;
  pendingClose: boolean;
  isLeveragedTradingConfigured: boolean;
}

export default function PositionRow({
  asset,
  assetPrice,
  positionSizeUsd,
  entryPrice,
  currentValue,
  pnlAmount,
  pnlPercent,
  hasPosition,
  remainingBuyingPower,
  onOpenClick,
  onCloseClick,
  pendingOpen,
  pendingClose,
  isLeveragedTradingConfigured,
}: PositionRowProps) {
  return (
    <div className="grid grid-cols-7 gap-4 px-5 py-4 border-b border-[#b366ff]/10 hover:bg-[#b366ff]/5 transition-colors items-center">
      <div>
        <div className="text-[#b366ff] font-semibold">{asset}</div>
        <div className="text-[10px] text-[#b366ff]/40">/ USD</div>
      </div>

      <div className="text-right">
        <div className="text-[#b366ff] font-mono tabular-nums">
          {assetPrice ? `$${assetPrice.price.toFixed(2)}` : "—"}
        </div>
      </div>

      <div className="text-right">
        {hasPosition ? (
          <div className="text-[#b366ff] font-mono tabular-nums">
            ${Number(formatUnits(positionSizeUsd, 18)).toFixed(2)}
          </div>
        ) : (
          <div className="text-[#b366ff]/30">—</div>
        )}
      </div>

      <div className="text-right">
        {hasPosition ? (
          <div className="text-[#b366ff]/80 font-mono tabular-nums text-sm">
            ${formatPrice(entryPrice)}
          </div>
        ) : (
          <div className="text-[#b366ff]/30">—</div>
        )}
      </div>

      <div className="text-right">
        {hasPosition && assetPrice ? (
          <div className="text-[#b366ff] font-mono tabular-nums">
            ${currentValue.toFixed(2)}
          </div>
        ) : (
          <div className="text-[#b366ff]/30">—</div>
        )}
      </div>

      <div className="text-right">
        {hasPosition && assetPrice ? (
          <div>
            <div
              className={`font-semibold font-mono tabular-nums ${
                pnlAmount > 0
                  ? "text-green-400"
                  : pnlAmount < 0
                    ? "text-red-400"
                    : "text-[#b366ff]/70"
              }`}
            >
              {pnlAmount > 0 ? "+" : ""}${Math.abs(pnlAmount).toFixed(2)}
            </div>
            <div
              className={`text-xs ${
                pnlPercent > 0
                  ? "text-green-400/70"
                  : pnlPercent < 0
                    ? "text-red-400/70"
                    : "text-[#b366ff]/50"
              }`}
            >
              {pnlPercent > 0 ? "+" : ""}
              {pnlPercent.toFixed(2)}%
            </div>
          </div>
        ) : (
          <div className="text-[#b366ff]/30">—</div>
        )}
      </div>

      <div className="text-right flex justify-end gap-2">
        {!hasPosition ? (
          <button
            onClick={onOpenClick}
            disabled={
              pendingOpen ||
              !assetPrice ||
              remainingBuyingPower === 0n ||
              !isLeveragedTradingConfigured
            }
            className="px-3 py-1 border border-[#b366ff] rounded text-xs font-semibold text-[#b366ff] hover:bg-[#b366ff]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            OPEN
          </button>
        ) : (
          <button
            onClick={onCloseClick}
            disabled={pendingClose || !assetPrice}
            className="px-3 py-1 border border-red-500/70 rounded text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            CLOSE
          </button>
        )}
      </div>
    </div>
  );
}
