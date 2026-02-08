'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState } from 'react'
import {useAccount, useBalance} from 'wagmi';


export default function SimpleTokenTransfer() {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const {address} = useAccount();
  const [isLoading, setIsLoading] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedChain, setSelectedChain] = useState(1)
  const [selectedToken, setSelectedToken] = useState('ETH')
  const [lastTxHash, setLastTxHash] = useState('')

  const wallet = wallets[0]

  const chains = {
    1: { name: 'Ethereum', symbol: 'ETH' },
    42161: { name: 'Arbitrum One', symbol: 'ETH' },
  }

  const chainTokens = {
    1: [
      { symbol: 'ETH', address: '', name: 'Ethereum', decimals: 18 },
      { symbol: 'USDC', address: '0xA0b86a33E6c8d5d0f4ae2DA6C69B0f6C8Ad1e0E0', name: 'USD Coin', decimals: 6 },
      { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether', decimals: 6 },
    ],
    42161: [
      { symbol: 'ETH', address: '', name: 'Ethereum', decimals: 18 },
      { symbol: 'ARB', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', name: 'Arbitrum', decimals: 18 },
      { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', name: 'USD Coin', decimals: 6 },
      { symbol: 'USDT', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', name: 'Tether', decimals: 6 },
    ],
  }

  const availableTokens = chainTokens[selectedChain as keyof typeof chainTokens] || []
  const currentToken = availableTokens.find((t) => t.symbol === selectedToken)
  const isNativeToken = currentToken?.address === ''

  const getExplorerUrl = (hash: string, chainId: number) => {
    const explorers = {
      1: 'https://etherscan.io',
      42161: 'https://arbiscan.io',
    }
    return `${explorers[chainId as keyof typeof explorers]}/tx/${hash}`
  }

  if (!authenticated || !wallet) {
    return (
      <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center shadow">
        <p className="text-yellow-800 font-medium">⚠️ Please connect your wallet first</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">💸 Send Tokens</h2>

      {/* Wallet Info */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-xs text-gray-500">Connected Wallet</p>
        <p className="font-mono text-sm text-gray-800">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
        <p className="text-xs text-gray-600 mt-1">
          Current Chain: <span className="font-medium">{chains[wallet.chainId as keyof typeof chains]?.name || `Chain ${wallet.chainId}`}</span>
        </p>
      </div>

      {/* Network Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Network</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(chains).map(([chainId, chain]) => (
            <button
              key={chainId}
              onClick={() => setSelectedChain(parseInt(chainId))}
              className={`p-4 rounded-xl border text-center transition-all ${
                selectedChain === parseInt(chainId)
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              } ${wallet.chainId !== parseInt(chainId) ? 'opacity-70' : ''}`}
            >
              <div className="font-medium">{chain.name}</div>
              <div className="text-xs mt-1 text-gray-500">
                {wallet.chainId === parseInt(chainId) ? '✅ Connected' : '⚠️ Switch'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Token Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Token</label>
        <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
          {availableTokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => setSelectedToken(token.symbol)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedToken === token.symbol
                  ? 'border-green-500 bg-green-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{token.symbol}</div>
              <div className="text-xs text-gray-500">{token.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recipient + Amount */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Recipient Address</label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Amount ({selectedToken})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            step="0.001"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Decimals: {currentToken?.decimals} | {isNativeToken ? 'Native Token' : 'ERC-20 Token'}
          </p>
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={() => {}}
        disabled={isLoading || !recipientAddress || !amount || wallet.chainId !== selectedChain}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium shadow transition-colors"
      >
        {isLoading ? 'Sending...' : wallet.chainId !== selectedChain ? 'Switch Network First' : `Send ${selectedToken}`}
      </button>

      {/* Network Warning */}
      {wallet.chainId !== selectedChain && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          ⚠️ Please switch to <span className="font-semibold">{chains[selectedChain as keyof typeof chains]?.name}</span> network to send tokens
        </div>
      )}

      {/* Success Message */}
      {lastTxHash && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm space-y-1">
          <p className="text-green-800 font-medium">
            ✅ Transaction sent!
            <a
              href={getExplorerUrl(lastTxHash, selectedChain)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline ml-1 hover:no-underline"
            >
              View on Explorer →
            </a>
          </p>
          <p className="text-xs text-green-700 font-mono break-all">{lastTxHash}</p>
        </div>
      )}
    </div>
  )
}

// import {useAccount, useBalance} from 'wagmi';
// // import { usePrivy, useWallets } from '@privy-io/react-auth'
// const { wallets } = useWallets()

// const Balance = () => {
  
//   const {address} = useAccount();
//   const {data, isError, isLoading} = useBalance({address});

//   if (isLoading) return <div>Fetching balance…</div>;
//   if (isError) return <div>Error fetching balance</div>;
//   return (
//     <>
//       <h2 className="mt-6 text-2xl">useBalance</h2>
//       {isLoading && <p>fetching balance...</p>}
//       {isError && <p>Error fetching balance.</p>}
//       {data && (
//         <p>
//           Balance: {data?.formatted} {data?.symbol}
//         </p>
//       )}
//     </>
//   );
// };

// export default Balance;

