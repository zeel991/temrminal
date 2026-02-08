'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView?: {
      widget: (options: {
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
      }) => void;
    };
  }
}

let tvScriptLoadingPromise: Promise<void> | null = null;

const PYTH_SYMBOLS: Record<string, string> = {
  SOL: 'PYTH:SOLUSD',
  ETH: 'PYTH:ETHUSD',
  BTC: 'PYTH:BTCUSD',
};

type TradingViewWidgetProps = {
  symbolKey?: 'SOL' | 'ETH' | 'BTC';
  className?: string;
  height?: number;
  /** 'light' matches Pyth docs; 'dark' matches terminal */
  theme?: 'light' | 'dark';
};

export default function TradingViewWidget({
  symbolKey = 'BTC',
  className = '',
  height = 400,
  theme = 'dark',
}: TradingViewWidgetProps) {
  const onLoadScriptRef = useRef<(() => void) | null>(null);
  const containerId = `tradingview-${symbolKey}`;

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current?.());

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (!document.getElementById(containerId) || !('TradingView' in window)) return;
      const symbol = PYTH_SYMBOLS[symbolKey] ?? 'PYTH:BTCUSD';
      const isLight = theme === 'light';
      new window.TradingView!.widget({
        autosize: true,
        symbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: isLight ? 'light' : 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: isLight ? '#f1f3f6' : '#0a0a0a',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: containerId,
      });
    }
  }, [symbolKey, containerId, theme]);

  return (
    <div className={`tradingview-widget-container ${className}`.trim()}>
      <div id={containerId} style={{ height: `${height}px` }} />
    </div>
  );
}
