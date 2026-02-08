'use client';

import Wrapper from './Wrapper';
import {shorten, type AddressString} from '../lib/utils';
import {useEffect , useState} from 'react';
import {erc20Abi} from 'viem';
import {sepolia} from 'viem/chains';
import {useAccount, useWriteContract} from 'wagmi';

import Button from './Button';
import MonoLabel from './Monolabel';

const ABI = erc20Abi;

const ContractWrite = () => {
    const {chain, address} = useAccount();
    const [receiverAddress, setReceiverAddress] = useState('');
    const [amount, setAmount] = useState('1.0');
  
    let contractAddress: AddressString;
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
        contractAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // Default to Sepolia
    }
    
    const {data, error, isError, isPending, writeContract} = useWriteContract();
  
    useEffect(() => {
      console.error(error);
    }, [error]);
  
    useEffect(() => {
      if (address && !receiverAddress) {
        setReceiverAddress(address);
      }
    }, [address, receiverAddress]);

    // Helper function to convert USDC amount to proper decimals (6 decimals)
    const convertToUSDCAmount = (amount: string) => {
      const numAmount = parseFloat(amount);
      return BigInt(Math.floor(numAmount * 1000000)); // USDC has 6 decimals
    };
  
    if (!chain) {
      return (
        <Wrapper title="USDC Transfer">
          <p>Loading...</p>
        </Wrapper>
      );
    }
  
    // Remove the Sepolia-only restriction since you support multiple chains
    const supportedChains = [1, 11155111, 8453, 80084, 137, 42161, 1513, 5000];
    if (!supportedChains.includes(chain.id)) {
      return (
        <Wrapper title="USDC Transfer">
          <p>Unsupported network. Please switch to a supported chain.</p>
        </Wrapper>
      );
    }
  
    return (
      <Wrapper title="USDC Transfer">
        <div className="rounded bg-blue-400 px-2 py-1 text-sm text-white">
          Transfer USDC tokens on {chain.name}
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Receiver Address</label>
            <input
              type="text"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border rounded-md text-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Amount (USDC)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-black"
            />
          </div>
        </div>
  
        {data && !isError && (
          <p>
            Transaction hash: <MonoLabel label={shorten(data)} />
          </p>
        )}
        {isError && <p>Error sending transaction.</p>}
        {address && (
          <Button
            disabled={isPending || !receiverAddress || !amount || parseFloat(amount) <= 0}
            onClick_={() =>
              writeContract?.({
                abi: ABI,
                address: contractAddress,
                functionName: 'transfer',
                args: [receiverAddress as `0x${string}`, convertToUSDCAmount(amount)],
              })
            }
            cta={`Transfer ${amount} USDC`}
          />
        )}
      </Wrapper>
    );
  };
  
  export default ContractWrite;