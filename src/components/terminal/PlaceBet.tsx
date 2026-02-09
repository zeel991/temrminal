import { useState } from "react";
import { parseUnits, formatUnits } from "viem";
import { useWriteContract } from "wagmi";
import {
  PREDICTION_TERMINAL_ABI,
  PREDICTION_TERMINAL_ADDRESS,
} from "@/lib/prediction-terminal";
import { MOCK_USDC_ABI, MOCK_USDC_ADDRESS } from "@/lib/leveraged-trading";

interface PlaceBetProps {
  usdcBalance: bigint;
  onRefreshBalance: () => void;
}

export default function PlaceBet({
  usdcBalance,
  onRefreshBalance,
}: PlaceBetProps) {
  const [betAmount, setBetAmount] = useState("100");

  const { writeContract: writeApproveUsdc, isPending: pendingApprove } =
    useWriteContract();
  const { writeContract: writeBuyYes, isPending: pendingBuyYes } =
    useWriteContract();
  const { writeContract: writeBuyNo, isPending: pendingBuyNo } =
    useWriteContract();

  const isMockUsdcConfigured =
    MOCK_USDC_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const handleApproveUsdc = () => {
    const amt = parseUnits(betAmount, 6);
    writeApproveUsdc({
      address: MOCK_USDC_ADDRESS,
      abi: MOCK_USDC_ABI,
      functionName: "approve",
      args: [PREDICTION_TERMINAL_ADDRESS, amt],
    });
  };

  const handleBuyYes = () => {
    const amt = parseUnits(betAmount, 6);
    writeBuyYes({
      address: PREDICTION_TERMINAL_ADDRESS,
      abi: PREDICTION_TERMINAL_ABI,
      functionName: "buyYesWithUsdc",
      args: [amt],
    });
  };

  const handleBuyNo = () => {
    const amt = parseUnits(betAmount, 6);
    writeBuyNo({
      address: PREDICTION_TERMINAL_ADDRESS,
      abi: PREDICTION_TERMINAL_ABI,
      functionName: "buyNoWithUsdc",
      args: [amt],
    });
  };

  return (
    <section className="mb-6 border border-[#b366ff]/30 rounded p-5 bg-[#0a0a0a]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm uppercase tracking-widest text-[#b366ff]/80">
          Place bet
        </h2>
        <button
          onClick={onRefreshBalance}
          className="px-2 py-1 text-xs text-[#b366ff]/70 hover:text-[#b366ff] hover:bg-[#b366ff]/10 rounded transition-colors"
          title="Refresh USDC balance"
        >
          🔄 Refresh
        </button>
      </div>
      <p className="text-xs text-[#b366ff]/60 mb-4">
        Pay with USDC to receive YES or NO tokens. Those tokens are your
        collateral for opening leveraged positions.
      </p>

      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <label className="block text-xs text-[#b366ff]/50 mb-1">
            USDC amount
          </label>
          <input
            type="text"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="100"
            className="w-28 bg-[#000] border border-[#b366ff]/30 rounded px-3 py-2 text-[#b366ff] placeholder-[#b366ff]/40 focus:outline-none focus:border-[#b366ff]/60"
          />
        </div>
        <div className="text-xs text-[#b366ff]/50 self-center">
          Balance: {formatUnits(usdcBalance, 6)} USDC
        </div>
        <button
          onClick={handleApproveUsdc}
          disabled={pendingApprove || !betAmount || !isMockUsdcConfigured}
          className="py-2 px-4 border border-[#b366ff]/50 rounded text-sm hover:bg-[#b366ff]/10 disabled:opacity-50"
        >
          Approve USDC
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleBuyYes}
          disabled={pendingBuyYes || !betAmount || !isMockUsdcConfigured}
          className="flex-1 py-3 px-6 border-2 border-green-500/70 rounded text-sm font-semibold text-green-400 hover:bg-green-500/10 disabled:opacity-50 transition-colors"
        >
          BUY YES
        </button>
        <button
          onClick={handleBuyNo}
          disabled={pendingBuyNo || !betAmount || !isMockUsdcConfigured}
          className="flex-1 py-3 px-6 border-2 border-red-500/70 rounded text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
        >
          BUY NO
        </button>
      </div>
    </section>
  );
}
