"use client";

import { useState } from "react";
import Button from "./Button";
import Wrapper from "./Wrapper";
import { parseEther, isAddress } from "viem";
import { useSendTransaction } from "wagmi";

const SendTransaction = () => {
  const [recipientAddress, setRecipientAddress] = useState(
    "0xF2A919977c6dE88dd8ed90feAADFcC5d65D66038",
  );
  const [amount, setAmount] = useState("0.001");
  const [errors, setErrors] = useState<{ address?: string; amount?: string }>(
    {},
  );

  // Destructure wagmi hook - 'error' removed to satisfy ESLint
  const { data, isPending, isSuccess, sendTransaction } = useSendTransaction();

  const validateInputs = () => {
    const newErrors: { address?: string; amount?: string } = {};

    if (!recipientAddress) {
      newErrors.address = "Address is required";
    } else if (!isAddress(recipientAddress)) {
      newErrors.address = "Invalid Ethereum address";
    }

    if (!amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendTransaction = () => {
    if (!validateInputs() || !sendTransaction) return;

    try {
      sendTransaction({
        to: recipientAddress as `0x${string}`,
        value: parseEther(amount),
      });
    } catch {
      setErrors({ amount: "Invalid amount format" });
    }
  };

  const isFormValid =
    recipientAddress && amount && Object.keys(errors).length === 0;

  return (
    <Wrapper title="Send Transaction">
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <div className="flex items-center">
            <div className="text-red-800 text-sm font-medium">
              ⚠️ We recommend testing this on Sepolia testnet
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="recipient"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value);
                setErrors((prev) => ({ ...prev, address: undefined }));
              }}
              placeholder="0x..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Amount (ETH)
            </label>
            <input
              id="amount"
              type="number"
              step="0.0001"
              min="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              placeholder="0.001"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                errors.amount ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>
        </div>

        <Button
          cta={isPending ? "Confirming..." : `Send ${amount || "0"} ETH`}
          onClick_={handleSendTransaction}
          disabled={!sendTransaction || !isFormValid || isPending}
        />

        {isPending && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
              <span className="text-yellow-800 text-sm">
                Check your wallet to confirm the transaction
              </span>
            </div>
          </div>
        )}

        {isSuccess && data && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <div className="text-green-800 text-sm">
              <div className="font-medium mb-1">✅ Transaction Successful!</div>
              <div className="break-all font-mono">
                <strong>Hash:</strong> {data}
              </div>
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default SendTransaction;
