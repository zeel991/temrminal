# Deploy Trading (Mock USDC + LeveragedTrading)

After deploying `PredictionTerminal` and setting `NEXT_PUBLIC_PREDICTION_TERMINAL_ADDRESS`:

1. **Deploy MockUSDC**  
   - No constructor args.  
   - Set `NEXT_PUBLIC_MOCK_USDC_ADDRESS` in `.env`.

2. **Deploy LeveragedTrading**  
   - Constructor: `(predictionTerminalAddress, mockUsdcAddress)`.  
   - Set `NEXT_PUBLIC_LEVERAGED_TRADING_ADDRESS` in `.env`.

3. **Configure**  
   - Call `PredictionTerminal.setMockUsdc(mockUsdcAddress)` (owner only) so users can place bets with USDC.  
   - Call `MockUSDC.setMinter(leveragedTradingAddress, true)` (owner only).  
   - Call `PredictionTerminal.setTradingContract(leveragedTradingAddress)` (owner only).

4. **Restart** the Next.js app so it picks up the new env vars.

**Flow:** Users place bets with USDC (buy YES/NO tokens) → those tokens are collateral → 75% buying power is used **only** to open/close leveraged positions (SOL, ETH, BTC). Profit from closing longs is minted as Mock USDC. Ensure users have Mock USDC (e.g. owner mints to test wallets) to place bets.
