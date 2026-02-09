interface InfoBannerProps {
    lastRefreshTime: Date;
  }
  
  export default function InfoBanner({ lastRefreshTime }: InfoBannerProps) {
    return (
      <section className="bg-[#0a0a0a]/80 border border-[#b366ff]/20 rounded p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-[#b366ff]/60 uppercase tracking-widest">
            How it works
          </div>
          <div className="text-[10px] text-[#b366ff]/40">
            Last updated: {lastRefreshTime.toLocaleTimeString()}
          </div>
        </div>
        <p className="text-sm text-[#b366ff]/90 leading-relaxed">
          <strong>1. Place a bet</strong> with USDC to receive YES or NO tokens.
          Those tokens are your <strong>collateral</strong>.{" "}
          <strong>2. Leverage</strong> is only for opening positions: you can use
          up to <strong>75% of your token value</strong> to open leveraged longs
          in SOL, ETH, or BTC—not for more bets. Keep your health factor above
          133% to avoid liquidation. Below 133% = liquidatable, below 117% =
          critical.
        </p>
      </section>
    );
  }