interface NextStepsProps {
  remainingBuyingPower: bigint;
  buyingPower: bigint;
}

export default function NextSteps({
  remainingBuyingPower,
  buyingPower,
}: NextStepsProps) {
  return (
    <section className="mb-6 p-4 rounded border border-[#b366ff]/30 bg-[#b366ff]/5">
      <div className="text-xs text-[#b366ff]/60 uppercase tracking-widest mb-2">
        What to do next
      </div>
      <ul className="text-sm text-[#b366ff]/90 space-y-1 list-disc list-inside">
        <li>
          Your YES/NO tokens are your <strong>collateral</strong>. The numbers
          above show their value and your 75% buying power for{" "}
          <strong>positions only</strong>.
        </li>
        {remainingBuyingPower > 0n && (
          <li>
            Use the <strong>Trade tokens</strong> section below to open
            leveraged longs (SOL, ETH, BTC) with your remaining buying power.
          </li>
        )}
        {remainingBuyingPower === 0n && buyingPower > 0n && (
          <li>
            You&apos;ve used all your current buying power for positions. Buy
            more YES/NO with USDC to add collateral, or close some positions.
          </li>
        )}
        <li>
          Keep health factor above 133% to avoid liquidation. Monitor the health
          bar!
        </li>
      </ul>
    </section>
  );
}
