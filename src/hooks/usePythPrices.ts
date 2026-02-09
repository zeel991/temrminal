import { useState, useEffect } from "react";
import { type PythPrice } from "@/lib/pyth-prices";

export function usePythPrices() {
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

  return pythPrices;
}