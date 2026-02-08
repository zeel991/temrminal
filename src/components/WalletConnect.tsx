'use client'
// Import wagmi hooks from wagmi directly
import { useAccount, useDisconnect } from 'wagmi'
// Import Privy-specific hooks from @privy-io/wagmi
import { useSetActiveWallet } from '@privy-io/wagmi'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState } from 'react'

export default function WalletConnect() {
  // State for loading management
  const [isConnecting, setIsConnecting] = useState(false)

  // Privy hooks 
  const { ready, user, authenticated, login, connectWallet, logout, linkWallet } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  // WAGMI hooks (from @privy-io/wagmi)
  const { address, isConnected, isConnecting: wagmiConnecting, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { setActiveWallet } = useSetActiveWallet();

  const handleConnect = async () => {
    if (isConnecting || wagmiConnecting) return
    
    try {
      setIsConnecting(true)
      await login()
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await logout()
      // Optionally also disconnect from WAGMI
      // disconnect()
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="animate-pulse bg-gray-200 text-gray-600 px-6 py-3 rounded-lg">
        Loading...
      </div>
    )
  }

  // Show connected state
  if (authenticated && walletsReady && wallets.length > 0) {
    const wallet = wallets[0]
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium">
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  // Show connect button
  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting || wagmiConnecting}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
    >
      {(isConnecting || wagmiConnecting) ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}