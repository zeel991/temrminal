'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useSwitchChain } from 'wagmi';

const SwitchNetwork = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { chain } = useAccount();
  const { chains, error: switchNetworkError, switchChain, isPending } = useSwitchChain();

  const handleNetworkSwitch = (chainId: number) => {
    switchChain?.({ chainId });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {chain ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{chain.name}</span>
          </>
        ) : (
          <span>Select Network</span>
        )}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Available Networks
              </div>
              
              {chains.map((network) => (
                <button
                  key={network.id}
                  disabled={!switchChain || network.id === chain?.id || isPending}
                  onClick={() => handleNetworkSwitch(network.id)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-200
                    ${network.id === chain?.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      network.id === chain?.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="font-medium">{network.name}</span>
                  </div>
                  
                  {network.id === chain?.id && (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            
            {switchNetworkError && (
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs font-medium text-red-800 mb-1">Network Switch Error:</p>
                  <p className="text-xs text-red-600">{switchNetworkError.message}</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SwitchNetwork;