'use client';

import Wrapper from './Wrapper';
import { shorten, type AddressString } from '../lib/utils';
import {useReadContract, useAccount ,useBalance} from 'wagmi';
import {erc20Abi} from 'viem';
import MonoLabel from './Monolabel';

const Token = () => {
  const { chain , address } = useAccount();

  let contractAddress: AddressString | undefined;
  let tokenName = 'USDC';

  console.log('🔍 Current chain:', chain);
  console.log('🔍 Current address:', address);

  switch (chain?.id) {
    case 1: // Ethereum Mainnet
      contractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC Mainnet
      break;
    case 11155111: // Sepolia Testnet
      contractAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // USDC Sepolia
      break;
    case 8453: // Base
      contractAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC Base
      break;
    case 80084: // Berachain Bartio Testnet
      contractAddress = '0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c'; // USDC Berachain Testnet
      break;
    case 137: // Polygon
      contractAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC Polygon
      break;
    case 42161: // Arbitrum One
      contractAddress = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'; // USDC Arbitrum
      break;
    case 1513: // Story Protocol Testnet
      contractAddress = '0x91f6F05B08c16769d3c85867548615d270C42fC7'; // USDC Story (example address)
      break;
    case 5000: // Mantle
      contractAddress = '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9'; // USDC Mantle
      break;
    default:
      contractAddress = undefined;
  }

  // console.log('🔍 Contract address for chain:', contractAddress);

  // Get token name
  const {data: nameData, isError: nameError, isLoading: nameLoading} = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'name',
  });

  // Get token symbol
  const {data: symbolData, isError: symbolError, isLoading: symbolLoading} = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'symbol',
  });

  // Get token decimals
  const {data: decimalsData, isError: decimalsError, isLoading: decimalsLoading} = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'decimals',
  });

  // Get user balance
  const {data: balanceData, isError: balanceError, isLoading: balanceLoading} = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address as AddressString] : undefined,
  });

  // Get total supply (optional)
  const {data: totalSupplyData, isError: totalSupplyError, isLoading: totalSupplyLoading} = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'totalSupply',
  });

  // console.log('🔍 Token data:', {
  //   name: nameData,
  //   symbol: symbolData,
  //   decimals: decimalsData,
  //   balance: balanceData,
  //   totalSupply: totalSupplyData
  // });

  // console.log('🔍 Loading states:', {
  //   nameLoading,
  //   symbolLoading,
  //   decimalsLoading,
  //   balanceLoading,
  //   totalSupplyLoading
  // });

  // console.log('🔍 Error states:', {
  //   nameError,
  //   symbolError,
  //   decimalsError,
  //   balanceError,
  //   totalSupplyError
  // });

  if (!chain) {
    return (
      <Wrapper title="useToken">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading chain...</span>
        </div>
      </Wrapper>
    );
  }

  if (!contractAddress) {
    return (
      <Wrapper title="useToken">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Unsupported Network
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Current network: <span className="font-semibold">{chain.name}</span></p>
                <p className="mt-1">Please switch to one of these supported networks:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Ethereum Mainnet</li>
                  <li>Sepolia Testnet</li>
                  <li>Base</li>
                  <li>Berachain Bartio</li>
                  <li>Polygon</li>
                  <li>Arbitrum One</li>
                  <li>Story Protocol</li>
                  <li>Mantle</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  if (nameLoading || symbolLoading || decimalsLoading || balanceLoading) {
    return (
      <Wrapper title="useToken">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-600">Loading token information...</div>
        </div>
      </Wrapper>
    );
  }

  if (nameError || symbolError || decimalsError) {
    return (
      <Wrapper title="useToken">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Token</h3>
              <p className="mt-2 text-sm text-red-700">
                Failed to read token information from contract address: 
                <MonoLabel label={shorten(contractAddress)} />
              </p>
              <div className="mt-2 text-xs text-red-600">
                <p>Chain: {chain.name} (ID: {chain.id})</p>
                <p>Errors: {nameError ? 'name ' : ''}{symbolError ? 'symbol ' : ''}{decimalsError ? 'decimals ' : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  // Format balance
  const formattedBalance = balanceData && decimalsData 
    ? (Number(balanceData) / Math.pow(10, Number(decimalsData))).toFixed(6)
    : '0';

  return (
    <Wrapper title="useToken">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">{symbolData || 'USDC'}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{nameData || 'USDC'}</h3>
            <p className="text-sm text-gray-500">on {chain.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Token Name</label>
              <div className="mt-1">
                <MonoLabel label={nameData || 'USDC'} />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Symbol</label>
              <div className="mt-1">
                <MonoLabel label={symbolData || 'USDC'} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Your Balance</label>
              <div className="mt-1">
                <MonoLabel label={`${formattedBalance} ${symbolData || 'USDC'}`} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Contract Address</label>
              <div className="mt-1">
                <MonoLabel label={shorten(contractAddress)} />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Decimals</label>
              <div className="mt-1">
                <MonoLabel label={decimalsData?.toString() || '6'} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Chain ID</label>
              <div className="mt-1">
                <MonoLabel label={chain.id.toString()} />
              </div>
            </div>
          </div>
        </div>

        {totalSupplyData && decimalsData && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-700">Total Supply</label>
              <div className="mt-1">
                <MonoLabel label={totalSupplyData.toString()} />
                <span className="ml-2 text-sm text-gray-500">
                  ({(Number(totalSupplyData) / Math.pow(10, Number(decimalsData))).toLocaleString()} {symbolData})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default Token;