import { useState } from "react";
import { useWriteContract } from "wagmi";
import {
  LEVERAGED_TRADING_ABI,
  LEVERAGED_TRADING_ADDRESS,
} from "@/lib/leveraged-trading";
import { type PythPrice } from "@/lib/pyth-prices";

interface LiquidationBotProps {
  pythPrices: Record<string, PythPrice>;
}

const ASSETS = ["SOL", "ETH", "BTC"] as const;

export default function LiquidationBot({ pythPrices }: LiquidationBotProps) {
  const [liquidationTarget, setLiquidationTarget] = useState("");
  const { writeContract: writeLiquidate, isPending: pendingLiquidate } =
    useWriteContract();

  const isLeveragedTradingConfigured =
    LEVERAGED_TRADING_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const handleLiquidate = (asset: "SOL" | "ETH" | "BTC") => {
    const assetPrice = pythPrices[asset];
    if (!assetPrice || !liquidationTarget) return;

    writeLiquidate({
      address: LEVERAGED_TRADING_ADDRESS,
      abi: LEVERAGED_TRADING_ABI,
      functionName: "liquidatePosition",
      args: [liquidationTarget as `0x${string}`, asset, assetPrice.price18],
    });
  };

  return (
    <section className="mb-6 border border-amber-500/30 rounded p-5 bg-amber-500/5">
      <h2 className="text-sm uppercase tracking-widest text-amber-400/90 mb-2">
        Liquidation Bot (Testing)
      </h2>
      <p className="text-xs text-amber-300/70 mb-4">
        Liquidate undercollateralized positions. Earn 3% reward, protocol gets
        2%. Only works when user is liquidatable (health factor &lt; 133%).
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-amber-300/60 mb-1">
            User Address
          </label>
          <input
            type="text"
            value={liquidationTarget}
            onChange={(e) => setLiquidationTarget(e.target.value)}
            placeholder="0x..."
            className="w-96 bg-[#000] border border-amber-500/30 rounded px-3 py-2 text-amber-300 placeholder-amber-300/30 focus:outline-none focus:border-amber-500/60"
          />
        </div>
        {ASSETS.map((asset) => (
          <button
            key={asset}
            onClick={() => handleLiquidate(asset)}
            disabled={
              pendingLiquidate ||
              !liquidationTarget ||
              !pythPrices[asset] ||
              !isLeveragedTradingConfigured
            }
            className="px-4 py-2 border border-amber-500/70 rounded text-sm font-semibold text-amber-400 hover:bg-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Liquidate {asset}
          </button>
        ))}
      </div>
      <div className="mt-3 text-xs text-amber-300/50">
        Enter a user&apos;s address and click their position&apos;s asset to
        liquidate. You&apos;ll receive 3% of position size as USDC reward.
      </div>
    </section>
  );
}
