"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";

export default function SimpleTokenTransfer() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");

  const wallet = wallets[0];

  if (!authenticated || !wallet) {
    return (
      <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center shadow">
        <p className="text-yellow-800 font-medium">
          ⚠️ Please connect your wallet first
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        💸 Send Tokens
      </h2>
      <input
        type="text"
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)}
        placeholder="Recipient 0x..."
        className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="w-full p-3 border border-gray-300 rounded-xl"
      />
      <button
        disabled={!recipientAddress || !amount}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium disabled:bg-gray-400"
      >
        Send
      </button>
    </div>
  );
}
