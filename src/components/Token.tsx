"use client";

import Wrapper from "./Wrapper";
import { type AddressString } from "../lib/utils"; // Removed unused 'shorten'
import { useReadContract, useAccount } from "wagmi";
import { erc20Abi } from "viem";
import MonoLabel from "./Monolabel";

const Token = () => {
  const { chain, address } = useAccount();

  // Determine contract address based on chain ID
  const getContractAddress = (
    chainId: number | undefined,
  ): AddressString | undefined => {
    switch (chainId) {
      case 1:
        return "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      case 11155111:
        return "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
      case 8453:
        return "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
      case 80084:
        return "0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c";
      case 137:
        return "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
      case 42161:
        return "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
      case 1513:
        return "0x91f6F05B08c16769d3c85867548615d270C42fC7";
      case 5000:
        return "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9";
      default:
        return undefined;
    }
  };

  const contractAddress = getContractAddress(chain?.id);
  const tokenName = "USDC";

  const { data: nameData, isLoading: nameLoading } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "name",
  });

  const { data: symbolData, isLoading: symbolLoading } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "symbol",
  });

  const { data: decimalsData, isLoading: decimalsLoading } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });

  const { data: balanceData, isLoading: balanceLoading } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address as AddressString] : undefined,
  });

  // Removed totalSupplyData call as it was unused and triggering a warning

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
          <h3 className="text-sm font-medium text-yellow-800">
            Unsupported Network
          </h3>
          <p className="mt-2 text-sm text-yellow-700">
            Current network: {chain.name}
          </p>
        </div>
      </Wrapper>
    );
  }

  if (nameLoading || symbolLoading || decimalsLoading || balanceLoading) {
    return (
      <Wrapper title="useToken">
        <div className="text-center p-8">Loading token information...</div>
      </Wrapper>
    );
  }

  const formattedBalance =
    balanceData && decimalsData
      ? (Number(balanceData) / Math.pow(10, Number(decimalsData))).toFixed(6)
      : "0";

  return (
    <Wrapper title="useToken">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
            {symbolData || tokenName}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {nameData || tokenName}
            </h3>
            <p className="text-sm text-gray-500">on {chain.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Balance</label>
            <MonoLabel
              label={`${formattedBalance} ${symbolData || tokenName}`}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Decimals
            </label>
            <MonoLabel label={decimalsData?.toString() || "6"} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Token;
