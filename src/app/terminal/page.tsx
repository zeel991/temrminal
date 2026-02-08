"use client";

import {
  useAccount,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useState, useEffect } from "react";
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
import { type PythPrice } from "@/lib/pyth-prices";
import TradingViewWidget from "@/components/TradingViewWidget";
import Link from "next/link";

const PRECISION = 1e18;

function formatPrice(raw: bigint) {
  return (Number(raw) / PRECISION).toFixed(4);
}

export default function TerminalPage() {
  const { address, isConnected } = useAccount();
  const [liveYes, setLiveYes] = useState<string>("0.5000");
  const [liveNo, setLiveNo] = useState<string>("0.5000");
  const [betAmount, setBetAmount] = useState("100");
  const [depositAmount, setDepositAmount] = useState("100");
  const [depositType, setDepositType] = useState<"yes" | "no">("yes");
  const [tradeAsset, setTradeAsset] = useState<"SOL" | "ETH" | "BTC">("SOL");
  const [longAmount, setLongAmount] = useState("50");
  const [pythPrices, setPythPrices] = useState<Record<string, PythPrice>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/pyth-prices");
        if (!res.ok) return;
        const raw = await res.json();
        const next: Record<string, PythPrice> = {};
        for (const [sym, v] of Object.entries(
          raw as Record<string, { price: number; price18: string }>,
        )) {
          if (v && typeof v.price === "number") {
            next[sym] = {
              price: v.price,
              symbol: sym,
              price18: BigInt(v.price18),
            };
          }
        }
        if (!cancelled) {
          setPythPrices(next);
        }
      } catch {
        // ignore
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

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

  const { data: buyingPowerRaw } = useReadContract({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    functionName: "getBuyingPower",
    args: address ? [address] : undefined,
  });
  const { data: debtRaw } = useReadContract({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    functionName: "getDebt",
    args: address ? [address] : undefined,
  });
  const { data: shareValueRaw } = useReadContract({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    functionName: "getCurrentShareValue",
    args: address ? [address] : undefined,
  });
  const { data: liquidatable } = useReadContract({
    address: PREDICTION_TERMINAL_ADDRESS,
    abi: PREDICTION_TERMINAL_ABI,
    functionName: "checkLiquidation",
    args: address ? [address] : undefined,
  });

  const { data: usdcBalanceRaw } = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });
  const usdcBalance = usdcBalanceRaw ?? 0n;

  const { data: solPositionRaw } = useReadContract({
    address: LEVERAGED_TRADING_ADDRESS,
    abi: LEVERAGED_TRADING_ABI,
    functionName: "getPosition",
    args: address ? [address, "SOL"] : undefined,
  });

  const { data: ethPositionRaw } = useReadContract({
    address: LEVERAGED_TRADING_ADDRESS,
    abi: LEVERAGED_TRADING_ABI,
    functionName: "getPosition",
    args: address ? [address, "ETH"] : undefined,
  });

  const { data: btcPositionRaw } = useReadContract({
    address: LEVERAGED_TRADING_ADDRESS,
    abi: LEVERAGED_TRADING_ABI,
    functionName: "getPosition",
    args: address ? [address, "BTC"] : undefined,
  });

  const { writeContract: writeApproveUsdc, isPending: pendingApprove } =
    useWriteContract();
  const { writeContract: writeBuyYes, isPending: pendingBuyYes } =
    useWriteContract();
  const { writeContract: writeBuyNo, isPending: pendingBuyNo } =
    useWriteContract();
  const { writeContract: writeDepositYes, isPending: pendingDepYes } =
    useWriteContract();
  const { writeContract: writeDepositNo, isPending: pendingDepNo } =
    useWriteContract();
  const { writeContract: writeOpenLong, isPending: pendingOpen } =
    useWriteContract();
  const { writeContract: writeCloseLong, isPending: pendingClose } =
    useWriteContract();

  const buyingPower = buyingPowerRaw ?? 0n;
  const debt = debtRaw ?? 0n;
  const shareValue = shareValueRaw ?? 0n;

  const healthPct =
    buyingPower > 0n ? Number((debt * 10000n) / buyingPower) / 100 : 0;
  const isDanger = healthPct >= 70;

  const handleApproveUsdc = () => {
    const amt = parseUnits(betAmount, 6);
    writeApproveUsdc({
      address: MOCK_USDC_ADDRESS,
      abi: MOCK_USDC_ABI,
      functionName: "approve",
      args: [PREDICTION_TERMINAL_ADDRESS, amt],
    });
  };

  const handleBuyYes = () => {
    const amt = parseUnits(betAmount, 6);
    writeBuyYes({
      address: PREDICTION_TERMINAL_ADDRESS,
      abi: PREDICTION_TERMINAL_ABI,
      functionName: "buyYesWithUsdc",
      args: [amt],
    });
  };

  const handleBuyNo = () => {
    const amt = parseUnits(betAmount, 6);
    writeBuyNo({
      address: PREDICTION_TERMINAL_ADDRESS,
      abi: PREDICTION_TERMINAL_ABI,
      functionName: "buyNoWithUsdc",
      args: [amt],
    });
  };

  const handleDeposit = () => {
    const amt = parseUnits(depositAmount, 18);
    if (depositType === "yes")
      writeDepositYes({
        address: PREDICTION_TERMINAL_ADDRESS,
        abi: PREDICTION_TERMINAL_ABI,
        functionName: "depositYes",
        args: [amt],
      });
    else
      writeDepositNo({
        address: PREDICTION_TERMINAL_ADDRESS,
        abi: PREDICTION_TERMINAL_ABI,
        functionName: "depositNo",
        args: [amt],
      });
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
          <Link href="/" className="underline text-[#b366ff]">
            ← Back
          </Link>
        </div>
      </main>
    );
  }

  const remainingBuyingPower = buyingPower > debt ? buyingPower - debt : 0n;

  return (
    <main className="min-h-screen bg-[#000] text-[#b366ff] font-mono p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between border-b border-[#b366ff]/30 pb-4 mb-6">
          <h1 className="text-xl tracking-wider">PREDICTION TERMINAL</h1>
          <span className="text-sm text-[#b366ff]/70">MON/USDC (mock)</span>
          <Link href="/" className="text-sm underline text-[#b366ff]/80">
            ← Home
          </Link>
        </header>

        <section className="bg-[#0a0a0a]/80 border border-[#b366ff]/20 rounded p-4 mb-6">
          <div className="text-xs text-[#b366ff]/60 uppercase tracking-widest mb-2">
            How it works
          </div>
          <p className="text-sm text-[#b366ff]/90 leading-relaxed">
            <strong>1. Place a bet</strong> with USDC to receive YES or NO
            tokens. Those tokens are your <strong>collateral</strong>.{" "}
            <strong>2. Leverage</strong> is only for opening positions: you can
            use up to <strong>75% of your token value</strong> to open leveraged
            longs in SOL, ETH, or BTC—not for more bets. Stay within the 75%
            health ratio to avoid liquidation.
          </p>
        </section>

        <section className="bg-[#0a0a0a] border border-[#b366ff]/30 rounded p-4 mb-6">
          <div className="text-xs text-[#b366ff]/60 uppercase tracking-widest mb-2">
            Live Price
          </div>
          <div className="flex gap-8">
            <div>
              <span className="text-[#b366ff]/60 mr-2">YES</span>
              <span className="text-2xl tabular-nums">{liveYes}</span>
            </div>
            <div>
              <span className="text-[#b366ff]/60 mr-2">NO</span>
              <span className="text-2xl tabular-nums">{liveNo}</span>
            </div>
            {liquidatable && (
              <span className="text-red-500 font-semibold uppercase">
                Liquidatable
              </span>
            )}
          </div>
        </section>

        <section className="mb-6">
          <div className="text-xs text-[#b366ff]/60 uppercase tracking-widest mb-3">
            75% health ratio · leverage used
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
            <div className="bg-[#0a0a0a] border border-[#b366ff]/20 rounded p-3">
              <div className="text-[#b366ff]/50">
                Collateral (position value)
              </div>
              <div className="tabular-nums">{formatUnits(shareValue, 18)}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#b366ff]/20 rounded p-3">
              <div className="text-[#b366ff]/50">Max leverage (75%)</div>
              <div className="tabular-nums">{formatUnits(buyingPower, 18)}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#b366ff]/20 rounded p-3">
              <div className="text-[#b366ff]/50">Debt used</div>
              <div className="tabular-nums">{formatUnits(debt, 18)}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#b366ff]/20 rounded p-3">
              <div className="text-[#b366ff]/50">Remaining</div>
              <div className="tabular-nums">
                {formatUnits(remainingBuyingPower, 18)}
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-[#b366ff]/70 mb-1">
            <span>Health: {healthPct.toFixed(1)}% used of 75% max</span>
            <span>Debt / max leverage</span>
          </div>
          <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#b366ff]/20">
            <div
              className={`h-full transition-all duration-300 ${isDanger ? "bg-red-500" : "bg-[#b366ff]"}`}
              style={{ width: `${Math.min(healthPct, 100)}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-[#b366ff]/50">
            Bar shows how much of your 75% buying power you&apos;ve used for
            positions. Red when &gt;70%; above 75% = liquidatable.
          </div>
        </section>

        {(shareValue > 0n || debt > 0n) && (
          <section className="mb-6 p-4 rounded border border-[#b366ff]/30 bg-[#b366ff]/5">
            <div className="text-xs text-[#b366ff]/60 uppercase tracking-widest mb-2">
              What to do next
            </div>
            <ul className="text-sm text-[#b366ff]/90 space-y-1 list-disc list-inside">
              <li>
                Your YES/NO tokens are your <strong>collateral</strong>. The
                numbers above show their value and your 75% buying power for{" "}
                <strong>positions only</strong>.
              </li>
              {remainingBuyingPower > 0n && (
                <li>
                  Use the <strong>Trade tokens</strong> section below to open
                  leveraged longs (SOL, ETH, BTC) with your remaining buying
                  power.
                </li>
              )}
              {remainingBuyingPower === 0n && buyingPower > 0n && (
                <li>
                  You&apos;ve used all your current buying power for positions.
                  Buy more YES/NO with USDC to add collateral, or wait for your
                  token value to change.
                </li>
              )}
              <li>Keep the health bar under 75% used to avoid liquidation.</li>
            </ul>
          </section>
        )}

        <section className="mb-6">
          <div className="mb-4">
            <h2 className="text-sm uppercase tracking-widest text-[#b366ff]/80 mb-1">
              Leveraged Trading
            </h2>
            <p className="text-xs text-[#b366ff]/60">
              Use your 75% buying power to open long positions. Live prices from
              Pyth. Profit is paid in Mock USDC.
            </p>
            {LEVERAGED_TRADING_ADDRESS ===
              "0x0000000000000000000000000000000000000000" && (
              <p className="text-amber-400/90 text-xs mt-2">
                Set NEXT_PUBLIC_LEVERAGED_TRADING_ADDRESS and
                NEXT_PUBLIC_MOCK_USDC_ADDRESS after deploying LeveragedTrading
                and Mock USDC.
              </p>
            )}
          </div>

          <div className="border border-[#b366ff]/30 rounded overflow-hidden bg-[#0a0a0a] mb-4">
            <div className="flex border-b border-[#b366ff]/20">
              {(["SOL", "ETH", "BTC"] as const).map((asset) => (
                <button
                  key={asset}
                  onClick={() => setTradeAsset(asset)}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    tradeAsset === asset
                      ? "bg-[#b366ff]/10 text-[#b366ff] border-b-2 border-[#b366ff]"
                      : "text-[#b366ff]/50 hover:text-[#b366ff]/80 hover:bg-[#b366ff]/5"
                  }`}
                >
                  {asset} / USD
                </button>
              ))}
            </div>
            <div className="p-3 bg-[#000]">
              <TradingViewWidget
                symbolKey={tradeAsset}
                className="w-full"
                height={380}
              />
            </div>
          </div>

          <div className="border border-[#b366ff]/30 rounded overflow-hidden bg-[#0a0a0a]">
            <div className="grid grid-cols-7 gap-4 px-5 py-3 bg-[#000]/60 border-b border-[#b366ff]/20 text-xs text-[#b366ff]/60 uppercase tracking-wider">
              <div>Asset</div>
              <div className="text-right">Live Price</div>
              <div className="text-right">Position Size</div>
              <div className="text-right">Entry Price</div>
              <div className="text-right">Current Value</div>
              <div className="text-right">P&L</div>
              <div className="text-right">Actions</div>
            </div>

            {(["SOL", "ETH", "BTC"] as const).map((asset) => {
              const assetPrice = pythPrices[asset];

              let assetPositionRaw;
              if (asset === "SOL") assetPositionRaw = solPositionRaw;
              else if (asset === "ETH") assetPositionRaw = ethPositionRaw;
              else assetPositionRaw = btcPositionRaw;

              const assetPositionUsd = assetPositionRaw?.[0] ?? 0n;
              const assetEntryPrice = assetPositionRaw?.[1] ?? 0n;
              const hasAssetPosition = assetPositionUsd > 0n;

              let currentValue = 0;
              let pnlPercent = 0;
              let pnlAmount = 0;

              if (hasAssetPosition && assetPrice && assetEntryPrice > 0n) {
                const positionSizeNum = Number(
                  formatUnits(assetPositionUsd, 18),
                );
                const entryPriceNum = Number(formatUnits(assetEntryPrice, 18));
                const currentPriceNum = assetPrice.price;

                currentValue =
                  positionSizeNum * (currentPriceNum / entryPriceNum);
                pnlAmount = currentValue - positionSizeNum;
                pnlPercent =
                  ((currentPriceNum - entryPriceNum) / entryPriceNum) * 100;
              }

              return (
                <div
                  key={asset}
                  className="grid grid-cols-7 gap-4 px-5 py-4 border-b border-[#b366ff]/10 hover:bg-[#b366ff]/5 transition-colors items-center"
                >
                  <div>
                    <div className="text-[#b366ff] font-semibold">{asset}</div>
                    <div className="text-[10px] text-[#b366ff]/40">/ USD</div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#b366ff] font-mono tabular-nums">
                      {assetPrice ? `$${assetPrice.price.toFixed(2)}` : "—"}
                    </div>
                  </div>

                  <div className="text-right">
                    {hasAssetPosition ? (
                      <div className="text-[#b366ff] font-mono tabular-nums">
                        {Number(formatUnits(assetPositionUsd, 18)).toFixed(2)}{" "}
                        USD
                      </div>
                    ) : (
                      <div className="text-[#b366ff]/30">—</div>
                    )}
                  </div>

                  <div className="text-right">
                    {hasAssetPosition ? (
                      <div className="text-[#b366ff]/80 font-mono tabular-nums text-sm">
                        ${formatPrice(assetEntryPrice)}
                      </div>
                    ) : (
                      <div className="text-[#b366ff]/30">—</div>
                    )}
                  </div>

                  <div className="text-right">
                    {hasAssetPosition && assetPrice ? (
                      <div className="text-[#b366ff] font-mono tabular-nums">
                        ${currentValue.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-[#b366ff]/30">—</div>
                    )}
                  </div>

                  <div className="text-right">
                    {hasAssetPosition && assetPrice ? (
                      <div>
                        <div
                          className={`font-semibold font-mono tabular-nums ${
                            pnlAmount > 0
                              ? "text-green-400"
                              : pnlAmount < 0
                                ? "text-red-400"
                                : "text-[#b366ff]/70"
                          }`}
                        >
                          {pnlAmount > 0 ? "+" : ""}
                          {pnlAmount.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs ${
                            pnlPercent > 0
                              ? "text-green-400/70"
                              : pnlPercent < 0
                                ? "text-red-400/70"
                                : "text-[#b366ff]/50"
                          }`}
                        >
                          {pnlPercent > 0 ? "+" : ""}
                          {pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-[#b366ff]/30">—</div>
                    )}
                  </div>

                  <div className="text-right flex justify-end gap-2">
                    {!hasAssetPosition ? (
                      <button
                        onClick={() => {
                          setTradeAsset(asset);
                          if (!assetPrice) return;
                          const amt = parseUnits(longAmount, 18);
                          writeOpenLong({
                            address: LEVERAGED_TRADING_ADDRESS,
                            abi: LEVERAGED_TRADING_ABI,
                            functionName: "openLong",
                            args: [asset, amt, assetPrice.price18],
                          });
                        }}
                        disabled={
                          pendingOpen ||
                          !assetPrice ||
                          LEVERAGED_TRADING_ADDRESS ===
                            "0x0000000000000000000000000000000000000000"
                        }
                        className="px-3 py-1 border border-[#b366ff] rounded text-xs font-semibold text-[#b366ff] hover:bg-[#b366ff]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        OPEN
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setTradeAsset(asset);
                          if (!assetPrice) return;
                          writeCloseLong({
                            address: LEVERAGED_TRADING_ADDRESS,
                            abi: LEVERAGED_TRADING_ABI,
                            functionName: "closeLong",
                            args: [asset, assetPrice.price18],
                          });
                        }}
                        disabled={pendingClose || !assetPrice}
                        className="px-3 py-1 border border-red-500/70 rounded text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        CLOSE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border border-[#b366ff]/30 rounded p-4 bg-[#0a0a0a]">
            <div className="text-xs text-[#b366ff]/60 uppercase tracking-widest mb-3">
              Open New Position
            </div>
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-xs text-[#b366ff]/50 mb-1">
                  Asset
                </label>
                <select
                  value={tradeAsset}
                  onChange={(e) =>
                    setTradeAsset(e.target.value as "SOL" | "ETH" | "BTC")
                  }
                  className="bg-[#000] border border-[#b366ff]/30 rounded px-3 py-2 text-[#b366ff] focus:outline-none focus:border-[#b366ff]/60"
                >
                  <option value="SOL">SOL</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#b366ff]/50 mb-1">
                  Amount (USD)
                </label>
                <input
                  type="text"
                  value={longAmount}
                  onChange={(e) => setLongAmount(e.target.value)}
                  placeholder="50"
                  className="w-32 bg-[#000] border border-[#b366ff]/30 rounded px-3 py-2 text-[#b366ff] placeholder-[#b366ff]/40 focus:outline-none focus:border-[#b366ff]/60"
                />
              </div>
              <div>
                <label className="block text-xs text-[#b366ff]/50 mb-1">
                  Entry Price
                </label>
                <div className="px-3 py-2 bg-[#000] border border-[#b366ff]/30 rounded text-[#b366ff] font-mono tabular-nums min-w-[100px]">
                  {pythPrices[tradeAsset]
                    ? `$${pythPrices[tradeAsset].price.toFixed(2)}`
                    : "—"}
                </div>
              </div>
              <button
                onClick={() => {
                  const assetPrice = pythPrices[tradeAsset];
                  if (!assetPrice) return;
                  const amt = parseUnits(longAmount, 18);
                  writeOpenLong({
                    address: LEVERAGED_TRADING_ADDRESS,
                    abi: LEVERAGED_TRADING_ABI,
                    functionName: "openLong",
                    args: [tradeAsset, amt, assetPrice.price18],
                  });
                }}
                disabled={
                  pendingOpen ||
                  !pythPrices[tradeAsset] ||
                  !longAmount ||
                  LEVERAGED_TRADING_ADDRESS ===
                    "0x0000000000000000000000000000000000000000"
                }
                className="px-6 py-2 border-2 border-[#b366ff] rounded text-sm font-semibold text-[#b366ff] hover:bg-[#b366ff]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                OPEN LONG
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6 border border-[#b366ff]/30 rounded p-5 bg-[#0a0a0a]">
          <h2 className="text-sm uppercase tracking-widest text-[#b366ff]/80 mb-2">
            Place bet
          </h2>
          <p className="text-xs text-[#b366ff]/60 mb-4">
            Pay with USDC to receive YES or NO tokens. Those tokens are your
            collateral for opening leveraged positions.
          </p>

          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div>
              <label className="block text-xs text-[#b366ff]/50 mb-1">
                USDC amount
              </label>
              <input
                type="text"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="100"
                className="w-28 bg-[#000] border border-[#b366ff]/30 rounded px-3 py-2 text-[#b366ff] placeholder-[#b366ff]/40 focus:outline-none focus:border-[#b366ff]/60"
              />
            </div>
            <div className="text-xs text-[#b366ff]/50 self-center">
              Balance: {formatUnits(usdcBalance, 6)} USDC
            </div>
            <button
              onClick={handleApproveUsdc}
              disabled={
                pendingApprove ||
                !betAmount ||
                MOCK_USDC_ADDRESS ===
                  "0x0000000000000000000000000000000000000000"
              }
              className="py-2 px-4 border border-[#b366ff]/50 rounded text-sm hover:bg-[#b366ff]/10 disabled:opacity-50"
            >
              Approve USDC
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBuyYes}
              disabled={
                pendingBuyYes ||
                !betAmount ||
                MOCK_USDC_ADDRESS ===
                  "0x0000000000000000000000000000000000000000"
              }
              className="flex-1 py-3 px-6 border-2 border-green-500/70 rounded text-sm font-semibold text-green-400 hover:bg-green-500/10 disabled:opacity-50 transition-colors"
            >
              BUY YES
            </button>
            <button
              onClick={handleBuyNo}
              disabled={
                pendingBuyNo ||
                !betAmount ||
                MOCK_USDC_ADDRESS ===
                  "0x0000000000000000000000000000000000000000"
              }
              className="flex-1 py-3 px-6 border-2 border-red-500/70 rounded text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
            >
              BUY NO
            </button>
          </div>
        </section>

        <section className="mt-6 border border-[#b366ff]/20 rounded p-4 bg-[#0a0a0a]">
          <h2 className="text-sm uppercase tracking-widest text-[#b366ff]/60 mb-2">
            Withdraw from pool (testing)
          </h2>
          <p className="text-xs text-[#b366ff]/50 mb-3">
            Move YES/NO from the AMM pool to your balance. Use only if you need
            shares without USDC (e.g. seed data).
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <input
              type="text"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount (1e18)"
              className="w-32 bg-[#000] border border-[#b366ff]/30 rounded px-3 py-2 text-[#b366ff] placeholder-[#b366ff]/40 focus:outline-none"
            />
            <select
              value={depositType}
              onChange={(e) => setDepositType(e.target.value as "yes" | "no")}
              className="bg-[#000] border border-[#b366ff]/30 rounded px-3 py-2 text-[#b366ff] focus:outline-none"
            >
              <option value="yes">YES</option>
              <option value="no">NO</option>
            </select>
            <button
              onClick={handleDeposit}
              disabled={pendingDepYes || pendingDepNo}
              className="py-2 px-4 border border-[#b366ff]/50 rounded text-sm hover:bg-[#b366ff]/10 disabled:opacity-50"
            >
              Withdraw
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
