"use client";
import { useAccount } from "wagmi";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";

export default function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { isConnecting: wagmiConnecting } = useAccount();

  const handleConnect = async () => {
    if (isConnecting || wagmiConnecting) return;
    try {
      setIsConnecting(true);
      await login();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!ready)
    return (
      <div className="animate-pulse bg-gray-200 px-6 py-3 rounded-lg">
        Loading...
      </div>
    );

  if (authenticated && walletsReady && wallets.length > 0) {
    const wallet = wallets[0];
    return (
      <div className="flex items-center space-x-4">
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
        </div>
        <button
          onClick={() => logout()}
          className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting || wagmiConnecting}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium disabled:bg-blue-400"
    >
      {isConnecting || wagmiConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
