"use client";

import { useEffect, useRef } from "react";

// Define a strict interface for the Widget options to avoid 'any'
interface TradingViewWidgetOptions {
  autosize?: boolean;
  symbol: string;
  interval?: string;
  timezone?: string;
  theme?: string;
  style?: string;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id: string;
}

declare global {
  interface Window {
    TradingView?: {
      // Use a constructor signature instead of 'any'
      widget: new (options: TradingViewWidgetOptions) => unknown;
    };
  }
}

let tvScriptLoadingPromise: Promise<void> | null = null;

const PYTH_SYMBOLS: Record<string, string> = {
  SOL: "PYTH:SOLUSD",
  ETH: "PYTH:ETHUSD",
  BTC: "PYTH:BTCUSD",
};

type TradingViewWidgetProps = {
  symbolKey?: "SOL" | "ETH" | "BTC";
  className?: string;
  height?: number;
  theme?: "light" | "dark";
};

export default function TradingViewWidget({
  symbolKey = "BTC",
  className = "",
  height = 400,
  theme = "dark",
}: TradingViewWidgetProps) {
  const onLoadScriptRef = useRef<(() => void) | null>(null);
  const containerId = `tradingview-${symbolKey}`;

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => {
      if (onLoadScriptRef.current) onLoadScriptRef.current();
    });

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (!document.getElementById(containerId) || !window.TradingView) return;

      const symbol = PYTH_SYMBOLS[symbolKey] ?? "PYTH:BTCUSD";
      const isLight = theme === "light";

      try {
        // Now calling 'new' on a typed constructor
        new window.TradingView.widget({
          autosize: true,
          symbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: isLight ? "light" : "dark",
          style: "1",
          locale: "en",
          toolbar_bg: isLight ? "#f1f3f6" : "#0a0a0a",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerId,
        });
      } catch (err) {
        // Pass 'err' to console to satisfy 'no-unused-vars'
        console.error("Widget init error:", err);
      }
    }
  }, [symbolKey, containerId, theme]);

  return (
    <div className={`tradingview-widget-container ${className}`.trim()}>
      <div id={containerId} style={{ height: `${height}px` }} />
    </div>
  );
}
