import { useReadContract } from "wagmi";
import {
  PREDICTION_TERMINAL_ABI,
  PREDICTION_TERMINAL_ADDRESS,
} from "@/lib/prediction-terminal";
import {
  LEVERAGED_TRADING_ABI,
  LEVERAGED_TRADING_ADDRESS,
  MOCK_USDC_ABI,
  MOCK_USDC_ADDRESS,
} from "@/lib/leveraged-trading";

export function useAccountData(address: `0x${string}` | undefined, autoRefresh: boolean) {
  const { data: buyingPowerRaw, refetch: refetchBuyingPower } = useReadContract({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    functionName: "getBuyingPower",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: autoRefresh ? 10000 : false,
    },
  });

  const { data: debtRaw, refetch: refetchDebt } = useReadContract({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    functionName: "getDebt",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: autoRefresh ? 10000 : false,
    },
  });

  const { data: shareValueRaw, refetch: refetchShareValue } = useReadContract({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    functionName: "getCurrentShareValue",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: autoRefresh ? 10000 : false,
    },
  });

  const { data: healthFactorRaw, refetch: refetchHealthFactor } = useReadContract({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    functionName: "getHealthFactor",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: autoRefresh ? 10000 : false,
    },
  });

  const { data: liquidatable, refetch: refetchLiquidatable } = useReadContract({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    functionName: "checkLiquidation",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: autoRefresh ? 10000 : false,
    },
  });

  const { data: criticalLiquidation, refetch: refetchCritical } = useReadContract({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    functionName: "checkCriticalLiquidation",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: autoRefresh ? 10000 : false,
    },
  });

  const { data: usdcBalanceRaw, refetch: refetchUsdcBalance } = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: autoRefresh ? 10000 : false,
    },
  });

  return {
    buyingPower: typeof buyingPowerRaw === "bigint" ? buyingPowerRaw : 0n,
    debt: typeof debtRaw === "bigint" ? debtRaw : 0n,
    shareValue: typeof shareValueRaw === "bigint" ? shareValueRaw : 0n,
    healthFactor: typeof healthFactorRaw === "bigint" ? healthFactorRaw : 0n,
    liquidatable,
    criticalLiquidation,
    usdcBalance: usdcBalanceRaw ?? 0n,
    refetchAll: async () => {
      await Promise.all([
        refetchBuyingPower(),
        refetchDebt(),
        refetchShareValue(),
        refetchHealthFactor(),
        refetchLiquidatable(),
        refetchCritical(),
        refetchUsdcBalance(),
      ]);
    },
    refetchHealth: async () => {
      await Promise.all([
        refetchHealthFactor(),
        refetchLiquidatable(),
        refetchCritical(),
      ]);
    },
    refetchCollateral: async () => {
      await Promise.all([
        refetchBuyingPower(),
        refetchDebt(),
        refetchShareValue(),
      ]);
    },
    refetchUsdcBalance,
  };
}

// Updated to handle the actual return type from your contract
// Your getPosition returns: [positionSizeUsd, entryPrice, ?, ?, ?]
export function usePositions(address: `0x${string}` | undefined, autoRefresh: boolean) {
  const { data: solPositionRaw, refetch: refetchSolPosition } = useReadContract({
    address: LEVERAGED_TRADING_ADDRESS,
    abi: LEVERAGED_TRADING_ABI,
    functionName: "getPosition",
    args: address ? [address, "SOL"] : undefined,
    query: {
      refetchInterval: autoRefresh ? 10000 : false,
    },
  });

  const { data: ethPositionRaw, refetch: refetchEthPosition } = useReadContract({
    address: LEVERAGED_TRADING_ADDRESS,
    abi: LEVERAGED_TRADING_ABI,
    functionName: "getPosition",
    args: address ? [address, "ETH"] : undefined,
    query: {
      refetchInterval: autoRefresh ? 10000 : false,
    },
  });

  const { data: btcPositionRaw, refetch: refetchBtcPosition } = useReadContract({
    address: LEVERAGED_TRADING_ADDRESS,
    abi: LEVERAGED_TRADING_ABI,
    functionName: "getPosition",
    args: address ? [address, "BTC"] : undefined,
    query: {
      refetchInterval: autoRefresh ? 10000 : false,
    },
  });

  return {
    solPosition: solPositionRaw as readonly [bigint, bigint, bigint, bigint, bigint] | undefined,
    ethPosition: ethPositionRaw as readonly [bigint, bigint, bigint, bigint, bigint] | undefined,
    btcPosition: btcPositionRaw as readonly [bigint, bigint, bigint, bigint, bigint] | undefined,
    refetchPositions: async () => {
      await Promise.all([
        refetchSolPosition(),
        refetchEthPosition(),
        refetchBtcPosition(),
      ]);
    },
  };
}