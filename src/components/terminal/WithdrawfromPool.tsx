import { useState } from "react";
import { parseUnits } from "viem";
import { useWriteContract } from "wagmi";
import {
  PREDICTION_TERMINAL_ABI,
  PREDICTION_TERMINAL_ADDRESS,
} from "@/lib/prediction-terminal";

export default function WithdrawFromPool() {
  const [depositAmount, setDepositAmount] = useState("100");
  const [depositType, setDepositType] = useState<"yes" | "no">("yes");

  const { writeContract: writeDepositYes, isPending: pendingDepYes } =
    useWriteContract();
  const { writeContract: writeDepositNo, isPending: pendingDepNo } =
    useWriteContract();

  const handleDeposit = () => {
    const amt = parseUnits(depositAmount, 18);
    if (depositType === "yes") {
      writeDepositYes({
        address: PREDICTION_TERMINAL_ADDRESS,
        abi: PREDICTION_TERMINAL_ABI,
        functionName: "depositYes",
        args: [amt],
      });
    } else {
      writeDepositNo({
        address: PREDICTION_TERMINAL_ADDRESS,
        abi: PREDICTION_TERMINAL_ABI,
        functionName: "depositNo",
        args: [amt],
      });
    }
  };

  return (
    <section className="mt-6 border border-[#b366ff]/20 rounded p-4 bg-[#0a0a0a]">
      <h2 className="text-sm uppercase tracking-widest text-[#b366ff]/60 mb-2">
        Withdraw from pool (testing)
      </h2>
      <p className="text-xs text-[#b366ff]/50 mb-3">
        Move YES/NO from the AMM pool to your balance. Use only if you need
        shares without USDC (e.g. seed data).
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <input
          type="text"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Amount (1e18)"
          className="w-32 bg-[#000] border border-[#b366ff]/30 rounded px-3 py-2 text-[#b366ff] placeholder-[#b366ff]/40 focus:outline-none"
        />
        <select
          value={depositType}
          onChange={(e) => setDepositType(e.target.value as "yes" | "no")}
          className="bg-[#000] border border-[#b366ff]/30 rounded px-3 py-2 text-[#b366ff] focus:outline-none"
        >
          <option value="yes">YES</option>
          <option value="no">NO</option>
        </select>
        <button
          onClick={handleDeposit}
          disabled={pendingDepYes || pendingDepNo}
          className="py-2 px-4 border border-[#b366ff]/50 rounded text-sm hover:bg-[#b366ff]/10 disabled:opacity-50"
        >
          Withdraw
        </button>
      </div>
    </section>
  );
}
