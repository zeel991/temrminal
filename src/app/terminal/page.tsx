"use client";

import { useAccount, useWatchContractEvent } from "wagmi";
import { useState } from "react";
import {
  PREDICTION_TERMINAL_ABI,
  PREDICTION_TERMINAL_ADDRESS,
} from "@/lib/prediction-terminal";
import { useAccountData, usePositions } from "@/hooks/useContractData";
import { usePythPrices } from "@/hooks/usePythPrices";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
  calculateHealthMetrics,
  calculateUsagePercent,
  calculateRemainingBuyingPower,
  formatPrice,
} from "@/utils/calculation";
import Header from "@/components/terminal/Header";
import MainHeader from "@/app/Header";
import InfoBanner from "@/components/terminal/InfoBanner";
import PriceHealthStatus from "@/components/terminal/PriceHealthStatus";
import CollateralOverview from "@/components/terminal/CollateralOverview";
import LiquidationWarning from "@/components/terminal/LiquidationWarning";
import NextSteps from "@/components/terminal/NextSteps";
import LeveragedTrading from "@/components/terminal/LeveragedTrading";
import LiquidationBot from "@/components/terminal/LiquidationBot";
import PlaceBet from "@/components/terminal/PlaceBet";
import WithdrawFromPool from "@/components/terminal/WithdrawfromPool";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const [liveYes, setLiveYes] = useState<string>("0.5000");
  const [liveNo, setLiveNo] = useState<string>("0.5000");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { lastRefreshTime, manualRefresh } = useAutoRefresh(autoRefresh);
  const pythPrices = usePythPrices();

  const {
    buyingPower,
    debt,
    shareValue,
    healthFactor,
    liquidatable,
    criticalLiquidation,
    usdcBalance,
    refetchAll,
    refetchHealth,
    refetchCollateral,
    refetchUsdcBalance,
  } = useAccountData(address, autoRefresh);

  const { solPosition, ethPosition, btcPosition, refetchPositions } =
    usePositions(address, autoRefresh);

  useWatchContractEvent({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    eventName: "MarketUpdate",
    onLogs(logs) {
      const e = logs[0];
      if (e && "args" in e && e.args) {
        const args = e.args as { yesPrice: bigint; noPrice: bigint };
        setLiveYes(formatPrice(args.yesPrice));
        setLiveNo(formatPrice(args.noPrice));
      }
    },
  });

  const { healthFactorPct, isHealthy, isWarning, isDanger } =
    calculateHealthMetrics(healthFactor);
  const usagePct = calculateUsagePercent(buyingPower, debt);
  const remainingBuyingPower = calculateRemainingBuyingPower(
    buyingPower,
    debt
  );

  const handleRefreshAll = async () => {
    await Promise.all([refetchAll(), refetchPositions()]);
    manualRefresh();
  };

  const handleRefreshHealth = async () => {
    await refetchHealth();
    manualRefresh();
  };

  const handleRefreshCollateral = async () => {
    await refetchCollateral();
    manualRefresh();
  };

  const handleRefreshUsdcBalance = async () => {
    await refetchUsdcBalance();
    manualRefresh();
  };

  if (!isConnected || !address) {
    return (
      <main className="min-h-screen bg-[#000] text-[#b366ff] font-mono p-6">
        <div className="max-w-4xl mx-auto border border-[#b366ff]/40 rounded p-8 text-center">
          <h1 className="text-2xl mb-4">Prediction Terminal</h1>
          <p className="text-[#b366ff]/80 mb-6">
            Connect wallet to place bets (get YES/NO tokens) and use them as
            collateral to open leveraged positions.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <MainHeader />
      <main className="min-h-screen bg-[#000] text-[#b366ff] font-mono p-6">
        <div className="max-w-6xl mx-auto">
        <Header
          onRefreshAll={handleRefreshAll}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
        />

        <InfoBanner lastRefreshTime={lastRefreshTime} />

        <PriceHealthStatus
          liveYes={liveYes}
          liveNo={liveNo}
          debt={debt}
          healthFactorPct={healthFactorPct}
          isHealthy={isHealthy}
          isWarning={isWarning}
          isDanger={isDanger}
          liquidatable={liquidatable}
          criticalLiquidation={criticalLiquidation}
          onRefresh={handleRefreshHealth}
        />

        <CollateralOverview
          shareValue={shareValue}
          buyingPower={buyingPower}
          debt={debt}
          remainingBuyingPower={remainingBuyingPower}
          usagePct={usagePct}
          onRefresh={handleRefreshCollateral}
        />

        {liquidatable && (
          <LiquidationWarning
            shareValue={shareValue}
            debt={debt}
            healthFactorPct={healthFactorPct}
          />
        )}

        {(shareValue > 0n || debt > 0n) && !liquidatable && (
          <NextSteps
            remainingBuyingPower={remainingBuyingPower}
            buyingPower={buyingPower}
          />
        )}

        <LeveragedTrading
          pythPrices={pythPrices}
          solPosition={solPosition}
          ethPosition={ethPosition}
          btcPosition={btcPosition}
          remainingBuyingPower={remainingBuyingPower}
          onRefreshPositions={refetchPositions}
        />

        <LiquidationBot pythPrices={pythPrices} />

        <PlaceBet
          usdcBalance={usdcBalance}
          onRefreshBalance={handleRefreshUsdcBalance}
        />

        <WithdrawFromPool />
        </div>
      </main>
    </>
  );
}