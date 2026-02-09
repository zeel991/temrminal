import { useState } from "react";
import { parseUnits, formatUnits } from "viem";
import { useWriteContract } from "wagmi";
import TradingViewWidget from "@/components/TradingViewWidget";
import PositionRow from "./PositionRow";
import { calculatePositionMetrics } from "../../utils/calculation";
import {
  LEVERAGED_TRADING_ABI,
  LEVERAGED_TRADING_ADDRESS,
} from "@/lib/leveraged-trading";
import { type PythPrice } from "@/lib/pyth-prices";

// 1. Define the specific type for your position
// Most Solidity 'Position' structs return as an array-like object in Viem/Wagmi
type PositionData = readonly [bigint, bigint] | undefined | null;

interface LeveragedTradingProps {
  pythPrices: Record<string, PythPrice>;
  solPosition: PositionData; 
  ethPosition: PositionData; 
  btcPosition: PositionData; 
  remainingBuyingPower: bigint;
  onRefreshPositions: () => void;
}

const ASSETS = ["SOL", "ETH", "BTC"] as const;

export default function LeveragedTrading({
  pythPrices,
  solPosition,
  ethPosition,
  btcPosition,
  remainingBuyingPower,
  onRefreshPositions,
}: LeveragedTradingProps) {
  const [tradeAsset, setTradeAsset] = useState<"SOL" | "ETH" | "BTC">("SOL");
  const [longAmount, setLongAmount] = useState("50");

  const { writeContract: writeOpenLong, isPending: pendingOpen } =
    useWriteContract();
  const { writeContract: writeCloseLong, isPending: pendingClose } =
    useWriteContract();

  const isLeveragedTradingConfigured =
    LEVERAGED_TRADING_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const handleOpenLong = (asset: "SOL" | "ETH" | "BTC", amount: string) => {
    const assetPrice = pythPrices[asset];
    if (!assetPrice) return;
    const amt = parseUnits(amount, 18);
    writeOpenLong({
      address: LEVERAGED_TRADING_ADDRESS,
      abi: LEVERAGED_TRADING_ABI,
      functionName: "openLong",
      args: [asset, amt, assetPrice.price18],
    });
  };

  const handleCloseLong = (asset: "SOL" | "ETH" | "BTC") => {
    const assetPrice = pythPrices[asset];
    if (!assetPrice) return;
    writeCloseLong({
      address: LEVERAGED_TRADING_ADDRESS,
      abi: LEVERAGED_TRADING_ABI,
      functionName: "closeLong",
      args: [asset, assetPrice.price18],
    });
  };

  const getPositionData = (asset: "SOL" | "ETH" | "BTC") => {
    // 2. Use the specific type here instead of 'any'
    let positionRaw: PositionData;
    if (asset === "SOL") positionRaw = solPosition;
    else if (asset === "ETH") positionRaw = ethPosition;
    else positionRaw = btcPosition;

    const positionSizeUsd = positionRaw?.[0] ?? 0n;
    const entryPrice = positionRaw?.[1] ?? 0n;
    const hasPosition = positionSizeUsd > 0n;

    const assetPrice = pythPrices[asset];
    const metrics = calculatePositionMetrics(
      positionSizeUsd,
      entryPrice,
      assetPrice?.price ?? 0
    );

    return {
      positionSizeUsd,
      entryPrice,
      hasPosition,
      assetPrice,
      ...metrics,
    };
  };

  return (
    <section className="mb-6">
      {/* ... rest of your JSX remains exactly the same ... */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-[#b366ff]/80 mb-1">
            Leveraged Trading
          </h2>
          <button
            onClick={onRefreshPositions}
            className="px-2 py-1 text-xs text-[#b366ff]/70 hover:text-[#b366ff] hover:bg-[#b366ff]/10 rounded transition-colors"
            title="Refresh positions"
          >
            🔄 Refresh Positions
          </button>
        </div>
        <p className="text-xs text-[#b366ff]/60">
          Use your 75% buying power to open long positions. Live prices from
          Pyth. Profit paid in Mock USDC. Liquidation occurs below 133% health
          factor.
        </p>
        {!isLeveragedTradingConfigured && (
          <p className="text-amber-400/90 text-xs mt-2">
            Set NEXT_PUBLIC_LEVERAGED_TRADING_ADDRESS and
            NEXT_PUBLIC_MOCK_USDC_ADDRESS after deploying LeveragedTrading and
            Mock USDC.
          </p>
        )}
      </div>

      <div className="border border-[#b366ff]/30 rounded overflow-hidden bg-[#0a0a0a] mb-4">
        <div className="flex border-b border-[#b366ff]/20">
          {ASSETS.map((asset) => (
            <button
              key={asset}
              onClick={() => setTradeAsset(asset)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                tradeAsset === asset
                  ? "bg-[#b366ff]/10 text-[#b366ff] border-b-2 border-[#b366ff]"
                  : "text-[#b366ff]/50 hover:text-[#b366ff]/80 hover:bg-[#b366ff]/5"
              }`}
            >
              {asset} / USD
            </button>
          ))}
        </div>
        <div className="p-3 bg-[#000]">
          <TradingViewWidget
            symbolKey={tradeAsset}
            className="w-full"
            height={380}
          />
        </div>
      </div>

      <div className="border border-[#b366ff]/30 rounded overflow-hidden bg-[#0a0a0a]">
        <div className="grid grid-cols-7 gap-4 px-5 py-3 bg-[#000]/60 border-b border-[#b366ff]/20 text-xs text-[#b366ff]/60 uppercase tracking-wider">
          <div>Asset</div>
          <div className="text-right">Live Price</div>
          <div className="text-right">Position Size</div>
          <div className="text-right">Entry Price</div>
          <div className="text-right">Current Value</div>
          <div className="text-right">P&L</div>
          <div className="text-right">Actions</div>
        </div>

        {ASSETS.map((asset) => {
          const data = getPositionData(asset);
          return (
            <PositionRow
              key={asset}
              asset={asset}
              assetPrice={data.assetPrice}
              positionSizeUsd={data.positionSizeUsd}
              entryPrice={data.entryPrice}
              currentValue={data.currentValue}
              pnlAmount={data.pnlAmount}
              pnlPercent={data.pnlPercent}
              hasPosition={data.hasPosition}
              remainingBuyingPower={remainingBuyingPower}
              onOpenClick={() => {
                setTradeAsset(asset);
                handleOpenLong(asset, longAmount);
              }}
              onCloseClick={() => {
                setTradeAsset(asset);
                handleCloseLong(asset);
              }}
              pendingOpen={pendingOpen}
              pendingClose={pendingClose}
              isLeveragedTradingConfigured={isLeveragedTradingConfigured}
            />
          );
        })}
      </div>

      <div className="mt-4 border border-[#b366ff]/30 rounded p-4 bg-[#0a0a0a]">
        <div className="text-xs text-[#b366ff]/60 uppercase tracking-widest mb-3">
          Open New Position
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-[#b366ff]/50 mb-1">
              Asset
            </label>
            <select
              value={tradeAsset}
              onChange={(e) =>
                setTradeAsset(e.target.value as "SOL" | "ETH" | "BTC")
              }
              className="bg-[#000] border border-[#b366ff]/30 rounded px-3 py-2 text-[#b366ff] focus:outline-none focus:border-[#b366ff]/60"
            >
              <option value="SOL">SOL</option>
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#b366ff]/50 mb-1">
              Amount (USD)
            </label>
            <input
              type="text"
              value={longAmount}
              onChange={(e) => setLongAmount(e.target.value)}
              placeholder="50"
              className="w-32 bg-[#000] border border-[#b366ff]/30 rounded px-3 py-2 text-[#b366ff] placeholder-[#b366ff]/40 focus:outline-none focus:border-[#b366ff]/60"
            />
          </div>
          <div>
            <label className="block text-xs text-[#b366ff]/50 mb-1">
              Entry Price
            </label>
            <div className="px-3 py-2 bg-[#000] border border-[#b366ff]/30 rounded text-[#b366ff] font-mono tabular-nums min-w-[100px]">
              {pythPrices[tradeAsset]
                ? `$${pythPrices[tradeAsset].price.toFixed(2)}`
                : "—"}
            </div>
          </div>
          <button
            onClick={() => handleOpenLong(tradeAsset, longAmount)}
            disabled={
              pendingOpen ||
              !pythPrices[tradeAsset] ||
              !longAmount ||
              remainingBuyingPower === 0n ||
              !isLeveragedTradingConfigured
            }
            className="px-6 py-2 border-2 border-[#b366ff] rounded text-sm font-semibold text-[#b366ff] hover:bg-[#b366ff]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {remainingBuyingPower === 0n ? "NO BUYING POWER" : "OPEN LONG"}
          </button>
        </div>
        {remainingBuyingPower > 0n && (
          <div className="mt-2 text-xs text-[#b366ff]/60">
            Available buying power: ${formatUnits(remainingBuyingPower, 18)}
          </div>
        )}
      </div>
    </section>
  );
} 